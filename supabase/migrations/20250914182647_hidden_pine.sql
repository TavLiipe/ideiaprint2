/*
  # Criar funcionário de teste

  1. Novo funcionário
    - Insere um funcionário de teste na tabela employees
    - Email: admin@ideiaprint.com.br
    - Nome: Administrador Teste
    - Role: gerente
    - ID fixo para testes

  2. Segurança
    - Funcionário com permissões de gerente
    - Pode ser usado para testes do sistema
*/

-- Inserir funcionário de teste
INSERT INTO employees (
  id,
  email,
  name,
  role,
  created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@ideiaprint.com.br',
  'Administrador Teste',
  'gerente',
  now()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;