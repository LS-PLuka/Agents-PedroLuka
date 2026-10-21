# Validação

Este documento separa evidência estática, testes locais, simulação e chamadas reais.

## Cenários automatizados

`npm test` verifica:

- seleção proporcional a partir dos seis pedidos em PT-BR;
- rejeição de resultado com snapshot desatualizado;
- integração quando a base permanece igual;
- preservação de edição concorrente;
- instalação repetida sem duplicação;
- detecção de personalização em arquivo gerenciado;
- remoção sem apagar conteúdo local;
- comportamento JavaScript representativo em PT-BR.

`npm run verificar` confere os oito papéis, contratos, skills essenciais, dois perfis e ausência de uma invocação direta de `git` ou `gh` no adaptador.

## Evidência de referências

Os quatro repositórios foram inspecionados estaticamente. Seus builds e testes não foram executados. O LinkedIn público não abriu no acesso disponível; os textos fornecidos pelo usuário nesta conversa foram usados como referência parcial.

## Limites

A presença de regras ou hooks não prova controle sobre processos internos não expostos pelo produto. O modo programático reduz ferramentas e usa cópias sem metadados Git, mas essa propriedade deve ser reconfirmada quando a versão do Codex ou Claude Code mudar.

Uma simulação de executor não é integração real. Registre aqui chamadas reais somente depois de executá-las, com versão, entrada, saída e resultado integrado.

## Resultado local em 21 de outubro de 2026

- Node.js: `v24.18.0`.
- Testes JavaScript e do runtime: 14 aprovados antes do cenário de retorno; a execução final inclui também atualização e restauração local.
- Verificador estrutural: 27 de 27 critérios aprovados.
- Sintaxe dos arquivos `.mjs`: verificada com `node --check`.
- Exemplo Java: a tentativa de iniciar `javac` não retornou nem mesmo para `javac -version` e foi interrompida; o exemplo permanece com suporte estrutural, sem alegação de compilação.
- Chamadas reais aos modelos e transferência Codex/Claude Code: não executadas nesta validação para não consumir os limites já esgotados durante a implementação. O caminho programático e os contratos foram implementados, mas esse critério continua pendente.
