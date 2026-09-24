import React from 'react';
import { Post, CustomerFeedback } from '../../types';
import { Calendar, User, ArrowRight, Star, Quote } from 'lucide-react';

interface PublicNewsProps {
  posts: Post[];
  feedbacks: CustomerFeedback[];
}

export const PublicNews: React.FC<PublicNewsProps> = ({ posts, feedbacks }) => {
  return (
    <section id="news" className="py-20 bg-stone-100 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Customer Feedbacks */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-stone-900 tracking-tight mb-2">
              Chia Sẻ Từ Du Khách Toàn Cầu
            </h2>
            <p className="text-stone-600 text-sm">
              Những trải nghiệm chân thực sau hành trình gắn kết cùng văn hóa và con người Hội An.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200 relative flex flex-col justify-between"
              >
                <div>
                  <Quote className="w-8 h-8 text-emerald-100 mb-3" />
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {[...Array(fb.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic mb-6">
                    "{fb.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                  <img
                    src={fb.avatar}
                    alt={fb.customerName}
                    className="w-10 h-10 rounded-full object-cover border border-emerald-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{fb.customerName}</h4>
                    <p className="text-[11px] text-stone-400">{fb.location} • <span className="text-emerald-700 font-medium">{fb.tourName}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sustainable Travel News */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black font-serif text-stone-900 tracking-tight">
                Tin Tức & Hoạt Động Xanh
              </h3>
              <p className="text-stone-600 text-sm mt-1">
                Các dự án bảo vệ môi trường, văn hóa bản địa và sáng kiến cộng đồng mới nhất từ Emic Travel.
              </p>
            </div>
            <a
              href="#news"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-700"
            >
              Xem tất cả bài viết <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row group"
              >
                <div className="sm:w-2/5 h-48 sm:h-auto overflow-hidden">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="sm:w-3/5 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-[11px] text-stone-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h4>

                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-4">
                      {post.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-stone-100 text-stone-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-stone-400" />
                      {post.author}
                    </span>
                    <span className="text-emerald-700 font-semibold cursor-pointer group-hover:underline">
                      Đọc tiếp &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
