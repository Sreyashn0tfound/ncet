import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and Password required' }, { status: 400 });
    }

    // 1. Query the live Neon database for a matching student
    const { rows } = await sql`
      SELECT * FROM ncet_students 
      WHERE email = ${email.trim()} AND passcode = ${password.trim()}
      LIMIT 1;
    `;

    // 2. If no rows come back, the password or email is wrong
    if (rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials. Please check your email and passcode.' 
      }, { status: 401 });
    }

    // 3. Grab the verified student data
    const student = rows[0];

    // SUCCESS! Return the ENTIRE student object to the frontend
    return NextResponse.json({ 
      success: true, 
      student: student 
    });
    
  } catch (error) {
    console.error("Auth API Error:", error);
    return NextResponse.json({ success: false, error: 'Database connection error during authentication.' }, { status: 500 });
  }
}