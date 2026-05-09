"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, Timer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Visit {
  id: string;
  studentName: string;
  class: string;
  email?: string;
  phone?: string;
  visitDate: string;
  visitTime: string;
  reason: string;
  status: "pending" | "approved" | "forwarded" | "completed" | "cancelled" | "awaiting_student" | "pending_delegation" | "pending_time_negotiation" | "waiting";
  notes?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt?: string;
}
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { ArticleManagement } from "@/components/dashboard/ArticleManagement";
import { VisitManagement } from "@/components/dashboard/VisitManagement";
import { AdminManagement } from "@/components/dashboard/AdminManagement";
import { StudentManagement } from "@/components/dashboard/StudentManagement";
import { isSuperAdmin } from "@/lib/permissions";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: string;
  author: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

const Dashboard = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [adminData, setAdminData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "articles" | "visits" | "admins" | "students"
  >("overview");
  const [articles, setArticles] = useState<Article[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initDashboard = async () => {
      const storedAdmin = localStorage.getItem("adminData");
      if (!storedAdmin) {
        // Coba ambil data dari JWT cookie via API
        try {
          const res = await fetch("/api/auth/admin/me");
          if (!res.ok) {
            toast({
              title: "Akses Ditolak",
              description: "Silakan login terlebih dahulu",
              variant: "destructive",
            });
            router.push("/login");
            return;
          }
          const meData = await res.json();
          const parsedAdmin = meData.admin;
          // Simpan kembali ke localStorage
          localStorage.setItem("adminData", JSON.stringify(parsedAdmin));
          setAdminData(parsedAdmin);
          await Promise.all([loadArticles(), loadVisits(parsedAdmin)]);
        } catch {
          toast({
            title: "Akses Ditolak",
            description: "Silakan login terlebih dahulu",
            variant: "destructive",
          });
          router.push("/login");
          return;
        }
      } else {
        const parsedAdmin = JSON.parse(storedAdmin);
        setAdminData(parsedAdmin);

        // Load data in parallel
        await Promise.all([loadArticles(), loadVisits(parsedAdmin)]);
      }

      setIsLoading(false);
    };

    initDashboard();
  }, [router, toast]);

  const loadArticles = async () => {
    try {
      const response = await fetch("/api/articles");
      const data = await response.json();

      if (data.success) {
        setArticles(data.data);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat artikel",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading articles:", error);
      toast({
        title: "Error",
        description: "Gagal memuat artikel",
        variant: "destructive",
      });
    }
  };

  const loadVisits = async (admin?: { id: string; role: string }) => {
    try {
      // Gunakan parameter admin jika ada, fallback ke state adminData
      const currentAdmin = admin || adminData;
      // Kirim teacherId dan role untuk filter privasi
      const params = new URLSearchParams();
      if (currentAdmin?.id) params.append("teacherId", currentAdmin.id);
      if (currentAdmin?.role) params.append("role", currentAdmin.role);
      const response = await fetch(`/api/visits?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setVisits(data.data);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data kunjungan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading visits:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data kunjungan",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Visit["status"]) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: Clock, text: "Pending" },
      waiting: { variant: "secondary", icon: Timer, text: "Menunggu (Hold)" },
      awaiting_student: { variant: "secondary", icon: AlertTriangle, text: "Menunggu Siswa" },
      pending_delegation: { variant: "secondary", icon: RefreshCw, text: "Menunggu Guru" },
      pending_time_negotiation: { variant: "secondary", icon: Clock, text: "Negosiasi Waktu" },
      approved: { variant: "default", icon: CheckCircle, text: "Disetujui" },
      forwarded: { variant: "default", icon: Clock, text: "Diserahkan" },
      completed: { variant: "default", icon: CheckCircle, text: "Selesai" },
      cancelled: { variant: "destructive", icon: XCircle, text: "Dibatalkan" },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const handleViewDetail = (visit: Visit) => {
    // Implementasi akan ditangani oleh VisitManagement component
  };

  // Skeleton Screen Components
  const DashboardSkeleton = () => (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Skeleton */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <Skeleton className="w-10 h-10 rounded-lg bg-slate-800" />
          <div className="flex-1">
            <Skeleton className="h-5 w-24 bg-slate-800 mb-2" />
            <Skeleton className="h-3 w-20 bg-slate-800" />
          </div>
        </div>

        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full bg-slate-800" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 bg-slate-800 mb-2" />
              <Skeleton className="h-3 w-20 bg-slate-800" />
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg bg-slate-800" />
          ))}
        </nav>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </header>

        <div className="p-8 space-y-6">
          {activeTab === "overview" && <OverviewSkeleton />}
          {activeTab === "articles" && <ArticlesSkeleton />}
          {activeTab === "visits" && <VisitsSkeleton />}
          {activeTab === "admins" && <AdminsSkeleton />}
          {activeTab === "students" && <AdminsSkeleton />}
        </div>
      </main>
    </div>
  );

  const OverviewSkeleton = () => (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded" />
              </div>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Recent Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-20 h-20 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ArticlesSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <Skeleton className="h-48 w-full rounded-t-lg" />
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const VisitsSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <th key={i} className="p-4">
                      <Skeleton className="h-4 w-24" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b">
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <td key={j} className="p-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const AdminsSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (isLoading || !adminData) {
    return <DashboardSkeleton />;
  }

  const menuItems = [
    { id: "overview", label: "Overview" },
    { id: "articles", label: "Kelola Artikel" },
    { id: "visits", label: "Kunjungan Murid" },
    { id: "students", label: "Kelola Siswa" },
  ];

  const currentPageTitle =
    menuItems.find((item) => item.id === activeTab)?.label || "Dashboard";

  return (
    <DashboardLayout
      adminData={adminData}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      articlesCount={articles.length}
      pendingVisitsCount={
        visits.filter((v) => v.status === "pending" || v.status === "forwarded" || v.status === "awaiting_student" || v.status === "pending_delegation" || v.status === "pending_time_negotiation" || v.status === "waiting")
          .length
      }
      currentPageTitle={currentPageTitle}
    >
      {activeTab === "overview" && (
        <DashboardOverview
          adminData={adminData}
          articles={articles}
          visits={visits}
          setActiveTab={setActiveTab}
          handleViewDetail={handleViewDetail}
          getStatusBadge={getStatusBadge}
        />
      )}

      {activeTab === "articles" && (
        <ArticleManagement
          articles={articles}
          loadArticles={loadArticles}
          adminData={adminData}
        />
      )}

      {activeTab === "visits" && (
        <VisitManagement
          visits={visits}
          loadVisits={loadVisits}
          getStatusBadge={getStatusBadge}
          adminData={adminData}
        />
      )}

      {activeTab === "admins" && isSuperAdmin(adminData) && (
        <AdminManagement 
          currentAdminId={adminData.id} 
          visits={visits}
        />
      )}

      {activeTab === "students" && (
        <StudentManagement adminData={adminData} />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
