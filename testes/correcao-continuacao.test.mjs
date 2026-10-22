import test from 'node:test';
import assert from 'node:assert/strict';
import * as arquivos from 'node:fs/promises';
import * as caminhos from 'node:path';
import * as sistema from 'node:os';
import { resolverPerfil } from '../lib/perfis.mjs';
import { executarVerificacao } from '../lib/verificacao-controlada.mjs';
import { agendar } from '../lib/agendador.mjs';

test('resolve perfil por componentes e recusa prefixo semelhante', () => {
  const configuracao={perfis:[{caminho:'servicos','perfil':'java'},{caminho:'servicos/api','perfil':'javascript'}]};
  assert.equal(resolverPerfil(configuracao,['servicos/api/src/a.mjs']).perfil,'javascript');
  assert.equal(resolverPerfil(configuracao,['servicos/api-antiga/a.java']).perfil,'java');
  assert.throws(() => resolverPerfil({perfis:[{caminho:'a',perfil:'invalido'}]},['a/x']),/desconhecido/);
});

test('verificação controlada executa processo local e reporta falha', async () => {
  const projeto=await arquivos.mkdtemp(caminhos.join(sistema.tmpdir(),'equipe-verificacao-'));
  try {
    await arquivos.writeFile(caminhos.join(projeto,'ok.mjs'),'export const valor = 1;\n');
    await arquivos.writeFile(caminhos.join(projeto,'falha.mjs'),'export const = ;\n');
    assert.equal((await executarVerificacao({identificador:'node-sintaxe',projeto,arquivo:'ok.mjs'})).estado,'aprovado');
    assert.equal((await executarVerificacao({identificador:'node-sintaxe',projeto,arquivo:'falha.mjs'})).estado,'falhou');
    assert.equal((await executarVerificacao({identificador:'desconhecido',projeto})).estado,'pendente');
  } finally { await arquivos.rm(projeto,{recursive:true,force:true}); }
});

test('agendador limita paralelismo e respeita dependência', async () => {
  const ordem=[];
  const tarefas=[{identificador:'a',dependencias:[],escopos:['a']},{identificador:'b',dependencias:[],escopos:['b']},{identificador:'c',dependencias:['a'],escopos:['c']}];
  const resultado=await agendar(tarefas,2,async tarefa => { ordem.push(`inicio-${tarefa.identificador}`); await new Promise(resolver=>setTimeout(resolver,20)); ordem.push(`fim-${tarefa.identificador}`); return tarefa.identificador; });
  assert.ok(resultado.intervalos.find(item=>item.identificador==='a').fim >= resultado.intervalos.find(item=>item.identificador==='b').inicio);
  assert.ok(ordem.indexOf('inicio-c') > ordem.indexOf('fim-a'));
});
