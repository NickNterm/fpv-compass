export interface Phase {
  id: number;
  name: string;
  order: number;
  description: string;
  tricks: TrickInPhase[];
}

export interface TrickInPhase {
  id: number;
  name: string;
  slug: string;
  description: string;
  difficulty: number;
  prerequisite_ids: number[];
  video_count: number;
  favorite_count: number;
  demo_gif_url: string;
  is_community: boolean;
}

export interface TrickListItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  difficulty: number;
  phase_id: number;
  phase_name: string;
  prerequisite_ids: number[];
  tags: Tag[];
  video_count: number;
  favorite_count: number;
  demo_gif_url: string;
  is_community: boolean;
}

export interface TrickDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  difficulty: number;
  pro_tip: string;
  phase_id: number;
  phase_name: string;
  videos: Video[];
  prerequisites: TrickPrerequisite[];
  tags: Tag[];
  favorite_count: number;
  demo_gif_url: string;
  is_community: boolean;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrickPrerequisite {
  id: number;
  name: string;
  slug: string;
  difficulty: number;
}

export interface Video {
  id: number;
  youtube_url: string;
  title: string;
  channel_name: string;
  duration_seconds: number;
  timestamp_seconds: number | null;
  order: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface User {
  id: number;
  email: string;
  display_name: string;
}

export interface UserProgress {
  id: number;
  trick_slug: string;
  trick_name: string;
  learned_at: string;
}

export interface Favorite {
  id: number;
  trick_slug: string;
  trick_name: string;
  created_at: string;
}

export interface Comment {
  id: number;
  author: string;
  body: string;
  parent: number | null;
  score: number;
  user_vote: number | null;
  replies: Comment[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Idea {
  id: number;
  title: string;
  body: string;
  category: string;
  status: string;
  author: string;
  vote_count: number;
  user_vote: number | null;
  comment_count: number;
  created_at: string;
}

export interface IdeaDetail extends Idea {
  comments: IdeaComment[];
  updated_at: string;
}

export interface IdeaComment {
  id: number;
  author: string;
  body: string;
  created_at: string;
}
