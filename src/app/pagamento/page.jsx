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

  // PDF
const gerarPDF = async () => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // LOGO
    let logoBase64 = null;
    try {
      const candidate = logo && (logo.src || logo);
      logoBase64 = await toBase64(candidate);
    } catch (err) {
      console.warn("Não foi possível converter logo:", err);
    }

    if (logoBase64) {
      const imgWidth = 40;
      const imgHeight = 30;
      const imgX = (pageWidth - imgWidth) / 2;
      doc.addImage(logoBase64, "PNG", imgX, 10, imgWidth, imgHeight);
    }

    // NUMERO DE SÉRIE
    const up = (txt) => (txt ? String(txt).toUpperCase() : "-");

    // Número de série (terra: incremento por ano)

    const currentYear = new Date().getFullYear();
    const serialKey = `serie_pdf_${currentYear}`;

     let stored = Number(localStorage.getItem(serialKey));


     if (!stored || stored < 999) {
     stored = 999;
        }

       const serial = stored + 1;
          localStorage.setItem(serialKey, serial);

         const serialFormatted = `${String(serial).padStart(4, "0")}/${currentYear}`;

         let y = logoBase64 ? 50 : 25;

    // TÍTULO
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Orçamento e informações da sua viagem",
      pageWidth / 2,
      y,
      { align: "center" }
    );

    // Número de série alinhado com o título
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Número de série:", pageWidth - 60, y - 10);
    doc.setFont("helvetica", "bold");
    doc.text(serialFormatted, pageWidth - 15, y - 10, { align: "right" });

    y += 12;

    // FUNÇÃO WRITE CORRIGIDA
    const write = (label, value) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      const textLabel = `${label}: `;
      doc.text(textLabel, 15, y);
      const labelWidth = doc.getTextWidth(textLabel);

      doc.setFont("helvetica", "bold");
      doc.text(` ${String(value ?? "-")}`, 15 + labelWidth, y);
      y += 7;
    };

    const details = computeDetails(flight);

    // DADOS GERAIS
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Dados do Passageiro e Informações Gerais", 15, y);
    y += 10;

    write("Classificação", up(flight?.classificacao));
    write("Tipo de viagem", flight?.tipoviagem);
    write("Adultos", flight?.adultos);
    write("Crianças", flight?.criancas);
    write("Bebês", flight?.bebes);
    write("Total de passageiros", details?.totalPax);

    y += 8;

    // IDA
    doc.setFont("helvetica", "bold");
    doc.text("Trecho: IDA", 15, y);
    y += 9;

    write("Data ida", toBRDate(flight?.idaData));
    write("Hora ida", flight?.idaHora);
    write("Origem (IDA)", up(flight?.idaAeroporto));
    write("Destino (IDA)", up(flight?.idaChegadaAeroporto));
    write("Taxa (IDA)", money(details?.taxaIda));
    write("Bagagens (IDA)", `${flight?.bagagemQuantidadeIda} x R$ ${Number(flight?.bagagemPrecoIda).toFixed(2)}`);
    write("Milhas (IDA) - custo", money(details?.valorMilhasIda));
    write("Total (IDA)", money(details?.totalIda));

    y += 9;

    // VOLTA
    if (flight?.tipoviagem === "Ida e Volta") {
      doc.setFont("helvetica", "bold");
      doc.text("Trecho: VOLTA", 15, y);
      y += 9;

      write("Data volta", toBRDate(flight?.voltaData));
      write("Hora volta", flight?.voltaHora);
      write("Origem (VOLTA)", up(flight?.voltaAeroporto));
      write("Destino (VOLTA)", up(flight?.voltaChegadaAeroporto));
      write("Taxa (VOLTA)", money(details?.taxaVolta));
      write("Bagagens (VOLTA)", `${flight?.bagagemQuantidadeVolta} x R$ ${Number(flight?.bagagemPrecoVolta).toFixed(2)}`);
      write("Milhas (VOLTA) - custo", money(details?.valorMilhasVolta));
      write("Total (VOLTA)", money(details?.totalVolta));
    }

  

    // RESUMO FINANCEIRO AGRUPADO ✔

    doc.addPage();
    y = 20;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    
    doc.text("Resumo Financeiro", 15, y);
    y += 10;

    write("Total", money(valorComTaxa));
    write("Parcelas escolhidas", `${parcelas}x`);
    write("Valor por parcela", money(valorParcela));

    y += 12;

    // OBS
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const obs = "ATENÇÃO: Orçamento momentâneo. Verifique valores e condições antes do pagamento.";
    doc.text(doc.splitTextToSize(obs, pageWidth - 30), 15, y);

    

    // SAVE
    doc.save(`orcamento.informacoes_viagem_${serial}/${currentYear}.pdf`);

  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    alert("Erro ao gerar PDF, veja o console");
  }
};


  return (
    <div className="p-6 max-w-3xl mx-auto rounded-xl space-y-5">
      <h2 className="text-3xl md:text-4xl font-bold p-5">Parcelamento do Pagamento</h2>

      <p className="text-lg font-semibold">
        Valor total: <strong className="font-extrabold text-2xl">R$ {total.toFixed(2)}</strong>
      </p>

      <div className="space-y-2">
        <label className="text-lg font-semibold">Método de Pagamento:</label>
        <select className="p-2 text-2xl font-extrabold rounded" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
          <option className="bg-gray-200 text-gray-700 text-lg font-semibold" value="link">Link</option>
          <option className="bg-gray-200 text-gray-700 text-lg font-semibold" value="maquina">Maquininha</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-lg font-semibold">Parcelas:</label>
        <select className="p-2 text-2xl font-extrabold rounded" value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))}>
          {taxas.map((t) => (
            <option className="bg-gray-200 text-gray-700 text-lg font-semibold" key={t.p} value={t.p}>
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

      <Button className="p-7" onClick={gerarPDF}>
        <p className="font-bold text-xl">Gerar PDF</p>
      </Button>
    </div>
  );
}
