import test from 'node:test';
import assert from 'node:assert/strict';
import * as arquivos from 'node:fs/promises';
import * as caminhos from 'node:path';
import * as sistema from 'node:os';
import { criarSnapshot, integrarResultado } from '../lib/snapshots.mjs';

test('integra base estável e recusa base alterada', async () => {
  const pasta = await arquivos.mkdtemp(caminhos.join(sistema.tmpdir(), 'equipe-integracao-'));
  try {
    const alvo = caminhos.join(pasta, 'exemplo.txt');
    await arquivos.writeFile(alvo, 'base');
    const snapshot = await criarSnapshot(pasta);
    let resultado = { arquivosAlterados:[{caminho:'exemplo.txt',conteudo:'agente',resumoBase:snapshot.arquivos['exemplo.txt']}] };
    assert.equal((await integrarResultado(pasta, {snapshotBase:snapshot}, resultado)).integrado, true);
    await arquivos.writeFile(alvo, 'nova base');
    const segundo = await criarSnapshot(pasta);
    await arquivos.writeFile(alvo, 'edição do usuário');
    resultado = { arquivosAlterados:[{caminho:'exemplo.txt',conteudo:'outro agente',resumoBase:segundo.arquivos['exemplo.txt']}] };
    assert.deepEqual((await integrarResultado(pasta, {snapshotBase:segundo}, resultado)).conflitos, ['exemplo.txt']);
    assert.equal(await arquivos.readFile(alvo, 'utf8'), 'edição do usuário');
  } finally { await arquivos.rm(pasta, {recursive:true,force:true}); }
});
