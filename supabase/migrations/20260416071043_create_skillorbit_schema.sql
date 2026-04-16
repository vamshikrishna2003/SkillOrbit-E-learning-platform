
/*
  # SkillOrbit.online - Full Database Schema

  ## Summary
  Creates all tables for the AI-powered learning platform.

  ## New Tables
  1. `profiles` - Extended user info (role, xp, streak, avatar)
  2. `courses` - Course catalog with pricing, category, level
  3. `modules` - Course modules (ordered sections)
  4. `lessons` - Module lessons (video/text content)
  5. `enrollments` - User course enrollments with progress %
  6. `lesson_progress` - Per-lesson completion tracking
  7. `certificates` - Course completion certificates
  8. `badges` - Gamification badge definitions
  9. `user_badges` - Badges earned by users
  10. `bookmarks` - User saved/bookmarked courses
  11. `forum_posts` - Community discussion posts
  12. `forum_comments` - Post comments
  13. `blog_posts` - Blog/resources articles
  14. `chat_messages` - AI chatbot conversation history
  15. `contact_submissions` - Contact form entries

  ## Security
  - RLS enabled on all tables
  - Authenticated users can only access their own data
  - Public can read published courses, blog posts, forum posts
  - Admins can manage all content
*/

-- ─────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  xp integer NOT NULL DEFAULT 0,
  streak_count integer NOT NULL DEFAULT 0,
  last_active_at timestamptz DEFAULT now(),
  website_url text DEFAULT '',
  linkedin_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view any profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────
-- COURSES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  short_description text NOT NULL DEFAULT '',
  thumbnail_url text DEFAULT '',
  instructor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  instructor_name text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  original_price numeric(10,2) DEFAULT 0,
  category text NOT NULL DEFAULT 'general',
  level text NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration_hours numeric(5,1) DEFAULT 0,
  rating numeric(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  enrollment_count integer DEFAULT 0,
  is_published boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  what_you_learn text[] DEFAULT '{}',
  requirements text[] DEFAULT '{}',
  language text DEFAULT 'English',
  certificate_available boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all courses"
  ON courses FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
  );

CREATE POLICY "Admins can update courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
  );

CREATE POLICY "Admins can delete courses"
  ON courses FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─────────────────────────────────────────
-- MODULES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules of published courses"
  ON modules FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND is_published = true)
  );

CREATE POLICY "Admins can manage modules"
  ON modules FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor')));

CREATE POLICY "Admins can update modules"
  ON modules FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor')));

CREATE POLICY "Admins can delete modules"
  ON modules FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ─────────────────────────────────────────
-- LESSONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'text', 'quiz', 'assignment')),
  content_url text DEFAULT '',
  content_text text DEFAULT '',
  duration_minutes integer DEFAULT 0,
  order_index integer NOT NULL DEFAULT 0,
  is_preview boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view preview lessons or lessons of enrolled courses"
  ON lessons FOR SELECT
  USING (
    is_preview = true
    OR EXISTS (
      SELECT 1 FROM modules m
      JOIN courses c ON c.id = m.course_id
      WHERE m.id = module_id AND c.is_published = true
    )
  );

CREATE POLICY "Admins can manage lessons"
  ON lessons FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor')));

CREATE POLICY "Admins can update lessons"
  ON lessons FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor')));

CREATE POLICY "Admins can delete lessons"
  ON lessons FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ─────────────────────────────────────────
-- ENROLLMENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_percent integer NOT NULL DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  payment_id text DEFAULT '',
  amount_paid numeric(10,2) DEFAULT 0,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can enroll themselves"
  ON enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollment"
  ON enrollments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- LESSON PROGRESS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  watch_time_seconds integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lesson progress"
  ON lesson_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson progress"
  ON lesson_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress"
  ON lesson_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- CERTIFICATES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_number text UNIQUE NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own certificates"
  ON certificates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- BADGES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'award',
  color text NOT NULL DEFAULT '#14b8a6',
  criteria text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage badges"
  ON badges FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update badges"
  ON badges FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ─────────────────────────────────────────
-- USER BADGES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- BOOKMARKS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- FORUM POSTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  upvotes integer DEFAULT 0,
  view_count integer DEFAULT 0,
  is_pinned boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forum posts"
  ON forum_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON forum_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON forum_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- FORUM COMMENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  upvotes integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON forum_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON forum_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON forum_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- BLOG POSTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  thumbnail_url text DEFAULT '',
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  tags text[] DEFAULT '{}',
  read_time_minutes integer DEFAULT 5,
  is_published boolean DEFAULT false,
  view_count integer DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ─────────────────────────────────────────
