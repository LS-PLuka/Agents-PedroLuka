import * as arquivos from 'node:fs/promises';
import * as caminhos from 'node:path';
import { createHash as criarHash } from 'node:crypto';

export function resumo(conteudo) {
  return criarHash('sha256').update(conteudo).digest('hex');
}

export function serializar(valor) {
  return JSON.stringify(valor, null, 2) + '\n';
}

export function validarRelativo(relativo) {
  if (typeof relativo !== 'string' || !relativo || relativo.includes('\\') || relativo.includes(':') || caminhos.posix.isAbsolute(relativo)
      || relativo.split('/').some(parte => !parte || parte === '..' || parte === '.' || parte.toLowerCase() === '.git')) {
    throw new Error(`Caminho relativo recusado: ${relativo}`);
  }
  return relativo;
}

export async function resolverSeguro(raiz, relativo) {
  validarRelativo(relativo);
  const absoluta = caminhos.resolve(raiz);
  let atual = absoluta;
  for (const parte of relativo.split('/')) {
    atual = caminhos.join(atual, parte);
    try {
      const informacao = await arquivos.lstat(atual);
      if (informacao.isSymbolicLink()) throw new Error(`Link simbólico recusado: ${atual}`);
    } catch (erro) { if (erro.code !== 'ENOENT') throw erro; }
  }
  return atual;
}

export async function lerOpcional(caminho) {
  try { return await arquivos.readFile(caminho); }
  catch (erro) { if (erro.code === 'ENOENT') return null; throw erro; }
}

export async function lerJson(caminho) {
  return JSON.parse(await arquivos.readFile(caminho, 'utf8'));
}

export async function gravar(caminho, conteudo) {
  await arquivos.mkdir(caminhos.dirname(caminho), { recursive: true });
  await arquivos.writeFile(caminho, conteudo);
}

export async function gravarJson(caminho, valor) {
  await gravar(caminho, serializar(valor));
}

export async function listar(raiz, prefixo = '') {
  const saida = [];
  for (const entrada of await arquivos.readdir(raiz, { withFileTypes: true })) {
    if (entrada.name === '.git') continue;
    if (entrada.isSymbolicLink()) throw new Error(`Link simbólico recusado: ${entrada.name}`);
    const relativo = prefixo ? `${prefixo}/${entrada.name}` : entrada.name;
    if (entrada.isDirectory()) saida.push(...await listar(caminhos.join(raiz, entrada.name), relativo));
    else if (entrada.isFile()) saida.push(relativo);
  }
  return saida.sort();
}

export async function comTrava(raiz, operacao) {
  const caminho = await resolverSeguro(raiz, '.equipe/trava');
  await arquivos.mkdir(caminhos.dirname(caminho), { recursive: true });
  let trava;
  try { trava = await arquivos.open(caminho, 'wx'); }
  catch (erro) { if (erro.code === 'EEXIST') throw new Error('Existe uma operação local em andamento. Verifique .equipe/trava antes de retomar.'); throw erro; }
  try { return await operacao(); }
  finally { await trava.close(); await arquivos.unlink(caminho); }
}

export function arquivoSensivel(relativo) {
  return relativo.split('/').some(parte => /^(\.git|\.aws|\.ssh|node_modules|\.equipe-execucoes)$/i.test(parte))
    || /(^|\/)(\.env($|\.(?!example$|exemplo$))|credentials|auth\.json|secrets?\b)/i.test(relativo)
    || /\.(pem|key|p12|pfx)$/i.test(relativo);
}
