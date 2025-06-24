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

// Barra de saúde financeira
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
  const { fixos, variaveis, meta, sobra, renda, despesas } = calcularValores();

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

async function gerarRelatorioPDF() {
  const { renda, fixos, variaveis, meta, despesas, sobra, economia } = calcularValores();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Relatório Financeiro", 20, 20);
  doc.setFontSize(12);
  doc.text(`Renda: ${formatarValor(renda)}`, 20, 40);
  doc.text(`Gastos Fixos: ${formatarValor(fixos)}`, 20, 50);
  doc.text(`Gastos Variáveis: ${formatarValor(variaveis)}`, 20, 60);
  doc.text(`Meta de Economia: ${formatarValor(meta)}`, 20, 70);
  doc.text(`Sobra: ${formatarValor(sobra)}`, 20, 80);
  doc.save("relatorio_financeiro.pdf");
}

async function gerarRelatorioPDFCompleto() {
  const { renda, fixos, variaveis, meta, despesas, sobra } = calcularValores();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const dataHora = new Date().toLocaleString('pt-BR');

  doc.setFontSize(16);
  doc.text("Relatório Financeiro Completo", 20, 20);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${dataHora}`, 20, 26);

  doc.setFontSize(12);
  doc.text("Resumo", 20, 36);
  doc.text(`- Renda Mensal: ${formatarValor(renda)}`, 20, 44);
  doc.text(`- Gastos Fixos: ${formatarValor(fixos)}`, 20, 50);
  doc.text(`- Gastos Variáveis: ${formatarValor(variaveis)}`, 20, 56);
  doc.text(`- Meta de Economia: ${formatarValor(meta)}`, 20, 62);

  doc.text("Totais Calculados", 20, 72);
  doc.text(`- Despesas Totais: ${formatarValor(despesas)}`, 20, 80);
  doc.text(`- Economia (meta): ${formatarValor(meta)}`, 20, 86);
  doc.text(`- Sobra no mês: ${formatarValor(sobra)}`, 20, 92);

  doc.text("Análise e Dicas", 20, 102);
  if (sobra < 0) {
    doc.text("Meta de economia inviável com os gastos atuais.", 20, 110);
    doc.text("Dica: Reveja gastos fixos e variáveis. Priorize reduzir supérfluos.", 20, 116);
  } else if (sobra < renda * 0.1) {
    doc.text("Sobra pequena. Há risco de imprevistos afetarem seu orçamento.", 20, 110);
    doc.text("Dica: Tente cortar despesas variáveis e fazer reserva de emergência.", 20, 116);
  } else {
    doc.text("Sua sobra permite alcançar sua meta com segurança.", 20, 110);
    doc.text("Dica: Invista parte da sobra para crescimento patrimonial.", 20, 116);
  }

  doc.text("Observações", 20, 130);
  doc.setFontSize(10);
  doc.text("Este relatório é uma simulação com base nas informações fornecidas.", 20, 136);
  doc.text("Para um planejamento completo, conte com a Clínica Financeira Barracred.", 20, 142);

  doc.save("relatorio_completo.pdf");
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
