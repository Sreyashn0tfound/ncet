"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck, Lock, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function VerifyPage() {
  const { application_no } = useParams();
  
  // Security States
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [authError, setAuthError] = useState(false);

  // Data States
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if admin is already unlocked in this session
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("ngi_verifier_unlocked");
    if (sessionAuth === "true") {
      setIsAuthorized(true);
      fetchVerificationData();
    }
  }, [application_no]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // THE MASTER PASSWORD FOR THE VERIFICATION GATE
    if (passcodeInput === "ncet@verify") {
      sessionStorage.setItem("ngi_verifier_unlocked", "true");
      setIsAuthorized(true);
      setAuthError(false);
      fetchVerificationData();
    } else {
      setAuthError(true);
    }
  };

  const fetchVerificationData = async () => {
    if (!application_no) return;
    setLoading(true);
    
    try {
      // Re-using the admin ingestion API to fetch records, then filtering. 
      // Ideally, you'd have a specific GET route for single records, but this works with your current structure.
      const response = await fetch(`/api/ingest-csv`, { method: 'GET' });
      const result = await response.json();

      if (response.ok && result.success) {
        const foundStudent = result.records.find((r: any) => r.application_no === application_no);
        if (foundStudent) {
          setStudentData(foundStudent);
        } else {
          setError("Invalid or forged QR Code. No matching record found in the database.");
        }
      } else {
        setError("Failed to connect to the verification server.");
      }
    } catch (err) {
      console.error(err);
      setError("System error during verification.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RENDER LEVEL 1: THE SECURITY GATE
  // =========================================================
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 font-sans selection:bg-[#f97316]">
        <div className="w-full max-w-md bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mb-4 animate-pulse">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Restricted Access</h1>
            <p className="text-xs text-neutral-400 font-medium mt-2">Official Verification Portal. Authorized Personnel Only.</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">Authenticator Passcode</label>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter access code"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-4 text-center text-white font-mono tracking-[0.3em] focus:outline-none focus:border-[#f97316] transition-colors"
              />
            </div>
            
            {authError && (
              <p className="text-red-500 text-xs text-center font-bold uppercase tracking-wider animate-shake">
                Access Denied
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-[#f97316] hover:bg-[#ea580c] text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]"
            >
              Unlock Verification
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER LEVEL 2: THE VERIFICATION RESULT
  // =========================================================
  return (
    <div className="min-h-screen bg-[#f4f7f6] flex flex-col items-center py-12 px-6 font-sans">
      <div className="w-full max-w-lg mb-6 flex justify-start">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#122e5c] transition-colors">
          <ChevronLeft size={16} /> Exit Scanner
        </Link>
      </div>

      <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200/60 shadow-xl relative overflow-hidden">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#f97316]" size={48} />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Querying Database...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center text-center py-10">
            <div className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertCircle size={48} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Verification Failed</h2>
            <p className="text-slate-600 font-medium leading-relaxed">{error}</p>
          </div>
        ) : studentData ? (
          <>
            {/* Header */}
            <div className="flex flex-col items-center text-center border-b border-slate-100 pb-8 mb-8">
              <div className="h-20 w-20 bg-green-50 border-4 border-white shadow-lg rounded-full flex items-center justify-center mb-4 relative z-10">
                <ShieldCheck size={40} className="text-green-500" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-xs font-black uppercase tracking-widest rounded-full mb-4 border border-green-200">
                <CheckCircle2 size={14} /> Authentic Document
              </div>
              <h2 className="text-3xl font-black text-[#122e5c] mb-1">{studentData.student_name}</h2>
              <p className="text-slate-500 font-mono text-sm">{studentData.application_no}</p>
            </div>

            {/* Data Points */}
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Admission Status</p>
                  <p className="font-bold text-slate-800">Confirmed</p>
                </div>
                <CheckCircle2 className="text-green-500" size={24} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Score</p>
                  <p className="text-2xl font-black text-[#f97316]">{studentData.total_marks} <span className="text-sm text-slate-400">/ 100</span></p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Scholarship</p>
                  <p className="text-xl font-black text-[#122e5c]">₹5,000</p>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316]/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 relative z-10">Subject Breakdown</p>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-medium relative z-10">
                   <div className="flex justify-between border-b border-white/10 pb-1">
                     <span className="text-slate-400">Mathematics</span>
                     <span>{studentData.marks_breakdown?.engineering_mathematics ?? 0}/20</span>
                   </div>
                   <div className="flex justify-between border-b border-white/10 pb-1">
                     <span className="text-slate-400">Electronics</span>
                     <span>{studentData.marks_breakdown?.electrical_electronics ?? 0}/20</span>
                   </div>
                   <div className="flex justify-between border-b border-white/10 pb-1">
                     <span className="text-slate-400">IT Skills</span>
                     <span>{studentData.marks_breakdown?.it_skills ?? 0}/20</span>
                   </div>
                   <div className="flex justify-between border-b border-white/10 pb-1">
                     <span className="text-slate-400">Project Mgmt</span>
                     <span>{studentData.marks_breakdown?.project_management ?? 0}/20</span>
                   </div>
                   <div className="flex justify-between border-b border-white/10 pb-1 col-span-2">
                     <span className="text-slate-400">Statistics & Analytics</span>
                     <span>{studentData.marks_breakdown?.statistics_analytics ?? 0}/20</span>
                   </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}