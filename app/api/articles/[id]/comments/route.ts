import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all comments for an article
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const comments = await prisma.comment.findMany({
      where: {
        articleId: id,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            class: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, content, studentId } = body;

    // Validation
    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // If not authenticated, require name
    if (!studentId && !name) {
      return NextResponse.json(
        { error: "Name is required for anonymous comments" },
        { status: 400 }
      );
    }

    // Verify article exists
    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        articleId: id,
        studentId: studentId || null,
        name: !studentId ? name : null,
        email: !studentId ? (email || null) : null,
      },
      include: {
        student: studentId ? {
          select: {
            id: true,
            name: true,
            class: true,
          },
        } : false,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
