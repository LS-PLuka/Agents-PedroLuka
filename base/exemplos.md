# Accepted examples

`buscarPedidoPorId`, `identificador`, and `ExcecaoPedidoNaoEncontrado` are authored PT-BR names. `findById`, `UUID`, `useState`, `onClick`, and `RuntimeException` remain when an API or platform defines them.

Useful comment: `// O índice único cobre a corrida entre consumidores após a consulta inicial.` Avoid `// Busca o pedido`, which merely repeats the code.

A rejected operation test should assert the error and absence of persistence or publication. An integration claim should exercise the actual boundary.
