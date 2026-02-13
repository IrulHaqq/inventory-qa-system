import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export type Product = {
  id: string;
  name: string;
  unit: string;
};

export type InventoryTransaction = {
  id: string;
  product_id: string;
  quantity: number;
  date: string;
  stock_after: number;
  created_at: string;
};

export type TransactionWithProduct = InventoryTransaction & {
  products: Product;
};