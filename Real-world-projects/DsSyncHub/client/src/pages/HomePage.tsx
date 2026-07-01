import { Menu, X, Shield, Sparkles, Code, Lock, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const BrandLogo = ({ className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <img src="/logo_icon.svg" alt="DsSync Hub Icon" className="w-8 h-8 shrink-0 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
    <span className="text-xl font-bold text-white tracking-tight">DsSync Hub</span>
  </div>
)

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Roadmap', href: '#roadmap' },
]

const statsBoxes = [
  { icon: <Shield size={24} className="text-brand-500" />, title: 'Privacy First', subtitle: 'Zero Knowledge Architecture', sparkline: 'M0,10 Q5,5 10,12 T20,8 T30,15 T40,5 T50,10', color: '#10b981' },
  { icon: <Sparkles size={24} className="text-brand-500" />, title: 'AI Powered', subtitle: 'Intelligent Workflows', sparkline: 'M0,15 Q10,5 20,12 T35,8 T50,14', color: '#10b981' },
  { icon: <Lock size={24} className="text-brand-500" />, title: 'E2E Encrypted', subtitle: '256-bit AES Encryption', sparkline: 'M0,10 L5,10 L10,10 L15,10 L20,10 L25,10 L30,10 L35,10 L40,10 L45,10 L50,10', isDashed: true, color: '#10b981' },
  { icon: <Code size={24} className="text-brand-500" />, title: 'Dev Friendly', subtitle: 'Powerful API & Webhooks', sparkline: 'M0,12 Q10,18 20,8 T35,12 T50,5', color: '#10b981' },
]

const HomePage = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="w-full min-h-screen text-zinc-300 font-sans selection:bg-brand-500/30 selection:text-white pb-10 flex flex-col relative overflow-hidden">
      
      {/* Navbar */}
      <header className="relative z-40 w-full pt-6">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 lg:px-12">
          <Link className="flex items-center gap-3 transition-transform hover:scale-105" to="/">
            <BrandLogo />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                className="text-sm font-medium text-zinc-300 transition-colors hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                href={item.href}
                key={item.label}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              className="rounded p-2 text-zinc-400 hover:glass-card/10 lg:hidden transition-colors"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link className="hidden rounded-lg border border-white/20 bg-black/20 backdrop-blur-md px-6 py-2.5 text-sm font-medium text-zinc-200 hover:glass-card/10 hover:border-white/40 transition-all sm:inline-flex" to="/login">
              Login
            </Link>
            <Link className="hidden lg:inline-flex rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-brand-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all items-center gap-2" to="/signup">
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileNavOpen && (
          <div className="absolute top-full left-0 w-full border-b border-white/10 bg-black/60 backdrop-blur-2xl p-6 lg:hidden shadow-2xl animate-fade-rise z-50">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  className="text-sm font-medium text-zinc-200"
                  href={item.href}
                  key={item.label}
                  onClick={() => setMobileNavOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <hr className="border-white/10 my-2" />
              <Link className="rounded-lg border border-white/20 px-5 py-3 text-center text-sm font-medium text-zinc-200 glass-card/5" to="/login">
                Login
              </Link>
              <Link className="rounded-lg bg-brand-500 px-5 py-3 text-center text-sm font-bold text-white shadow-lg" to="/signup">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-6 lg:px-12 pt-16 pb-12">
        <div className="mx-auto w-full max-w-[1400px] h-full flex flex-col justify-between">
          
          <div className="flex justify-between items-start w-full">
            {/* Left side text */}
            <div className="animate-fade-rise max-w-2xl mt-12 lg:mt-24">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-400 mb-8 flex gap-4 drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]">
                <span>COLLABORATE</span>
                <span className="opacity-50">•</span>
                <span>ORGANIZE</span>
                <span className="opacity-50">•</span>
                <span>ACHIEVE</span>
              </p>
              
              <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-bold tracking-tight text-white leading-[1.05] mb-8 font-serif drop-shadow-xl">
                One Workspace.<br />
                <span className="text-brand-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">Limitless</span> Potential.
              </h1>
              
              <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed mb-10 max-w-xl font-light drop-shadow-md">
                DsSync Hub is your all-in-one platform to manage tasks, notes, teams, and projects — built for high-performance teams <strong className="text-white font-medium">who build the future.</strong>
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-5 mb-12">
                <Link className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-8 py-4 text-sm font-bold text-white hover:bg-brand-400 transition-all shadow-[0_0_24px_rgba(16,185,129,0.4)] hover:shadow-[0_0_36px_rgba(16,185,129,0.6)] w-full sm:w-auto" to="/signup">
                  Start Free Trial <ArrowRight className="ml-2" size={18} />
                </Link>
                <button className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-black/20 backdrop-blur-md px-8 py-4 text-sm font-semibold text-white hover:glass-card/10 hover:border-white/40 transition-all shadow-lg w-full sm:w-auto">
                   Explore Features
                </button>
              </div>
              
              <div className="flex flex-wrap gap-5 sm:gap-8 text-xs sm:text-sm text-zinc-300 font-medium tracking-wide">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded glass-card/10 flex items-center justify-center"><Shield size={10} className="text-white" /></div> Secure by Design</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded glass-card/10 flex items-center justify-center"><Sparkles size={10} className="text-white" /></div> Powered by AI</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded glass-card/10 flex items-center justify-center"><Code size={10} className="text-white" /></div> Multi-tenant</div>
              </div>
            </div>

            {/* Right side giant DS Logo (Absolute) */}
            <div className="hidden lg:block absolute top-[10%] right-[15%] opacity-60 pointer-events-none animate-float">
               <img src="/logo_icon.svg" className="w-[320px] h-[320px] drop-shadow-[0_0_100px_rgba(99,102,241,0.5)]" alt="" />
            </div>

            {/* Vertical right side dots */}
            <div className="hidden lg:flex flex-col items-center gap-8 mt-24 animate-fade-rise delay-200">
               <div className="flex flex-col items-center gap-2 relative">
                 <div className="h-16 w-[1px] glass-card/20 absolute -top-20"></div>
                 <span className="text-[10px] font-bold tracking-[0.2em] text-white rotate-90 my-6">FOCUS</span>
                 <div className="w-1.5 h-1.5 rounded-full glass-card/40"></div>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <span className="text-[10px] font-bold tracking-[0.2em] text-white rotate-90 my-6">SYNC</span>
                 <div className="w-1.5 h-1.5 rounded-full glass-card/40"></div>
               </div>
               <div className="flex flex-col items-center gap-2 relative">
                 <span className="text-[10px] font-bold tracking-[0.2em] text-white rotate-90 my-6">BUILD</span>
                 <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
                 <div className="h-32 w-[1px] bg-gradient-to-b from-brand-500 to-transparent absolute top-14"></div>
               </div>
            </div>
          </div>
          
          {/* Bottom Cards */}
          <div className="mt-28 lg:mt-auto w-full">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-20">
                {statsBoxes.map((stat, i) => (
                  <div key={i} className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between animate-fade-rise" style={{ animationDelay: `${i * 100}ms` }}>
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                           {stat.icon}
                        </div>
                        <div>
                           <p className="text-xl font-bold text-white tracking-tight">{stat.title}</p>
                           <p className="text-[11px] text-zinc-400 uppercase tracking-wider mt-1">{stat.subtitle}</p>
                        </div>
                     </div>
                     <div className="w-full h-8 opacity-60">
                       <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 50 20">
                          <path 
                            d={stat.sparkline} 
                            fill="none" 
                            stroke={stat.color} 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeDasharray={stat.isDashed ? "3,3" : "none"}
                            className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" 
                          />
                       </svg>
                     </div>
                  </div>
                ))}
             </div>
             <div className="mt-8 text-center animate-fade-rise delay-400">
               <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 drop-shadow-md">
                 BUILT FOR <span className="text-brand-500">DEVELOPERS</span>. DESIGNED FOR <span className="text-white underline decoration-brand-500/50 underline-offset-4">TEAMS</span>.
               </p>
               <div className="mt-8 flex justify-center pb-4">
                 <div className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center p-1 bg-black/20 backdrop-blur-sm">
                    <div className="w-1 h-2 bg-brand-500 rounded-full animate-bounce shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                 </div>
               </div>
             </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}

export default HomePage
