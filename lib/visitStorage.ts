// Interface untuk data kunjungan
export interface Visit {
  id: number;
  studentName: string;
  class: string;
  visitDate: string;
  visitTime: string;
  reason: string;
  status: "pending" | "approved" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
  email?: string;
  phone?: string;
}

const STORAGE_KEY = "bk_visits";

// Inisialisasi localStorage dengan data default jika belum ada
const initializeStorage = () => {
  const existingData = localStorage.getItem(STORAGE_KEY);
  if (!existingData) {
    const defaultVisits: Visit[] = [
      {
        id: 1,
        studentName: "Ahmad Fauzi",
        class: "XI RPL 1",
        visitDate: "2024-01-20",
        visitTime: "10:00",
        reason: "Konsultasi masalah akademik",
        status: "pending",
        notes: "",
        createdAt: new Date().toISOString(),
        email: "ahmad@email.com",
        phone: "081234567890"
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultVisits));
  }
};

// Get all visits
export const getVisits = (): Visit[] => {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Get visit by ID
export const getVisitById = (id: number): Visit | undefined => {
  const visits = getVisits();
  return visits.find(visit => visit.id === id);
};

// Add new visit
export const addVisit = (visitData: Omit<Visit, "id" | "createdAt">): Visit => {
  const visits = getVisits();
  const newVisit: Visit = {
    ...visitData,
    id: visits.length > 0 ? Math.max(...visits.map(v => v.id)) + 1 : 1,
    createdAt: new Date().toISOString(),
  };
  visits.push(newVisit);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
  return newVisit;
};

// Update visit
export const updateVisit = (id: number, updates: Partial<Visit>): void => {
  const visits = getVisits();
  const index = visits.findIndex(visit => visit.id === id);
  if (index !== -1) {
    visits[index] = { ...visits[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
  }
};

// Update visit status
export const updateVisitStatus = (id: number, status: Visit["status"], notes?: string): void => {
  const visits = getVisits();
  const index = visits.findIndex(visit => visit.id === id);
  if (index !== -1) {
    visits[index] = { 
      ...visits[index], 
      status,
      ...(notes && { notes })
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
  }
};

// Delete visit
export const deleteVisit = (id: number): void => {
  const visits = getVisits();
  const filteredVisits = visits.filter(visit => visit.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredVisits));
};

// Get visits by status
export const getVisitsByStatus = (status: Visit["status"]): Visit[] => {
  const visits = getVisits();
  return visits.filter(visit => visit.status === status);
};

// Get visits by date
export const getVisitsByDate = (date: string): Visit[] => {
  const visits = getVisits();
  return visits.filter(visit => visit.visitDate === date);
};

// Get pending visits count
export const getPendingVisitsCount = (): number => {
  const visits = getVisits();
  return visits.filter(visit => visit.status === "pending").length;
};
