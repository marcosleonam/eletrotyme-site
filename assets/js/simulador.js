/* Simulador de investimento Eletrotyme.
   Três modos (parceria, posto pronto, investidor) com as mesmas
   premissas da proposta Posto Natureza: 30 kWh por recarga, R$ 2,90/kWh
   ao motorista, 10% de taxa de plataforma, R$ 1,10/kWh de energia.
   Tudo é recalculado a cada input; nenhum dado sai da página. */

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const BRL2 = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const NUM = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

const $ = (id) => document.getElementById(id);
const num = (id) => parseFloat(String($(id).value).replace(",", ".")) || 0;

let modo = "parceria";

function margemKwh() {
  return num("preco") * (1 - num("taxa") / 100) - num("energia");
}

function faturamento(recargas) {
  return recargas * num("kwh") * num("preco") * 30;
}

function margemMes(recargas) {
  return recargas * num("kwh") * margemKwh() * 30;
}

function resultadoParceria(recargas) {
  const bruto = faturamento(recargas);
  const fixo = num("aluguel");
  const part = bruto * (num("participacao") / 100);
  return { bruto, fixo, part, melhor: Math.max(fixo, part) };
}

function resultadoPronto(recargas) {
  const margem = margemMes(recargas);
  const resultado = margem - num("fixos");
  const invest = num("investimento");
  const payback = resultado > 0 ? invest / resultado : Infinity;
  const equilibrio = num("fixos") / (30 * num("kwh") * margemKwh());
  return { margem, resultado, payback, equilibrio, invest };
}

function setText(id, txt) { const el = $(id); if (el) el.textContent = txt; }

function paybackTxt(m) {
  if (!isFinite(m)) return "—";
  return m < 1 ? "< 1 mês" : Math.round(m) + " meses";
}

function renderTabela(rows) {
  const tbody = $("tabela-body");
  tbody.innerHTML = rows.map(r => `
<tr class="border-t border-white/[0.06] ${r.ativo ? "bg-orange-400/[0.05]" : ""}">
<td class="px-4 py-3 text-sm text-white font-geist">${r.nome}<span class="ml-2 text-xs text-slate-500 font-geist">${r.rec} recargas/dia</span></td>
${r.cols.map((c, i) => `<td class="px-4 py-3 text-sm ${i === r.cols.length - 1 ? "text-orange-200 font-semibold" : "text-slate-300"} font-geist text-right">${c}</td>`).join("")}
</tr>`).join("");
}

