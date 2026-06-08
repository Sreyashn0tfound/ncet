import { createPool } from '@vercel/postgres';
import { CheckCircle2, XCircle, Award, User, BookOpen, ShieldCheck, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// FORCE the connection to use our custom unlocked variable
const pool = createPool({
  connectionString: process.env.DEMO_DB_URL,
});

export default async function VerificationPage({ 
  params 
}: { 
  params: Promise<{ application_no: string }> 
}) {
  
  const { application_no } = await params;
  
  let student = null;
  let isValid = false;

  try {
    // Notice we use pool.sql here instead of the default sql!
    const { rows } = await pool.sql`
      SELECT student_name, branch, application_no, total_marks, marks_breakdown 
      FROM ncet_students 
      WHERE UPPER(TRIM(application_no)) = UPPER(${application_no.trim()}) 
      LIMIT 1;
    `;

    if (rows.length > 0) {
      student = rows[0];
      isValid = true;
    }
  } catch (error) {
    console.error("Verification DB Error:", error);
  }

  // ==========================================
  // UI: INVALID OR FAKE CERTIFICATE
  // ==========================================
  if (!isValid || !student) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl max-w-md w-full text-center border border-red-100">
          <XCircle className="text-red-500 w-24 h-24 mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Record Not Found</h1>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            This QR code does not match any official records in the Nagarjuna College database. This certificate may be invalid or tampered with.
          </p>
          <Link href="/" className="inline-block bg-slate-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-slate-800 transition-colors">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI: VALID OFFICIAL TRANSCRIPT
  // ==========================================
  const marks = typeof student.marks_breakdown === 'string' 
    ? JSON.parse(student.marks_breakdown) 
    : student.marks_breakdown;

  return (
    <div className="min-h-screen bg-[#f4f7f6] py-12 px-4 sm:px-6 font-sans selection:bg-[#84cc16] selection:text-white">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="NCET Logo" className="h-20 w-20 drop-shadow-md" />
        </div>

        <div className="bg-white rounded-3xl p-8 border border-green-200 shadow-[0_20px_50px_rgba(132,204,22,0.1)] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#84cc16]"></div>
          <ShieldCheck className="text-[#84cc16] w-20 h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-[#122e5c] tracking-tight mb-2">Verified Authentic</h1>
          <p className="text-slate-500 font-medium">This is an official, unmodified digital record from the NGI database.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm space-y-8">
          <div className="flex items-center gap-5 pb-8 border-b border-slate-100">
            <div className="h-16 w-16 bg-blue-50 text-[#122e5c] rounded-2xl flex items-center justify-center">
              <User size={32} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Candidate Name</p>
              <h2 className="text-2xl font-black text-[#122e5c] capitalize">{student.student_name}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Application No</p>
              <p className="text-lg font-bold text-slate-800 font-mono">{student.application_no}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Branch</p>
              <p className="text-lg font-bold text-[#f97316]">{student.branch}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#122e5c] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <GraduationCap className="absolute -bottom-6 -right-6 w-48 h-48 text-white/5 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <h3 className="text-xl font-black flex items-center gap-3">
              <BookOpen className="text-[#f97316]" /> Academic Transcript
            </h3>
            <div className="text-right">
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Total Score</p>
              <p className="text-3xl font-black text-[#84cc16]">{student.total_marks}</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <MarkRow subject="Engineering Mathematics" score={marks?.engineering_mathematics} />
            <MarkRow subject="Electrical & Electronics" score={marks?.electrical_electronics} />
            <MarkRow subject="IT Skills" score={marks?.it_skills} />
            <MarkRow subject="Project Management" score={marks?.project_management} />
            <MarkRow subject="Statistics & Analytics" score={marks?.statistics_analytics} />
          </div>
        </div>

      </div>
    </div>
  );
}

function MarkRow({ subject, score }: { subject: string, score: string | number }) {
  return (
    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
      <span className="font-medium text-slate-200">{subject}</span>
      <span className="font-bold text-white bg-white/10 px-3 py-1 rounded-lg">{score || "0"}</span>
    </div>
  );
}