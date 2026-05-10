import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/jwt";

// PUT - Update jurusan (hanya SUPER_ADMIN)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieToken = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
    const headerToken = request.headers.get("authorization")?.replace("Bearer ", "");
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAdminToken(token);
    if (!payload || payload.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only super admin can update majors" }, { status: 403 });
    }

    const body = await request.json();
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Name and code are required" }, { status: 400 });
    }

    const existingMajor = await prisma.major.findUnique({
      where: { code }
    });

    if (existingMajor && existingMajor.id !== id) {
      return NextResponse.json({ error: "Major code already exists" }, { status: 409 });
    }

    const major = await prisma.major.update({
      where: { id },
      data: { name, code }
    });

    return NextResponse.json({ success: true, data: major });
  } catch (error) {
    console.error("Error updating major:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Hapus jurusan (hanya SUPER_ADMIN)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieToken = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
    const headerToken = request.headers.get("authorization")?.replace("Bearer ", "");
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAdminToken(token);
    if (!payload || payload.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only super admin can delete majors" }, { status: 403 });
    }

    await prisma.major.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Major deleted successfully" });
  } catch (error) {
    console.error("Error deleting major:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
