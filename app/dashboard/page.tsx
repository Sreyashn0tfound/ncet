"use client";

import React, { useRef, useState, useEffect } from "react";
import { Download, User, LogOut, Award, BookOpen, Quote, CheckCircle2, Building, FileCheck, ChevronDown, Loader2 } from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// =========================================================
// RANK CALCULATION ENGINE (Email VIPs & 1.3k Max)
// =========================================================
const getStudentRankInfo = (email: string, name: string) => {
  const safeEmail = (email || "").toLowerCase().trim();
  
  // VIP Hardcoded Ranks by Exact Email
  if (safeEmail === "shrustichauhan@gmail.com") return { rank: 1, title: "Outstanding Excellence" };
  if (safeEmail === "susmitapatil6362@gmail.com") return { rank: 2, title: "Top Performer" };
  if (
    safeEmail === "priyankam5125@gmail.com" ||
    safeEmail === "sanjanasanju63609@gmail.com" ||
    safeEmail === "shubhagowda707@gmail.com" ||
    safeEmail === "cadetbrijesh0707@gmail.com"
  ) {
    return { rank: 3, title: "Distinction Achiever" };
  }

  // Deterministic Pseudo-Random Rank for everyone else (Ranks 4 to 1300)
  let hash = 0;
  // Fallback to name if email is somehow missing, to ensure a persistent hash
  const str = safeEmail || name || "unknown"; 
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // Math: % 1297 returns 0-1296. Adding 4 makes the range 4-1300.
  const randomRank = (Math.abs(hash) % 1297) + 4;
  
  return { rank: randomRank, title: "Qualified with Merit" };
};

// =========================================================
// DYNAMIC 3D CAROUSEL COMPONENT
// =========================================================
const DynamicImageCarousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-white/50">No images found</div>;
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-[1000px] overflow-hidden">
      {images.map((src, index) => {
        let offset = index - currentIndex;
        
        // Wrap around logic for infinite scroll
        const halfLength = Math.floor(images.length / 2);
        if (offset > halfLength) offset -= images.length;
        if (offset < -halfLength) offset += images.length;

        const isCenter = offset === 0;
        const isVisible = Math.abs(offset) <= 2;
        
        if (!isVisible) return null;

        return (
          <div
            key={index}
            className="absolute top-0 bottom-0 my-auto h-[80%] w-[80%] md:w-[60%] rounded-[2rem] overflow-hidden transition-all duration-700 ease-out border-2 border-white/10"
            style={{
              transform: `translateX(${offset * 40}%) scale(${1 - Math.abs(offset) * 0.15}) rotateY(${offset * -10}deg)`,
              opacity: isCenter ? 1 : Math.max(0.3, 1 - Math.abs(offset) * 0.3),
              zIndex: 10 - Math.abs(offset),
              boxShadow: isCenter ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 'none',
            }}
          >
            <img 
              src={src} 
              alt={`Campus View ${index + 1}`} 
              className="w-full h-full object-cover pointer-events-none"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            {!isCenter && <div className="absolute inset-0 bg-black/40 transition-opacity duration-700" />}
          </div>
        );
      })}
    </div>
  );
};

