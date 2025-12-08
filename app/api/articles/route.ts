import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Mengambil semua artikel
export async function GET(request: NextRequest) {
  try {
    const articles = await prisma.article.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data untuk format yang diharapkan frontend
    const formattedArticles = articles.map((article) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: formattedArticles,
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil data artikel",
      },
      { status: 500 }
    );
  }
}

// POST - Menambah artikel baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, excerpt, content, image, category, readTime, authorId } = body;

    // Validasi input
    if (!title || !excerpt || !content || !authorId) {
      return NextResponse.json(
        {
          success: false,
          error: "Data tidak lengkap. Title, excerpt, content, dan authorId wajib diisi",
        },
        { status: 400 }
      );
    }

    // Buat artikel baru
    const newArticle = await prisma.article.create({
      data: {
        title,
        excerpt,
        content,
        image: image || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
        category: category || "General",
        readTime: readTime || "5 min read",
        authorId: authorId,
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

    // Format response
    const formattedArticle = {
      id: newArticle.id,
      title: newArticle.title,
      excerpt: newArticle.excerpt,
      content: newArticle.content,
      image: newArticle.image,
      category: newArticle.category,
      readTime: newArticle.readTime,
      author: newArticle.authorId,
      date: newArticle.createdAt.toISOString().split("T")[0],
      createdAt: newArticle.createdAt.toISOString(),
      updatedAt: newArticle.updatedAt.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Artikel berhasil ditambahkan",
        data: formattedArticle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal menambah artikel",
      },
      { status: 500 }
    );
  }
}
