"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue, MotionValue } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";
import { ReactLenis } from "lenis/react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import "lenis/dist/lenis.css";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdmissionsPortal() {
  const router = useRouter();
  
  // Refs for tracking sections accurately
  const containerRef = useRef<HTMLDivElement>(null);
  const videoSectionRef = useRef<HTMLElement>(null);
  const ikyaSectionRef = useRef<HTMLDivElement>(null);

  // Global scroll tracker
  const { scrollY } = useScroll();
  
  // Scroll tracker LOCKED to the Video Section
  const { scrollYProgress: videoProgress } = useScroll({
    target: videoSectionRef,
    offset: ["start start", "end end"]
  });

  // Scroll tracker specifically for the bottom Ikya/Login section
  const { scrollYProgress: bottomProgress } = useScroll({
    target: ikyaSectionRef,
    offset: ["start start", "end end"]
  });

  // --- INSTANT FADE FOR INTRO TEXT ---
  const introOpacity = useTransform(scrollY, [0, 100], [1, 0]);
  const introPointer = useTransform(scrollY, [0, 100], ["auto", "none"]);

  // --- SVG LINE MATH (Locked to Video Section) ---
  const pathLength = useTransform(videoProgress, [0, 1], [0, 1]);
  
  // --- TEXT BLOCK TIMELINES (Locked to Video Section) ---
  const ceoOpacity = useTransform(videoProgress, [0.15, 0.20, 0.30, 0.35], [0, 1, 1, 0]);
  const ceoX = useTransform(videoProgress, [0.15, 0.20, 0.30, 0.35], [50, 0, 0, 50]);

  const cooOpacity = useTransform(videoProgress, [0.45, 0.50, 0.60, 0.65], [0, 1, 1, 0]);
  const cooX = useTransform(videoProgress, [0.45, 0.50, 0.60, 0.65], [-50, 0, 0, -50]);

  // --- AUTH STATES ---
  const [emailInput, setEmailInput] = useState("");
  const [passcodeInput, setPasscodeInput] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Smooth scroll to login function
  const scrollToLogin = () => {
    ikyaSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passcodeInput) return alert("Credentials missing.");
    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passcodeInput }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("ncet_student_data", JSON.stringify(data.student));
        window.location.href = '/dashboard';
      } else {
        alert(data.error || "Access Denied.");
        setIsLoggingIn(false);
      }
    } catch (error) {
      console.error(error);
      setIsLoggingIn(false);
    }
  };

  return (
    <ReactLenis root>
      {/* GLOBAL MOUSE FOLLOWER */}
      <GlobalMouseFollower />

      {/* FIXED TOP NAVBAR */}
      <div className="fixed top-0 left-0 w-full bg-[#122e5c]/95 backdrop-blur-md z-[100] border-b border-white/10 px-4 md:px-8 py-3 flex justify-between items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="text-white text-[10px] md:text-xs font-bold tracking-widest uppercase flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2">
          <span className="opacity-70">Admissions Helpline:</span>
          <a href="tel:97314 07062, 91643 93100" className="text-[#f97316] text-xs md:text-sm">+91 97314 07062, +91 91643 93100</a>
        </div>
        <button 
          onClick={scrollToLogin}
          className="bg-[#f97316] hover:bg-[#ea580c] text-white px-5 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] hover:scale-105 active:scale-95"
        >
          Login Portal
        </button>
      </div>

      {/* The Master Wrapper */}
      <div ref={containerRef} className="relative w-full bg-black font-sans text-white">
        
        {/* BRANDING LOGO (Moved down to avoid navbar overlap) */}
        <div className="fixed top-20 left-4 md:top-24 md:left-12 z-50 pointer-events-none drop-shadow-2xl">
          <img src="/NGE-Logo (1).png" alt="NCET Logo" className="h-12 md:h-20 w-auto" onError={(e) => (e.currentTarget.style.display = 'none')} />
        </div>

        {/* PHASE 1: THE 1000vh DRONE SEQUENCE */}
        <section ref={videoSectionRef} className="relative w-full h-[1000vh]">
          <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
            
            <DroneCanvas parentRef={videoSectionRef} />
            <div className="absolute inset-0 z-0 bg-black/30 pointer-events-none" />

            <div className="absolute inset-0 z-10 pointer-events-none flex justify-center">
              <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                <motion.path 
                  d="M 200 0 C 200 200, 800 250, 800 500 C 800 750, 200 800, 500 1000" 
                  fill="transparent" stroke="#f97316" strokeWidth="16" strokeLinecap="round"
                  style={{ pathLength: pathLength }} className="drop-shadow-[0_0_25px_rgba(249,115,22,1)]"
                />
              </svg>
            </div>

            <div className="absolute inset-0 z-20 pointer-events-none">
              <motion.div style={{ opacity: introOpacity, pointerEvents: introPointer as any }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-4">
                <h1 className="text-4xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl">Follow the Signal</h1>
                <p className="mt-4 text-lg md:text-xl font-medium text-white/90 drop-shadow-lg">Scroll down to initiate.</p>
              </motion.div>

              <motion.div style={{ opacity: ceoOpacity, x: ceoX }} className="absolute top-[35%] right-[5%] md:right-[15%] w-[90%] md:w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/30 p-6 md:p-8 rounded-[2rem] shadow-2xl flex flex-col md:flex-row gap-6 items-start">
                <div className="w-20 h-20 md:w-32 md:h-32 shrink-0 rounded-2xl bg-white/20 border border-white/40 overflow-hidden flex items-center justify-center relative">
                  <img src="/ceo-image.png" alt="CEO" className="absolute inset-0 w-full h-full object-cover" onError={(e) => (e.currentTarget.style.opacity = '0')} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[10px] md:text-xs font-black text-[#f97316] uppercase tracking-widest mb-1">Execution</h3>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight mb-1 text-white">Sri J. Chaitanya Varma</h2>
                  <p className="text-[10px] md:text-xs text-white/80 font-bold uppercase tracking-widest mb-4 border-b border-white/20 pb-3">CEO</p>
                  <p className="text-xs md:text-sm text-white leading-relaxed font-medium">"Our objective is to build a vibrant educational ecosystem that nurtures curiosity and encourages students to push boundaries."</p>
                </div>
              </motion.div>

              <motion.div style={{ opacity: cooOpacity, x: cooX }} className="absolute top-[50%] left-[5%] md:left-[15%] w-[90%] md:w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/30 p-6 md:p-8 rounded-[2rem] shadow-2xl flex flex-col md:flex-row gap-6 items-start">
                 <div className="w-20 h-20 md:w-32 md:h-32 shrink-0 rounded-2xl bg-white/20 border border-white/40 overflow-hidden flex items-center justify-center relative">
                  <img src="/coo-image.png" alt="COO" className="absolute inset-0 w-full h-full object-cover" onError={(e) => (e.currentTarget.style.opacity = '0')} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[10px] md:text-xs font-black text-[#f97316] uppercase tracking-widest mb-1">Operations</h3>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight mb-1 text-white">Smt. Bhanu Chaitanya</h2>
                  <p className="text-[10px] md:text-xs text-white/80 font-bold uppercase tracking-widest mb-4 border-b border-white/20 pb-3">COO</p>
                  <p className="text-xs md:text-sm text-white leading-relaxed font-medium">"A campus is most effective when students feel safe, supported, and guided. We focus on creating a holistic environment."</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* PHASE 2: LOGIN & FLOATING CARDS */}
        <section ref={ikyaSectionRef} className="relative mx-auto flex min-h-[150vh] md:h-[250vh] w-full flex-col items-center bg-[#122e5c] text-white z-20 shadow-[0_-50px_50px_rgba(18,46,92,1)] pt-[15vh] md:pt-[20vh] overflow-hidden pb-32 md:pb-0">
          
          <LinePath className="absolute top-0 right-[-10%] md:right-[0%] z-0 pointer-events-none w-[800px] md:w-[1300px] h-auto opacity-50 md:opacity-100" scrollYProgress={bottomProgress} />

          <div className="w-full max-w-7xl px-4 md:px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 md:gap-16 z-10">
            <div className="w-full max-w-md bg-white border border-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] flex flex-col gap-6 relative">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                   <span className="px-2 py-1 bg-[#f97316] text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-md">NGI Portal</span>
                   <span className="px-2 py-1 bg-[#122e5c]/10 text-[#122e5c] font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-md">NAAC A+</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#122e5c] tracking-tight leading-tight">Chaitanya Vidhyanidhi<br/><span className="text-[#f97316]">Admissions 2026</span></h2>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest pt-1 text-[#122e5c]/60">Secure Onboarding Ledger</p>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-5 w-full">
                <div className="space-y-1.5">
                  <label className="text-[10px] md:text-xs font-black uppercase tracking-widest ml-1 text-[#122e5c]/70">Registered Email</label>
                  <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="student@ncet.co.in" className="font-bold w-full px-4 md:px-5 py-3 md:py-4 rounded-2xl border border-[#122e5c]/20 text-[#122e5c] placeholder-[#122e5c]/40 bg-white focus:outline-none focus:ring-4 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-sm md:text-base" />
                </div>
                
                {/* UPDATED PASSCODE UI */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline px-1">
                    <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#122e5c]/70">Secure Passcode</label>
                    <span className="text-[9px] md:text-[10px] text-[#f97316] font-bold tracking-wide">Format: ncet@firstname</span>
                  </div>
                  <input type="password" value={passcodeInput} onChange={(e) => setPasscodeInput(e.target.value)} placeholder="ncet@firstname" className="font-bold w-full px-4 md:px-5 py-3 md:py-4 rounded-2xl border border-[#122e5c]/20 text-[#122e5c] placeholder-[#122e5c]/40 bg-white focus:outline-none focus:ring-4 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-sm md:text-base" />
                </div>

                <button type="submit" disabled={isLoggingIn} className="group w-full mt-2 py-3 md:py-4 px-6 bg-[#f97316] hover:bg-[#ea580c] text-white font-black text-base md:text-lg tracking-wide rounded-2xl transition-all duration-300 shadow-[0_10px_30px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2">
                  {isLoggingIn ? <span className="animate-pulse">Authorizing...</span> : <>Enter Ecosystem<ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" /></>}
                </button>
              </form>
            </div>

            <div className="flex flex-col items-center lg:items-end text-center lg:text-right max-w-xl z-10">
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.95] drop-shadow-2xl">
                Innovation <br /> Meets Your <br /><span className="text-[#f97316]">Scroll Journey</span>
              </h1>
              <p className="mt-4 md:mt-6 text-sm md:text-lg font-medium text-white/80 max-w-sm md:max-w-none">Scroll down. Follow the trail to explore the cutting-edge infrastructure and metrics that distinguish NCET.</p>
            </div>
          </div>

          <div className="relative mt-12 md:absolute md:inset-0 w-full max-w-7xl mx-auto pointer-events-none z-10 flex flex-col md:block gap-8 px-4 md:px-0">
            <div className="md:absolute top-[35%] left-[5%] w-full max-w-xl pointer-events-auto">
              <CrazyPictureCard imgUrl="college.jpg" badge="25 Years of Glory" title="A Legacy of Academic Innovation" description="Established in 2001, Nagarjuna College of Engineering and Technology provides an advanced ecosystem designed to process theoretical thinking into absolute market-ready engineering solutions." />
            </div>
            <div className="md:absolute top-[60%] right-[5%] w-full max-w-xl pointer-events-auto flex justify-end">
              <CrazyPictureCard imgUrl="culture.jpeg" badge="Corporate Network" title="State-of-the-Art Technical Integration" description="With over 1,000+ career placement offers locked in annually, our labs and advanced incubation pods ensure our candidates are constantly ahead of rapidly shifting technological cycles." />
            </div>
          </div>
        </section>

        {/* PHASE 3: 25-IMAGE PARALLAX GALLERY */}
        <ParallaxGallery />

        {/* PHASE 4: RECRUITERS TEXT ANIMATION & CUSTOM LOGOS */}
        <RecruitersScroll />

        {/* PHASE 5: THE FOOTER */}
        <footer className="w-full bg-white pb-16 md:pb-24 pt-12 md:pt-20 text-[#122e5c] px-6 md:px-16 relative z-30 shadow-[0_-30px_60px_rgba(0,0,0,0.5)] rounded-t-[2.5rem] md:rounded-t-[3.5rem] -mt-10">
          <a 
            href="https://ncet.co.in" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block text-center text-[15vw] md:text-[13vw] font-black leading-[0.9] tracking-tighter text-[#122e5c] hover:text-[#f97316] transition-colors duration-300"
          >
            NCET.CO.IN
          </a>
          <div className="mt-16 md:mt-28 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto border-t border-[#122e5c]/20 pt-8 md:pt-12 text-center md:text-left">
            <div><div className="text-2xl md:text-3xl font-black text-[#f97316]">25 Yrs</div><div className="text-[10px] md:text-xs font-bold text-[#122e5c]/60 uppercase tracking-wider mt-1">Excellence in Ed</div></div>
            <div><div className="text-2xl md:text-3xl font-black text-[#122e5c]">15,000+</div><div className="text-[10px] md:text-xs font-bold text-[#122e5c]/60 uppercase tracking-wider mt-1">Global Alumni</div></div>
            <div><div className="text-2xl md:text-3xl font-black text-[#f97316]">1050+</div><div className="text-[10px] md:text-xs font-bold text-[#122e5c]/60 uppercase tracking-wider mt-1">Annual Seat Intake</div></div>
            <div><div className="text-2xl md:text-3xl font-black text-[#122e5c]">NAAC</div><div className="text-[10px] md:text-xs font-bold text-[#122e5c]/60 uppercase tracking-wider mt-1">Highest A+ Grade</div></div>
          </div>
        </footer>

      </div>
    </ReactLenis>
  );
}

// =========================================================
// MOUSE FOLLOWER (Hidden on mobile via CSS)
// =========================================================
const GlobalMouseFollower = () => {
  const SPRING = { mass: 0.1, damping: 15, stiffness: 150 };
  const xSpring = useSpring(0, SPRING);
  const ySpring = useSpring(0, SPRING);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      xSpring.set(e.clientX - 16); 
      ySpring.set(e.clientY - 16);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [xSpring, ySpring]);

  return (
    <motion.div
      style={{ x: xSpring, y: ySpring }}
      className="hidden md:flex fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-[#f97316] pointer-events-none z-[999] mix-blend-difference items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.8)]"
    >
      <div className="w-2 h-2 bg-[#f97316] rounded-full" />
    </motion.div>
  );
};

// =========================================================
// PARALLAX GALLERY
// =========================================================
const ParallaxGallery = () => {
  const gallery = useRef<HTMLDivElement>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ["start end", "end start"],
  });

  const { height } = dimension;
  const y1 = useTransform(scrollYProgress, [0, 1], [0, height * 2]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 3.3]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.25]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 3]);

  useEffect(() => {
    const resize = () => setDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, []);

  const imgSet = Array.from({ length: 25 }, (_, i) => `/${i + 1}.jpeg`);

  return (
    <section className="w-full bg-[#122e5c] text-white z-20 relative pt-10 md:pt-20">
      <div className="font-sans flex items-center justify-center mb-6 md:mb-10 px-4 text-center">
        <span className="relative text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#f97316]">
          Campus Life & Infrastructure
        </span>
      </div>

      <div ref={gallery} className="relative box-border flex h-[100vh] md:h-[200vh] gap-[2vw] overflow-hidden bg-[#122e5c] px-[2vw]">
        <ParallaxColumn images={imgSet.slice(0, 6)} y={y1} />
        <ParallaxColumn images={imgSet.slice(6, 12)} y={y2} />
        <ParallaxColumn images={imgSet.slice(12, 18)} y={y3} />
        <ParallaxColumn images={imgSet.slice(18, 25)} y={y4} />
      </div>
    </section>
  );
};

