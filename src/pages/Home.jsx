import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaWhatsapp, FaYoutube, FaTiktok } from 'react-icons/fa';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import ComboCard from '../components/ComboCard';
import PromotionalPopup from '../components/PromotionalPopup';
import Loading from '../components/Loading';
import NewsletterSubscription from '../components/NewsletterSubscription';
import { useTranslation } from '../hooks/useTranslation';

const Home = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [combos, setCombos] = useState([]);
  const [heroSettings, setHeroSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData(true); // Initial load with loading state
    // Auto-refresh content every 60 seconds to show hero section and product updates
    const interval = setInterval(() => {
      fetchData(false); // Refresh without loading state
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const [settingsRes, testimonialsRes, productsRes, combosRes, heroRes] = await Promise.all([
        api.get('/settings'),
        api.get('/testimonials?featured=true'),
        api.get('/products?bestseller=true'),
        api.get('/combos?active=true&bestseller=true').catch(() => ({ data: { data: [] } })),
        api.get('/settings/heroSection').catch((err) => {
          // Suppress 404 errors for heroSection (expected if not set)
          if (err.response?.status !== 404) {
            console.error('Error fetching hero settings:', err);
          }
          return { data: { data: null } };
        })
      ]);

      setSettings(settingsRes.data.data);
      setTestimonials(testimonialsRes.data.data.slice(0, 3));
      setBestsellers(productsRes.data.data.slice(0, 4));
      setCombos(combosRes.data.data.slice(0, 4));
      
      // Check API response first, then localStorage fallback
      if (heroRes.data.data) {
        setHeroSettings(heroRes.data.data);
      } else {
        const savedHero = localStorage.getItem('heroSection');
        if (savedHero) {
          try {
            setHeroSettings(JSON.parse(savedHero));
          } catch (e) {
            setHeroSettings(null);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  // Use hero settings if available, otherwise use defaults with translations
  // This will recalculate when language changes
  const hero = heroSettings ? {
    ...heroSettings,
    tagline: heroSettings.tagline || settings?.tagline || t('home.heroTitle'),
    description: heroSettings.description || t('home.heroDescription'),
    primaryCTA: heroSettings.primaryCTA || { text: `🎂 ${t('home.startCustom')}`, link: '/custom-cakes' },
    secondaryCTA: heroSettings.secondaryCTA || { text: t('home.browseCatalog'), link: '/catalog' },
    badges: heroSettings.badges || [
      { text: t('home.freeSample'), icon: '✓' },
      { text: t('home.firstOrderDiscount'), icon: '✓' },
      { text: t('home.leadTimeBadge'), icon: '✓' }
    ]
  } : {
    mainHeading: 'M. Sucre',
    tagline: settings?.tagline || t('home.heroTitle'),
    description: t('home.heroDescription'),
    primaryCTA: { text: `🎂 ${t('home.startCustom')}`, link: '/custom-cakes' },
    secondaryCTA: { text: t('home.browseCatalog'), link: '/catalog' },
    heroImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    badges: [
      { text: t('home.freeSample'), icon: '✓' },
      { text: t('home.firstOrderDiscount'), icon: '✓' },
      { text: t('home.leadTimeBadge'), icon: '✓' }
    ],
    locations: settings?.locations || ['Gatineau (Quebec)', 'Downtown Ottawa'],
    customerAvatars: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
    ],
    happyCustomersCount: '500+'
  };

  const whatsappNumber = settings?.whatsappNumber || '+1234567890';

  return (
    <div className="min-h-screen">
      <PromotionalPopup />

      {/* Hero Section - Two Column */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                {t('home.serving')} {hero.locations.join(` ${t('common.and')} `)}
              </div>
              
              <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6 leading-tight">
                {hero.mainHeading}
              </h1>
              
              <p className="text-2xl text-gray-600 mb-8 italic">
                {hero.tagline}
              </p>

              <p className="text-lg text-gray-600 mb-8">
                {hero.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={hero.primaryCTA.link} className="btn-primary text-center">
                  {hero.primaryCTA.text}
                </Link>
                <Link to={hero.secondaryCTA.link} className="btn-secondary text-center">
                  {hero.secondaryCTA.text}
                </Link>
              </div>

              {/* Quick info */}
              <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-600">
                {hero.badges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-green-600">{badge.icon}</span>
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Column - Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={hero.heroImage}
                  alt="Beautiful custom cake"
                  className="w-full h-[500px] object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    {(hero.customerAvatars || [
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
                      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
                    ]).slice(0, 3).map((avatar, i) => (
                      <img
                        key={i}
                        src={avatar}
                        alt={`Customer ${i + 1}`}
                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop';
                        }}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <FaStar key={i} className="text-yellow-400 text-sm" />
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {hero.happyCustomersCount || '500+'} {t('home.happyCustomers')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
            {t('home.bestsellers')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('home.bestsellersDesc')}
          </p>
        </div>

        {bestsellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">{t('home.noProducts')}</p>
        )}

        <div className="text-center mt-10">
          <Link to="/catalog" className="btn-secondary">
            {t('home.viewAllProducts')}
          </Link>
        </div>
      </section>

      {/* Combo Deals Section */}
      {combos.length > 0 && (
        <section className="section-container bg-gradient-to-br from-purple-50 via-white to-pink-50">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              🎁 Special Combo Deals
            </h2>
            <p className="text-lg text-gray-600">
              Perfect combinations of cakes and pastries at amazing prices
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {combos.map((combo) => (
              <ComboCard key={combo._id} combo={combo} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/combos" className="btn-secondary">
              View All Combos
            </Link>
          </div>
        </section>
      )}

      {/* Custom Cakes CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-pink-600 text-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-display font-bold mb-6">
              {t('home.createDreamCake')}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {t('home.createDreamCakeDesc')}
            </p>
            <Link to="/custom-cakes" className="btn-secondary bg-white text-primary-600 hover:bg-gray-100">
              {t('home.startDesigning')}
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-container bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
            {t('home.testimonials')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('home.testimonialsDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{testimonial.body}"</p>
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                {testimonial.location && (
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/reviews" className="text-primary-600 hover:underline font-semibold">
            {t('home.readMoreReviews')} →
          </Link>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="section-container bg-gradient-to-br from-primary-50 via-white to-pink-50">
        <div className="max-w-2xl mx-auto">
          <NewsletterSubscription source="home" showName={true} />
        </div>
      </section>

      {/* Social Media & Contact */}
      <section className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
            {t('home.followJourney')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('home.followJourneyDesc')}
          </p>
        </div>

        <div className="flex justify-center space-x-6 mb-8">
          <a
            href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <FaWhatsapp className="text-2xl" />
            <span>{t('home.chatWhatsApp')}</span>
          </a>
        </div>

        {settings?.socialMedia?.youtube && settings.socialMedia.youtube.includes('youtube') && (
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video">
              <iframe
                src={settings.socialMedia.youtube.includes('embed') 
                  ? settings.socialMedia.youtube 
                  : settings.socialMedia.youtube.replace('watch?v=', 'embed/').replace('youtube.com/', 'youtube.com/embed/')
                }
                className="w-full h-full rounded-lg border-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                title="M. Sucre YouTube Video"
                loading="lazy"
              ></iframe>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              {t('home.watchVideoDesc')}
            </p>
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section className="bg-primary-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">{t('home.happyCustomersCount')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">5★</div>
              <div className="text-gray-600">{t('home.averageRating')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
              <div className="text-gray-600">{t('home.freshIngredients')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">2 {t('product.days')}</div>
              <div className="text-gray-600">{t('home.leadTime')}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

