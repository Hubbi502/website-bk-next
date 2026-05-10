import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pusherServer, VISIT_CHANNEL } from "@/lib/pusher";

// POST - Guru BK menandai diri tersedia di tengah waktu tunggu
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { adminId } = body;

        if (!adminId) {
            return NextResponse.json(
                { success: false, error: "adminId wajib diisi" },
                { status: 400 }
            );
        }

        // Check if visit exists and is WAITING
        const visit = await prisma.visit.findUnique({
            where: { id },
        });

        if (!visit) {
            return NextResponse.json(
                { success: false, error: "Kunjungan tidak ditemukan" },
                { status: 404 }
            );
        }

        if (visit.status !== "WAITING") {
            return NextResponse.json(
                { success: false, error: "Hanya kunjungan berstatus WAITING yang bisa ditandai tersedia" },
                { status: 400 }
            );
        }

        // Verify teacher is the target teacher
        if (visit.targetTeacherId !== adminId) {
            return NextResponse.json(
                { success: false, error: "Anda bukan guru BK yang dituju untuk kunjungan ini" },
                { status: 403 }
            );
        }

        // Update visit: status -> AWAITING_STUDENT, clear wait timer
        const updatedVisit = await prisma.visit.update({
            where: { id },
            data: {
                status: "AWAITING_STUDENT",
                waitExpiredAt: null,
                waitDurationMinutes: null,
                notes: "Guru BK tersedia. Menunggu konfirmasi siswa.",
            },
            include: {
                targetTeacher: {
                    select: { id: true, name: true, role: true },
                },
                student: {
                    select: { id: true, name: true },
                },
            },
        });

        // Trigger Pusher event for real-time notification to student
        await pusherServer.trigger(VISIT_CHANNEL, "visit-status-changed", {
            visitId: id,
            status: "AWAITING_STUDENT",
            reason: "teacher_available",
            teacherName: updatedVisit.targetTeacher?.name,
            studentId: updatedVisit.studentId,
        });

        return NextResponse.json({
            success: true,
            message: "Berhasil menandai tersedia. Siswa akan diminta konfirmasi.",
            data: {
                id: updatedVisit.id,
                status: updatedVisit.status.toLowerCase(),
            },
        });
    } catch (error) {
        console.error("Error marking available:", error);
        return NextResponse.json(
            { success: false, error: "Gagal menandai tersedia" },
            { status: 500 }
        );
    }
}
