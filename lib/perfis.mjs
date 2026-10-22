import * as caminhos from 'node:path';

function normalizar(caminho) {
  if (typeof caminho !== 'string' || !caminho.trim()) throw new Error('Caminho de perfil inválido.');
  const convertido = caminho.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
  if (convertido.split('/').some(parte => !parte || parte === '.' || parte === '..')) throw new Error(`Caminho de perfil inseguro: ${caminho}`);
  return convertido === '.' ? '.' : convertido.toLocaleLowerCase('en-US');
}

export function resolverPerfil(configuracao = {}, escopo = [], perfisConhecidos = ['java', 'javascript']) {
  const mapas = configuracao.perfis;
  if (mapas === undefined) return { perfil: configuracao.perfil ?? 'descoberta', origem: 'padrao' };
  if (!Array.isArray(mapas) || !mapas.length) throw new Error('Configuração perfis inválida: informe uma lista não vazia de caminho e perfil.');
  const vistos = new Map();
  for (const item of mapas) {
    if (!item || typeof item !== 'object' || typeof item.caminho !== 'string' || typeof item.perfil !== 'string') throw new Error('Configuração perfis inválida: cada entrada exige caminho e perfil.');
    const caminho = normalizar(item.caminho), perfil = item.perfil.toLocaleLowerCase('en-US');
    if (!perfisConhecidos.includes(perfil)) throw new Error(`Perfil desconhecido: ${item.perfil}`);
    if (vistos.has(caminho) && vistos.get(caminho) !== perfil) throw new Error(`Configuração perfis conflitante: ${item.caminho}`);
    vistos.set(caminho, perfil);
  }
  const alvos = [...new Set((escopo.length ? escopo : ['.']).map(normalizar))];
  const resolvidos = alvos.map(alvo => {
    const candidatos = [...vistos.entries()].filter(([caminho]) => caminho === '.' || alvo === caminho || alvo.startsWith(`${caminho}/`)).sort((a,b) => b[0].length - a[0].length);
    return candidatos[0]?.[1] ?? 'descoberta';
  });
  const unicos = [...new Set(resolvidos)];
  if (unicos.length !== 1) throw new Error(`Escopo mistura perfis incompatíveis: ${unicos.join(', ')}.`);
  return { perfil: unicos[0], origem: 'mapeamento', alvos };
}

export function diretorioRelativoSeguro(raiz, relativo = '.') {
  const destino = caminhos.resolve(raiz, relativo);
  const base = caminhos.resolve(raiz);
  if (!destino.startsWith(`${base}${caminhos.sep}`) && destino !== base) throw new Error('Diretório de verificação fora do projeto.');
  return destino;
}
