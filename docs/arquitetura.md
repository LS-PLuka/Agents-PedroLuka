# Arquitetura

## Objetivo e escopo

A solução mantém uma fonte canônica em `base/`. O instalador gera formatos nativos para cada produto e registra cada arquivo gerenciado. O coordenador local é opcional; os modos individuais continuam úteis sem a outra ferramenta.

```text
pedido natural
  -> coordinator
  -> seleção proporcional
  -> snapshot por hash
  -> executor em cópia comum isolada
  -> resultado estruturado
  -> comparação da base atual
  -> integração por arquivo
  -> verificação do estado combinado
```

## Componentes

- `base/`: políticas, regras rastreáveis, oito contratos, skills, perfis e exemplos.
- `lib/instalacao.mjs`: instalação, atualização, diagnóstico, retorno e remoção.
- `lib/coordenacao.mjs`: seleção, dependências, execução sequencial e relatórios.
- `lib/executores.mjs`: adaptadores de saída estruturada para Codex e Claude Code.
- `lib/snapshots.mjs`: cópia segura, identidade de conteúdo e integração otimista.
- `.equipe/` no projeto adotado: padrões fixados, runtime e manifesto.
- `.codex/agents` e `.claude/agents`: sete especialistas; a sessão principal é o coordenador.

## Contrato de execução

Os campos próprios usam PT-BR. Uma tarefa registra identificador, objetivo, papel, projeto, versão dos padrões, perfil, snapshot, escopo, documentos, skills, dependências, critérios e limites. Um resultado registra estado, papel, executor, snapshot, arquivos, achados, evidências, verificações e pendências.

JSON válido não comprova comportamento. O coordenador valida o envelope, confere o snapshot e executa verificações separadas.

## Decisões

- Um núcleo canônico evita políticas divergentes entre produtos.
- Escrita sequencial é o padrão seguro; cópias isoladas permitem paralelismo futuro com propriedade explícita.
- Integração usa comparação de conteúdo e interrompe em conflito.
- Preferências de executor ficam em configuração local.
- A política de Git combina instruções, regras/negações nativas e execução programática restrita. Os limites reais estão documentados na matriz de compatibilidade.
- Perfis especializam o núcleo. Para adicionar outro, crie `base/perfis/<nome>.md` com convenções, comandos e exceções da stack; não repita as políticas comuns.
