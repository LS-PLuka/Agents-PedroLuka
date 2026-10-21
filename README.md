# Equipe de IA portátil do Pedro Luka

Este repositório instala uma base versionada de padrões, oito papéis de engenharia, skills reutilizáveis e adaptadores para Codex e Claude Code. O uso diário começa com um pedido natural. A sessão principal coordena o trabalho e aciona somente as responsabilidades que contribuam para o resultado.

A implementação não executa comandos Git ou operações no GitHub. Instalação, atualização, isolamento e integração usam arquivos comuns e hashes SHA-256.

## Equipe

| Papel | Responsabilidade |
|---|---|
| `coordinator` | Entende o pedido, seleciona responsáveis, organiza dependências e integra a entrega. |
| `frontend-engineer` | Implementa interface, UX, componentes, estados, responsividade e consumo de APIs. |
| `backend-engineer` | Implementa regras, contratos, persistência e integrações. |
| `technical-reviewer` | Revisa uma versão concreta por correção, regressão e compatibilidade. |
| `personal-standards-auditor` | Confere nomenclatura, estrutura, documentação e comentários pelas regras rastreáveis. |
| `qa-engineer` | Seleciona e executa verificações unitárias, integradas, contratuais e de interface. |
| `documentation-specialist` | Mantém README, guias, contratos, ADRs e explicações estratégicas. |
| `environment-engineer` | Cuida de configuração, Docker, build, inicialização e ambiente de testes. |

## Requisitos

- Windows, Linux ou macOS com Node.js 22 ou superior.
- Codex ou Claude Code para os modos individuais.
- Ambos somente para o modo conjunto.
- Um projeto novo ou existente no qual você queira instalar a equipe.

As versões verificadas neste ambiente foram Codex CLI `0.163.0-alpha.10.2` e Claude Code `2.1.285`. Consulte [a matriz de compatibilidade](docs/compatibilidade.md) antes de assumir o mesmo comportamento em outra versão.

## Instalação em um projeto

Na raiz deste repositório:

```powershell
node .\equipe.mjs instalar --projeto C:\caminho\do\projeto
```

Resultado esperado: `estado: instalado`, além de `AGENTS.md` e `CLAUDE.md` com um bloco gerenciado, sete especialistas nativos em `.codex/agents` e `.claude/agents`, skills nos diretórios nativos e a base canônica em `.equipe/base`.

A instalação preserva o conteúdo que já existe fora do bloco gerenciado. Uma segunda execução da mesma versão retorna `inalterado`.

Copie a configuração de exemplo quando desejar personalizar executores:

```powershell
Copy-Item .equipe\configuracao.exemplo.json .equipe\configuracao.json
```

## Uso cotidiano

Abra Codex ou Claude Code no projeto adotado e peça normalmente: “adicione uma operação”, “melhore esta tela” ou “o projeto não inicia no Docker”. Os arquivos de entrada carregam o coordenador e os papéis nativos.

Para inspecionar o roteamento sem chamar um modelo:

```powershell
node .equipe\runtime\equipe.mjs rotear --pedido "Crie uma tela de histórico com filtro e paginação"
```

Modo Codex:

```powershell
node .equipe\runtime\equipe.mjs coordenar --projeto . --modo codex --pedido "Adicione esta regra de negócio"
```

Modo Claude Code:

```powershell
node .equipe\runtime\equipe.mjs coordenar --projeto . --modo claude --pedido "Melhore os estados vazios desta tela"
```

Modo conjunto:

```powershell
node .equipe\runtime\equipe.mjs coordenar --projeto . --modo conjunto --pedido "Crie uma tela de histórico com filtro e paginação"
```

O coordenador cria cópias isoladas sem `.git`, transfere contexto explícito, recebe resultados estruturados e compara o hash atual antes de integrar. Revisores trabalham sobre o estado combinado disponível naquele momento. O relatório fica em `.equipe-execucoes/<identificador>/relatorio.json`.

## Idioma

Instruções destinadas aos modelos ficam em inglês. Código autoral, comentários, descrições de testes, documentação e mensagens para você ficam em PT-BR. Símbolos exigidos por bibliotecas e contratos permanecem intactos: `findById`, `useState`, `onClick`, `RuntimeException`, chaves nativas e campos externos são exemplos legítimos.

## Atualização e retorno

Use uma cópia local da nova versão:

```powershell
node .equipe\runtime\equipe.mjs atualizar --projeto . --origem C:\pacotes\equipe-pedro-0.2.0
```

A atualização para se houver mudança local em arquivo gerenciado. A versão anterior é guardada em `.equipe/versoes`. Para retornar:

```powershell
node .equipe\runtime\equipe.mjs restaurar --projeto . --versao 0.1.0
```

Para diagnosticar ou remover:

```powershell
node .equipe\runtime\equipe.mjs diagnosticar --projeto .
node .equipe\runtime\equipe.mjs remover --projeto .
```

A remoção apaga apenas arquivos gerenciados sem alterações e retira o bloco da equipe dos arquivos de entrada.

## Verificação

```powershell
npm test
npm run verificar
```

Os testes cobrem roteamento proporcional, contratos, conflito por snapshot desatualizado, instalação repetida, preservação de conteúdo e alteração local detectada. Veja [as evidências e limitações](docs/validacao.md), [a arquitetura](docs/arquitetura.md) e [as fontes](docs/fontes.md).
