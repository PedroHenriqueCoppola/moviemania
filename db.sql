CREATE DATABASE moviemania;
USE moviemania;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone varchar(20) NOT NULL,
    admin BOOLEAN DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE perfil (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    nome VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE generos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE filmes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    diretor VARCHAR(255),
    duracao INT,
    data_lancamento DATE,
    imagem VARCHAR(255) 
);

CREATE TABLE filme_genero (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filme_id INT,
    genero_id INT,
    FOREIGN KEY (filme_id) REFERENCES filmes(id),
    FOREIGN KEY (genero_id) REFERENCES generos(id)
);

CREATE TABLE listas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE lista_filme (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lista_id INT,
    filme_id INT,
    assistidos BOOLEAN NOT NULL,
    assistir BOOLEAN NOT NULL,
    FOREIGN KEY (lista_id) REFERENCES listas(id),
    FOREIGN KEY (filme_id) REFERENCES filmes(id)
);

CREATE TABLE avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    filme_id INT,
    nota DECIMAL(2,1),
    comentario TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (filme_id) REFERENCES filmes(id)
);