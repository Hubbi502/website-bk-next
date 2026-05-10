import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - List students with role-based filtering
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get("teacherId");
        const role = searchParams.get("role");
        const search = searchParams.get("search") || "";
        const classFilter = searchParams.get("class") || "";

        // If ADMIN (Guru BK), get assignedClasses from database
        let allowedClasses: string[] | null = null;
        if (role === "ADMIN" && teacherId) {
            const admin = await prisma.admin.findUnique({
                where: { id: teacherId },
                select: { assignedClasses: true },
            });
            allowedClasses = admin?.assignedClasses ?? [];
        }

        const students = await prisma.student.findMany({
            where: {
                // Filter by allowed classes (only for Guru BK)
                ...(allowedClasses ? { class: { name: { in: allowedClasses } } } : {}),
                // Optional class filter
                ...(classFilter ? { class: { name: classFilter } } : {}),
                // Search by name or NISN
                ...(search
                    ? {
                        OR: [
                            { name: { contains: search, mode: "insensitive" as const } },
                            { nisn: { contains: search } },
                        ],
                    }
                    : {}),
            },
            select: {
                id: true,
                name: true,
                nisn: true,
                class: { select: { name: true } },
                phone: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: [{ classId: "asc" }, { name: "asc" }],
        });

        // Map class object back to string for frontend compatibility
        const mappedStudents = students.map(s => ({
            ...s,
            class: s.class?.name || "Tidak ada kelas"
        }));

        return NextResponse.json({ success: true, data: mappedStudents }, { status: 200 });
    } catch (error) {
        console.error("Get students error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// POST - Create a new student
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, nisn, password, class: className, phone, teacherId, role } = body;

        // Validation
        if (!name || !nisn || !password || !className) {
            return NextResponse.json(
                { error: "Nama, NISN, Password, dan Kelas wajib diisi" },
                { status: 400 }
            );
        }

        // Guru BK can only add students to their assigned classes
        if (role === "ADMIN" && teacherId) {
            const admin = await prisma.admin.findUnique({
                where: { id: teacherId },
                select: { assignedClasses: true },
            });
            if (!admin?.assignedClasses.includes(className)) {
                return NextResponse.json(
                    { error: "Anda tidak memiliki akses untuk kelas ini" },
                    { status: 403 }
                );
            }
        }

        // Check if NISN already exists
        const existingStudent = await prisma.student.findUnique({
            where: { nisn },
        });
        if (existingStudent) {
            return NextResponse.json(
                { error: "NISN sudah terdaftar" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const classRecord = await prisma.class.findUnique({ where: { name: className } });
        if (!classRecord) {
            return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 400 });
        }

        const student = await prisma.student.create({
            data: {
                name,
                nisn,
                password: hashedPassword,
                classId: classRecord.id,
                phone: phone || null,
            },
            select: {
                id: true,
                name: true,
                nisn: true,
                class: { select: { name: true } },
                phone: true,
                createdAt: true,
            },
        });

        const mappedStudent = { ...student, class: student.class?.name || "Tidak ada kelas" };

        return NextResponse.json(
            { success: true, message: "Siswa berhasil ditambahkan", data: mappedStudent },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create student error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
