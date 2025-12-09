import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST - Register new student
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, nisn, password, class: studentClass, phone } = body;

    // Validation
    if (!name || !nisn || !password) {
      return NextResponse.json(
        { success: false, error: "Nama, NISN, dan password harus diisi" },
        { status: 400 }
      );
    }

    // Check if NISN already exists
    const existingStudent = await prisma.student.findUnique({
      where: { nisn },
    });

    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: "NISN sudah terdaftar" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = await prisma.student.create({
      data: {
        name,
        nisn,
        password: hashedPassword,
        class: studentClass || "-",
        phone: phone || null,
      },
      select: {
        id: true,
        name: true,
        nisn: true,
        class: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Registrasi berhasil",
        student: student 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering student:", error);
    return NextResponse.json(
      { success: false, error: "Gagal melakukan registrasi" },
      { status: 500 }
    );
  }
}
