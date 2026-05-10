import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyStudentToken, STUDENT_TOKEN_COOKIE } from "@/lib/jwt";

// GET - Get current student info (requires JWT)
export async function GET(request: NextRequest) {
  try {
    // Ambil token dari cookie httpOnly atau header Authorization
    const cookieToken = request.cookies.get(STUDENT_TOKEN_COOKIE)?.value;
    const headerToken = request.headers.get("authorization")?.replace("Bearer ", "");
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: token tidak ditemukan" },
        { status: 401 }
      );
    }

    const payload = verifyStudentToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized: token tidak valid atau sudah kadaluarsa" },
        { status: 401 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        nisn: true,
        class: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...student,
        class: typeof student.class === 'object' && student.class !== null
          ? (student.class as any).name
          : student.class || "Tidak ada kelas",
      },
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}
