import { useState, useEffect } from 'react';
import { Users, BookOpen, Award, TrendingUp, Eye, Pencil, Trash2, Plus, AlertTriangle, CheckCircle2, X, BarChart3, MessageSquare, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Course, Profile, Page } from '../types';

interface AdminDashboardPageProps {
  navigate: (page: Page) => void;
}

type AdminTab = 'overview' | 'users' | 'courses' | 'contact';

export default function AdminDashboardPage({ navigate }: AdminDashboardPageProps) {
  const { profile } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, courses: 0, enrollments: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== 'admin') { navigate('home'); return; }
    fetchAll();
  }, [profile]);

  const fetchAll = async () => {
    const [userRes, courseRes, enrollRes, contactRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('courses').select('*').order('created_at', { ascending: false }),
      supabase.from('enrollments').select('amount_paid'),
      supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
    ]);

    if (userRes.data) setUsers(userRes.data as Profile[]);
    if (courseRes.data) setCourses(courseRes.data as Course[]);
    if (contactRes.data) setContacts(contactRes.data);

    const revenue = enrollRes.data?.reduce((s, e) => s + (e.amount_paid || 0), 0) || 0;
    setStats({
      users: userRes.data?.length || 0,
      courses: courseRes.data?.length || 0,
      enrollments: enrollRes.data?.length || 0,
      revenue,
    });
    setLoading(false);
  };

  const togglePublish = async (courseId: string, current: boolean) => {
    await supabase.from('courses').update({ is_published: !current }).eq('id', courseId);
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, is_published: !current } : c));
  };

  const markContactRead = async (id: string) => {
    await supabase.from('contact_submissions').update({ is_read: true }).eq('id', id);
    setContacts(prev => prev.map(c => c.id === id ? { ...c, is_read: true } : c));
  };

  const tabs: { key: AdminTab; label: string; icon: typeof Users }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'courses', label: 'Courses', icon: BookOpen },
    { key: 'contact', label: 'Messages', icon: Mail },
  ];

  const unreadCount = contacts.filter(c => !c.is_read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-white mb-1">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">Manage SkillOrbit platform</p>
          <div className="flex gap-1 mt-6 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  tab === t.key ? 'text-teal-400 border-teal-400' : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
                {t.key === 'contact' && unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Users, label: 'Total Users', value: stats.users.toLocaleString(), color: 'text-teal-500', bg: 'bg-teal-500/10' },
                    { icon: BookOpen, label: 'Total Courses', value: stats.courses, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { icon: Award, label: 'Enrollments', value: stats.enrollments.toLocaleString(), color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { icon: TrendingUp, label: 'Total Revenue', value: `$${stats.revenue.toFixed(0)}`, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                      <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                      <div className="text-sm text-slate-500">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                  <h2 className="font-bold text-slate-900 dark:text-white mb-4">Recent Courses</h2>
                  <div className="space-y-3">
                    {courses.slice(0, 5).map(course => (
                      <div key={course.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                        <div className="flex items-center gap-3">
                          <img src={course.thumbnail_url} alt="" className="w-10 h-7 object-cover rounded" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-xs">{course.title}</p>
                            <p className="text-xs text-slate-500">{course.enrollment_count} enrollments • ${course.price}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${course.is_published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                          {course.is_published ? 'Live' : 'Draft'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">All Users ({users.length})</h2>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                          {['User', 'Role', 'XP', 'Streak', 'Joined'].map(h => (
                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {users.map(user => (
                          <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                  {user.full_name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user.full_name || 'No name'}</p>
                                  <p className="text-xs text-slate-400">{user.id.slice(0, 8)}...</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                user.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                                user.role === 'instructor' ? 'bg-blue-500/10 text-blue-500' :
                                'bg-slate-500/10 text-slate-500'
                              }`}>{user.role}</span>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-teal-500 font-medium">{user.xp}</td>
                            <td className="px-5 py-3.5 text-sm text-orange-500">{user.streak_count}d</td>
                            <td className="px-5 py-3.5 text-xs text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab === 'courses' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">All Courses ({courses.length})</h2>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                          {['Course', 'Category', 'Price', 'Enrollments', 'Rating', 'Status', 'Actions'].map(h => (
                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {courses.map(course => (
                          <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <img src={course.thumbnail_url} alt="" className="w-12 h-8 object-cover rounded" />
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-48">{course.title}</p>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-500 capitalize">{course.category.replace('-', ' ')}</td>
                            <td className="px-5 py-3.5 text-sm font-medium text-slate-900 dark:text-white">${course.price}</td>
                            <td className="px-5 py-3.5 text-sm text-slate-700 dark:text-slate-300">{course.enrollment_count.toLocaleString()}</td>
                            <td className="px-5 py-3.5 text-sm text-amber-500">★ {course.rating}</td>
                            <td className="px-5 py-3.5">
                              <button
                                onClick={() => togglePublish(course.id, course.is_published)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                  course.is_published ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20'
                                }`}
                              >
                                {course.is_published ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                {course.is_published ? 'Live' : 'Draft'}
                              </button>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <button className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab === 'contact' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Contact Messages ({contacts.length})</h2>
                <div className="space-y-3">
                  {contacts.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-slate-400">No messages yet</p>
                    </div>
                  ) : contacts.map(c => (
                    <div key={c.id} className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 ${c.is_read ? 'border-slate-200 dark:border-slate-700' : 'border-teal-500/50 dark:border-teal-500/30'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900 dark:text-white">{c.name}</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">{c.email}</span>
                            {!c.is_read && <span className="px-2 py-0.5 bg-teal-500 text-white text-xs rounded-full">New</span>}
                          </div>
                          {c.subject && <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{c.subject}</p>}
                          <p className="text-sm text-slate-500 dark:text-slate-400">{c.message}</p>
                          <p className="text-xs text-slate-400 mt-2">{new Date(c.created_at).toLocaleString()}</p>
                        </div>
                        {!c.is_read && (
                          <button onClick={() => markContactRead(c.id)} className="ml-4 px-3 py-1.5 text-xs text-teal-500 border border-teal-500/30 rounded-lg hover:bg-teal-500/10 transition-colors">
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
