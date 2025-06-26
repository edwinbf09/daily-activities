-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar usuarios iniciales (tú y tu pareja)
INSERT INTO users (email, password, name) VALUES 
('tu@email.com', '123456', 'Tu Nombre'),
('pareja@email.com', '123456', 'Nombre Pareja')
ON CONFLICT (email) DO NOTHING;

-- Las actividades siguen siendo compartidas (sin user_id)
-- Todos los usuarios autenticados pueden ver todas las actividades
