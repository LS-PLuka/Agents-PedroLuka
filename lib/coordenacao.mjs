import * as arquivos from 'node:fs/promises';
import * as caminhos from 'node:path';
import { copiarSnapshot, criarSnapshot, integrarResultado } from './snapshots.mjs';
import { executarPapel } from './executores.mjs';
import { selecionarPapeis } from './roteamento.mjs';
import { gravarJson, lerJson, resolverSeguro } from './arquivos.mjs';
import { validarTarefa } from './contratos.mjs';

const PAPEIS_LEITURA = new Set(['technical-reviewer', 'personal-standards-auditor']);

function executorPara(papel, modo, configuracao) {
  if (modo === 'codex' || modo === 'claude') return modo;
  return configuracao.preferencias?.[papel] ?? configuracao.preferencias?.padrao ?? 'codex';
}

export async function coordenar({ projeto, pedido, modo = 'conjunto', escopo = [], raizSolucao, configuracao = {} }) {
  const rota = selecionarPapeis(pedido);
  const execucao = `tarefa-${Date.now()}`;
  const pastaExecucao = caminhos.join(projeto, '.equipe-execucoes', execucao);
  const versao = (await lerJson(caminhos.join(raizSolucao, 'versao.json'))).versao;
  const catalogo = await lerJson(caminhos.join(projeto, '.equipe', 'base', 'papeis.json'));
  const entregas = [];
  await arquivos.mkdir(pastaExecucao, { recursive: true });
  for (let indice = 0; indice < rota.papeis.length; indice++) {
    const papel = rota.papeis[indice];
    const snapshot = await criarSnapshot(projeto, { escopo: escopo.length ? escopo : undefined });
    const pastaIsolada = caminhos.join(pastaExecucao, `${indice + 1}-${papel}`);
    await copiarSnapshot(projeto, pastaIsolada, snapshot);
    const tarefa = validarTarefa({
      identificador: `${execucao}-${indice + 1}`, objetivo: pedido, papel, projeto, versaoPadroes: versao,
      perfil: configuracao.perfil ?? 'descoberta', snapshotBase: snapshot,
      escopoEscrita: PAPEIS_LEITURA.has(papel) ? [] : (escopo.length ? escopo : ['**']),
      documentosObrigatorios: ['.equipe/base/entrada.md', `.equipe/base/papeis/${papel}.md`],
      skills: catalogo.find(item => item.identificador === papel)?.skills ?? [], dependencias: entregas.map(item => item.identificador), criteriosAceite: [pedido],
      limites: configuracao.limites ?? { duracaoSegundos: 180, tentativas: 1 }
    });
    await gravarJson(caminhos.join(pastaIsolada, 'tarefa.json'), tarefa);
    const executor = executorPara(papel, modo, configuracao);
    let resultado;
    try { resultado = await executarPapel(executor, tarefa, pastaIsolada, { ...configuracao, ...configuracao.limites }); }
    catch (erro) {
      if (modo === 'conjunto' && configuracao.execucao?.permitirAlternativa) {
        const alternativo = executor === 'codex' ? 'claude' : 'codex';
        resultado = await executarPapel(alternativo, tarefa, pastaIsolada, { ...configuracao, ...configuracao.limites });
      } else throw erro;
    }
    const integracao = await integrarResultado(projeto, tarefa, resultado);
    await gravarJson(caminhos.join(pastaExecucao, `${indice + 1}-${papel}.resultado.json`), { resultado, integracao });
    entregas.push({ identificador: tarefa.identificador, papel, executor, estado: resultado.estado, integracao });
    if (!integracao.integrado || ['bloqueado', 'falhou'].includes(resultado.estado)) break;
  }
  const relatorio = { identificador: execucao, rota, modo, entregas };
  await gravarJson(caminhos.join(pastaExecucao, 'relatorio.json'), relatorio);
  return relatorio;
}
