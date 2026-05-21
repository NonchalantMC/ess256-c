import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productService } from '../services/api';
import { api } from '../stores';
import ProductCard from '../components/products/ProductCard';
import { COLLECTION_IMAGES } from '../utils/images';

const MOCK = [
  {_id:'1',type:'footwear',name:'Classic Pump Heels',slug:'classic-pump-heels',category:'Heels',price:145000,compareAtPrice:195000,stock:15,rating:4.8,reviewCount:124,tags:['bestseller'],footwearDetails:{sizes:[36,37,38,39,40,41]},images:['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=85&fit=crop']},
  {_id:'2',type:'footwear',name:'White Leather Sneakers',slug:'white-leather-sneakers',category:'Sneakers',price:128000,compareAtPrice:0,stock:22,rating:4.9,reviewCount:89,tags:['new'],footwearDetails:{sizes:[36,37,38,39,40,41,42]},images:['https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&q=85&fit=crop']},
  {_id:'3',type:'footwear',name:'Suede Ankle Boots',slug:'suede-ankle-boots',category:'Boots',price:210000,compareAtPrice:260000,stock:8,rating:4.7,reviewCount:67,tags:['sale'],footwearDetails:{sizes:[36,37,38,39,40]},images:['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=85&fit=crop']},
  {_id:'4',type:'footwear',name:'Strappy Heeled Sandals',slug:'strappy-heeled-sandals',category:'Sandals',price:98000,compareAtPrice:0,stock:18,rating:4.6,reviewCount:45,tags:[],footwearDetails:{sizes:[36,37,38,39,40,41]},images:['https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=85&fit=crop']},
  {_id:'5',type:'footwear',name:'Leather Ballet Flats',slug:'leather-ballet-flats',category:'Flats',price:85000,compareAtPrice:0,stock:25,rating:4.5,reviewCount:92,tags:[],footwearDetails:{sizes:[35,36,37,38,39,40,41,42]},images:['https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=85&fit=crop']},
  {_id:'6',type:'decor',name:'Abstract Canvas Wall Art',slug:'abstract-canvas-wall-art',category:'Wall Art',price:120000,compareAtPrice:0,stock:10,rating:4.9,reviewCount:38,tags:['featured'],decorDetails:{},images:['https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&q=85&fit=crop']},
  {_id:'7',type:'decor',name:'Ceramic Vase Set',slug:'ceramic-vase-set',category:'Vases',price:89000,compareAtPrice:115000,stock:12,rating:4.8,reviewCount:55,tags:['sale'],decorDetails:{},images:['https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&q=85&fit=crop']},
  {_id:'8',type:'decor',name:'Boho Cushion Covers',slug:'boho-cushion-covers',category:'Cushions',price:65000,compareAtPrice:0,stock:30,rating:4.6,reviewCount:77,tags:['new'],decorDetails:{},images:['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=85&fit=crop']},
  {_id:'9',type:'decor',name:'Modern Arc Floor Lamp',slug:'modern-arc-floor-lamp',category:'Lighting',price:285000,compareAtPrice:0,stock:6,rating:4.7,reviewCount:29,tags:[],decorDetails:{},images:['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=85&fit=crop']},
  {_id:'10',type:'decor',name:'Macramé Plant Hanger',slug:'macrame-plant-hanger',category:'Planters',price:45000,compareAtPrice:0,stock:40,rating:4.5,reviewCount:63,tags:[],decorDetails:{},images:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85&fit=crop']},
];

const CATS = [
  { id:'all',      label:'All',      icon:'🛍' },
  { id:'footwear', label:'Footwear', icon:'👟' },
  { id:'decor',    label:'Decor',    icon:'🏺' },
];

const COLLECTIONS = [
  { key:'officeChic',   title:'Office Chic',   sub:'Professional elegance',     href:'/footwear' },
  { key:'bohoHome',     title:'Boho Home',     sub:'Natural textures & warmth', href:'/decor'    },
  { key:'weekendVibes', title:'Weekend Vibes', sub:'Relaxed, effortless style', href:'/footwear' },
  { key:'partySeason',  title:'Party Season',  sub:'Statement pieces to shine', href:'/footwear' },
];

const DEFAULT_HERO = {
  eyebrow:      'New Season Arrivals',
  heading:      'Where *Style* Meets Your Space',
  subheading:   'Your Essentials for a Perfect Home & Lifestyle',
  ctaPrimary:   { label:'Shop Footwear', link:'/footwear' },
  ctaSecondary: { label:'Explore Decor', link:'/decor'    },
  stat1: { value:'500+', label:'Products'   },
  stat2: { value:'4.8★', label:'Avg Rating' },
  stat3: { value:'1K+',  label:'Customers'  },
  images: [
    { url:'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=700&q=85&fit=crop', name:'Classic Pumps', price:'UGX 145,000', link:'/products/classic-pump-heels' },
    { url:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=85&fit=crop', name:'Boho Cushions', price:'UGX 65,000', link:'/products/boho-cushion-covers' },
  ],
};

export default function Home() {
  const [products, setProducts] = useState(MOCK);
  const [tab,      setTab]      = useState('all');
  const [hero,     setHero]     = useState(DEFAULT_HERO);
  const [email,    setEmail]    = useState('');
  const [subMsg,   setSubMsg]   = useState('');

  useEffect(() => {
    api.get('/hero').then(({ data }) => setHero(data)).catch(() => {});
    productService.list({ status:'active', limit:10 })
      .then(({ data }) => { if (data.products?.length) setProducts(data.products); })
      .catch(() => {});
  }, []);

  const filtered = tab === 'all' ? products : products.filter(p => p.type === tab);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSubMsg("✓ Subscribed! Your 10% off code is on its way.");
    setEmail('');
    setTimeout(() => setSubMsg(''), 5000);
  };

  return (
    <div>
      {/* Custom styles for thinner scrollbar on collections (mobile only) */}
      <style>{`
        @media (max-width: 767px) {
          .collections-scroll {
            scrollbar-width: thin; /* Firefox */
            -ms-overflow-style: auto; /* IE/Edge */
          }
          .collections-scroll::-webkit-scrollbar {
            height: 4px; /* Thin horizontal scrollbar */
          }
          .collections-scroll::-webkit-scrollbar-track {
            background: #e2e8f0;
            border-radius: 10px;
          }
          .collections-scroll::-webkit-scrollbar-thumb {
            background: #94a3b8;
            border-radius: 10px;
          }
          .collections-scroll::-webkit-scrollbar-thumb:hover {
            background: #64748b;
          }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 overflow-hidden" style={{minHeight:220}}>
        {/* Left panel */}
        <div className="relative flex flex-col justify-center px-10 py-9 overflow-hidden"
             style={{background:'linear-gradient(145deg,#151e2a 0%,#212836 45%,#1a4a38 75%,#1e805f 100%)'}}>
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full"
               style={{background:'rgba(134,232,196,.06)'}} />
          <div className="relative z-10">
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.4}}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-3 w-fit"
                style={{background:'rgba(134,232,196,.12)',border:'1px solid rgba(134,232,196,.25)'}}>
              <span className="w-1.5 h-1.5 rounded-full" style={{background:'#86e8c4',animation:'pulse 2s infinite'}} />
              <span style={{color:'#86e8c4'}} className="text-[10px] font-medium tracking-[1.5px] uppercase">
                {hero.eyebrow}
              </span>
            </motion.div>

            <motion.h1 initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.45,delay:.06}}
                className="font-serif text-white leading-tight mb-2"
                style={{fontSize:'clamp(22px,3vw,34px)',fontWeight:500}}
                dangerouslySetInnerHTML={{__html: hero.heading.replace(/\*(.+?)\*/g,'<em style="color:#86e8c4">$1</em>')}} />

            <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.14}}
                className="text-white/60 leading-relaxed mb-4 font-light"
                style={{fontSize:'clamp(11px,1.2vw,13px)',maxWidth:340}}>
              {hero.subheading}
            </motion.p>

            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:.2}}
                className="flex flex-wrap gap-2 mb-4">
              <Link to={hero.ctaPrimary.link} className="btn-primary" style={{padding:'9px 22px',fontSize:12}}>
                {hero.ctaPrimary.label}
              </Link>
              <Link to={hero.ctaSecondary.link} className="btn-ghost" style={{padding:'9px 22px',fontSize:12}}>
                {hero.ctaSecondary.label}
              </Link>
            </motion.div>

            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.28}}
                className="flex gap-7 pt-3"
                style={{borderTop:'1px solid rgba(255,255,255,.08)'}}>
              {[hero.stat1, hero.stat2, hero.stat3].map(s => (
                <div key={s.label}>
                  <div className="font-bold text-white leading-none" style={{fontSize:16}}>{s.value}</div>
                  <div className="text-white/40 mt-0.5" style={{fontSize:10,letterSpacing:'.3px'}}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right images */}
        <div className="hidden md:grid gap-[2px]"
             style={{background:'#0d1a14', gridTemplateColumns:`repeat(${hero.images.length},1fr)`}}>
          {hero.images.map((img, i) => (
            <Link key={i} to={img.link || '/'} className="relative overflow-hidden group block">
              <img src={img.url} alt={img.name}
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                   style={{minHeight:220}} />
              {(img.name || img.price) && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3"
                     style={{background:'linear-gradient(transparent,rgba(0,0,0,.55))'}}>
                  {img.name  && <div className="text-white font-medium" style={{fontSize:12}}>{img.name}</div>}
                  {img.price && <div style={{color:'#86e8c4',fontSize:11,marginTop:2}}>{img.price}</div>}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="bg-white border-y py-7 px-7" style={{borderColor:'var(--border)'}}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            {icon:'🚚', title:'Nationwide Delivery', sub:'Uganda & Rwanda'},
            {icon:'↩',  title:'14-Day Returns',      sub:'Hassle-free policy'},
            {icon:'🔒', title:'Secure Payments',     sub:'PesaPal PCI-DSS Level 1'},
            {icon:'💬', title:'WhatsApp Support',    sub:'Instant help, always on'},
          ].map(t => (
            <div key={t.title} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                   style={{background:'var(--teal-pale)'}}>
                {t.icon}
              </div>
              <div>
                <div className="text-[13px] font-semibold" style={{color:'var(--ink)'}}>{t.title}</div>
                <div className="text-[11px] mt-0.5" style={{color:'var(--ink-soft)'}}>{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COLLECTIONS (scroll on mobile, grid on desktop) ── */}
      <section className="px-7 pt-10 pb-4">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-serif text-[28px] font-medium tracking-tight" style={{color:'var(--ink)'}}>
            Featured Collections
          </h2>
          <Link to="/products" className="text-sm font-medium hover:underline" style={{color:'var(--teal)'}}>
            View all →
          </Link>
        </div>

        {/* Mobile: flex horizontal scroll with thin scrollbar; Desktop: grid */}
        <div className="flex overflow-x-auto gap-3 pb-3 collections-scroll md:grid md:grid-cols-4 md:overflow-x-visible">
          {COLLECTIONS.map((c, i) => (
            <motion.div
              key={c.key}
              initial={{opacity:0, y:14}}
              animate={{opacity:1, y:0}}
              transition={{delay:i * 0.07}}
              className="flex-shrink-0 w-56 md:w-auto"
            >
              <Link to={c.href} className="collection-card block" style={{height:190}}>
                <img src={COLLECTION_IMAGES[c.key]} alt={c.title} className="w-full h-full object-cover" />
                <div className="collection-overlay">
                  <h3 className="font-serif text-[20px] text-white leading-tight">{c.title}</h3>
                  <p className="text-white/70 text-[11px] mt-1">{c.sub}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS (original grid, no scroll) ── */}
      <section className="px-7 pb-14">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 my-7">
          <div>
            <h2 className="font-serif text-[28px] font-medium tracking-tight" style={{color:'var(--ink)'}}>
              {tab === 'all' ? 'Featured Products' : tab === 'footwear' ? 'Ladies Footwear' : 'Interior Decor'}
            </h2>
            <p className="text-sm mt-0.5" style={{color:'var(--ink-soft)'}}>{filtered.length} products</p>
          </div>
          <div className="flex rounded-full p-1 gap-0.5" style={{background:'var(--border)'}}>
            {CATS.map(cat => (
              <button key={cat.id} onClick={() => setTab(cat.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
                  style={tab === cat.id
                    ? {background:'var(--ink)', color:'#fff', boxShadow:'0 2px 8px rgba(33,40,54,.2)'}
                    : {color:'var(--ink-soft)'}}>
                <span style={{fontSize:14}}>{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Original grid layout – no horizontal scroll */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((p, i) => (
            <ProductCard key={p._id || p.id} product={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}