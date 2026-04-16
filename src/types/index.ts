export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  role: 'student' | 'instructor' | 'admin';
  xp: number;
  streak_count: number;
  last_active_at: string;
  website_url: string;
  linkedin_url: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  thumbnail_url: string;
  instructor_id: string | null;
  instructor_name: string;
  price: number;
  original_price: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  rating: number;
  rating_count: number;
  enrollment_count: number;
  is_published: boolean;
  is_featured: boolean;
  tags: string[];
  what_you_learn: string[];
  requirements: string[];
  language: string;
  certificate_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  lessons?: Lesson[];
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  content_url: string;
  content_text: string;
  duration_minutes: number;
  order_index: number;
  is_preview: boolean;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress_percent: number;
  is_completed: boolean;
  completed_at: string | null;
  amount_paid: number;
  enrolled_at: string;
  course?: Course;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  course?: Course;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: string;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface Bookmark {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
  course?: Course;
}

export interface ForumPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  view_count: number;
  is_pinned: boolean;
  created_at: string;
  profile?: Profile;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail_url: string;
  author_name: string;
  category: string;
  tags: string[];
  read_time_minutes: number;
  is_published: boolean;
  view_count: number;
  published_at: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export type Page =
  | 'home'
  | 'courses'
  | 'course-detail'
  | 'about'
  | 'contact'
  | 'dashboard'
  | 'auth'
  | 'admin'
  | 'blog';
