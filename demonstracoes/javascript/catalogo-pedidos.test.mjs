import test from 'node:test';
import assert from 'node:assert/strict';
import { filtrarPedidosPorStatus, paginarPedidos } from './catalogo-pedidos.mjs';
test('filtra pedidos pelo status solicitado', () => assert.deepEqual(filtrarPedidosPorStatus([{status:'PENDENTE'},{status:'CONCLUIDO'}],'PENDENTE'),[{status:'PENDENTE'}]));
test('recusa página negativa', () => assert.throws(() => paginarPedidos([],-1,10),/não negativo/));
