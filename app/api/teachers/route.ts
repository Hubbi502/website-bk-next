import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Mengambil daftar guru BK yang tersedia untuk kelas tertentu
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const studentClass = searchParams.get("class");

        // Hanya tampilkan guru BK biasa (ADMIN) yang menangani kelas siswa
        // Koordinator (SUPER_ADMIN) tidak ditampilkan di pilihan siswa
        const teachers = await prisma.admin.findMany({
            where: {
                role: "ADMIN", // Hanya guru biasa, bukan koordinator
                ...(studentClass ? { assignedClasses: { has: studentClass } } : {}),
            },
            select: {
                id: true,
                name: true,
                role: true,
                assignedClasses: true,
            },
            orderBy: [
                { name: "asc" },
            ],
        });

        return NextResponse.json({
            success: true,
            data: teachers,
        });
    } catch (error) {
        console.error("Error fetching teachers:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Gagal mengambil data guru BK",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
