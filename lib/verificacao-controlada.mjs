import { spawn as iniciarProcesso } from 'node:child_process';
import { diretorioRelativoSeguro } from './perfis.mjs';

const PROCEDIMENTOS = {
  'node-test': { executavel: process.execPath, argumentos: ['--test'], diretorio: '.', duracaoMs: 120000, esperado: 0 },
  'node-sintaxe': { executavel: process.execPath, argumentos: ['--check'], diretorio: '.', duracaoMs: 30000, esperado: 0 }
};

export function catalogoVerificacao(perfil) {
  if (perfil === 'javascript') return ['node-test', 'node-sintaxe'];
  if (perfil === 'java') return [];
  return [];
}

export async function executarVerificacao({ identificador, projeto, arquivo, ambiente = {} }) {
  const base = PROCEDIMENTOS[identificador];
  if (!base) return { estado: 'pendente', identificador, motivo: 'Procedimento não permitido ou desconhecido.' };
  const argumentos = [...base.argumentos];
  if (identificador === 'node-test') argumentos.push(arquivo ?? 'testes/*.test.mjs');
  if (identificador === 'node-sintaxe') { if (!arquivo) return { estado: 'pendente', identificador, motivo: 'Arquivo obrigatório não informado.' }; argumentos.push(arquivo); }
  const diretorio = diretorioRelativoSeguro(projeto, base.diretorio);
  const inicio = Date.now();
  return await new Promise(resolver => {
    let saida='', erro='', excedeu=false;
    const processo = iniciarProcesso(base.executavel, argumentos, { cwd: diretorio, shell: false, windowsHide: true, env: { PATH: process.env.PATH, ...ambiente } });
    const temporizador = setTimeout(() => { excedeu=true; processo.kill(); }, base.duracaoMs);
    processo.stdout.on('data', dado => { saida += dado; }); processo.stderr.on('data', dado => { erro += dado; });
    processo.on('error', falha => { clearTimeout(temporizador); resolver({ estado:'falhou', identificador, diretorio, motivo:falha.message, duracaoMs:Date.now()-inicio }); });
    processo.on('close', codigo => { clearTimeout(temporizador); resolver({ estado: !excedeu && codigo===base.esperado ? 'aprovado':'falhou', identificador, diretorio, codigo, duracaoMs:Date.now()-inicio, saida:saida.slice(-4000), erro:erro.slice(-4000), motivo:excedeu?'Tempo excedido.':undefined }); });
  });
}
