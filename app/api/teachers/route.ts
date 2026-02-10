import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Mengambil daftar guru BK yang tersedia untuk kelas tertentu
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const studentClass = searchParams.get("class");

        // Jika tidak ada kelas, kembalikan semua guru yang bisa dipilih
        // Super Admin bisa menangani semua kelas
        const teachers = await prisma.admin.findMany({
            where: studentClass
                ? {
                    OR: [
                        // Super Admin bisa menangani semua kelas
                        { role: "SUPER_ADMIN" },
                        // Guru dengan kelas yang sesuai
                        { assignedClasses: { has: studentClass } },
                    ],
                }
                : undefined,
            select: {
                id: true,
                name: true,
                role: true,
                assignedClasses: true,
            },
            orderBy: [
                { role: "desc" }, // Super Admin dulu
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
