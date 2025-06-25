let chart;

function formatarValor(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcularValores() {
  const renda = parseFloat(document.getElementById('renda').value) || 0;
  const fixos = parseFloat(document.getElementById('fixos').value) || 0;
  const variaveis = parseFloat(document.getElementById('variaveis').value) || 0;
  const meta = parseFloat(document.getElementById('meta').value) || 0;

  const despesas = fixos + variaveis;
  const sobra = renda - despesas - meta;
  const economia = meta;

  document.getElementById('card-renda').innerText = formatarValor(renda);
  document.getElementById('card-despesas').innerText = formatarValor(despesas);
  document.getElementById('card-economia').innerText = formatarValor(economia);
  document.getElementById('card-sobra').innerText = formatarValor(sobra);

  atualizarSaudeFinanceira(renda, despesas, meta);

  return { renda, fixos, variaveis, meta, despesas, sobra, economia };
}

function atualizarSaudeFinanceira(renda, despesas, meta) {
  const percentualGasto = ((despesas + meta) / renda) * 100;
  const barra = document.getElementById("barra-saude");
  const perfil = document.getElementById("perfil-financeiro");

  if (!barra || !perfil || renda === 0) return;

  barra.style.width = `${percentualGasto.toFixed(0)}%`;
  barra.innerText = `${percentualGasto.toFixed(0)}%`;

  if (percentualGasto <= 50) {
    barra.className = "custom-progress bg-success";
    perfil.innerText = "Perfil Financeiro: Econômico";
  } else if (percentualGasto <= 70) {
    barra.className = "custom-progress bg-primary";
    perfil.innerText = "Perfil Financeiro: Equilibrado";
  } else if (percentualGasto <= 90) {
    barra.className = "custom-progress bg-warning text-dark";
    perfil.innerText = "Perfil Financeiro: Atenção";
  } else {
    barra.className = "custom-progress bg-danger";
    perfil.innerText = "Perfil Financeiro: Crítico";
  }
}

function gerarGrafico() {
  document.getElementById("secao-resultados").classList.remove("d-none");

  const { fixos, variaveis, meta, sobra } = calcularValores();

  if (chart) chart.destroy();
  const ctx = document.getElementById('grafico').getContext('2d');
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Gastos Fixos', 'Gastos Variáveis', 'Economia', 'Sobra'],
      datasets: [{
        data: [fixos, variaveis, meta, Math.max(sobra, 0)],
        backgroundColor: ['#FF6384', '#FFCD56', '#36A2EB', '#4CAF50'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { enabled: true },
        datalabels: {
          display: true,
          color: '#000',
          formatter: (value, context) => context.chart.data.labels[context.dataIndex]
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

async function gerarRelatorioPDFCompleto() {
  document.getElementById("secao-resultados").classList.remove("d-none");

  const { renda, fixos, variaveis, meta, despesas, sobra } = calcularValores();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const dataHora = new Date().toLocaleString('pt-BR');
  const percentualGasto = ((despesas + meta) / renda) * 100;
  let perfilFinanceiro = "";
  
  // Determinar perfil financeiro
  if (percentualGasto <= 50) {
    perfilFinanceiro = "Econômico - Excelente controle financeiro!";
  } else if (percentualGasto <= 70) {
    perfilFinanceiro = "Equilibrado - Boa gestão financeira";
  } else if (percentualGasto <= 90) {
    perfilFinanceiro = "Atenção - Precisa de ajustes";
  } else {
    perfilFinanceiro = "Crítico - Necessita reestruturação urgente";
  }

  // CABEÇALHO
  doc.setFillColor(46, 83, 100); // Cor do tema
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO FINANCEIRO COMPLETO", 105, 18, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Barracred - Clínica Financeira", 105, 25, { align: 'center' });
  doc.text(`Gerado em: ${dataHora}`, 105, 31, { align: 'center' });

  // Resetar cor do texto
  doc.setTextColor(0, 0, 0);
  let yPos = 50;

  // SEÇÃO 1: RESUMO EXECUTIVO
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("RESUMO EXECUTIVO", 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Perfil Financeiro: ${perfilFinanceiro}`, 20, yPos);
  yPos += 6;
  doc.text(`Comprometimento da Renda: ${percentualGasto.toFixed(1)}%`, 20, yPos);
  yPos += 6;
  doc.text(`Status da Meta: ${sobra >= 0 ? 'VIÁVEL' : 'INVIÁVEL'}`, 20, yPos);
  yPos += 15;

  // SEÇÃO 2: DADOS FINANCEIROS
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS FINANCEIROS", 20, yPos);
  yPos += 10;

  // Criar tabela de dados
  const dados = [
    ['Renda Mensal', formatarValor(renda)],
    ['Gastos Fixos', formatarValor(fixos)],
    ['Gastos Variáveis', formatarValor(variaveis)],
    ['Meta de Economia', formatarValor(meta)],
    ['Total de Despesas', formatarValor(despesas)],
    ['Sobra/Déficit', formatarValor(sobra)]
  ];

  dados.forEach(([item, valor]) => {
    doc.setFont("helvetica", "normal");
    doc.text(`• ${item}:`, 25, yPos);
    doc.setFont("helvetica", "bold");
    doc.text(valor, 120, yPos);
    yPos += 7;
  });
  yPos += 10;

  // SEÇÃO 3: ANÁLISE DETALHADA
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("ANALISE DETALHADA", 20, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  // Análise de gastos
  const percentualFixos = (fixos / renda) * 100;
  const percentualVariaveis = (variaveis / renda) * 100;
  const percentualEconomia = (meta / renda) * 100;

  doc.text(`Gastos Fixos representam ${percentualFixos.toFixed(1)}% da sua renda`, 25, yPos);
  yPos += 6;
  doc.text(`Gastos Variáveis representam ${percentualVariaveis.toFixed(1)}% da sua renda`, 25, yPos);
  yPos += 6;
  doc.text(`Meta de Economia representa ${percentualEconomia.toFixed(1)}% da sua renda`, 25, yPos);
  yPos += 12;

  // SEÇÃO 4: INDICADORES DE SAÚDE FINANCEIRA
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("INDICADORES DE SAUDE FINANCEIRA", 20, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  // Reserva de emergência recomendada
  const reservaEmergencia = despesas * 6;
  doc.text(`Reserva de Emergência Recomendada: ${formatarValor(reservaEmergencia)}`, 25, yPos);
  yPos += 6;
  doc.text("(Equivalente a 6 meses de despesas)", 25, yPos);
  yPos += 12;

  // Regra 50-30-20
  const ideal50 = renda * 0.5;
  const ideal30 = renda * 0.3;
  const ideal20 = renda * 0.2;

  doc.text("Comparação com a Regra 50-30-20:", 25, yPos);
  yPos += 8;
  doc.text(`• Necessidades (50%): Ideal ${formatarValor(ideal50)} | Atual ${formatarValor(fixos)}`, 30, yPos);
  yPos += 6;
  doc.text(`• Desejos (30%): Ideal ${formatarValor(ideal30)} | Atual ${formatarValor(variaveis)}`, 30, yPos);
  yPos += 6;
  doc.text(`• Poupança (20%): Ideal ${formatarValor(ideal20)} | Atual ${formatarValor(meta)}`, 30, yPos);
  yPos += 15;

  // NOVA PÁGINA PARA RECOMENDAÇÕES
  doc.addPage();
  yPos = 30;

  // SEÇÃO 5: RECOMENDAÇÕES PERSONALIZADAS
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("RECOMENDACOES PERSONALIZADAS", 20, yPos);
  yPos += 15;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  // Recomendações baseadas na situação
  if (sobra < 0) {
    doc.text("SITUACAO CRITICA - ACAO IMEDIATA NECESSARIA", 20, yPos);
    yPos += 10;
    doc.text("1. Revise URGENTEMENTE todos os gastos variáveis", 25, yPos);
    yPos += 6;
    doc.text("2. Considere renda extra ou mudança de emprego", 25, yPos);
    yPos += 6;
    doc.text("3. Renegocie dívidas e contratos", 25, yPos);
    yPos += 6;
    doc.text("4. Elimine gastos supérfluos temporariamente", 25, yPos);
    yPos += 6;
    doc.text(`5. Reduza a meta de economia para ${formatarValor(meta + sobra)}`, 25, yPos);
  } else if (sobra < renda * 0.1) {
    doc.text("MARGEM APERTADA - CUIDADO COM IMPREVISTOS", 20, yPos);
    yPos += 10;
    doc.text("1. Crie uma reserva de emergência pequena primeiro", 25, yPos);
    yPos += 6;
    doc.text("2. Revise gastos variáveis mensalmente", 25, yPos);
    yPos += 6;
    doc.text("3. Considere fontes de renda extra", 25, yPos);
    yPos += 6;
    doc.text("4. Monitore de perto o orçamento", 25, yPos);
  } else {
    doc.text("SITUACAO FAVORAVEL - OPORTUNIDADE DE CRESCIMENTO", 20, yPos);
    yPos += 10;
    doc.text("1. Invista a sobra em aplicações rentáveis", 25, yPos);
    yPos += 6;
    doc.text("2. Considere aumentar a meta de poupança", 25, yPos);
    yPos += 6;
    doc.text("3. Diversifique seus investimentos", 25, yPos);
    yPos += 6;
    doc.text("4. Planeje objetivos de longo prazo", 25, yPos);
  }
  yPos += 15;

  // SEÇÃO 6: PLANO DE AÇÃO
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PLANO DE ACAO - PROXIMOS 90 DIAS", 20, yPos);
  yPos += 15;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  doc.text("PRIMEIROS 30 DIAS:", 25, yPos);
  yPos += 8;
  doc.text("• Anotar todos os gastos diários", 30, yPos);
  yPos += 6;
  doc.text("• Identificar 3 gastos desnecessários para cortar", 30, yPos);
  yPos += 6;
  doc.text("• Abrir conta poupança ou investimento", 30, yPos);
  yPos += 10;

  doc.text("30-60 DIAS:", 25, yPos);
  yPos += 8;
  doc.text("• Renegociar pelo menos 2 contratos (internet, celular, etc.)", 30, yPos);
  yPos += 6;
  doc.text("• Implementar mudanças nos gastos variáveis", 30, yPos);
  yPos += 6;
  doc.text("• Começar reserva de emergência", 30, yPos);
  yPos += 10;

  doc.text("60-90 DIAS:", 25, yPos);
  yPos += 8;
  doc.text("• Avaliar progresso e ajustar metas", 30, yPos);
  yPos += 6;
  doc.text("• Pesquisar melhores opções de investimento", 30, yPos);
  yPos += 6;
  doc.text("• Definir próximos objetivos financeiros", 30, yPos);
  yPos += 15;

  // SEÇÃO 7: SIMULAÇÃO DE CRESCIMENTO
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(" PROJEÇÃO DE CRESCIMENTO", 20, yPos);
  yPos += 15;

  if (meta > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const projecoes = [
      { periodo: "6 meses", valor: meta * 6 },
      { periodo: "1 ano", valor: meta * 12 },
      { periodo: "2 anos", valor: meta * 24 },
      { periodo: "5 anos", valor: meta * 60 }
    ];

    doc.text("Se mantiver a meta de economia:", 25, yPos);
    yPos += 10;

    projecoes.forEach(({ periodo, valor }) => {
      doc.text(`• Em ${periodo}: ${formatarValor(valor)}`, 30, yPos);
      yPos += 6;
    });
  }

  // RODAPÉ
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Este relatório foi gerado automaticamente com base nas informações fornecidas.", 20, 280);
  doc.text("Para um acompanhamento personalizado, procure a Clínica Financeira Barracred.", 20, 285);
  doc.text("Relatório confidencial - Uso restrito do titular", 20, 290);

  // Salvar o PDF
  doc.save(`relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`);
}

function simularInvestimento() {
  const investimento = parseFloat(document.getElementById('investimento').value) || 0;
  const poupancaMes = parseFloat(document.getElementById('poupancaMes').value) || 0;
  const selicAnual = 14.25 / 100;
  const selicMensal = selicAnual / 12;
  const poupancaMensal = 0.0065;
  const resultado = document.getElementById('resultado-investimento');
  resultado.innerHTML = "";

  const prazos = [12, 24, 36, 48, 60, 72, 360];

  prazos.forEach(meses => {
    let totalBarracred = investimento;
    let totalPoupanca = investimento;

    for (let i = 0; i < meses; i++) {
      totalBarracred += poupancaMes;
      totalBarracred *= (1 + selicMensal);

      totalPoupanca += poupancaMes;
      totalPoupanca *= (1 + poupancaMensal);
    }

    const diferenca = totalBarracred - totalPoupanca;

    resultado.innerHTML += `
      <tr>
        <td>${meses} meses</td>
        <td>${formatarValor(totalBarracred)}</td>
        <td>${formatarValor(totalPoupanca)}</td>
        <td>${formatarValor(diferenca)}</td>
      </tr>
    `;
  });
}