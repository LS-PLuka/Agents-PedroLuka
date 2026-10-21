import java.util.Map;
import java.util.UUID;

public final class ServicoPedidos {
    private final Map<UUID, Pedido> pedidos;
    public ServicoPedidos(Map<UUID, Pedido> pedidos) { this.pedidos = Map.copyOf(pedidos); }
    public Pedido buscarPedidoPorId(UUID identificador) {
        Pedido pedido = pedidos.get(identificador);
        if (pedido == null) throw new ExcecaoPedidoNaoEncontrado(identificador);
        return pedido;
    }
}
final class ExcecaoPedidoNaoEncontrado extends RuntimeException {
    ExcecaoPedidoNaoEncontrado(UUID identificador) { super("Pedido não encontrado: " + identificador); }
}

