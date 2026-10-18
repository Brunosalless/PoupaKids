-- BancoKids — DDL versão 2.1 (6º período, Fase 02). Equivalente ao schema gerado pelos models Sequelize.
-- Mudanças em relação à Fase 0: senha_hash (Responsaveis); apelido e pin_hash (Usuarios);
-- mesada_referencia (Contas); id_conta_destino, id_objetivo e tipos 'Mesada'/'Poupança' (Transacoes);
-- pontos (EducacaoFinanceira); status e concluido_em (Objetivos); nova tabela ProgressoConteudo.
-- A trigger atualiza_saldo foi REMOVIDA (o saldo é atualizado pelo transacaoService; mantê-la duplicaria créditos).
-- valida_idade e valida_saldo foram substituídas por CHECK constraints + validação nos services.

CREATE DATABASE IF NOT EXISTS BancoKids CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE BancoKids;
DROP TRIGGER IF EXISTS atualiza_saldo;

CREATE TABLE IF NOT EXISTS Responsaveis (
  id_responsavel INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  telefone VARCHAR(20),
  endereco VARCHAR(200),
  senha_hash VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Usuarios (
  id_usuario INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  idade INT NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  apelido VARCHAR(30) NOT NULL UNIQUE,
  pin_hash VARCHAR(100) NOT NULL,
  id_responsavel INT NOT NULL,
  CONSTRAINT chk_usuarios_idade CHECK (idade > 0 AND idade < 18),
  FOREIGN KEY (id_responsavel) REFERENCES Responsaveis(id_responsavel)
);

CREATE TABLE IF NOT EXISTS Contas (
  id_conta INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL UNIQUE,
  saldo DECIMAL(10,2) NOT NULL DEFAULT 0,
  limite_mesada DECIMAL(10,2) NOT NULL DEFAULT 0,
  mesada_referencia VARCHAR(7),
  CONSTRAINT chk_contas_saldo CHECK (saldo >= 0),
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS EducacaoFinanceira (
  id_conteudo INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(100) NOT NULL,
  descricao TEXT,
  nivel ENUM('Iniciante','Intermediário','Avançado') NOT NULL DEFAULT 'Iniciante',
  pontos INT NOT NULL DEFAULT 10
);

CREATE TABLE IF NOT EXISTS Objetivos (
  id_objetivo INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  descricao VARCHAR(150) NOT NULL,
  valor_meta DECIMAL(10,2) NOT NULL,
  valor_atual DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('Em andamento','Concluído') NOT NULL DEFAULT 'Em andamento',
  concluido_em DATETIME,
  CONSTRAINT chk_objetivos_valor CHECK (valor_atual >= 0 AND valor_atual <= valor_meta),
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Transacoes (
  id_transacao INT PRIMARY KEY AUTO_INCREMENT,
  id_conta INT NOT NULL,
  tipo_transacao ENUM('Depósito','Saque','Transferência','Mesada','Poupança') NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(50),
  id_conta_destino INT NULL,
  id_objetivo INT NULL,
  data_transacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_transacoes_valor CHECK (valor > 0),
  FOREIGN KEY (id_conta) REFERENCES Contas(id_conta),
  FOREIGN KEY (id_conta_destino) REFERENCES Contas(id_conta),
  FOREIGN KEY (id_objetivo) REFERENCES Objetivos(id_objetivo)
);

CREATE TABLE IF NOT EXISTS Gamificacao (
  id_gamificacao INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL UNIQUE,
  nivel INT NOT NULL DEFAULT 1,
  pontos INT NOT NULL DEFAULT 0,
  conquistas TEXT,
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ProgressoConteudo (
  id_progresso INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_conteudo INT NOT NULL,
  concluido_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_progresso (id_usuario, id_conteudo),
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_conteudo) REFERENCES EducacaoFinanceira(id_conteudo)
);
