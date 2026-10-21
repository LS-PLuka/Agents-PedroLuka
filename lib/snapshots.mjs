import * as arquivos from 'node:fs/promises';
import * as caminhos from 'node:path';
import { arquivoSensivel, gravar, lerOpcional, listar, resolverSeguro, resumo } from './arquivos.mjs';

export async function criarSnapshot(raiz, opcoes = {}) {
  const maximoArquivos = opcoes.maximoArquivos ?? 500;
  const maximoBytes = opcoes.maximoBytes ?? 5_000_000;
  const permitidos = opcoes.escopo?.length ? new Set(opcoes.escopo) : null;
  const identidades = {};
  let bytes = 0;
  for (const relativo of await listar(raiz)) {
    if (arquivoSensivel(relativo) || relativo.startsWith('.equipe/versoes/') || relativo.startsWith('.equipe-execucoes/')) continue;
    if (permitidos && !permitidos.has(relativo)) continue;
    const conteudo = await arquivos.readFile(await resolverSeguro(raiz, relativo));
    bytes += conteudo.length;
    if (Object.keys(identidades).length >= maximoArquivos || bytes > maximoBytes) throw new Error('O projeto excede o limite configurado para o snapshot. Defina um escopo menor.');
    identidades[relativo] = resumo(conteudo);
  }
  const identificador = resumo(JSON.stringify(identidades));
  return { identificador, arquivos: identidades, totalArquivos: Object.keys(identidades).length, totalBytes: bytes };
}

export async function copiarSnapshot(origem, destino, snapshot) {
  for (const relativo of Object.keys(snapshot.arquivos)) {
    const conteudo = await arquivos.readFile(await resolverSeguro(origem, relativo));
    if (resumo(conteudo) !== snapshot.arquivos[relativo]) throw new Error(`O arquivo mudou durante a cópia: ${relativo}`);
    await gravar(await resolverSeguro(destino, relativo), conteudo);
  }
}

export async function integrarResultado(raiz, tarefa, resultado) {
  const conflitos = [];
  for (const alteracao of resultado.arquivosAlterados) {
    const destino = await resolverSeguro(raiz, alteracao.caminho);
    const atual = await lerOpcional(destino);
    const identidadeAtual = atual === null ? resumo(Buffer.alloc(0)) : resumo(atual);
    const identidadeEsperada = tarefa.snapshotBase.arquivos[alteracao.caminho] ?? resumo(Buffer.alloc(0));
    if (alteracao.resumoBase !== identidadeEsperada || identidadeAtual !== identidadeEsperada) conflitos.push(alteracao.caminho);
  }
  if (conflitos.length) return { integrado: false, conflitos };
  for (const alteracao of resultado.arquivosAlterados) await gravar(await resolverSeguro(raiz, alteracao.caminho), alteracao.conteudo);
  return { integrado: true, arquivos: resultado.arquivosAlterados.map(item => item.caminho) };
}