const ParallaxColumn = ({ images, y }: { images: string[], y: MotionValue<number> }) => (
  <motion.div className="relative -top-[45%] flex h-full w-1/4 min-w-[100px] md:min-w-[250px] flex-col gap-[2vw] first:top-[-45%] [&:nth-child(2)]:top-[-95%] [&:nth-child(3)]:top-[-45%] [&:nth-child(4)]:top-[-75%]" style={{ y }}>
    {images.map((src, i) => (
      <div key={i} className="relative h-[20vh] md:h-[40vh] w-full overflow-hidden rounded-xl md:rounded-[2rem] shadow-2xl border border-white/10 bg-[#050B14]">
        <img src={src} alt={`Campus Moment ${i}`} className="pointer-events-none object-cover w-full h-full opacity-90 hover:opacity-100 transition-opacity duration-300" />
      </div>
    ))}
  </motion.div>
);

// =========================================================
// RECRUITERS SCROLL (Text Animation & Custom Logos)
// =========================================================
const RecruitersScroll = () => {
  const targetRef1 = useRef<HTMLDivElement>(null);
  const targetRef2 = useRef<HTMLDivElement>(null);

  const { scrollYProgress: p1 } = useScroll({ target: targetRef1, offset: ["start end", "end start"] });
  const { scrollYProgress: p2 } = useScroll({ target: targetRef2, offset: ["start end", "end start"] });

  const text = "TOP RECRUITERS";
  const characters = text.split("");
  const centerIndex = Math.floor(characters.length / 2);

  const customRecruiterImages = [
    "/company1.png", 
    "/company2.png",
    "/company3.png",
    "/company4.png",
    "/company5.png",
    "/company6.png"
  ];
  const logoCenterIndex = Math.floor(customRecruiterImages.length / 2);

  return (
    <div className="w-full bg-[#122e5c] text-white z-20 relative">
      <div ref={targetRef1} className="relative flex h-[80vh] md:h-[120vh] items-center justify-center overflow-hidden bg-[#122e5c]">
        <div className="font-sans w-full text-center text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tighter text-white whitespace-nowrap px-2" style={{ perspective: "500px" }}>
          {characters.map((char, index) => (
            <AnimatedLetter key={index} char={char} index={index} centerIndex={centerIndex} progress={p1} />
          ))}
        </div>
      </div>

      <div ref={targetRef2} className="relative -mt-[20vh] md:-mt-[40vh] flex h-[80vh] md:h-[120vh] flex-col items-center justify-center gap-8 md:gap-12 overflow-hidden bg-[#122e5c] px-4">
        <p className="font-sans flex items-center justify-center gap-2 md:gap-3 text-sm md:text-xl font-bold tracking-widest text-[#f97316] uppercase text-center max-w-[90%]">
          <Bracket className="h-6 md:h-8 text-[#f97316] hidden md:block" />
          <span>Over 1,000+ Placement Offers Annually</span>
          <Bracket className="h-6 md:h-8 scale-x-[-1] text-[#f97316] hidden md:block" />
        </p>
        <div className="w-full max-w-7xl text-center flex items-center justify-center gap-4 md:gap-12 flex-wrap" style={{ perspective: "500px" }}>
          {customRecruiterImages.map((src, index) => (
            <AnimatedLogo key={index} src={src} index={index} centerIndex={logoCenterIndex} progress={p2} />
          ))}
        </div>
      </div>
    </div>
  );
};

