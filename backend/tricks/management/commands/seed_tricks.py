import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from tricks.models import Phase, Tag, Trick, Video

DATA_FILE = Path(__file__).resolve().parent.parent.parent.parent / "data" / "tricks.json"


class Command(BaseCommand):
    help = "Seed the database from data/tricks.json. Safe to run in production."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing trick data before seeding.",
        )
        parser.add_argument(
            "--file",
            type=str,
            default=str(DATA_FILE),
            help="Path to the tricks JSON file.",
        )

    def handle(self, *args, **options):
        file_path = Path(options["file"])
        if not file_path.exists():
            self.stderr.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        with open(file_path) as f:
            data = json.load(f)

        if options["clear"]:
            Video.objects.all().delete()
            Trick.objects.all().delete()
            Phase.objects.all().delete()
            Tag.objects.all().delete()
            self.stdout.write(self.style.WARNING("Cleared all existing trick data."))

        # Create phases
        phase_map = {}
        for p in data["phases"]:
            phase, created = Phase.objects.update_or_create(
                name=p["name"],
                defaults={"order": p["order"], "description": p["description"]},
            )
            phase_map[p["name"]] = phase
            self.stdout.write(f"  Phase: {phase.name} ({'created' if created else 'updated'})")

        # Create tags
        tag_map = {}
        all_tags = set()
        for trick in data["tricks"]:
            all_tags.update(trick.get("tags", []))
        for tag_name in sorted(all_tags):
            tag, _ = Tag.objects.get_or_create(
                name=tag_name,
                defaults={"slug": slugify(tag_name)},
            )
            tag_map[tag_name] = tag

        # Create tricks (first pass — no prerequisites yet)
        trick_map = {}
        for t in data["tricks"]:
            slug = slugify(t["name"])
            trick, created = Trick.objects.update_or_create(
                slug=slug,
                defaults={
                    "name": t["name"],
                    "description": t["description"],
                    "difficulty": t["difficulty"],
                    "pro_tip": t.get("pro_tip", ""),
                    "demo_gif_url": t.get("demo_gif_url", ""),
                    "phase": phase_map[t["phase"]],
                },
            )
            trick_map[t["name"]] = trick

            # Set tags
            trick.tags.set([tag_map[tag] for tag in t.get("tags", []) if tag in tag_map])

            # Upsert videos
            if created:
                for i, v in enumerate(t.get("videos", [])):
                    Video.objects.create(
                        trick=trick,
                        youtube_url=v["url"],
                        title=v["title"],
                        channel_name=v["channel"],
                        duration_seconds=v["duration"],
                        timestamp_seconds=v.get("timestamp"),
                        order=i,
                    )
            else:
                # Update existing videos only if trick had none
                if trick.videos.count() == 0:
                    for i, v in enumerate(t.get("videos", [])):
                        Video.objects.create(
                            trick=trick,
                            youtube_url=v["url"],
                            title=v["title"],
                            channel_name=v["channel"],
                            duration_seconds=v["duration"],
                            timestamp_seconds=v.get("timestamp"),
                            order=i,
                        )

            status = "created" if created else "updated"
            self.stdout.write(f"  Trick: {trick.name} (Lvl {trick.difficulty}) [{status}]")

        # Set prerequisites (second pass)
        for t in data["tricks"]:
            trick = trick_map[t["name"]]
            prereq_tricks = [
                trick_map[name]
                for name in t.get("prerequisites", [])
                if name in trick_map
            ]
            trick.prerequisites.set(prereq_tricks)

        total_tricks = len(trick_map)
        total_videos = sum(len(t.get("videos", [])) for t in data["tricks"])
        total_phases = len(phase_map)

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSeeded {total_tricks} tricks with {total_videos} videos across {total_phases} phases."
            )
        )
