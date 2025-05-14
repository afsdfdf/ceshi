import { NextResponse } from "next/server";
import { searchDB } from "@/lib/supabase";

// Check if Supabase environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  try {
    const { chain, address } = await request.json();

    if (!chain || !address) {
      return NextResponse.json(
        { success: false, error: "Missing chain or address" },
        { status: 400 }
      );
    }

    // If Supabase credentials are missing, return success without actually recording
    if (!supabaseUrl || !supabaseKey) {
      console.warn("Skipping search recording because Supabase credentials are missing");
      return NextResponse.json({ 
        success: true, 
        message: "Search recording skipped due to missing Supabase configuration" 
      });
    }

    await searchDB.recordSearch(chain, address);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording search:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record search" },
      { status: 500 }
    );
  }
} 