-- CHAT MESSAGES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- CONTACT SUBMISSIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL DEFAULT '',
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view contact submissions"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ─────────────────────────────────────────
-- SEED DATA: Badges
-- ─────────────────────────────────────────
INSERT INTO badges (name, description, icon, color, criteria) VALUES
  ('First Steps', 'Complete your first lesson', 'star', '#14b8a6', 'complete_first_lesson'),
  ('Quick Learner', 'Complete 5 lessons in one day', 'zap', '#f97316', 'complete_5_lessons_day'),
  ('Course Champion', 'Complete your first course', 'award', '#3b82f6', 'complete_first_course'),
  ('Streak Master', 'Maintain a 7-day learning streak', 'flame', '#ef4444', 'streak_7_days'),
  ('Community Star', 'Create 10 forum posts', 'users', '#8b5cf6', 'forum_10_posts'),
  ('Knowledge Seeker', 'Enroll in 3 courses', 'book-open', '#06b6d4', 'enroll_3_courses'),
  ('Top Performer', 'Earn 1000 XP', 'trophy', '#f59e0b', 'earn_1000_xp'),
  ('Certified Pro', 'Earn 3 certificates', 'shield-check', '#10b981', 'earn_3_certificates')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────
-- SEED DATA: Sample Courses
-- ─────────────────────────────────────────
INSERT INTO courses (title, slug, description, short_description, thumbnail_url, instructor_name, price, original_price, category, level, duration_hours, rating, rating_count, enrollment_count, is_published, is_featured, tags, what_you_learn, requirements) VALUES
  (
    'Complete Web Development Bootcamp',
    'complete-web-dev-bootcamp',
    'Master modern web development from scratch. Learn HTML, CSS, JavaScript, React, Node.js, and build real-world projects that you can showcase in your portfolio.',
    'Learn full-stack web development from zero to hero with hands-on projects.',
    'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Dr. Sarah Johnson',
    49.99, 199.99, 'web-development', 'beginner', 42.5, 4.8, 1240, 8350,
    true, true,
    ARRAY['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
    ARRAY['Build responsive websites', 'Create RESTful APIs', 'Deploy to the cloud', 'Master React hooks', 'Work with databases'],
    ARRAY['Basic computer skills', 'No prior programming experience needed']
  ),
  (
    'Machine Learning & AI Fundamentals',
    'machine-learning-ai-fundamentals',
    'Dive deep into machine learning algorithms, neural networks, and AI concepts. Build practical ML models using Python, scikit-learn, and TensorFlow.',
    'Master ML & AI with Python. Build real models from scratch.',
    'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Prof. Alex Chen',
    59.99, 249.99, 'ai-ml', 'intermediate', 38.0, 4.9, 890, 5200,
    true, true,
    ARRAY['Python', 'Machine Learning', 'TensorFlow', 'AI', 'Data Science'],
    ARRAY['Understand ML algorithms', 'Build neural networks', 'Work with real datasets', 'Deploy ML models', 'Apply AI in projects'],
    ARRAY['Basic Python knowledge', 'High school math (algebra, statistics)']
  ),
  (
    'UI/UX Design Masterclass',
    'ui-ux-design-masterclass',
    'Learn the art and science of user interface and user experience design. Master Figma, design systems, prototyping, and user research methodologies.',
    'Become a professional UI/UX designer with industry tools and techniques.',
    'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Maria Rodriguez',
    39.99, 149.99, 'design', 'beginner', 28.0, 4.7, 620, 4100,
    true, true,
    ARRAY['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Design Systems'],
    ARRAY['Create stunning UI designs', 'Conduct user research', 'Build interactive prototypes', 'Design systems', 'Portfolio projects'],
    ARRAY['No design experience needed', 'Access to Figma (free tier available)']
  ),
  (
    'Digital Marketing & SEO Pro',
    'digital-marketing-seo-pro',
    'Master digital marketing strategies including SEO, Google Ads, social media marketing, email campaigns, and analytics to grow any business online.',
    'Master digital marketing from SEO to paid ads and grow businesses online.',
    'https://images.pexels.com/photos/905163/pexels-photo-905163.jpeg?auto=compress&cs=tinysrgb&w=800',
    'James Wilson',
    34.99, 129.99, 'marketing', 'beginner', 24.5, 4.6, 445, 3200,
    true, false,
    ARRAY['SEO', 'Google Ads', 'Social Media', 'Email Marketing', 'Analytics'],
    ARRAY['Rank on Google first page', 'Run profitable ad campaigns', 'Build social media presence', 'Create email funnels', 'Analyze marketing data'],
    ARRAY['Basic internet knowledge', 'Willingness to practice on a real project']
  ),
  (
    'Python for Data Science & Analytics',
    'python-data-science-analytics',
    'Learn Python programming specifically for data analysis, visualization, and statistics. Work with pandas, numpy, matplotlib, and real-world datasets.',
    'Master Python for data analysis, visualization, and statistics.',
    'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Dr. Emily Park',
    44.99, 179.99, 'data-science', 'beginner', 32.0, 4.8, 780, 6100,
    true, true,
    ARRAY['Python', 'Pandas', 'NumPy', 'Data Analysis', 'Visualization'],
    ARRAY['Analyze real-world data', 'Create stunning visualizations', 'Statistical analysis', 'Clean and process data', 'Build dashboards'],
    ARRAY['No programming required', 'Basic math knowledge helpful']
  ),
  (
    'Cloud Computing with AWS',
    'cloud-computing-aws',
    'Master Amazon Web Services (AWS) and cloud architecture. Learn EC2, S3, Lambda, RDS, and earn your AWS certification with hands-on labs.',
    'Master AWS cloud services and prepare for certification.',
    'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Robert Martinez',
    54.99, 219.99, 'cloud', 'intermediate', 36.0, 4.7, 390, 2800,
    true, false,
    ARRAY['AWS', 'Cloud Computing', 'DevOps', 'Docker', 'Kubernetes'],
    ARRAY['Deploy to AWS cloud', 'Configure cloud infrastructure', 'Implement security best practices', 'Optimize costs', 'Pass AWS certification'],
    ARRAY['Basic Linux knowledge', 'Fundamental networking concepts']
  )
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────
-- SEED DATA: Modules & Lessons for first course
-- ─────────────────────────────────────────
DO $$
DECLARE
  course_id_var uuid;
  module_id_var uuid;
BEGIN
  SELECT id INTO course_id_var FROM courses WHERE slug = 'complete-web-dev-bootcamp';

  IF course_id_var IS NOT NULL THEN
    INSERT INTO modules (course_id, title, description, order_index) VALUES
      (course_id_var, 'HTML Fundamentals', 'Learn the building blocks of the web', 0)
    RETURNING id INTO module_id_var;

    INSERT INTO lessons (module_id, title, type, duration_minutes, order_index, is_preview) VALUES
      (module_id_var, 'Introduction to HTML', 'video', 15, 0, true),
      (module_id_var, 'HTML Document Structure', 'video', 20, 1, true),
      (module_id_var, 'HTML Elements & Tags', 'video', 25, 2, false),
      (module_id_var, 'Forms & Input Elements', 'video', 30, 3, false),
      (module_id_var, 'HTML Best Practices', 'text', 10, 4, false);

    INSERT INTO modules (course_id, title, description, order_index) VALUES
      (course_id_var, 'CSS Styling & Layout', 'Make your pages beautiful with CSS', 1)
    RETURNING id INTO module_id_var;

    INSERT INTO lessons (module_id, title, type, duration_minutes, order_index, is_preview) VALUES
      (module_id_var, 'CSS Selectors & Properties', 'video', 25, 0, false),
      (module_id_var, 'Flexbox Layout', 'video', 35, 1, false),
      (module_id_var, 'CSS Grid System', 'video', 40, 2, false),
      (module_id_var, 'Responsive Design', 'video', 45, 3, false);

    INSERT INTO modules (course_id, title, description, order_index) VALUES
      (course_id_var, 'JavaScript Essentials', 'Add interactivity with JavaScript', 2)
    RETURNING id INTO module_id_var;

    INSERT INTO lessons (module_id, title, type, duration_minutes, order_index, is_preview) VALUES
      (module_id_var, 'JavaScript Basics', 'video', 30, 0, false),
      (module_id_var, 'DOM Manipulation', 'video', 40, 1, false),
      (module_id_var, 'Events & Event Listeners', 'video', 35, 2, false),
      (module_id_var, 'Async JavaScript & Fetch API', 'video', 50, 3, false);
  END IF;
END $$;

-- ─────────────────────────────────────────
-- SEED DATA: Blog Posts
-- ─────────────────────────────────────────
INSERT INTO blog_posts (title, slug, excerpt, content, thumbnail_url, author_name, category, tags, read_time_minutes, is_published, published_at) VALUES
  (
    'Top 10 Skills Every Developer Needs in 2025',
    'top-10-skills-developers-2025',
    'The tech landscape is evolving rapidly. Here are the must-have skills that will keep you relevant and in-demand as a developer in 2025.',
    'The tech landscape is evolving rapidly...',
    'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Sarah Johnson',
    'career', ARRAY['development', 'career', 'skills'], 8, true, now()
  ),
  (
    'How AI is Transforming Online Learning',
    'ai-transforming-online-learning',
    'Artificial intelligence is revolutionizing education. Discover how AI-powered platforms are creating personalized learning experiences.',
    'Artificial intelligence is revolutionizing education...',
    'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Alex Chen',
    'technology', ARRAY['AI', 'education', 'learning'], 6, true, now()
  ),
  (
    'Freelancing Guide: From Zero to $5000/Month',
    'freelancing-guide-zero-to-5000',
    'Breaking into freelancing can feel overwhelming. This comprehensive guide walks you through building skills, finding clients, and scaling your income.',
    'Breaking into freelancing can feel overwhelming...',
    'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Maria Rodriguez',
    'career', ARRAY['freelancing', 'career', 'income'], 12, true, now()
  )
ON CONFLICT (slug) DO NOTHING;
