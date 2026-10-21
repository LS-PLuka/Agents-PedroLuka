const DEFINICOES = {
  interface: ['frontend-engineer'],
  backend: ['backend-engineer', 'qa-engineer', 'technical-reviewer', 'personal-standards-auditor'],
  completa: ['backend-engineer', 'frontend-engineer', 'qa-engineer', 'technical-reviewer', 'personal-standards-auditor', 'documentation-specialist'],
  ambiente: ['environment-engineer', 'qa-engineer'],
  auditoria: ['personal-standards-auditor'],
  documentacao: ['documentation-specialist']
};

function contem(texto, expressoes) { return expressoes.some(expressao => texto.includes(expressao)); }

export function selecionarPapeis(pedido) {
  const texto = pedido.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (contem(texto, ['erro de digitacao', 'corrija o readme', 'ajuste o readme', 'typo'])) {
    return { cenario: 'documentacao', papeis: DEFINICOES.documentacao, justificativa: 'Correção documental pequena; edição e conferência proporcionais.' };
  }
  if (contem(texto, ['segue meu padrao', 'meu padrão', 'audite o padrao', 'auditoria do padrao'])) {
    return { cenario: 'auditoria', papeis: DEFINICOES.auditoria, justificativa: 'Pedido explícito de auditoria do padrão pessoal.' };
  }
  if (contem(texto, ['docker', 'nao inicia', 'não inicia', 'variavel de ambiente', 'configuracao do ambiente', 'build'])) {
    return { cenario: 'ambiente', papeis: DEFINICOES.ambiente, justificativa: 'A falha envolve inicialização, build ou configuração do ambiente.' };
  }
  const temInterface = contem(texto, ['tela', 'interface', 'componente', 'responsiv', 'espacamento', 'espaçamento', 'transicao', 'transição', 'ux', 'frontend']);
  const temBackend = contem(texto, ['api', 'endpoint', 'regra de negocio', 'regra de negócio', 'persist', 'banco', 'evento', 'backend', 'operacao', 'operação']);
  if (temInterface && (temBackend || contem(texto, ['historico', 'histórico', 'paginacao', 'paginação', 'filtro']))) {
    return { cenario: 'completa', papeis: DEFINICOES.completa, justificativa: 'A funcionalidade combina interface e contrato de serviço; as dependências devem ser alinhadas antes da implementação.' };
  }
  if (temInterface) return { cenario: 'interface', papeis: DEFINICOES.interface, justificativa: 'O pedido afeta composição visual, estados ou interação da interface.' };
  if (temBackend) return { cenario: 'backend', papeis: DEFINICOES.backend, justificativa: 'O pedido altera comportamento de servidor ou contrato e exige verificação proporcional.' };
  if (contem(texto, ['bug', 'erro', 'falha', 'corrija'])) {
    return { cenario: 'backend', papeis: DEFINICOES.backend, justificativa: 'A correção requer investigação compartilhada, implementação e verificação do comportamento afetado.' };
  }
  return { cenario: 'geral', papeis: ['backend-engineer', 'qa-engineer'], justificativa: 'O pedido envolve implementação, mas não contém sinais suficientes para especialização adicional.' };
}
