import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, MessageSquareHeart, ShieldCheck, Star } from 'lucide-react';
import { Tour } from '../../types';
import { apiClient } from '../../services/apiClient';

type LangType = 'en' | 'vn';

interface PublicFacebookReviewBoxProps {
  tour: Tour;
  lang?: LangType;
}

export const PublicFacebookReviewBox: React.FC<PublicFacebookReviewBoxProps> = ({
  tour,
  lang = 'en',
}) => {
  const isVn = lang === 'vn';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [website, setWebsite] = useState('');
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());

  useEffect(() => {
    setFormStartedAt(Date.now());
  }, [tour.id]);

  const reviewIntro = useMemo(() => {
    return isVn
      ? 'Bạn có thể nhập tên và gửi cảm nhận trực tiếp. Đánh giá sẽ được kiểm duyệt và hệ thống có lớp lọc để hạn chế spam tự động.'
      : 'You can enter your name and leave a review directly. Each submission is moderated and filtered to reduce automated spam.';
  }, [isVn]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setSubmitState('error');
      setSubmitMessage(isVn ? 'Vui lòng nhập tên của bạn.' : 'Please enter your name.');
      return;
    }

    if (!comment.trim()) {
      setSubmitState('error');
      setSubmitMessage(isVn ? 'Vui lòng nhập nội dung đánh giá.' : 'Please enter your review message.');
      return;
    }

    if (Date.now() - formStartedAt < 4000) {
      setSubmitState('error');
      setSubmitMessage(isVn ? 'Bạn thao tác quá nhanh. Vui lòng đọc lại nội dung và thử gửi sau vài giây.' : 'That was submitted too quickly. Please review your message and try again in a few seconds.');
      return;
    }

    const localThrottleKey = `botanica-review-${tour.slug}`;
    const lastSubmittedAt = Number(window.localStorage.getItem(localThrottleKey) || 0);
    if (lastSubmittedAt && Date.now() - lastSubmittedAt < 5 * 60 * 1000) {
      setSubmitState('error');
      setSubmitMessage(isVn ? 'Bạn vừa gửi đánh giá gần đây. Vui lòng thử lại sau ít phút.' : 'You submitted a review recently. Please wait a few minutes before trying again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitState('idle');
    setSubmitMessage('');

    try {
      await apiClient.createPublicFeedback({
        customerName: customerName.trim(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName.trim())}&background=E7F6EF&color=14532D`,
        location: location.trim() || (isVn ? 'Khách Botanica Garden' : 'Botanica guest'),
        tourName: tour.nameEn || tour.name,
        rating,
        comment: comment.trim(),
        commentEn: comment.trim(),
        website: website.trim(),
        startedAt: new Date(formStartedAt).toISOString(),
      });

      window.localStorage.setItem(localThrottleKey, String(Date.now()));
      setCustomerName('');
      setComment('');
      setLocation('');
      setWebsite('');
      setRating(5);
      setFormStartedAt(Date.now());
      setSubmitState('success');
      setSubmitMessage(isVn ? 'Cảm ơn bạn. Đánh giá đã được gửi và đang chờ duyệt.' : 'Thank you. Your review has been submitted and is awaiting approval.');
    } catch (error) {
      console.error('Failed to submit public feedback:', error);
      setSubmitState('error');
      setSubmitMessage(isVn ? 'Không thể gửi đánh giá lúc này. Vui lòng thử lại sau.' : 'Could not submit your review right now. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto mt-8 max-w-5xl rounded-[32px] border border-stone-200 bg-white/95 p-6 shadow-[0_30px_90px_-30px_rgba(15,23,42,0.18)] sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)] lg:items-start">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-800">
            <MessageSquareHeart className="h-3.5 w-3.5" />
            <span>{isVn ? 'Đánh giá workshop' : 'Workshop review'}</span>
          </div>
          <h2 className="font-serif text-2xl font-black leading-tight text-stone-900 sm:text-3xl">
            {isVn ? 'Để lại đánh giá của bạn cho workshop này' : 'Leave your review for this workshop'}
          </h2>
          <p className="text-sm leading-7 text-stone-600">
            {reviewIntro}
          </p>

          <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <div>
                <p className="font-semibold text-stone-900">
                  {isVn ? 'Chống spam và chỉ hiển thị sau khi duyệt' : 'Spam-protected and published after approval'}
                </p>
                <p className="mt-1 leading-6">
                  {isVn
                    ? 'Biểu mẫu sẽ chặn gửi quá nhanh, lọc nội dung trùng lặp và giới hạn tần suất gửi trước khi Botanica duyệt thủ công.'
                    : 'The form blocks very fast submissions, filters duplicate content, and limits repeated attempts before Botanica manually approves it.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-[linear-gradient(180deg,#fff_0%,#f8f4ea_100%)] p-5 sm:p-6">
          <form className="space-y-4" onSubmit={handleSubmitReview}>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
                {isVn ? 'Tên của bạn' : 'Your name'}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={isVn ? 'Ví dụ: Minh Anh' : 'Example: Emily Carter'}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-emerald-500"
              />
            </div>

            <div className="hidden" aria-hidden="true">
              <label htmlFor="review-website">Website</label>
              <input
                id="review-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
                {isVn ? 'Bạn đến từ đâu' : 'Your location'}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={isVn ? 'Ví dụ: Hà Nội, Việt Nam' : 'Example: Melbourne, Australia'}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
                {isVn ? 'Số sao' : 'Your rating'}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="rounded-full p-1"
                    aria-label={`${value} star`}
                  >
                    <Star className={`h-6 w-6 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
                {isVn ? 'Cảm nhận của bạn' : 'Your review'}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                placeholder={isVn ? 'Hãy chia sẻ điều bạn thích nhất trong workshop này...' : 'Share what you loved most about this workshop...'}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm leading-6 text-stone-700 outline-none transition focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>{isVn ? 'Gửi đánh giá chờ duyệt' : 'Submit review for approval'}</span>
            </button>
          </form>

          {submitMessage && (
            <p className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-6 ${submitState === 'success' ? 'border border-emerald-200 bg-emerald-50 text-emerald-800' : 'border border-amber-200 bg-amber-50 text-amber-800'}`}>
              {submitMessage}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};