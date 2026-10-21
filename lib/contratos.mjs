const PAPEIS = new Set([
  'coordinator', 'frontend-engineer', 'backend-engineer', 'technical-reviewer',
  'personal-standards-auditor', 'qa-engineer', 'documentation-specialist',
  'environment-engineer'
]);

const ESTADOS = new Set(['concluido', 'parcial', 'bloqueado', 'falhou']);

function exigir(condicao, mensagem) {
  if (!condicao) throw new Error(mensagem);
}

function exigirTexto(valor, campo) {
  exigir(typeof valor === 'string' && valor.trim().length > 0, `${campo} deve ser um texto não vazio.`);
}

function exigirLista(valor, campo) {
  exigir(Array.isArray(valor), `${campo} deve ser uma lista.`);
}

export function validarTarefa(tarefa) {
  exigir(tarefa && typeof tarefa === 'object' && !Array.isArray(tarefa), 'A tarefa deve ser um objeto.');
  exigirTexto(tarefa.identificador, 'identificador');
  exigirTexto(tarefa.objetivo, 'objetivo');
  exigir(PAPEIS.has(tarefa.papel), `Papel desconhecido: ${tarefa.papel}`);
  exigirTexto(tarefa.projeto, 'projeto');
  exigirTexto(tarefa.versaoPadroes, 'versaoPadroes');
  exigirTexto(tarefa.perfil, 'perfil');
  exigir(tarefa.snapshotBase && typeof tarefa.snapshotBase === 'object', 'snapshotBase é obrigatório.');
  exigirLista(tarefa.escopoEscrita, 'escopoEscrita');
  exigirLista(tarefa.documentosObrigatorios, 'documentosObrigatorios');
  exigirLista(tarefa.skills, 'skills');
  exigirLista(tarefa.dependencias, 'dependencias');
  exigirLista(tarefa.criteriosAceite, 'criteriosAceite');
  return tarefa;
}

export function validarResultado(resultado, tarefa) {
  exigir(resultado && typeof resultado === 'object' && !Array.isArray(resultado), 'O resultado deve ser um objeto.');
  exigir(ESTADOS.has(resultado.estado), `Estado desconhecido: ${resultado.estado}`);
  exigir(resultado.papel === tarefa.papel, `O papel do resultado não corresponde à tarefa: ${resultado.papel}`);
  exigirTexto(resultado.executor, 'executor');
  exigir(resultado.versaoPadroes === tarefa.versaoPadroes, 'A versão de padrões do resultado não corresponde à tarefa.');
  exigir(resultado.snapshotBase === tarefa.snapshotBase.identificador, 'O resultado não se refere ao snapshot da tarefa.');
  for (const campo of ['arquivosAlterados', 'achados', 'evidencias', 'verificacoesExecutadas', 'verificacoesPendentes', 'pendencias']) {
    exigirLista(resultado[campo], campo);
  }
  for (const arquivo of resultado.arquivosAlterados) {
    exigirTexto(arquivo.caminho, 'arquivosAlterados[].caminho');
    exigir(typeof arquivo.conteudo === 'string', 'arquivosAlterados[].conteudo deve ser texto.');
    exigirTexto(arquivo.resumoBase, 'arquivosAlterados[].resumoBase');
    exigirTexto(arquivo.resumoResultado, 'arquivosAlterados[].resumoResultado');
    exigir(arquivo.resumoResultado === resumoTexto(arquivo.conteudo), `Hash final incorreto: ${arquivo.caminho}`);
    exigir(tarefa.escopoEscrita.includes('**') || tarefa.escopoEscrita.includes(arquivo.caminho), `Arquivo fora do escopo de escrita: ${arquivo.caminho}`);
  }
  return resultado;
}

export function esquemaResultado() {
  return {
    type: 'object', additionalProperties: false,
    required: ['estado', 'papel', 'executor', 'versaoPadroes', 'snapshotBase', 'arquivosAlterados', 'achados', 'evidencias', 'verificacoesExecutadas', 'verificacoesPendentes', 'pendencias'],
    properties: {
      estado: { type: 'string', enum: [...ESTADOS] },
      papel: { type: 'string', enum: [...PAPEIS] },
      executor: { type: 'string' }, versaoPadroes: { type: 'string' }, snapshotBase: { type: 'string' },
      arquivosAlterados: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['caminho', 'conteudo', 'resumoBase', 'resumoResultado'], properties: { caminho: { type: 'string' }, conteudo: { type: 'string' }, resumoBase: { type: 'string' }, resumoResultado: { type: 'string' } } } },
      achados: { type: 'array', items: { type: 'string' } }, evidencias: { type: 'array', items: { type: 'string' } },
      verificacoesExecutadas: { type: 'array', items: { type: 'string' } }, verificacoesPendentes: { type: 'array', items: { type: 'string' } },
      pendencias: { type: 'array', items: { type: 'string' } }
    }
  };
}

export { PAPEIS };

import { createHash as criarHash } from 'node:crypto';
function resumoTexto(texto) { return criarHash('sha256').update(texto).digest('hex'); }
