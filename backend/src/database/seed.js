// Popula o banco com os dados de teste da Fase 0 usando os próprios services
// (assim os dados respeitam todas as regras de negócio). ATENÇÃO: recria as tabelas.
require('dotenv').config({ quiet: true });
const { sequelize, ConteudoEducativo, Transacao } = require('../models');
const { garantirSchema } = require('./schema');
const authService = require('../services/authService');
const usuarioService = require('../services/usuarioService');
const transacaoService = require('../services/transacaoService');
const objetivoService = require('../services/objetivoService');
const conteudoService = require('../services/conteudoService');
const conteudos = require('./conteudos');

async function seed({ silencioso = false } = {}) {
  await garantirSchema({ force: true });
  await ConteudoEducativo.bulkCreate(conteudos);

  const carlos = await authService.registrarResponsavel({ nome: 'Carlos Silva', cpf: '529.982.247-25', email: 'carlos@poupakids.com', senha: 'poupa123', telefone: '(62) 99999-0001', endereco: 'Anápolis - GO' });
  const maria = await authService.registrarResponsavel({ nome: 'Maria Souza', cpf: '111.444.777-35', email: 'maria@poupakids.com', senha: 'poupa123', telefone: '(62) 99999-0002', endereco: 'Anápolis - GO' });
  const aC = { perfil: 'RESPONSAVEL', id: carlos.usuario.id_responsavel };
  const aM = { perfil: 'RESPONSAVEL', id: maria.usuario.id_responsavel };

  const joao = await usuarioService.criarUsuario(aC, { nome: 'Joãozinho Silva', idade: 9, apelido: 'joaozinho', pin: '1234', limite_mesada: 80 });
  const pedro = await usuarioService.criarUsuario(aC, { nome: 'Pedrinho Silva', idade: 11, apelido: 'pedrinho', pin: '1111', limite_mesada: 100 });
  const ana = await usuarioService.criarUsuario(aM, { nome: 'Aninha Souza', idade: 8, apelido: 'aninha', pin: '4321', limite_mesada: 60 });

  const cJ = { perfil: 'CRIANCA', id: joao.id_usuario };
  const cA = { perfil: 'CRIANCA', id: ana.id_usuario };

  // Movimentações de exemplo
  await usuarioService.pagarMesada(aC, joao.id_usuario);
  await usuarioService.pagarMesada(aM, ana.id_usuario);
  await transacaoService.registrarTransacao(aC, { id_conta: joao.conta.id_conta, tipo_transacao: 'Depósito', valor: 50, categoria: 'Presente da vovó' });
  await transacaoService.registrarTransacao(aC, { id_conta: pedro.conta.id_conta, tipo_transacao: 'Depósito', valor: 40, categoria: 'Ajudou nas tarefas' });
  await transacaoService.registrarTransacao(cJ, { id_conta: joao.conta.id_conta, tipo_transacao: 'Saque', valor: 12.5, categoria: 'Lanche na escola' });
  await transacaoService.registrarTransacao(aM, { id_conta: ana.conta.id_conta, tipo_transacao: 'Depósito', valor: 30, categoria: 'Aniversário' });

  const bike = await objetivoService.criarObjetivo(cJ, { descricao: 'Bicicleta nova', valor_meta: 300 });
  await objetivoService.adicionarValorObjetivo(cJ, bike.id_objetivo, 60);
  await objetivoService.adicionarValorObjetivo(cJ, bike.id_objetivo, 30);
  const livro = await objetivoService.criarObjetivo(cJ, { descricao: 'Livro de dinossauros', valor_meta: 25 });
  await objetivoService.adicionarValorObjetivo(cJ, livro.id_objetivo, 25);
  const game = await objetivoService.criarObjetivo(cA, { descricao: 'Videogame', valor_meta: 250 });
  await objetivoService.adicionarValorObjetivo(cA, game.id_objetivo, 40);

  const lista = await conteudoService.listar(cJ);
  for (const c of lista.slice(0, 3)) await conteudoService.concluir(cJ, c.id_conteudo);
  await conteudoService.concluir(cA, lista[0].id_conteudo);

  // Espalha as datas das transações nos últimos dias para um histórico mais realista
  const todas = await Transacao.findAll({ order: [['id_transacao', 'ASC']] });
  const agora = Date.now();
  for (let i = 0; i < todas.length; i++) {
    todas[i].data_transacao = new Date(agora - (todas.length - i) * 9 * 3600 * 1000);
    await todas[i].save();
  }

  if (!silencioso) {
    console.log('Banco populado com dados de teste.');
    console.log('Responsáveis: carlos@poupakids.com / poupa123  |  maria@poupakids.com / poupa123');
    console.log('Crianças:     joaozinho / PIN 1234  |  pedrinho / PIN 1111  |  aninha / PIN 4321');
  }
}

if (require.main === module) {
  seed().then(() => sequelize.close()).catch((e) => { console.error(e); process.exit(1); });
}

module.exports = seed;
