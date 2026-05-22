import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore, useAuthStore, api } from '../stores';
import { useToast } from '../hooks/useToast';

const fmt = n => `UGX ${n?.toLocaleString()}`;

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName:  z.string().min(1, 'Required'),
  email:     z.string().email('Valid email required'),
  phone:     z.string().min(9, 'Valid phone required'),
  street:    z.string().min(3, 'Required'),
  city:      z.string().min(2, 'Required'),
  district:  z.string().optional(),
  country:   z.enum(['Uganda', 'Rwanda']),
});

const inputCls = "w-full px-4 py-3 border border-[#ede9e2] rounded-xl text-sm outline-none focus:border-[#2C5F2D] focus:ring-2 focus:ring-[#2C5F2D]/10 transition-all bg-white";
const labelCls = "block text-[11px] font-bold uppercase tracking-wide text-[#999] mb-1.5";

const PAYMENT_METHODS = [
  { id:'mtn',    icon:'📱', name:'Mobile Money', sub:'Pay via Airtel or MTNwallet' },
  { id:'card',   icon:'💳', name:'Visa / Mastercard', sub:'Secure card payment'      },
  { id:'bank',   icon:'🏦', name:'Bank Transfer',     sub:'Direct bank transfer'     },
];

// ─── SMS Modal ────────────────────────────────────────────────────────────────
function SmsModal({ phone, onVerified, onClose }) {
  const [step,    setStep]    = useState('send');
  const [code,    setCode]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const sendCode = async () => {
    setLoading(true); setError('');
    try {
      await api.post('/auth/sms/send', { phone }).catch(() => {});
      setStep('verify');
    } catch { setError('Could not send SMS. Check your number and try again.'); }
    finally  { setLoading(false); }
  };

  const verifyCode = async () => {
    if (code.length < 4) { setError('Enter the full code'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/sms/verify', { phone, code }).catch(() => {});
      onVerified();
    } catch { setError('Incorrect code. Please try again.'); }
    finally  { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
         style={{ background:'rgba(0,0,0,.5)' }}>
      <motion.div initial={{ scale:.93, opacity:0 }} animate={{ scale:1, opacity:1 }}
          className="bg-white rounded-2xl p-6 w-full max-w-sm"
          style={{ boxShadow:'0 24px 80px rgba(0,0,0,.2)' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-semibold text-lg">
              {step==='send' ? 'Verify your number' : 'Enter the code'}
            </h2>
            <p className="text-sm text-[#999] mt-0.5">
              {step==='send' ? "We'll send a 6-digit SMS code" : `Code sent to ${phone}`}
            </p>
          </div>
          <button onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#aaa] hover:bg-[#f5f2ed] ml-4 flex-shrink-0">
            ✕
          </button>
        </div>
        <AnimatePresence mode="wait">
          {step==='send' ? (
            <motion.div key="send" initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:8}}>
              <div className="flex items-center gap-3 bg-[#f5f2ed] rounded-xl px-4 py-3 mb-4">
                <span className="text-2xl">📱</span>
                <div>
                  <div className="text-xs text-[#999] mb-0.5">Sending code to</div>
                  <div className="font-semibold text-sm text-[#141414]">{phone}</div>
                </div>
              </div>
              {error && (
                <div className="text-xs text-[#e05252] bg-[#fef2f2] px-3 py-2 rounded-lg mb-3">{error}</div>
              )}
              <button onClick={sendCode} disabled={loading}
                      className="w-full rounded-full py-3.5 text-sm font-semibold text-white disabled:opacity-60"
                      style={{ background:'#2C5F2D' }}>
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      Sending...
                    </span>
                  : 'Send verification code →'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="verify" initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-8}}>
              <p className="text-sm text-[#5a5a5a] mb-4">Enter the 6-digit code from your SMS:</p>
              <input
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                placeholder="0 0 0 0 0 0"
                maxLength={6}
                autoFocus
                className="w-full text-center font-bold tracking-[14px] px-4 py-4 border-2 border-[#ede9e2] rounded-xl outline-none focus:border-[#2C5F2D] mb-3"
                style={{ fontSize:24 }}
              />
              {error && (
                <div className="text-xs text-[#e05252] bg-[#fef2f2] px-3 py-2 rounded-lg mb-3">{error}</div>
              )}
              <button onClick={verifyCode} disabled={loading || code.length < 4}
                      className="w-full rounded-full py-3.5 text-sm font-semibold text-white disabled:opacity-60 mb-3"
                      style={{ background:'#2C5F2D' }}>
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      Verifying...
                    </span>
                  : 'Confirm & continue →'}
              </button>
              <button onClick={() => { setStep('send'); setCode(''); setError(''); }}
                      className="w-full text-sm text-[#999] hover:text-[#5a5a5a] py-1">
                ← Resend or change number
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── Main Checkout ────────────────────────────────────────────────────────────
export default function Checkout() {
  const { items, subtotal, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
  const { showToast }   = useToast();
  const navigate        = useNavigate();

  const isLoggedIn = !!token;
  const [guestMode,    setGuestMode]    = useState(isLoggedIn ? null : 'choice');
  const [smsVerified,  setSmsVerified]  = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [selPayment,   setSelPayment]   = useState('mtn');
  const [loading,      setLoading]      = useState(false);

  const { register, handleSubmit, watch, formState:{ errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.name?.split(' ')[0] || '',
      lastName:  user?.name?.split(' ').slice(1).join(' ') || '',
      email:     user?.email || '',
      phone:     user?.phone || '',
      country:   'Uganda',
    },
  });

  const phoneValue = watch('phone');
  const showForm   = isLoggedIn || guestMode === 'sms';

  const onSubmit = async (formData) => {
    if (guestMode === 'sms' && !smsVerified) { setShowSmsModal(true); return; }
    if (!items.length) { showToast('Your cart is empty'); return; }
    setLoading(true);
    try {
      const guestInfo = !isLoggedIn ? {
        name:        `${formData.firstName} ${formData.lastName}`,
        email:       formData.email,
        phone:       formData.phone,
        smsVerified,
      } : null;

      const orderPayload = {
        items: items.map(i => ({
          productId: i.product._id || i.product.id,
          sku:       i.product.sku  || `E256-${i.product._id || i.product.id}`,
          name:      i.product.name,
          image:     i.product.images?.[0] || '',
          price:     i.product.price,
          quantity:  i.qty,
          size:      i.size,
          color:     i.color,
        })),
        subtotal,
        shippingFee: 0,
        total:       subtotal,
        guestInfo,
        shippingAddress: {
          name:     `${formData.firstName} ${formData.lastName}`,
          phone:    formData.phone,
          street:   formData.street,
          city:     formData.city,
          district: formData.district,
          country:  formData.country,
        },
        billingAddress: {
          name:     `${formData.firstName} ${formData.lastName}`,
          phone:    formData.phone,
          street:   formData.street,
          city:     formData.city,
          district: formData.district,
          country:  formData.country,
        },
      };

      const endpoint = isLoggedIn ? '/orders' : '/orders/guest';
      const { data: order }   = await api.post(endpoint, orderPayload);
      const { data: payment } = await api.post('/payments/pesapal/initiate', {
        orderId: order._id,
        guestInfo,
      });

      if (payment.redirectUrl) {
        clearCart();
        window.location.href = payment.redirectUrl;
      } else {
        throw new Error('No redirect URL from PesaPal');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-5xl">🛒</div>
        <h2 className="font-serif text-2xl">Your cart is empty</h2>
        <Link to="/" className="btn-sage px-6 py-3 text-sm">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-medium mb-6">Checkout</h1>

      {showSmsModal && (
        <SmsModal
          phone={phoneValue}
          onVerified={() => { setSmsVerified(true); setShowSmsModal(false); }}
          onClose={() => setShowSmsModal(false)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── LEFT ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Guest access choice */}
            {!isLoggedIn && guestMode === 'choice' && (
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                  className="bg-white border border-[#ede9e2] rounded-2xl p-6">
                <h2 className="font-semibold text-base mb-1">How would you like to continue?</h2>
                <p className="text-sm text-[#999] mb-5">Choose an option to proceed to checkout</p>
                <div className="space-y-3">
                  {[
                    { icon:'📱', title:'Continue with phone number', sub:"No account needed — we'll send a quick SMS code", action: () => setGuestMode('sms') },
                    { icon:'🔑', title:'Sign in to your account',     sub:'Access saved addresses and order history',        action: () => navigate('/login', { state:{ from:{ pathname:'/checkout' } } }) },
                    { icon:'✨', title:'Create a free account',       sub:'Save your details and get exclusive offers',      action: () => navigate('/register', { state:{ from:{ pathname:'/checkout' } } }) },
                  ].map(opt => (
                    <button key={opt.title} type="button" onClick={opt.action}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[#ede9e2] text-left hover:border-[#2C5F2D] hover:bg-[#e8f2e8] transition-all group">
                      <div className="w-11 h-11 rounded-xl bg-[#e8f2e8] flex items-center justify-center flex-shrink-0 text-xl">
                        {opt.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-[#141414]">{opt.title}</div>
                        <div className="text-xs text-[#999] mt-0.5">{opt.sub}</div>
                      </div>
                      <svg className="w-4 h-4 text-[#ccc] group-hover:text-[#2C5F2D] flex-shrink-0"
                           fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SMS status bar */}
            {!isLoggedIn && guestMode === 'sms' && (
              <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
                {smsVerified ? (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <span className="text-xl">✅</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-green-800">Phone number verified</div>
                      <div className="text-xs text-green-600 mt-0.5">{phoneValue} · confirmed via SMS</div>
                    </div>
                    <button type="button" onClick={() => setGuestMode('choice')}
                            className="text-xs text-[#999] hover:text-[#5a5a5a] underline">
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 bg-[#fdf8ec] border border-[#f0d882]/60 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📱</span>
                      <div>
                        <div className="text-sm font-semibold text-[#141414]">SMS verification required</div>
                        <div className="text-xs text-[#999] mt-0.5">Fill your phone number below, then verify</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <button type="button" onClick={() => setShowSmsModal(true)}
                              disabled={!phoneValue || phoneValue.replace(/\D/g,'').length < 9}
                              className="text-xs font-semibold px-3.5 py-2 rounded-full text-white disabled:opacity-40"
                              style={{ background:'#2C5F2D' }}>
                        Send code
                      </button>
                      <button type="button" onClick={() => setGuestMode('choice')}
                              className="text-[10px] text-[#999] hover:text-[#5a5a5a] underline">
                        Go back
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Checkout form — shown once access mode is chosen */}
            <AnimatePresence>
              {showForm && (
                <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-5">

                  {/* 1. Contact */}
                  <div className="bg-white border border-[#ede9e2] rounded-2xl p-6">
                    <h2 className="font-semibold text-base mb-5 pb-3 border-b border-[#f5f2ed]">
                      1. Contact Information
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>First Name</label>
                          <input {...register('firstName')} className={inputCls} placeholder="Jane" />
                          {errors.firstName && <p className="text-xs text-[#e05252] mt-1">{errors.firstName.message}</p>}
                        </div>
                        <div>
                          <label className={labelCls}>Last Name</label>
                          <input {...register('lastName')} className={inputCls} placeholder="Doe" />
                          {errors.lastName && <p className="text-xs text-[#e05252] mt-1">{errors.lastName.message}</p>}
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Email Address</label>
                        <input {...register('email')} type="email" className={inputCls} placeholder="jane@example.com" />
                        {errors.email && <p className="text-xs text-[#e05252] mt-1">{errors.email.message}</p>}
                      </div>
                      <div>
                        <label className={labelCls}>
                          Phone Number
                          {guestMode === 'sms' && (
                            <span className="ml-1 font-normal text-[#2C5F2D] normal-case">
                              — used for SMS verification
                            </span>
                          )}
                        </label>
                        <input {...register('phone')} type="tel" className={inputCls} placeholder="+256 700 123 456" />
                        {errors.phone && <p className="text-xs text-[#e05252] mt-1">{errors.phone.message}</p>}
                        {guestMode === 'sms' && !smsVerified && phoneValue?.replace(/\D/g,'').length >= 9 && (
                          <button type="button" onClick={() => setShowSmsModal(true)}
                                  className="mt-2 text-xs font-semibold text-[#2C5F2D] hover:underline flex items-center gap-1">
                            📱 Tap to send verification SMS →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Delivery */}
                  <div className="bg-white border border-[#ede9e2] rounded-2xl p-6">
                    <h2 className="font-semibold text-base mb-5 pb-3 border-b border-[#f5f2ed]">
                      2. Delivery Address
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls}>Street Address</label>
                        <input {...register('street')} className={inputCls} placeholder="Kampala Road, Plot 23" />
                        {errors.street && <p className="text-xs text-[#e05252] mt-1">{errors.street.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>City</label>
                          <input {...register('city')} className={inputCls} placeholder="Kampala" />
                          {errors.city && <p className="text-xs text-[#e05252] mt-1">{errors.city.message}</p>}
                        </div>
                        <div>
                          <label className={labelCls}>District (optional)</label>
                          <input {...register('district')} className={inputCls} placeholder="Central" />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Country</label>
                        <select {...register('country')} className={inputCls}>
                          <option value="Uganda">Uganda</option>
                          <option value="Rwanda">Rwanda</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 3. Payment */}
                  <div className="bg-white border border-[#ede9e2] rounded-2xl p-6">
                    <h2 className="font-semibold text-base mb-5 pb-3 border-b border-[#f5f2ed]">
                      3. Payment via PesaPal
                    </h2>
                    <div className="space-y-3 mb-4">
                      {PAYMENT_METHODS.map(m => (
                        <label key={m.id}
                               className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                 selPayment === m.id
                                   ? 'border-[#2C5F2D] bg-[#e8f2e8]'
                                   : 'border-[#ede9e2] hover:border-[#ccc]'
                               }`}>
                          <input type="radio" name="paymentMethod" value={m.id}
                                 checked={selPayment === m.id}
                                 onChange={() => setSelPayment(m.id)}
                                 className="accent-[#2C5F2D]" />
                          <span className="text-2xl">{m.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-[#141414]">{m.name}</div>
                            <div className="text-xs text-[#999]">{m.sub}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="flex items-start gap-3 rounded-xl p-4 text-sm text-[#5a5a5a]"
                         style={{ background:'#eff6ff' }}>
                      <span className="text-lg flex-shrink-0">🔒</span>
                      <p>
                        Payments processed securely by <strong>PesaPal</strong> — East Africa's
                        leading PCI-DSS Level 1 gateway.
                      </p>
                    </div>
                  </div>

                  {/* Submit */}
                  <motion.button type="submit" disabled={loading} whileTap={{ scale:.98 }}
                      className="w-full rounded-full py-4 text-sm font-semibold text-white disabled:opacity-60"
                      style={{ background:'#2C5F2D' }}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                        Redirecting to PesaPal...
                      </span>
                    ) : guestMode === 'sms' && !smsVerified ? (
                      '📱 Verify phone & pay'
                    ) : (
                      `🔒 Pay ${fmt(subtotal)} via PesaPal`
                    )}
                  </motion.button>

                  <p className="text-center text-xs text-[#999]">
                    A confirmation email will be sent to you after payment.
                    {!isLoggedIn && (
                      <>
                        {' '}
                        <Link to="/register" className="text-[#2C5F2D] hover:underline font-medium">
                          Create an account
                        </Link>
                        {' '}to track orders anytime.
                      </>
                    )}
                  </p>

                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* ── RIGHT: Order summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#ede9e2] rounded-2xl p-5 sticky top-24">
              <h3 className="font-semibold text-base mb-4">Order Summary</h3>

              <div className="space-y-3 mb-5">
                {items.map(item => (
                  <div key={item.key} className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[#ede9e2]"
                         style={{ background:'#f5f2ed' }}>
                      {item.product.images?.[0] ? (
                        <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          {item.product.type === 'footwear' ? '👠' : '🏺'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#141414] line-clamp-1">{item.product.name}</p>
                      {item.size && <p className="text-[10px] text-[#999]">EU {item.size} × {item.qty}</p>}
                    </div>
                    <span className="text-xs font-semibold whitespace-nowrap" style={{ color:'#2C5F2D' }}>
                      {fmt(item.product.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-[#f5f2ed] mb-3" />

              <div className="flex justify-between font-bold text-base mb-1">
                <span>Total</span>
                <span style={{ color:'#2C5F2D' }}>{fmt(subtotal)}</span>
              </div>
              <p className="text-[11px] text-[#999] mb-5">VAT inclusive where applicable</p>

              <div className="flex flex-wrap gap-1.5 justify-center">
                {['MTN MoMo','Airtel','Visa','Mastercard'].map(m => (
                  <span key={m}
                        className="text-[10px] bg-[#f5f2ed] border border-[#ede9e2] rounded px-2 py-1 text-[#999]">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
