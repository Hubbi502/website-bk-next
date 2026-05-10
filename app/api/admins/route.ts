import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - Get all admins (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const adminId = authHeader.split(" ")[1];
    
    // Check if requester is super admin
    const requester = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (!requester || requester.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only super admin can access this resource" },
        { status: 403 }
      );
    }

    // Get all admins without passwords
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        assignedClasses: true,
        role: true,
        profileImageUrl: true,
        shortBio: true,
        positionTitle: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            articles: true,
            visits: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: admins,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get admins error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new admin (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const adminId = authHeader.split(" ")[1];
    
    // Check if requester is super admin
    const requester = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (!requester || requester.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only super admin can create admins" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      username, 
      password, 
      role,
      profileImageUrl,
      shortBio,
      bio,
      positionTitle,
      education,
      expertise,
      phone,
      emailPublic,
      officeLocation,
      officeHours,
      socialLinks,
      assignedClasses
    } = body;

    // Validation
    if (!name || !username || !password || !role) {
      return NextResponse.json(
        { error: "Name, username, password and role are required" },
        { status: 400 }
      );
    }

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate assignedClasses if provided
    let validAssignedClasses: string[] | undefined = undefined;
    if (assignedClasses !== undefined) {
      if (!Array.isArray(assignedClasses) || assignedClasses.some(c => typeof c !== 'string')) {
        return NextResponse.json({ error: "assignedClasses harus berupa array string" }, { status: 400 });
      }
      // Ensure all class names exist
      const found = await prisma.class.findMany({ where: { name: { in: assignedClasses as string[] } }, select: { name: true } });
      const foundNames = found.map(f => f.name);
      const missing = (assignedClasses as string[]).filter(c => !foundNames.includes(c));
      if (missing.length > 0) {
        return NextResponse.json({ error: `Beberapa kelas tidak ditemukan: ${missing.join(', ')}` }, { status: 400 });
      }
      validAssignedClasses = assignedClasses as string[];
    }
    // Create admin
    const newAdmin = await prisma.admin.create({
      data: {
        name,
        username,
        password: hashedPassword,
        role,
        profileImageUrl: profileImageUrl || null,
        shortBio: shortBio || null,
        bio: bio || null,
        positionTitle: positionTitle || null,
        education: education || null,
        expertise: expertise || null,
        phone: phone || null,
        emailPublic: emailPublic || null,
        officeLocation: officeLocation || null,
        officeHours: officeHours || null,
        socialLinks: socialLinks ? (typeof socialLinks === 'string' ? socialLinks : JSON.stringify(socialLinks)) : null,
        assignedClasses: validAssignedClasses ?? [],
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        positionTitle: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin created successfully",
        data: newAdmin,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create admin error:", error);
    
    // Handle Prisma unique constraint violation (e.g., username already exists)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: "Username already exists or fails unique constraint" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
