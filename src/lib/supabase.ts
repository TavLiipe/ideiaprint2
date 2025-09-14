import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos TypeScript para o banco de dados
export interface Employee {
  id: string;
  email: string;
  name: string;
  role: 'gerente' | 'atendente' | 'producao';
  created_at: string;
}

export interface Order {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_company?: string;
  service: string;
  description?: string;
  status: 'em_producao' | 'finalizado' | 'cancelado';
  delivery_date: string;
  created_at: string;
  updated_at: string;
  employee_id?: string;
}

export interface OrderFile {
  id: string;
  order_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: 'cliente' | 'interno';
  uploaded_by?: string;
  created_at: string;
}