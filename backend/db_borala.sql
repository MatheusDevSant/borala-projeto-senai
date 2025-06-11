-- Limpeza e Criação do Banco de Dados
DROP DATABASE IF EXISTS db_borala;
CREATE DATABASE db_borala
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE db_borala;

-- 1. Criação das Tabelas

CREATE TABLE uf_estados (
    id_estado INT PRIMARY KEY,
    UF_estado CHAR(2) NOT NULL UNIQUE,
    Estado VARCHAR(50) NOT NULL UNIQUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE cidades (
    id_cidade INT PRIMARY KEY,
    id_estado INT NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_estado) REFERENCES uf_estados(id_estado)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE categorias (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    categoria VARCHAR(50) NOT NULL UNIQUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `status` (
    id_status INT PRIMARY KEY AUTO_INCREMENT,
    status VARCHAR(50) NOT NULL UNIQUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE forma_pagamento (
    id_forma_pagamento INT PRIMARY KEY AUTO_INCREMENT,
    forma VARCHAR(50) NOT NULL UNIQUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE local_evento (
    id_local_evento INT PRIMARY KEY AUTO_INCREMENT,
    local_evento VARCHAR(150) NOT NULL UNIQUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    CPF VARCHAR(20) NOT NULL UNIQUE,
    email_outros VARCHAR(100) UNIQUE, -- Não é NOT NULL para permitir NULL
    email_google VARCHAR(100) UNIQUE, -- Não é NOT NULL para permitir NULL
    telefone VARCHAR(30),
    endereco VARCHAR(200),
    id_cidade INT,
    id_estado INT,
    foto_usuario VARCHAR(200),
    senha VARCHAR(255), -- Aumentado para suportar senhas hasheadas
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Adicionado para controle
    FOREIGN KEY (id_cidade) REFERENCES cidades(id_cidade),
    FOREIGN KEY (id_estado) REFERENCES uf_estados(id_estado)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE eventos (
    id_evento INT PRIMARY KEY AUTO_INCREMENT,
    nome_evento VARCHAR(200) NOT NULL,
    id_categoria INT NOT NULL,
    id_local_evento INT NOT NULL,
    data_evento DATE NOT NULL,
    id_cidade INT NOT NULL,
    id_estado INT NOT NULL,
    preco DECIMAL(10,2) DEFAULT 100.00,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Adicionado para controle
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    FOREIGN KEY (id_local_evento) REFERENCES local_evento(id_local_evento),
    FOREIGN KEY (id_cidade) REFERENCES cidades(id_cidade),
    FOREIGN KEY (id_estado) REFERENCES uf_estados(id_estado)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE tipos_ingresso (
    id_tipo_ingresso INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Adicionado para controle
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE vendas (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_status INT NOT NULL,
    id_usuario INT NOT NULL,
    id_evento INT NOT NULL,
    data_reserva_bilhete DATETIME NOT NULL, -- Alterado para DATETIME
    data_compra_bilhete DATETIME,           -- Alterado para DATETIME
    id_forma_pagamento INT,
    tipo_ingresso VARCHAR(10),
    preco_pago DECIMAL(10,2),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- ADICIONADO PARA CORRIGIR O ERRO
    FOREIGN KEY (id_status) REFERENCES `status`(id_status),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento),
    FOREIGN KEY (id_forma_pagamento) REFERENCES forma_pagamento(id_forma_pagamento)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE itens_venda (
    id_item_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_venda INT NOT NULL,
    id_tipo_ingresso INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    quantidade INT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Adicionado para controle
    FOREIGN KEY (id_venda) REFERENCES vendas(id_venda),
    FOREIGN KEY (id_tipo_ingresso) REFERENCES tipos_ingresso(id_tipo_ingresso)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- 2. Inserts Básicos (Usando INSERT IGNORE para não duplicar se já existirem)

INSERT IGNORE INTO uf_estados (id_estado, UF_estado, Estado) VALUES
(1,'AC','Acre'), (2,'AL','Alagoas'), (3,'AP','Amapá'), (4,'AM','Amazonas'), (5,'BA','Bahia'),
(6,'CE','Ceará'), (7,'DF','Distrito Federal'), (8,'ES','Espírito Santo'), (9,'GO','Goiás'),
(10,'MA','Maranhão'), (11,'MT','Mato Grosso'), (12,'MS','Mato Grosso do Sul'), (13,'MG','Minas Gerais'),
(14,'PA','Pará'), (15,'PB','Paraíba'), (16,'PR','Paraná'), (17,'PE','Pernambuco'), (18,'PI','Piauí'),
(19,'RJ','Rio de Janeiro'), (20,'RN','Rio Grande do Norte'), (21,'RS','Rio Grande do Sul'),
(22,'RO','Rondônia'), (23,'RR','Roraima'), (24,'SC','Santa Catarina'), (25,'SP','São Paulo'),
(26,'SE','Sergipe'), (27,'TO','Tocantins');

INSERT IGNORE INTO cidades (id_cidade, id_estado, cidade) VALUES
(1,2,'Maceió'), (2,4,'Manaus'), (3,5,'Salvador'), (4,5,'Feira de Santana'), (5,6,'Fortaleza'),
(6,7,'Brasília'), (7,8,'Serra'), (8,8,'Vila Velha'), (9,9,'Goiânia'), (10,9,'Aparecida de Goiânia');

-- Adicionando cidades e estados comuns que podem ser referenciados por eventos externos
INSERT IGNORE INTO uf_estados (id_estado, UF_estado, Estado) VALUES
(25, 'SP', 'São Paulo'), (19, 'RJ', 'Rio de Janeiro'), (21, 'RS', 'Rio Grande do Sul'),
(6, 'CE', 'Ceará'), (8, 'ES', 'Espírito Santo'), (7, 'DF', 'Distrito Federal');

INSERT IGNORE INTO cidades (id_cidade, id_estado, cidade) VALUES
(39, 25, 'São Paulo'), (26, 19, 'Rio de Janeiro'), (34, 21, 'Porto Alegre'),
(5, 6, 'Fortaleza'), (8, 8, 'Vila Velha'), (6, 7, 'Brasília');


INSERT IGNORE INTO categorias (categoria) VALUES
('Esporte'), ('Música'), ('Palestra'), ('Oficina'), ('Cinema'), ('Teatro'), ('Outros');

INSERT IGNORE INTO `status` (status) VALUES
('Reservado'), ('Pago'), ('Cancelado');

INSERT IGNORE INTO forma_pagamento (forma) VALUES
('Cartão'), ('Boleto'), ('Pix');

INSERT IGNORE INTO local_evento (local_evento) VALUES
('Arena Corinthians'), ('Espaço Unimed'), ('Qualistage'), ('Parque Cândido Portinari'),
('Teatro Municipal'), ('Centro de Convenções');

INSERT IGNORE INTO tipos_ingresso (nome, descricao) VALUES
('Inteira', 'Ingresso com valor cheio.'),
('Meia', 'Desconto para estudantes, idosos, professores etc.'),
('VIP', 'Acesso premium com benefícios extras.');

-- Exemplo de usuários
INSERT IGNORE INTO usuarios (nome, CPF, email_outros, email_google, telefone, endereco, id_cidade, id_estado, foto_usuario, senha) VALUES
('Brenda Alves','438.150.926-98','alvesfrancisco@example.org','mirellapereira@gmail.com','84 3863-7940','Rua Exemplo, 123',(SELECT id_cidade FROM cidades WHERE cidade = 'Maceió'),(SELECT id_estado FROM uf_estados WHERE UF_estado = 'AL'),'https://placekitten.com/600/740','senha123'),
('Isabelly Castro','764.589.123-82','da-conceicaobenicio@example.com','eda-mata@hotmail.com','0300 537 6724','Sítio de Nascimento, 79 São Lucas 53287-101 Pires / CE',(SELECT id_cidade FROM cidades WHERE cidade = 'Serra'),(SELECT id_estado FROM uf_estados WHERE UF_estado = 'ES'),'https://dummyimage.com/864x130','&S9cOrhqD9'),
('Emanuelly Montenegro','143.926.058-33','halmeida@example.com','rhavi03@bol.com.br','+55 21 1718 2278','Trevo de Lima, 48 Vila Nova Cachoeirinha 3ª Seção 65787-133 Fernandes / AC',(SELECT id_cidade FROM cidades WHERE cidade = 'Feira de Santana'),(SELECT id_estado FROM uf_estados WHERE UF_estado = 'BA'),'https://picsum.photos/471/451','t@^0bHcUM');

-- Exemplo de eventos (ajustados para cidades/estados e locais existentes)
INSERT IGNORE INTO eventos (nome_evento, id_categoria, id_local_evento, data_evento, id_cidade, id_estado, preco, latitude, longitude) VALUES
('Show Exemplo', (SELECT id_categoria FROM categorias WHERE categoria = 'Música'), (SELECT id_local_evento FROM local_evento WHERE local_evento = 'Arena Corinthians'), '2025-06-04', (SELECT id_cidade FROM cidades WHERE cidade = 'Maceió'), (SELECT id_estado FROM uf_estados WHERE UF_estado = 'AL'), 100.00,NULL,NULL),
('Evento Esportivo', (SELECT id_categoria FROM categorias WHERE categoria = 'Esporte'), (SELECT id_local_evento FROM local_evento WHERE local_evento = 'Espaço Unimed'), '2025-07-10', (SELECT id_cidade FROM cidades WHERE cidade = 'Manaus'), (SELECT id_estado FROM uf_estados WHERE UF_estado = 'AM'), 120.00,NULL,NULL),
('Concerto de Música', (SELECT id_categoria FROM categorias WHERE categoria = 'Música'), (SELECT id_local_evento FROM local_evento WHERE local_evento = 'Qualistage'), '2025-08-15', (SELECT id_cidade FROM cidades WHERE cidade = 'Salvador'), (SELECT id_estado FROM uf_estados WHERE UF_estado = 'BA'), 150.00,NULL,NULL);

-- Exemplo de vendas (ajustado para DATETIME)
INSERT IGNORE INTO vendas (id_status, id_usuario, id_evento, data_reserva_bilhete, data_compra_bilhete, id_forma_pagamento, tipo_ingresso, preco_pago) VALUES
((SELECT id_status FROM `status` WHERE status = 'Pago'), (SELECT id_usuario FROM usuarios WHERE CPF = '438.150.926-98'), (SELECT id_evento FROM eventos WHERE nome_evento = 'Show Exemplo'), '2025-06-01 10:00:00', '2025-06-01 10:15:00', (SELECT id_forma_pagamento FROM forma_pagamento WHERE forma = 'Cartão'), 'inteira', 100.00),
((SELECT id_status FROM `status` WHERE status = 'Reservado'), (SELECT id_usuario FROM usuarios WHERE CPF = '438.150.926-98'), (SELECT id_evento FROM eventos WHERE nome_evento = 'Evento Esportivo'), '2025-05-25 14:30:00', NULL, (SELECT id_forma_pagamento FROM forma_pagamento WHERE forma = 'Boleto'), 'inteira', 120.00),
((SELECT id_status FROM `status` WHERE status = 'Pago'), (SELECT id_usuario FROM usuarios WHERE CPF = '764.589.123-82'), (SELECT id_evento FROM eventos WHERE nome_evento = 'Concerto de Música'), '2025-05-24 09:00:00', '2025-05-27 11:00:00', (SELECT id_forma_pagamento FROM forma_pagamento WHERE forma = 'Pix'), 'meia', 75.00);

-- Exemplo de itens de venda (relacionado às vendas acima)
INSERT IGNORE INTO itens_venda (id_venda, id_tipo_ingresso, preco_unitario, quantidade) VALUES
((SELECT id_venda FROM vendas WHERE id_usuario = (SELECT id_usuario FROM usuarios WHERE CPF = '438.150.926-98') AND id_evento = (SELECT id_evento FROM eventos WHERE nome_evento = 'Show Exemplo') ORDER BY data_reserva_bilhete DESC LIMIT 1), (SELECT id_tipo_ingresso FROM tipos_ingresso WHERE nome = 'Inteira'), 100.00, 1),
((SELECT id_venda FROM vendas WHERE id_usuario = (SELECT id_usuario FROM usuarios WHERE CPF = '764.589.123-82') AND id_evento = (SELECT id_evento FROM eventos WHERE nome_evento = 'Concerto de Música') ORDER BY data_reserva_bilhete DESC LIMIT 1), (SELECT id_tipo_ingresso FROM tipos_ingresso WHERE nome = 'Meia'), 75.00, 1);


-- 3. Consultas Úteis para Verificação e Diagnóstico

SELECT * FROM categorias;
SELECT * FROM `status`;
SELECT * FROM forma_pagamento;
SELECT * FROM eventos;
SELECT * FROM usuarios;
SELECT * FROM vendas;
SELECT * FROM itens_venda;
SELECT * FROM cidades;
SELECT * FROM uf_estados;
SELECT * FROM local_evento;
SELECT * FROM tipos_ingresso;

-- Vendas registradas (ordem decrescente de ID)
SELECT * FROM vendas ORDER BY id_venda DESC;

-- Reservas registradas (status 'Reservado')
SELECT * FROM vendas WHERE id_status = (SELECT id_status FROM `status` WHERE status = 'Reservado') ORDER BY id_venda DESC;

-- Query para VENDAS por CATEGORIA (apenas vendas pagas)
SELECT
    cat.categoria,
    COUNT(v.id_venda) AS total_vendas_por_categoria
FROM vendas v
JOIN eventos e ON v.id_evento = e.id_evento
JOIN categorias cat ON e.id_categoria = cat.id_categoria
WHERE v.id_status = (SELECT id_status FROM `status` WHERE status = 'Pago')
GROUP BY cat.categoria
ORDER BY total_vendas_por_categoria DESC;

-- Consulta CORRIGIDA FINAL (com JOIN para local_evento e ORDER BY data_criacao)
-- Esta consulta busca detalhes de vendas, incluindo o nome do local do evento.
SELECT
    v.id_venda,
    v.data_reserva_bilhete,
    v.data_compra_bilhete,
    v.tipo_ingresso,
    v.preco_pago,
    st.status,
    u.nome AS nome_usuario,
    u.CPF,
    e.nome_evento,
    e.data_evento,
    l.local_evento,
    f.forma AS forma_pagamento
FROM vendas v
JOIN `status` st ON v.id_status = st.id_status
JOIN usuarios u ON v.id_usuario = u.id_usuario
JOIN eventos e ON v.id_evento = e.id_evento
JOIN local_evento l ON e.id_local_evento = l.id_local_evento
LEFT JOIN forma_pagamento f ON v.id_forma_pagamento = f.id_forma_pagamento
ORDER BY v.data_criacao DESC; 


SET FOREIGN_KEY_CHECKS = 0; -- Desabilita temporariamente as checagens de chave estrangeira
TRUNCATE TABLE eventos;    -- Limpa todos os dados da tabela eventos
-- Se quiser limpar também locais, categorias para um reset total
-- TRUNCATE TABLE local_evento;
-- TRUNCATE TABLE categorias;
TRUNCATE TABLE itens_venda;
TRUNCATE TABLE eventos;
SET FOREIGN_KEY_CHECKS = 1; -- Reabilita as checagens de chave estrangeira




-- DADOS DE TESTE PARA DASHBOARD (POPULAÇÃO COMPLETA)

-- Usuários de teste (diferentes combinações de email, telefone, foto, etc)
INSERT IGNORE INTO usuarios (nome, CPF, email_outros, email_google, telefone, endereco, id_cidade, id_estado, foto_usuario, senha) VALUES
('Ana Teste','111.111.111-11','ana@teste.com',NULL,'11999999999','Rua A, 100',39,25,NULL,'123'),
('Bruno Teste','222.222.222-22','bruno@teste.com',NULL,'21988888888','Rua B, 200',26,19,NULL,'123'),
('Carla Teste','333.333.333-33','carla@teste.com',NULL,'31977777777','Rua C, 300',34,21,NULL,'123'),
('Diego Google','444.444.444-44',NULL,'diego@gmail.com','11988887777','Rua D, 400',39,25,NULL,'123'),
('Elisa Foto','555.555.555-55','elisa@foto.com',NULL,'11977776666','Rua E, 500',26,19,'/images/usuario-4-1700000000000.jpg','123'),
('Fábio Completo','666.666.666-66','fabio@completo.com','fabio@gmail.com','11966665555','Rua F, 600',34,21,'/images/usuario-5-1700000000001.jpg','123');

-- Eventos de teste (diferentes categorias, locais, datas, preços)
INSERT IGNORE INTO eventos (nome_evento, id_categoria, id_local_evento, data_evento, id_cidade, id_estado, preco, latitude, longitude) VALUES
('Festival de Música', 2, 1, '2025-07-10', 39, 25, 150.00, NULL, NULL),
('Corrida de Rua', 1, 2, '2025-08-15', 26, 19, 80.00, NULL, NULL),
('Teatro Infantil', 6, 5, '2025-09-20', 34, 21, 60.00, NULL, NULL),
('Cinema ao Ar Livre', 5, 4, '2025-10-05', 39, 25, 50.00, NULL, NULL),
('Palestra Motivacional', 3, 6, '2025-11-12', 26, 19, 200.00, NULL, NULL),
('Oficina de Arte', 4, 3, '2025-12-01', 34, 21, 90.00, NULL, NULL);

-- Vendas de teste (Pagas, Reservadas, Canceladas, diferentes formas de pagamento e tipos de ingresso)
INSERT IGNORE INTO vendas (id_status, id_usuario, id_evento, data_reserva_bilhete, data_compra_bilhete, id_forma_pagamento, tipo_ingresso, preco_pago) VALUES
(2, 1, 1, '2025-07-01 10:00:00', '2025-07-01 10:10:00', 1, 'inteira', 150.00),
(2, 2, 2, '2025-08-01 11:00:00', '2025-08-01 11:15:00', 2, 'meia', 40.00),
(1, 3, 3, '2025-09-01 12:00:00', NULL, 3, 'vip', 120.00),
(2, 1, 4, '2025-10-01 13:00:00', '2025-10-01 13:20:00', 1, 'inteira', 50.00),
(1, 2, 1, '2025-07-02 14:00:00', NULL, 2, 'meia', 75.00),
(3, 4, 5, '2025-11-01 15:00:00', NULL, 3, 'vip', 0.00), -- Cancelada
(2, 5, 6, '2025-12-01 16:00:00', '2025-12-01 16:30:00', 1, 'inteira', 90.00),
(2, 6, 2, '2025-08-10 17:00:00', '2025-08-10 17:20:00', 2, 'meia', 40.00);

-- Itens de venda de teste (diferentes tipos e quantidades)
INSERT IGNORE INTO itens_venda (id_venda, id_tipo_ingresso, preco_unitario, quantidade) VALUES
(1, 1, 150.00, 1),
(2, 2, 40.00, 1),
(3, 3, 120.00, 1),
(4, 1, 50.00, 1),
(5, 2, 75.00, 1),
(6, 3, 0.00, 1),
(7, 1, 90.00, 1),
(8, 2, 40.00, 2);

-- Vendas para eventos de todas as categorias (para dashboard completo)

-- Teatro
INSERT IGNORE INTO vendas (id_status, id_usuario, id_evento, data_reserva_bilhete, data_compra_bilhete, id_forma_pagamento, tipo_ingresso, preco_pago)
VALUES (2, 1, (SELECT id_evento FROM eventos WHERE nome_evento = 'Teatro Infantil' LIMIT 1), '2025-09-01 12:00:00', '2025-09-01 12:10:00', 1, 'inteira', 60.00);

-- Cinema
INSERT IGNORE INTO vendas (id_status, id_usuario, id_evento, data_reserva_bilhete, data_compra_bilhete, id_forma_pagamento, tipo_ingresso, preco_pago)
VALUES (2, 2, (SELECT id_evento FROM eventos WHERE nome_evento = 'Cinema ao Ar Livre' LIMIT 1), '2025-10-01 13:00:00', '2025-10-01 13:10:00', 2, 'meia', 25.00);

-- Palestra
INSERT IGNORE INTO vendas (id_status, id_usuario, id_evento, data_reserva_bilhete, data_compra_bilhete, id_forma_pagamento, tipo_ingresso, preco_pago)
VALUES (2, 3, (SELECT id_evento FROM eventos WHERE nome_evento = 'Palestra Motivacional' LIMIT 1), '2025-11-01 14:00:00', '2025-11-01 14:10:00', 3, 'vip', 400.00);

-- Oficina
INSERT IGNORE INTO vendas (id_status, id_usuario, id_evento, data_reserva_bilhete, data_compra_bilhete, id_forma_pagamento, tipo_ingresso, preco_pago)
VALUES (2, 4, (SELECT id_evento FROM eventos WHERE nome_evento = 'Oficina de Arte' LIMIT 1), '2025-12-01 15:00:00', '2025-12-01 15:10:00', 1, 'inteira', 90.00);

-- Outros
INSERT IGNORE INTO eventos (nome_evento, id_categoria, id_local_evento, data_evento, id_cidade, id_estado, preco)
VALUES ('Evento Diversos', (SELECT id_categoria FROM categorias WHERE categoria = 'Outros'), 1, '2025-12-20', 39, 25, 60.00);

INSERT IGNORE INTO vendas (id_status, id_usuario, id_evento, data_reserva_bilhete, data_compra_bilhete, id_forma_pagamento, tipo_ingresso, preco_pago)
VALUES (2, 5, (SELECT id_evento FROM eventos WHERE nome_evento = 'Evento Diversos' LIMIT 1), '2025-12-15 16:00:00', '2025-12-15 16:10:00', 2, 'meia', 30.00);