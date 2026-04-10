import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST - Menambah catatan pertemuan baru ke timeline kunjungan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const visitId = id;

    const body = await request.json();
    const { note, isSolved } = body;

    if (!note) {
      return NextResponse.json(
        { success: false, error: "Catatan tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Check if visit exists
    const existingVisit = await prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!existingVisit) {
      return NextResponse.json(
        { success: false, error: "Kunjungan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Create the visit note
    const visitNote = await prisma.visitNote.create({
      data: {
        visitId,
        note,
        isSolved: Boolean(isSolved),
      },
    });

    return NextResponse.json({
      success: true,
      data: visitNote,
    });
  } catch (error: any) {
    console.error("Error creating visit note:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan catatan" },
      { status: 500 }
    );
  }
}
