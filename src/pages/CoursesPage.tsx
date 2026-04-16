import { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/courses/CourseCard';
import type { Course, Page } from '../types';

interface CoursesPageProps {
  navigate: (page: Page, params?: Record<string, string>) => void;
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'ai-ml', label: 'AI & Machine Learning' },
  { value: 'design', label: 'UI/UX Design' },
  { value: 'marketing', label: 'Digital Marketing' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'cloud', label: 'Cloud Computing' },
];

const levels = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

export default function CoursesPage({ navigate }: CoursesPageProps) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [sort, setSort] = useState('popular');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [category, level, sort]);

  useEffect(() => {
    if (user) fetchBookmarks();
  }, [user]);

  const fetchCourses = async () => {
    setLoading(true);
    let query = supabase.from('courses').select('*').eq('is_published', true);
    if (category) query = query.eq('category', category);
    if (level) query = query.eq('level', level);
    if (sort === 'popular') query = query.order('enrollment_count', { ascending: false });
    else if (sort === 'rating') query = query.order('rating', { ascending: false });
    else if (sort === 'newest') query = query.order('created_at', { ascending: false });
    else if (sort === 'price-low') query = query.order('price', { ascending: true });
    else if (sort === 'price-high') query = query.order('price', { ascending: false });

    const { data } = await query;
    if (data) setCourses(data as Course[]);
    setLoading(false);
  };

  const fetchBookmarks = async () => {
    const { data } = await supabase.from('bookmarks').select('course_id').eq('user_id', user!.id);
    if (data) setBookmarks(new Set(data.map(b => b.course_id)));
  };

  const toggleBookmark = async (courseId: string) => {
    if (!user) { navigate('auth'); return; }
    if (bookmarks.has(courseId)) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('course_id', courseId);
      setBookmarks(prev => { const n = new Set(prev); n.delete(courseId); return n; });
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, course_id: courseId });
      setBookmarks(prev => new Set([...prev, courseId]));
    }
  };

  const filtered = courses.filter(c =>
    !search ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.short_description.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black text-white mb-2">Explore Courses</h1>
          <p className="text-slate-400 mb-8">Discover {courses.length}+ expert-led courses to advance your career</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search courses, skills, topics..."
                className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: category, setter: setCategory, options: categories, label: 'Category' },
                { value: level, setter: setLevel, options: levels, label: 'Level' },
                { value: sort, setter: setSort, options: sortOptions, label: 'Sort by' },
              ].map(filter => (
                <div key={filter.label} className="relative">
                  <select
                    value={filter.value}
                    onChange={e => filter.setter(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white appearance-none focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    {filter.options.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {loading ? 'Loading...' : `${filtered.length} courses found`}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {category && (
              <span className="flex items-center gap-1 px-3 py-1 bg-teal-500/10 text-teal-500 rounded-full text-xs">
                {categories.find(c => c.value === category)?.label}
                <button onClick={() => setCategory('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {level && (
              <span className="flex items-center gap-1 px-3 py-1 bg-teal-500/10 text-teal-500 rounded-full text-xs capitalize">
                {level}
                <button onClick={() => setLevel('')}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-slate-200 dark:bg-slate-700" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No courses found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onView={(slug) => navigate('course-detail', { slug })}
                isBookmarked={bookmarks.has(course.id)}
                onBookmark={toggleBookmark}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
