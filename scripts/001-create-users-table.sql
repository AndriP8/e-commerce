-- Active: 1732602987674@@127.0.0.1@5432@ecommerce
CREATE TYPE user_enum AS  ENUM('buyer', 'seller', 'admin');

CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    user_type user_enum NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_active ON users(is_active);

INSERT INTO USERS (id, email, password_hash, first_name, last_name, phone, created_at, updated_at, is_active, user_type) VALUES
(1, 'john.doe@email.com', '$2a$12$hashed_password1', 'John', 'Doe', '+1234567890', '2024-01-15 10:30:00', '2024-01-15 10:30:00', true, 'buyer'),
(2, 'jane.smith@email.com', '$2a$12$hashed_password2', 'Jane', 'Smith', '+1234567891', '2024-01-16 14:20:00', '2024-01-16 14:20:00', true, 'seller'),
(3, 'admin@ecommerce.com', '$2a$12$hashed_password3', 'Admin', 'User', '+1234567892', '2024-01-10 09:00:00', '2024-01-10 09:00:00', true, 'admin');
