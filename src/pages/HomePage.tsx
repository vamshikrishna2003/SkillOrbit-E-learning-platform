import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, BookOpen, Users, Award, TrendingUp, Play, ChevronRight, Star, Zap, Target, Brain, Code, Palette, BarChart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CourseCard from '../components/courses/CourseCard';
import type { Course, BlogPost, Page } from '../types';

interface HomePageProps {
  navigate: (page: Page, params?: Record<string, string>) => void;
}

const stats = [
  { icon: Users, label: 'Active Learners', value: '50K+', color: 'text-teal-500' },
  { icon: BookOpen, label: 'Expert Courses', value: '200+', color: 'text-cyan-500' },
  { icon: Award, label: 'Certificates Issued', value: '30K+', color: 'text-blue-500' },
  { icon: TrendingUp, label: 'Completion Rate', value: '94%', color: 'text-emerald-500' },
];

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Mentor',
    description: 'Get personalized guidance from your AI mentor that adapts to your learning style and goals.',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    icon: Target,
    title: 'Career Path Planning',
    description: 'AI-driven career guidance with custom roadmaps based on your skills and aspirations.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Zap,
    title: 'Gamified Learning',
    description: 'Earn XP, badges, and maintain streaks to stay motivated throughout your journey.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Award,
    title: 'Industry Certificates',
    description: 'Earn verifiable certificates recognized by top employers worldwide.',
    color: 'from-emerald-500 to-teal-500',
  },
];

const categories = [
  { icon: Code, label: 'Web Development', count: 45, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { icon: Brain, label: 'AI & Machine Learning', count: 32, color: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
  { icon: Palette, label: 'UI/UX Design', count: 28, color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
  { icon: BarChart, label: 'Data Science', count: 41, color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Frontend Developer at Google',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100',
    text: 'SkillOrbit completely transformed my career. The AI mentor helped me identify exactly what skills I needed to land my dream job at Google.',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'ML Engineer at OpenAI',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    text: 'The personalized learning paths are incredible. I went from knowing nothing about ML to getting hired at OpenAI in just 8 months.',
    rating: 5,
  },
  {
    name: 'Aisha Patel',
    role: 'Freelance Designer',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
    text: 'The certificate I earned on SkillOrbit opened so many doors for me as a freelancer. Clients trust the platform quality.',
    rating: 5,
  },
];

export default function HomePage({ navigate }: HomePageProps) {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    supabase.from('courses').select('*').eq('is_featured', true).limit(3).then(({ data }) => {
      if (data) setFeaturedCourses(data as Course[]);
    });
    supabase.from('blog_posts').select('*').eq('is_published', true).limit(3).then(({ data }) => {
      if (data) setBlogPosts(data as BlogPost[]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-sm font-medium mb-8 animate-fadeIn">
            <Sparkles className="w-4 h-4" />
            AI-Powered Learning Platform
            <ChevronRight className="w-4 h-4" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            Launch Your Career
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400">
              with AI Guidance
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Master in-demand skills with personalized AI mentorship, real-world projects, and career-ready certificates trusted by top employers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('courses')}
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-teal-500/30 hover:scale-105 transition-all duration-300"
            >
              Explore Courses
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('about')}
              className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <div className={`text-3xl font-black ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-teal-500 font-semibold text-sm uppercase tracking-wider">Why SkillOrbit</span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mt-2 mb-4">Learn Smarter, Not Harder</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Our AI-driven platform adapts to you — delivering personalized learning experiences that get you job-ready faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(feature => (
              <div key={feature.title} className="group p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-teal-500 font-semibold text-sm uppercase tracking-wider">Categories</span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mt-2 mb-4">Browse by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(cat => (
              <button
                key={cat.label}
                onClick={() => navigate('courses')}
                className={`group p-6 rounded-2xl border text-left hover:scale-105 transition-all ${cat.color}`}
              >
                <cat.icon className="w-8 h-8 mb-3" />
                <div className="font-semibold text-sm mb-1">{cat.label}</div>
                <div className="text-xs opacity-70">{cat.count} courses</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {featuredCourses.length > 0 && (
        <section className="py-24 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-teal-500 font-semibold text-sm uppercase tracking-wider">Featured</span>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mt-2">Top Courses</h2>
              </div>
              <button onClick={() => navigate('courses')} className="flex items-center gap-2 text-teal-500 font-medium hover:gap-3 transition-all">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onView={(slug) => navigate('course-detail', { slug })}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-teal-500 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mt-2 mb-4">Success Stories</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-white">{t.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {blogPosts.length > 0 && (
        <section className="py-24 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-teal-500 font-semibold text-sm uppercase tracking-wider">Blog</span>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mt-2">Latest Resources</h2>
              </div>
              <button onClick={() => navigate('blog')} className="flex items-center gap-2 text-teal-500 font-medium hover:gap-3 transition-all">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map(post => (
                <article key={post.id} className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
                  <img src={post.thumbnail_url} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="p-5">
                    <span className="text-xs text-teal-500 font-medium uppercase">{post.category}</span>
                    <h3 className="font-bold text-slate-900 dark:text-white mt-2 mb-2 line-clamp-2 group-hover:text-teal-500 transition-colors">{post.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
                      <span>{post.author_name}</span>
                      <span>{post.read_time_minutes} min read</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-24 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Ready to Launch Your Career?
          </h2>
          <p className="text-xl text-teal-100 mb-10">
            Join 50,000+ learners who are building in-demand skills with AI guidance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('auth')}
              className="px-10 py-4 bg-white text-teal-600 font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Start for Free Today
            </button>
            <button
              onClick={() => navigate('courses')}
              className="px-10 py-4 bg-white/20 backdrop-blur text-white font-bold rounded-2xl border border-white/30 hover:bg-white/30 transition-all"
            >
              Browse Courses
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
