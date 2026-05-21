import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore, useWishlistStore } from '../../stores';
import { useToast } from '../../hooks/useToast';

const fmt = n => `UGX ${n?.toLocaleString()}`;
const pid = p => p._id || p.id || '';

export default function ProductCard({ product: p, index = 0 }) {
  const [activeColor, setActiveColor] = useState(0);
  const { addItem }          = useCartStore();
  const { toggle, isWished } = useWishlistStore();
  const { showToast }        = useToast();

  const wished   = isWished(pid(p));
  const discount = p.compareAtPrice ? Math.round((1 - p.price / p.compareAtPrice) * 100) : 0;
  const PALETTE  = p.type === 'footwear'
    ? ['#1a1a1a', '#8B4513', '#c8a96b', '#ffffff']
    : ['#d4e8e0', '#a8b5c4', '#212836'];

  const handleQuickAdd = e => {
    e.preventDefault(); e.stopPropagation();
    addItem(p, { size: p.footwearDetails?.sizes?.[0], qty: 1 });
    showToast(`✓ ${p.name} added to cart`);
  };

  const handleWish = e => {
    e.preventDefault(); e.stopPropagation();
    const added = toggle(p);
    showToast(added ? '♥ Added to wishlist' : 'Removed from wishlist');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Link to={`/products/${p.slug}`} className="product-card group block">
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: 240, background: 'var(--cream)' }}>
          {p.images?.[0] ? (
            <img src={p.images[0]} alt={p.name}
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                 loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl select-none">
              {p.type === 'footwear' ? '👠' : '🏺'}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {p.tags?.includes('new')        && <span className="badge badge-new">New</span>}
            {discount > 0                    && <span className="badge badge-sale">−{discount}%</span>}
            {p.tags?.includes('bestseller') && <span className="badge badge-best">Bestseller</span>}
            {p.tags?.includes('featured')   && <span className="badge badge-featured">Featured</span>}
            {p.stock > 0 && p.stock < 10    && <span className="badge badge-low">Only {p.stock} left</span>}
          </div>

          {/* Wishlist */}
          <button onClick={handleWish}
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    wished
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-white/90 border border-black/8 hover:border-red-200'
                  }`}
                  aria-label="Wishlist">
            <svg width="14" height="14" viewBox="0 0 24 24"
                 fill={wished ? '#e05252' : 'none'}
                 stroke={wished ? '#e05252' : '#aaa'}
                 strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>

          {/* Quick add */}
          <button onClick={handleQuickAdd}
                  className="quick-add absolute bottom-3 left-3 right-3 text-white text-xs font-semibold py-2.5 rounded-full text-center"
                  style={{ background: 'rgba(33,40,54,.88)', backdropFilter: 'blur(8px)' }}>
            Quick Add to Cart
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="text-[10px] uppercase tracking-[1px] mb-1"
               style={{ color: 'var(--ink-soft)' }}>
            {p.category}
          </div>
          <h3 className="text-sm font-medium leading-snug mb-2 line-clamp-2"
              style={{ color: 'var(--ink)' }}>
            {p.name}
          </h3>

          {p.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs tracking-[1px]" style={{ color: '#c9a840' }}>
                {'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5 - Math.floor(p.rating))}
              </span>
              <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>({p.reviewCount})</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold" style={{ color: 'var(--teal)' }}>
              {fmt(p.price)}
            </span>
            {p.compareAtPrice > 0 && (
              <span className="text-xs line-through" style={{ color: 'var(--ink-soft)' }}>
                {fmt(p.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="flex gap-1.5 mt-2.5">
            {PALETTE.map((color, i) => (
              <button key={i}
                      onClick={e => { e.preventDefault(); setActiveColor(i); }}
                      className="w-3.5 h-3.5 rounded-full border-2 transition-all duration-150"
                      style={{
                        background:  color,
                        borderColor: activeColor === i ? 'var(--ink)' : 'transparent',
                        transform:   activeColor === i ? 'scale(1.15)' : 'scale(1)',
                        boxShadow:   color === '#ffffff' ? 'inset 0 0 0 1px #ddd' : 'none',
                      }} />
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
