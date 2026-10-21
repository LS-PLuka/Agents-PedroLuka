#!/usr/bin/env node
import * as caminhos from 'node:path';
import { fileURLToPath as caminhoDeUrl } from 'node:url';
import { instalar, remover, restaurar, diagnosticar } from './lib/instalacao.mjs';
import { selecionarPapeis } from './lib/roteamento.mjs';
import { coordenar } from './lib/coordenacao.mjs';
import { verificarSolucao } from './lib/verificacao.mjs';
import { lerJson } from './lib/arquivos.mjs';

const raiz = caminhos.dirname(caminhoDeUrl(import.meta.url));

function argumentos(lista) {
  const saida = { _: [] };
  for (let indice = 0; indice < lista.length; indice++) {
    const item = lista[indice];
    if (!item.startsWith('--')) saida._.push(item);
    else {
      const chave = item.slice(2);
      const proximo = lista[indice + 1];
      saida[chave] = proximo && !proximo.startsWith('--') ? lista[++indice] : true;
    }
  }
  return saida;
}

function caminhoProjeto(opcoes) { return caminhos.resolve(opcoes.projeto ?? process.cwd()); }
function mostrar(valor) { process.stdout.write(JSON.stringify(valor, null, 2) + '\n'); }

async function principal() {
  const opcoes = argumentos(process.argv.slice(2));
  const comando = opcoes._[0];
  if (comando === 'instalar') return mostrar(await instalar({ projeto: caminhoProjeto(opcoes), origem: caminhos.resolve(opcoes.origem ?? raiz) }));
  if (comando === 'atualizar') return mostrar(await instalar({ projeto: caminhoProjeto(opcoes), origem: caminhos.resolve(opcoes.origem ?? raiz), atualizar: true }));
  if (comando === 'remover') return mostrar(await remover({ projeto: caminhoProjeto(opcoes) }));
  if (comando === 'restaurar') return mostrar(await restaurar({ projeto: caminhoProjeto(opcoes), versao: opcoes.versao }));
  if (comando === 'diagnosticar') return mostrar(await diagnosticar(caminhoProjeto(opcoes)));
  if (comando === 'rotear') return mostrar(selecionarPapeis(opcoes.pedido ?? opcoes._.slice(1).join(' ')));
  if (comando === 'verificar') return mostrar(await verificarSolucao(raiz));
  if (comando === 'coordenar') {
    const projeto = caminhoProjeto(opcoes);
    let configuracao = {};
    try { configuracao = await lerJson(caminhos.resolve(opcoes.configuracao ?? caminhos.join(projeto, '.equipe', 'configuracao.json'))); }
    catch (erro) { if (erro.code !== 'ENOENT') throw erro; }
    return mostrar(await coordenar({ projeto, pedido: opcoes.pedido ?? opcoes._.slice(1).join(' '), modo: opcoes.modo ?? 'conjunto', escopo: opcoes.escopo ? opcoes.escopo.split(',') : [], raizSolucao: raiz, configuracao }));
  }
  throw new Error('Uso: node equipe.mjs <instalar|atualizar|restaurar|remover|diagnosticar|rotear|coordenar|verificar> [opções]');
}

principal().catch(erro => { process.stderr.write(`${erro.message}\n`); process.exitCode = 1; });
