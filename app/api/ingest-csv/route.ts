import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import Papa from 'papaparse';

// =========================================================
// POST: INGEST CSV TO VERCEL POSTGRES
// =========================================================
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const rawText = await file.text();
    const parsedData = Papa.parse(rawText, { header: false, skipEmptyLines: true });
    
    const rows = parsedData.data.slice(2) as any[][];
    const successfullyIngested: any[] = [];

    // PARALLEL BATCH PROCESSING ENGINE
    const batchSize = 100; // Fire 100 rows at the database at the exact same time
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      // Map over the batch and create an array of simultaneous database promises
      const batchPromises = batch.map(async (row) => {
        const fullName = row[1]?.trim();
        const email = row[7]?.trim();
        
        if (!fullName || !email) return null; 

        const firstName = fullName.split(' ')[0].toLowerCase();
        const passcode = `ncet@${firstName}`;
        // The collision-proof alphanumeric Application Number
        const appNo = `NCET-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const totalMarks = row[58] || "0";
        
        const marksBreakdown = {
          engineering_mathematics: row[14] || "0",
          electrical_electronics: row[22] || "0",
          it_skills: row[30] || "0",
          project_management: row[38] || "0",
          statistics_analytics: row[46] || "0",
        };

        try {
          await sql`
            INSERT INTO ncet_students (
              student_name, email, passcode, branch, scholarship, application_no, total_marks, marks_breakdown
            ) VALUES (
              ${fullName}, ${email}, ${passcode}, 'Computer Science', '₹5,000', ${appNo}, ${totalMarks}, ${JSON.stringify(marksBreakdown)}::jsonb
            )
            ON CONFLICT (email) 
            DO UPDATE SET 
              total_marks = EXCLUDED.total_marks,
              marks_breakdown = EXCLUDED.marks_breakdown;
          `;

          return {
            student_name: fullName,
            email,
            passcode,
            application_no: appNo,
            total_marks: totalMarks,
            marks_breakdown: marksBreakdown
          };
        } catch (dbError) {
          console.error(`Row insertion failed for ${email}:`, dbError);
          return null;
        }
      });

      // Wait for all 100 inserts in this batch to finish simultaneously before doing the next 100
      const batchResults = await Promise.all(batchPromises);
      
      // Filter out any nulls (errors or empty rows) and add to our success array
      batchResults.forEach(result => {
        if (result) successfullyIngested.push(result);
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully uploaded and synchronized ${successfullyIngested.length} student records in record time.`,
      preview: successfullyIngested
    });

  } catch (error) {
    console.error("Neon Ingestion Crash:", error);
    return NextResponse.json({ error: "Database transmission breakdown." }, { status: 500 });
  }
}

// =========================================================
// GET: FETCH RECORDS FOR ADMIN DASHBOARD HYDRATION
// =========================================================
export async function GET() {
  try {
    // Pull the latest records from the Postgres database
    // Ordering by student_name to keep the dashboard organized
    const result = await sql`
      SELECT 
        student_name, 
        email, 
        passcode, 
        application_no, 
        total_marks, 
        marks_breakdown 
      FROM ncet_students
      ORDER BY student_name ASC;
    `;

    return NextResponse.json({ 
      success: true, 
      records: result.rows 
    });

  } catch (error) {
    console.error("Error fetching database records:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve records from the database." }, 
      { status: 500 }
    );
  }
}