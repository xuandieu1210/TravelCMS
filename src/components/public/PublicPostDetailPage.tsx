import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, Eye, PenSquare } from 'lucide-react';
import { Post } from '../../types';
import { apiClient } from '../../services/apiClient';
import { toSafePostHtml } from '../../utils/postContent';

type LangType = 'en' | 'vn';

interface PublicPostDetailPageProps {
  post: Post | null;
  posts?: Post[];
  postSlug: string;
  lang?: LangType;
  onBack: () => void;
  onBook: () => void;
  onViewed?: (post: Post) => void;
}

export const PublicPostDetailPage: React.FC<PublicPostDetailPageProps> = ({
  post,
  posts = [],
  postSlug,
  lang = 'en',
  onBack,
  onBook,
  onViewed,
}) => {
  const isVn = lang === 'vn';
  const [resolvedPost, setResolvedPost] = useState<Post | null>(post);
  const [isLoading, setIsLoading] = useState(!post);

  useEffect(() => {
    setResolvedPost(post);
    setIsLoading(!post);
  }, [post]);

  useEffect(() => {
    let active = true;

    const loadPost = async () => {
      if (!postSlug) {
        setResolvedPost(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const latestPost = await apiClient.getPublicNewsBySlug(postSlug).catch(() => null);
      if (!active) {
        return;
      }

      setResolvedPost(latestPost || post || null);
      setIsLoading(false);

      if (latestPost && onViewed) {
        onViewed(latestPost);
      }
    };

    loadPost();

    return () => {
      active = false;
    };
  }, [postSlug]);

  const displayTitle = useMemo(() => {
    if (!resolvedPost) return '';
    return isVn ? resolvedPost.title || resolvedPost.titleEn || '' : resolvedPost.titleEn || resolvedPost.title || '';
  }, [isVn, resolvedPost]);

  const displaySummary = useMemo(() => {
    if (!resolvedPost) return '';
    return isVn ? resolvedPost.summary || resolvedPost.summaryEn || '' : resolvedPost.summaryEn || resolvedPost.summary || '';
  }, [isVn, resolvedPost]);

  const displayContent = useMemo(() => {
    if (!resolvedPost) return '';
    return isVn ? resolvedPost.content || resolvedPost.contentEn || '' : resolvedPost.contentEn || resolvedPost.content || '';
  }, [isVn, resolvedPost]);

  const safeDisplayContent = useMemo(() => toSafePostHtml(displayContent), [displayContent]);

  const displayEyebrow = useMemo(() => {
    if (!resolvedPost) return '';
    return isVn ? resolvedPost.eyebrow || resolvedPost.eyebrowEn || '' : resolvedPost.eyebrowEn || resolvedPost.eyebrow || '';
  }, [isVn, resolvedPost]);

  const displayImageLabel = useMemo(() => {
    if (!resolvedPost) return '';
    return isVn ? resolvedPost.imageLabel || resolvedPost.imageLabelEn || '' : resolvedPost.imageLabelEn || resolvedPost.imageLabel || '';
  }, [isVn, resolvedPost]);

  const getPostTitle = (item: Post) => {
    return isVn ? item.title || item.titleEn || '' : item.titleEn || item.title || '';
  };

  const getPostSummary = (item: Post) => {
    return isVn ? item.summary || item.summaryEn || '' : item.summaryEn || item.summary || '';
  };

  const getPostEyebrow = (item: Post) => {
    return isVn ? item.eyebrow || item.eyebrowEn || item.category || '' : item.eyebrowEn || item.eyebrow || item.category || '';
  };

  const relatedPosts = useMemo(() => {
    const publishedPosts = posts.filter((item) => item.status === 'PUBLISHED');
    const remainingPosts = publishedPosts.filter((item) => item.slug !== resolvedPost?.slug);

    if (remainingPosts.length <= 5) {
      return remainingPosts;
    }

    const seedSource = resolvedPost?.slug || postSlug || 'botanica';
    const seededPosts = remainingPosts
      .map((item) => {
        const combined = `${seedSource}:${item.slug}`;
        let score = 0;
        for (let index = 0; index < combined.length; index += 1) {
          score = (score * 31 + combined.charCodeAt(index)) % 2147483647;
        }
        return { item, score };
      })
      .sort((left, right) => left.score - right.score)
      .slice(0, 5)
      .map(({ item }) => item);

    return seededPosts;
  }, [postSlug, posts, resolvedPost?.slug]);

  const handleOpenPost = (targetPost: Post) => {
    const params = new URLSearchParams();
    params.set('lang', lang);
    window.location.href = `/news/${encodeURIComponent(targetPost.slug)}?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4ecdf_0%,#f9f7f1_28%,#f7f3ea_100%)] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 pb-5 sm:pb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/90 px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{isVn ? 'Quay lại bài viết' : 'Back to stories'}</span>
        </button>

        <div className="text-right text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
          Botanica Garden Hoi An
        </div>
      </div>

      {isLoading ? (
        <div className="mx-auto max-w-4xl rounded-[32px] border border-stone-200 bg-white p-10 text-center shadow-[0_30px_90px_-30px_rgba(15,23,42,0.22)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            {isVn ? 'Đang tải bài viết' : 'Loading article'}
          </p>
        </div>
      ) : resolvedPost ? (
        <div className="mx-auto max-w-5xl space-y-8">
          <article className="overflow-hidden rounded-[36px] border border-stone-200 bg-white shadow-[0_30px_90px_-30px_rgba(15,23,42,0.22)]">
            <div className="relative h-[280px] bg-stone-100 sm:h-[360px] lg:h-[420px]">
              <img
                src={resolvedPost.thumbnail}
                alt={displayTitle}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
                <div className="max-w-3xl space-y-4 text-white">
                  <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm">
                    {displayEyebrow || resolvedPost.category}
                  </span>
                  <h1 className="font-serif text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                    {displayTitle}
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-white/90 sm:text-base">
                    {displaySummary}
                  </p>
                </div>
              </div>
            </div>

            {displayImageLabel && (
              <p className="px-6 pt-3 text-right text-[10px] font-medium italic text-stone-400 sm:px-8 lg:px-10">
                {displayImageLabel}
              </p>
            )}

            <div className="grid gap-8 px-6 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10 lg:py-10">
              <div>
                <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-stone-500 sm:text-sm">
                  <span className="inline-flex items-center gap-2 font-semibold text-stone-800">
                    <PenSquare className="h-4 w-4 text-emerald-700" />
                    {resolvedPost.author}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-emerald-700" />
                    {new Date(resolvedPost.publishedAt).toLocaleDateString(isVn ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Eye className="h-4 w-4 text-emerald-700" />
                    {`${(resolvedPost.viewCount || 0).toLocaleString()} ${isVn ? 'lượt đọc' : 'views'}`}
                  </span>
                </div>

                <div className="rounded-[28px] border-l-4 border-amber-600 bg-amber-50/80 p-5 text-sm italic leading-7 text-stone-700 sm:text-[15px]">
                  {displaySummary}
                </div>

                <div
                  className="post-rich-content mt-8 text-sm leading-8 text-stone-700 sm:text-[15px]"
                  dangerouslySetInnerHTML={{ __html: safeDisplayContent }}
                />
              </div>

              <aside className="self-start rounded-[28px] border border-stone-200 bg-[linear-gradient(180deg,#fff_0%,#f7f2e6_100%)] p-5 sm:p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">
                  {isVn ? 'Khám phá Botanica' : 'Explore Botanica'}
                </p>
                <h2 className="mt-2 font-serif text-2xl font-black leading-tight text-stone-900">
                  {isVn ? 'Muốn trải nghiệm workshop trực tiếp?' : 'Want to join a workshop in person?'}
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  {isVn
                    ? 'Quay lại danh sách workshop để chọn trải nghiệm phù hợp cho gia đình, bạn bè hoặc nhóm riêng của bạn.'
                    : 'Return to the workshop list and choose the right hands-on experience for your family, friends, or private group.'}
                </p>
                <button
                  type="button"
                  onClick={onBook}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  {isVn ? 'Xem workshop' : 'Explore workshops'}
                </button>
              </aside>
            </div>
          </article>

          {relatedPosts.length > 0 && (
            <section className="rounded-[36px] border border-stone-200 bg-white px-6 py-6 shadow-[0_30px_90px_-30px_rgba(15,23,42,0.18)] sm:px-8 sm:py-8 lg:px-10">
              <div className="mb-6 max-w-2xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">
                  {isVn ? 'Đọc tiếp' : 'More stories'}
                </p>
                <h2 className="mt-2 font-serif text-3xl font-black text-stone-900">
                  {isVn ? '5 bài viết khác bạn có thể muốn xem' : '5 more articles you may want to read'}
                </h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                {relatedPosts.map((item) => (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-[26px] border border-stone-200 bg-stone-50 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px_rgba(15,23,42,0.28)]"
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenPost(item)}
                      className="block w-full text-left"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-stone-200">
                        <img
                          src={item.thumbnail}
                          alt={getPostTitle(item)}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="space-y-3 p-4">
                        <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
                          {getPostEyebrow(item)}
                        </span>
                        <h3 className="font-serif text-lg font-black leading-snug text-stone-900 line-clamp-3">
                          {getPostTitle(item)}
                        </h3>
                        <p className="text-sm leading-6 text-stone-600 line-clamp-4">
                          {getPostSummary(item)}
                        </p>
                        <span className="inline-flex items-center text-sm font-bold text-emerald-800">
                          {isVn ? 'Xem chi tiết' : 'Read article'}
                        </span>
                      </div>
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-4xl rounded-[32px] border border-stone-200 bg-white p-10 text-center shadow-[0_30px_90px_-30px_rgba(15,23,42,0.22)]">
          <h1 className="font-serif text-3xl font-black text-stone-900">
            {isVn ? 'Không tìm thấy bài viết' : 'Article not found'}
          </h1>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            {isVn
              ? 'Bài viết này không còn hiển thị hoặc đường dẫn không hợp lệ.'
              : 'This article is no longer available or the link is invalid.'}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isVn ? 'Về trang bài viết' : 'Return to stories'}</span>
          </button>
        </div>
      )}
    </div>
  );
};