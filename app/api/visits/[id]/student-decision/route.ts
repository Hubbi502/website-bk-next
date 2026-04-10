import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pusherServer, VISIT_CHANNEL } from "@/lib/pusher";

// POST - Siswa putuskan lanjut atau batal
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { decision } = body; // "cancel" | "continue"

        if (!decision || !["cancel", "continue"].includes(decision)) {
            return NextResponse.json(
                { success: false, error: "decision harus 'cancel' atau 'continue'" },
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

        if (decision === "cancel") {
            const updatedVisit = await prisma.visit.update({
                where: { id },
                data: { status: "CANCELLED" },
            });

            await pusherServer.trigger(VISIT_CHANNEL, "visit-status-changed", {
                visitId: id,
                status: "CANCELLED",
                studentId: visit.studentId,
            });

            return NextResponse.json({
                success: true,
                message: "Kunjungan berhasil dibatalkan",
                data: {
                    id: updatedVisit.id,
                    status: updatedVisit.status.toLowerCase(),
                },
            });
        }

        // decision === "continue" — siswa ingin lanjut memilih guru lain
        // Status tetap AWAITING_STUDENT, frontend akan menampilkan daftar guru
        return NextResponse.json({
            success: true,
            message: "Silakan pilih guru BK lain yang tersedia",
            data: {
                id: visit.id,
                status: visit.status.toLowerCase(),
            },
        });
    } catch (error) {
        console.error("Error processing student decision:", error);
        return NextResponse.json(
            { success: false, error: "Gagal memproses keputusan siswa" },
            { status: 500 }
        );
    }
}
