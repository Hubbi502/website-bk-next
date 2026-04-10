import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pusherServer, VISIT_CHANNEL } from "@/lib/pusher";

// POST - Siswa pilih guru baru untuk delegasi kunjungan
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { teacherId } = body;

        if (!teacherId) {
            return NextResponse.json(
                { success: false, error: "teacherId wajib diisi" },
                { status: 400 }
            );
        }

        // Check if visit exists and is AWAITING_STUDENT
        const visit = await prisma.visit.findUnique({
            where: { id },
        });

        if (!visit) {
            return NextResponse.json(
                { success: false, error: "Kunjungan tidak ditemukan" },
                { status: 404 }
            );
        }

        if (visit.status !== "AWAITING_STUDENT") {
            return NextResponse.json(
                { success: false, error: "Kunjungan tidak dalam status menunggu keputusan siswa" },
                { status: 400 }
            );
        }

        // Check if teacher is in rejectedAdminIds
        if (visit.rejectedAdminIds.includes(teacherId)) {
            return NextResponse.json(
                { success: false, error: "Guru ini sudah menolak kunjungan sebelumnya" },
                { status: 400 }
            );
        }

        // Verify teacher exists
        const teacher = await prisma.admin.findUnique({
            where: { id: teacherId },
            select: { id: true, name: true },
        });

        if (!teacher) {
            return NextResponse.json(
                { success: false, error: "Guru tidak ditemukan" },
                { status: 404 }
            );
        }

        // Update visit: assign new teacher, status -> PENDING_DELEGATION
        const updatedVisit = await prisma.visit.update({
            where: { id },
            data: {
                assignedAdminId: teacherId,
                status: "PENDING_DELEGATION",
                delegationStep: { increment: 1 },
            },
            include: {
                student: {
                    select: { id: true, name: true, class: true },
                },
                assignedAdmin: {
                    select: { id: true, name: true },
                },
            },
        });

        // Trigger Pusher event for the new teacher
        await pusherServer.trigger(VISIT_CHANNEL, "visit-delegation-new", {
            visitId: id,
            teacherId: teacherId,
            teacherName: teacher.name,
            studentName: updatedVisit.student?.name,
            studentClass: updatedVisit.student?.class,
            reason: updatedVisit.reason,
            visitDate: updatedVisit.visitDate.toISOString().split("T")[0],
            visitTime: updatedVisit.visitTime,
        });

        return NextResponse.json({
            success: true,
            message: `Kunjungan berhasil didelegasikan ke ${teacher.name}. Menunggu konfirmasi guru.`,
            data: {
                id: updatedVisit.id,
                status: updatedVisit.status.toLowerCase(),
                assignedAdmin: updatedVisit.assignedAdmin,
                delegationStep: updatedVisit.delegationStep,
            },
        });
    } catch (error) {
        console.error("Error delegating visit:", error);
        return NextResponse.json(
            { success: false, error: "Gagal mendelegasikan kunjungan" },
            { status: 500 }
        );
    }
}
