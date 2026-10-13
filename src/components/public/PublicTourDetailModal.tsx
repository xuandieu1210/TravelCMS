import React, { useEffect, useMemo, useState } from 'react';
import { Category, Tour } from '../../types';
import { X, Clock, MapPin, CheckCircle, AlertCircle, Calendar, Star, Compass, ArrowRight, Quote, Users, Images } from 'lucide-react';

type TourReviewSnippet = {
  id: string;
  name: string;
  location: string;
  comment: string;
  rating: number;
  avatar: string;
};

interface PublicTourDetailModalProps {
  tour: Tour | null;
  categories?: Category[];
  reviewSnippets?: TourReviewSnippet[];
  onClose: () => void;
  onBook: (tour: Tour) => void;
  lang?: 'vn' | 'en';
  displayMode?: 'modal' | 'page';
}

export const PublicTourDetailModal: React.FC<PublicTourDetailModalProps> = ({
  tour,
  categories = [],
  reviewSnippets = [],
  onClose,
  onBook,
  lang = 'vn',
  displayMode = 'modal',
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!tour) return null;

  const displayLang = lang;
  const isVn = displayLang === 'vn';
  const title = isVn ? (tour.name || tour.nameEn || '') : (tour.nameEn || tour.name || '');
  const departure = isVn ? (tour.departureLocation || tour.departureLocationEn || '') : (tour.departureLocationEn || tour.departureLocation || '');
  const transportation = isVn ? (tour.transportation || tour.transportationEn || '') : (tour.transportationEn || tour.transportation || '');
  const summary = isVn ? (tour.description || tour.descriptionEn || '') : (tour.descriptionEn || tour.description || '');
  const highlights = isVn ? (tour.highlights || tour.highlightsEn || []) : (tour.highlightsEn || tour.highlights || []);
  const includes = isVn ? (tour.policies.includes || tour.policies.includesEn || []) : (tour.policies.includesEn || tour.policies.includes || []);
  const excludes = isVn ? (tour.policies.excludes || tour.policies.excludesEn || []) : (tour.policies.excludesEn || tour.policies.excludes || []);
  const cancellation = isVn ? (tour.policies.cancellation || tour.policies.cancellationEn || '') : (tour.policies.cancellationEn || tour.policies.cancellation || '');
  const notes = isVn ? (tour.policies.notes || tour.policies.notesEn || '') : (tour.policies.notesEn || tour.policies.notes || '');
  const durationLabel = isVn
    ? `${tour.durationDays} ngày ${tour.durationNights > 0 ? `${tour.durationNights} đêm` : ''}`.trim()
    : `${tour.durationDays} day${tour.durationDays > 1 ? 's' : ''} ${tour.durationNights > 0 ? `${tour.durationNights} night${tour.durationNights > 1 ? 's' : ''}` : ''}`.trim();
  const categoryLabel = (() => {
    const workshopCategorySlug = {
      family: 'family-crafts',
      culture: 'culture-and-food',
      wellness: 'coffee-and-wellness',
    }[tour.workshopCat || ''];
    const matchedCategory = categories.find((category) => {
      const tourCategory = (tour.category || '').toLowerCase();
      return (
        tourCategory === category.name.toLowerCase() ||
        tourCategory === (category.nameEn || '').toLowerCase() ||
        tourCategory === category.slug.toLowerCase() ||
        category.slug === workshopCategorySlug ||
        tour.category === category.id ||
        tour.category === category.code
      );
    });

    if (!matchedCategory) {
      return tour.category;
    }

    return isVn
      ? (matchedCategory.name || matchedCategory.nameEn || tour.category)
      : (matchedCategory.nameEn || matchedCategory.name || tour.category);
  })();

  const tourImages = useMemo(() => {
    const mergedImages = [tour.thumbnail, ...(tour.album || [])].filter(Boolean);
    return [...new Set(mergedImages)];
  }, [tour]);

  useEffect(() => {
    setActiveImageIndex(0);
    setIsLightboxOpen(false);
  }, [tour.id]);

  const handleImageChange = (nextIndex: number) => {
    if (tourImages.length === 0) {
      return;
    }

    const normalizedIndex = (nextIndex + tourImages.length) % tourImages.length;
    setActiveImageIndex(normalizedIndex);
  };

  const handleOpenImage = (index: number) => {
    if (tourImages.length === 0) {
      return;
    }

    const normalizedIndex = (index + tourImages.length) % tourImages.length;
    setActiveImageIndex(normalizedIndex);
    setIsLightboxOpen(true);
  };

  const isPageMode = displayMode === 'page';
  const containerClassName = isPageMode
    ? 'relative w-full overflow-hidden rounded-[32px] border border-stone-200/70 bg-stone-50 shadow-[0_30px_90px_-30px_rgba(15,23,42,0.28)]'
    : 'relative w-full max-w-4xl overflow-hidden rounded-[32px] border border-stone-200/70 bg-stone-50 shadow-[0_30px_90px_-30px_rgba(15,23,42,0.55)]';

  const content = (
    <div className={containerClassName}>
        {/* Close Button */}
        {!isPageMode && (
          <button
            onClick={onClose}
            className="absolute right-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/90 text-stone-700 shadow-lg transition-transform hover:scale-105 hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div>
            <div className="relative h-80 w-full overflow-hidden sm:h-[25rem] lg:h-[28rem]">
              <button
                type="button"
                className="block h-full w-full"
                aria-label={isVn ? 'Phóng lớn ảnh workshop' : 'Open workshop image'}
                onClick={() => handleOpenImage(activeImageIndex)}
              >
                <img
                  src={tourImages[activeImageIndex] || tour.thumbnail}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/10 to-transparent" />
              {tourImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-5 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-stone-950/35 text-2xl text-white backdrop-blur-sm transition hover:bg-stone-950/55"
                    aria-label={isVn ? 'Ảnh trước' : 'Previous image'}
                    onClick={() => handleImageChange(activeImageIndex - 1)}
                  >
                    &#8249;
                  </button>
                  <button
                    type="button"
                    className="absolute right-5 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-stone-950/35 text-2xl text-white backdrop-blur-sm transition hover:bg-stone-950/55"
                    aria-label={isVn ? 'Ảnh tiếp theo' : 'Next image'}
                    onClick={() => handleImageChange(activeImageIndex + 1)}
                  >
                    &#8250;
                  </button>
                  <div className="absolute right-5 top-5 z-10 rounded-full bg-stone-950/55 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    {activeImageIndex + 1}/{tourImages.length}
                  </div>
                </>
              )}

              <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white sm:p-8">
                <span className="mb-3 inline-flex rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                  {categoryLabel}
                </span>
                <h2 className="max-w-3xl text-3xl font-black font-serif leading-tight sm:text-4xl">
                  {title}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-stone-100">
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                    <MapPin className="h-3.5 w-3.5 text-amber-300" />
                    {departure}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                    <Clock className="h-3.5 w-3.5 text-amber-300" />
                    {durationLabel}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-semibold text-amber-200 backdrop-blur-sm">
                    <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                    {tour.rating} {isVn ? `(${tour.reviewCount} đánh giá)` : `(${tour.reviewCount} reviews)`}
                  </span>
                </div>
              </div>
            </div>

            {tourImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3 border-b border-stone-200 bg-white px-6 py-5 sm:grid-cols-5 sm:px-8">
                {tourImages.map((imageUrl, index) => (
                  <button
                    key={`${tour.id}-${index}`}
                    type="button"
                    className={`overflow-hidden rounded-2xl border transition ${
                      index === activeImageIndex
                        ? 'border-emerald-600 ring-2 ring-emerald-100'
                        : 'border-stone-200 opacity-75 hover:opacity-100'
                    }`}
                    aria-label={`${isVn ? 'Xem ảnh tour' : 'View tour image'} ${index + 1}`}
                    onClick={() => handleImageChange(index)}
                  >
                    <img src={imageUrl} alt={`${title} ${index + 1}`} className="h-16 w-full object-cover sm:h-20" />
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-6 bg-[linear-gradient(180deg,#f8f4ea_0%,#fffdf8_100%)] p-8 sm:p-10 lg:p-14">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                <div className="space-y-6">
              {summary && (
                <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-sm leading-7 text-stone-600 sm:text-[15px]">
                    {summary}
                  </p>
                </div>
              )}

              {tourImages.length > 0 && (
                <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-stone-900">
                    <Images className="h-4 w-4 text-emerald-700" />
                    {isVn ? 'Bộ ảnh workshop' : 'Workshop photo gallery'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {tourImages.map((imageUrl, index) => (
                      <button
                        key={`${tour.id}-gallery-${index}`}
                        type="button"
                        onClick={() => handleOpenImage(index)}
                        className={`group relative overflow-hidden rounded-2xl border bg-stone-50 text-left transition ${
                          index === activeImageIndex
                            ? 'border-emerald-500 ring-2 ring-emerald-100'
                            : 'border-stone-200 hover:border-emerald-300'
                        }`}
                        aria-label={`${isVn ? 'Xem ảnh workshop' : 'View workshop image'} ${index + 1}`}
                      >
                        <img
                          src={imageUrl}
                          alt={`${title} ${index + 1}`}
                          className="h-32 w-full object-cover transition duration-200 group-hover:scale-[1.03] sm:h-36"
                        />
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-stone-950/70 to-transparent px-3 py-2 text-[11px] font-semibold text-white">
                          <span>{isVn ? `Ảnh ${index + 1}` : `Photo ${index + 1}`}</span>
                          <span>{isVn ? 'Bấm để xem lớn' : 'Tap to expand'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-stone-900">
                  <Compass className="h-4 w-4 text-emerald-700" />
                  {isVn ? 'Điểm nổi bật của trải nghiệm' : 'Why guests love this workshop'}
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {highlights.map((hl, i) => (
                    <div key={i} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{hl}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-stone-900">
                  <Calendar className="h-4 w-4 text-emerald-700" />
                  {isVn ? 'Lịch trình chi tiết' : 'Detailed itinerary'}
                </h3>
                <div className="space-y-4">
                  {tour.schedules.map((sch) => (
                    <div key={sch.id} className="relative rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 pl-6">
                      <div className="absolute bottom-4 left-0 top-4 w-px bg-emerald-200" />
                      <div className="absolute left-[-7px] top-5 h-3.5 w-3.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                      <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                        {isVn ? `Ngày ${sch.dayNumber}` : `Day ${sch.dayNumber}`}
                      </div>
                      <h4 className="mb-1 text-sm font-bold text-stone-900">
                        {isVn ? (sch.title || sch.titleEn || '') : (sch.titleEn || sch.title || '')}
                      </h4>
                      <p className="mb-2 text-sm leading-relaxed text-stone-600">
                        {isVn ? (sch.description || sch.descriptionEn || '') : (sch.descriptionEn || sch.description || '')}
                      </p>
                      {(isVn ? sch.mealsIncluded : (sch.mealsIncludedEn || sch.mealsIncluded)).length > 0 && (
                        <div className="inline-block rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800">
                          {isVn
                            ? `Bữa ăn: ${sch.mealsIncluded.join(', ')}`
                            : `Meals: ${(sch.mealsIncludedEn || sch.mealsIncluded).join(', ')}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-900">
                    {isVn ? 'Giá bao gồm' : 'Included'}
                  </h4>
                  <ul className="space-y-2 text-sm text-stone-700">
                    {includes.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-stone-600">
                    {isVn ? 'Không bao gồm' : 'Excluded'}
                  </h4>
                  <ul className="space-y-2 text-sm text-stone-600">
                    {excludes.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
                <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  {isVn ? 'Giá trọn gói / khách người lớn' : 'Package price / adult guest'}
                </span>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-950 sm:text-4xl">
                    {tour.pricing.adultPrice.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <p className="mt-2 text-sm text-stone-500">
                  {isVn
                    ? `Trẻ em: ${tour.pricing.childPrice.toLocaleString('vi-VN')} đ`
                    : `Children: ${tour.pricing.childPrice.toLocaleString('vi-VN')} đ`}
                </p>

                <button
                  onClick={() => onBook(tour)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-800 active:scale-[0.98]"
                >
                  <span>{isVn ? 'Đặt workshop này' : 'Book this workshop'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

                  <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-stone-500">
                  <Users className="h-4 w-4 text-emerald-700" />
                  {isVn ? 'Thông tin nhanh' : 'Quick facts'}
                </h3>
                <div className="space-y-3 text-sm text-stone-700">
                  <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-3">
                    <span className="text-stone-500">{isVn ? 'Điểm đón / địa điểm' : 'Location'}</span>
                    <span className="text-right font-medium text-stone-900">{departure}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-3">
                    <span className="text-stone-500">{isVn ? 'Thời lượng' : 'Duration'}</span>
                    <span className="text-right font-medium text-stone-900">{durationLabel}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-3">
                    <span className="text-stone-500">{isVn ? 'Phương tiện' : 'Transportation'}</span>
                    <span className="text-right font-medium text-stone-900">{transportation}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-stone-500">{isVn ? 'Đánh giá' : 'Guest rating'}</span>
                    <span className="flex items-center gap-1 font-semibold text-amber-600">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {tour.rating} / 5
                    </span>
                  </div>
                </div>
              </div>

                  <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-stone-600">
                      {isVn ? 'Lưu ý trước khi tham gia' : 'Good to know before you go'}
                    </h4>
                    <div className="space-y-2 text-sm text-stone-600">
                      <p><strong>{isVn ? 'Chính sách hoàn hủy:' : 'Cancellation policy:'}</strong> {cancellation}</p>
                      <p><strong>{isVn ? 'Lưu ý:' : 'Notes:'}</strong> {notes}</p>
                    </div>
                  </div>
                </div>
              </div>

              {reviewSnippets.length > 0 && (
                <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-stone-500">
                    <Quote className="h-4 w-4 text-emerald-700" />
                    {isVn ? 'Khách nói gì' : 'What guests say'}
                  </h3>
                  <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {reviewSnippets.map((review) => (
                      <article key={review.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                        <div className="mb-3 flex items-center gap-3">
                          <img src={review.avatar} alt={review.name} className="h-11 w-11 rounded-full object-cover border border-emerald-100" />
                          <div>
                            <div className="text-sm font-bold text-stone-900">{review.name}</div>
                            <div className="text-xs text-stone-500">{review.location}</div>
                          </div>
                        </div>
                        <div className="mb-2 flex items-center gap-1 text-amber-500">
                          {Array.from({ length: Math.max(1, Math.min(5, review.rating || 5)) }).map((_, index) => (
                            <Star key={index} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-sm leading-relaxed text-stone-600">“{review.comment}”</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </div>
    </div>
  );

  if (isPageMode) {
    return (
      <>
        {content}
        {isLightboxOpen && tourImages.length > 0 && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/88 p-4 backdrop-blur-md sm:p-6">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
              aria-label={isVn ? 'Đóng bộ ảnh' : 'Close gallery'}
            >
              <X className="h-5 w-5" />
            </button>
            {tourImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:left-6"
                  aria-label={isVn ? 'Ảnh trước' : 'Previous image'}
                  onClick={() => handleImageChange(activeImageIndex - 1)}
                >
                  &#8249;
                </button>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:right-6"
                  aria-label={isVn ? 'Ảnh tiếp theo' : 'Next image'}
                  onClick={() => handleImageChange(activeImageIndex + 1)}
                >
                  &#8250;
                </button>
              </>
            )}
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3">
              <img
                src={tourImages[activeImageIndex]}
                alt={`${title} ${activeImageIndex + 1}`}
                className="max-h-[78vh] w-auto max-w-full rounded-[28px] object-contain shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
              />
              <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                {title} · {activeImageIndex + 1}/{tourImages.length}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/72 backdrop-blur-md p-6 sm:p-10 lg:p-14 animate-in fade-in duration-200">
        <div className="mx-auto flex min-h-full items-center justify-center">
          {content}
        </div>
      </div>
      {isLightboxOpen && tourImages.length > 0 && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/92 p-4 backdrop-blur-md sm:p-6">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
            aria-label={isVn ? 'Đóng bộ ảnh' : 'Close gallery'}
          >
            <X className="h-5 w-5" />
          </button>
          {tourImages.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:left-6"
                aria-label={isVn ? 'Ảnh trước' : 'Previous image'}
                onClick={() => handleImageChange(activeImageIndex - 1)}
              >
                &#8249;
              </button>
              <button
                type="button"
                className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:right-6"
                aria-label={isVn ? 'Ảnh tiếp theo' : 'Next image'}
                onClick={() => handleImageChange(activeImageIndex + 1)}
              >
                &#8250;
              </button>
            </>
          )}
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3">
            <img
              src={tourImages[activeImageIndex]}
              alt={`${title} ${activeImageIndex + 1}`}
              className="max-h-[78vh] w-auto max-w-full rounded-[28px] object-contain shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            />
            <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm">
              {title} · {activeImageIndex + 1}/{tourImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
