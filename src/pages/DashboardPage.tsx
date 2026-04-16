import { useState, useEffect } from 'react';
import { BookOpen, Award, Flame, Zap, TrendingUp, Clock, CheckCircle2, Star, ExternalLink, Camera, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Enrollment, Certificate, UserBadge, Page } from '../types';

interface DashboardPageProps {
  navigate: (page: Page, params?: Record<string, string>) => void;
}

type DashTab = 'overview' | 'courses' | 'certificates' | 'achievements' | 'profile';

export default function DashboardPage({ navigate }: DashboardPageProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<DashTab>('overview');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', bio: '', website_url: '', linkedin_url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate('auth'); return; }
    fetchData();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        website_url: profile.website_url || '',
        linkedin_url: profile.linkedin_url || '',
      });
    }
  }, [profile]);

  const fetchData = async () => {
    const [enrollRes, certRes, badgeRes] = await Promise.all([
      supabase.from('enrollments').select('*, course:courses(*)').eq('user_id', user!.id).order('enrolled_at', { ascending: false }),
      supabase.from('certificates').select('*, course:courses(title, slug)').eq('user_id', user!.id),
      supabase.from('user_badges').select('*, badge:badges(*)').eq('user_id', user!.id),
    ]);
    if (enrollRes.data) setEnrollments(enrollRes.data as unknown as Enrollment[]);
    if (certRes.data) setCertificates(certRes.data as unknown as Certificate[]);
    if (badgeRes.data) setUserBadges(badgeRes.data as unknown as UserBadge[]);
    setLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    await supabase.from('profiles').update(profileForm).eq('id', user!.id);
    await refreshProfile();
    setSaving(false);
    setEditingProfile(false);
  };

  const completedCourses = enrollments.filter(e => e.is_completed).length;
  const avgProgress = enrollments.length > 0 ? Math.round(enrollments.reduce((s, e) => s + e.progress_percent, 0) / enrollments.length) : 0;

  const tabs: { key: DashTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'courses', label: 'My Courses' },
    { key: 'certificates', label: 'Certificates' },
    { key: 'achievements', label: 'Achievements' },
    { key: 'profile', label: 'Profile' },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 pt-12 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl">
              {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{profile?.full_name || 'Learner'}</h1>
              <p className="text-slate-400 text-sm">{user.email}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-teal-400 text-sm"><Zap className="w-3.5 h-3.5" /> {profile?.xp ?? 0} XP</span>
                <span className="flex items-center gap-1 text-orange-400 text-sm"><Flame className="w-3.5 h-3.5" /> {profile?.streak_count ?? 0} day streak</span>
                <span className="text-xs px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded-full capitalize">{profile?.role || 'student'}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.key
                    ? 'text-teal-400 border-teal-400'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: BookOpen, label: 'Enrolled', value: enrollments.length, color: 'text-teal-500', bg: 'bg-teal-500/10' },
                    { icon: CheckCircle2, label: 'Completed', value: completedCourses, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { icon: Award, label: 'Certificates', value: certificates.length, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { icon: TrendingUp, label: 'Avg Progress', value: `${avgProgress}%`, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                      <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {enrollments.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4">Continue Learning</h2>
                    <div className="space-y-4">
                      {enrollments.slice(0, 3).map(enrollment => (
                        <div key={enrollment.id} className="flex items-center gap-4">
                          {enrollment.course?.thumbnail_url && (
                            <img src={enrollment.course.thumbnail_url} alt="" className="w-14 h-10 object-cover rounded-lg" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{enrollment.course?.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all"
                                  style={{ width: `${enrollment.progress_percent}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-500 whitespace-nowrap">{enrollment.progress_percent}%</span>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate('course-detail', { slug: enrollment.course?.slug || '' })}
                            className="text-xs text-teal-500 font-medium hover:text-teal-400 whitespace-nowrap"
                          >
                            Continue
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {userBadges.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4">Recent Badges</h2>
                    <div className="flex flex-wrap gap-3">
                      {userBadges.slice(0, 6).map(ub => (
                        <div key={ub.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: ub.badge?.color }}>
                            <Star className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{ub.badge?.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {enrollments.length === 0 && (
                  <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Start Your Learning Journey</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">You haven't enrolled in any courses yet.</p>
                    <button onClick={() => navigate('courses')} className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg transition-all text-sm">
                      Browse Courses
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'courses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Courses ({enrollments.length})</h2>
                  <button onClick={() => navigate('courses')} className="text-sm text-teal-500 font-medium">Browse More</button>
                </div>
                {enrollments.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 mb-4">No enrolled courses yet</p>
                    <button onClick={() => navigate('courses')} className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl text-sm">Browse Courses</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enrollments.map(enrollment => (
                      <div key={enrollment.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex">
                        {enrollment.course?.thumbnail_url && (
                          <img src={enrollment.course.thumbnail_url} alt="" className="w-32 h-full object-cover shrink-0" />
                        )}
                        <div className="p-4 flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-sm line-clamp-2 mb-2">{enrollment.course?.title}</p>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" style={{ width: `${enrollment.progress_percent}%` }} />
                            </div>
                            <span className="text-xs text-slate-500">{enrollment.progress_percent}%</span>
                          </div>
                          {enrollment.is_completed && (
                            <span className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>
                          )}
                          <button onClick={() => navigate('course-detail', { slug: enrollment.course?.slug || '' })} className="mt-2 text-xs text-teal-500 font-medium flex items-center gap-1">
                            {enrollment.is_completed ? 'Review Course' : 'Continue'} <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'certificates' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Certificates ({certificates.length})</h2>
                {certificates.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Complete a course to earn your first certificate!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.map(cert => (
                      <div key={cert.id} className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20 rounded-2xl p-6">
                        <Award className="w-10 h-10 text-teal-500 mb-3" />
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">{cert.course?.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Certificate #{cert.certificate_number}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Issued: {new Date(cert.issued_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'achievements' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Badges & Achievements ({userBadges.length})</h2>
                {userBadges.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <Star className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Complete activities to earn badges!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {userBadges.map(ub => (
                      <div key={ub.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-center">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: ub.badge?.color + '20', border: `1px solid ${ub.badge?.color}40` }}>
                          <Award className="w-6 h-6" style={{ color: ub.badge?.color }} />
                        </div>
                        <p className="font-medium text-sm text-slate-900 dark:text-white">{ub.badge?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{ub.badge?.description}</p>
                        <p className="text-xs text-teal-500 mt-2">{new Date(ub.earned_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
                  {!editingProfile && (
                    <button onClick={() => setEditingProfile(true)} className="px-4 py-2 text-sm font-medium text-teal-500 border border-teal-500 rounded-xl hover:bg-teal-500/10 transition-colors">
                      Edit Profile
                    </button>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                  {[
                    { key: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
                    { key: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Tell us about yourself...' },
                    { key: 'website_url', label: 'Website', type: 'url', placeholder: 'https://yoursite.com' },
                    { key: 'linkedin_url', label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/in/...' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={profileForm[field.key as keyof typeof profileForm]}
                          onChange={e => setProfileForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                          disabled={!editingProfile}
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 disabled:opacity-60 transition-colors resize-none"
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={profileForm[field.key as keyof typeof profileForm]}
                          onChange={e => setProfileForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                          disabled={!editingProfile}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 disabled:opacity-60 transition-colors"
                        />
                      )}
                    </div>
                  ))}

                  {editingProfile && (
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg transition-all text-sm disabled:opacity-70"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button onClick={() => setEditingProfile(false)} className="px-5 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
