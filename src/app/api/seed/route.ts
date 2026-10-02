import { NextResponse } from "next/server";
import { seed } from "@/lib/seed";

export async function POST() {
  try {
    const result = await seed();
    return NextResponse.json({ success: true, message: result });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}