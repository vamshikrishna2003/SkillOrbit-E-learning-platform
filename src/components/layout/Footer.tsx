import { Orbit, Twitter, Linkedin, Github, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import type { Page } from '../../types';

interface FooterProps {
  navigate: (page: Page) => void;
}

export default function Footer({ navigate }: FooterProps) {
  const links = {
    Platform: [
      { label: 'Courses', page: 'courses' as Page },
      { label: 'Blog', page: 'blog' as Page },
      { label: 'About Us', page: 'about' as Page },
      { label: 'Contact', page: 'contact' as Page },
    ],
    Learn: [
      { label: 'Web Development', page: 'courses' as Page },
      { label: 'AI & Machine Learning', page: 'courses' as Page },
      { label: 'UI/UX Design', page: 'courses' as Page },
      { label: 'Data Science', page: 'courses' as Page },
    ],
    Company: [
      { label: 'Careers', page: 'about' as Page },
      { label: 'Press Kit', page: 'about' as Page },
      { label: 'Privacy Policy', page: 'about' as Page },
      { label: 'Terms of Service', page: 'about' as Page },
    ],
  };

  return (
    <footer className="bg-slate-950 dark:bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <button onClick={() => navigate('home')} className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Orbit className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">
                Skill<span className="text-teal-400">Orbit</span>
              </span>
            </button>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
              An AI-powered skill development platform helping students, freelancers, and job seekers achieve their career goals through personalized learning.
            </p>
            <div className="flex items-center gap-4">
              {[Twitter, Linkedin, Github, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-slate-800 hover:bg-teal-500/20 hover:text-teal-400 rounded-lg flex items-center justify-center transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h3 className="font-semibold text-white mb-4 text-sm">{section}</h3>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    <button
                      onClick={() => navigate(item.page)}
                      className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © 2025 SkillOrbit.online. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> hello@skillorbit.online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
