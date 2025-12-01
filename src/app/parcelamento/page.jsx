"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { Button } from "../components/ui/button.jsx";
import logo from "../../../public/logo.png";

export default function ParcelamentoPage() {
  // Taxas tabela
  const taxas = [
    { p: 1, link: 4.39, maquina: 3.26 },
    { p: 2, link: 6.49, maquina: 5.70 },
    { p: 3, link: 7.54, maquina: 6.52 },
    { p: 4, link: 8.60, maquina: 7.36 },
    { p: 5, link: 9.66, maquina: 8.20 },
    { p: 6, link: 10.71, maquina: 9.03 },
    { p: 7, link: 14.40, maquina: 9.88 },
    { p: 8, link: 15.50, maquina: 10.73 },
    { p: 9, link: 16.62, maquina: 11.59 },
    { p: 10, link: 17.74, maquina: 12.44 },
    { p: 11, link: 18.87, maquina: 13.30 },
    { p: 12, link: 20.00, maquina: 14.16 },
  ];

  const [metodo, setMetodo] = useState("link");
  const [parcelas, setParcelas] = useState(1);
  const [flight, setFlight] = useState(null);
  const [total, setTotal] = useState(0);

  // Carrega flightData e valorTotal ao abrir
  useEffect(() => {
    const savedFlight = localStorage.getItem("flightData");
    const savedTotal = localStorage.getItem("valorTotal");

    if (savedFlight) {
      try {
        setFlight(JSON.parse(savedFlight));
      } catch (err) {
        console.warn("Erro parse flightData", err);
      }
    }

    if (savedTotal) {
      setTotal(parseFloat(savedTotal));
    } else {
      setTotal(0);
    }
  }, []);

  // calcula percentuais a partir das taxas
  const taxaSelecionada = taxas.find((t) => t.p === parcelas);
  const percentual = taxaSelecionada ? taxaSelecionada[metodo] : 0;
  const valorComTaxa = total + (total * percentual) / 100;
  const valorParcela = parcelas > 0 ? valorComTaxa / parcelas : valorComTaxa;

  // Helpers
  const toBase64 = async (path) => {
    const url = path || "/logo.png";
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  // Funções de formatação (usadas no PDF)
  const toBRDate = (d) => {
    if (!d) return "-";
    // se já estiver no formato YYYY-MM-DD
    const parts = String(d).split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    // fallback
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString("pt-BR");
    } catch {
      return d;
    }
  };
  const up = (txt) => (txt ? String(txt).toUpperCase() : "-");
  const money = (n) => `R$ ${Number(n || 0).toFixed(2)}`;

  // função que calcula valores detalhados novamente (garante consistência)
  const computeDetails = (f) => {
    if (!f) return null;
    const totalPax = Number(f.adultos || 0) + Number(f.criancas || 0);

    // bagagens
    const totalBagagemIda = Number(f.bagagemQuantidadeIda || 0) * Number(f.bagagemPrecoIda || 0);
    const totalBagagemVolta = Number(f.bagagemQuantidadeVolta || 0) * Number(f.bagagemPrecoVolta || 0);

    // airportRates same as on IdaVoltaPage (kept small reproduce)
    const airportRates = [
      { code: "GRU", nacional: 32, internacional: 150 },
      { code: "CGH", nacional: 40, internacional: 120 },
      { code: "VCP", nacional: 40, internacional: 120 },
      { code: "GIG", nacional: 40, internacional: 120 },
      { code: "SDU", nacional: 30, internacional: 100 },
      { code: "BSB", nacional: 35, internacional: 110 },
      { code: "SSA", nacional: 30, internacional: 100 },
      { code: "REC", nacional: 30, internacional: 100 },
      { code: "FOR", nacional: 50, internacional: 90 },
      { code: "BEL", nacional: 25, internacional: 90 },
      { code: "POA", nacional: 25, internacional: 90 },
      { code: "CWB", nacional: 25, internacional: 90 },
      { code: "NAT", nacional: 20, internacional: 80 },
      { code: "MAO", nacional: 20, internacional: 80 },
      { code: "FLN", nacional: 20, internacional: 80 },
      { code: "CGB", nacional: 20, internacional: 80 },
      { code: "VIX", nacional: 20, internacional: 80 },
      { code: "JOI", nacional: 20, internacional: 80 },
      { code: "MCZ", nacional: 20, internacional: 80 },
      { code: "JFK", nacional: 0, internacional: 300 },
      { code: "LHR", nacional: 0, internacional: 350 },
      { code: "CDG", nacional: 0, internacional: 320 },
      { code: "FRA", nacional: 0, internacional: 330 },
      { code: "MAD", nacional: 0, internacional: 310 },
      { code: "MIA", nacional: 0, internacional: 300 },
      { code: "SFO", nacional: 0, internacional: 300 },
      { code: "DXB", nacional: 0, internacional: 400 },
      { code: "HND", nacional: 0, internacional: 380 },
      { code: "SIN", nacional: 0, internacional: 380 },
      { code: "YYZ", nacional: 0, internacional: 290 },
      { code: "EZE", nacional: 0, internacional: 270 },
    ];

    const getAirportTax = (airportCode, manualValue, classificacao) => {
      if (manualValue !== "" && manualValue !== null && typeof manualValue !== "undefined")
        return parseFloat(manualValue) || 0;
      const rate = airportRates.find((r) => r.code === (airportCode || "").toUpperCase());
      if (!rate) return 0;
      return classificacao === "Nacional" ? rate.nacional : rate.internacional;
    };

    const taxaIda = getAirportTax(f.idaAeroporto, f.idaTaxaManual, f.classificacao);
    const taxaVolta = f.tipoviagem === "Ida e Volta" ? getAirportTax(f.voltaAeroporto, f.voltaTaxaManual, f.classificacao) : 0;

    const valorMilhasIda = (Number(f.milhasPorPassageiroIda || 0)) * Number(f.precoMilheiroIda || 0) * totalPax;
    const valorMilhasVolta = f.tipoviagem === "Ida e Volta" ? (Number(f.milhasPorPassageiroVolta || 0)) * Number(f.precoMilheiroVolta || 0) * totalPax : 0;

    const totalIda = valorMilhasIda + Number(taxaIda || 0) + Number(totalBagagemIda || 0);
    const totalVolta = f.tipoviagem === "Ida e Volta" ? valorMilhasVolta + Number(taxaVolta || 0) + Number(totalBagagemVolta || 0) : 0;
    const totalGeral = totalIda + totalVolta;

    return {
      totalPax,
      totalBagagemIda,
      totalBagagemVolta,
      taxaIda,
      taxaVolta,
      valorMilhasIda,
      valorMilhasVolta,
      totalIda,
      totalVolta,
      totalGeral,
    };
  };

const gerarPDF = async () => {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 26;
    let y = margin;

    // Funções utilitárias
    const up = (txt) => (txt ? String(txt).toUpperCase() : "-");
    const money = (n) => `R$ ${(Number(n) || 0).toFixed(2)}`;
    const toBRDate = (d) => d ? d.split("-").reverse().join("/") : "-";

    const details = computeDetails(flight);

    // Converter logo
    let logoBase64 = null;
    try {
      const candidate = (logo && (logo.src || logo)) || "/logo.png";
      logoBase64 = await toBase64(candidate);
    } catch (err) {}

    if (logoBase64) {
      const w = 65, h = 50;
      doc.addImage(logoBase64, "PNG", (pageWidth - w) / 2, y, w, h);
      y += h + 6;
    }

// --- Número de série
const year = new Date().getFullYear();
const key = `serie_pdf_${year}`;
let stored = Number(localStorage.getItem(key)) || 999;
const serial = stored + 1;
localStorage.setItem(key, serial);
const serialFormatted = `${String(serial).padStart(4, "0")}/${year}`;


doc.setFontSize(10);


const rightX = pageWidth - margin;


doc.setFont("helvetica", "bold");
doc.text(serialFormatted, rightX, y, { align: "right" });


const serialWidth = doc.getTextWidth(serialFormatted);
const gap = 8; // espaço entre label e serial
doc.setFont("helvetica", "normal");
doc.text("Número de série:", rightX - serialWidth - gap, y, { align: "right" });


y += 14;


    // Título
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Orçamento e Informações da Viagem", pageWidth / 2, y, {
      align: "center",
    });

    y += 18;

    // Separador
    const sep = () => {
      doc.setDrawColor(180);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
    };

    // Função para escrever rótulo + valor
    const line = (label, value) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`${label}:`, margin, y);
      doc.setFont("helvetica", "bold");
      doc.text(`${value}`, margin + 120, y);
      y += 11;
    };

    // Informações gerais

    y += 20;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Informações gerais do Voo", margin, y);
    y += 10; sep();


    y += 10;

    line("Classificação", up(flight.classificacao));
    line("Tipo de viagem", flight.tipoviagem);
    line("Adultos", flight.adultos);
    line("Crianças", flight.criancas);
    line("Bebês", flight.bebes);
    

    y += 10;


    // Ida

    y += 20;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Trecho: IDA", margin, y);
    y += 10; sep();

    y += 10;

    line("Data", toBRDate(flight.idaData));
    line("Horário do embarque", flight.idaEmbarqueHora);
    line("Horário da chegada", flight.idaChegadaHora);
    line("Aeroporto de origem", up(flight.idaAeroporto));
    line("Aeroporto de destino", up(flight.idaChegadaAeroporto));
    line("Taxa do aeroporto (R$)", money(details.taxaIda));
    line("Bagagens",
      `${flight.bagagemQuantidadeIda} x ${money(flight.bagagemPrecoIda)}`
    );
    line("Valor (R$)", money(details.valorMilhasIda));
    line("Total (R$)", money(details.totalIda));

    if (flight.tipoviagem === "Ida e Volta") {

    y += 10;


    // Volta


      y += 20;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Trecho: VOLTA", margin, y);
      y += 10; sep();

      y += 10;

      line("Data", toBRDate(flight.voltaData));
      line("Horário do embarque", flight.voltaEmbarqueHora);
      line("Horário da hegada", flight.voltaChegadaHora);
      line("Aeroporto de origem", up(flight.voltaAeroporto));
      line("Aeroporto de destino", up(flight.voltaChegadaAeroporto));
      line("Taxa do aeroporto (R$)", money(details.taxaVolta));
      line("Bagagens",
        `${flight.bagagemQuantidadeVolta} x ${money(flight.bagagemPrecoVolta)}`
      );
      line("Valor (R$)", money(details.valorMilhasVolta));
      line("Total (R$)", money(details.totalVolta));
    }

    y += 10;


    // Resumo financeiro 

    y += 20;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo financeiro", margin, y);
    y += 10; sep();

    y += 10;

    line("Valor Total (R$)", money(details.totalGeral));
    line("Parcelas", `${parcelas}x`);
    line("Valor por Parcela (R$)", money(valorParcela));

    y += 10;

    // OBS Centralizado

    y += 20;
    const obs = "Aviso importante sobre preços dinâmicos: Os valores apresentados neste orçamento estão sujeitos à variação de acordo com disponibilidade, demanda, políticas das companhias aéreas e hotéis, além de possíveis alterações cambiais. Como se tratam de preços dinâmicos, o valor final somente será confirmado no momento da emissão da passagem aérea ou da reserva da hospedagem. Recomenda-se confirmar a compra o quanto antes para garantir as tarifas informadas.";

    doc.setFont("helvetica", "normal");
    const obsLines = doc.splitTextToSize(obs, pageWidth - margin * 2);
    doc.text(obsLines, pageWidth / 2, y, { align: "center" });

    // Nome do arquivo
    const fileName = `informacoes.orcamento_viagem_${serialFormatted}.pdf`;
    doc.save(fileName);
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
  }
};


  return (
    <div className="p-6 max-w-3xl mx-auto rounded-xl space-y-5">
      <h2 className="text-3xl md:text-4xl font-bold p-5">Parcelamento $</h2>

      <p className="text-lg font-semibold">
        Valor total: <strong className="font-extrabold text-2xl">R$ {total.toFixed(2)}</strong>
      </p>

      <div className="space-y-2">
        <label className="text-lg font-semibold">Método de Pagamento:</label>
        <select className="p-2 text-2xl font-extrabold rounded" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
          <option className="bg-gray-400 text-gray-900 text-lg font-bold" value="link">Link</option>
          <option className="bg-gray-400 text-gray-900 text-lg font-bold" value="maquina">Maquininha</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-lg font-semibold">Parcelas:</label>
        <select className="p-2 text-2xl font-extrabold rounded" value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))}>
          {taxas.map((t) => (
            <option className="bg-gray-400 text-gray-900 text-lg font-bold" key={t.p} value={t.p}>
              {t.p}x
            </option>
          ))}
        </select>
      </div>

      <div className="border p-4 rounded space-y-1">
        <p className="text-lg font-semibold">
          Taxa: <strong className="text-2xl font-extrabold">{percentual}%</strong>
        </p>
        <p className="text-lg font-semibold">
          Total com taxa: <strong className="text-2xl font-extrabold">R$ {valorComTaxa.toFixed(2)}</strong>
        </p>
        <p className="text-lg font-semibold">
          Parcela escolhida: <strong className="text-2xl font-extrabold">R$ {valorParcela.toFixed(2)}</strong>
        </p>
      </div>

      <div className="pt-2">
        <Button className="p-7" onClick={gerarPDF}>
          <p className="font-extrabold text-xl">Gerar PDF</p>
        </Button>
      </div>
    </div>
  );
}
