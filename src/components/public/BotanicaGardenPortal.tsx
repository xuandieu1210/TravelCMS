import React, { useState, useEffect, useMemo } from 'react';
import { Tour, CustomerFeedback, Banner, SiteConfig, Booking, Category, Post } from '../../types';
import { translationsData } from '../../data/translations';
import { apiClient } from '../../services/apiClient';
import { getPlainTextPostContent } from '../../utils/postContent';
import { QRCodeSVG } from 'qrcode.react';

type TourReviewSnippet = {
  id: string;
  name: string;
  location: string;
  comment: string;
  rating: number;
  avatar: string;
};

interface BotanicaGardenPortalProps {
  tours: Tour[];
  categories?: Category[];
  posts?: Post[];
  feedbacks: CustomerFeedback[];
  banners: Banner[];
  siteConfig: SiteConfig;
  onPostViewed?: (post: Post) => void;
  onSubmitBooking: (bookingPayload: {
    tourId?: string;
    tourName: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    pickupLocation?: string;
    paymentMethod: Booking['paymentMethod'];
    departureDate: string;
    preferredTimeSlot: NonNullable<Booking['preferredTimeSlot']>;
    numAdults: number;
    numChildren: number;
    notes?: string;
  }) => Promise<Booking | null>;
}

type LangType = 'en' | 'vn';

const isVideoMediaUrl = (value?: string | null) => {
  if (!value) {
    return false;
  }

  return /^(data:video\/)|\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(value);
};

