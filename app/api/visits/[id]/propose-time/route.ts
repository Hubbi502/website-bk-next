import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pusherServer, VISIT_CHANNEL } from "@/lib/pusher";

// POST - Siswa mengusulkan waktu baru ke guru BK asal
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { studentId, proposedVisitDate, proposedVisitTime } = body;

        if (!studentId || !proposedVisitDate || !proposedVisitTime) {
            return NextResponse.json(
                { success: false, error: "studentId, proposedVisitDate, dan proposedVisitTime wajib diisi" },
                { status: 400 }
            );
        }

        // Check visit exists
        const visit = await prisma.visit.findUnique({ where: { id } });

        if (!visit) {
            return NextResponse.json(
                { success: false, error: "Kunjungan tidak ditemukan" },
                { status: 404 }
            );
        }

        // Validate status
        if (visit.status !== "AWAITING_STUDENT") {
            return NextResponse.json(
                { success: false, error: "Kunjungan tidak dalam status menunggu keputusan siswa" },
                { status: 400 }
            );
        }

        // Validate student ownership
        if (visit.studentId !== studentId) {
            return NextResponse.json(
                { success: false, error: "Anda tidak berhak mengubah kunjungan ini" },
                { status: 403 }
            );
        }

        // Validate target teacher exists
        if (!visit.targetTeacherId) {
            return NextResponse.json(
                { success: false, error: "Guru BK asal tidak ditemukan pada kunjungan ini" },
                { status: 400 }
            );
        }

        // Validate date/time not in the past
        const proposedDate = new Date(proposedVisitDate);
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];
        const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

        if (proposedVisitDate < todayStr || (proposedVisitDate === todayStr && proposedVisitTime <= currentTime)) {
            return NextResponse.json(
                { success: false, error: "Tanggal dan waktu usulan tidak boleh di masa lalu" },
                { status: 400 }
            );
        }

        // Check slot conflict — cari visit lain (bukan visit ini) yang bentrok
        const conflicting = await prisma.visit.findFirst({
            where: {
                id: { not: id },
                targetTeacherId: visit.targetTeacherId,
                visitDate: proposedDate,
                visitTime: proposedVisitTime,
                status: {
                    in: ["PENDING", "APPROVED", "FORWARDED", "PENDING_TIME_NEGOTIATION"],
                },
            },
        });

        if (conflicting) {
            return NextResponse.json(
                { success: false, error: "Slot waktu yang dipilih sudah terisi. Silakan pilih waktu lain." },
                { status: 409 }
            );
        }

        // Update visit
        const updatedVisit = await prisma.visit.update({
            where: { id },
            data: {
                status: "PENDING_TIME_NEGOTIATION",
                proposedVisitDate: proposedDate,
                proposedVisitTime: proposedVisitTime,
                timeNegotiationStep: { increment: 1 },
            },
        });

        // Trigger Pusher event
        await pusherServer.trigger(VISIT_CHANNEL, "visit-status-changed", {
            visitId: id,
            status: "PENDING_TIME_NEGOTIATION",
            teacherId: visit.targetTeacherId,
            studentId: visit.studentId,
            reason: "time_negotiation_requested",
        });

        return NextResponse.json({
            success: true,
            message: "Usulan waktu baru berhasil dikirim. Menunggu konfirmasi guru BK.",
            data: {
                id: updatedVisit.id,
                status: updatedVisit.status.toLowerCase(),
                proposedVisitDate: updatedVisit.proposedVisitDate?.toISOString().split("T")[0],
                proposedVisitTime: updatedVisit.proposedVisitTime,
                timeNegotiationStep: updatedVisit.timeNegotiationStep,
            },
        });
    } catch (error) {
        console.error("Error proposing time:", error);
        return NextResponse.json(
            { success: false, error: "Gagal mengirim usulan waktu baru" },
            { status: 500 }
        );
    }
}
