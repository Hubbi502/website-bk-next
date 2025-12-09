import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

    // Return student data (exclude password)
    const { password: _, ...studentData } = student;

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      student: studentData,
    });
  } catch (error) {
    console.error("Error logging in student:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  }
}
