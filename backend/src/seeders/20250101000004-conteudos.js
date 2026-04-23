'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const data = [
      ['O que é dinheiro?', 'Aprenda o conceito básico de dinheiro e troca.', 'Iniciante'],
      ['Por que poupar?', 'Vídeo curto sobre a importância de guardar dinheiro.', 'Iniciante'],
      ['Diferença entre querer e precisar', 'Jogo interativo para decisões de consumo.', 'Iniciante'],
      ['Cofrinho e objetivos', 'Como usar o cofrinho virtual para juntar dinheiro.', 'Iniciante'],
      ['Moedas e cédulas do Brasil', 'Conheça o Real e suas representações.', 'Iniciante'],
      ['O que é mesada?', 'Entenda como funciona uma mesada saudável.', 'Iniciante'],
      ['Metas financeiras', 'Como definir metas realistas e atingíveis.', 'Iniciante'],
      ['Gastar com consciência', 'Dicas para não gastar mais do que tem.', 'Iniciante'],
      ['Juros: o que são?', 'Introdução simples ao conceito de juros.', 'Intermediario'],
      ['Juros simples x compostos', 'Vídeo animado explicando a diferença.', 'Intermediario'],
      ['Orçamento pessoal', 'Como planejar os gastos do mês.', 'Intermediario'],
      ['Investir é para crianças?', 'Primeiros passos para investir desde cedo.', 'Intermediario'],
      ['Poupança vs. Tesouro Direto', 'Comparação entre duas opções populares.', 'Intermediario'],
      ['Consumo responsável', 'Reflexões sobre propaganda e consumo.', 'Intermediario'],
      ['Empreendedorismo infantil', 'Histórias de crianças empreendedoras.', 'Intermediario'],
      ['Educação financeira na família', 'Como envolver pais e filhos.', 'Intermediario'],
      ['Inflação explicada', 'O que é inflação e como nos afeta.', 'Avancado'],
      ['Renda fixa e renda variável', 'Conceitos avançados de investimento.', 'Avancado'],
      ['Planejamento financeiro', 'Como construir um plano a longo prazo.', 'Avancado'],
      ['Independência financeira', 'O que significa e como trilhar esse caminho.', 'Avancado'],
    ];

    await queryInterface.bulkInsert(
      'Conteudos',
      data.map(([titulo, descricao, nivel]) => ({
        titulo,
        descricao,
        nivel,
        url_recurso: null,
        created_at: now,
      })),
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Conteudos', null, {});
  },
};
