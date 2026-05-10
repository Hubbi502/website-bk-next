import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// PUT - Update a student
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, nisn, password, class: className, phone, teacherId, role } = body;

        // Validate access for Guru BK
        if (role === "ADMIN" && teacherId) {
            const admin = await prisma.admin.findUnique({
                where: { id: teacherId },
                select: { assignedClasses: true },
            });
            const student = await prisma.student.findUnique({
                where: { id },
                include: { class: true },
            });

            // Guru BK cannot edit students outside their assigned classes
            if (student && student.class?.name && !admin?.assignedClasses.includes(student.class.name)) {
                return NextResponse.json(
                    { error: "Akses ditolak" },
                    { status: 403 }
                );
            }
            // Guru BK cannot move students to classes outside their scope
            if (className && !admin?.assignedClasses.includes(className)) {
                return NextResponse.json(
                    { error: "Tidak bisa memindahkan siswa ke kelas di luar cakupan Anda" },
                    { status: 403 }
                );
            }
        }

        // Check NISN uniqueness if changed
        if (nisn) {
            const existingStudent = await prisma.student.findFirst({
                where: { nisn, NOT: { id } },
            });
            if (existingStudent) {
                return NextResponse.json(
                    { error: "NISN sudah digunakan oleh siswa lain" },
                    { status: 409 }
                );
            }
        }

        let classId: string | undefined = undefined;
        if (className) {
            const classRecord = await prisma.class.findUnique({ where: { name: className } });
            if (!classRecord) {
                return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 400 });
            }
            classId = classRecord.id;
        }

        const updateData: Record<string, unknown> = {
            name,
            nisn,
            phone: phone || null,
        };
        if (classId) updateData.classId = classId;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updated = await prisma.student.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                nisn: true,
                class: { select: { name: true } },
                phone: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(
            { success: true, message: "Data siswa berhasil diperbarui", data: updated },
            { status: 200 }
        );
    } catch (error) {
        console.error("Update student error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// DELETE - Delete a student
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get("teacherId");
        const role = searchParams.get("role");

        // Validate access for Guru BK
        if (role === "ADMIN" && teacherId) {
            const admin = await prisma.admin.findUnique({
                where: { id: teacherId },
                select: { assignedClasses: true },
            });
            const student = await prisma.student.findUnique({
                where: { id },
                include: { class: true },
            });

            if (student && student.class?.name && !admin?.assignedClasses.includes(student.class.name)) {
                return NextResponse.json(
                    { error: "Akses ditolak" },
                    { status: 403 }
                );
            }
        }

        await prisma.student.delete({ where: { id } });

        return NextResponse.json(
            { success: true, message: "Siswa berhasil dihapus" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Delete student error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
