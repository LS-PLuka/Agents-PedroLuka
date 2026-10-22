import * as arquivos from 'node:fs/promises';
import * as caminhos from 'node:path';
import { randomUUID as criarUuid } from 'node:crypto';
import { copiarSnapshot, criarSnapshot, integrarResultado } from './snapshots.mjs';
import { executarPapel } from './executores.mjs';
import { selecionarPapeis } from './roteamento.mjs';
import { gravar, gravarJson, lerJson, resolverSeguro } from './arquivos.mjs';
import { validarTarefa } from './contratos.mjs';
import { resolverPerfil as resolverPerfilMapeado } from './perfis.mjs';

const PAPEIS_LEITURA = new Set(['technical-reviewer', 'personal-standards-auditor']);

function executorPara(papel, modo, configuracao) {
  if (modo === 'codex' || modo === 'claude') return modo;
  return configuracao.preferencias?.[papel] ?? configuracao.preferencias?.padrao ?? 'codex';
}

export function resolverPerfil(configuracao, escopo = []) {
  return resolverPerfilMapeado(configuracao, escopo).perfil;
}

async function copiarContextoObrigatorio(projeto, isolada, documentos) {
  for (const documento of documentos) {
    const origem = await resolverSeguro(projeto, documento);
    const destino = await resolverSeguro(isolada, documento);
    await gravar(destino, await arquivos.readFile(origem));
  }
}

export async function coordenar({ projeto, pedido, modo = 'conjunto', escopo = [], raizSolucao, configuracao = {} }) {
  const rota = selecionarPapeis(pedido);
  const execucao = `tarefa-${Date.now()}-${criarUuid()}`;
  const pastaExecucao = caminhos.join(projeto, '.equipe-execucoes', execucao);
  const versao = (await lerJson(caminhos.join(raizSolucao, 'versao.json'))).versao;
  const catalogo = await lerJson(caminhos.join(projeto, '.equipe', 'base', 'papeis.json'));
  const entregas = [];
  await arquivos.mkdir(pastaExecucao, { recursive: true });
  const estado = { identificador: execucao, estado: 'em_andamento', projeto, pedido, modo, escopo, criadoEm: new Date().toISOString(), entregas: [], achados: [], verificacoes: [] };
  await gravarJson(caminhos.join(pastaExecucao, 'estado.json'), estado);
  for (let indice = 0; indice < rota.papeis.length; indice++) {
    const papel = rota.papeis[indice];
    const snapshot = await criarSnapshot(projeto, { escopo: escopo.length ? escopo : undefined });
    const pastaIsolada = caminhos.join(pastaExecucao, `${indice + 1}-${papel}`);
    await copiarSnapshot(projeto, pastaIsolada, snapshot);
    const tarefa = validarTarefa({
      identificador: `${execucao}-${indice + 1}`, objetivo: pedido, papel, projeto, versaoPadroes: versao,
      perfil: resolverPerfil(configuracao, escopo), snapshotBase: snapshot,
      escopoEscrita: PAPEIS_LEITURA.has(papel) ? [] : (escopo.length ? escopo : ['**']),
      documentosObrigatorios: ['.equipe/base/entrada.md', '.equipe/base/politicas.md', `.equipe/base/papeis/${papel}.md`, ...(resolverPerfil(configuracao, escopo) === 'descoberta' ? [] : [`.equipe/base/perfis/${resolverPerfil(configuracao, escopo)}.md`])],
      skills: catalogo.find(item => item.identificador === papel)?.skills ?? [], dependencias: entregas.map(item => item.identificador), criteriosAceite: [pedido],
      limites: configuracao.limites ?? { duracaoSegundos: 180, tentativas: 1 }
    });
    await copiarContextoObrigatorio(projeto, pastaIsolada, tarefa.documentosObrigatorios);
    await gravarJson(caminhos.join(pastaIsolada, 'tarefa.json'), tarefa);
    await gravarJson(caminhos.join(pastaExecucao, `${indice + 1}-${papel}.tarefa.json`), tarefa);
    let executor = executorPara(papel, modo, configuracao);
    let resultado;
    try { resultado = await executarPapel(executor, tarefa, pastaIsolada, { ...configuracao, ...configuracao.limites }); }
    catch (erro) {
      if (modo === 'conjunto' && configuracao.execucao?.permitirAlternativa) {
        const alternativo = executor === 'codex' ? 'claude' : 'codex';
        try { resultado = await executarPapel(alternativo, tarefa, pastaIsolada, { ...configuracao, ...configuracao.limites }); executor = alternativo; }
        catch (falhaAlternativa) { resultado = { estado: 'falhou', papel, executor: alternativo, versaoPadroes: versao, snapshotBase: snapshot.identificador, arquivosAlterados: [], achados: [], evidencias: [`Falha inicial: ${erro.message}`, `Falha alternativa: ${falhaAlternativa.message}`], verificacoesExecutadas: [], verificacoesPendentes: [], pendencias: ['Executor indisponível.'] }; }
      } else resultado = { estado: 'falhou', papel, executor, versaoPadroes: versao, snapshotBase: snapshot.identificador, arquivosAlterados: [], achados: [], evidencias: [`Falha do executor: ${erro.message}`], verificacoesExecutadas: [], verificacoesPendentes: [], pendencias: ['Executor indisponível.'] };
    }
    const integracao = resultado.estado === 'concluido' ? await integrarResultado(projeto, tarefa, resultado) : { integrado: false, motivo: `Resultado ${resultado.estado} não é elegível à integração.` };
    await gravarJson(caminhos.join(pastaExecucao, `${indice + 1}-${papel}.resultado.json`), { resultado, integracao });
    entregas.push({ identificador: tarefa.identificador, papel, executor, estado: resultado.estado, integracao });
    estado.entregas = entregas; estado.achados.push(...resultado.achados); estado.verificacoes.push(...resultado.verificacoesExecutadas);
    await gravarJson(caminhos.join(pastaExecucao, 'estado.json'), estado);
    if (!integracao.integrado || ['bloqueado', 'falhou'].includes(resultado.estado)) break;
  }
  estado.estado = entregas.every(item => item.estado === 'concluido' && item.integracao.integrado) ? 'concluido' : 'parcial';
  const relatorio = { identificador: execucao, rota, modo, entregas, estado: estado.estado };
  await gravarJson(caminhos.join(pastaExecucao, 'relatorio.json'), relatorio);
  await gravarJson(caminhos.join(pastaExecucao, 'estado.json'), estado);
  return relatorio;
}

export async function retomar({ projeto, identificador }) {
  if (!identificador || /[\\/]/.test(identificador)) throw new Error('Identificador de execução inválido.');
  const pasta = caminhos.join(projeto, '.equipe-execucoes', identificador);
  let estado;
  try { estado = await lerJson(caminhos.join(pasta, 'estado.json')); }
  catch (erro) { if (erro.code === 'ENOENT') return { estado: 'ausente', identificador, motivo: 'Execução não encontrada ou sem estado durável.' }; throw erro; }
  const relatorio = await lerJson(caminhos.join(pasta, 'relatorio.json')).catch(() => null);
  if (estado.estado === 'concluido') return { estado: 'inalterado', identificador, motivo: 'Execução já concluída; nenhuma integração será repetida.' };
  return { estado: 'pendente', identificador, motivo: 'O estado foi preservado; a retomada automática de tarefas incompletas ainda requer uma nova execução controlada.', entregas: estado.entregas, relatorioDisponivel: Boolean(relatorio) };
}
