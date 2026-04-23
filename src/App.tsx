/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef, FormEvent } from "react";
import { 
  Check, 
  ArrowRight,
  Monitor,
  Video,
  Clapperboard,
  Search,
  Target,
  BarChart3,
  Award,
  Youtube,
  Instagram,
  Clapperboard as TikTok,
  Zap,
  ChevronRight,
  AlertCircle,
  Clock,
  ExternalLink,
  MessageCircle,
  Play,
  Mail,
  Info
} from "lucide-react";
import { motion } from "motion/react";

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const [offerScroll, setOfferScroll] = useState({ left: false, right: true });
  const [solutionsScroll, setSolutionsScroll] = useState({ left: false, right: true });
  const [activeOffer, setActiveOffer] = useState<number | null>(0);
  const offerCarouselRef = useRef<HTMLDivElement>(null);
  const solutionsCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("active");
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

    // Handle carousel scroll monitoring
    const detectOfferScroll = () => {
      const el = offerCarouselRef.current;
      if (!el) return;
      setOfferScroll({
        left: el.scrollLeft > 10,
        right: el.scrollLeft < el.scrollWidth - el.clientWidth - 10
      });
    };
    const detectSolutionsScroll = () => {
      const el = solutionsCarouselRef.current;
      if (!el) return;
      setSolutionsScroll({
        left: el.scrollLeft > 10,
        right: el.scrollLeft < el.scrollWidth - el.clientWidth - 10
      });
    };

    const offerEl = offerCarouselRef.current;
    const solEl = solutionsCarouselRef.current;

    offerEl?.addEventListener('scroll', detectOfferScroll);
    solEl?.addEventListener('scroll', detectSolutionsScroll);
    window.addEventListener('resize', detectOfferScroll);
    window.addEventListener('resize', detectSolutionsScroll);

    const resizeObserver = new ResizeObserver(() => {
      detectOfferScroll();
      detectSolutionsScroll();
    });

    if (offerEl) resizeObserver.observe(offerEl);
    if (solEl) resizeObserver.observe(solEl);

    // Initial checks with delays for layout stability
    setTimeout(detectOfferScroll, 100);
    setTimeout(detectSolutionsScroll, 100);
    setTimeout(detectOfferScroll, 600);
    setTimeout(detectSolutionsScroll, 600);
    setTimeout(detectOfferScroll, 2000);
    setTimeout(detectSolutionsScroll, 2000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", detectOfferScroll);
      window.removeEventListener("resize", detectSolutionsScroll);
      offerEl?.removeEventListener('scroll', detectOfferScroll);
      solEl?.removeEventListener('scroll', detectSolutionsScroll);
      resizeObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  const scrollByCard = (carouselRef: React.RefObject<HTMLDivElement>, dir: 'left' | 'right') => {
    if (!carouselRef.current) return;

    const card = carouselRef.current.querySelector('.snap-center') as HTMLElement;
    if (!card) return;

    const gap = 24;
    const cardWidth = card.offsetWidth + gap;

    carouselRef.current.scrollBy({
      left: dir === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth'
    });
  };

  const centerCard = (el: HTMLElement) => {
    el.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest"
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const contactWhatsApp = (planName: string) => {
    const number = "5493416287921"; // Actualized number
    const message = `Hola, quiero más información sobre el plan ${planName}`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const logoUrl = "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=300&auto=format&fit=crop"; // Placeholder for the logo provided, I will use a local asset if I could but I'll use the provided one conceptually

  return (
    <div className="relative min-h-screen w-full bg-bg-dark font-sans selection:bg-accent selection:text-black tactical-bg overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'bg-bg-dark/95 backdrop-blur-md py-4 border-b border-white/5 shadow-2xl' : 'py-8'}`}>
        <div className="container mx-auto flex items-center justify-between px-6 md:px-12">
          <div className="flex items-center gap-3">
            <img src="https://i.postimg.cc/0N7nQMXQ/Logo-DTPG.png" alt="DT PG Logo" className="h-10 w-10 brightness-125 object-contain transition-transform duration-500" onError={(e) => e.currentTarget.src = "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=100&auto=format&fit=crop"} />
            <span className={`text-sm md:text-xl font-black tracking-tighter uppercase italic transition-all duration-500 ${isScrolled ? 'opacity-0 -translate-x-4 pointer-events-none hidden lg:block lg:opacity-100 lg:translate-x-0 lg:pointer-events-auto' : 'opacity-100 translate-x-0'}`}>
              DTPabloGranados
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
            {['Análisis', 'Autoridad', 'Servicios', 'Pack'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-accent transition-colors"
              >
                {item}
              </button>
            ))}
          </div>

          <button 
            onClick={() => scrollToSection('pack')}
            className={`group flex items-center gap-3 bg-accent px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)] ${isScrolled ? 'flex translate-y-0 opacity-100' : 'hidden lg:flex lg:translate-y-0 lg:opacity-100'}`}
          >
            Ver Planes
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      {/* BLOQUE 1 — HERO */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-12 md:pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/80 via-bg-dark to-bg-dark w-full" />
        <div className="absolute top-1/4 -right-20 h-[600px] w-[600px] bg-accent/5 blur-[180px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center text-center px-0 mt-16 md:mt-20 w-full max-w-4xl"
        >
          <div className="bg-white/5 border border-white/10 px-6 py-2 mb-10 inline-flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-accent animate-ping" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">Información que Gana Partidos</span>
          </div>

          <h1 className="clamp-h1 font-black uppercase tracking-tighter leading-[0.85] italic mb-8">
            Competí con<br/>
            <span className="text-accent glow-text">Ventaja</span>
          </h1>

          <p className="max-w-2xl text-xl text-white/40 font-medium leading-relaxed mb-12">
            Videoanálisis profesional de futsal para entrenadores, clubes y jugadores. <br className="hidden md:block"/>
            <span className="text-white">Dejá de improvisar.</span> Empezá a ganar información.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <button 
              onClick={() => scrollToSection('pack')}
              className="w-full sm:w-auto bg-white px-12 py-6 text-sm font-black uppercase tracking-[0.2em] text-black hover:bg-accent transition-all flex items-center justify-center gap-4 group"
            >
              Ver Planes de Análisis
              <Target size={20} />
            </button>
            <button 
              onClick={() => window.open('https://youtube.com/@DTPabloGranados', '_blank')}
              className="w-full sm:w-auto px-12 py-6 text-sm font-black uppercase tracking-[0.2em] text-white/60 border border-white/10 hover:bg-white/5 transition-all"
            >
              Ver ejemplos
            </button>
          </div>
          
          <div className="mt-16 flex items-center gap-4 bg-accent/10 px-6 py-3 border border-accent/20">
             <Clock size={16} className="text-accent" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Entrega garantizada en 24–48 hs</span>
          </div>
        </motion.div>
      </section>

      {/* BLOQUE 2 — IMPACTO VISUAL */}
      <section className="relative z-10 py-16 md:py-32 bg-card-dark/30 border-y border-white/5">
        <div className="container mx-auto w-full px-6 md:px-12 text-center">
          <div className="reveal flex flex-col items-center">
            <div 
              onClick={() => window.open('https://youtu.be/SUz-FCRyIJ4?t=38', '_blank')}
              className="relative sport-card w-full max-w-4xl aspect-video mb-12 overflow-hidden group cursor-pointer"
            >
               <img 
                 src="https://i.postimg.cc/7fw6nR4R/futsal.png" 
                 className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-all duration-700" 
                 alt="Futsal Tactical Insight"
                 onError={(e) => e.currentTarget.src = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200"}
               />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 bg-accent text-black rounded-full flex items-center justify-center shadow-2xl">
                     <Play size={32} fill="currentColor" />
                  </div>
               </div>
               {/* Decorative tactical elements */}
               <div className="absolute top-1/4 left-1/4 h-24 w-24 border-l-2 border-t-2 border-accent/50 group-hover:translate-x-4 group-hover:translate-y-4 transition-all" />
               <div className="absolute bottom-1/4 right-1/4 h-24 w-24 border-r-2 border-b-2 border-accent/50 group-hover:-translate-x-4 group-hover:-translate-y-4 transition-all" />
            </div>
            
            <h2 className="reveal text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
              No es mirar partidos.<br/>
              <span className="text-accent">Es entenderlos.</span>
            </h2>
          </div>
        </div>
      </section>

      {/* BLOQUE 3 & 4 — DOLOR & SOLUCIÓN */}
      <section id="análisis" className="relative z-10 py-16 md:py-32">
        <div className="container mx-auto w-full px-6 md:px-12">
          <div className="grid gap-24 lg:grid-cols-2">
            <div className="reveal">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">El diagnóstico actual</span>
              <h2 className="mt-6 text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.85] text-white/40 mb-12 lg:mb-20">
                La mayoría compite<br/><span className="text-white italic">sin saber:</span>
              </h2>
              <div className="space-y-8 md:space-y-12 lg:space-y-16 group">
                {[
                  "Cómo neutralizar al rival",
                  "Dónde está fallando",
                  "Qué patrones se repiten"
                ].map((item, i) => (
                  <div key={item} className="flex gap-6 md:gap-10 items-center opacity-50 hover:opacity-100 group-hover:scale-[1.02] origin-left transition-all duration-500">
                    <div className="text-3xl md:text-5xl font-black italic text-accent/20 group-hover:text-accent transition-colors">0{i+1}</div>
                    <span className="text-xl md:text-3xl lg:text-4xl font-bold tracking-tighter uppercase italic md:not-italic">{item}</span>
                  </div>
                ))}
              </div>
              <div className="hidden sm:flex mt-10 md:mt-24 py-12 px-6 border-y border-accent/20 bg-accent/5 backdrop-blur-md relative z-10 w-full justify-center">
                <p className="text-sm sm:text-base md:text-xl font-black italic leading-tight text-white uppercase text-center max-w-[280px] sm:max-w-none break-words">
                  Compitiendo así, los resultados negativos <br className="hidden sm:block" />
                  <span className="text-accent underline decoration-2 underline-offset-4 px-1">no son mala suerte.</span> <br className="hidden sm:block" />
                  Son inevitables.
                </p>
              </div>
            </div>

            <div className="reveal flex flex-col justify-center relative">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">¿Qué te ofrezco?</span>
              <h2 className="mt-6 text-4xl md:text-5xl font-black uppercase tracking-tight leading-none mb-12 italic text-accent glow-text">
                Información Útil
              </h2>
              
              <div className="space-y-4 mt-8 md:mt-12">
                {[
                  { 
                    title: "Qué corregir", 
                    desc: "Detección de errores tácticos y estructurales.",
                    forWho: "Equipos con desajustes defensivos recurrentes.",
                    icon: Target,
                    examples: ["Posicionamiento fase defensiva", "Mala ocupación de espacios", "Errores toma de decisión", "Desajustes en marcas"]
                  },
                  { 
                    title: "Qué potenciar", 
                    desc: "Maximización de virtudes existentes.",
                    forWho: "Jugadores y equipos que buscan el salto de calidad.",
                    icon: Zap,
                    examples: ["Fortaleza en el 1vs1", "Efectividad pelota parada", "Velocidad de transición", "Sincronización ofensiva"]
                  },
                  { 
                    title: "Dónde ganar", 
                    desc: "Análisis de vulnerabilidades del oponente.",
                    forWho: "Partidos decisivos contra rivales directos.",
                    icon: Search,
                    examples: ["Debilidad repliegue rival", "Dificultad ante presión alta", "Espacios generados por pivot", "Análisis patrones de salida"]
                  }
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className={`sport-card overflow-hidden transition-all duration-500 border-white/5 ${activeOffer === i ? 'bg-accent/5 border-accent/20' : 'bg-white/[0.02] hover:bg-white/[0.05]'}`}
                  >
                    <button 
                      onClick={() => setActiveOffer(activeOffer === i ? null : i)}
                      className="w-full flex items-center justify-between p-6 md:p-8 text-left group"
                    >
                      <div className="flex items-center gap-6 md:gap-8">
                        <div className={`h-10 w-10 flex items-center justify-center font-black italic transition-all duration-500 ${activeOffer === i ? 'bg-accent text-black scale-110' : 'bg-white/10 text-white group-hover:bg-accent/20 group-hover:text-accent'}`}>
                          0{i+1}
                        </div>
                        <div>
                          <h3 className={`text-lg md:text-2xl font-black uppercase tracking-tighter italic transition-colors ${activeOffer === i ? 'text-accent' : 'text-white/60'}`}>
                            {item.title}
                          </h3>
                          <p className="text-[9px] md:text-xs font-bold text-white/30 uppercase tracking-widest mt-1">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight 
                        className={`transition-all duration-500 ${activeOffer === i ? 'rotate-90 text-accent' : 'text-white/20'}`} 
                        size={24} 
                      />
                    </button>

                    <motion.div
                      initial={false}
                      animate={{ height: activeOffer === i ? 'auto' : 0, opacity: activeOffer === i ? 1 : 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 md:p-8 pt-0 border-t border-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-8">
                          {item.examples.map((ex, idx) => (
                            <div key={idx} className="text-[10px] md:text-xs text-white/40 font-bold uppercase tracking-widest flex items-center gap-3">
                               <div className="h-1.5 w-1.5 bg-accent/40 rounded-full shrink-0" />
                               {ex}
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-white/5 bg-accent/[0.02] -mx-8 px-8 -mb-8 py-4">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-accent/60">Ideal para:</span>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mt-1">{item.forWho}</p>
                          </div>
                          <item.icon size={20} className="text-accent/40 hidden md:block" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOQUE 5 — AUTORIDAD */}
      <section id="autoridad" className="relative z-10 py-16 md:py-32 bg-white/[0.01] border-y border-white/5">
        <div className="container mx-auto w-full px-6 md:px-12 text-center">
          <div className="reveal mb-12 md:mb-20 flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent text-center">Trayectoria Verificada</span>
            <h2 className="mt-6 text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-center">Posicionamiento <span className="text-white/20">Real</span></h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 items-stretch">
            <div className="reveal sport-card p-12 text-left bg-gradient-to-br from-card-dark to-[#0a0a0a]">
              <Award className="text-accent mb-8" size={40} />
              <h3 className="text-3xl font-black uppercase tracking-tight mb-8 leading-tight">Experiencia Elite</h3>
              <ul className="space-y-6">
                <li className="flex items-center gap-4">
                  <div className="h-1.5 w-6 bg-accent" />
                  <span className="text-xl font-bold italic">Videoanalista de Valdetires Ferrol (España)</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="h-1.5 w-6 bg-accent" />
                  <span className="text-xl font-bold italic">Ex DT Futsal Femenino Newell’s Old Boys (AFA)</span>
                </li>
              </ul>
              <div className="pt-8 mt-8 border-t border-white/5 flex flex-wrap gap-8 grayscale opacity-40">
                  <span className="text-sm font-black uppercase tracking-tighter">AFA</span>
                  <span className="text-sm font-black uppercase tracking-tighter">CONMEBOL</span>
                  <span className="text-sm font-black uppercase tracking-tighter">RFEF</span>
                </div>
            </div>
            <div className="reveal sport-card p-12 flex flex-col justify-center items-center text-center bg-accent/5 border-accent/20">
              <div className="flex gap-4 mb-10">
                <a href="https://www.youtube.com/@DTPabloGranados" target="_blank" className="hover:text-accent transition-colors"><Youtube size={32} /></a>
                <a href="https://www.instagram.com/dtpablogranados" target="_blank" className="hover:text-accent transition-colors"><Instagram size={32} /></a>
                <a href="https://www.tiktok.com/@dtpablogranados" target="_blank" className="hover:text-accent transition-colors"><TikTok size={32} /></a>
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-4">Referente Digital</h3>
              <p className="text-white/40 font-medium italic">Clips, táctica y contenido técnico <br/>con miles de reproducciones.</p>
              <button 
                onClick={() => window.open('https://youtube.com/@DTPabloGranados', '_blank')}
                className="mt-10 text-[10px] font-black uppercase tracking-widest border-b-2 border-accent pb-1 hover:text-accent transition-all"
              >
                Ver Contenido →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BLOQUE 6 — SERVICIOS */}
      <section id="servicios" className="relative z-10 py-16 md:py-32">
        <div className="container mx-auto w-full px-6 md:px-12">
          <div className="mb-12 md:mb-24 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 md:gap-12">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent text-tier-elite leading-loose">Oferta Estratégica</span>
              <h2 className="mt-2 text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">Soluciones <br/>Tácticas</h2>
            </div>
            <p className="text-white/30 max-w-sm italic font-medium leading-relaxed text-sm">
              Trabajo con entrenadores, clubes y jugadores que quieren competir mejor con información real, no intuición.
            </p>
          </div>

          <div className="relative group/sol -mx-6 px-6">
            <div 
              ref={solutionsCarouselRef}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x px-[calc(50%-45vw)] md:px-0 hide-scrollbar pb-12 flex-nowrap" 
              id="solutions-carousel"
            >
              {[
                {
                  icon: Search,
                  title: "Rival",
                  desc: "Análisis exhaustivo del adversario.",
                  forWho: "Partidos decisivos o playoffs.",
                  details: ["Salida de presión", "Rotación ofensiva", "Déficit arquero", "Pelota parada"]
                },
                {
                  icon: Target,
                  title: "Propio",
                  desc: "Evaluación para corregir táctica.",
                  forWho: "Equipos en crecimiento.",
                  details: ["Perfilamientos", "Tiempos cobertura", "Ocupación espacio", "Toma decisiones"]
                },
                {
                  icon: BarChart3,
                  title: "Individual",
                  desc: "Seguimiento de performance.",
                  forWho: "Jugadores Pro.",
                  details: ["Desmarques", "Primer toque", "Inteligencia táctica", "Finalizaciones"]
                },
                {
                  icon: Video,
                  title: "Highlights",
                  desc: "Montaje visual de marketing.",
                  forWho: "Representantes/Marca.",
                  details: ["Jugadas clave", "Edición rítmica", "Seguimiento visual", "Optimizado Social"]
                }
              ].map((s, i) => (
                <div 
                  key={i} 
                  onClick={(e) => centerCard(e.currentTarget)}
                  style={{ scrollSnapStop: "always" }}
                  className="reveal snap-center shrink-0 w-[85vw] sm:w-[70vw] md:w-[50vw] lg:w-[400px] sport-card p-8 md:p-10 flex flex-col group border-white/10 md:hover:border-accent md:hover:scale-[1.02] transition-all duration-500 cursor-pointer"
                >
                  <div className="h-10 w-10 flex items-center justify-center bg-accent text-black font-black italic mb-6 md:mb-8 md:group-hover:scale-110 transition-transform">0{i+1}</div>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-4 italic">{s.title}</h3>
                  <p className="text-white/40 text-[10px] md:text-xs leading-relaxed mb-6 font-bold">{s.desc}</p>
                  <div className="space-y-2 mb-8">
                    {s.details.map(d => (
                      <div key={d} className="text-[9px] text-white/30 font-bold uppercase tracking-widest flex items-center gap-2">
                         <div className="h-1 w-1 bg-accent/30 rounded-full" /> {d}
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-6 border-t border-white/5">
                     <p className="text-[10px] font-black uppercase tracking-widest text-accent/60">Ideal para:</p>
                     <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/60 mt-1">{s.forWho}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute top-1/2 left-2 right-2 md:-left-8 md:-right-8 -translate-y-1/2 flex justify-between pointer-events-none z-20">
              <button 
                onClick={() => scrollByCard(solutionsCarouselRef, 'left')}
                className={`p-3 md:p-4 bg-accent text-black backdrop-blur-md rounded-full pointer-events-auto hover:bg-white transition-all shadow-[0_0_30px_rgba(0,242,255,0.4)] ${solutionsScroll.left ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-0 pointer-events-none'}`}
              >
                <ChevronRight className="rotate-180" size={24} strokeWidth={3} />
              </button>
              <button 
                onClick={() => scrollByCard(solutionsCarouselRef, 'right')}
                className={`p-3 md:p-4 bg-accent text-black backdrop-blur-md rounded-full pointer-events-auto hover:bg-white transition-all shadow-[0_0_30px_rgba(0,242,255,0.4)] ${solutionsScroll.right ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-0 pointer-events-none'}`}
              >
                <ChevronRight size={24} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BLOQUE 7 — OFERTA (HIGH TICKET) */}
      <section id="pack" className="relative z-10 py-16 md:py-32 bg-white/[0.01]">
        <div className="container mx-auto w-full px-6 md:px-12">
          <div className="text-center mb-20">
             <h2 className="reveal text-5xl font-black uppercase tracking-tighter italic">Planes <span className="text-accent">Estratégicos</span></h2>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-4">
             {/* Basic */}
             <div className="reveal sport-card p-10 border-white/10 flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-tier-basic">Análisis Basic</span>
                <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-8">Básico</h3>
                <ul className="space-y-4 mb-12 flex-grow">
                   {['Informe Técnico', 'Clips de video'].map(item => (
                     <li key={item} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/60">
                        <ChevronRight size={14} className="text-tier-basic" />
                        {item}
                     </li>
                   ))}
                </ul>
                <button onClick={() => contactWhatsApp('Básico')} className="w-full bg-accent text-black py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">
                  Elegir Plan
                </button>
             </div>

             {/* Pro - Recommended */}
             <div className="reveal sport-card p-10 border-accent/40 bg-accent/5 shadow-2xl relative overflow-hidden flex flex-col lg:scale-105 z-10">
                <div className="absolute top-0 right-0 bg-accent text-black font-black uppercase italic text-[9px] px-4 py-2">RECOMENDADO</div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-accent">Análisis Pro</span>
                <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-8">Profesional</h3>
                <ul className="space-y-4 mb-12 flex-grow">
                   {['Informe Técnico', 'Clips de video', 'Devolución táctica', 'Reunión 1 a 1'].map(item => (
                     <li key={item} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/80 font-black">
                        <ChevronRight size={14} className="text-accent" />
                        {item}
                     </li>
                   ))}
                </ul>
                <button onClick={() => contactWhatsApp('Profesional')} className="w-full bg-accent text-black py-4 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:bg-white transition-all">
                  Quiero este plan
                </button>
             </div>

             {/* Elite */}
             <div className="reveal sport-card p-10 border-white/10 flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-tier-elite">Análisis Elite</span>
                <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-8">Élite</h3>
                <ul className="space-y-4 mb-12 flex-grow">
                   {['Informe Técnico Pro', 'Edición Avanzada', 'Devolución Táctica', 'Reunión 1 a 1', 'Acceso a Raw Media'].map(item => (
                     <li key={item} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/60">
                        <ChevronRight size={14} className="text-tier-elite" />
                        {item}
                     </li>
                   ))}
                </ul>
                <button onClick={() => contactWhatsApp('Élite')} className="w-full bg-accent text-black py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">
                  Elegir Plan
                </button>
             </div>

             {/* Monthly */}
             <div className="reveal sport-card p-10 border-[#fbbf24]/30 bg-[#fbbf24]/5 flex flex-col border-dashed group hover:border-[#fbbf24]">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-[#fbbf24]">Seguimiento Mensual</span>
                <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-8 text-[#fbbf24]">Elite Mensual</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#fbbf24]/50 leading-loose mb-12">
                  Para equipos de alto nivel. Análisis de partidos + rivales + soporte directo + plan de mejora semanal.
                </p>
                <button onClick={() => contactWhatsApp('Elite Mensual')} className="w-full bg-[#fbbf24] py-4 text-[10px] font-black uppercase tracking-widest text-black hover:bg-white transition-all uppercase">
                  TRABAJEMOS JUNTOS
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* BLOQUE 8 — CTA FUERTE */}
      <section className="relative z-10 py-16 md:py-32">
        <div className="container mx-auto w-full px-6 md:px-12">
          <div className="reveal glass p-8 md:p-24 text-center border-accent/20 relative overflow-hidden backdrop-blur-3xl mx-auto">
             <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center grayscale" />
             <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.8em] text-accent/60 mb-4 md:mb-6 block">Soporte estratégico</span>
                <h2 className="text-3xl md:text-8xl font-black uppercase tracking-tighter mb-8 md:mb-12 italic leading-none">
                   ¿Querés competir <br className="hidden md:block"/><span className="text-white underline decoration-accent decoration-4 md:decoration-8 underline-offset-[8px] md:underline-offset-[16px]">mejor?</span>
                </h2>
                <p className="text-lg md:text-2xl text-white/50 mb-12 md:mb-20 max-w-2xl mx-auto font-medium italic leading-relaxed">
                   Necesitás información útil. <br className="md:hidden"/> Escribime y lo vemos personalmente.
                </p>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                   <button 
                     onClick={() => contactWhatsApp('Diagnóstico')}
                     className="w-full md:w-auto bg-accent text-black px-16 py-8 text-sm font-black uppercase tracking-[0.3em] flex items-center justify-center gap-6 shadow-[0_0_50px_rgba(0,242,255,0.3)] hover:scale-105 transition-all"
                   >
                     Solicitar Diagnóstico
                     <MessageCircle size={24} />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 md:py-20 bg-bg-dark border-t border-white/10">
        <div className="container mx-auto w-full px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-12">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
            <img src="https://i.postimg.cc/0N7nQMXQ/Logo-DTPG.png" alt="DT PG Logo" className="h-12 w-12 md:h-16 md:w-16 brightness-150 object-contain" onError={(e) => e.currentTarget.src = "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=150&auto=format&fit=crop"} />
            <div className="flex flex-col overflow-hidden max-w-[200px] sm:max-w-none">
              <span className="text-xl md:text-3xl font-black italic tracking-tighter uppercase text-accent leading-none truncate sm:overflow-visible">DTPabloGranados</span>
              <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[1.0em] text-white/20 mt-3 italic whitespace-nowrap">Información que Gana Partidos</span>
            </div>
          </div>
          
          <div className="flex items-center gap-10 opacity-30">
             <a href="https://www.youtube.com/@DTPabloGranados" target="_blank" className="hover:text-accent transition-colors"><Youtube size={20} /></a>
             <a href="https://www.instagram.com/dtpablogranados" target="_blank" className="hover:text-accent transition-colors"><Instagram size={20} /></a>
             <a href="https://www.tiktok.com/@dtpablogranados" target="_blank" className="hover:text-accent transition-colors"><TikTok size={20} /></a>
          </div>
          
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">© 2026 Rosario Hub — Rosario, AR</p>
        </div>
      </footer>

      {/* Reveal Effects */}
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
