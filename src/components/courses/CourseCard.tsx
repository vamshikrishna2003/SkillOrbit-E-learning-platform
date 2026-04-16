import { Star, Clock, Users, BookOpen, Award, Bookmark, BookmarkCheck } from 'lucide-react';
import type { Course } from '../../types';

interface CourseCardProps {
  course: Course;
  onView: (slug: string) => void;
  isBookmarked?: boolean;
  onBookmark?: (courseId: string) => void;
}

const levelColors: Record<string, string> = {
  beginner: 'bg-emerald-500/10 text-emerald-500',
  intermediate: 'bg-amber-500/10 text-amber-500',
  advanced: 'bg-red-500/10 text-red-500',
};

const categoryIcons: Record<string, string> = {
  'web-development': '🌐',
  'ai-ml': '🤖',
  'design': '🎨',
  'marketing': '📈',
  'data-science': '📊',
  'cloud': '☁️',
  'general': '📚',
};

export default function CourseCard({ course, onView, isBookmarked, onBookmark }: CourseCardProps) {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 flex flex-col">
      <div className="relative overflow-hidden aspect-video">
        <img
          src={course.thumbnail_url || 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${levelColors[course.level] || levelColors.beginner}`}>
            {course.level}
          </span>
          {course.certificate_available && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 flex items-center gap-1">
              <Award className="w-3 h-3" /> Certificate
            </span>
          )}
        </div>

        {onBookmark && (
          <button
            onClick={(e) => { e.stopPropagation(); onBookmark(course.id); }}
            className="absolute top-3 right-3 p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all"
          >
            {isBookmarked
              ? <BookmarkCheck className="w-4 h-4 text-teal-500" />
              : <Bookmark className="w-4 h-4 text-slate-500" />
            }
          </button>
        )}

        <div className="absolute top-3 right-3 text-xl">
          {categoryIcons[course.category] || '📚'}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">{course.instructor_name}</span>
        </div>

        <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug mb-2 line-clamp-2 group-hover:text-teal-500 transition-colors">
          {course.title}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
          {course.short_description}
        </p>

        <div className="flex items-center gap-3 mb-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {course.duration_hours}h
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {(course.enrollment_count / 1000).toFixed(1)}k
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" /> {course.rating}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              ${course.price === 0 ? 'Free' : course.price.toFixed(2)}
            </span>
            {course.original_price > course.price && (
              <span className="text-xs text-slate-400 line-through">${course.original_price.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={() => onView(course.slug)}
            className="px-4 py-2 text-xs font-medium bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-teal-500/25 hover:scale-105 transition-all"
          >
            View Course
          </button>
        </div>
      </div>
    </div>
  );
}
