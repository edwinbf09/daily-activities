-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar usuarios de prueba
INSERT INTO users (email, password, name) VALUES 
('juan@email.com', '123456', 'Juan'),
('maria@email.com', '123456', 'María')
ON CONFLICT (email) DO NOTHING;

-- Agregar columna user_id a activities si no existe
ALTER TABLE activities ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
