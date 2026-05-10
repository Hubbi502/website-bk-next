import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/jwt";

// PUT - Update kelas
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieToken = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
    const headerToken = request.headers.get("authorization")?.replace("Bearer ", "");
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAdminToken(token);
    if (!payload || payload.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only super admin can update classes" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, majorId } = body;

    if (!name || !majorId) {
      return NextResponse.json({ error: "Name and majorId are required" }, { status: 400 });
    }

    // Cek apakah class ID valid
    const existingClass = await prisma.class.findUnique({
      where: { id }
    });

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Cek duplikasi nama jika nama diubah
    if (name !== existingClass.name) {
      const nameConflict = await prisma.class.findUnique({
        where: { name }
      });

      if (nameConflict) {
        return NextResponse.json({ error: "Class name already exists" }, { status: 409 });
      }
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: { name, majorId },
      include: {
        major: true,
        _count: { select: { students: true } }
      }
    });

    return NextResponse.json({ success: true, data: updatedClass });
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Hapus kelas
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieToken = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
    const headerToken = request.headers.get("authorization")?.replace("Bearer ", "");
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAdminToken(token);
    if (!payload || payload.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only super admin can delete classes" }, { status: 403 });
    }

    const { id } = await params;

    // Cek keberadaan kelas
    const existingClass = await prisma.class.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true, visits: true }
        }
      }
    });

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Hapus kelas
    await prisma.class.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