const AnimatedLetter = ({ char, index, centerIndex, progress }: { char: string, index: number, centerIndex: number, progress: any }) => {
  const isSpace = char === " ";
  const dist = index - centerIndex;
  const x = useTransform(progress, [0.3, 0.5], [dist * 30, 0]); // Reduced dist for mobile
  const rotateX = useTransform(progress, [0.3, 0.5], [dist * 45, 0]);
  const opacity = useTransform(progress, [0.3, 0.45], [0, 1]);

  return (
    <motion.span className={cn("inline-block text-white", isSpace && "w-2 md:w-8")} style={{ x, rotateX, opacity }}>
      {char}
    </motion.span>
  );
};

const AnimatedLogo = ({ src, index, centerIndex, progress }: { src: string, index: number, centerIndex: number, progress: any }) => {
  const dist = index - centerIndex;
  const x = useTransform(progress, [0.3, 0.5], [dist * 60, 0]); // Reduced dist for mobile
  const y = useTransform(progress, [0.3, 0.5], [-Math.abs(dist) * 20, 0]); // Reduced dist for mobile
  const rotate = useTransform(progress, [0.3, 0.5], [dist * 15, 0]);
  const scale = useTransform(progress, [0.3, 0.5], [0.5, 1]);
  const opacity = useTransform(progress, [0.3, 0.45], [0, 1]);

  return (
    <motion.img 
      src={src} 
      alt="Recruiter Logo"
      className="inline-block w-14 md:w-32 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] bg-white p-2 md:p-4 rounded-lg md:rounded-xl" 
      style={{ x, y, rotate, scale, opacity, transformOrigin: "center" }} 
      onError={(e) => { e.currentTarget.style.display = 'none'; }} 
    />
  );
};

