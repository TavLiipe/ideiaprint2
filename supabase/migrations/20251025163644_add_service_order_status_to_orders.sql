/*
  # Adicionar status de ordem de serviço aos pedidos

  1. Alterações
    - Adiciona coluna `service_order_status` à tabela `orders`
      - Valores: 'pendente' (padrão) ou 'registrada'
      - Indica se a ordem de serviço foi registrada no sistema externo

  2. Notas
    - Campo com valor padrão 'pendente' para novos pedidos
    - Permite rastrear se o pedido teve OS registrada
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'service_order_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN service_order_status text DEFAULT 'pendente' NOT NULL;
    ALTER TABLE orders ADD CONSTRAINT service_order_status_check 
      CHECK (service_order_status IN ('pendente', 'registrada'));
  END IF;
END $$;