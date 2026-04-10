import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/jwt";

// GET - Ambil data admin yang sedang login via JWT
export async function GET(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
    const headerToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: token tidak ditemukan" },
        { status: 401 }
      );
    }

    const payload = verifyAdminToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized: token tidak valid atau sudah kadaluarsa" },
        { status: 401 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        assignedClasses: true,
      },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, admin });
  } catch (error) {
    console.error("Error fetching admin:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
