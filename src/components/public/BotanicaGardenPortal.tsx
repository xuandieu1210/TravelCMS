import React, { useState, useEffect, useMemo } from 'react';
import { Tour, CustomerFeedback, Banner, SiteConfig, Booking, Category, Post } from '../../types';
import { translationsData } from '../../data/translations';

interface BotanicaGardenPortalProps {
  tours: Tour[];
  categories?: Category[];
  posts?: Post[];
  feedbacks: CustomerFeedback[];
  banners: Banner[];
  siteConfig: SiteConfig;
  onSubmitBooking: (bookingPayload: {
    tourId?: string;
    tourName: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    departureDate: string;
    numAdults: number;
    numChildren: number;
    notes?: string;
  }) => Promise<Booking | null>;
  onOpenAdmin: () => void;
}

type LangType = 'en' | 'vn';

export const BotanicaGardenPortal: React.FC<BotanicaGardenPortalProps> = ({
  tours,
  categories = [],
  posts = [],
  feedbacks,
  banners,
  siteConfig,
  onSubmitBooking,
  onOpenAdmin,
}) => {
  const [lang, setLang] = useState<LangType>('en');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedWorkshopIndex, setSelectedWorkshopIndex] = useState<number>(0);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [generatedMsg, setGeneratedMsg] = useState<string>('');

  // Post reading modal states
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostReaderOpen, setIsPostReaderOpen] = useState<boolean>(false);

  const handleOpenPostReader = (post: Post) => {
    setSelectedPost(post);
    setIsPostReaderOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleClosePostReader = () => {
    setIsPostReaderOpen(false);
    setSelectedPost(null);
    document.body.style.overflow = '';
  };

  // Form states
  const [formDate, setFormDate] = useState<string>('');
  const [formAdults, setFormAdults] = useState<number>(2);
  const [formKids, setFormKids] = useState<number>(0);
  const [formName, setFormName] = useState<string>('');
  const [formNote, setFormNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const T = translationsData as Record<LangType, Record<string, string>>;
  const t = T[lang] || T.en;

  // Active categories directly loaded from Database (Hiển thị tất cả danh mục ở frontend)
  const workshopCategories = useMemo(() => {
    const list = (categories || []).filter((c) => c.isActive);
    if (list.length > 0) {
      return [...list].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
    // Fallback if categories haven't loaded
    return [
      { id: 'cat-ws-01', slug: 'family-crafts', name: 'Thủ công gia đình', nameEn: 'Family crafts', isActive: true },
      { id: 'cat-ws-02', slug: 'culture-and-food', name: 'Văn hóa & ẩm thực Việt', nameEn: 'Vietnamese culture & food', isActive: true },
      { id: 'cat-ws-03', slug: 'coffee-and-wellness', name: 'Cà phê & thư giãn', nameEn: 'Coffee & wellness', isActive: true },
    ] as Category[];
  }, [categories]);

  // Filter workshops (only PUBLISHED)
  const publishedTours = useMemo(() => {
    return tours.filter((tour) => tour.status === 'PUBLISHED');
  }, [tours]);

  // Filter published posts (Hiển thị dữ liệu bài viết chuẩn)
  const publishedPosts = useMemo(() => {
    return (posts || []).filter((post) => post.status === 'PUBLISHED');
  }, [posts]);

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

  // Active banner from database or default
  const activeHeroBanner = useMemo(() => {
    return banners.find((b) => b.position === 'HOME_HERO' && b.isActive) || banners[0];
  }, [banners]);

  // Format price display
  const renderPrice = (w: Tour) => {
    if (w.priceDisplay === 'request' || w.pricing.adultPrice === 0) {
      return <span className="price">{t.onreq}</span>;
    }
    const rawPrice = w.priceDisplay ? parseInt(w.priceDisplay, 10) : Math.round(w.pricing.adultPrice / 1000);
    const n = lang === 'vn' ? `${rawPrice}.000₫` : `${rawPrice},000₫`;
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
    setCopiedMessage(false);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
  };

  // Build message string
  const constructMessage = () => {
    const selectedTour = publishedTours[selectedWorkshopIndex] || publishedTours[0];
    const wsTitle = selectedTour ? getTourTitle(selectedTour) : 'Workshop';
    const dateStr = formDate.trim() || t.msg_anyday;
    let m = `${t.msg_hi}\n\n${t.msg_ws}: ${wsTitle}\n${t.msg_date}: ${dateStr}\n${t.msg_adults}: ${formAdults} / ${t.msg_kids}: ${formKids}`;
    if (formName.trim()) m += `\n${t.msg_name}: ${formName.trim()}`;
    if (formNote.trim()) m += `\n${t.msg_note}: ${formNote.trim()}`;
    m += `\n\n${t.msg_from}`;
    return m;
  };

  // Submit booking form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const selectedTour = publishedTours[selectedWorkshopIndex] || publishedTours[0];
    const msg = constructMessage();
    setGeneratedMsg(msg);

    try {
      // 1. Save booking directly into database
      await onSubmitBooking({
        tourId: selectedTour?.id,
        tourName: selectedTour ? `${selectedTour.name} (${selectedTour.nameEn || ''})` : 'Botanica Workshop',
        customerName: formName.trim() || 'Botanica Guest',
        departureDate: formDate.trim() || new Date().toISOString().slice(0, 10),
        numAdults: formAdults || 1,
        numChildren: formKids || 0,
        notes: formNote.trim(),
      });

      // 2. Pre-copy to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(msg).catch(() => {});
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting booking', err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generatedMsg);
    }
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 3000);
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
            {publishedPosts.length > 0 && (
              <a href="#stories">{t.nav_stories || (lang === 'vn' ? 'Bài viết' : 'Stories')}</a>
            )}
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

            <button
              type="button"
              onClick={onOpenAdmin}
              className="px-3 py-1.5 rounded-full border border-stone-300 text-stone-600 hover:text-emerald-800 hover:border-emerald-700 text-xs font-bold transition-colors shadow-xs"
              title="Mở hệ thống quản trị Emic Travel CMS"
            >
              CMS Admin
            </button>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section
        className="hero"
        id="top"
        style={{
          backgroundImage: `url('${activeHeroBanner?.imageUrl || '/images/img_0.jpeg'}')`,
        }}
      >
        <div className="hero-inner">
          <span className="eyebrow">{activeHeroBanner?.badgeText || t.hero_eyebrow}</span>
          <h1>{lang === 'vn' && activeHeroBanner?.title.includes('Slow down') ? t.hero_title : activeHeroBanner?.title || t.hero_title}</h1>
          <p className="lead">{lang === 'vn' && activeHeroBanner?.subtitle.includes('Spend two') ? t.hero_sub : activeHeroBanner?.subtitle || t.hero_sub}</p>

          <div className="hero-cta">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleOpenModal()}
            >
              {t.hero_cta}
            </button>
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

      {/* ESCAPE */}
      <section className="escape">
        <div className="wrap escape-grid">
          <div className="reveal">
            <span className="eyebrow">{t.escape_eyebrow}</span>
            <h2>{t.escape_title}</h2>
            <p>{t.escape_p1}</p>
            <p>{t.escape_p2}</p>
            <div className="pull">
              <q>{t.escape_quote}</q>
              <cite>{t.escape_cite}</cite>
            </div>
          </div>
          <div className="escape-img reveal">
            <img
              src="/images/img_1.jpeg"
              alt="Herbs hand-picked from the Botanica garden"
              loading="lazy"
            />
            <div className="tag">{t.escape_tag}</div>
          </div>
        </div>
      </section>

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
              const hasImg = w.thumbnail && !w.thumbnail.startsWith('{{');

              return (
                <div key={w.id} className="card">
                  <div className={`card-media ${!hasImg ? 'motif' : ''}`}>
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
                  </div>

                  <div className="card-body">
                    <h3>{title}</h3>
                    <p>{desc}</p>
                    <div className="card-foot">
                      {renderPrice(w)}
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
            {feedbacks.slice(0, 4).map((fb) => (
              <div key={fb.id} className="rev reveal">
                <div className="stars">{'★'.repeat(fb.rating || 5)}</div>
                <q>{fb.comment}</q>
                <cite>— {fb.customerName}</cite>
              </div>
            ))}
            {feedbacks.length >= 5 && (
              <div className="rev rev-feature reveal">
                <q>{feedbacks[4]?.comment || t.rev5}</q>
                <cite>— {feedbacks[4]?.customerName || t.rev5c}</cite>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STORIES & BLOG SECTION (Cẩm Nang & Bài Viết) */}
      {publishedPosts.length > 0 && (
        <section className="stories py-20 bg-stone-50/70 border-t border-stone-200" id="stories">
          <div className="wrap">
            <div className="section-head reveal max-w-2xl mb-12">
              <span className="eyebrow text-emerald-800 font-bold uppercase tracking-wider text-xs">
                {t.stories_eyebrow || 'Chuyện kể từ khu vườn'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-stone-900 mt-2 tracking-tight">
                {t.stories_title || 'Cẩm nang trải nghiệm & Sống chậm Hội An'}
              </h2>
              <p className="text-stone-600 mt-3 text-sm leading-relaxed">
                {t.stories_sub || 'Khám phá những câu chuyện thú vị đằng sau các món đồ thủ công, nghệ thuật pha chế và lối sống xanh mộc mạc tại Botanica Garden.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publishedPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer group hover:-translate-y-1"
                  onClick={() => handleOpenPostReader(post)}
                >
                  <div className="relative h-52 overflow-hidden bg-stone-100">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-emerald-900 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-400 mb-2.5">
                        <span>{new Date(post.publishedAt).toLocaleDateString(lang === 'vn' ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>{post.author}</span>
                      </div>
                      <h3 className="font-serif font-bold text-stone-900 text-base leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2 mb-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                        {post.summary}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        {t.read_more || 'Đọc bài viết'} →
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {post.viewCount || 1200} lượt xem
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VISIT */}
      <section className="visit" id="visit">
        <div className="wrap visit-grid">
          <div className="reveal">
            <span className="eyebrow">{t.visit_eyebrow}</span>
            <h2>{t.visit_title}</h2>
            <p>{t.visit_p1}</p>
            <p>{t.visit_p2}</p>
            <div className="addr">{siteConfig.address || '208 Le Thanh Tong, Cam Chau, Hoi An'}</div>

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
            <img
              src="/images/img_2.jpeg"
              alt="Happy guests with their Botanica Garden gift boxes"
              loading="lazy"
            />
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
              <p dangerouslySetInnerHTML={{ __html: siteConfig.address.replace(',', ',<br>') }} />
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
            <div className="flex items-center gap-3">
              <span>{t.foot_made}</span>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="text-stone-400 hover:text-white underline text-xs"
              >
                CMS Admin
              </button>
            </div>
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
                  type="text"
                  id="f_date"
                  placeholder={lang === 'vn' ? 'Ví dụ: Sáng thứ 7, 31/05' : 'e.g. Sat 31 May, morning'}
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>

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

              <div className="field">
                <label>{t.m_note}</label>
                <textarea
                  id="f_note"
                  placeholder={lang === 'vn' ? 'Yêu cầu đặc biệt hoặc ghi chú...' : 'Special requests or preferences...'}
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary form-submit"
              >
                {isSubmitting ? (lang === 'vn' ? 'Đang lưu...' : 'Processing...') : t.m_submit}
              </button>
            </form>
          ) : (
            <div className="send-options show" id="sendOptions">
              <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold">
                ✓ {lang === 'vn' ? 'Yêu cầu đặt lớp đã được lưu tự động vào hệ thống!' : 'Your workshop request has been automatically registered in our database!'}
              </div>

              <p className="send-intro">{t.m_send_intro}</p>

              <div className="send-grid">
                <button
                  type="button"
                  className="send-btn send-wa"
                  onClick={() => {
                    window.open(
                      `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(generatedMsg)}`,
                      '_blank'
                    );
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1.1.1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.1.1.3 0 .5l-.4.5c-.1.2-.3.3-.1.6.1.2.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.6-.1 1.1z" />
                  </svg>
                  WhatsApp
                </button>

                <button
                  type="button"
                  className="send-btn send-msg"
                  onClick={() => {
                    copyToClipboard();
                    window.open(`https://m.me/${siteConfig.messenger}`, '_blank');
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.3 2 2 6.2 2 11.7c0 3 1.4 5.6 3.7 7.4V23l3.4-1.9c.9.3 1.9.4 2.9.4 5.7 0 10-4.2 10-9.8C22 6.2 17.7 2 12 2zm1 13.2l-2.5-2.7-4.9 2.7L10.9 9l2.6 2.7L18.3 9 13 15.2z" />
                  </svg>
                  Messenger
                </button>

                <button
                  type="button"
                  className="send-btn send-ig"
                  onClick={() => {
                    copyToClipboard();
                    window.open(`https://instagram.com/${siteConfig.instagram}`, '_blank');
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                  Instagram
                </button>

                {siteConfig.email && (
                  <button
                    type="button"
                    className="send-btn send-email"
                    onClick={() => {
                      const subj = encodeURIComponent('Workshop request — Botanica Garden');
                      window.open(
                        `mailto:${siteConfig.email}?subject=${subj}&body=${encodeURIComponent(generatedMsg)}`,
                        '_blank'
                      );
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Email
                  </button>
                )}

                <button
                  type="button"
                  className="send-btn send-copy"
                  style={{ gridColumn: '1 / -1' }}
                  onClick={copyToClipboard}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="9" y="9" width="11" height="11" rx="2" />
                    <path d="M5 15V5a2 2 0 0 1 2-2h10" strokeLinecap="round" />
                  </svg>
                  <span>{t.m_copy}</span>
                </button>
              </div>

              {copiedMessage && (
                <div className="copied" style={{ display: 'block' }}>
                  {t.m_copied}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-stone-200 text-center">
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

      {/* ARTICLE READER MODAL (Xem chi tiết bài viết) */}
      {isPostReaderOpen && selectedPost && (
        <div className="modal open" style={{ zIndex: 110 }}>
          <div className="modal-bg" onClick={handleClosePostReader} />
          <div className="modal-card" style={{ maxWidth: '760px', maxHeight: '90vh', overflowY: 'auto', padding: '0', borderRadius: '24px' }}>
            <div className="relative h-64 sm:h-72 w-full bg-stone-100">
              <img
                src={selectedPost.thumbnail}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleClosePostReader}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer text-lg font-bold shadow-md"
                title="Đóng bài viết"
              >
                ✕
              </button>
              <span className="absolute bottom-4 left-5 bg-white/95 backdrop-blur-xs text-emerald-900 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md">
                {selectedPost.category}
              </span>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-3">
                <span className="font-bold text-stone-800">{selectedPost.author}</span>
                <span>•</span>
                <span>{new Date(selectedPost.publishedAt).toLocaleDateString(lang === 'vn' ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span>•</span>
                <span>{selectedPost.viewCount || 1000} lượt đọc</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 leading-snug mb-4">
                {selectedPost.title}
              </h2>

              <div className="bg-amber-50/80 border-l-4 border-amber-600 p-4 rounded-r-xl text-xs sm:text-sm text-stone-700 italic leading-relaxed mb-6">
                {selectedPost.summary}
              </div>

              <div className="text-stone-700 text-sm leading-relaxed whitespace-pre-line space-y-4 mb-8">
                {selectedPost.content}
              </div>

              <div className="border-t border-stone-200 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-stone-500 text-center sm:text-left">
                  <span>Trải nghiệm thực tế tại Botanica Garden Hoi An</span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleClosePostReader}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
                  >
                    {lang === 'vn' ? 'Đóng lại' : 'Close'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleClosePostReader();
                      handleOpenModal();
                    }}
                    className="flex-1 sm:flex-none btn btn-primary py-2.5 text-xs font-bold"
                  >
                    {lang === 'vn' ? 'Đặt lớp trải nghiệm ngay' : 'Book a workshop'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
