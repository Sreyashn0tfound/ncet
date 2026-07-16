import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_name, email } = body;

    if (!student_name || !email) {
      return NextResponse.json({ success: false, error: "Name and Email are required." }, { status: 400 });
    }

    // Generate Passcode: "ncet@firstname"
    const firstName = student_name.trim().split(' ')[0].toLowerCase();
    const passcode = `ncet@${firstName}`;
    
    // Generate Application Number
    const appNo = `NCET-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Default to 0 marks for manual entries
    const marksBreakdown = {
      engineering_mathematics: "0",
      electrical_electronics: "0",
      it_skills: "0",
      project_management: "0",
      statistics_analytics: "0",
    };

    // Insert into Vercel Postgres
    await sql`
      INSERT INTO ncet_students (
        student_name, email, passcode, branch, scholarship, application_no, total_marks, marks_breakdown
      ) VALUES (
        ${student_name.trim()}, ${email.trim()}, ${passcode}, 'Computer Science', '₹5,000', ${appNo}, '0', ${JSON.stringify(marksBreakdown)}::jsonb
      )
      ON CONFLICT (email) 
      DO UPDATE SET 
        student_name = EXCLUDED.student_name,
        passcode = EXCLUDED.passcode;
    `;

    return NextResponse.json({ success: true, message: "Student manually added." });

  } catch (error) {
    console.error("Manual Entry Error:", error);
    return NextResponse.json({ success: false, error: "Database failed to save record." }, { status: 500 });
  }
}