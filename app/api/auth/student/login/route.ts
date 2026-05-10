import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signStudentToken, STUDENT_TOKEN_COOKIE } from "@/lib/jwt";

// POST - Login student
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nisn, password } = body;

    // Validation
    if (!nisn || !password) {
      return NextResponse.json(
        { success: false, error: "NISN dan password harus diisi" },
        { status: 400 }
      );
    }

    // Find student
    const student = await prisma.student.findUnique({
      where: { nisn },
      include: { class: true }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "NISN atau password tidak valid" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "NISN atau password tidak valid" },
        { status: 401 }
      );
    }

    // Return student data (exclude password) + JWT token

    const token = signStudentToken({
      id: student.id,
      nisn: student.nisn,
      name: student.name,
      class: student.class?.name || "",
    });

    const { password: _password, class: classObj, ...studentRest } = student;

    const res = NextResponse.json({
      success: true,
      message: "Login berhasil",
      student: {
        ...studentRest,
        class: classObj?.name || "Tidak ada kelas",
      },
      token,
    });

    // Set JWT sebagai httpOnly cookie
    res.cookies.set(STUDENT_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Error logging in student:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  }
}
