import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pusherServer, VISIT_CHANNEL } from "@/lib/pusher";

// POST - Guru baru terima atau tolak delegasi
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { response, adminId } = body; // response: "approve" | "reject"

        if (!response || !["approve", "reject"].includes(response)) {
            return NextResponse.json(
                { success: false, error: "response harus 'approve' atau 'reject'" },
                { status: 400 }
            );
        }

        if (!adminId) {
            return NextResponse.json(
                { success: false, error: "adminId wajib diisi" },
                { status: 400 }
            );
        }

        // Check if visit exists and is PENDING_DELEGATION
        const visit = await prisma.visit.findUnique({
            where: { id },
            include: {
                student: { select: { id: true, name: true } },
                assignedAdmin: { select: { id: true, name: true } },
            },
        });

        if (!visit) {
            return NextResponse.json(
                { success: false, error: "Kunjungan tidak ditemukan" },
                { status: 404 }
            );
        }

        if (visit.status !== "PENDING_DELEGATION") {
            return NextResponse.json(
                { success: false, error: "Kunjungan tidak dalam status menunggu konfirmasi guru" },
                { status: 400 }
            );
        }

        // Verify that this admin is actually the assigned one
        if (visit.assignedAdminId !== adminId) {
            return NextResponse.json(
                { success: false, error: "Anda bukan guru yang ditugaskan untuk kunjungan ini" },
                { status: 403 }
            );
        }

        if (response === "approve") {
            const updatedVisit = await prisma.visit.update({
                where: { id },
                data: {
                    status: "APPROVED",
                    approvedBy: adminId,
                    // Update targetTeacher to the new assigned teacher
                    targetTeacherId: adminId,
                },
            });

            await pusherServer.trigger(VISIT_CHANNEL, "visit-status-changed", {
                visitId: id,
                status: "APPROVED",
                studentId: visit.studentId,
                teacherName: visit.assignedAdmin?.name,
            });

            return NextResponse.json({
                success: true,
                message: "Delegasi diterima. Kunjungan disetujui.",
                data: {
                    id: updatedVisit.id,
                    status: updatedVisit.status.toLowerCase(),
                },
            });
        }

        // response === "reject"
        // Add teacher to rejectedAdminIds
        const updatedRejectedIds = [...visit.rejectedAdminIds, adminId];

        // Check if there are still available teachers
        const totalAdmins = await prisma.admin.count({
            where: {
                id: { notIn: updatedRejectedIds },
                role: { in: ["ADMIN", "SUPER_ADMIN"] },
            },
        });

        if (totalAdmins === 0) {
            // No more teachers available — auto cancel
            const updatedVisit = await prisma.visit.update({
                where: { id },
                data: {
                    status: "CANCELLED",
                    rejectedAdminIds: updatedRejectedIds,
                    assignedAdminId: null,
                    notes: "Dibatalkan otomatis: tidak ada guru BK yang tersedia.",
                },
            });

            await pusherServer.trigger(VISIT_CHANNEL, "visit-status-changed", {
                visitId: id,
                status: "CANCELLED",
                studentId: visit.studentId,
                reason: "no_teachers_available",
            });

            return NextResponse.json({
                success: true,
                message: "Semua guru telah menolak. Kunjungan dibatalkan secara otomatis.",
                data: {
                    id: updatedVisit.id,
                    status: updatedVisit.status.toLowerCase(),
                    noTeachersAvailable: true,
                },
            });
        }

        // Still have available teachers — back to AWAITING_STUDENT
        const updatedVisit = await prisma.visit.update({
            where: { id },
            data: {
                status: "AWAITING_STUDENT",
                rejectedAdminIds: updatedRejectedIds,
                assignedAdminId: null,
            },
        });

        await pusherServer.trigger(VISIT_CHANNEL, "visit-status-changed", {
            visitId: id,
            status: "AWAITING_STUDENT",
            studentId: visit.studentId,
            reason: "teacher_rejected",
            teacherName: visit.assignedAdmin?.name,
        });

        return NextResponse.json({
            success: true,
            message: "Delegasi ditolak. Siswa akan diminta memilih guru lain.",
            data: {
                id: updatedVisit.id,
                status: updatedVisit.status.toLowerCase(),
                availableTeachersCount: totalAdmins,
            },
        });
    } catch (error) {
        console.error("Error processing teacher response:", error);
        return NextResponse.json(
            { success: false, error: "Gagal memproses respons guru" },
            { status: 500 }
        );
    }
}
