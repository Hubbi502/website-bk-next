import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pusherServer, VISIT_CHANNEL } from "@/lib/pusher";

// POST - Guru BK tandai diri tidak tersedia untuk kunjungan ini
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

        // Check if visit exists and is PENDING
        const visit = await prisma.visit.findUnique({
            where: { id },
        });

        if (!visit) {
            return NextResponse.json(
                { success: false, error: "Kunjungan tidak ditemukan" },
                { status: 404 }
            );
        }

        if (visit.status !== "PENDING") {
            return NextResponse.json(
                { success: false, error: "Hanya kunjungan berstatus PENDING yang bisa ditandai tidak tersedia" },
                { status: 400 }
            );
        }

        // Update visit: status -> AWAITING_STUDENT, add admin to rejectedAdminIds
        const updatedVisit = await prisma.visit.update({
            where: { id },
            data: {
                status: "AWAITING_STUDENT",
                rejectedAdminIds: {
                    push: adminId,
                },
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
            teacherName: updatedVisit.targetTeacher?.name,
            studentId: updatedVisit.studentId,
        });

        return NextResponse.json({
            success: true,
            message: "Berhasil menandai tidak tersedia. Siswa akan diberitahu untuk memilih guru lain.",
            data: {
                id: updatedVisit.id,
                status: updatedVisit.status.toLowerCase(),
            },
        });
    } catch (error) {
        console.error("Error marking unavailable:", error);
        return NextResponse.json(
            { success: false, error: "Gagal menandai tidak tersedia" },
            { status: 500 }
        );
    }
}
