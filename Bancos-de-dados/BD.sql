CREATE DATABASE nfc_pedidos;
USE nfc_pedidos;

CREATE TABLE Categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE Produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    categoria_id INT,
    imagem_url VARCHAR(255),
    FOREIGN KEY (categoria_id) REFERENCES Categorias(id) ON DELETE SET NULL
);

CREATE TABLE Mesas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'livre'
);

CREATE TABLE Pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mesa_id INT,
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'aberto',
    FOREIGN KEY (mesa_id) REFERENCES Mesas(id) ON DELETE SET NULL
);

CREATE TABLE Itens_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT,
    pedido_id INT,
    quantidade INT NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (produto_id) REFERENCES Produtos(id) ON DELETE SET NULL,
    FOREIGN KEY (pedido_id) REFERENCES Pedidos(id) ON DELETE CASCADE
);

INSERT INTO Categorias (nome) VALUES
('Entradas'),
('Hambúrgueres Tradicionais'),
('Hambúrgueres Especiais'),
('Vegetariano'),
('Bebidas'),
('Pizzas'),
('Sobremesas');

INSERT INTO Mesas (status) VALUES
('livre'),
('livre'),
('livre'),
('livre'),
('livre'),
('livre'),
('livre'),
('livre'),
('livre'),
('livre');

INSERT INTO Produtos (nome, preco, categoria_id, imagem_url) VALUES

-- =========================
-- ENTRADAS (categoria_id = 1)
-- =========================
('Cebola Empanada', 19.90, 1, 'entradas/cebola-empanada.png'),
('Nuggets de Frango', 22.00, 1, 'entradas/nuggets-frango.png'),
('Maravilhas de Queijo', 25.00, 1, 'entradas/maravilhas-queijo.png'),
('Batata Frita c/ Cheddar e Bacon', 36.00, 1, 'entradas/batata-cheddar-bacon.png'),

-- =========================
-- HAMBÚRGUERES TRADICIONAIS (categoria_id = 2)
-- =========================
('Big Black', 28.00, 2, 'hamburgueres-tradicionais/big-black.png'),
('Old', 29.90, 2, 'hamburgueres-tradicionais/old.png'),
('Flip', 32.90, 2, 'hamburgueres-tradicionais/flip.png'),
('Hambúrguer de Frango', 27.90, 2, 'hamburgueres-tradicionais/hamburguer-frango.png'),
('Yolk', 32.00, 2, 'hamburgueres-tradicionais/yolk.png'),
('Gorgonzola', 36.00, 2, 'hamburgueres-tradicionais/gorgonzola.png'),

-- =========================
-- HAMBÚRGUERES ESPECIAIS (categoria_id = 3)
-- =========================
('Nordestino', 32.90, 3, 'hamburgueres-especiais/nordestino.png'),
('Costela', 33.90, 3, 'hamburgueres-especiais/costela.png'),
('Duplo Cheddar', 42.00, 3, 'hamburgueres-especiais/duplo-cheddar.png'),
('Rei Brie', 46.00, 3, 'hamburgueres-especiais/rei-brie.png'),

-- =========================
-- VEGETARIANO (categoria_id = 4)
-- =========================
('Hambúrguer Vegetariano', 36.00, 4, 'vegetariano/hamburguer-vegetariano.png'),

-- =========================
-- BEBIDAS (categoria_id = 5)
-- =========================
('Pink Lemonade', 12.00, 5, 'bebidas/pink-lemonade.png'),
('Soda Italiana BlueBerry', 12.00, 5, 'bebidas/soda-blueberry.png'),
('Soda Italiana Morango', 12.00, 5, 'bebidas/soda-morango.png'),
('Soda Italiana Maracujá', 12.00, 5, 'bebidas/soda-maracuja.png'),
('Coca-Cola 350ml Zero', 8.00, 5, 'bebidas/coca-zero-350.png'),
('Coca-Cola 350ml', 8.00, 5, 'bebidas/coca-350.png'),
('Guaraná Antarctica 350ml', 8.00, 5, 'bebidas/guarana-350.png'),
('Guaraná Antarctica 350ml Zero', 8.00, 5, 'bebidas/guarana-zero-350.png'),
('H2O', 8.00, 5, 'bebidas/h2o.png'),

-- =========================
-- SOBREMESAS (categoria_id = 7)
-- =========================
('Brownie', 12.00, 7, 'sobremesas/brownie.png'),
('Cookie Tradicional', 14.00, 7, 'sobremesas/cookie-tradicional.png'),
('Cookie Nutella', 16.00, 7, 'sobremesas/cookie-nutella.png');