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

const STORAGE_KEY = 'bk_articles';

// Initialize articles in localStorage: no-op (do not seed defaults)
export const initializeArticles = (): void => {
  // Intentionally left blank to avoid seeding hard-coded articles.
};

// Get all articles
export const getArticles = (): Article[] => {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  return stored ? JSON.parse(stored) as Article[] : [];
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