export const BotanicaGardenPortal: React.FC<BotanicaGardenPortalProps> = ({
  tours,
  categories = [],
  posts = [],
  feedbacks,
  banners,
  siteConfig,
  onPostViewed,
  onSubmitBooking,
}) => {
  const [lang, setLang] = useState<LangType>('en');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedWorkshopIndex, setSelectedWorkshopIndex] = useState<number>(0);
  const [activeHeroIndex, setActiveHeroIndex] = useState<number>(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
  const [activeTourImageIndex, setActiveTourImageIndex] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const navigateToPostDetail = (post: Post) => {
    const params = new URLSearchParams();
    params.set('lang', lang);
    window.location.href = `/news/${encodeURIComponent(post.slug)}?${params.toString()}`;
  };

  const [formDate, setFormDate] = useState<string>('');
  const [formTimeSlot, setFormTimeSlot] = useState<Booking['preferredTimeSlot'] | ''>('');
  const [formAdults, setFormAdults] = useState<number>(2);
  const [formKids, setFormKids] = useState<number>(0);
  const [formName, setFormName] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPickupLocation, setFormPickupLocation] = useState<string>('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<Booking['paymentMethod']>('BANK_TRANSFER');
  const [formNote, setFormNote] = useState<string>('');
  const [bookingWebsite, setBookingWebsite] = useState<string>('');
  const [bookingStartedAt, setBookingStartedAt] = useState<number>(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string>('');

  const [latestMediaUrl, setLatestMediaUrl] = useState<string | null>(null);
  const displayAddress = lang === 'vn'
    ? (siteConfig.address || siteConfig.addressEn || '')
    : (siteConfig.addressEn || siteConfig.address || '');

  useEffect(() => {
    const fetchLatestMedia = async () => {
      try {
        setLatestMediaUrl(await apiClient.getPublicLatestMedia());
      } catch (err) {
        console.error('Error fetching media:', err);
      }
    };

    fetchLatestMedia();
  }, []);

  useEffect(() => {
    const requestedLang = new URLSearchParams(window.location.search).get('lang');
    if (requestedLang === 'vn' || requestedLang === 'en') {
      setLang(requestedLang);
    }
  }, []);

  const T = translationsData as Record<LangType, Record<string, string>>;
  const t = T[lang] || T.en;

  const workshopCategories = useMemo(() => {
    const list = (categories || []).filter((c) => c.isActive);
    return [...list].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [categories]);

  const publishedTours = useMemo(() => {
    return tours.filter((tour) => tour.status === 'PUBLISHED');
  }, [tours]);

  const publishedPosts = useMemo(() => {
    return (posts || []).filter((post) => post.status === 'PUBLISHED');
  }, [posts]);

  const storyCarouselPosts = useMemo(() => {
    return publishedPosts;
  }, [publishedPosts]);

  // Filtered by active tab from DB
  const filteredTours = useMemo(() => {
    if (activeCategory === 'all') return publishedTours;

    const currentCatObj = workshopCategories.find(
      (c) => c.slug === activeCategory || c.id === activeCategory
    );

    return publishedTours.filter((tour) => {
      // 1. Check exact match with Category from DB
      if (currentCatObj) {
        const catNameLower = currentCatObj.name.toLowerCase();
        const catNameEnLower = (currentCatObj.nameEn || '').toLowerCase();
        const tourCatLower = (tour.category || '').toLowerCase();

        if (
          tourCatLower === catNameLower ||
          (catNameEnLower && tourCatLower === catNameEnLower) ||
          tourCatLower === currentCatObj.slug.toLowerCase() ||
          tour.category === currentCatObj.name ||
          tour.category === currentCatObj.id ||
          tour.category === currentCatObj.code
        ) {
          return true;
        }

        if (
          tourCatLower.includes(catNameLower) ||
          (catNameEnLower && tourCatLower.includes(catNameEnLower)) ||
          catNameLower.includes(tourCatLower)
        ) {
          return true;
        }
      }

      // 2. Compatibility mapping for standard workshop slugs
      if (activeCategory === 'family-crafts' || activeCategory === 'family') {
        return (
          tour.workshopCat === 'family' ||
          tour.category?.toLowerCase().includes('gia đình') ||
          tour.category?.toLowerCase().includes('family') ||
          tour.category?.toLowerCase().includes('thủ công')
        );
      }
      if (activeCategory === 'culture-and-food' || activeCategory === 'culture') {
        return (
          tour.workshopCat === 'culture' ||
          tour.category?.toLowerCase().includes('văn hóa') ||
          tour.category?.toLowerCase().includes('ẩm thực') ||
          tour.category?.toLowerCase().includes('culture') ||
          tour.category?.toLowerCase().includes('food')
        );
      }
      if (activeCategory === 'coffee-and-wellness' || activeCategory === 'wellness') {
        return (
          tour.workshopCat === 'wellness' ||
          tour.category?.toLowerCase().includes('cà phê') ||
          tour.category?.toLowerCase().includes('thư giãn') ||
          tour.category?.toLowerCase().includes('wellness') ||
          tour.category?.toLowerCase().includes('thảo mộc')
        );
      }

      return false;
    });
  }, [publishedTours, activeCategory, workshopCategories]);

  const heroBanners = useMemo(() => {
    const activeHomeBanners = banners
      .filter((banner) => banner.position === 'HOME_HERO' && banner.isActive)
      .sort((left, right) => (left.order || 0) - (right.order || 0));

    if (activeHomeBanners.length > 0) {
      return activeHomeBanners;
    }

    return [...banners].sort((left, right) => (left.order || 0) - (right.order || 0));
  }, [banners]);

  const activeHeroBanner = heroBanners[activeHeroIndex] || heroBanners[0];
  const activeHeroIsVideo = isVideoMediaUrl(activeHeroBanner?.imageUrl);
  const activeStoryPost = storyCarouselPosts[activeStoryIndex] || storyCarouselPosts[0] || null;

  const sortedFeaturedFeedbacks = useMemo(() => {
    return feedbacks
      .filter((feedback) => feedback.isFeatured)
      .sort((left, right) => {
        const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
        const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
        return rightTime - leftTime;
      });
  }, [feedbacks]);

  const sortedRegularFeedbacks = useMemo(() => {
    return feedbacks
      .filter((feedback) => !feedback.isFeatured)
      .sort((left, right) => {
      const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
      return rightTime - leftTime;
      });
  }, [feedbacks]);

  const featuredReview = sortedFeaturedFeedbacks[0] || null;
  const reviewCards = sortedRegularFeedbacks.slice(0, 4);
  const selectedTour = publishedTours[selectedWorkshopIndex] || publishedTours[0] || null;
  const selectedTourImages = useMemo(() => {
    if (!selectedTour) {
      return [];
    }

    const mergedImages = [selectedTour.thumbnail, ...(selectedTour.album || [])].filter(Boolean);
    return [...new Set(mergedImages)];
  }, [selectedTour]);

  // Format price display
  const renderPrice = (w: Tour) => {
    const priceAmount = Number(w.pricing?.adultPrice || 0);
    if (priceAmount <= 0) {
      return <span className="price">{t.onreq}</span>;
    }
    const locale = lang === 'vn' ? 'vi-VN' : 'en-US';
    const n = `${priceAmount.toLocaleString(locale)}₫`;
    return (
      <span className="price">
        {n} <small>{t.per}</small>
      </span>
    );
  };

  // Get localized tour name & description
  const getTourTitle = (w: Tour) => {
    if (lang === 'vn') return w.name || w.nameEn || '';
    return w.nameEn || w.name || '';
  };

  const getBannerEyebrow = (banner: Banner | undefined) => {
    if (!banner) return '';
    if (lang === 'vn') return banner.badgeTextVn || banner.badgeText || banner.badgeTextEn || '';
    return banner.badgeTextEn || banner.badgeText || banner.badgeTextVn || '';
  };

  const getBannerTitle = (banner: Banner | undefined) => {
    if (!banner) return '';
    if (lang === 'vn') return banner.titleVn || banner.title || banner.titleEn || '';
    return banner.titleEn || banner.title || banner.titleVn || '';
  };

  const getBannerSubtitle = (banner: Banner | undefined) => {
    if (!banner) return '';
    if (lang === 'vn') return banner.subtitleVn || banner.subtitle || banner.subtitleEn || '';
    return banner.subtitleEn || banner.subtitle || banner.subtitleVn || '';
  };

  const getBannerButtonText = (banner: Banner | undefined) => {
    if (!banner) return '';
    if (lang === 'vn') return banner.buttonTextVn || banner.buttonText || banner.buttonTextEn || '';
    return banner.buttonTextEn || banner.buttonText || banner.buttonTextVn || '';
  };

  const getTourCategoryLabel = (w: Tour) => {
    const workshopCategorySlug = {
      family: 'family-crafts',
      culture: 'culture-and-food',
      wellness: 'coffee-and-wellness',
    }[w.workshopCat || ''];
    const matchedCategory = workshopCategories.find((category) => {
      const tourCategory = (w.category || '').toLowerCase();
      return (
        tourCategory === category.name.toLowerCase() ||
        tourCategory === (category.nameEn || '').toLowerCase() ||
        tourCategory === category.slug.toLowerCase() ||
        category.slug === workshopCategorySlug ||
        w.category === category.id ||
        w.category === category.code
      );
    });

    if (!matchedCategory) {
      return w.category;
    }

    return lang === 'vn'
      ? (matchedCategory.name || matchedCategory.nameEn || w.category)
      : (matchedCategory.nameEn || matchedCategory.name || w.category);
  };

  const getPostEyebrow = (post: Post | null) => {
    if (!post) return '';
    if (lang === 'vn') return post.eyebrow || post.eyebrowEn || '';
    return post.eyebrowEn || post.eyebrow || '';
  };

  const getPostTitle = (post: Post | null) => {
    if (!post) return '';
    if (lang === 'vn') return post.title || post.titleEn || '';
    return post.titleEn || post.title || '';
  };

  const getPostSummary = (post: Post | null) => {
    if (!post) return '';
    if (lang === 'vn') return post.summary || post.summaryEn || '';
    return post.summaryEn || post.summary || '';
  };

  const getPostContent = (post: Post | null) => {
    if (!post) return '';
    if (lang === 'vn') return post.content || post.contentEn || '';
    return post.contentEn || post.content || '';
  };

  const getPostImageLabel = (post: Post | null) => {
    if (!post) return '';
    if (lang === 'vn') return post.imageLabel || post.imageLabelEn || '';
    return post.imageLabelEn || post.imageLabel || '';
  };

  const getPostLeadParagraphs = (post: Post | null) => {
    if (!post) return [];

    const content = getPlainTextPostContent(getPostContent(post));
    const summary = getPostSummary(post);
    const paragraphs = (content || summary)
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    if (paragraphs.length > 0) {
      return paragraphs.slice(0, 2);
    }

    return summary ? [summary] : [];
  };

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

  const getTourReviewSnippets = (tour: Tour | null): TourReviewSnippet[] => {
    const rankedFeedbacks = feedbacks
      .map((feedback) => {
        if (!tour) {
          return { feedback, score: feedback.isFeatured ? 2 : 1 };
        }

        const titleTokens = [
          getTourTitle(tour),
          tour.name,
          tour.nameEn || '',
          tour.category || '',
          tour.workshopCat || '',
        ]
          .map(normalizeText)
          .filter(Boolean);

        const feedbackTour = normalizeText(feedback.tourName || '');
        let score = feedback.isFeatured ? 2 : 0;

        if (titleTokens.some((token) => token && (feedbackTour.includes(token) || token.includes(feedbackTour)))) {
          score += 5;
        }

        if (tour.workshopCat && feedbackTour.includes(normalizeText(tour.workshopCat))) {
          score += 2;
        }

        return { feedback, score };
      })
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score || right.feedback.rating - left.feedback.rating)
      .slice(0, 3)
      .map(({ feedback }) => ({
        id: feedback.id,
        name: getFeedbackCustomerName(feedback),
        location: feedback.location,
        comment: getFeedbackComment(feedback),
        rating: feedback.rating,
        avatar: feedback.avatar,
      }));

    return rankedFeedbacks;
  };

  const getTourDesc = (w: Tour) => {
    if (lang === 'vn') return w.description || w.descriptionEn || '';
    return w.descriptionEn || w.description || '';
  };

  // Open modal with specific workshop
  const handleOpenModal = (index?: number) => {
    if (index !== undefined) {
      setSelectedWorkshopIndex(index);
    } else {
      setSelectedWorkshopIndex(0);
    }
    setIsSubmitted(false);
    setConfirmedBooking(null);
    setFormPaymentMethod('BANK_TRANSFER');
    setFormDate('');
    setFormTimeSlot('');
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
  };

  const navigateToTourDetail = (tour: Tour) => {
    const params = new URLSearchParams();
    params.set('lang', lang);
    window.location.href = `/workshops/${encodeURIComponent(tour.slug)}?${params.toString()}`;
  };

  const handleTourImageChange = (nextIndex: number) => {
    if (selectedTourImages.length === 0) {
      return;
    }

    const normalizedIndex = (nextIndex + selectedTourImages.length) % selectedTourImages.length;
    setActiveTourImageIndex(normalizedIndex);
  };

  // Submit booking form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    if (bookingWebsite.trim()) {
      setBookingError(lang === 'vn' ? 'Yêu cầu không hợp lệ.' : 'Invalid request.');
      return;
    }

    if (Date.now() - bookingStartedAt < 4000) {
      setBookingError(lang === 'vn' ? 'Bạn thao tác quá nhanh. Vui lòng kiểm tra lại thông tin và thử lại sau vài giây.' : 'That was submitted too quickly. Please review your details and try again in a few seconds.');
      return;
    }

      if (!formEmail.trim()) {
        setBookingError(lang === 'vn' ? 'Vui lòng nhập email để nhận mã đặt lớp và xác nhận thanh toán.' : 'Please enter your email to receive the booking code and payment confirmation.');
        return;
      }

      if (!formDate || !formTimeSlot) {
        setBookingError(lang === 'vn' ? 'Vui lòng chọn ngày và buổi tham gia.' : 'Please select a date and time slot.');
        return;
      }

    const bookingThrottleKey = `botanica-booking-${selectedTour?.slug || 'general'}`;
    const lastSubmittedAt = Number(window.localStorage.getItem(bookingThrottleKey) || 0);
    if (lastSubmittedAt && Date.now() - lastSubmittedAt < 5 * 60 * 1000) {
      setBookingError(lang === 'vn' ? 'Bạn vừa gửi yêu cầu gần đây. Vui lòng thử lại sau ít phút.' : 'You submitted a request recently. Please wait a few minutes before trying again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save booking directly into database
      const createdBooking = await onSubmitBooking({
        tourId: selectedTour?.id,
        tourName: selectedTour ? `${selectedTour.name} (${selectedTour.nameEn || ''})` : 'Botanica Workshop',
        customerName: formName.trim() || 'Botanica Guest',
        customerPhone: formPhone.trim(),
        customerEmail: formEmail.trim(),
        pickupLocation: formPickupLocation.trim(),
        paymentMethod: formPaymentMethod,
        departureDate: formDate,
        preferredTimeSlot: formTimeSlot,
        numAdults: formAdults || 1,
        numChildren: formKids || 0,
        notes: formNote.trim(),
        website: bookingWebsite.trim(),
        startedAt: new Date(bookingStartedAt).toISOString(),
      });

      setConfirmedBooking(createdBooking);

      window.localStorage.setItem(bookingThrottleKey, String(Date.now()));

      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting booking', err);
      setBookingError(err instanceof Error ? err.message : (lang === 'vn' ? 'Không thể gửi yêu cầu đặt lớp lúc này.' : 'Could not submit your booking request right now.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scroll reveal effect
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filteredTours, feedbacks, lang]);

  useEffect(() => {
    if (heroBanners.length === 0) {
      setActiveHeroIndex(0);
      return;
    }

    setActiveHeroIndex((currentIndex) => Math.min(currentIndex, heroBanners.length - 1));
  }, [heroBanners]);

  useEffect(() => {
    if (heroBanners.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveHeroIndex((currentIndex) => (currentIndex + 1) % heroBanners.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [heroBanners]);

  useEffect(() => {
    if (storyCarouselPosts.length === 0) {
      setActiveStoryIndex(0);
      return;
    }

    setActiveStoryIndex((currentIndex) => Math.min(currentIndex, storyCarouselPosts.length - 1));
  }, [storyCarouselPosts]);

  useEffect(() => {
    if (storyCarouselPosts.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveStoryIndex((currentIndex) => (currentIndex + 1) % storyCarouselPosts.length);
    }, 6500);

    return () => window.clearInterval(intervalId);
  }, [storyCarouselPosts]);

  useEffect(() => {
    setActiveTourImageIndex(0);
  }, [selectedWorkshopIndex, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    setBookingStartedAt(Date.now());
    setBookingWebsite('');
    setBookingError('');
  }, [isModalOpen, selectedWorkshopIndex]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedSlug = params.get('bookTour');
    if (!requestedSlug || publishedTours.length === 0) {
      return;
    }

    const nextIndex = publishedTours.findIndex((tour) => tour.slug === requestedSlug);
    if (nextIndex >= 0) {
      handleOpenModal(nextIndex);
    }

    params.delete('bookTour');
    const nextSearch = params.toString();
    const nextHash = window.location.hash || '#workshops';
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${nextHash}`;
    window.history.replaceState({}, '', nextUrl);
  }, [publishedTours]);

  const handleHeroSlideChange = (nextIndex: number) => {
    if (heroBanners.length === 0) {
      return;
    }

    const normalizedIndex = (nextIndex + heroBanners.length) % heroBanners.length;
    setActiveHeroIndex(normalizedIndex);
  };

  const handleStorySlideChange = (nextIndex: number) => {
    if (storyCarouselPosts.length === 0) {
      return;
    }

    const normalizedIndex = (nextIndex + storyCarouselPosts.length) % storyCarouselPosts.length;
    setActiveStoryIndex(normalizedIndex);
  };

  return (
    <div className="botanica-page-wrap">
      {/* NAV */}
      <header>
        <nav>
          <a href="#top" className="brand">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="23" stroke="currentColor" strokeWidth="1.6" opacity=".4" />
              <path d="M24 38c0-8-6-12-12-13 6-1 12 1 12 9zM24 38c0-9 6-13 12-14-6-1-12 2-12 10zM24 38V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Botanica Garden
          </a>

          <div className="navlinks">
            <a href="#workshops">{t.nav_workshops}</a>
            <a href="#how">{t.nav_how}</a>
            <a href="#reviews">{t.nav_reviews}</a>
            <a href="#visit">{t.nav_visit}</a>
          </div>

          <div className="nav-right">
            <div className="lang">
              <button
                type="button"
                className={lang === 'en' ? 'active' : ''}
                onClick={() => setLang('en')}
              >
                EN
              </button>
              <button
                type="button"
                className={lang === 'vn' ? 'active' : ''}
                onClick={() => setLang('vn')}
              >
                VN
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary nav-cta"
              onClick={() => handleOpenModal()}
            >
              {t.nav_book}
            </button>

          </div>
        </nav>
      </header>

      {/* HERO */}
      <section
        className="hero"
        id="top"
        style={{
          backgroundImage: activeHeroBanner?.imageUrl && !activeHeroIsVideo ? `url('${activeHeroBanner.imageUrl}')` : 'none',
        }}
      >
        {activeHeroIsVideo && activeHeroBanner?.imageUrl && (
          <div className="hero-media" aria-hidden="true">
            <video
              key={`${activeHeroBanner.id}-${activeHeroBanner.imageUrl}`}
              className="hero-media-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src={activeHeroBanner.imageUrl} />
            </video>
          </div>
        )}

        {heroBanners.length > 1 && (
          <>
            <div className="hero-nav">
              <button
                type="button"
                className="hero-nav-btn"
                aria-label={lang === 'vn' ? 'Ảnh trước' : 'Previous image'}
                onClick={() => handleHeroSlideChange(activeHeroIndex - 1)}
              >
                &#8249;
              </button>
              <button
                type="button"
                className="hero-nav-btn"
                aria-label={lang === 'vn' ? 'Ảnh tiếp theo' : 'Next image'}
                onClick={() => handleHeroSlideChange(activeHeroIndex + 1)}
              >
                &#8250;
              </button>
            </div>

            <div className="hero-dots" aria-label={lang === 'vn' ? 'Chọn ảnh bìa' : 'Select cover image'}>
              {heroBanners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  className={index === activeHeroIndex ? 'active' : ''}
                  aria-label={`${lang === 'vn' ? 'Ảnh bìa' : 'Cover image'} ${index + 1}`}
                  onClick={() => handleHeroSlideChange(index)}
                />
              ))}
            </div>
          </>
        )}

        <div className="hero-inner">
          {getBannerEyebrow(activeHeroBanner) && <span className="eyebrow">{getBannerEyebrow(activeHeroBanner)}</span>}
          {getBannerTitle(activeHeroBanner) && <h1>{getBannerTitle(activeHeroBanner)}</h1>}
          {getBannerSubtitle(activeHeroBanner) && <p className="lead">{getBannerSubtitle(activeHeroBanner)}</p>}

          <div className="hero-cta">
            {getBannerButtonText(activeHeroBanner) && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleOpenModal()}
              >
                {getBannerButtonText(activeHeroBanner)}
              </button>
            )}
            <a
              href="#workshops"
              className="btn btn-ghost"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,.6)' }}
            >
              {lang === 'vn' ? `Xem cả ${publishedTours.length} lớp` : `See all ${publishedTours.length}`}
            </a>
          </div>

          <div className="trust">
            <span>{t.trust1}</span>
            <span>{t.trust2}</span>
            <span>{t.trust3}</span>
            <span>{t.trust4}</span>
          </div>
        </div>
      </section>

      {storyCarouselPosts.length > 0 && (
        <section id="stories" className="stories">
          <div className="wrap">
            <div className="story-slider reveal">
              <div className="story-slider-copy">
                <span className="eyebrow">{getPostEyebrow(activeStoryPost) || activeStoryPost?.category}</span>
                <h2>
                  <button
                    type="button"
                    className="story-slider-title"
                    onClick={() => activeStoryPost && navigateToPostDetail(activeStoryPost)}
                  >
                    {getPostTitle(activeStoryPost)}
                  </button>
                </h2>

                {getPostLeadParagraphs(activeStoryPost).map((paragraph, idx) => (
                  <p key={`${activeStoryPost?.id || 'story'}-${idx}`}>{paragraph}</p>
                ))}

                <div className="story-slider-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => activeStoryPost && navigateToPostDetail(activeStoryPost)}
                  >
                    {t.read_more}
                  </button>

                  {storyCarouselPosts.length > 1 && (
                    <div className="story-slider-dots" aria-label={lang === 'vn' ? 'Chọn bài viết' : 'Select article'}>
                      {storyCarouselPosts.map((post, index) => (
                        <button
                          key={post.id}
                          type="button"
                          className={index === activeStoryIndex ? 'active' : ''}
                          aria-label={`${lang === 'vn' ? 'Bài viết' : 'Article'} ${index + 1}`}
                          onClick={() => handleStorySlideChange(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`story-slider-media ${activeStoryPost ? 'clickable-panel' : ''}`}
                onClick={activeStoryPost ? () => navigateToPostDetail(activeStoryPost) : undefined}
                onKeyDown={activeStoryPost ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigateToPostDetail(activeStoryPost);
                  }
                } : undefined}
                role={activeStoryPost ? 'button' : undefined}
                tabIndex={activeStoryPost ? 0 : undefined}
                aria-label={activeStoryPost ? (lang === 'vn' ? 'Xem chi tiết bài viết' : 'View article details') : undefined}
              >
                {storyCarouselPosts.length > 1 && (
                  <div className="story-slider-nav">
                    <button
                      type="button"
                      className="story-slider-nav-btn"
                      aria-label={lang === 'vn' ? 'Bài trước' : 'Previous article'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStorySlideChange(activeStoryIndex - 1);
                      }}
                    >
                      &#8249;
                    </button>
                    <button
                      type="button"
                      className="story-slider-nav-btn"
                      aria-label={lang === 'vn' ? 'Bài tiếp theo' : 'Next article'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStorySlideChange(activeStoryIndex + 1);
                      }}
                    >
                      &#8250;
                    </button>
                  </div>
                )}

                <img
                  src={activeStoryPost?.thumbnail || '/images/img_1.jpeg'}
                  alt={getPostTitle(activeStoryPost)}
                  loading="lazy"
                />

                {getPostImageLabel(activeStoryPost) && (
                  <div className="story-slider-tag">{getPostImageLabel(activeStoryPost)}</div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* INCLUDES */}
      <section className="includes">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">{t.inc_eyebrow}</span>
            <h2>{t.inc_title}</h2>
          </div>
          <div className="inc-grid">
            <div className="inc reveal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M18 8h1a3 3 0 0 1 0 6h-1M4 8h14v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>{t.inc1_t}</h3>
              <p>{t.inc1_p}</p>
            </div>

            <div className="inc reveal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>{t.inc2_t}</h3>
              <p>{t.inc2_p}</p>
            </div>

            <div className="inc reveal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M20 8H4v12h16V8zM2 8l2-4h16l2 4M12 4v16M8 12h.01M16 12h.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>{t.inc3_t}</h3>
              <p>{t.inc3_p}</p>
            </div>

            <div className="inc reveal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" strokeLinecap="round" />
              </svg>
              <h3>{t.inc4_t}</h3>
              <p>{t.inc4_p}</p>
            </div>

            <div className="inc reveal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>{t.inc5_t}</h3>
              <p>{t.inc5_p}</p>
            </div>
          </div>
          <p
            className="anchor-note reveal"
            dangerouslySetInnerHTML={{ __html: t.inc_anchor }}
          />
        </div>
      </section>

      {/* WORKSHOPS */}
      <section id="workshops">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">
              {lang === 'vn'
                ? `${publishedTours.length} trải nghiệm tự tay sáng tạo`
                : `${publishedTours.length} hands-on experiences`}
            </span>
            <h2>{t.ws_title}</h2>
            <p>{t.ws_sub}</p>
          </div>

          <div className="filters" id="filters">
            {/* 1. All / Tất cả */}
            <button
              type="button"
              className={activeCategory === 'all' ? 'active' : ''}
              onClick={() => setActiveCategory('all')}
            >
              {lang === 'vn' ? 'Tất cả' : 'All'}
            </button>

            {/* 2. Danh sách các danh mục hiển thị trực tiếp từ Database */}
            {workshopCategories.map((cat) => {
              const catKey = cat.slug || cat.id;
              const label = lang === 'vn' ? (cat.name || cat.nameEn) : (cat.nameEn || cat.name);
              return (
                <button
                  key={cat.id || cat.slug}
                  type="button"
                  className={activeCategory === catKey ? 'active' : ''}
                  onClick={() => setActiveCategory(catKey)}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="cards" id="cards">
            {filteredTours.map((w) => {
              const fullIdx = publishedTours.indexOf(w);
              const title = getTourTitle(w);
              const desc = getTourDesc(w);
              const categoryLabel = getTourCategoryLabel(w);
              const hasImg = w.thumbnail && !w.thumbnail.startsWith('{{');

              return (
                <div key={w.id} className="card">
                  <div
                    className={`card-media ${!hasImg ? 'motif' : ''} ${hasImg ? 'clickable-panel' : ''}`}
                    onClick={() => navigateToTourDetail(w)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigateToTourDetail(w);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${lang === 'vn' ? 'Xem chi tiết lớp' : 'View workshop details'} ${title}`}
                  >
                    {hasImg ? (
                      <img src={w.thumbnail} alt={title} loading="lazy" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <path d="M11 21C5 21 3 16 3 11 3 6 7 3 13 3c4 0 8 1 8 1s0 4-1 8c-1.6 6.4-6 9-9 9z" strokeLinejoin="round" />
                        <path d="M16 8C12 11 9 15 7 20" strokeLinecap="round" />
                      </svg>
                    )}

                    {w.ageGroup === 'adult' ? (
                      <span className="badge adult">{t.adultonly}</span>
                    ) : (
                      <span className="badge">{t.ages}</span>
                    )}
                    <span className="badge" style={{ marginInlineStart: '8px' }}>{categoryLabel}</span>
                  </div>

                  <div className="card-body">
                    <h3>
                      <button
                        type="button"
                        className="card-link"
                        onClick={() => navigateToTourDetail(w)}
                      >
                        {title}
                      </button>
                    </h3>
                    <p>{desc}</p>
                    <div className="card-foot">
                      {renderPrice(w)}
                      <div className="card-actions">
                        <button
                          type="button"
                          className="detail-link"
                          onClick={() => navigateToTourDetail(w)}
                        >
                          {lang === 'vn' ? 'Xem chi tiết' : 'View details'}
                        </button>
                        <button
                          type="button"
                          className="req"
                          onClick={() => handleOpenModal(fullIdx >= 0 ? fullIdx : 0)}
                        >
                          {t.req}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="how" id="how">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">{t.how_eyebrow}</span>
            <h2>{t.how_title}</h2>
          </div>
          <div className="steps">
            <div className="step reveal">
              <h3>{t.how1_t}</h3>
              <p>{t.how1_p}</p>
            </div>
            <div className="step reveal">
              <h3>{t.how2_t}</h3>
              <p>{t.how2_p}</p>
            </div>
            <div className="step reveal">
              <h3>{t.how3_t}</h3>
              <p>{t.how3_p}</p>
            </div>
          </div>
          <div style={{ marginTop: '46px' }} className="reveal">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleOpenModal()}
            >
              {t.how_cta}
            </button>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="reviews" id="reviews">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">{t.rev_eyebrow}</span>
            <h2>{t.rev_title}</h2>
          </div>
          <div className="rev-grid">
            {reviewCards.map((fb) => (
              <div key={fb.id} className="rev reveal">
                <div className="stars">{'★'.repeat(fb.rating || 5)}</div>
                <q>{getFeedbackComment(fb)}</q>
                <cite>— {getFeedbackCustomerName(fb)}</cite>
              </div>
            ))}
            {featuredReview && (
              <div className="rev rev-feature reveal">
                <q>{getFeedbackComment(featuredReview)}</q>
                <cite>— {getFeedbackCustomerName(featuredReview)}</cite>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* VISIT */}
      <section className="visit" id="visit">
        <div className="wrap visit-grid">
          <div className="reveal">
            <span className="eyebrow">{t.visit_eyebrow}</span>
            <h2>{t.visit_title}</h2>
            <p>{t.visit_p1}</p>
            <p>{t.visit_p2}</p>
            <div className="addr">{displayAddress}</div>

            <div className="visit-actions">
              <a
                className="chip"
                id="mapChip"
                href={siteConfig.maps}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                <span>{t.visit_dir}</span>
              </a>

              <a
                className="chip"
                id="waChip"
                href={`https://wa.me/${siteConfig.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1.1.1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.1.1.3 0 .5l-.4.5c-.1.2-.3.3-.1.6.1.2.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.6-.1 1.1z" />
                </svg>
                <span>{t.visit_wa}</span>
              </a>

              <a
                className="chip"
                id="igChip"
                href={`https://instagram.com/${siteConfig.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
                <span>Instagram</span>
              </a>

              <a
                className="chip"
                id="fbChip"
                href={siteConfig.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
                </svg>
                <span>Facebook</span>
              </a>
            </div>
          </div>

          <div className="visit-img reveal">
            {latestMediaUrl || siteConfig.visitImage ? (
              <img
                src={latestMediaUrl || siteConfig.visitImage}
                alt="Happy guests with their Botanica Garden gift boxes"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-80 bg-stone-100 rounded-2xl flex flex-col items-center justify-center text-stone-400 p-6 text-center border border-dashed border-stone-300">
                <svg className="w-10 h-10 mb-2 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-bold text-stone-600">Thư viện media chưa có hình ảnh</span>
                <span className="text-[11px] text-stone-400 mt-0.5">Vui lòng tải lên ảnh mới trong Quản Lý Media để hiển thị ở đây.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div className="foot-brand">
                <svg viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="23" stroke="currentColor" strokeWidth="1.6" opacity=".4" />
                  <path d="M24 38c0-8-6-12-12-13 6-1 12 1 12 9zM24 38c0-9 6-13 12-14-6-1-12 2-12 10zM24 38V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Botanica Garden
              </div>
              <p>{t.foot_tag}</p>
            </div>

            <div>
              <h4>{t.foot_visit_t}</h4>
              <p dangerouslySetInnerHTML={{ __html: displayAddress.replace(',', ',<br>') }} />
              <a
                id="mapFoot"
                href={siteConfig.maps}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.foot_dir}
              </a>
              <p>{t.foot_hours}</p>
            </div>

            <div>
              <h4>{t.foot_contact_t}</h4>
              <a id="telFoot" href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}>
                {siteConfig.phone}
              </a>
              <a
                id="igFoot"
                href={`https://instagram.com/${siteConfig.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
              <a
                id="fbFoot"
                href={siteConfig.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
              <button
                type="button"
                onClick={() => handleOpenModal()}
                style={{
                  cursor: 'pointer',
                  color: 'var(--terra-soft)',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  textAlign: 'left',
                }}
              >
                {t.foot_book}
              </button>
            </div>
          </div>

          <div className="foot-bottom">
            <span>© 2026 Botanica Garden Hoi An · Emic Travel Eco Tour</span>
            <span>{t.foot_made}</span>
          </div>
        </div>
      </footer>

      {/* MODAL */}
      <div className={`modal ${isModalOpen ? 'open' : ''}`} id="modal">
        <div className="modal-bg" onClick={handleCloseModal} />
        <div className="modal-card">
          <button
            type="button"
            className="modal-close"
            onClick={handleCloseModal}
          >
            &times;
          </button>

          {selectedTour && selectedTourImages.length > 0 && (
            <div className="modal-gallery">
              <div className="modal-gallery-main">
                <img
                  src={selectedTourImages[activeTourImageIndex]}
                  alt={getTourTitle(selectedTour)}
                />
                {selectedTourImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="modal-gallery-nav prev"
                      aria-label={lang === 'vn' ? 'Ảnh trước' : 'Previous image'}
                      onClick={() => handleTourImageChange(activeTourImageIndex - 1)}
                    >
                      &#8249;
                    </button>
                    <button
                      type="button"
                      className="modal-gallery-nav next"
                      aria-label={lang === 'vn' ? 'Ảnh tiếp theo' : 'Next image'}
                      onClick={() => handleTourImageChange(activeTourImageIndex + 1)}
                    >
                      &#8250;
                    </button>
                    <div className="modal-gallery-count">
                      {activeTourImageIndex + 1}/{selectedTourImages.length}
                    </div>
                  </>
                )}
              </div>

              {selectedTourImages.length > 1 && (
                <div className="modal-gallery-strip">
                  {selectedTourImages.map((imageUrl, index) => (
                    <button
                      key={`${selectedTour.id}-${index}`}
                      type="button"
                      className={index === activeTourImageIndex ? 'active' : ''}
                      aria-label={`${lang === 'vn' ? 'Xem ảnh tour' : 'View tour image'} ${index + 1}`}
                      onClick={() => handleTourImageChange(index)}
                    >
                      <img src={imageUrl} alt={`${getTourTitle(selectedTour)} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="modal-head">
            <h3>{t.m_title}</h3>
            <p>{t.m_sub}</p>
          </div>

          {!isSubmitted ? (
            <form id="bookForm" onSubmit={handleFormSubmit} autoComplete="off">
              <div className="field">
                <label>{t.m_workshop}</label>
                <select
                  id="f_ws"
                  value={selectedWorkshopIndex}
                  onChange={(e) => setSelectedWorkshopIndex(parseInt(e.target.value, 10))}
                >
                  {publishedTours.map((w, idx) => (
                    <option key={w.id} value={idx}>
                      {getTourTitle(w)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>{t.m_date}</label>
                <input
                  type="date"
                  id="f_date"
                  required
                  min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)}
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>

              <fieldset className="field">
                <legend className="mb-1 text-xs font-semibold text-stone-700">{lang === 'vn' ? 'Buổi tham gia' : 'Preferred session'}</legend>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ['MORNING', lang === 'vn' ? 'Buổi sáng' : 'Morning', '08:00 - 12:00'],
                    ['AFTERNOON', lang === 'vn' ? 'Buổi chiều' : 'Afternoon', '13:00 - 17:00'],
                  ] as const).map(([slot, label, hours]) => (
                    <label key={slot} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${formTimeSlot === slot ? 'border-emerald-600 bg-emerald-50' : 'border-stone-200 bg-white hover:border-emerald-300'}`}>
                      <input
                        type="radio"
                        name="preferredTimeSlot"
                        value={slot}
                        required
                        checked={formTimeSlot === slot}
                        onChange={() => setFormTimeSlot(slot)}
                        className="!h-4 !w-4 !shrink-0 !p-0 accent-emerald-700"
                      />
                      <span>
                        <strong className="block text-xs text-stone-900">{label}</strong>
                        <small className="text-[11px] text-stone-500">{hours}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="field row">
                <div className="field">
                  <label>{t.m_adults}</label>
                  <input
                    type="number"
                    id="f_adults"
                    min="1"
                    value={formAdults}
                    onChange={(e) => setFormAdults(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
                <div className="field">
                  <label>{t.m_kids}</label>
                  <input
                    type="number"
                    id="f_kids"
                    min="0"
                    value={formKids}
                    onChange={(e) => setFormKids(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              </div>

              <div className="field">
                <label>{t.m_name}</label>
                <input
                  type="text"
                  id="f_name"
                  required
                  placeholder={lang === 'vn' ? 'Họ và tên của bạn' : 'Your name'}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="field row">
                <div className="field">
                  <label>{t.m_phone}</label>
                  <input
                    type="tel"
                    id="f_phone"
                    required
                    placeholder={lang === 'vn' ? 'Ví dụ: 0905 123 456' : 'e.g. +84 905 123 456'}
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>{t.m_email} *</label>
                  <input
                    type="email"
                    id="f_email"
                    required
                    placeholder={lang === 'vn' ? 'tenban@email.com' : 'your@email.com'}
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                  <small>{lang === 'vn' ? 'Bắt buộc để hệ thống gửi mã đặt lớp và email xác nhận.' : 'Required so the system can send your booking code and confirmation email.'}</small>
                </div>
              </div>

                <div className="field">
                  <label>{lang === 'vn' ? 'Địa điểm đón khách' : 'Pickup location'}</label>
                  <input
                    type="text"
                    id="f_pickup_location"
                    placeholder={lang === 'vn' ? 'Ví dụ: Khách sạn, homestay hoặc địa chỉ đón' : 'e.g. hotel, homestay, or pickup address'}
                    value={formPickupLocation}
                    onChange={(e) => setFormPickupLocation(e.target.value)}
                  />
                </div>

              <div className="field">
                <label>{lang === 'vn' ? 'Phương thức thanh toán' : 'Payment method'}</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${formPaymentMethod === 'BANK_TRANSFER' ? 'border-emerald-600 bg-emerald-50' : 'border-stone-200 bg-white hover:border-emerald-300'}`}>
                    <input
                      type="radio"
                      name="bookingPaymentMethod"
                      value="BANK_TRANSFER"
                      checked={formPaymentMethod === 'BANK_TRANSFER'}
                      onChange={() => setFormPaymentMethod('BANK_TRANSFER')}
                      className="mt-1 !h-4 !w-4 !shrink-0 !p-0 accent-emerald-700"
                    />
                    <span>
                      <strong className="block text-xs text-stone-900">{lang === 'vn' ? 'Thanh toán ngay bằng QR' : 'Pay now by QR'}</strong>
                      <small className="mt-1 block text-[11px] leading-5 text-stone-600">{lang === 'vn' ? 'Quét mã QR chuyển khoản sau khi đặt.' : 'Scan a transfer QR after booking.'}</small>
                    </span>
                  </label>
                  <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${formPaymentMethod === 'CASH' ? 'border-emerald-600 bg-emerald-50' : 'border-stone-200 bg-white hover:border-emerald-300'}`}>
                    <input
                      type="radio"
                      name="bookingPaymentMethod"
                      value="CASH"
                      checked={formPaymentMethod === 'CASH'}
                      onChange={() => setFormPaymentMethod('CASH')}
                      className="mt-1 !h-4 !w-4 !shrink-0 !p-0 accent-emerald-700"
                    />
                    <span>
                      <strong className="block text-xs text-stone-900">{lang === 'vn' ? 'Thanh toán khi đến' : 'Pay on arrival'}</strong>
                      <small className="mt-1 block text-[11px] leading-5 text-stone-600">{lang === 'vn' ? 'Thanh toán cho nhân viên tại Botanica Garden.' : 'Pay the staff at Botanica Garden.'}</small>
                    </span>
                  </label>
                </div>
              </div>

              <div className="field" aria-hidden="true" style={{ display: 'none' }}>
                <label htmlFor="f_website">Website</label>
                <input
                  type="text"
                  id="f_website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={bookingWebsite}
                  onChange={(e) => setBookingWebsite(e.target.value)}
                />
              </div>

              <div className="field">
                <label>{t.m_note}</label>
                <textarea
                  id="f_note"
                  placeholder={lang === 'vn' ? 'Yêu cầu đặc biệt hoặc ghi chú...' : 'Special requests or preferences...'}
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                />
              </div>

              {bookingError && (
                <div className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {bookingError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary form-submit"
              >
                {isSubmitting ? (lang === 'vn' ? 'Đang lưu...' : 'Processing...') : t.m_submit}
              </button>
            </form>
          ) : (
            <div className="send-options send-options--compact show" id="sendOptions">
              <div className="booking-success-notice mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold">
                ✓ {lang === 'vn' ? 'Yêu cầu đặt lớp đã được lưu tự động vào hệ thống!' : 'Your workshop request has been automatically registered in our database!'}
              </div>

              {confirmedBooking && (
                <div className="booking-success-card mb-4 space-y-3 rounded-2xl border border-emerald-200 bg-white p-4 text-left shadow-sm">
                  <div className="booking-success-card__header flex items-center justify-between gap-3 border-b border-emerald-100 pb-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                        {lang === 'vn' ? 'Mã đơn hàng' : 'Booking code'}
                      </p>
                      <p className="font-mono text-sm font-black text-stone-900">{confirmedBooking.bookingCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">
                        {lang === 'vn' ? 'Tổng thanh toán' : 'Amount due'}
                      </p>
                      <p className="text-base font-black text-emerald-900">
                        {confirmedBooking.finalAmount.toLocaleString(lang === 'vn' ? 'vi-VN' : 'en-US')}đ
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-stone-700">
                    <span className="font-semibold text-stone-500">{lang === 'vn' ? 'Ngày và buổi tham gia: ' : 'Preferred date and session: '}</span>
                    <span>{confirmedBooking.departureDate} · {confirmedBooking.preferredTimeSlot === 'AFTERNOON' ? (lang === 'vn' ? 'Buổi chiều' : 'Afternoon') : (lang === 'vn' ? 'Buổi sáng' : 'Morning')}</span>
                  </div>

                  {confirmedBooking.paymentMethod === 'CASH' ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-6 text-emerald-900">
                      <p className="font-bold">{lang === 'vn' ? 'Bạn đã chọn thanh toán khi đến.' : 'You chose to pay on arrival.'}</p>
                      <p>{lang === 'vn'
                        ? `Thông tin đặt lớp đã được lưu. Khi đến Botanica Garden, vui lòng cung cấp mã ${confirmedBooking.bookingCode} cho nhân viên; nhân viên sẽ cập nhật đơn đã thanh toán sau khi nhận tiền.`
                        : `Your booking is saved. When you arrive at Botanica Garden, give booking code ${confirmedBooking.bookingCode} to the staff. They will mark it as paid after receiving payment.`}</p>
                    </div>
                  ) : confirmedBooking.paymentQrCode || confirmedBooking.paymentQrUrl ? (
                    <div className="booking-success-qr grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
                      <div className="booking-success-qr__image rounded-2xl border border-stone-200 bg-stone-50 p-3">
                        {confirmedBooking.paymentQrCode ? (
                          <QRCodeSVG
                            value={confirmedBooking.paymentQrCode}
                            size={180}
                            level="M"
                            includeMargin
                            className="mx-auto h-auto max-w-full rounded-xl"
                            aria-label={lang === 'vn' ? 'Mã QR thanh toán payOS' : 'PayOS payment QR code'}
                          />
                        ) : (
                          <img
                            src={confirmedBooking.paymentQrUrl}
                            alt={lang === 'vn' ? 'Mã QR chuyển khoản' : 'Transfer QR code'}
                            className="mx-auto w-full max-w-[180px] rounded-xl"
                          />
                        )}
                      </div>
                      <div className="booking-success-qr__details space-y-2 text-xs text-stone-700">
                        <p className="font-bold text-stone-900">
                          {lang === 'vn'
                            ? 'Quét mã QR payOS hoặc mở trang thanh toán. payOS sẽ tự đối soát và cập nhật trạng thái đơn.'
                            : 'Scan the payOS QR or open the checkout page. payOS will reconcile the payment and update this booking.'}
                        </p>
                        {confirmedBooking.paymentCheckoutUrl && (
                          <a
                            href={confirmedBooking.paymentCheckoutUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-3 py-2 font-bold text-white transition hover:bg-emerald-800"
                          >
                            {lang === 'vn' ? 'Mở trang thanh toán payOS' : 'Open payOS checkout'}
                          </a>
                        )}
                        <div>
                          <span className="font-semibold text-stone-500">{lang === 'vn' ? 'Ngân hàng / tài khoản: ' : 'Bank / account: '}</span>
                          <span>{confirmedBooking.paymentBankId || '-'} · {confirmedBooking.paymentAccountNumber || '-'}</span>
                        </div>
                        {confirmedBooking.paymentAccountName && (
                          <div>
                            <span className="font-semibold text-stone-500">{lang === 'vn' ? 'Chủ tài khoản: ' : 'Account name: '}</span>
                            <span>{confirmedBooking.paymentAccountName}</span>
                          </div>
                        )}
                        {confirmedBooking.paymentTransferNote && (
                          <div>
                            <span className="font-semibold text-stone-500">{lang === 'vn' ? 'Nội dung chuyển khoản: ' : 'Transfer note: '}</span>
                            <span className="font-mono font-bold text-emerald-800">{confirmedBooking.paymentTransferNote}</span>
                          </div>
                        )}
                        {confirmedBooking.pickupLocation && (
                          <div>
                            <span className="font-semibold text-stone-500">{lang === 'vn' ? 'Điểm đón: ' : 'Pickup location: '}</span>
                            <span>{confirmedBooking.pickupLocation}</span>
                          </div>
                        )}
                        {confirmedBooking.paymentExpiresAt && (
                          <div>
                            <span className="font-semibold text-stone-500">{lang === 'vn' ? 'Hiệu lực QR đến: ' : 'QR expires at: '}</span>
                            <span>{new Date(confirmedBooking.paymentExpiresAt).toLocaleString(lang === 'vn' ? 'vi-VN' : 'en-US')}</span>
                          </div>
                        )}
                        <div className="booking-success-qr__email-note rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                          {lang === 'vn'
                            ? `Sau khi payOS xác nhận thanh toán, hệ thống sẽ tự đổi trạng thái đơn và gửi email tới ${confirmedBooking.customerEmail}.`
                            : `Once payOS confirms payment, the booking status will update automatically and an email will be sent to ${confirmedBooking.customerEmail}.`}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      {lang === 'vn'
                        ? 'Chưa có dữ liệu QR payOS cho đơn này. Vui lòng liên hệ Botanica Garden để được hỗ trợ thanh toán.'
                        : 'No payOS QR data is available for this booking. Please contact Botanica Garden for payment support.'}
                    </div>
                  )}
                </div>
              )}

              <div className="booking-success-actions mt-4 pt-3 border-t border-stone-200 text-center">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-stone-500 hover:text-stone-800 text-xs font-semibold underline"
                >
                  {lang === 'vn' ? 'Đóng cửa sổ' : 'Close window'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
