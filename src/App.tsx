import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AIChatBot from './components/chatbot/AIChatBot';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import type { Page } from './types';

interface RouteState {
  page: Page;
  params: Record<string, string>;
}

function parseHash(): RouteState {
  const hash = window.location.hash.slice(1) || '/';
  const [path, ...queryParts] = hash.split('?');
  const params: Record<string, string> = {};
  if (queryParts.length) {
    queryParts.join('?').split('&').forEach(p => {
      const [k, v] = p.split('=');
      if (k) params[k] = decodeURIComponent(v || '');
    });
  }
  const page = (path.replace(/^\//, '') || 'home') as Page;
  return { page, params };
}

function AppContent() {
  const [route, setRoute] = useState<RouteState>(parseHash);

  useEffect(() => {
    const handleHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [route.page]);

  const navigate = (page: Page, params?: Record<string, string>) => {
    const query = params ? '?' + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&') : '';
    window.location.hash = `/${page}${query}`;
  };

  const noLayoutPages: Page[] = ['auth'];
  const showLayout = !noLayoutPages.includes(route.page);

  const renderPage = () => {
    switch (route.page) {
      case 'home':
        return <HomePage navigate={navigate} />;
      case 'courses':
        return <CoursesPage navigate={navigate} />;
      case 'course-detail':
        return <CourseDetailPage slug={route.params.slug || ''} navigate={navigate} />;
      case 'auth':
        return <AuthPage navigate={navigate} />;
      case 'dashboard':
        return <DashboardPage navigate={navigate} />;
      case 'admin':
        return <AdminDashboardPage navigate={navigate} />;
      case 'about':
        return <AboutPage navigate={navigate} />;
      case 'contact':
        return <ContactPage />;
      case 'blog':
        return <BlogPage />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {showLayout && <Navbar currentPage={route.page} navigate={navigate} />}
      <main className="flex-1">
        {renderPage()}
      </main>
      {showLayout && <Footer navigate={navigate} />}
      {showLayout && <AIChatBot />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
