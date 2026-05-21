import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore } from '../stores';

const fmt = (n) => `UGX ${n?.toLocaleString()}`;

export default function Cart() {
  const { items, updateQty, removeItem, subtotal, shipping, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-6xl">🛒</div>
        <h2 className="font-serif text-2xl">Your cart is empty</h2>
        <p className="text-gray-400 text-sm">Browse our collection and add items you love</p>
        <Link to="/" className="btn-sage px-6 py-3 text-sm">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-serif text-3xl mb-8">Shopping Cart <span className="text-lg font-sans font-normal text-gray-400 ml-2">({items.length} items)</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, i) => (
            <motion.div
              key={item.key}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-4"
            >
              <div className="w-20 h-20 bg-cream rounded-xl flex items-center justify-center text-3xl flex-shrink-0 border border-gray-100">
                {item.product.images?.[0]
                  ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover rounded-xl" />
                  : (item.product.type === 'footwear' ? '👠' : '🏺')
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{item.product.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.size ? `EU ${item.size}` : item.product.category}
                      {item.color ? ` · ${item.color}` : ''}
                    </p>
                  </div>
                  <button onClick={() => removeItem(item.key)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-full">
                    <button onClick={() => updateQty(item.key, item.qty - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors text-gray-600">−</button>
                    <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                    <button onClick={() => updateQty(item.key, item.qty + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors text-gray-600">+</button>
                  </div>
                  <span className="font-semibold text-sage-600">{fmt(item.product.price * item.qty)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-24">
            <h3 className="font-semibold text-base mb-5">Order Summary</h3>

            {/* Coupon */}
            <div className="flex gap-2 mb-5">
              <input type="text" placeholder="Coupon code" className="form-input flex-1 py-2 text-sm" />
              <button className="bg-gray-100 border border-gray-100 rounded-xl px-4 text-sm font-medium hover:bg-gray-200 transition-colors">Apply</button>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div className="flex justify-between text-gray-600">
              
            </div>

            <hr className="border-gray-100 mb-4" />
            <div className="flex justify-between font-bold text-base mb-5">
              <span>Total</span>
              <span className="text-sage-600">{fmt(total)}</span>
            </div>

            <Link to="/checkout" className="btn-sage w-full py-3.5 text-sm font-semibold text-center block">
              🔒 Proceed to Checkout
            </Link>

            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
              <span>🔒</span>
              <span>Secure checkout via PesaPal</span>
            </div>

            <div className="flex justify-center gap-2 mt-3">
              {['MTN MoMo','Airtel','Visa','Mastercard'].map(m => (
                <span key={m} className="text-[9px] bg-gray-50 border border-gray-100 px-1.5 py-1 rounded text-gray-400">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
