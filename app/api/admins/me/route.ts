import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/jwt";
import { z } from "zod";

const allowedRoles = new Set(["ADMIN", "SUPER_ADMIN"]);

const profileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Nama wajib diisi")
      .max(120, "Nama maksimal 120 karakter")
      .optional(),
    profileImageUrl: z
      .string()
      .url("URL foto profil tidak valid")
      .max(2048, "URL foto profil terlalu panjang")
      .nullable()
      .optional(),
    shortBio: z
      .string()
      .max(160, "Bio singkat maksimal 160 karakter")
      .nullable()
      .optional(),
    bio: z
      .string()
      .max(2000, "Bio maksimal 2000 karakter")
      .nullable()
      .optional(),
    positionTitle: z
      .string()
      .max(120, "Jabatan maksimal 120 karakter")
      .nullable()
      .optional(),
    education: z
      .string()
      .max(200, "Pendidikan maksimal 200 karakter")
      .nullable()
      .optional(),
    expertise: z
      .string()
      .max(200, "Keahlian maksimal 200 karakter")
      .nullable()
      .optional(),
    phone: z
      .string()
      .max(30, "Nomor telepon maksimal 30 karakter")
      .nullable()
      .optional(),
    emailPublic: z
      .string()
      .email("Email publik tidak valid")
      .max(200, "Email publik maksimal 200 karakter")
      .nullable()
      .optional(),
    officeLocation: z
      .string()
      .max(200, "Lokasi ruang maksimal 200 karakter")
      .nullable()
      .optional(),
    officeHours: z
      .string()
      .max(200, "Jam layanan maksimal 200 karakter")
      .nullable()
      .optional(),
    socialLinks: z
      .string()
      .max(2048, "Tautan sosial maksimal 2048 karakter")
      .nullable()
      .optional(),
  })
  .strip();

const nullableFields = new Set([
  "profileImageUrl",
  "shortBio",
  "bio",
  "positionTitle",
  "education",
  "expertise",
  "phone",
  "emailPublic",
  "officeLocation",
  "officeHours",
  "socialLinks",
]);

const profileSelect = {
  id: true,
  name: true,
  username: true,
  role: true,
  profileImageUrl: true,
  shortBio: true,
  bio: true,
  positionTitle: true,
  education: true,
  expertise: true,
  phone: true,
  emailPublic: true,
  officeLocation: true,
  officeHours: true,
  socialLinks: true,
};

function getToken(request: NextRequest): string | null {
  const cookieToken = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const headerToken = request.headers
    .get("authorization")
    ?.replace("Bearer ", "");
  return cookieToken || headerToken || null;
}

function normalizeProfileInput(
  input: Record<string, unknown>
): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) {
      normalized[key] = undefined;
      continue;
    }

    if (value === null) {
      normalized[key] = null;
      continue;
    }

    if (typeof value !== "string") {
      normalized[key] = value;
      continue;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0 && nullableFields.has(key)) {
      normalized[key] = null;
    } else {
      normalized[key] = trimmed;
    }
  }

  return normalized;
}

function getPayload(request: NextRequest) {
  const token = getToken(request);
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function GET(request: NextRequest) {
  try {
    const payload = getPayload(request);
    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized: token tidak ditemukan" },
        { status: 401 }
      );
    }

    if (!allowedRoles.has(payload.role)) {
      return NextResponse.json(
        { error: "Forbidden: role tidak diizinkan" },
        { status: 403 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: payload.id },
      select: profileSelect,
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Profil tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: admin });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = getPayload(request);
    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized: token tidak ditemukan" },
        { status: 401 }
      );
    }

    if (!allowedRoles.has(payload.role)) {
      return NextResponse.json(
        { error: "Forbidden: role tidak diizinkan" },
        { status: 403 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Body request tidak valid" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Body request tidak valid" },
        { status: 400 }
      );
    }

    const normalized = normalizeProfileInput(body as Record<string, unknown>);
    const parsed = profileSchema.safeParse(normalized);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updateData = Object.fromEntries(
      Object.entries(parsed.data).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data yang diperbarui" },
        { status: 400 }
      );
    }

    const updated = await prisma.admin.update({
      where: { id: payload.id },
      data: updateData,
      select: profileSelect,
    });

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
