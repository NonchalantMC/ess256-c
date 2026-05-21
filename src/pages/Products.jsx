import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../services/api';
import ProductCard from '../components/products/ProductCard';

const SIZES  = [35,36,37,38,39,40,41,42];
const STYLES = ['Modern','Boho','Minimalist','Vintage','Abstract','Natural'];
const ROOMS  = ['Living Room','Bedroom','Kitchen','Office','Balcony'];
const SORTS  = [
  { value: '-createdAt', label: 'Newest First'     },
  { value: 'price',      label: 'Price: Low → High' },
  { value: '-price',     label: 'Price: High → Low' },
  { value: '-rating',    label: 'Top Rated'          },
];

export default function Products({ type }) {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    size:     '',
    style:    '',
    room:     '',
    sort:     '-createdAt',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const query = {
        ...(type && { type }),
        status:   'active',
        sort:     filters.sort,
        page,
        limit:    20,
        ...(params.get('search')   && { search:   params.get('search') }),
        ...(params.get('tag')      && { tags:     params.get('tag') }),
        ...(params.get('featured') && { featured: params.get('featured') }),
        ...(filters.minPrice       && { minPrice: filters.minPrice }),
        ...(filters.maxPrice       && { maxPrice: filters.maxPrice }),
        ...(filters.size           && { size:     filters.size }),
        ...(filters.style          && { style:    filters.style }),
        ...(filters.room           && { room:     filters.room }),
      };
      const { data } = await productService.list(query);
      setProducts(data.products || []);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [type, filters, page, params]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', size: '', style: '', room: '', sort: '-createdAt' });
    setPage(1);
  };

  const title = type === 'footwear' ? '👠 Ladies Footwear' : type === 'decor' ? '🏺 Interior Decor' : '🛍️ All Products';
  const activeFilters = Object.values(filters).filter(v => v && v !== '-createdAt').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl">{title}</h1>
          <p className="text-sm text-gray-400 mt-1">{total} products</p>
        </div>
        <div className="flex gap-3 items-center">
          {/* Sort */}
          <select
            value={filters.sort}
            onChange={e => updateFilter('sort', e.target.value)}
            className="form-input py-2 text-sm w-auto"
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
              activeFilters > 0 ? 'border-sage-500 text-sage-600 bg-sage-50' : 'border-gray-200 text-gray-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters
            {activeFilters > 0 && <span className="w-5 h-5 rounded-full bg-sage-500 text-white text-xs flex items-center justify-center">{activeFilters}</span>}
          </button>
        </div>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-sm">Filter Products</span>
                {activeFilters > 0 && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear all</button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {/* Price range */}
                <div>
                  <label className="block text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Price (UGX)</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)}
                      className="form-input py-2 text-sm w-24" />
                    <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)}
                      className="form-input py-2 text-sm w-24" />
                  </div>
                </div>

                {/* Size (footwear only) */}
                {(!type || type === 'footwear') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">EU Size</label>
                    <div className="flex flex-wrap gap-1.5">
                      {SIZES.map(s => (
                        <button key={s} onClick={() => updateFilter('size', filters.size == s ? '' : s)}
                          className={`w-9 h-9 rounded-lg text-xs font-medium border transition-colors ${
                            filters.size == s ? 'border-sage-500 bg-sage-50 text-sage-600' : 'border-gray-200 hover:border-gray-300'
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decor style */}
                {(!type || type === 'decor') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Style</label>
                    <div className="flex flex-wrap gap-1.5">
                      {STYLES.map(s => (
                        <button key={s} onClick={() => updateFilter('style', filters.style === s ? '' : s)}
                          className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                            filters.style === s ? 'border-sage-500 bg-sage-50 text-sage-600' : 'border-gray-200 hover:border-gray-300'
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Room */}
                {(!type || type === 'decor') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Room</label>
                    <select value={filters.room} onChange={e => updateFilter('room', e.target.value)} className="form-input py-2 text-sm">
                      <option value="">All Rooms</option>
                      {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search result header */}
      {params.get('search') && (
        <div className="mb-5 flex items-center gap-2">
          <span className="text-sm text-gray-500">Results for:</span>
          <span className="bg-sage-50 text-sage-700 text-sm font-medium px-3 py-1 rounded-full border border-sage-100">
            "{params.get('search')}"
          </span>
          <button onClick={() => setParams({})} className="text-xs text-gray-400 hover:text-red-400 ml-1">✕ Clear</button>
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-medium text-gray-700 mb-2">No products found</p>
          <p className="text-sm text-gray-400 mb-6">Try adjusting your filters or search term</p>
          <button onClick={clearFilters} className="btn-sage px-5 py-2.5 text-sm">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p, i) => <ProductCard key={p._id || p.id} product={p} index={i} />)}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-10">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-outline border-gray-200 px-5 py-2.5 text-sm disabled:opacity-40">← Previous</button>
          <span className="px-5 py-2.5 text-sm text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
          <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)} className="btn-outline border-gray-200 px-5 py-2.5 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
