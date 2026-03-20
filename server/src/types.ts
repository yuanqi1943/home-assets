export interface Asset {
  id: string;
  name: string;
  price: number | null;
  category: string | null;
  purchase_date: string | null;
  warranty_period: number | null; // 月数
  description: string | null;
  image_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetInput {
  name: string;
  price?: number;
  category?: string;
  purchase_date?: string;
  warranty_period?: number;
  description?: string;
}