import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Ambil daftar guru yang belum menolak kunjungan ini
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const visitId = searchParams.get("visitId");

        if (!visitId) {
            return NextResponse.json(
                { success: false, error: "visitId parameter wajib diisi" },
                { status: 400 }
            );
        }

        // Get the visit to know which admins have rejected
        const visit = await prisma.visit.findUnique({
            where: { id: visitId },
            select: {
                rejectedAdminIds: true,
                targetTeacherId: true,
            },
        });

        if (!visit) {
            return NextResponse.json(
                { success: false, error: "Kunjungan tidak ditemukan" },
                { status: 404 }
            );
        }

        // Get all admins except those who already rejected
        const availableAdmins = await prisma.admin.findMany({
            where: {
                id: {
                    notIn: visit.rejectedAdminIds,
                },
            },
            select: {
                id: true,
                name: true,
                role: true,
                assignedClasses: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json({
            success: true,
            data: availableAdmins,
        });
    } catch (error) {
        console.error("Error fetching available admins:", error);
        return NextResponse.json(
            { success: false, error: "Gagal mengambil daftar guru tersedia" },
            { status: 500 }
        );
    }
}
