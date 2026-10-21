import test from 'node:test';
import assert from 'node:assert/strict';
import { selecionarPapeis } from '../lib/roteamento.mjs';

const cenarios = [
  ['Melhore o espaçamento, os estados vazios e as transições desta tela.', ['frontend-engineer'], ['backend-engineer', 'environment-engineer']],
  ['Adicione uma operação com esta regra de negócio.', ['backend-engineer', 'qa-engineer'], ['frontend-engineer']],
  ['Crie uma tela de histórico de pedidos com filtro por status e paginação.', ['frontend-engineer', 'backend-engineer'], []],
  ['O projeto não inicia no Docker.', ['environment-engineer'], ['frontend-engineer']],
  ['Confira se essa implementação segue meu padrão.', ['personal-standards-auditor'], ['backend-engineer']],
  ['Corrija esse erro de digitação no README.', ['documentation-specialist'], ['qa-engineer', 'technical-reviewer']]
];
for (const [pedido, presentes, ausentes] of cenarios) test(pedido, () => {
  const rota = selecionarPapeis(pedido);
  presentes.forEach(papel => assert.ok(rota.papeis.includes(papel)));
  ausentes.forEach(papel => assert.ok(!rota.papeis.includes(papel)));
});
