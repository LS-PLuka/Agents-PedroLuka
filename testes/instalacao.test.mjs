import test from 'node:test';
import assert from 'node:assert/strict';
import * as arquivos from 'node:fs/promises';
import * as caminhos from 'node:path';
import * as sistema from 'node:os';
import { fileURLToPath } from 'node:url';
import { instalar, remover, restaurar } from '../lib/instalacao.mjs';

const raiz = caminhos.dirname(caminhos.dirname(fileURLToPath(import.meta.url)));
test('instala sem duplicar e preserva conteúdo local', async () => {
  const projeto = await arquivos.mkdtemp(caminhos.join(sistema.tmpdir(), 'equipe-instalacao-'));
  try {
    await arquivos.writeFile(caminhos.join(projeto, 'AGENTS.md'), '# Local\n');
    assert.equal((await instalar({projeto,origem:raiz})).estado, 'instalado');
    assert.equal((await instalar({projeto,origem:raiz})).estado, 'inalterado');
    const texto = await arquivos.readFile(caminhos.join(projeto, 'AGENTS.md'),'utf8');
    assert.match(texto, /# Local/); assert.equal((texto.match(/equipe-pedro:inicio/g)??[]).length,1);
    assert.ok(await arquivos.stat(caminhos.join(projeto,'.codex','agents','backend-engineer.toml')));
  } finally { await arquivos.rm(projeto,{recursive:true,force:true}); }
});
test('detecta personalização de arquivo gerenciado', async () => {
  const projeto = await arquivos.mkdtemp(caminhos.join(sistema.tmpdir(), 'equipe-conflito-'));
  try {
    await instalar({projeto,origem:raiz});
    const alvo=caminhos.join(projeto,'.codex','agents','backend-engineer.toml');
    await arquivos.appendFile(alvo,'\n# local\n');
    const saida=await instalar({projeto,origem:raiz,atualizar:true});
    assert.equal(saida.estado,'conflito'); assert.ok(saida.conflitos.includes('.codex/agents/backend-engineer.toml'));
  } finally { await arquivos.rm(projeto,{recursive:true,force:true}); }
});
test('remove gerenciados e conserva texto local', async () => {
  const projeto = await arquivos.mkdtemp(caminhos.join(sistema.tmpdir(), 'equipe-remocao-'));
  try {
    await arquivos.writeFile(caminhos.join(projeto,'CLAUDE.md'),'# Local\n');
    await instalar({projeto,origem:raiz});
    assert.equal((await remover({projeto})).estado,'removido');
    assert.match(await arquivos.readFile(caminhos.join(projeto,'CLAUDE.md'),'utf8'),/# Local/);
  } finally { await arquivos.rm(projeto,{recursive:true,force:true}); }
});

test('atualiza por pacote local e retorna à versão anterior', async () => {
  const projeto = await arquivos.mkdtemp(caminhos.join(sistema.tmpdir(), 'equipe-retorno-'));
  const fonte = await arquivos.mkdtemp(caminhos.join(sistema.tmpdir(), 'equipe-fonte-'));
  try {
    await arquivos.cp(raiz, fonte, { recursive: true });
    await instalar({ projeto, origem: raiz });
    const versaoNova = caminhos.join(fonte, 'versao.json');
    const dados = JSON.parse(await arquivos.readFile(versaoNova, 'utf8'));
    dados.versao = '0.2.0';
    await arquivos.writeFile(versaoNova, JSON.stringify(dados, null, 2) + '\n');
    await arquivos.appendFile(caminhos.join(fonte, 'base', 'politicas.md'), '\nTemporary version marker.\n');
    assert.equal((await instalar({ projeto, origem: fonte, atualizar: true })).estado, 'atualizado');
    assert.equal((await restaurar({ projeto, versao: '0.1.0' })).estado, 'restaurado');
    const manifesto = JSON.parse(await arquivos.readFile(caminhos.join(projeto, '.equipe', 'manifesto.json'), 'utf8'));
    assert.equal(manifesto.versao, '0.1.0');
    assert.doesNotMatch(await arquivos.readFile(caminhos.join(projeto, '.equipe', 'base', 'politicas.md'), 'utf8'), /Temporary version marker/);
  } finally {
    await arquivos.rm(projeto, { recursive: true, force: true });
    await arquivos.rm(fonte, { recursive: true, force: true });
  }
});