// =========================================================
// MAIN DASHBOARD COMPONENT
// =========================================================
export default function Dashboard() {
  const finalStepRef = useRef<HTMLDivElement>(null);
  
  const [studentData, setStudentData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem("ncet_student_data");
    
    if (storedData) {
      setStudentData(JSON.parse(storedData));
    } else {
      window.location.href = "/login";
    }
  }, []);

  const scrollToBottom = (e: React.MouseEvent) => {
    e.preventDefault();
    finalStepRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("ncet_student_data");
    window.location.href = "/login";
  };

  // =========================================================
  // PDF GENERATION LOGIC (pdf-lib)
  // =========================================================
  const generatePDF = async () => {
    if (!studentData) return;
    setIsGenerating(true);

    try {
      // 1. Fetch the template
      const pdfUrl = '/template.pdf'; 
      const res = await fetch(pdfUrl);
      
      if (!res.ok) {
        throw new Error(`Failed to load PDF. Status: ${res.status}. Make sure template.pdf is inside the public folder.`);
      }

      const existingPdfBytes = await res.arrayBuffer();

      // 2. Load the PDF
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const firstPage = pdfDoc.getPages()[0]; 
      const { width, height } = firstPage.getSize();
      
      // 3. Draw Student Name
      const nameText = studentData.student_name.toUpperCase();
      const fontSize = 26;
      const textWidth = helveticaBold.widthOfTextAtSize(nameText, fontSize);
      
      firstPage.drawText(nameText, {
        x: (width / 2) - (textWidth / 2), 
        y: (height / 2) - 80, 
        size: fontSize,
        font: helveticaBold,
        color: rgb(0.07, 0.18, 0.36), 
      });

      // 4. Draw Custom Rank & Title Text
      const rankInfo = getStudentRankInfo(studentData.email, studentData.student_name);
      const rankText = `Rank: ${rankInfo.rank} (${rankInfo.title})`;
      const rankFontSize = 20; // Slightly smaller to accommodate the title
      const rankTextWidth = helveticaBold.widthOfTextAtSize(rankText, rankFontSize);

      firstPage.drawText(rankText, {
        x: (width / 2) - (rankTextWidth / 2), // Perfectly centered at the bottom
        y: 70,                                // Placed in the signature gap
        size: rankFontSize,
        font: helveticaBold,
        color: rgb(0.97, 0.45, 0.08),         // #f97316 Brand Orange
      });

      // 5. Save and Download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `NCET_Admission_${studentData.student_name.replace(/\s+/g, '_')}.pdf`;
      link.click();

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Make sure pdf-lib is installed.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
        <Loader2 className="animate-spin text-[#f97316]" size={48} />
      </div>
    );
  }

  const numberOfDashboardImages = 5; 
  const dashboardImages = Array.from({ length: numberOfDashboardImages }, (_, i) => `/d_${i + 1}.jpeg`);

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-slate-900 font-sans selection:bg-[#f97316] selection:text-white pb-20 scroll-smooth">
      
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/NGE-Logo (1).png" alt="NCET Logo" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="font-bold text-xl text-[#122e5c] tracking-tight leading-tight">NAGARJUNA</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">College of Engineering & Technology</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-bold px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Identity Verified
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-10 flex flex-col gap-12">
        
        <section className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h2 className="text-4xl font-extrabold text-[#122e5c] tracking-tight mb-1">Student Portal</h2>
              <p className="text-slate-500 font-medium">Manage your admission and explore the NCET legacy.</p>
            </div>
            <button onClick={handleLogout} className="group flex items-center gap-2 text-sm font-semibold text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200">
              <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              Logout Securely
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex items-center justify-between lg:col-span-1">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center text-[#122e5c] border border-slate-200 shadow-inner">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-[#122e5c] capitalize">{studentData.student_name}</h3>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <button onClick={scrollToBottom} className="group w-full h-full flex items-center justify-between bg-[#122e5c] text-white px-8 py-6 rounded-3xl font-bold transition-all hover:bg-[#0a1930] hover:shadow-xl hover:-translate-y-1 text-left">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <FileCheck size={28} className="text-[#84cc16]" />
                  </div>
                  <div>
                    <span className="block text-xl">Admission Document Ready</span>
                    <span className="text-sm text-slate-400 font-medium mt-1">Review your portal below to proceed to download</span>
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-full group-hover:bg-[#f97316] transition-colors">
                  <ChevronDown size={24} className="group-hover:translate-y-1 transition-transform animate-bounce" />
                </div>
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-[#f97316] text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                <Building size={16} /> Welcome to NGI
              </h3>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#122e5c] mb-6 leading-tight">
                Education & Excellence for Everyone
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                Established in 2001, Nagarjuna College of Engineering and Technology provides a cluster of opportunities to explore, learn, and expand one's horizons through quality education intertwined with professionalism.
              </p>
              <div className="flex items-center gap-4">
                 <div className="bg-orange-50 px-4 py-3 rounded-xl border border-orange-100 flex items-center gap-3">
                    <Award className="text-[#f97316]" size={24} />
                    <div>
                      <div className="font-black text-[#122e5c] text-xl">25 Years</div>
                      <div className="text-xs font-bold text-slate-500 uppercase">Of Academic Excellence</div>
                    </div>
                 </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-slate-300 transition-colors">
                <CheckCircle2 className="text-[#84cc16] mb-4" size={28} />
                <h4 className="font-bold text-[#122e5c] text-lg mb-2">Our Vision</h4>
                <p className="text-sm text-slate-600 leading-relaxed">Leadership and Excellence in education and research, fulfilling the aspirations of society.</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-slate-300 transition-colors">
                <BookOpen className="text-[#3b82f6] mb-4" size={28} />
                <h4 className="font-bold text-[#122e5c] text-lg mb-2">Our Mission</h4>
                <p className="text-sm text-slate-600 leading-relaxed">To fulfill the vision by imparting total quality education with strong human values and adapting to global changes.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center mb-4">
            <h2 className="text-3xl font-extrabold text-[#122e5c]">From The Management Desk</h2>
            <div className="h-1 w-12 bg-[#f97316] rounded-full mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#122e5c] rounded-3xl p-8 border border-[#1e40af] shadow-lg relative group">
               <Quote className="text-white/10 absolute top-6 right-6" size={48} />
               <p className="text-white/90 text-lg leading-relaxed italic mb-8 relative z-10">
                 "We are committed to creating a generation of thinkers and pioneers who will shape the future of our nation."
               </p>
               <div className="border-t border-white/20 pt-4 mt-auto">
                 <h4 className="font-bold text-white text-lg">Sri J.V. Ranga Raju</h4>
                 <p className="text-[#f97316] text-sm font-semibold uppercase tracking-wider">Chairman</p>
               </div>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm relative group">
               <Quote className="text-slate-100 absolute top-6 right-6" size={48} />
               <p className="text-slate-600 text-lg leading-relaxed italic mb-8 relative z-10">
                 "Our objective is to create an educational ecosystem that nurtures curiosity and encourages students."
               </p>
               <div className="border-t border-slate-100 pt-4 mt-auto">
                 <h4 className="font-bold text-[#122e5c] text-lg">Sri J. Chaitanya Varma</h4>
                 <p className="text-[#84cc16] text-sm font-semibold uppercase tracking-wider">CEO</p>
               </div>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm relative group">
               <Quote className="text-slate-100 absolute top-6 right-6" size={48} />
               <p className="text-slate-600 text-lg leading-relaxed italic mb-8 relative z-10">
                 "Every student is a unique individual, and we are dedicated to helping them discover their true potential."
               </p>
               <div className="border-t border-slate-100 pt-4 mt-auto">
                 <h4 className="font-bold text-[#122e5c] text-lg">Smt. Bhanu Chaitanya</h4>
                 <p className="text-[#84cc16] text-sm font-semibold uppercase tracking-wider">COO</p>
               </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6 mt-4">
           <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="text-3xl font-extrabold text-[#122e5c]">Discover NCET</h2>
              <p className="text-slate-500 font-medium mt-1">A glimpse into our vibrant 100-acre campus life.</p>
            </div>
          </div>
          <div className="h-[500px] md:h-[600px] w-full bg-[#122e5c] rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200/50 p-6">
             <DynamicImageCarousel images={dashboardImages} />
          </div>
        </section>

        <section ref={finalStepRef} id="generate-document" className="mt-8 pt-8 border-t border-slate-200/60 scroll-mt-32">
          <div className="bg-[#122e5c] rounded-3xl p-8 md:p-12 border border-[#1e40af] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#f97316]/20 via-transparent to-transparent opacity-50 blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 text-center md:text-left">
              <h3 className="text-3xl font-black text-white mb-2">Final Step: Claim Your Seat</h3>
              <p className="text-slate-300 font-medium max-w-md">By downloading this smart certificate, you acknowledge the college policies. Secure your admission today.</p>
            </div>
            
            <div className="relative z-10 w-full md:w-auto">
              <button 
                onClick={generatePDF} 
                disabled={isGenerating}
                className="w-full md:w-auto flex items-center justify-center gap-4 bg-[#f97316] text-white px-10 py-6 rounded-2xl font-black text-xl transition-all hover:bg-[#ea580c] hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={28} /> : <Download size={28} className="animate-bounce" />}
                <span>{isGenerating ? "Generating..." : "Generate Official PDF"}</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}