const Bracket = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 27 78" className={className}>
    <path fill="currentColor" d="M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z"></path>
  </svg>
);

// =========================================================
// CRAZY PICTURE COMPONENT
// =========================================================
const CrazyPictureCard = ({ imgUrl, badge, title, description }: { imgUrl: string; badge: string; title: string; description: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.innerWidth < 768) return; // Disable hover 3D on mobile
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    setRotateX(-(mouseY / rect.height) * 20);
    setRotateY((mouseX / rect.width) * 20);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setRotateX(0); setRotateY(0); }}
      animate={{ rotateX, rotateY, y: [-4, 4, -4] }}
      transition={{ rotateX: { type: "spring", stiffness: 150, damping: 20 }, rotateY: { type: "spring", stiffness: 150, damping: 20 }, y: { repeat: Infinity, duration: 5, ease: "easeInOut" } }}
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
      className="w-full bg-white border border-[#122e5c]/10 p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl group flex flex-col sm:flex-row gap-4 md:gap-6 items-center hover:shadow-[0_25px_60px_rgba(249,115,22,0.2)] hover:border-[#f97316] transition-all duration-300"
    >
      <div className="w-full sm:w-2/5 aspect-[4/5] rounded-[1.5rem] md:rounded-[1.8rem] overflow-hidden relative shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
         <img src={imgUrl} alt={title} className="w-full h-full object-cover transition-transform duration-[6s] group-hover:scale-110" />
      </div>
      <div className="w-full sm:w-3/5 flex flex-col gap-2 text-center sm:text-left items-center sm:items-start">
         <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white bg-[#f97316] px-2.5 py-1 rounded-md w-fit">{badge}</span>
         <h4 className="text-lg md:text-xl font-black text-[#122e5c] tracking-tight mt-1 group-hover:text-[#f97316] transition-colors duration-200">{title}</h4>
         <p className="text-xs md:text-sm font-medium text-[#122e5c]/70 leading-relaxed mt-1">{description}</p>
      </div>
    </motion.div>
  );
};

