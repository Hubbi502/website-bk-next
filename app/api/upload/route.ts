import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Tidak ada file yang diupload" },
        { status: 400 }
      );
    }

    // Validasi tipe file
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Tipe file tidak valid. Hanya JPG, PNG, WEBP, dan GIF yang diperbolehkan" },
        { status: 400 }
      );
    }

    // Validasi ukuran file (maksimal 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Ukuran file terlalu besar. Maksimal 5MB" },
        { status: 400 }
      );
    }

    // Buat nama file unik
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate nama file unik dengan timestamp
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, "-");
    const fileName = `${timestamp}-${originalName}`;
    
    // Path untuk menyimpan file
    const uploadDir = path.join(process.cwd(), "public", "uploads", "articles");
    const filePath = path.join(uploadDir, fileName);

    // Buat direktori jika belum ada
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Simpan file
    await writeFile(filePath, buffer);

    // Return URL path yang bisa diakses
    const fileUrl = `/uploads/articles/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        fileName: fileName,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengupload file" },
      { status: 500 }
    );
  }
}
