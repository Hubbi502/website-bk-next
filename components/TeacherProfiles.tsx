"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  BookOpen,
  Award,
  Link as LinkIcon,
} from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  positionTitle: string | null;
  profileImageUrl: string | null;
  shortBio: string | null;
  bio: string | null;
  education: string | null;
  expertise: string | null;
  phone: string | null;
  emailPublic: string | null;
  officeLocation: string | null;
  officeHours: string | null;
  socialLinks: string | null;
}

export function TeacherProfiles({ teachers }: { teachers: Teacher[] }) {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  if (!teachers || teachers.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Profil Guru Bimbingan dan Konseling
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <Card
              key={teacher.id}
              className="cursor-pointer hover:shadow-lg transition-all rounded-xl border-slate-200 hover:border-primary/30"
              onClick={() => setSelectedTeacher(teacher)}
            >
              <CardContent className="p-6 text-center flex flex-col items-center gap-4">
                <Avatar className="w-24 h-24 border-4 border-slate-50">
                  <AvatarImage
                    src={teacher.profileImageUrl || ""}
                    alt={teacher.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {teacher.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">
                    {teacher.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {teacher.positionTitle || "Guru Bimbingan Konseling"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog
        open={!!selectedTeacher}
        onOpenChange={(open) => !open && setSelectedTeacher(null)}
      >
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white max-h-[90vh] flex flex-col">
          {selectedTeacher && (
            <>
              <DialogTitle className="sr-only">
                Profil {selectedTeacher.name}
              </DialogTitle>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 flex-shrink-0" />
              <div className="px-6 pb-6 overflow-y-auto flex-1 -mt-16 flex flex-col items-center">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl mb-4 bg-white">
                  <AvatarImage
                    src={selectedTeacher.profileImageUrl || ""}
                    alt={selectedTeacher.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl bg-slate-100 text-slate-400">
                    {selectedTeacher.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <h2 className="text-2xl font-bold text-slate-900 text-center">
                  {selectedTeacher.name}
                </h2>
                <p className="text-primary font-medium mb-2 text-center">
                  {selectedTeacher.positionTitle || "Guru Bimbingan Konseling"}
                </p>

                {selectedTeacher.shortBio && (
                  <p className="text-slate-500 text-center text-sm mb-6 max-w-[80%] italic">
                    "{selectedTeacher.shortBio}"
                  </p>
                )}

                <div className="w-full space-y-6 text-left">
                  {selectedTeacher.bio && (
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-2 border-b pb-1">
                        Tentang
                      </h4>
                      <p className="text-slate-600 text-sm whitespace-pre-wrap">
                        {selectedTeacher.bio}
                      </p>
                    </div>
                  )}

                  {(selectedTeacher.education || selectedTeacher.expertise) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedTeacher.education && (
                        <div className="bg-slate-50 p-3 rounded-lg flex gap-3">
                          <BookOpen className="w-5 h-5 text-blue-500 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 font-medium">
                              Pendidikan
                            </p>
                            <p className="text-sm text-slate-800">
                              {selectedTeacher.education}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedTeacher.expertise && (
                        <div className="bg-slate-50 p-3 rounded-lg flex gap-3">
                          <Award className="w-5 h-5 text-indigo-500 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 font-medium">
                              Keahlian
                            </p>
                            <p className="text-sm text-slate-800">
                              {selectedTeacher.expertise}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(selectedTeacher.emailPublic ||
                    selectedTeacher.phone ||
                    selectedTeacher.officeLocation ||
                    selectedTeacher.officeHours) && (
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-3 border-b pb-1">
                        Kontak & Layanan
                      </h4>
                      <div className="space-y-3">
                        {selectedTeacher.emailPublic && (
                          <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-slate-600">
                              {selectedTeacher.emailPublic}
                            </span>
                          </div>
                        )}
                        {selectedTeacher.phone && (
                          <div className="flex items-center gap-3 text-sm">
                            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-slate-600">
                              {selectedTeacher.phone}
                            </span>
                          </div>
                        )}
                        {selectedTeacher.officeLocation && (
                          <div className="flex items-center gap-3 text-sm">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-slate-600">
                              {selectedTeacher.officeLocation}
                            </span>
                          </div>
                        )}
                        {selectedTeacher.officeHours && (
                          <div className="flex items-center gap-3 text-sm">
                            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-slate-600">
                              {selectedTeacher.officeHours}
                            </span>
                          </div>
                        )}
                        {selectedTeacher.socialLinks && (
                          <div className="flex items-center gap-3 text-sm">
                            <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
                            <a
                              href={selectedTeacher.socialLinks}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              Tautan Sosial
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