function render() {
  const rec = num("recargas");
  setText("recargas-label", NUM.format(rec));
  setText("margem-kwh", BRL2.format(margemKwh()));
  const cenarios = [
    { nome: "Conservador", rec: 4 },
    { nome: "Realista", rec: 8 },
    { nome: "Otimista", rec: 15 },
  ];

  if (modo === "parceria") {
    const r = resultadoParceria(rec);
    setText("k1-label", "Faturamento bruto / mês");
    setText("k1", BRL.format(r.bruto));
    setText("k1-sub", `${NUM.format(rec * num("kwh") * 30)} kWh entregues no mês`);
    setText("k2-label", "Aluguel fixo das vagas");
    setText("k2", BRL.format(r.fixo));
    setText("k2-sub", "todo mês, independe do movimento");
    setText("k3-label", `Participação de ${NUM.format(num("participacao"))}%`);
    setText("k3", BRL.format(r.part));
    setText("k3-sub", r.part > r.fixo ? "passa à frente do aluguel fixo" : "fica abaixo do aluguel fixo");
    setText("k4-label", "Melhor caso para você / mês");
    setText("k4", BRL.format(r.melhor));
    setText("k4-sub", `${BRL.format(r.melhor * 12)} por ano · investimento R$ 0`);
    setText("th1", "Aluguel fixo"); setText("th2", `${NUM.format(num("participacao"))}% do faturamento`); setText("th3", "Melhor caso / mês");
    renderTabela(cenarios.map(c => { const x = resultadoParceria(c.rec); return { ...c, ativo: Math.round(rec) === c.rec, cols: [BRL.format(x.fixo), BRL.format(x.part), BRL.format(x.melhor)] }; }));
    setText("leitura", `Com ${NUM.format(rec)} recargas por dia o posto fatura ${BRL.format(r.bruto)} no mês. ${r.part > r.fixo ? "Nesse movimento a participação já rende mais que o aluguel fixo." : "Nesse movimento o aluguel fixo rende mais; a participação passa à frente acima de " + NUM.format(num("aluguel") / (num("participacao") / 100) / (num("kwh") * num("preco") * 30)) + " recargas/dia."} Você não investe nada: equipamento, obra, energia e operação são da Eletrotyme.`);
  } else if (modo === "pronto") {
    const r = resultadoPronto(rec);
    setText("k1-label", "Resultado líquido / mês");
    setText("k1", BRL.format(r.resultado));
    setText("k1-sub", "100% seu, já líquido de energia, plataforma e custos fixos");
    setText("k2-label", "Retorno do investimento");
    setText("k2", paybackTxt(r.payback));
    setText("k2-sub", `sobre ${BRL.format(r.invest)} do posto pronto`);
    setText("k3-label", "Ponto de equilíbrio");
    setText("k3", `${NUM.format(r.equilibrio)} rec/dia`);
    setText("k3-sub", "a partir daqui, tudo é resultado");
    setText("k4-label", "Resultado em 12 meses");
    setText("k4", BRL.format(r.resultado * 12));
    setText("k4-sub", `ROI de ${NUM.format(r.invest > 0 ? (r.resultado * 12 / r.invest) * 100 : 0)}% ao ano`);
    setText("th1", "Margem / mês"); setText("th2", "Resultado / mês"); setText("th3", "Retorno do aporte");
    renderTabela(cenarios.map(c => { const x = resultadoPronto(c.rec); return { ...c, ativo: Math.round(rec) === c.rec, cols: [BRL.format(x.margem), BRL.format(x.resultado), paybackTxt(x.payback)] }; }));
    setText("leitura", `No posto pronto o ativo é seu e não há aluguel de vagas: o ponto de equilíbrio cai para ${NUM.format(r.equilibrio)} recarga por dia. Com ${NUM.format(rec)} recargas/dia sobram ${BRL.format(r.resultado)} por mês e o aporte de ${BRL.format(r.invest)} volta em ${paybackTxt(r.payback)}. Operação, NOC e manutenção continuam sendo da Eletrotyme.`);
  } else {
    const aporte = num("aporte");
    const y = num("yield") / 100;
    const mensal = aporte * y;
    const anual = mensal * 12;
    const composto = (Math.pow(1 + y, 12) - 1) * 100;
    setText("k1-label", "Renda mensal estimada");
    setText("k1", BRL.format(mensal));
    setText("k1-sub", `distribuição mensal (D+30) · yield de ${NUM.format(y * 100)}% a.m.`);
    setText("k2-label", "Renda em 12 meses");
    setText("k2", BRL.format(anual));
    setText("k2-sub", `${NUM.format(composto)}% a.a. se reinvestido`);
    setText("k3-label", "Lock-in inicial");
    setText("k3", "120 dias");
    setText("k3-sub", "depois, liquidez conforme contrato");
    setText("k4-label", "Lastro");
    setText("k4", "Ativo real");
    setText("k4-sub", "carregador, obra e infraestrutura no hub");
    setText("th1", "Aporte"); setText("th2", "Renda / mês"); setText("th3", "Renda / ano");
    const faixas = [
      { nome: "Cota mínima", rec: "—", ap: 50000 },
      { nome: "Sua simulação", rec: "—", ap: aporte, ativo: true },
      { nome: "Cota máxima por ponto", rec: "—", ap: 75000 },
    ];
    renderTabela(faixas.map(f => ({ nome: f.nome, rec: "", ativo: !!f.ativo, cols: [BRL.format(f.ap), BRL.format(f.ap * y), BRL.format(f.ap * y * 12)] })));
    setText("leitura", `Com ${BRL.format(aporte)} a ${NUM.format(y * 100)}% ao mês, a renda estimada é de ${BRL.format(mensal)} por mês, ${BRL.format(anual)} em 12 meses. Participação de até 50% por ponto, gestão 100% passiva pela Eletrotyme e acesso aos dados da operação. Rentabilidade projetada não é garantia de resultado.`);
  }
  atualizarLinkProposta();
}

function atualizarLinkProposta() {
  const a = $("enviar-simulacao");
  if (!a) return;
  const linhas = [
    `Modo: ${modo}`,
    modo === "investidor" ? `Aporte: ${BRL.format(num("aporte"))} · yield ${num("yield")}% a.m.` : `Recargas/dia: ${num("recargas")} · kWh/recarga: ${num("kwh")} · preço R$ ${num("preco")}/kWh · energia R$ ${num("energia")}/kWh · taxa ${num("taxa")}%`,
    modo === "pronto" ? `Investimento: ${BRL.format(num("investimento"))} · custos fixos ${BRL.format(num("fixos"))}/mês` : "",
    modo === "parceria" ? `Aluguel fixo: ${BRL.format(num("aluguel"))} · participação ${num("participacao")}%` : "",
    "",
    `Resultado: ${$("k1").textContent} (${$("k1-label").textContent})`,
  ].filter(Boolean).join("\n");
  const wa = `https://wa.me/5598991653290?text=${encodeURIComponent("Simulação Eletrotyme\n\n" + linhas + "\n\nQuero receber a proposta do meu ponto.")}`;
  a.href = wa;
}

function setModo(novo) {
  modo = novo;
  document.querySelectorAll("[data-modo]").forEach(b => {
    const ativo = b.dataset.modo === modo;
    b.className = ativo
      ? "h-10 rounded-full bg-orange-500 px-5 text-sm font-medium text-white shadow-[0_12px_35px_rgba(0,0,0,0.28)] transition font-geist"
      : "h-10 rounded-full px-5 text-sm font-medium text-slate-300 transition hover:text-white font-geist";
  });
  document.querySelectorAll("[data-show]").forEach(el => {
    el.classList.toggle("hidden", !el.dataset.show.split(" ").includes(modo));
  });
  render();
}

document.querySelectorAll("[data-modo]").forEach(b => b.addEventListener("click", () => setModo(b.dataset.modo)));
document.querySelectorAll("#simulador input").forEach(i => i.addEventListener("input", render));
document.querySelectorAll("[data-preset]").forEach(b => b.addEventListener("click", () => { $("recargas").value = b.dataset.preset; render(); }));

const hash = (location.hash || "").replace("#", "");
setModo(["parceria", "pronto", "investidor"].includes(hash) ? hash : "parceria");
