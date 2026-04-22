import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pusherServer, VISIT_CHANNEL } from "@/lib/pusher";

// POST - Guru BK merespons negosiasi waktu (approve / reject)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { adminId, response, notes } = body;

        if (!adminId || !response || !["approve", "reject"].includes(response)) {
            return NextResponse.json(
                { success: false, error: "adminId dan response ('approve'/'reject') wajib diisi" },
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
        if (visit.status !== "PENDING_TIME_NEGOTIATION") {
            return NextResponse.json(
                { success: false, error: "Kunjungan tidak dalam status negosiasi waktu" },
                { status: 400 }
            );
        }

        // Validate admin is the target teacher
        if (visit.targetTeacherId !== adminId) {
            return NextResponse.json(
                { success: false, error: "Anda tidak berhak merespons negosiasi ini" },
                { status: 403 }
            );
        }

        // Validate proposed date/time exists
        if (!visit.proposedVisitDate || !visit.proposedVisitTime) {
            return NextResponse.json(
                { success: false, error: "Data usulan waktu tidak lengkap" },
                { status: 400 }
            );
        }

        let updateData: Record<string, unknown>;
        let reason: string;
        let message: string;

        if (response === "approve") {
            updateData = {
                visitDate: visit.proposedVisitDate,
                visitTime: visit.proposedVisitTime,
                proposedVisitDate: null,
                proposedVisitTime: null,
                status: "APPROVED",
                approvedBy: adminId,
                timeNegotiationNotes: notes
                    ? (visit.timeNegotiationNotes ? visit.timeNegotiationNotes + "\n" + notes : notes)
                    : visit.timeNegotiationNotes,
            };
            reason = "time_negotiation_approved";
            message = "Usulan waktu disetujui. Kunjungan berhasil dijadwalkan.";
        } else {
            // reject
            updateData = {
                status: "AWAITING_STUDENT",
                proposedVisitDate: null,
                proposedVisitTime: null,
                timeNegotiationNotes: notes
                    ? (visit.timeNegotiationNotes ? visit.timeNegotiationNotes + "\n" + notes : notes)
                    : visit.timeNegotiationNotes,
            };
            reason = "time_negotiation_rejected";
            message = "Usulan waktu ditolak. Siswa akan diminta memilih opsi lain.";
        }

        const updatedVisit = await prisma.visit.update({
            where: { id },
            data: updateData,
        });

        // Trigger Pusher event
        await pusherServer.trigger(VISIT_CHANNEL, "visit-status-changed", {
            visitId: id,
            status: updatedVisit.status,
            teacherId: visit.targetTeacherId,
            studentId: visit.studentId,
            reason,
        });

        return NextResponse.json({
            success: true,
            message,
            data: {
                id: updatedVisit.id,
                status: updatedVisit.status.toLowerCase(),
            },
        });
    } catch (error) {
        console.error("Error responding to time negotiation:", error);
        return NextResponse.json(
            { success: false, error: "Gagal memproses respons negosiasi waktu" },
            { status: 500 }
        );
    }
}
