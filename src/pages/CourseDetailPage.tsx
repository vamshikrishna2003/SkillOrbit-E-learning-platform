import { useState, useEffect } from 'react';
import { Clock, Users, Star, Award, ChevronDown, ChevronUp, Play, FileText, CheckCircle2, ArrowLeft, Globe, BookOpen, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Course, Module, Page } from '../types';

interface CourseDetailPageProps {
  slug: string;
  navigate: (page: Page, params?: Record<string, string>) => void;
}

const levelColors: Record<string, string> = {
  beginner: 'text-emerald-500 bg-emerald-500/10',
  intermediate: 'text-amber-500 bg-amber-500/10',
  advanced: 'text-red-500 bg-red-500/10',
};

export default function CourseDetailPage({ slug, navigate }: CourseDetailPageProps) {
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews'>('overview');

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  useEffect(() => {
    if (user && course) checkEnrollment();
  }, [user, course]);

  const fetchCourse = async () => {
    const { data: courseData } = await supabase.from('courses').select('*').eq('slug', slug).maybeSingle();
    if (courseData) {
      setCourse(courseData as Course);
      const { data: modulesData } = await supabase
        .from('modules')
        .select('*, lessons(*)')
        .eq('course_id', courseData.id)
        .order('order_index');
      if (modulesData) {
        setModules(modulesData as Module[]);
        if (modulesData.length > 0) setExpandedModules(new Set([modulesData[0].id]));
      }
    }
    setLoading(false);
  };

  const checkEnrollment = async () => {
    const { data } = await supabase.from('enrollments').select('id').eq('user_id', user!.id).eq('course_id', course!.id).maybeSingle();
    setIsEnrolled(!!data);
  };

  const handleEnroll = async () => {
    if (!user) { navigate('auth'); return; }
    setEnrolling(true);
    await supabase.from('enrollments').insert({ user_id: user.id, course_id: course!.id, amount_paid: course!.price });
    setIsEnrolled(true);
    setEnrolling(false);
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const n = new Set(prev);
      n.has(moduleId) ? n.delete(moduleId) : n.add(moduleId);
      return n;
    });
  };

  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!course) return (
    <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Course not found</h2>
      <button onClick={() => navigate('courses')} className="text-teal-500 hover:underline">Back to Courses</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('courses')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${levelColors[course.level]}`}>{course.level}</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400 capitalize">{course.category.replace('-', ' ')}</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-white mb-4 leading-tight">{course.title}</h1>
              <p className="text-slate-300 text-lg mb-6">{course.short_description}</p>
              <div className="flex flex-wrap items-center gap-5 text-sm">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{course.rating}</span>
                  <span className="text-slate-400">({course.rating_count.toLocaleString()} ratings)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Users className="w-4 h-4" />
                  {course.enrollment_count.toLocaleString()} students
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-4 h-4" />
                  {course.duration_hours} hours
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Globe className="w-4 h-4" />
                  {course.language}
                </div>
              </div>
              <p className="text-slate-400 mt-3 text-sm">Instructor: <span className="text-white font-medium">{course.instructor_name}</span></p>
            </div>

            <div className="lg:sticky lg:top-24 self-start">
              <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
                <img src={course.thumbnail_url} alt={course.title} className="w-full aspect-video object-cover" />
                <div className="p-6">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      {course.price === 0 ? 'Free' : `$${course.price}`}
                    </span>
                    {course.original_price > course.price && (
                      <span className="text-slate-400 line-through">${course.original_price}</span>
                    )}
                    {course.original_price > course.price && (
                      <span className="text-emerald-500 text-sm font-medium">
                        {Math.round(((course.original_price - course.price) / course.original_price) * 100)}% off
                      </span>
                    )}
                  </div>

                  {isEnrolled ? (
                    <button
                      onClick={() => navigate('dashboard')}
                      className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all"
                    >
                      Continue Learning
                    </button>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-70"
                    >
                      {enrolling ? 'Enrolling...' : course.price === 0 ? 'Enroll for Free' : `Enroll — $${course.price}`}
                    </button>
                  )}

                  <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    {[
                      { icon: BookOpen, text: `${totalLessons} lessons` },
                      { icon: Clock, text: `${course.duration_hours} hours of content` },
                      { icon: Globe, text: 'Full lifetime access' },
                      ...(course.certificate_available ? [{ icon: Award, text: 'Certificate of completion' }] : []),
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-teal-500" />
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:w-2/3">
          <div className="flex border-b border-slate-200 dark:border-slate-700 mb-8">
            {(['overview', 'curriculum', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'text-teal-500 border-teal-500'
                    : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-8">
              {course.what_you_learn.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">What You'll Learn</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {course.what_you_learn.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {course.requirements.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {course.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="text-teal-500 mt-1">•</span> {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">About This Course</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{course.description}</p>
              </div>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {modules.length} sections • {totalLessons} lessons
                </p>
              </div>
              <div className="space-y-3">
                {modules.map((module) => (
                  <div key={module.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors text-left"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">{module.title}</span>
                        <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                          {module.lessons?.length ?? 0} lessons
                        </span>
                      </div>
                      {expandedModules.has(module.id) ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>

                    {expandedModules.has(module.id) && module.lessons && (
                      <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {[...module.lessons].sort((a, b) => a.order_index - b.order_index).map(lesson => (
                          <div key={lesson.id} className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-800/50">
                            {lesson.is_preview || isEnrolled
                              ? (lesson.type === 'video' ? <Play className="w-4 h-4 text-teal-500" /> : <FileText className="w-4 h-4 text-blue-500" />)
                              : <Lock className="w-4 h-4 text-slate-400" />}
                            <span className={`text-sm flex-1 ${lesson.is_preview || isEnrolled ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                              {lesson.title}
                              {lesson.is_preview && <span className="ml-2 text-xs text-teal-500">Preview</span>}
                            </span>
                            {lesson.duration_minutes > 0 && (
                              <span className="text-xs text-slate-400">{lesson.duration_minutes}m</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-12">
              <div className="text-5xl font-black text-slate-900 dark:text-white mb-2">{course.rating}</div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(course.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                ))}
              </div>
              <p className="text-slate-500 dark:text-slate-400">{course.rating_count.toLocaleString()} ratings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
