import React, { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Category, CustomerFeedback, Tour } from '../../types';
import { PublicTourDetailModal } from './PublicTourDetailModal';
import { PublicFacebookReviewBox } from './PublicFacebookReviewBox';

type LangType = 'en' | 'vn';

interface PublicTourDetailPageProps {
  tour: Tour | null;
  categories?: Category[];
  feedbacks: CustomerFeedback[];
  lang?: LangType;
  onBack: () => void;
  onBook: (tour: Tour) => void;
}

export const PublicTourDetailPage: React.FC<PublicTourDetailPageProps> = ({
  tour,
  categories = [],
  feedbacks,
  lang = 'en',
  onBack,
  onBook,
}) => {
  const isVn = lang === 'vn';

  const getFeedbackComment = (feedback: CustomerFeedback) => {
    if (lang === 'vn') return feedback.comment || feedback.commentEn || '';
    return feedback.commentEn || feedback.comment || '';
  };

  const getFeedbackCustomerName = (feedback: CustomerFeedback) => {
    if (lang === 'vn') return feedback.customerName || feedback.customerNameEn || '';
    return feedback.customerNameEn || feedback.customerName || '';
  };

  const normalizeText = (value: string) => {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const reviewSnippets = useMemo(() => {
    if (!tour) {
      return [];
    }

    const tourNames = [tour.name, tour.nameEn || '']
      .map(normalizeText)
      .filter(Boolean);

    return feedbacks
      .filter((feedback) => {
        if (!feedback.isApproved || !feedback.tourName) {
          return false;
        }

        const feedbackTour = normalizeText(feedback.tourName || '');
        return tourNames.some((tourName) => (
          feedbackTour === tourName ||
          feedbackTour.startsWith(`${tourName} `) ||
          feedbackTour.endsWith(` ${tourName}`)
        ));
      })
      .sort((left, right) => Number(right.isFeatured) - Number(left.isFeatured) || right.rating - left.rating)
      .slice(0, 3)
      .map((feedback) => ({
        id: feedback.id,
        name: getFeedbackCustomerName(feedback),
        location: feedback.location,
        comment: getFeedbackComment(feedback),
        rating: feedback.rating,
        avatar: feedback.avatar,
      }));
  }, [feedbacks, lang, tour]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4ecdf_0%,#f9f7f1_28%,#f7f3ea_100%)] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 pb-5 sm:pb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/90 px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{isVn ? 'Quay lại danh sách workshop' : 'Back to workshops'}</span>
        </button>

        <div className="text-right text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
          Botanica Garden Hoi An
        </div>
      </div>

      {tour ? (
        <>
          <PublicTourDetailModal
            tour={tour}
            categories={categories}
            reviewSnippets={reviewSnippets}
            onClose={onBack}
            onBook={onBook}
            lang={lang}
            displayMode="page"
          />
          <PublicFacebookReviewBox
            tour={tour}
            lang={lang}
          />
        </>
      ) : (
        <div className="mx-auto max-w-4xl rounded-[32px] border border-stone-200 bg-white p-10 text-center shadow-[0_30px_90px_-30px_rgba(15,23,42,0.22)]">
          <h1 className="font-serif text-3xl font-black text-stone-900">
            {isVn ? 'Không tìm thấy workshop' : 'Workshop not found'}
          </h1>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            {isVn
              ? 'Workshop này không còn hiển thị hoặc đường dẫn không hợp lệ.'
              : 'This workshop is no longer available or the link is invalid.'}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isVn ? 'Về trang workshop' : 'Return to workshops'}</span>
          </button>
        </div>
      )}
    </div>
  );
};