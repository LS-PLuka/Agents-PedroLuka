export async function agendar(tarefas, limite = 1, executar) {
  if (!Number.isInteger(limite) || limite < 1) throw new Error('concorrencia deve ser um inteiro positivo.');
  const pendentes = new Map(tarefas.map(tarefa => [tarefa.identificador, tarefa])); const concluidas = new Map(); const ativas = new Map(); const intervalos=[];
  while (pendentes.size || ativas.size) {
    for (const [id,tarefa] of pendentes) {
      if (ativas.size >= limite) break;
      if (!tarefa.dependencias.every(dependencia => concluidas.has(dependencia))) continue;
      const ocupada = [...ativas.values()].some(ativa => ativa.escopos.some(escopo => tarefa.escopos.some(outro => escopo === '**' || outro === '**' || escopo === outro)));
      if (ocupada) continue;
      pendentes.delete(id); const inicio=Date.now();
      const promessa=Promise.resolve(executar(tarefa)).then(resultado => { concluidas.set(id,resultado); intervalos.push({identificador:id,inicio,fim:Date.now()}); return resultado; });
      ativas.set(id,{promessa,escopos:tarefa.escopos}); promessa.finally(() => ativas.delete(id));
    }
    if (!ativas.size && pendentes.size) throw new Error('Dependências ou escopos impedem o agendamento.');
    await Promise.race([...ativas.values()].map(item => item.promessa));
  }
  return { resultados:[...concluidas.entries()].map(([identificador,resultado]) => ({identificador,resultado})), intervalos };
}
