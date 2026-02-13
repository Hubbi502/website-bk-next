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

    // Convert file ke base64 data URI untuk upload ke Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload ke Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "website-bk/articles",
      resource_type: "image",
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        fileName: result.public_id,
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
