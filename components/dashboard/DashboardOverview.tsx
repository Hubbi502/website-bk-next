"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Clock,
  Calendar,
  Users,
  BookOpen,
  TrendingUp,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Article } from "@/lib/articleStorage";

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

interface DashboardOverviewProps {
  adminData: any;
  articles: Article[];
  visits: Visit[];
  setActiveTab: (tab: "overview" | "articles" | "visits") => void;
  handleViewDetail: (visit: Visit) => void;
  getStatusBadge: (status: Visit["status"]) => React.JSX.Element;
}

export function DashboardOverview({
  adminData,
  articles,
  visits,
  setActiveTab,
  handleViewDetail,
  getStatusBadge
}: DashboardOverviewProps) {
  const todayVisits = visits.filter(v => {
    const today = new Date().toISOString().split('T')[0];
    return v.visitDate === today && (v.status === "approved" || v.status === "pending");
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
        <CardHeader>
          <CardTitle className="text-2xl">Selamat Datang, {adminData.name}! 👋</CardTitle>
          <CardDescription className="text-blue-100">
            Ini adalah dashboard untuk mengelola artikel dan kunjungan murid
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Artikel
              </CardTitle>
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{articles.length}</div>
            <p className="text-xs text-slate-500 mt-1">Artikel dipublikasikan</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Pending
              </CardTitle>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {visits.filter(v => v.status === "pending").length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Menunggu persetujuan</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Kunjungan Hari Ini
              </CardTitle>
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {todayVisits.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Jadwal hari ini</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Murid
              </CardTitle>
              <Users className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{visits.length}</div>
            <p className="text-xs text-slate-500 mt-1">Murid terdaftar</p>
          </CardContent>
        </Card>
      </div>

      {/* Kunjungan Hari Ini Section */}
      {todayVisits.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Calendar className="h-5 w-5" />
              Kunjungan Hari Ini
            </CardTitle>
            <CardDescription className="text-green-700">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayVisits.map((visit) => (
                <div key={visit.id} className="bg-white p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                          {visit.studentName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{visit.studentName}</p>
                        <p className="text-sm text-slate-600">{visit.class}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-700">{visit.visitTime} WIB</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-1">{visit.reason}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(visit.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveTab("visits");
                          setTimeout(() => handleViewDetail(visit), 100);
                        }}
                        className="text-xs"
                      >
                        Lihat Detail
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Artikel Terbaru
            </CardTitle>
            <CardDescription>5 artikel terakhir yang dipublikasikan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {articles.slice(0, 5).map((article) => (
                <div key={article.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{article.title}</p>
                    <p className="text-xs text-slate-500">{article.date}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {article.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Visits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Kunjungan Terbaru
            </CardTitle>
            <CardDescription>Aktivitas kunjungan terkini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visits.slice(0, 5).map((visit) => (
                <div key={visit.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {visit.studentName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{visit.studentName}</p>
                    <p className="text-xs text-slate-500">{visit.class} • {visit.visitDate}</p>
                    <div className="mt-1">
                      {getStatusBadge(visit.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
