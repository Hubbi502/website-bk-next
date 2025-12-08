"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import StudentAuthModal from "./StudentAuthModal";
import { Trash2, LogOut } from "lucide-react";

interface Student {
  id: string;
  name: string;
  class: string;
}

interface Comment {
  id: string;
  name: string | null;
  email: string | null;
  content: string;
  studentId: string | null;
  student: Student | null;
  createdAt: string;
  updatedAt: string;
}

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    content: "",
  });
  const { toast } = useToast();

  // Check if student is logged in
  useEffect(() => {
    const savedStudent = localStorage.getItem("studentData");
    if (savedStudent) {
      setStudentData(JSON.parse(savedStudent));
    }
  }, []);

  // Load comments
  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${articleId}/comments`);
      if (!response.ok) throw new Error("Failed to load comments");
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast({
        title: "Error",
        description: "Gagal memuat komentar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check validation based on login status
    if (!studentData && !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Nama harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!formData.content.trim()) {
      toast({
        title: "Error",
        description: "Komentar harus diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = studentData
        ? { content: formData.content, studentId: studentData.id }
        : formData;

      const response = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to submit comment");

      toast({
        title: "Berhasil",
        description: "Komentar Anda telah ditambahkan",
      });

      // Reset form
      setFormData({ name: "", email: "", content: "" });

      // Reload comments
      loadComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Gagal mengirim komentar",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!studentData) return;

    if (!confirm("Apakah Anda yakin ingin menghapus komentar ini?")) return;

    try {
      setDeleting(commentId);
      const response = await fetch(
        `/api/articles/${articleId}/comments/${commentId}?studentId=${studentData.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete comment");
      }

      toast({
        title: "Berhasil",
        description: "Komentar berhasil dihapus",
      });

      loadComments();
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus komentar",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("studentData");
    setStudentData(null);
    setFormData({ name: "", email: "", content: "" });
    toast({
      title: "Berhasil",
      description: "Anda telah logout",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mt-12 space-y-8">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            Komentar ({comments.length})
          </h2>
          {studentData ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {studentData.name} ({studentData.class})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAuthModal(true)}
            >
              Login untuk Komentar
            </Button>
          )}
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          {!studentData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nama *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama Anda"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email (opsional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="content">Komentar *</Label>
            <Textarea
              id="content"
              placeholder="Tulis komentar Anda..."
              rows={4}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Mengirim..." : "Kirim Komentar"}
          </Button>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8 text-slate-500">
              Memuat komentar...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Belum ada komentar. Jadilah yang pertama berkomentar!
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {comment.student
                        ? `${comment.student.name} (${comment.student.class})`
                        : comment.name}
                    </h4>
                    {!comment.student && comment.email && (
                      <p className="text-sm text-slate-500">{comment.email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">
                      {formatDate(comment.createdAt)}
                    </span>
                    {studentData && comment.studentId === studentData.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deleting === comment.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <StudentAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(data) => setStudentData(data)}
      />
    </div>
  );
}
