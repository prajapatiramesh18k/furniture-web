import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Quotation from "@/lib/models/Quotation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ananya-furniture-secret-key-2024";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const newQuotation = new Quotation(body);
    await newQuotation.save();

    return NextResponse.json(
      { success: true, quotation: newQuotation },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error saving quotation:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save quotation" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Optional: Protect this route so only admins can view all quotations
    // For now, we will check if the user is an admin using their auth-token cookie.
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { isAdmin: boolean };
      if (!decoded.isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Fetch all quotations, sorted by newest first
    const quotations = await Quotation.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, quotations });
  } catch (error: any) {
    console.error("Error fetching quotations:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch quotations" },
      { status: 500 },
    );
  }
}
