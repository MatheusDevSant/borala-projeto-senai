-- Criação do banco de dados
DROP DATABASE IF EXISTS db_borala;
CREATE DATABASE db_borala;
USE db_borala;

-- Tabela: uf_estados
CREATE TABLE uf_estados (
    id_estado INT PRIMARY KEY,
    UF_estado CHAR(2) NOT NULL,
    Estado VARCHAR(50) NOT NULL
);

-- Tabela: cidades
CREATE TABLE cidades (
    id_cidade INT PRIMARY KEY,
    id_estado INT NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_estado) REFERENCES uf_estados(id_estado)
);

-- Tabela: categorias
CREATE TABLE categorias (
    id_categoria INT PRIMARY KEY,
    categoria VARCHAR(50) NOT NULL
);

-- Tabela: status
CREATE TABLE status (
    id_status INT PRIMARY KEY,
    status VARCHAR(50) NOT NULL
);

-- Tabela: forma_pagamento
CREATE TABLE forma_pagamento (
    id_forma_pagamento INT PRIMARY KEY,
    forma VARCHAR(50) NOT NULL
);

-- Tabela: local_evento
CREATE TABLE local_evento (
    id_local_evento INT PRIMARY KEY AUTO_INCREMENT,
    local_evento VARCHAR(150) NOT NULL
);

-- Tabela: usuarios
CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    CPF VARCHAR(20) NOT NULL,
    email_outros VARCHAR(100) NOT NULL,
    email_google VARCHAR(100) NOT NULL,
    telefone VARCHAR(30),
    endereco VARCHAR(200),
    id_cidade INT,
    id_estado INT,
    foto_usuario VARCHAR(200),
    senha VARCHAR(50),
    FOREIGN KEY (id_cidade) REFERENCES cidades(id_cidade),
    FOREIGN KEY (id_estado) REFERENCES uf_estados(id_estado)
);

-- Tabela: eventos
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
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    FOREIGN KEY (id_local_evento) REFERENCES local_evento(id_local_evento),
    FOREIGN KEY (id_cidade) REFERENCES cidades(id_cidade),
    FOREIGN KEY (id_estado) REFERENCES uf_estados(id_estado)
);

-- Tabela: tipos_ingresso
CREATE TABLE tipos_ingresso (
    id_tipo_ingresso INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- Tabela: vendas
CREATE TABLE vendas (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_status INT NOT NULL,
    id_usuario INT NOT NULL,
    id_evento INT NOT NULL,
    data_reserva_bilhete DATE NOT NULL,
    data_compra_bilhete DATE,
    id_forma_pagamento INT,
    tipo_ingresso VARCHAR(10),
    preco_pago DECIMAL(10,2),
    FOREIGN KEY (id_status) REFERENCES status(id_status),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento),
    FOREIGN KEY (id_forma_pagamento) REFERENCES forma_pagamento(id_forma_pagamento)
);

-- Tabela: itens_venda
CREATE TABLE itens_venda (
    id_item_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_venda INT NOT NULL,
    id_tipo_ingresso INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    quantidade INT NOT NULL,
    FOREIGN KEY (id_venda) REFERENCES vendas(id_venda),
    FOREIGN KEY (id_tipo_ingresso) REFERENCES tipos_ingresso(id_tipo_ingresso)
);

-- uf_estados
INSERT INTO uf_estados (id_estado, UF_estado, Estado) VALUES
(1,'AC','Acre'), (2,'AL','Alagoas'), (3,'AP','Amapá'), (4,'AM','Amazonas'), (5,'BA','Bahia'),
(6,'CE','Ceará'), (7,'DF','Distrito Federal'), (8,'ES','Espírito Santo'), (9,'GO','Goiás'),
(10,'MA','Maranhão'), (11,'MT','Mato Grosso'), (12,'MS','Mato Grosso do Sul'), (13,'MG','Minas Gerais'),
(14,'PA','Pará'), (15,'PB','Paraíba'), (16,'PR','Paraná'), (17,'PE','Pernambuco'), (18,'PI','Piauí'),
(19,'RJ','Rio de Janeiro'), (20,'RN','Rio Grande do Norte'), (21,'RS','Rio Grande do Sul'),
(22,'RO','Rondônia'), (23,'RR','Roraima'), (24,'SC','Santa Catarina'), (25,'SP','São Paulo'),
(26,'SE','Sergipe'), (27,'TO','Tocantins');

