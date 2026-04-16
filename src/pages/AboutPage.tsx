import { Target, Users, Award, Globe, ArrowRight, Linkedin, Twitter } from 'lucide-react';
import type { Page } from '../types';

interface AboutPageProps {
  navigate: (page: Page) => void;
}

const team = [
  { name: 'Sarah Johnson', role: 'CEO & Co-founder', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200', bio: 'Former Google Engineer with 10+ years in EdTech.' },
  { name: 'Alex Chen', role: 'CTO & Co-founder', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200', bio: 'AI researcher and full-stack architect.' },
  { name: 'Maria Rodriguez', role: 'Head of Curriculum', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200', bio: 'Former Stanford professor with expertise in online learning.' },
  { name: 'James Wilson', role: 'Head of Growth', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200', bio: 'Growth strategist who scaled multiple EdTech startups.' },
];

const values = [
  { icon: Target, title: 'Mission-Driven', desc: 'We believe everyone deserves access to world-class education regardless of their background or location.' },
  { icon: Users, title: 'Community First', desc: 'Learning is better together. We foster an inclusive community where everyone grows together.' },
  { icon: Award, title: 'Quality Always', desc: 'We obsess over the quality of our content, ensuring every course meets the highest standards.' },
  { icon: Globe, title: 'Global Impact', desc: 'With learners in 150+ countries, we\'re making career development truly accessible worldwide.' },
];

export default function AboutPage({ navigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-16">
      <section className="relative bg-gradient-to-br from-slate-900 to-slate-800 py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <span className="text-teal-400 font-semibold text-sm uppercase tracking-wider">About SkillOrbit</span>
          <h1 className="text-5xl font-black text-white mt-3 mb-6">
            We're Redefining
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">How the World Learns</span>
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            SkillOrbit was founded with a simple belief: that AI can make learning personal, effective, and accessible for everyone — no matter where you start.
          </p>
        </div>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '50K+', label: 'Active Learners', color: 'text-teal-500' },
              { value: '200+', label: 'Expert Courses', color: 'text-cyan-500' },
              { value: '150+', label: 'Countries Reached', color: 'text-blue-500' },
              { value: '94%', label: 'Completion Rate', color: 'text-emerald-500' },
            ].map(stat => (
              <div key={stat.label} className="text-center bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className={`text-4xl font-black ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-teal-500 font-semibold text-sm uppercase tracking-wider">Our Story</span>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mt-2 mb-6">Born from Frustration, Built with Purpose</h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>In 2022, our founders experienced firsthand the challenges of online learning — generic content, lack of personalization, and no real career guidance. They believed technology could do better.</p>
                <p>SkillOrbit was built to solve these problems head-on. By combining expert-led courses with AI-powered mentorship, we create learning experiences that adapt to each individual's needs, pace, and goals.</p>
                <p>Today, we're proud to be helping thousands of students, freelancers, and job seekers worldwide transform their careers through smart, personalized learning.</p>
              </div>
              <button
                onClick={() => navigate('courses')}
                className="mt-8 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all"
              >
                Start Learning Today <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Team collaboration"
                className="rounded-3xl shadow-2xl w-full object-cover aspect-video"
              />
              <div className="absolute -bottom-6 -left-6 bg-teal-500 text-white px-6 py-4 rounded-2xl shadow-xl">
                <div className="text-2xl font-black">2022</div>
                <div className="text-sm text-teal-100">Founded</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-teal-500 font-semibold text-sm uppercase tracking-wider">What We Stand For</span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mt-2">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(v => (
              <div key={v.title} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-teal-500 font-semibold text-sm uppercase tracking-wider">The Team</span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mt-2">Meet the People Behind SkillOrbit</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map(member => (
              <div key={member.name} className="group text-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 transition-all">
                <img src={member.avatar} alt={member.name} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 group-hover:scale-105 transition-transform" />
                <h3 className="font-bold text-slate-900 dark:text-white">{member.name}</h3>
                <p className="text-sm text-teal-500 mb-2">{member.role}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{member.bio}</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <a href="#" className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <Twitter className="w-4 h-4 text-slate-400" />
                  </a>
                  <a href="#" className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <Linkedin className="w-4 h-4 text-slate-400" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-teal-600 to-cyan-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-white mb-4">Join Our Mission</h2>
          <p className="text-teal-100 mb-8">Help us democratize access to world-class education. We're hiring passionate people across all departments.</p>
          <button
            onClick={() => navigate('contact')}
            className="px-8 py-4 bg-white text-teal-600 font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            View Open Positions
          </button>
        </div>
      </section>
    </div>
  );
}
