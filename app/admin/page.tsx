"use client";

import React, { useState } from "react";
import { UploadCloud, Database, CheckCircle2, AlertCircle, FileText, Users, Lock, BookOpen } from "lucide-react";

export default function AdminDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadStatus("idle");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch('/api/ingest-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUploadStatus("success");
        setMessage(result.message);
        setPreviewData(result.preview || []);
      } else {
        setUploadStatus("error");
        setMessage(result.error || "Failed to parse CSV.");
      }
    } catch (error) {
      console.error(error);
      setUploadStatus("error");
      setMessage("System error during ingestion.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white p-8 font-sans selection:bg-[#f97316] selection:text-white">
      
      {/* Top Navigation */}
      <nav className="flex items-center justify-between border-b border-neutral-800 pb-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-[#f97316]">
            <Database size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">NGI Admin Console</h1>
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Data Ingestion & Transcript Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">System Online</span>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="w-full flex flex-col xl:flex-row gap-8">
        
        {/* LEFT COLUMN: THE DROPZONE */}
        <div className="w-full xl:w-1/3 space-y-6 shrink-0">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6">
            <h2 className="text-lg font-black text-white mb-4">Batch Import CSV</h2>
            
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-neutral-700 hover:border-[#f97316]/50 hover:bg-neutral-800/50 rounded-2xl cursor-pointer transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                {file ? (
                  <FileText className="w-10 h-10 text-[#f97316] mb-3" />
                ) : (
                  <UploadCloud className="w-10 h-10 text-neutral-500 mb-3" />
                )}
                <p className="mb-2 text-sm font-bold text-neutral-300 truncate w-full">
                  {file ? file.name : "Drop Transcript CSV Here"}
                </p>
                <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : "CSV format required"}
                </p>
              </div>
              <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full mt-6 py-4 bg-white hover:bg-neutral-200 text-[#030712] font-black uppercase tracking-widest text-xs rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? "Extracting Data..." : "Run Ingestion Pipeline"}
            </button>
          </div>

          {/* Status Messages */}
          {uploadStatus === "success" && (
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="text-green-500 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-green-500">Ingestion Complete</p>
                <p className="text-xs text-green-500/70 mt-1">{message}</p>
              </div>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-red-500">Ingestion Failed</p>
                <p className="text-xs text-red-500/70 mt-1">{message}</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: FULL DATA LIVE PREVIEW */}
        <div className="w-full xl:w-2/3">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Users size={18} className="text-[#f97316]"/> Extracted Records Dashboard
              </h2>
              {previewData.length > 0 && (
                <span className="text-[10px] font-black uppercase tracking-widest bg-orange-500/10 text-[#f97316] px-3 py-1 rounded-full border border-orange-500/20">
                  Total Records: {previewData.length}
                </span>
              )}
            </div>

            {previewData.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 space-y-4 min-h-[300px]">
                <Database size={48} className="opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest">Waiting for data payload...</p>
              </div>
            ) : (
              // NOTE: max-h-[600px] + overflow-y-auto is critical here so your browser doesn't freeze rendering 1300 rows
              <div className="overflow-y-auto overflow-x-auto max-h-[600px] border border-neutral-800 rounded-2xl custom-scrollbar">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="text-[10px] uppercase tracking-widest text-neutral-500 bg-neutral-950 sticky top-0 z-10 shadow-md">
                    <tr>
                      <th className="px-4 py-4 font-black">Student Details</th>
                      <th className="px-4 py-4 font-black flex items-center gap-1"><Lock size={12}/> Credentials</th>
                      <th className="px-4 py-4 font-black text-center">Total Score</th>
                      <th className="px-4 py-4 font-black flex items-center gap-1"><BookOpen size={12}/> Subject Breakdown (Out of 20)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="border-b border-neutral-800/50 last:border-0 hover:bg-neutral-800/20 transition-colors">
                        
                        <td className="px-4 py-4">
                          <p className="font-bold text-white text-base">{row.student_name}</p>
                          <p className="text-xs text-neutral-500 font-mono mt-0.5">{row.application_no}</p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-xs text-neutral-300">{row.email}</p>
                          <p className="text-[10px] font-mono text-[#f97316] mt-1 bg-orange-500/10 w-fit px-2 py-0.5 rounded border border-orange-500/20">
                            PW: {row.passcode}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="text-xl font-black text-white">{row.total_marks}</span>
                          <span className="text-xs text-neutral-500 font-bold"> / 100</span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] uppercase tracking-wider text-neutral-400">
                            <span className="flex justify-between w-28">Math: <b className="text-white">{row.marks_breakdown?.engineering_mathematics}</b></span>
                            <span className="flex justify-between w-28">Elec: <b className="text-white">{row.marks_breakdown?.electrical_electronics}</b></span>
                            <span className="flex justify-between w-28">IT Skill: <b className="text-white">{row.marks_breakdown?.it_skills}</b></span>
                            <span className="flex justify-between w-28">Project: <b className="text-white">{row.marks_breakdown?.project_management}</b></span>
                            <span className="flex justify-between w-28">Stats: <b className="text-white">{row.marks_breakdown?.statistics_analytics}</b></span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}