-- cidades (exemplo)
INSERT INTO cidades (id_cidade, id_estado, cidade) VALUES
(1,2,'Maceió'), (2,4,'Manaus'), (3,5,'Salvador'), (4,5,'Feira de Santana'), (5,6,'Fortaleza'),
(6,7,'Brasília'), (7,8,'Serra'), (8,8,'Vila Velha'), (9,9,'Goiânia'), (10,9,'Aparecida de Goiânia'),
(11,10,'São Luís'), (12,11,'Cuiabá'), (13,12,'Campo Grande'), (14,13,'Belo Horizonte'),
(15,13,'Uberlândia'), (16,13,'Contagem'), (17,13,'Juiz de Fora'), (18,14,'Belém'),
(19,14,'Ananindeua'), (20,15,'João Pessoa'), (21,16,'Curitiba'), (22,16,'Londrina'),
(23,17,'Recife'), (24,17,'Jaboatão dos Guararapes'), (25,18,'Teresina'), (26,19,'Rio de Janeiro'),
(27,19,'São Gonçalo'), (28,19,'Duque de Caxias'), (29,19,'Nova Iguaçu'), (30,19,'Campos dos Goytacazes'),
(31,19,'Belford Roxo'), (32,19,'Niterói'), (33,20,'Natal'), (34,21,'Porto Alegre'),
(35,21,'Caxias do Sul'), (36,22,'Porto Velho'), (37,24,'Joinville'), (38,24,'Florianópolis'),
(39,25,'São Paulo'), (40,25,'Guarulhos'), (41,25,'Campinas'), (42,25,'São Bernardo do Campo'),
(43,25,'Santo André'), (44,25,'Osasco'), (45,25,'Sorocaba'), (46,25,'Ribeirão Preto'),
(47,25,'São José dos Campos'), (48,25,'São José do Rio Preto'), (49,25,'Mogi das Cruzes'),
(50,26,'Aracaju'), (51,25,'São Caetano do Sul');

-- categorias
INSERT INTO categorias (id_categoria, categoria) VALUES
(1,'Sports'), (2,'Music'), (3,'Palestra'), (4,'Workshop');

-- status
INSERT INTO status (id_status, status) VALUES
(1,'Reservado'), (2,'Pago'), (3,'Cancelado');

-- forma_pagamento
INSERT INTO forma_pagamento (id_forma_pagamento, forma) VALUES
(1,'Cartão'), (2,'Boleto'), (3,'Pix');

-- local_evento (exemplo)
INSERT INTO local_evento (local_evento) VALUES
('Arena Corinthians'), ('Espaço Unimed'), ('Qualistage'), ('Parque Cândido Portinari'),
('Tokio Marine Hall'), ('Farmasi Arena'), ('Tokio Marine Hall'),
('Multiplan Hall Park Shopping São Caetano'), ('Multiplan Hall - Ribeirão Preto'),
('Vivo Rio'), ('Ginásio do Ibirapuera');

-- usuarios (exemplo)
INSERT INTO usuarios (nome, CPF, email_outros, email_google, telefone, endereco, id_cidade, id_estado, foto_usuario, senha) VALUES
('Brenda Alves','438.150.926-98','alvesfrancisco@example.org','mirellapereira@gmail.com','84 3863-7940','Loteamento Agatha Cassiano, 25 Buraco Quente 15594-078 Garcia / AP',1,3,'https://placekitten.com/600/740','4$15B8ZEFv'),
('Isabelly Castro','764.589.123-82','da-conceicaobenicio@example.com','eda-mata@hotmail.com','0300 537 6724','Sítio de Nascimento, 79 São Lucas 53287-101 Pires / CE',7,6,'https://dummyimage.com/864x130','&S9cOrhqD9'),
('Emanuelly Montenegro','143.926.058-33','halmeida@example.com','rhavi03@bol.com.br','+55 21 1718 2278','Trevo de Lima, 48 Vila Nova Cachoeirinha 3ª Seção 65787-133 Fernandes / AC',4,1,'https://picsum.photos/471/451','t@^0b3HcUM');

-- eventos (exemplo)
INSERT INTO eventos (nome_evento, id_categoria, id_local_evento, data_evento, id_cidade, id_estado, preco, latitude, longitude) VALUES
('Los Angeles Chargers v. Kansas City Chiefs',1,1,'2025-06-04',39,25,100.00,NULL,NULL),
('Hozier - Unreal Unearth Tour 2025',2,2,'2025-06-07',39,25,100.00,NULL,NULL);

-- tipos_ingresso
INSERT INTO tipos_ingresso (nome, descricao) VALUES
('Inteira', 'Ingresso com valor cheio.'),
('Meia', 'Desconto para estudantes, idosos, professores etc.'),
('VIP', 'Acesso premium com benefícios extras.');

-- vendas (exemplo)
INSERT INTO vendas (id_status, id_usuario, id_evento, data_reserva_bilhete, data_compra_bilhete, id_forma_pagamento, tipo_ingresso, preco_pago) VALUES
(1,1,1,'2025-05-25','2025-05-28',2,'inteira',100.00),
(2,2,2,'2025-05-24','2025-05-27',2,'meia',50.00);

-- itens_venda (exemplo)
INSERT INTO itens_venda (id_venda, id_tipo_ingresso, preco_unitario, quantidade) VALUES
(1,1,100.00,1),
(2,2,50.00,1);

