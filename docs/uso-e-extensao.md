# Uso, manutenção e extensão

## Adicionar uma skill

Crie `base/skills/<nome>/SKILL.md` com `name` e `description` em inglês. Descreva quando usar, resultado esperado, decisões não óbvias, limites e evidências. Relacione a skill aos papéis pertinentes em `base/papeis.json`. A próxima instalação gera as cópias nativas.

## Adicionar um papel

Uma evolução da equipe exige uma alteração própria dos padrões. Adicione o identificador ao catálogo, crie `base/papeis/<identificador>.md`, defina gatilhos, exclusões, leituras, skills, limites e entrega, e ajuste contratos e avaliações. A versão inicial permanece exatamente com oito papéis.

## Adicionar um perfil

Crie um arquivo curto em `base/perfis` que traduza o núcleo para a stack: linguagem dos identificadores, APIs obrigatórias, convenções idiomáticas, comandos e riscos. Em repositórios mistos, associe o perfil ao caminho do subprojeto em `.equipe/configuracao.json`.

## Falhas e retomada

Cada etapa grava tarefa, resultado e integração em `.equipe-execucoes`. Resultado ausente, inválido, parcial ou bloqueado não vira conclusão. Uma integração já registrada não deve ser aplicada de novo. Se o arquivo alvo mudou, preserve-o e resolva o conflito antes de retomar.

Se um executor estiver indisponível, o modo individual falha de forma explícita. No modo conjunto, a alternativa só é usada quando `permitirAlternativa` estiver habilitado. Credenciais pertencem aos produtos e nunca ao pacote compartilhado.
