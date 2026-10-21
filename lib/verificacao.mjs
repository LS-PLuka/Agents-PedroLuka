import * as arquivos from 'node:fs/promises';
import * as caminhos from 'node:path';
import { listar, lerJson } from './arquivos.mjs';
import { PAPEIS } from './contratos.mjs';
import { selecionarPapeis } from './roteamento.mjs';

function resultado(nome, passou, detalhe) { return { nome, passou, detalhe }; }

export async function verificarSolucao(raiz) {
  const verificacoes = [];
  const papeis = await lerJson(caminhos.join(raiz, 'base', 'papeis.json'));
  const ids = papeis.map(item => item.identificador);
  verificacoes.push(resultado('oito papéis exatos', ids.length === 8 && ids.every(id => PAPEIS.has(id)) && new Set(ids).size === 8, ids.join(', ')));
  const inventario = await listar(raiz);
  for (const id of ids) verificacoes.push(resultado(`contrato ${id}`, inventario.includes(`base/papeis/${id}.md`), `base/papeis/${id}.md`));
  const skillsReferenciadas = [...new Set(papeis.flatMap(item => item.skills))].sort();
  for (const skill of skillsReferenciadas) verificacoes.push(resultado(`skill ${skill}`, inventario.includes(`base/skills/${skill}/SKILL.md`), `base/skills/${skill}/SKILL.md`));
  verificacoes.push(resultado('perfis Java e JavaScript', inventario.includes('base/perfis/java.md') && inventario.includes('base/perfis/javascript.md'), 'Dois ecossistemas representados.'));
  const cenarios = [
    ['Melhore o espaçamento, os estados vazios e as transições desta tela.', ['frontend-engineer']],
    ['Adicione uma operação com esta regra de negócio.', ['backend-engineer']],
    ['Crie uma tela de histórico de pedidos com filtro por status e paginação.', ['frontend-engineer', 'backend-engineer']],
    ['O projeto não inicia no Docker.', ['environment-engineer']],
    ['Confira se essa implementação segue meu padrão.', ['personal-standards-auditor']],
    ['Corrija esse erro de digitação no README.', ['documentation-specialist']]
  ];
  for (const [pedido, esperados] of cenarios) {
    const rota = selecionarPapeis(pedido);
    verificacoes.push(resultado(`roteamento: ${pedido}`, esperados.every(id => rota.papeis.includes(id)), rota.papeis.join(', ')));
  }
  const codigoExecutores = await arquivos.readFile(caminhos.join(raiz, 'lib', 'executores.mjs'), 'utf8');
  verificacoes.push(resultado('executores externos limitados', !/executar\s*\(\s*['"](?:git|gh)['"]/.test(codigoExecutores), 'Inspeção estática; não prova processos internos dos produtos.'));
  const aprovadas = verificacoes.filter(item => item.passou).length;
  return { estado: aprovadas === verificacoes.length ? 'aprovado' : 'reprovado', aprovadas, total: verificacoes.length, verificacoes };
}
