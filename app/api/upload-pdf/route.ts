import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

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

    // Validasi tipe file - hanya PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Tipe file tidak valid. Hanya file PDF yang diperbolehkan" },
        { status: 400 }
      );
    }

    // Validasi ukuran file (maksimal 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Ukuran file terlalu besar. Maksimal 10MB" },
        { status: 400 }
      );
    }

    // Convert file ke base64 data URI untuk upload ke Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload ke Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "website-bk/articles/pdfs",
      resource_type: "image", // Diubah menjadi image agar menghindari blokir default PDF
      format: "pdf",
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        fileName: file.name,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengupload file PDF" },
      { status: 500 }
    );
  }
}
