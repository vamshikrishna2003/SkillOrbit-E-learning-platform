import { useState, useEffect } from 'react';
import { Menu, X, Orbit, Sun, Moon, ChevronDown, Bell, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { Page } from '../../types';

interface NavbarProps {
  currentPage: Page;
  navigate: (page: Page, params?: Record<string, string>) => void;
}

export default function Navbar({ currentPage, navigate }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', page: 'home' as Page },
    { label: 'Courses', page: 'courses' as Page },
    { label: 'Blog', page: 'blog' as Page },
    { label: 'About', page: 'about' as Page },
    { label: 'Contact', page: 'contact' as Page },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-200/50 dark:border-slate-700/50'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => navigate('home')} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-teal-500/30 transition-shadow">
              <Orbit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              Skill<span className="text-teal-500">Orbit</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.page}
                onClick={() => navigate(link.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === link.page
                    ? 'text-teal-500 bg-teal-500/10'
                    : 'text-slate-600 dark:text-slate-300 hover:text-teal-500 hover:bg-teal-500/10'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-200 max-w-24 truncate">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{profile?.full_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-teal-500 font-medium">{profile?.xp ?? 0} XP</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-xs text-orange-500">{profile?.streak_count ?? 0} day streak</span>
                      </div>
                    </div>
                    {[
                      { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' as Page },
                      { icon: Settings, label: 'Settings', page: 'dashboard' as Page },
                    ].map(item => (
                      <button
                        key={item.label}
                        onClick={() => { navigate(item.page); setProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                    {profile?.role === 'admin' && (
                      <button
                        onClick={() => { navigate('admin'); setProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Admin Panel
                      </button>
                    )}
                    <div className="border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => { signOut(); setProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('auth')}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-teal-500 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('auth')}
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-teal-500/25 transition-all"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-500 dark:text-slate-400">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <button
              key={link.page}
              onClick={() => { navigate(link.page); setMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === link.page
                  ? 'text-teal-500 bg-teal-500/10'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
            {user ? (
              <>
                <button onClick={() => { navigate('dashboard'); setMenuOpen(false); }} className="px-4 py-2.5 text-sm font-medium text-teal-500">Dashboard</button>
                <button onClick={() => { signOut(); setMenuOpen(false); }} className="px-4 py-2.5 text-sm font-medium text-red-500">Sign Out</button>
              </>
            ) : (
              <>
                <button onClick={() => { navigate('auth'); setMenuOpen(false); }} className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">Sign In</button>
                <button onClick={() => { navigate('auth'); setMenuOpen(false); }} className="px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg">Get Started</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
