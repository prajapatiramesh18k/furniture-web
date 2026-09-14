import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Quotation from "@/lib/models/Quotation";

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
    // Only staff with quotations access can view all quotations.
    const { requireAdmin } = await import('@/lib/admin-auth');
    const gate = await requireAdmin(request, 'quotations');
    if ('error' in gate) return gate.error;

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

export async function DELETE(request: NextRequest) {
  const { requireAdmin } = await import('@/lib/admin-auth');
  const gate = await requireAdmin(request, 'quotations');
  if ('error' in gate) return gate.error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Quotation id is required' }, { status: 400 });
    }
    await dbConnect();
    const deleted = await Quotation.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Quotation deleted' });
  } catch (error: any) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete quotation' },
      { status: 500 },
    );
  }
}
