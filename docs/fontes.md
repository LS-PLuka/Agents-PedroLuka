# Fontes e decisões do padrão pessoal

Esta base usa a versão 2.0 do briefing como especificação principal. Os repositórios mostram práticas já utilizadas por Pedro e ajudam a fundamentar as regras; suas instruções antigas não substituem as decisões atuais de idioma, Git, escopo e autorização.

A consulta foi estática, por acesso de leitura, em 21 de outubro de 2026. Foram lidos 43 arquivos completos dos três serviços e quatro documentos do repositório principal. Não foram executados builds, testes, containers ou comandos Git dos projetos de referência. A presença de testes e de uma configuração de CI não comprova que eles passaram.

## Origem e alcance

| Identificador | Fonte e versão examinada | Conteúdo efetivamente consultado |
|---|---|---|
| briefing-v2 | Arquivo fornecido pelo usuário: `C:\Users\pedro.lago\Downloads\prompt-implementacao-equipe-ia (2).txt` | Especificação principal de implementação, oito papéis, três modos, idioma, Git, instalação, atualização e critérios de aceite. A autorização local também foi confirmada pelo usuário na conversa. |
| antifraud-system | [Repositório principal na versão examinada](https://github.com/LS-PLuka/antifraud-system/tree/b6b4398c4be12b788924a2e33e1a516cd2079835) | README, testes manuais, ADR 005 e AGENTS, lidos pelo coordenador. É a referência principal de documentação. |
| servico-transacao | [Serviço transacional na versão examinada](https://github.com/LS-PLuka/servico-transacao/tree/86e8c0b954e955aad56ab3d8176d04232b28627b) | Instruções, produção, testes unitários e de integração, POM, Dockerfile, propriedades e CI. |
| motor-risco | [Motor de risco na versão examinada](https://github.com/LS-PLuka/motor-risco/tree/2b69f24ac2e9ef63d04e22882ba09ebbc8f0aebb) | Instruções, regras e cadeia, contratos RabbitMQ, testes de fronteiras e integração, configuração e CI. |
| servico-auditoria | [Serviço de auditoria na versão examinada](https://github.com/LS-PLuka/servico-auditoria/tree/8cca9d3105e48348f3ad45da200206d8331d149a) | Instruções, persistência idempotente, consulta, relógio injetável, testes, configuração e CI. |
| linkedin-fornecido | [Perfil indicado pelo usuário](https://www.linkedin.com/in/pedroluka-dev/) e texto copiado na conversa | Sobre, experiência, projetos, opinião sobre engenharia de software, formação, certificações e voluntariado. O acesso público ao perfil não foi concluído. Não foram consultados posts adicionais. |

As referências do LinkedIn sustentam a escrita direta, com contexto de negócio, descrição do fluxo e explicação das decisões técnicas. Elas não comprovam o funcionamento de código, datas externas ou resultados de testes. Os trechos fornecidos são a evidência disponível, sem alegação de acesso integral ao perfil.

## O que foi incorporado

| Regra | Evidência concreta | Aplicação na base |
|---|---|---|
| Responsabilidades claras | Controllers delegam aos serviços; regras avaliam condições; publishers encapsulam transporte. | Cada componente precisa ter uma responsabilidade verificável. Não exigir camadas sem necessidade. |
| Contratos explícitos | DTOs locais, conversão JSON por tipo inferido e teste de RabbitMQ com tipos independentes. | Definir payload, significado, erros, compatibilidade e comportamento antes de dividir front e back. |
| Verificação de rejeições | Os testes transacionais verificam que acesso negado não salva nem publica. | Conferir o resultado e a ausência de efeitos proibidos. |
| Fronteiras e tempo | Testes parametrizados de idade/valor e `Clock.fixed` no mapper da auditoria. | Testar abaixo, no limite e acima; controlar o relógio quando o resultado depender dele. |
| Idempotência | Consulta prévia, índice único e tratamento de duplicidade na auditoria. | Repetição e retomada precisam preservar efeitos já aplicados; concorrência exige proteção adicional. |
| Integração real | Testcontainers com PostgreSQL, MongoDB e RabbitMQ; testes `*IT` no Failsafe. | Mock e análise estática não substituem prova de integração. Informar testes pulados. |
| Comentários úteis | Os três AGENTS rejeitam comentários que repetem o código. | Explicar uma decisão, restrição, risco ou razão relevante. |
| Documentação coerente | README principal, testes manuais, ADR e OpenAPI nos serviços. | Documentar problema, fluxo, uso, contratos e decisões em acordo com a implementação. |

As regras completas, sua origem, escopo, verificação e exceções estão em [base/regras.json](../base/regras.json). As instruções ali destinadas aos modelos estão em inglês; este documento e os exemplos autorais permanecem em PT-BR.

## Exemplos para revisão e testes

- [TransacaoServiceTest.java](https://github.com/LS-PLuka/servico-transacao/blob/86e8c0b954e955aad56ab3d8176d04232b28627b/src/test/java/antifraud/servicotransacao/service/TransacaoServiceTest.java): nega operações de ADMIN e de outra conta, verificando que não houve persistência nem publicação.
- [RegraContaNovaTest.java](https://github.com/LS-PLuka/motor-risco/blob/2b69f24ac2e9ef63d04e22882ba09ebbc8f0aebb/src/test/java/antifraud/motorrisco/regras/RegraContaNovaTest.java): testa 29, 30 e 31 dias, combinados com valores abaixo, no limite e acima de 1.000.
- [RabbitMQContratoIT.java](https://github.com/LS-PLuka/motor-risco/blob/2b69f24ac2e9ef63d04e22882ba09ebbc8f0aebb/src/test/java/antifraud/motorrisco/messaging/RabbitMQContratoIT.java): publica um evento, consome o resultado e verifica o contrato sem compartilhar a classe Java do produtor.
- [AuditoriaService.java](https://github.com/LS-PLuka/servico-auditoria/blob/8cca9d3105e48348f3ad45da200206d8331d149a/src/main/java/antifraud/servicoauditoria/service/AuditoriaService.java) e [Auditoria.java](https://github.com/LS-PLuka/servico-auditoria/blob/8cca9d3105e48348f3ad45da200206d8331d149a/src/main/java/antifraud/servicoauditoria/document/Auditoria.java): combinam detecção de repetição com restrição única no banco.
- [AuditoriaMapperTest.java](https://github.com/LS-PLuka/servico-auditoria/blob/8cca9d3105e48348f3ad45da200206d8331d149a/src/test/java/antifraud/servicoauditoria/util/AuditoriaMapperTest.java): usa relógio fixo para conferir o horário persistido.
- [TransacaoFluxoCompletoIT.java](https://github.com/LS-PLuka/servico-transacao/blob/86e8c0b954e955aad56ab3d8176d04232b28627b/src/test/java/antifraud/servicotransacao/integration/TransacaoFluxoCompletoIT.java): passa por registro, login, HTTP, banco, JSON da fila e consulta. Seu alcance é o serviço transacional; ele não comprova os três serviços juntos.

Exemplos novos de comentários, derivados das intenções observadas:

```java
// O índice único cobre a corrida entre consumidores após a consulta inicial.
// A idade usa o instante do evento para manter o resultado estável na reentrega.
// O contrato JSON permite consumir eventos sem carregar a classe Java do produtor.
```

Cada comentário só deve existir junto ao trecho ao qual se aplica. Eles não formam um cabeçalho obrigatório.

## Diferenças preservadas e práticas que não viraram regra global

- O legado mistura nomes como `TransacaoService`, `toResponseDTO`, `requestDTO` e `isAdmin`. A decisão atual exige nomes autorais em PT-BR. `findById`, palavras reservadas e símbolos exigidos por APIs continuam com a grafia necessária. Essa regra não autoriza renomear código preexistente fora do escopo.
- O AGENTS transacional recomenda `git status`. Essa instrução foi descartada para esta solução: nenhum comando Git é automático, inclusive leitura, e a restrição vale também para ferramentas intermediárias e agentes delegados.
- O serviço transacional salva e publica em recursos distintos. Seu comentário sobre rollback não comprova atomicidade PostgreSQL/RabbitMQ. O próprio AGENTS registra o problema de escrita dupla.
- O DTO de entrada descreve `dataHora` como horário da transação, mas o mapper usa o relógio atual e publica o horário de criação. Essa divergência foi registrada, sem alteração na referência.
- A pontuação cumulativa chega a 155 no teste do motor. Não foi adotado um limite fictício de 100.
- O IT do motor usa `disabledWithoutDocker = true`. Um build bem-sucedido pode ter pulado a integração. Os relatórios precisam distinguir essas situações.
- O IT da auditoria verifica repetição sequencial. Ele não demonstra uma corrida entre consumidores; o teste unitário lido não cobre o caminho de `DuplicateKeyException`.
- O relógio injetável aparece na auditoria, mas não é uma prática uniforme nos três serviços. Foi adotado quando necessário para verificação determinística, sem alegar uniformidade no legado.
- `ddl-auto=update` e valores padrão locais de credenciais existem na configuração transacional. Não foram promovidos a padrão de produção.
- Os três Dockerfiles pulam testes ao montar a imagem; os arquivos de CI declaram `mvn -B verify`. Nenhuma dessas definições foi executada nesta análise.
- A porta declarada no motor não prova a existência de uma API HTTP; o serviço e suas dependências são orientados a eventos.
- Chain of Responsibility, a organização por camadas e os nomes de filas são escolhas dos projetos de origem. O núcleo preserva suas intenções, sem impor essas mesmas estruturas a outros ecossistemas.
- Mappers estáticos aparecem no serviço transacional; o mapper da auditoria é um componente porque recebe um relógio. Ambas as escolhas dependem do contexto.

## Inventário completo de leitura

Os caminhos são relativos ao repositório e à versão indicados na primeira tabela. Foram lidos por inteiro os arquivos abaixo. A listagem de uma pasta não foi contada como leitura de seus arquivos.

### antifraud-system — quatro documentos

```text
README.md
docs/testes-manuais.md
docs/adr/005-chain-of-responsibility.md
AGENTS.md
```

A consulta da raiz também confirmou a presença de `docker-compose.yml` e `Makefile`; seus conteúdos não são declarados como lidos nesta evidência.

### Arquivos comuns aos três serviços — quinze arquivos

```text
AGENTS.md
pom.xml
Dockerfile
.github/workflows/ci.yml
src/main/resources/application.properties
```

### servico-transacao — mais dez arquivos

```text
src/main/java/antifraud/servicotransacao/service/TransacaoService.java
src/main/java/antifraud/servicotransacao/controller/TransacaoController.java
src/main/java/antifraud/servicotransacao/dto/transacao/TransacaoRequestDTO.java
src/main/java/antifraud/servicotransacao/messaging/TransacaoPublisher.java
src/main/java/antifraud/servicotransacao/exception/GlobalExceptionHandler.java
src/main/java/antifraud/servicotransacao/util/TransacaoMapper.java
src/test/java/antifraud/servicotransacao/service/TransacaoServiceTest.java
src/test/java/antifraud/servicotransacao/integration/IntegracaoBaseTest.java
src/test/java/antifraud/servicotransacao/integration/TransacaoFluxoCompletoIT.java
src/test/java/antifraud/servicotransacao/integration/TransacaoSegurancaIT.java
```

### motor-risco — mais dez arquivos

```text
src/main/java/antifraud/motorrisco/service/AnalisadorRiscoService.java
src/main/java/antifraud/motorrisco/model/ContextoAnalise.java
src/main/java/antifraud/motorrisco/regras/RegraRisco.java
src/main/java/antifraud/motorrisco/regras/RegraContaNova.java
src/main/java/antifraud/motorrisco/config/RabbitMQConfig.java
src/main/java/antifraud/motorrisco/config/CadeiaRiscoConfig.java
src/test/java/antifraud/motorrisco/regras/RegraContaNovaTest.java
src/test/java/antifraud/motorrisco/messaging/RabbitMQContratoIT.java
src/test/java/antifraud/motorrisco/enums/NivelRiscoTest.java
src/test/java/antifraud/motorrisco/regras/RegraRiscoTest.java
```

### servico-auditoria — mais oito arquivos

```text
src/main/java/antifraud/servicoauditoria/service/AuditoriaService.java
src/main/java/antifraud/servicoauditoria/document/Auditoria.java
src/main/java/antifraud/servicoauditoria/util/AuditoriaMapper.java
src/main/java/antifraud/servicoauditoria/controller/AuditoriaController.java
src/main/java/antifraud/servicoauditoria/config/RelogioConfig.java
src/test/java/antifraud/servicoauditoria/service/AuditoriaServiceTest.java
src/test/java/antifraud/servicoauditoria/integration/RegistroAuditoriaIT.java
src/test/java/antifraud/servicoauditoria/util/AuditoriaMapperTest.java
```

## Lacunas e evolução

Os READMEs dos três serviços não foram lidos nesta amostra; a referência principal de documentação foi o README do `antifraud-system`, acompanhado dos documentos listados. Não houve execução dos projetos nem auditoria integral de segurança ou cobertura.

O material fornecido sustenta backend e documentação, mas não define um design system pessoal de frontend. Novas referências visuais podem ser incorporadas por alteração própria, revisável e versionada. A implementação de uma tarefa não altera automaticamente o padrão global.

Ao adicionar outro perfil, mantenha as intenções em `base/regras.json` e descreva apenas sua tradução para linguagem, framework e tipo de aplicação. Registre evidência nova e exceções concretas; não duplique o núcleo nem transforme uma particularidade Java em obrigação geral.
