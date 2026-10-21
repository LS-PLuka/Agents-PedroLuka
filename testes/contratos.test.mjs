import test from 'node:test';
import assert from 'node:assert/strict';
import { validarResultado, validarTarefa } from '../lib/contratos.mjs';

function tarefaValida() {
  return { identificador:'t-1', objetivo:'Implementar', papel:'backend-engineer', projeto:'projeto', versaoPadroes:'0.1.0', perfil:'java', snapshotBase:{identificador:'abc',arquivos:{}}, escopoEscrita:[], documentosObrigatorios:[], skills:[], dependencias:[], criteriosAceite:[], limites:{} };
}
function resultadoValido() {
  return { estado:'concluido', papel:'backend-engineer', executor:'codex', versaoPadroes:'0.1.0', snapshotBase:'abc', arquivosAlterados:[], achados:[], evidencias:[], verificacoesExecutadas:[], verificacoesPendentes:[], pendencias:[] };
}
test('aceita contratos completos', () => assert.equal(validarResultado(resultadoValido(), validarTarefa(tarefaValida())).estado, 'concluido'));
test('recusa snapshot desatualizado', () => {
  const resultado = resultadoValido(); resultado.snapshotBase = 'outro';
  assert.throws(() => validarResultado(resultado, tarefaValida()), /snapshot/);
});
