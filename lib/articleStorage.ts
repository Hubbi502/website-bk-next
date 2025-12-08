// Central storage management for articles
export interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  category?: string;
  readTime?: string;
}

// Default articles
const defaultArticles: Article[] = [
  {
    id: 1,
    title: "Managing Stress and Anxiety in School",
    excerpt: "Learn practical techniques to manage stress and anxiety during your academic journey.",
    content: "Stress adalah bagian normal dari kehidupan pelajar, tetapi jika tidak dikelola dengan baik dapat mempengaruhi kesehatan mental dan performa akademik. Berikut beberapa teknik yang dapat membantu: 1) Praktikkan pernapasan dalam dan meditasi, 2) Atur jadwal belajar yang realistis, 3) Jangan ragu untuk meminta bantuan, 4) Jaga pola tidur yang teratur, 5) Lakukan aktivitas fisik secara rutin.",
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800",
    date: "2025-01-15",
    author: "Guru BK",
    category: "Mental Health",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Exploring Career Paths: Finding Your Passion",
    excerpt: "Discover how to identify your interests and align them with potential career opportunities.",
    content: "Memilih jalur karir yang tepat dimulai dengan memahami diri sendiri. Lakukan self-assessment untuk mengidentifikasi minat, bakat, dan nilai-nilai yang penting bagi Anda. Eksplorasi berbagai bidang melalui magang, volunteer, atau berbicara dengan profesional. Ingat, tidak ada keputusan yang final - karir adalah perjalanan yang terus berkembang.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
    date: "2025-01-12",
    author: "Guru BK",
    category: "Career Guidance",
    readTime: "8 min read"
  },
  {
    id: 3,
    title: "Effective Study Techniques for Success",
    excerpt: "Master proven study methods that can enhance your learning and academic performance.",
    content: "Teknik belajar yang efektif dapat meningkatkan pemahaman dan retensi materi. Beberapa metode yang terbukti efektif: 1) Pomodoro Technique untuk manajemen waktu, 2) Active Recall untuk memperkuat memori, 3) Spaced Repetition untuk pembelajaran jangka panjang, 4) Mind Mapping untuk memahami konsep kompleks, 5) Belajar berkelompok untuk diskusi dan berbagi perspektif.",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800",
    date: "2025-01-10",
    author: "Guru BK",
    category: "Academic",
    readTime: "6 min read"
  },
  {
    id: 4,
    title: "Building Healthy Relationships",
    excerpt: "Understanding the importance of healthy relationships and communication skills.",
    content: "Hubungan yang sehat dibangun atas dasar komunikasi yang jujur, saling menghormati, dan empati. Pelajari cara mendengarkan aktif, mengekspresikan perasaan dengan asertif, dan menyelesaikan konflik secara konstruktif. Ingat bahwa batasan yang sehat adalah penting dalam setiap hubungan.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
    date: "2025-01-08",
    author: "Guru BK",
    category: "Personal Growth",
    readTime: "7 min read"
  },
  {
    id: 5,
    title: "Time Management Skills for Students",
    excerpt: "Learn how to balance academics, activities, and personal life effectively.",
    content: "Manajemen waktu yang baik adalah kunci sukses akademik dan kehidupan yang seimbang. Mulai dengan membuat prioritas, gunakan planner atau aplikasi untuk mengatur jadwal, hindari prokrastinasi dengan memecah tugas besar menjadi bagian kecil, dan jangan lupa untuk mengalokasikan waktu untuk istirahat dan hobi.",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
    date: "2025-01-05",
    author: "Guru BK",
    category: "Academic",
    readTime: "5 min read"
  },
  {
    id: 6,
    title: "Preparing for College and University",
    excerpt: "Essential tips and guidance for transitioning to higher education successfully.",
    content: "Persiapan kuliah melibatkan lebih dari sekadar nilai akademik. Riset universitas dan program studi yang sesuai dengan minat Anda, persiapkan dokumen aplikasi dengan baik, kembangkan soft skills seperti komunikasi dan leadership, dan mulai membangun kemandirian dalam mengatur keuangan dan kehidupan sehari-hari.",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
    date: "2025-01-03",
    author: "Guru BK",
    category: "Career Guidance",
    readTime: "10 min read"
  }
];

const STORAGE_KEY = 'bk_articles';

// Initialize articles in localStorage if not exists
export const initializeArticles = (): void => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultArticles));
  }
};

// Get all articles
export const getArticles = (): Article[] => {
  initializeArticles();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : defaultArticles;
};

// Get article by ID
export const getArticleById = (id: number): Article | undefined => {
  const articles = getArticles();
  return articles.find(article => article.id === id);
};

// Add new article
export const addArticle = (article: Omit<Article, 'id'>): Article => {
  const articles = getArticles();
  const newId = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
  const newArticle: Article = {
    ...article,
    id: newId
  };
  const updatedArticles = [newArticle, ...articles];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedArticles));
  return newArticle;
};

// Update article
export const updateArticle = (id: number, updates: Partial<Article>): Article | null => {
  const articles = getArticles();
  const index = articles.findIndex(article => article.id === id);
  
  if (index === -1) return null;
  
  articles[index] = { ...articles[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  return articles[index];
};

// Delete article
export const deleteArticle = (id: number): boolean => {
  const articles = getArticles();
  const filtered = articles.filter(article => article.id !== id);
  
  if (filtered.length === articles.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

// Get articles by category
export const getArticlesByCategory = (category: string): Article[] => {
  const articles = getArticles();
  if (category === 'all') return articles;
  return articles.filter(article => article.category === category);
};

// Search articles
export const searchArticles = (query: string): Article[] => {
  const articles = getArticles();
  const lowerQuery = query.toLowerCase();
  return articles.filter(article =>
    article.title.toLowerCase().includes(lowerQuery) ||
    article.excerpt.toLowerCase().includes(lowerQuery) ||
    article.content.toLowerCase().includes(lowerQuery)
  );
};
