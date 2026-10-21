# Compatibilidade e limites de execução

Consulta documental realizada em 21/10/2026. O coordenador verificou localmente, pela interface de ajuda, **Codex CLI 0.163.0-alpha.10.2** e **Claude Code 2.1.285**. Isso confirma a presença dos executáveis e das opções observadas; não comprova autenticação, execução de tarefas, carregamento de agentes ou ausência de operações internas de Git. Esta pesquisa consultou fontes oficiais e não executou Git nem alterou o GitHub.

## Formatos dos agentes

Os oito papéis da equipe são `coordinator`, `frontend-engineer`, `backend-engineer`, `technical-reviewer`, `personal-standards-auditor`, `qa-engineer`, `documentation-specialist` e `environment-engineer`. O coordenador normalmente é a sessão principal; os outros sete podem ser delegados quando a tarefa justificar.

No Codex, a documentação de subagentes apresenta arquivos TOML independentes em `.codex/agents/`, com `name`, `description` e `developer_instructions` obrigatórios. As permissões, o provedor e os servidores MCP vêm da sessão principal; um arquivo de agente não cria seu próprio sandbox. A referência de configuração ainda documenta `agents.<name>.config_file` e `agents.<name>.description`. Portanto, não tratamos o formato anterior como removido: a descoberta efetiva deve ser verificada na versão instalada. [Subagentes do Codex](https://learn.chatgpt.com/docs/agent-configuration/subagents), [referência de configuração](https://learn.chatgpt.com/docs/config-file/config-reference).

No Claude Code, cada arquivo `.claude/agents/<identificador>.md` usa frontmatter YAML com `name` e `description`, seguido das instruções em Markdown. Entre os campos opcionais estão `tools`, `disallowedTools`, `skills`, `model`, `permissionMode`, `maxTurns` e `hooks`. `skills` carrega o conteúdo completo das skills indicadas. Nomes de campos precisam respeitar a grafia nativa: campos desconhecidos podem ser ignorados. `disallowedTools` filtra ferramentas inteiras; uma entrada como `Bash(git *)` nesse campo remove Bash por completo. Filtros de comandos pertencem a `permissions.deny` nas configurações. [Subagentes do Claude Code](https://code.claude.com/docs/en/sub-agents).

As definições, descrições e instruções para modelos ficam em inglês. Código autoral, comentários, descrições de testes, documentação e entregas para Pedro ficam em PT-BR. Chaves e símbolos exigidos pelas interfaces conservam a grafia original.

## Instruções e skills locais

O Codex descobre `AGENTS.md` em uma cadeia de instruções; `AGENTS.override.md` tem precedência no mesmo nível. Sem raiz de projeto identificada, verifica apenas o diretório atual, além das instruções globais. Por isso, cada cópia de execução deve conter sua entrada de contexto na raiz usada para iniciar o processo. [Descoberta de AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

Skills do Codex usam `.agents/skills/<nome>/SKILL.md`, com `name` e `description` no frontmatter. O catálogo inicial não equivale ao carregamento do corpo: as instruções completas são lidas quando a skill é selecionada. [Skills do Codex](https://learn.chatgpt.com/docs/build-skills).

No Claude Code, skills locais usam `.claude/skills/<nome>/SKILL.md`. Sua descrição ajuda a seleção; o corpo é carregado quando a skill é usada. [Skills do Claude Code](https://code.claude.com/docs/en/skills).

Claude Code passou a aceitar `AGENTS.md` diretamente a partir de 2.1.277, condicionado às configurações e à presença de `CLAUDE.md` ou `CLAUDE.local.md`. Para tornar a entrada explícita, um `CLAUDE.md` pode importar `@AGENTS.md`. Imports relativos são resolvidos a partir do arquivo que os contém. O evento `InstructionsLoaded` observa imports feitos por `CLAUDE.md`, mas não a leitura direta de `AGENTS.md` pelo mecanismo de fallback. [Memória e instruções do Claude Code](https://code.claude.com/docs/en/memory).

O registro de execução deve separar: arquivo disponível, arquivo incluído no pedido, descoberta nativa observada e uso demonstrado. Uma resposta dizendo que seguiu o padrão, isoladamente, não comprova carregamento.

## Execução programática e entrega de artefatos

O modo conjunto pode usar processos separados e um contrato de artefatos. O host fornece tarefa, perfil, regras, contrato, arquivos pertinentes e identificação da base. O modelo devolve dados estruturados; o host valida os caminhos e integra os arquivos. Essa escolha mantém a integração sob controle local e permite verificar o resultado combinado.

Exemplo do conteúdo de uma entrega:

```json
{
  "artefatos": [
    {
      "caminho": "src/exemplo.txt",
      "conteudo": "Conteúdo produzido para o escopo autorizado."
    }
  ]
}
```

A integração deve rejeitar caminhos absolutos, travessia de diretórios, destinos fora do escopo, metadados de Git e alterações concorrentes desde a base. O identificador da entrega evita reaplicação. Nenhum conteúdo retornado pelo modelo deve ser tratado automaticamente como comando. Esses são requisitos do host da equipe, não garantias fornecidas pelo formato JSON.

### Codex CLI

`codex exec` é a interface documentada para execução não interativa. `--skip-git-repo-check` permite diretórios comuns; não promete eliminar operações internas de Git. `--output-schema` recebe o caminho de um JSON Schema. `--json` produz eventos JSONL, e `--output-last-message` permite separar a resposta final. O processo reutiliza a autenticação salva por padrão. [Execução não interativa](https://learn.chatgpt.com/docs/non-interactive-mode).

Para desabilitar ferramentas de execução de comandos, a chave documentada é **`features.shell_tool=false`**. `features.shell_snapshot=false` desativa snapshots de shell. `features.unified_exec=false` não é substituto: a documentação informa que a opção do usuário pode ser ignorada e que a restrição gerenciada ainda deixa execução de comando não retomável disponível. Para um transporte de artefatos, combinar shell desabilitado com sandbox `read-only`, política `approval_policy="never"` e redução explícita de integrações é uma defesa adicional. `never` controla aprovações; não significa que todas as ações estejam proibidas. [Configuração do Codex](https://learn.chatgpt.com/docs/config-file/config-reference).

`--disable shell_tool` corresponde ao override `-c features.shell_tool=false`. `--strict-config`, quando disponível no executável, ajuda a detectar campos desconhecidos. Não foi encontrado um equivalente documentado a `--tools ""` que remova todas as ferramentas do Codex CLI, nem um toggle geral de `apply_patch`. Assim, o modo deve ser descrito como **entrega estruturada com shell desabilitado e sandbox de leitura**, até que o inventário efetivo comprove restrições adicionais. [Referência da CLI](https://learn.chatgpt.com/docs/cli/reference).

`codex mcp-server` e o binário correspondente foram removidos. O app server usa protocolo JSON-RPC próprio, não é substituto direto de um cliente MCP e está documentado como experimental. Esta solução não deve depender do servidor MCP removido. [Remoção do servidor MCP](https://learn.chatgpt.com/docs/mcp-server).

### Claude Code

`claude -p` executa um pedido não interativo. `--output-format json` com `--json-schema` solicita uma saída estruturada, localizada em `structured_output`. O host precisa verificar a presença desse campo e o resultado da execução antes de usar a entrega. [Execução programática](https://code.claude.com/docs/en/headless).

Para transporte de artefatos, `--tools ""` remove as ferramentas nativas; essa opção não controla MCP. `--strict-mcp-config` restringe os servidores às configurações explicitamente fornecidas por `--mcp-config`; um arquivo vazio deve usar a estrutura válida `{"mcpServers":{}}`. `--disallowedTools "mcp__*"` acrescenta a proibição de ferramentas MCP. `--restricted` remove ferramentas de execução, salvo inclusão explícita por `--tools`, limita ferramentas de arquivos e carrega apenas configurações gerenciadas e as fornecidas por `--settings`. Esses controles ainda precisam ser verificados em conjunto na instalação local. [Referência da CLI do Claude Code](https://code.claude.com/docs/en/cli-reference).

`--bare` não é adotado silenciosamente: ele pula descoberta de instruções, skills, agentes, hooks, plugins e MCP, além de não usar credenciais OAuth da assinatura. Quando escolhido, o contexto precisa ser enviado explicitamente e a autenticação compatível precisa estar disponível. O modo normal `-p` também pode carregar hooks e servidores definidos no projeto, sem apresentar o diálogo interativo de confiança. [Comportamento de bare e print](https://code.claude.com/docs/en/headless).

## Política sem Git: controles e limites

A proibição inclui comandos Git de leitura, operações indiretas por scripts ou bibliotecas, metadados locais e mutações remotas de GitHub. Delegação não amplia autorização. Cópias comuns de arquivos e integração por edição local são os mecanismos previstos; os modos que criam worktrees não fazem parte da execução automática.

No Codex, regras `prefix_rule` com decisão `forbidden` são controles adicionais, mas a página oficial descreve regras para comandos fora do sandbox. Elas não comprovam, sozinhas, bloqueio universal de Git. [Regras do Codex](https://learn.chatgpt.com/docs/agent-configuration/rules).

Hooks Codex podem observar e negar ferramentas locais, incluindo shell, `apply_patch` e MCP. Entretanto, hooks locais precisam de confiança sobre a definição atual; hooks pendentes são pulados. Erros, timeouts e respostas inválidas podem deixar a chamada prosseguir. `write_stdin` não repete `PreToolUse`, ferramentas hospedadas não passam pelo mesmo caminho e há exceções de cobertura. Portanto, hooks gerados mas não ativados devem ser registrados como **não ativos**, sem usar opções de bypass. [Hooks do Codex](https://learn.chatgpt.com/docs/hooks).

No Claude Code, `permissions.deny` aceita regras de Bash, PowerShell e MCP. Usar apenas um padrão textual para o executável Git não prova cobertura de bibliotecas, processos indiretos ou tráfego HTTP. Para MCP, uma lista de operações explicitamente verificadas é preferível à suposição de que todo nome começando por `get` seja seguro. [Permissões do Claude Code](https://code.claude.com/docs/en/permissions). No Codex, servidores MCP oferecem `enabled_tools` e `disabled_tools`; esta última é aplicada depois da primeira. [MCP no Codex](https://learn.chatgpt.com/docs/extend/mcp).

Hooks Claude podem negar uma chamada com `permissionDecision: "deny"` em `hookSpecificOutput` de `PreToolUse`, ou com saída 2. O recurso `onFailure: "block"` exige **2.1.295 ou posterior** e não pode ser pressuposto na instalação **2.1.285**. O evento `InstructionsLoaded` serve para observabilidade, não para bloquear carregamento. [Hooks do Claude Code](https://code.claude.com/docs/en/hooks).

Não foi estabelecida uma garantia documental de que iniciar qualquer um dos produtos impeça toda consulta interna a Git. A ausência de ferramentas de shell oferecidas ao modelo não comprova o comportamento interno do executável. Para declarar ausência total de processos Git, seria necessário observar a árvore de processos ou aplicar controles externos adequados. Até lá, os relatórios devem limitar a afirmação às operações controladas e às evidências coletadas.

## Evidência necessária para aceitar uma execução

- Registrar executável, versão, opções efetivas e resultado da inicialização, sem credenciais.
- Guardar a identificação da base, do contexto enviado, do escopo e da entrega.
- Confirmar formato e carregamento dos agentes e skills em cada modo nativo utilizado.
- Validar a saída estruturada antes de gravar arquivos e verificar os destinos permitidos.
- Comparar a base com os arquivos atuais antes da integração e verificar o resultado combinado.
- Distinguir execução real, análise estática, simulação e recursos indisponíveis.
- Registrar controles inativos ou não comprovados, especialmente hooks, integrações herdadas e processos internos dos produtos.

Esta página documenta compatibilidade consultada e limitações conhecidas. A conclusão de testes reais pertence ao relatório de evidências da execução correspondente.
