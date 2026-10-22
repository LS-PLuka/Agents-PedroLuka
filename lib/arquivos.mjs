import * as arquivos from 'node:fs/promises';
import * as caminhos from 'node:path';
import { createHash as criarHash, randomUUID as criarUuid } from 'node:crypto';

const DIRETORIOS_EXCLUIDOS = new Set(['.git', 'node_modules', '.equipe-execucoes', '.equipe']);
export function resumo(conteudo) { return criarHash('sha256').update(conteudo).digest('hex'); }
export function identidadeAusente() { return 'ausente'; }
export function serializar(valor) { return JSON.stringify(valor, null, 2) + '\n'; }
export function validarRelativo(relativo) {
  if (typeof relativo !== 'string' || !relativo || relativo.includes('\\') || relativo.includes(':') || caminhos.posix.isAbsolute(relativo) || relativo.split('/').some(parte => !parte || parte === '..' || parte === '.' || parte.toLowerCase() === '.git')) throw new Error(`Caminho relativo recusado: ${relativo}`);
  return relativo;
}
export function normalizarRelativo(relativo) { return validarRelativo(relativo).toLocaleLowerCase('en-US'); }
export async function resolverSeguro(raiz, relativo) {
  validarRelativo(relativo); const absoluta = caminhos.resolve(raiz); let atual = absoluta;
  for (const parte of relativo.split('/')) { atual = caminhos.join(atual, parte); try { if ((await arquivos.lstat(atual)).isSymbolicLink()) throw new Error(`Link simbólico recusado: ${atual}`); } catch (erro) { if (erro.code !== 'ENOENT') throw erro; } }
  const resolvido = caminhos.resolve(atual); if (!resolvido.startsWith(`${absoluta}${caminhos.sep}`) && resolvido !== absoluta) throw new Error(`Destino fora da raiz recusado: ${relativo}`); return resolvido;
}
export async function lerOpcional(caminho) { try { return await arquivos.readFile(caminho); } catch (erro) { if (erro.code === 'ENOENT') return null; throw erro; } }
export async function lerJson(caminho) { return JSON.parse(await arquivos.readFile(caminho, 'utf8')); }
export async function gravar(caminho, conteudo) { await arquivos.mkdir(caminhos.dirname(caminho), { recursive: true }); const temporario = `${caminho}.equipe-${criarUuid()}.tmp`; try { await arquivos.writeFile(temporario, conteudo); await arquivos.rename(temporario, caminho); } finally { await arquivos.rm(temporario, { force: true }).catch(() => {}); } }
export async function gravarJson(caminho, valor) { await gravar(caminho, serializar(valor)); }
export async function listar(raiz, prefixo = '', opcoes = {}) {
  const saida = []; for (const entrada of await arquivos.readdir(raiz, { withFileTypes: true })) { const relativo = prefixo ? `${prefixo}/${entrada.name}` : entrada.name;
    if (entrada.isSymbolicLink()) { if (opcoes.incluir?.has(relativo)) throw new Error(`Link simbólico incluído recusado: ${relativo}`); continue; }
    if (entrada.isDirectory()) { if (DIRETORIOS_EXCLUIDOS.has(entrada.name) || arquivoSensivel(relativo)) continue; saida.push(...await listar(caminhos.join(raiz, entrada.name), relativo, opcoes)); } else if (entrada.isFile()) saida.push(relativo); }
  return saida.sort();
}
export async function comTrava(raiz, operacao) { const caminho = await resolverSeguro(raiz, '.equipe/trava'); await arquivos.mkdir(caminhos.dirname(caminho), { recursive: true }); let trava; try { trava = await arquivos.open(caminho, 'wx'); } catch (erro) { if (erro.code === 'EEXIST') throw new Error('Existe uma operação local em andamento. Verifique .equipe/trava antes de retomar.'); throw erro; } try { return await operacao(); } finally { await trava.close(); await arquivos.unlink(caminho).catch(() => {}); } }
export function arquivoSensivel(relativo) { return relativo.split('/').some(parte => /^(\.git|\.aws|\.ssh|node_modules|\.equipe-execucoes)$/i.test(parte)) || /(^|\/)(\.env($|\.(?!example$|exemplo$))|credentials|auth\.json|secrets?\b)/i.test(relativo) || /\.(pem|key|p12|pfx)$/i.test(relativo); }