// =========================================================
// SVG PATH ENGINE
// =========================================================
const LinePath = ({ className, scrollYProgress }: { className: string; scrollYProgress: any; }) => {
  const pathLength = useTransform(scrollYProgress, [0, 0.85], [0, 1]);

  return (
    <svg width="1278" height="2319" viewBox="0 0 1278 2319" fill="none" overflow="visible" xmlns="http://www.w3.org/2000/svg" className={className}>
      <motion.path
        d="M 639 0 C 639 200, 876 200, 876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655C947.587 755.413 1197.56 941.828 936.039 1140.66C745.771 1285.32 321.926 950.737 134.536 1202.19C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5C478.381 1956.91 1124.19 1515 1201.28 1997.83C1273.66 2451.23 100.805 1864.7 303.794 2668.89"
        stroke="#f97316" strokeWidth="16" strokeLinecap="round" style={{ pathLength }} className="drop-shadow-[0_0_25px_rgba(249,115,22,1)]"
      />
    </svg>
  );
};

// =========================================================
// THE DRONE SEQUENCE CANVAS COMPONENT
// =========================================================
const DroneCanvas = ({ parentRef }: { parentRef: React.RefObject<HTMLElement | null> }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !parentRef.current) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const frameCount = 287; 
    const currentFrame = (index: number) => `/drone/Nagarjuna College of Engineering and Technology NCET Where Ambition Meets Achievement_${1000 + index}.jpg`;

    const images: HTMLImageElement[] = [];
    const sequence = { frame: 0 };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images.push(img);
    }

    gsap.registerPlugin(ScrollTrigger);

    const animation = gsap.to(sequence, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: parentRef.current,
        start: "top top",
        end: "bottom bottom", 
        scrub: 0.5,
      },
      onUpdate: render,
    });

    images[0].onload = render;

    function render() {
      if (!canvas || !context) return;
      const img = images[sequence.frame];
      if (!img || !img.complete) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    }

    window.addEventListener("resize", render);
    return () => {
      window.removeEventListener("resize", render);
      animation.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [parentRef]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover bg-black" />;
};