import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, MessageSquare, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const faqs = [
  { q: 'How does the AI mentor work?', a: 'Our AI mentor analyzes your learning patterns, goals, and progress to provide personalized recommendations, answer doubts in real-time, and guide you along your career path.' },
  { q: 'Are the certificates industry-recognized?', a: 'Yes! SkillOrbit certificates are recognized by hundreds of companies. Each certificate includes a unique verification link that employers can validate.' },
  { q: 'Can I get a refund?', a: 'Absolutely. We offer a 30-day money-back guarantee on all paid courses. No questions asked.' },
  { q: 'Do courses have an expiry?', a: 'No. Once you enroll in a course, you have lifetime access to all content, including future updates.' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.from('contact_submissions').insert(form);
    if (error) setError('Failed to send message. Please try again.');
    else { setSent(true); setForm({ name: '', email: '', subject: '', message: '' }); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-16">
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-teal-400 font-semibold text-sm uppercase tracking-wider">Get in Touch</span>
          <h1 className="text-5xl font-black text-white mt-3 mb-4">We'd Love to Hear <br />From You</h1>
          <p className="text-slate-300 text-lg">Have a question, feedback, or partnership inquiry? Our team is here to help.</p>
        </div>
      </section>

      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Mail, title: 'Email Us', info: 'hello@skillorbit.online', sub: 'We reply within 24 hours', color: 'text-teal-500 bg-teal-500/10' },
              { icon: MessageSquare, title: 'Live Chat', info: 'Chat with our team', sub: 'Available 9am–6pm EST', color: 'text-blue-500 bg-blue-500/10' },
              { icon: Clock, title: 'Response Time', info: '< 24 hours', sub: 'Average response time', color: 'text-amber-500 bg-amber-500/10' },
            ].map(item => (
              <div key={item.title} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 text-center">
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-slate-700 dark:text-slate-200 font-medium text-sm">{item.info}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Send a Message</h2>

              {sent ? (
                <div className="flex flex-col items-center justify-center py-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-500 dark:text-slate-400">We'll get back to you within 24 hours.</p>
                  <button onClick={() => setSent(false)} className="mt-4 text-teal-500 font-medium hover:underline text-sm">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Name *</label>
                      <input
                        required
                        value={form.name}
                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your name"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email *</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
                    <input
                      value={form.subject}
                      onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="How can we help?"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Tell us more..."
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-70"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
                  </button>
                </form>
              )}
            </div>

            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map(faq => (
                  <div key={faq.q} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">{faq.q}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
