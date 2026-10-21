export function filtrarPedidosPorStatus(pedidos, status) {
  return status ? pedidos.filter(pedido => pedido.status === status) : [...pedidos];
}
export function paginarPedidos(pedidos, pagina, tamanhoPagina) {
  if (!Number.isInteger(pagina) || pagina < 0) throw new Error('A página deve ser um inteiro não negativo.');
  if (!Number.isInteger(tamanhoPagina) || tamanhoPagina <= 0) throw new Error('O tamanho da página deve ser positivo.');
  return pedidos.slice(pagina * tamanhoPagina, (pagina + 1) * tamanhoPagina);
}
