const normalizar = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const possui = (texto,palavras) => palavras.some(palavra => new RegExp(`(^|[^a-z])${palavra}([^a-z]|$)`,'u').test(texto));
export function selecionarPapeis(pedido) {
  const texto=normalizar(pedido), somenteLeitura=possui(texto,['sem alterar arquivos','somente leitura','apenas revisar']), semBackend=possui(texto,['sem alterar o backend','sem mexer no backend','apenas a api existente']);
  let cenario='geral',papeis=['backend-engineer','qa-engineer'],justificativa='Pedido de implementação sem especialização suficiente.';
  if(possui(texto,['readme','documentacao'])) { cenario='documentacao'; papeis=['documentation-specialist']; justificativa='Pedido documental explícito.'; }
  else if(possui(texto,['revise','revisao','procure bugs'])) { cenario='revisao'; papeis=['technical-reviewer']; justificativa='Revisão começa sem escrita.'; }
  else if(possui(texto,['meu padrao','meus padroes','segue meus padroes','auditoria'])) { cenario='auditoria'; papeis=['personal-standards-auditor']; justificativa='Auditoria explícita de padrões.'; }
  else if(possui(texto,['teste','testes unitarios','testes de integracao'])) { cenario='testes'; papeis=['qa-engineer']; justificativa='Pedido limitado a testes.'; }
  else if(possui(texto,['docker','nao inicia','variavel de ambiente','build'])) { cenario='ambiente'; papeis=['environment-engineer','qa-engineer']; justificativa='Falha de ambiente ou inicialização.'; }
  else if(possui(texto,['tela','interface','componente','frontend','ux','responsiv'])) { cenario='interface'; papeis=['frontend-engineer']; justificativa=semBackend?'Interface usando contrato existente; backend excluído.':'Interface; contrato existente deve ser inspecionado antes de envolver backend.'; }
  else if(possui(texto,['api','endpoint','regra de negocio','persistencia','banco','evento','backend'])) { cenario='backend'; papeis=['backend-engineer','qa-engineer','technical-reviewer','personal-standards-auditor']; justificativa='Comportamento de serviço ou contrato.'; }
  if(somenteLeitura) papeis=papeis.filter(p=>['technical-reviewer','personal-standards-auditor'].includes(p));
  return {cenario,papeis,restricoes:{somenteLeitura,semBackend},justificativa};
}
