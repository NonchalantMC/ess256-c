import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../../stores';

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const { count, openCart }       = useCartStore();
  const { user, token, logout }   = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();

  const loggedIn = !!token;
  const isAdmin  = user?.role === 'admin';

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      {/* Promo bar */}
      <div style={{background:'#212836', color:'rgba(255,255,255,.75)'}}
           className="text-center py-2 px-4 text-xs tracking-wide">
        ✨ Use code{' '}
        <span style={{color:'#86e8c4'}} className="font-semibold">WELCOME10</span>
        {' '}for 10% off your first order
      </div>

      <nav className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : ''
      }`}
           style={{borderColor:'var(--border)', background: scrolled ? undefined : 'var(--bone)'}}>
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="font-serif italic text-[22px] leading-none" style={{color:'var(--ink)'}}>
              Essentials256
            </div>
            <div className="text-[9px] tracking-[2.5px] uppercase font-medium mt-0.5"
                 style={{color:'var(--teal)'}}>
              Uganda
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {[
              {label:'Home',     to:'/'},
              {label:'Footwear', to:'/footwear'},
              {label:'Decor',    to:'/decor'},
              {label:'Sale',     to:'/products?tag=sale'},
            ].map(link => (
              <Link key={link.to} to={link.to}
                    className="px-4 py-2 rounded-full text-sm border transition-all duration-200"
                    style={isActive(link.to)
                      ? {color:'var(--teal)',background:'var(--teal-pale)',borderColor:'rgba(30,128,95,.15)',fontWeight:500}
                      : {color:'var(--ink-mid)',borderColor:'transparent'}}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">

            {/* Account */}
            {loggedIn ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(o => !o)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all"
                        style={{borderColor: menuOpen ? 'var(--teal)' : 'var(--border)'}}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                       style={{background:'var(--teal)'}}>
                    {user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="hidden sm:block text-sm max-w-[90px] truncate"
                        style={{color:'var(--ink-mid)'}}>
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${menuOpen?'rotate-180':''}`}
                       style={{color:'var(--ink-soft)'}}
                       fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border py-2 z-50"
                         style={{borderColor:'var(--border)',boxShadow:'0 8px 32px rgba(33,40,54,.12)'}}>
                      <div className="px-4 py-2 border-b mb-1" style={{borderColor:'var(--border)'}}>
                        <div className="text-sm font-semibold truncate" style={{color:'var(--ink)'}}>{user?.name}</div>
                        <div className="text-xs truncate" style={{color:'var(--ink-soft)'}}>{user?.email}</div>
                      </div>
                      {[
                        {to:'/profile',             icon:'👤', label:'My Account'},
                        {to:'/profile?tab=orders',  icon:'📦', label:'My Orders'},
                        {to:'/profile?tab=wishlist',icon:'♡',  label:'Wishlist'},
                      ].map(item => (
                        <Link key={item.to} to={item.to}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bone)]"
                              style={{color:'var(--ink-mid)'}}>
                          <span>{item.icon}</span> {item.label}
                        </Link>
                      ))}
                      {isAdmin && (
                        <>
                          <div className="border-t my-1" style={{borderColor:'var(--border)'}} />
                          <Link to="/admin"
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors"
                                style={{color:'var(--teal)'}}>
                            <span>⚙️</span> Admin Dashboard
                          </Link>
                        </>
                      )}
                      <div className="border-t my-1" style={{borderColor:'var(--border)'}} />
                      <button onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-[#fef2f2]"
                              style={{color:'#e05252'}}>
                        <span>→</span> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login"
                    className="hidden sm:flex items-center px-4 py-2 rounded-full border text-sm transition-all"
                    style={{borderColor:'var(--border)',color:'var(--ink-mid)'}}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--teal)'; e.currentTarget.style.color='var(--teal)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--ink-mid)'; }}>
                Sign In
              </Link>
            )}

            {/* Cart */}
            <button onClick={openCart}
                    className="relative flex items-center gap-2 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
                    style={{background:'var(--ink)'}}
                    onMouseEnter={e => e.currentTarget.style.background='var(--ink-mid)'}
                    onMouseLeave={e => e.currentTarget.style.background='var(--ink)'}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span className="hidden sm:block">Cart</span>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                      style={{background:'#86e8c4',color:'var(--ink)'}}>
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
