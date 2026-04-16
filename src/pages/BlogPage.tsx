import { useState, useEffect } from 'react';
import { Clock, ArrowRight, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../types';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    supabase.from('blog_posts').select('*').eq('is_published', true).order('published_at', { ascending: false }).then(({ data }) => {
      if (data) setPosts(data as BlogPost[]);
      setLoading(false);
    });
  }, []);

  const categories = ['all', ...Array.from(new Set(posts.map(p => p.category)))];
  const filtered = posts.filter(p =>
    (!search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase())) &&
    (!category || category === 'all' || p.category === category)
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-16">
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-teal-400 font-semibold text-sm uppercase tracking-wider">Resources & Insights</span>
          <h1 className="text-5xl font-black text-white mt-3 mb-4">The SkillOrbit Blog</h1>
          <p className="text-slate-300 text-lg mb-8">Career tips, industry insights, and learning strategies from our expert team.</p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat === 'all' ? '' : cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                  (cat === 'all' && !category) || cat === category
                    ? 'bg-teal-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-slate-200 dark:bg-slate-700" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 dark:text-slate-400">No articles found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post, i) => (
                <article
                  key={post.id}
                  className={`group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 hover:shadow-xl transition-all ${i === 0 ? 'md:col-span-2' : ''}`}
                >
                  <div className="overflow-hidden">
                    <img
                      src={post.thumbnail_url}
                      alt={post.title}
                      className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${i === 0 ? 'h-56' : 'h-48'}`}
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-teal-500 font-medium uppercase bg-teal-500/10 px-2 py-0.5 rounded-full">{post.category}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400"><Clock className="w-3 h-3" />{post.read_time_minutes} min read</span>
                    </div>
                    <h2 className={`font-bold text-slate-900 dark:text-white mb-2 group-hover:text-teal-500 transition-colors ${i === 0 ? 'text-xl' : 'text-base'}`}>{post.title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{post.author_name}</span>
                      <button className="flex items-center gap-1 text-xs text-teal-500 font-medium hover:gap-2 transition-all">
                        Read More <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
