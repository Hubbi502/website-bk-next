import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST - Register new student
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, class: studentClass, phone } = body;

    // Validation
    if (!name || !email || !password || !studentClass) {
      return NextResponse.json(
        { error: "Name, email, password, and class are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingStudent = await prisma.student.findUnique({
      where: { email },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = await prisma.student.create({
      data: {
        name,
        email,
        password: hashedPassword,
        class: studentClass,
        phone: phone || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        class: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Registration successful",
        data: student 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering student:", error);
    return NextResponse.json(
      { error: "Failed to register student" },
      { status: 500 }
    );
  }
}
