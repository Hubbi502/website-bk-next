import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - Get single admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const admin = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        assignedClasses: true,
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
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: admin,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get admin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update admin (Super Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        { error: "Forbidden: Only super admin can update admins" },
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

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    // Check if username is taken by another admin
    if (username && username !== existingAdmin.username) {
      const usernameTaken = await prisma.admin.findUnique({
        where: { username },
      });

      if (usernameTaken) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (username !== undefined) updateData.username = username;
    if (role !== undefined && (role === "ADMIN" || role === "SUPER_ADMIN")) {
      updateData.role = role;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    // Add optional fields
    if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;
    if (shortBio !== undefined) updateData.shortBio = shortBio;
    if (bio !== undefined) updateData.bio = bio;
    if (positionTitle !== undefined) updateData.positionTitle = positionTitle;
    if (education !== undefined) updateData.education = education;
    if (expertise !== undefined) updateData.expertise = expertise;
    if (phone !== undefined) updateData.phone = phone;
    if (emailPublic !== undefined) updateData.emailPublic = emailPublic;
    if (officeLocation !== undefined) updateData.officeLocation = officeLocation;
    if (officeHours !== undefined) updateData.officeHours = officeHours;
    if (socialLinks !== undefined) {
      updateData.socialLinks = typeof socialLinks === 'string' ? socialLinks : (socialLinks ? JSON.stringify(socialLinks) : null);
    }

    // Validate and set assignedClasses if provided
    if (assignedClasses !== undefined) {
      if (!Array.isArray(assignedClasses) || assignedClasses.some(c => typeof c !== 'string')) {
        return NextResponse.json({ error: "assignedClasses harus berupa array string" }, { status: 400 });
      }
      const found = await prisma.class.findMany({ where: { name: { in: assignedClasses as string[] } }, select: { name: true } });
      const foundNames = found.map(f => f.name);
      const missing = (assignedClasses as string[]).filter(c => !foundNames.includes(c));
      if (missing.length > 0) {
        return NextResponse.json({ error: `Beberapa kelas tidak ditemukan: ${missing.join(', ')}` }, { status: 400 });
      }
      updateData.assignedClasses = assignedClasses as string[];
    }

    // Update admin
    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        profileImageUrl: true,
        shortBio: true,
        positionTitle: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin updated successfully",
        data: updatedAdmin,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update admin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete admin (Super Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      select: { role: true, id: true },
    });

    if (!requester || requester.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only super admin can delete admins" },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (requester.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if admin exists
    const adminToDelete = await prisma.admin.findUnique({
      where: { id },
    });

    if (!adminToDelete) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    // Delete admin
    await prisma.admin.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete admin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
