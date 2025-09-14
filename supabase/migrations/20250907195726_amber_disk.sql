/*
  # Recreação completa do banco de dados

  1. Limpeza completa
    - Remove todas as tabelas existentes
    - Remove todas as políticas RLS
    - Remove todos os tipos customizados
    - Remove todas as funções

  2. Novos tipos
    - `employee_role`: gerente, atendente, producao
    - `order_status`: em_producao, finalizado, cancelado
    - `file_category`: cliente, interno

  3. Novas tabelas
    - `employees`: funcionários do sistema
    - `orders`: pedidos dos clientes
    - `order_files`: arquivos dos pedidos

  4. Políticas RLS simples
    - Sem recursão infinita
    - Acesso direto baseado em auth.uid()
    - Políticas separadas e independentes

  5. Funções auxiliares
    - Trigger para updated_at automático
*/

-- =============================================
-- LIMPEZA COMPLETA DO BANCO
-- =============================================

-- Remover todas as políticas RLS
DROP POLICY IF EXISTS "employees_read_all_for_managers" ON employees;
DROP POLICY IF EXISTS "employees_read_own" ON employees;
DROP POLICY IF EXISTS "orders_insert_authenticated" ON orders;
DROP POLICY IF EXISTS "orders_select_all" ON orders;
DROP POLICY IF EXISTS "orders_update_all" ON orders;
DROP POLICY IF EXISTS "order_files_delete_own" ON order_files;
DROP POLICY IF EXISTS "order_files_insert_authenticated" ON order_files;
DROP POLICY IF EXISTS "order_files_select_all" ON order_files;

-- Remover todas as tabelas
DROP TABLE IF EXISTS order_files CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- Remover tipos customizados
DROP TYPE IF EXISTS employee_role CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS file_category CASCADE;

-- Remover funções
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =============================================
-- CRIAÇÃO DOS TIPOS CUSTOMIZADOS
-- =============================================

CREATE TYPE employee_role AS ENUM ('gerente', 'atendente', 'producao');
CREATE TYPE order_status AS ENUM ('em_producao', 'finalizado', 'cancelado');
CREATE TYPE file_category AS ENUM ('cliente', 'interno');

-- =============================================
-- FUNÇÃO PARA UPDATED_AT AUTOMÁTICO
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- TABELA DE FUNCIONÁRIOS
-- =============================================

CREATE TABLE employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    name text NOT NULL,
    role employee_role NOT NULL DEFAULT 'atendente',
    created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Políticas simples sem recursão
CREATE POLICY "employees_select_own" 
    ON employees FOR SELECT 
    TO authenticated 
    USING (id = auth.uid());

CREATE POLICY "employees_select_all_authenticated" 
    ON employees FOR SELECT 
    TO authenticated 
    USING (true);

-- =============================================
-- TABELA DE PEDIDOS
-- =============================================

CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name text NOT NULL,
    client_email text NOT NULL,
    client_phone text NOT NULL,
    client_company text,
    service text NOT NULL,
    description text,
    status order_status NOT NULL DEFAULT 'em_producao',
    delivery_date date NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    employee_id uuid REFERENCES employees(id) ON DELETE SET NULL
);

-- Habilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Políticas simples
CREATE POLICY "orders_all_authenticated" 
    ON orders FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TABELA DE ARQUIVOS DOS PEDIDOS
-- =============================================

CREATE TABLE order_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer NOT NULL DEFAULT 0,
    file_type text NOT NULL,
    category file_category NOT NULL DEFAULT 'cliente',
    uploaded_by uuid REFERENCES employees(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE order_files ENABLE ROW LEVEL SECURITY;

-- Políticas simples
CREATE POLICY "order_files_all_authenticated" 
    ON order_files FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_employee_id ON orders(employee_id);
CREATE INDEX idx_order_files_order_id ON order_files(order_id);
CREATE INDEX idx_order_files_uploaded_by ON order_files(uploaded_by);

-- =============================================
-- DADOS INICIAIS (OPCIONAL)
-- =============================================

-- Inserir funcionário admin padrão (opcional)
-- INSERT INTO employees (id, email, name, role) 
-- VALUES (
--     '00000000-0000-0000-0000-000000000000',
--     'admin@ideiaprint.com.br',
--     'Administrador',
--     'gerente'
-- );

-- =============================================
-- CONFIGURAÇÕES DE STORAGE (OPCIONAL)
-- =============================================

-- Criar bucket para arquivos dos pedidos
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('order-files', 'order-files', false);

-- Política para o bucket
-- CREATE POLICY "order_files_bucket_policy" 
--     ON storage.objects FOR ALL 
--     TO authenticated 
--     USING (bucket_id = 'order-files')
--     WITH CHECK (bucket_id = 'order-files');