"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Clock, CheckCircle, XCircle } from "lucide-react";

interface Visit {
  id: string;
  studentName: string;
  class: string;
  email?: string;
  phone?: string;
  visitDate: string;
  visitTime: string;
  reason: string;
  status: "pending" | "approved" | "completed" | "cancelled";
  notes?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt?: string;
}
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { ArticleManagement } from "@/components/dashboard/ArticleManagement";
import { VisitManagement } from "@/components/dashboard/VisitManagement";

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
  const [activeTab, setActiveTab] = useState<"overview" | "articles" | "visits">("overview");
  const [articles, setArticles] = useState<Article[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminData");
    if (!storedAdmin) {
      toast({
        title: "Akses Ditolak",
        description: "Silakan login terlebih dahulu",
        variant: "destructive",
      });
      router.push("/login");
    } else {
      setAdminData(JSON.parse(storedAdmin));
      loadArticles();
      loadVisits();
    }
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

  const loadVisits = async () => {
    try {
      const response = await fetch("/api/visits");
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
      approved: { variant: "default", icon: CheckCircle, text: "Disetujui" },
      completed: { variant: "default", icon: CheckCircle, text: "Selesai" },
      cancelled: { variant: "destructive", icon: XCircle, text: "Dibatalkan" }
    };

    const config = variants[status];
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

  if (!adminData) {
    return null;
  }

  const menuItems = [
    { id: "overview", label: "Overview" },
    { id: "articles", label: "Kelola Artikel" },
    { id: "visits", label: "Kunjungan Murid" },
  ];

  const currentPageTitle = menuItems.find(item => item.id === activeTab)?.label || "Dashboard";

  return (
    <DashboardLayout
      adminData={adminData}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      articlesCount={articles.length}
      pendingVisitsCount={visits.filter(v => v.status === "pending").length}
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
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
