import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/jwt";

// GET - Ambil semua kelas
export async function GET(request: NextRequest) {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { name: 'asc' },
      include: {
        major: true,
        _count: { select: { students: true } }
      }
    });
    return NextResponse.json({ success: true, data: classes });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Buat kelas baru (hanya SUPER_ADMIN)
export async function POST(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
    const headerToken = request.headers.get("authorization")?.replace("Bearer ", "");
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAdminToken(token);
    if (!payload || payload.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only super admin can create classes" }, { status: 403 });
    }

    const body = await request.json();
    const { name, majorId } = body;

    if (!name || !majorId) {
      return NextResponse.json({ error: "Name and majorId are required" }, { status: 400 });
    }

    const existingClass = await prisma.class.findUnique({
      where: { name }
    });

    if (existingClass) {
      return NextResponse.json({ error: "Class name already exists" }, { status: 409 });
    }

    const newClass = await prisma.class.create({
      data: { name, majorId },
      include: {
        major: true,
        _count: { select: { students: true } }
      }
    });

    return NextResponse.json({ success: true, data: newClass }, { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
