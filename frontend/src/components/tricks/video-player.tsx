/* eslint-disable @next/next/no-img-element */
import type { Video } from "@/lib/types";

function getEmbedUrl(video: Video): string {
  const url = new URL(video.youtube_url);
  let videoId = url.searchParams.get("v");
  if (!videoId && url.hostname === "youtu.be") {
    videoId = url.pathname.slice(1);
  }
  if (!videoId) return video.youtube_url;

  let embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
  if (video.timestamp_seconds) {
    embedUrl += `?start=${video.timestamp_seconds}`;
  }
  return embedUrl;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoEmbed({ video }: { video: Video }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-700/50 bg-[#0a0f1e]">
      <div className="relative aspect-video">
        <iframe
          src={getEmbedUrl(video)}
          title={video.title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-white">{video.title}</p>
        <p className="mt-0.5 text-xs text-gray-500">
          {video.channel_name}
          {video.duration_seconds > 0 && ` \u2022 ${formatDuration(video.duration_seconds)}`}
          {video.timestamp_seconds
            ? ` \u2022 Jump to ${formatDuration(video.timestamp_seconds)}`
            : ""}
        </p>
      </div>
    </div>
  );
}

export function VideoListItem({ video }: { video: Video }) {
  return (
    <a
      href={video.youtube_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-gray-800 bg-[#111827] p-3 transition-colors hover:border-gray-700"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-4 w-5 shrink-0 items-center justify-center rounded-sm bg-red-600 text-[8px] font-bold text-white">
          &#9654;
        </span>
        <span className="text-[11px] font-semibold text-white">
          {video.title}
        </span>
      </div>
      <p className="ml-7 mt-0.5 text-[9px] text-gray-600">
        {video.channel_name}
        {video.duration_seconds > 0 && ` \u2022 ${formatDuration(video.duration_seconds)}`}
      </p>
      {video.timestamp_seconds && (
        <p className="ml-7 text-[9px] text-[var(--color-accent-400)]">
          &#9654; Jump to {formatDuration(video.timestamp_seconds)}
        </p>
      )}
    </a>
  );
}

export function DemoGif({ url, trickName }: { url: string; trickName: string }) {
  const isProWhooper = url.includes("prowhooper.com");
  const proWhooperUrl = "https://prowhooper.com/tricktionary/";

  const image = (
    <img
      src={url}
      alt={`${trickName} demo`}
      className="absolute inset-0 h-full w-full object-contain"
      loading="lazy"
    />
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-700/50 bg-[#0a0f1e]">
      <div className="relative aspect-video">
        {isProWhooper ? (
          <a
            href={proWhooperUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${trickName} on Pro Whooper Tricktionary`}
            className="absolute inset-0 block"
          >
            {image}
          </a>
        ) : (
          image
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-white">{trickName} — Demo</p>
        <p className="mt-0.5 text-xs text-gray-500">
          Source:{" "}
          {isProWhooper ? (
            <a
              href={proWhooperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent-400)] underline-offset-2 hover:underline"
            >
              Pro Whooper Tricktionary
            </a>
          ) : (
            "Pro Whooper Tricktionary"
          )}
        </p>
      </div>
    </div>
  );
}
