import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '3001';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export interface Asset {
  id: string;
  name: string;
  price: number | null;
  category: string | null;
  purchase_date: string | null;
  warranty_period: number | null;
  description: string | null;
  image_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetData {
  name: string;
  price?: number;
  category?: string;
  purchase_date?: string;
  warranty_period?: number;
  description?: string;
  image?: File;
}

export const assetApi = {
  getAll: (params?: { search?: string; category?: string; sortBy?: string; order?: string }) =>
    api.get('/assets', { params }).then(res => res.data),
  
  getById: (id: string) => api.get(`/assets/${id}`).then(res => res.data),
  
  create: (data: CreateAssetData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.price) formData.append('price', data.price.toString());
    if (data.category) formData.append('category', data.category);
    if (data.purchase_date) formData.append('purchase_date', data.purchase_date);
    if (data.warranty_period) formData.append('warranty_period', data.warranty_period.toString());
    if (data.description) formData.append('description', data.description);
    if (data.image) formData.append('image', data.image);
    return api.post('/assets', formData).then(res => res.data);
  },
  
  update: (id: string, data: Partial<CreateAssetData>) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.price !== undefined) formData.append('price', data.price.toString());
    if (data.category !== undefined) formData.append('category', data.category);
    if (data.purchase_date !== undefined) formData.append('purchase_date', data.purchase_date);
    if (data.warranty_period !== undefined) formData.append('warranty_period', data.warranty_period.toString());
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.image) formData.append('image', data.image);
    return api.put(`/assets/${id}`, formData).then(res => res.data);
  },
  
  delete: (id: string) => api.delete(`/assets/${id}`),
  
  getCategories: () => api.get('/categories').then(res => res.data),
  
  getStats: () => api.get('/stats').then(res => res.data),
};

export const getImageUrl = (path: string | null) => {
  if (!path) return null;
  return `${API_BASE}${path}`;
};