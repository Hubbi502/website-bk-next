import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Mengambil artikel berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = id;
    if (articleId.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "ID artikel tidak valid",
        },
        { status: 400 }
      );
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          error: "Artikel tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const formattedArticle = {
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      image: article.image,
      category: article.category,
      readTime: article.readTime,
      author: article.author.name,
      date: article.createdAt.toISOString().split("T")[0],
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedArticle,
    });
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil data artikel",
      },
      { status: 500 }
    );
  }
}

// PUT/PATCH - Update artikel berdasarkan ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
        const articleId = id;
    if (articleId.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "ID artikel tidak valid",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, excerpt, content, image, category, readTime } = body;

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!existingArticle) {
      return NextResponse.json(
        {
          success: false,
          error: "Artikel tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Update artikel
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        ...(title && { title }),
        ...(excerpt && { excerpt }),
        ...(content && { content }),
        ...(image && { image }),
        ...(category && { category }),
        ...(readTime && { readTime }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    const formattedArticle = {
      id: updatedArticle.id,
      title: updatedArticle.title,
      excerpt: updatedArticle.excerpt,
      content: updatedArticle.content,
      image: updatedArticle.image,
      category: updatedArticle.category,
      readTime: updatedArticle.readTime,
      author: updatedArticle.author.name,
      date: updatedArticle.createdAt.toISOString().split("T")[0],
      createdAt: updatedArticle.createdAt.toISOString(),
      updatedAt: updatedArticle.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Artikel berhasil diperbarui",
      data: formattedArticle,
    });
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memperbarui artikel",
      },
      { status: 500 }
    );
  }
}

// DELETE - Hapus artikel berdasarkan ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
        const articleId = id;
    if (articleId.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "ID artikel tidak valid",
        },
        { status: 400 }
      );
    }

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!existingArticle) {
      return NextResponse.json(
        {
          success: false,
          error: "Artikel tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Delete artikel
    await prisma.article.delete({
      where: { id: articleId },
    });

    return NextResponse.json({
      success: true,
      message: "Artikel berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal menghapus artikel",
      },
      { status: 500 }
    );
  }
}

// PATCH - Alias untuk PUT
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
}
