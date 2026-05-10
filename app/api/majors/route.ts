import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/jwt";

// GET - Ambil semua jurusan
export async function GET(request: NextRequest) {
  try {
    const majors = await prisma.major.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { classes: true } }
      }
    });
    return NextResponse.json({ success: true, data: majors });
  } catch (error) {
    console.error("Error fetching majors:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Buat jurusan baru (hanya SUPER_ADMIN)
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
      return NextResponse.json({ error: "Forbidden: Only super admin can create majors" }, { status: 403 });
    }

    const body = await request.json();
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Name and code are required" }, { status: 400 });
    }

    const existingMajor = await prisma.major.findUnique({
      where: { code }
    });

    if (existingMajor) {
      return NextResponse.json({ error: "Major code already exists" }, { status: 409 });
    }

    const major = await prisma.major.create({
      data: { name, code }
    });

    return NextResponse.json({ success: true, data: major }, { status: 201 });
  } catch (error) {
    console.error("Error creating major:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
