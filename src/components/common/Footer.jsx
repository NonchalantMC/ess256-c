import { useState } from 'react';
import { Link } from 'react-router-dom';

function NewsletterRow() {
  const [email,  setEmail]  = useState('');
  const [subMsg, setSubMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSubMsg('✓ Subscribed! Your 10% off code is on its way.');
    setEmail('');
    setTimeout(() => setSubMsg(''), 5000);
  };

  return (
    <div className="border-t pt-6 mb-5" style={{borderColor:'rgba(255,255,255,.08)'}}>
      <p className="text-sm font-semibold text-white mb-1">Get 10% off your first order</p>
      <p className="text-[12px] mb-3" style={{color:'rgba(255,255,255,.4)'}}>
        New arrivals &amp; exclusive offers — no spam, ever.
      </p>
      {subMsg ? (
        <p className="text-[13px] font-medium" style={{color:'#86e8c4'}}>{subMsg}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                 placeholder="Your email address" required
                 className="flex-1 rounded-full px-4 py-2 text-sm outline-none"
                 style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.16)',color:'#fff'}} />
          <button type="submit"
                  className="rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors"
                  style={{background:'var(--teal)',color:'#fff'}}
                  onMouseEnter={e => e.currentTarget.style.background='var(--teal-mid)'}
                  onMouseLeave={e => e.currentTarget.style.background='var(--teal)'}>
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}

const FOOTER_LINKS = [
  { col:'Shop',    links:[{label:'Footwear',to:'/footwear'},{label:'Interior Decor',to:'/decor'},{label:'Collections',to:'/products'},{label:'New Arrivals',to:'/products?tag=new'},{label:'Sale',to:'/products?tag=sale'}] },
  { col:'Help',    links:[{label:'Size Guide',to:'/size-guide'},{label:'Returns Policy',to:'/returns'},{label:'Track Order',to:'/profile?tab=orders'},{label:'Contact Us',to:'/contact'},{label:'WhatsApp',href:'https://wa.me/256700000000',external:true}] },
  { col:'Company', links:[{label:'About Us',to:'/about'},{label:'Blog',to:'/blog'},{label:'Privacy Policy',to:'/privacy'},{label:'Terms of Service',to:'/terms'}] },
];

const SOCIALS = [
  {label:'X',  href:'https://twitter.com'},
  {label:'in', href:'https://linkedin.com'},
  {label:'IG', href:'https://instagram.com'},
  {label:'WA', href:'https://wa.me/256700000000'},
];

export default function Footer() {
  return (
    <footer style={{background:'var(--ink)',color:'rgba(255,255,255,.55)'}}
            className="px-7 pt-10 pb-20 md:pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-6">

          {/* Brand */}
          <div>
            <Link to="/" className="block mb-0.5">
              <div className="font-serif italic text-[20px] text-white">Essentials256</div>
            </Link>
            <div className="text-[9px] tracking-[2.5px] uppercase mb-4"
                 style={{color:'var(--teal-mid)'}}>
              Uganda
            </div>
            <p className="text-[13px] leading-relaxed mb-4" style={{color:'rgba(255,255,255,.45)'}}>
              Premium ladies footwear and interior decor for the modern African woman.
            </p>
            <div className="flex gap-2">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                   className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center text-[10px] font-bold transition-colors"
                   style={{color:'rgba(255,255,255,.55)'}}
                   onMouseEnter={e => { e.currentTarget.style.borderColor='var(--teal)'; e.currentTarget.style.color='#86e8c4'; }}
                   onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.15)'; e.currentTarget.style.color='rgba(255,255,255,.55)'; }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map(col => (
            <div key={col.col}>
              <div className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3"
                   style={{color:'rgba(255,255,255,.8)'}}>
                {col.col}
              </div>
              {col.links.map(link =>
                link.external ? (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                     className="block text-[13px] mb-2 transition-colors hover:text-white"
                     style={{color:'rgba(255,255,255,.55)'}}>
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.label} to={link.to}
                        className="block text-[13px] mb-2 transition-colors hover:text-white"
                        style={{color:'rgba(255,255,255,.55)'}}>
                    {link.label}
                  </Link>
                )
              )}
            </div>
          ))}
        </div>

        <NewsletterRow />

        <div className="border-t pt-4 flex flex-col sm:flex-row justify-between text-[12px] gap-2"
             style={{borderColor:'rgba(255,255,255,.07)',color:'rgba(255,255,255,.4)'}}>
          <span>© {new Date().getFullYear()} Essentials256. All rights reserved.</span>
          <div className="flex items-center gap-4 flex-wrap">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms"   className="hover:text-white transition-colors">Terms</Link>
            <span>
              Payments by{' '}
              <span style={{color:'#4a9fd4',fontWeight:600}}>PesaPal</span>
              {' '}· SSL Encrypted
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
