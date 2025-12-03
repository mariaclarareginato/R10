"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { Button } from "../components/ui/button.jsx";
import logo from "../../../public/logo.png";

export default function IdaVoltaPage() {
  const [flight, setFlight] = useState({
    // Dados gerais
    classificacao: "Nacional",
    tipoviagem: "Ida e Volta",
    adultos: 1,
    criancas: 0,
    bebes: 0,

    // Ida
    idaData: "",
    idaEmbarqueHora: "",
    idaChegadaHora: "",
    idaAeroporto: "",
    idaChegadaAeroporto: "",
    idaTaxaManual: "",

    // Volta
    voltaData: "",
    voltaEmbarqueHora: "",
    voltaChegadaHora: "",
    voltaAeroporto: "",
    voltaChegadaAeroporto: "",
    voltaTaxaManual: "",

    // Bagagens
    bagagemQuantidadeIda: 0,
    bagagemPrecoIda: 0,
    bagagemQuantidadeVolta: 0,
    bagagemPrecoVolta: 0,

    // Programa / milhas IDA
    programaIda: "Latam",
    milhasPorPassageiroIda: 0,
    precoMilheiroIda: 0,

    // Programa / milhas VOLTA
    programaVolta: "Latam",
    milhasPorPassageiroVolta: 0,
    precoMilheiroVolta: 0,
  });

  const [airportRates] = useState([
  
  { code: "BEL", nacional: 25, internacional: 90 },
  { code: "BSB", nacional: 35, internacional: 110 },
  { code: "CDG", nacional: 0, internacional: 320 },
  { code: "CGB", nacional: 20, internacional: 80 },
  { code: "CGH", nacional: 60.62, internacional: 120 },
  { code: "CNF", nacional: 33.56, internacional: 120 },
  { code: "CWB", nacional: 25, internacional: 90 },
  { code: "DXB", nacional: 0, internacional: 400 },
  { code: "EZE", nacional: 0, internacional: 270 },
  { code: "FLN", nacional: 20, internacional: 80 },
  { code: "FOR", nacional: 50, internacional: 90 },
  { code: "FRA", nacional: 0, internacional: 330 },
  { code: "GIG", nacional: 40, internacional: 120 },
  { code: "GRU", nacional: 33.64, internacional: 150 },
  { code: "HND", nacional: 0, internacional: 380 },
  { code: "IGU", nacional: 42.10, internacional: 120 },
  { code: "JFK", nacional: 0, internacional: 300 },
  { code: "JOI", nacional: 20, internacional: 80 },
  { code: "LHR", nacional: 0, internacional: 350 },
  { code: "MAD", nacional: 0, internacional: 310 },
  { code: "MAO", nacional: 20, internacional: 80 },
  { code: "MCZ", nacional: 20, internacional: 80 },
  { code: "MIA", nacional: 0, internacional: 300 },
  { code: "NAT", nacional: 20, internacional: 80 },
  { code: "POA", nacional: 25, internacional: 90 },
  { code: "REC", nacional: 30, internacional: 100 },
  { code: "SDU", nacional: 30, internacional: 100 },
  { code: "SFO", nacional: 0, internacional: 300 },
  { code: "SIN", nacional: 0, internacional: 380 },
  { code: "SSA", nacional: 30, internacional: 100 },
  { code: "VCP", nacional: 40, internacional: 120 },
  { code: "VIX", nacional: 20, internacional: 80 },
  { code: "YYZ", nacional: 0, internacional: 290 }


  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFlight((prev) => ({ ...prev, [name]: value }));
  };

  const getAirportTax = (airportCode, manualValue, classificacao) => {
    // usa manual se preenchido
    if (manualValue !== "" && manualValue !== null && typeof manualValue !== "undefined")
      return parseFloat(manualValue) || 0;
    const rate = airportRates.find((r) => r.code === (airportCode || "").toUpperCase());
    if (!rate) return 0;
    return classificacao === "Nacional" ? rate.nacional : rate.internacional;
  };

  // total de passageiros (adultos + crianças; bebês não pagam normalmente taxas/milhas) para calculo
  const totalPax = Number(flight.adultos || 0) + Number(flight.criancas || 0);

  
  // total de passageiros (adultos + crianças + bebês)

    const totalPaxEx = Number(flight.adultos || 0) + Number(flight.criancas || 0) + Number(flight.bebes || 0) ;






  // bagagens por trecho
  const totalBagagemIda = Number(flight.bagagemQuantidadeIda || 0) * Number(flight.bagagemPrecoIda || 0);
  const totalBagagemVolta = Number(flight.bagagemQuantidadeVolta || 0) * Number(flight.bagagemPrecoVolta || 0);

  // taxas (manual ou automática via aeroporto)
  const taxaIda = getAirportTax(flight.idaAeroporto, flight.idaTaxaManual, flight.classificacao);
  const taxaVolta =
    flight.tipoviagem === "Ida e Volta"
      ? getAirportTax(flight.voltaAeroporto, flight.voltaTaxaManual, flight.classificacao)
      : 0;

  // ===== CÁLCULOS DAS MILHAS (USANDO MILHEIRO: /1000 * precoMilheiro * pax) =====
  
  const valorMilhasIda =
    (Number(flight.milhasPorPassageiroIda || 0)) * Number(flight.precoMilheiroIda || 0) * totalPax;

  const valorMilhasVolta =
    flight.tipoviagem === "Ida e Volta"
      ? (Number(flight.milhasPorPassageiroVolta || 0)) *
        Number(flight.precoMilheiroVolta || 0) *
        totalPax
      : 0;

  // totais por trecho
  const totalIda = valorMilhasIda  + Number(taxaIda * totalPax|| 0) + Number(totalBagagemIda || 0) ;

  const totalVolta =
    flight.tipoviagem === "Ida e Volta" ? valorMilhasVolta + Number(taxaVolta * totalPax|| 0) + Number(totalBagagemVolta || 0) : 0 ;

  const totalGeral = totalIda + totalVolta;

  // Sempre salva o total (para rápido acesso)
  useEffect(() => {
    try {
      localStorage.setItem("valorTotal", String(totalGeral));
    } catch (e) {
      // ignore
    }
  }, [totalGeral]);

  // Controle para impedir salvar vazio na primeira renderização
  const [loaded, setLoaded] = useState(false);

  // Carrega dados salvos quando a página abre
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("flightData");
      if (savedData) {
        setFlight((prev) => ({ ...prev, ...JSON.parse(savedData) }));
      }
    } catch (e) {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  // Salva os dados do voo sempre que mudar, mas SOMENTE após carregar primeiro
  useEffect(() => {
    if (!loaded) return; // evita sobrescrever com vazio ao iniciar
    try {
      localStorage.setItem("flightData", JSON.stringify(flight));
    } catch (e) {
      // ignore
    }
  }, [flight, loaded]);

  // ========================
  // Helpers para o PDF
  // ========================
  const toBase64 = async (path) => {
    const url = path || "/logo.png";
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return null;
    }
  };

const gerarPDF = async () => {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const maxY = pageHeight - margin;
    let y = margin;

    // -- Conversão do logo --
    let logoBase64 = null;
    try {
      const candidate = (logo && (logo.src || logo)) || "/logo.png";
      logoBase64 = await toBase64(candidate);
    } catch (err) {
      console.warn("Erro ao converter logo:", err);
    }

    if (logoBase64) {
      const imgW = 90;
      const imgH = 60;
      doc.addImage(logoBase64, "PNG", (pageWidth - imgW) / 2, y, imgW, imgH);
      y += imgH + 20;
    }

    // -- Título --
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Orçamento e informações da Viagem", pageWidth / 2, y, { align: "center" });
    y += 30;

    // -- Número de série --
    const currentYear = new Date().getFullYear();
    const serialKey = `serie_pdf_${currentYear}`;
    let stored = Number(localStorage.getItem(serialKey));
    stored = stored && stored >= 999 ? stored : 999;
    const serial = stored + 1;
    localStorage.setItem(serialKey, serial);

    const serialFormatted = `${String(serial).padStart(4, "0")}-${currentYear}`;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Número de série: `, margin, y);
    doc.setFont("helvetica", "bold");
    doc.text(serialFormatted, margin + 100, y);
    y += 20;

    //  Função padrão para escrita organizada
    const write = (label, value) => {
      const labelX = margin;
      const valueX = margin + 150;
      const maxWidth = pageWidth - valueX - margin;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`${label}:`, labelX, y);

      doc.setFont("helvetica", "bold");
      const lines = doc.splitTextToSize(String(value ?? "-"), maxWidth);
      doc.text(lines, valueX, y);

      y += lines.length * 14 + 4;
      if (y > maxY) {
        doc.addPage();
        y = margin;
      }
    };

    //  Dados gerais
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Informações gerais do Voo", margin, y);
    y += 18;

    write("Classificação", flight.classificacao);
    write("Tipo de viagem", flight.tipoviagem);
    write("Adultos", flight.adultos);
    write("Crianças", flight.criancas);
    write("Bebês", flight.bebes);

    y += 10;

    //  IDA
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Trecho: IDA", margin, y);
    y += 18;

    write("Data", flight.idaData ? flight.idaData.split("-").reverse().join("/") : "-");
    write("Horário do embarque", flight.idaEmbarqueHora);
    write("Horário da chegada", flight.idaChegadaHora);
    write("Aeroporto de origem", flight.idaAeroporto?.toUpperCase());
    write("Aeroporto de destino", flight.idaChegadaAeroporto?.toUpperCase());
    write("Taxa de embarque (R$)", Number(taxaIda || 0).toFixed(2));
    write("Bagagens", `${flight.bagagemQuantidadeIda} x R$ ${Number(flight.bagagemPrecoIda || 0).toFixed(2)}`);
    write("Valor (R$)", valorMilhasIda.toFixed(2));
    write("Total (R$)", totalIda.toFixed(2));

    //  VOLTA
    if (flight.tipoviagem === "Ida e Volta") {
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Trecho: VOLTA", margin, y);
      y += 18;

      write("Data", flight.voltaData ? flight.voltaData.split("-").reverse().join("/") : "-");
      write("Horário do embarque", flight.voltaEmbarqueHora);
      write("Horário da chegada", flight.voltaChegadaHora);
      write("Aeroporto de origem", flight.voltaAeroporto?.toUpperCase());
      write("Aeroporto de destino", flight.voltaChegadaAeroporto?.toUpperCase());
      write("Taxa de embarque (R$)", Number(taxaVolta || 0).toFixed(2));
      write("Bagagens", `${flight.bagagemQuantidadeVolta} x R$ ${Number(flight.bagagemPrecoVolta || 0).toFixed(2)}`);
      write("Valor (R$)", valorMilhasVolta.toFixed(2));
      write("Total (R$)", totalVolta.toFixed(2));
    }

    //  Total geral
    y += 20;
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL GERAL: R$ ${totalGeral.toFixed(2)}`, pageWidth / 2, y, { align: "center" });
    y += 20;

    //  Observações
    y += 40;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const obs = "Aviso importante sobre preços dinâmicos: Os valores apresentados neste orçamento estão sujeitos à variação de acordo com disponibilidade, demanda, políticas das companhias aéreas e hotéis, além de possíveis alterações cambiais. Como se tratam de preços dinâmicos, o valor final somente será confirmado no momento da emissão da passagem aérea ou da reserva da hospedagem. Recomenda-se confirmar a compra o quanto antes para garantir as tarifas informadas.";
    const obsLines = doc.splitTextToSize(obs, pageWidth - margin * 2);
    doc.text(obsLines, margin, y);

    doc.save(`informacoes.orcamento_${serialFormatted}.pdf`);
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
  }
};


  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 rounded-xl shadow-lg">
      <style jsx>{`
        /* Remove as setas dos inputs numéricos */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

      <h1 className="text-4xl font-extrabold text-center mb-6">Orçamento de Viagem ✈️</h1>

      {/* Passageiros e Trecho */}
      <div>
        <h2 className="text-2xl font-bold">Dados gerais</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-lg shadow">
        <label className="flex flex-col text-lg font-semibold">
          Classificação:
          <select name="classificacao" value={flight.classificacao} onChange={handleChange} className="mt-1 p-2 rounded border">
            <option className="font-bold text-lg bg-gray-400 text-gray-900" value="Nacional">Nacional</option>
            <option className="font-bold text-lg bg-gray-400 text-gray-900" value="Internacional">Internacional</option>
          </select>
        </label>

        <label className="flex flex-col text-lg font-semibold">
          Trecho:
          <select name="tipoviagem" value={flight.tipoviagem} onChange={handleChange} className="mt-1 p-2 rounded border">
            <option className="font-bold text-lg bg-gray-400 text-gray-900" value="Ida">Somente ida</option>
            <option className="font-bold text-lg bg-gray-400 text-gray-900" value="Ida e Volta">Ida e volta</option>
          </select>
        </label>

        <div className="flex flex-col justify-center">
          <span className="font-semibold text-lg mb-1">Total de passageiros</span>
          <div className="text-xl font-bold">{totalPaxEx}</div>
        </div>

        <label className="flex flex-col text-lg font-semibold">
          Adultos:
          <select name="adultos" value={flight.adultos} onChange={handleChange} className="mt-1 p-2 rounded border">
            {Array.from({ length: 10 }, (_, i) => i).map((n) => (
              <option className="font-bold text-lg bg-gray-400 text-gray-900" key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-lg font-semibold">
          Crianças (2-11):
          <select name="criancas" value={flight.criancas} onChange={handleChange} className="mt-1 p-2 rounded border">
            {Array.from({ length: 10 }, (_, i) => i).map((n) => (
              <option className="font-bold text-lg bg-gray-400 text-gray-900" key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-lg font-semibold">
          Bebês (0-2):
          <select name="bebes" value={flight.bebes} onChange={handleChange} className="mt-1 p-2 rounded border">
            {Array.from({ length: 4 }, (_, i) => i).map((n) => (
              <option className="font-bold text-lg bg-gray-400 text-gray-900" key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Ida */}
      <div>
        <h2 className="text-2xl font-bold">Dados ida</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 rounded-lg shadow">
        <div className="flex flex-col">
          <label className="text-lg font-bold ">Data (ida):</label>
          <input type="date" name="idaData" value={flight.idaData} onChange={handleChange} className="mt-1 p-2 font-bold text-lg rounded border" />

          <label className="mt-3 font-bold text-lg">Horário embarque (ida):</label>
          <input type="time" name="idaEmbarqueHora" value={flight.idaEmbarqueHora} onChange={handleChange} className="mt-1 p-2 text-lg font-bold rounded border" />

          <label className="mt-3 font-bold text-lg">Horário chegada (ida):</label>
          <input type="time" name="idaChegadaHora" value={flight.idaChegadaHora} onChange={handleChange} className="mt-1 p-2 text-lg font-bold rounded border" />
        </div>

        <label className="flex flex-col text-lg font-bold">
          Aeroporto origem (ida):
          <input type="text" maxLength={3} name="idaAeroporto" value={flight.idaAeroporto} onChange={handleChange} className="mt-1 p-2 rounded text-center border uppercase" />
        </label>

        <label className="flex flex-col font-bold text-lg">
          Aeroporto destino (ida):
          <input type="text" maxLength={3} name="idaChegadaAeroporto" value={flight.idaChegadaAeroporto} onChange={handleChange} className="mt-1 p-2 rounded text-center border uppercase" />
        </label>

        <label className="flex flex-col text-lg font-bold">
          Taxa (ida):
          <input type="number" name="idaTaxaManual" value={flight.idaTaxaManual} onChange={handleChange} className="mt-1 p-2 rounded text-center border" />
          <span className="text-lg mt-1">Valor automático: 
            <br></br>
            R$ {getAirportTax(flight.idaAeroporto, "", flight.classificacao).toFixed(2)}</span>
        </label>

        <label className="flex text-lg font-bold flex-col">
          Quantidade de bagagens (ida):
          <select name="bagagemQuantidadeIda" value={flight.bagagemQuantidadeIda} onChange={handleChange} className="mt-1 p-2 rounded border">
            {Array.from({ length: 11 }, (_, i) => i).map((n) => (
              <option className="font-bold text-gray-900 bg-gray-400" key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-lg font-bold">
          Valor unitário bagagem (ida):
          <input type="number" name="bagagemPrecoIda" value={flight.bagagemPrecoIda} onChange={handleChange} className="mt-1 p-2 rounded border" />
        </label>

        <div className="flex flex-col text-lg font-bold justify-end">
          Total bagagem (ida): <strong className="text-xl font-extrabold">R$ {totalBagagemIda.toFixed(2)}</strong>
        </div>
      </div>

      {/* Programa / Milhas - IDA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-lg font-bold p-4 rounded-lg shadow">
        <label className="flex flex-col">
          Programa (ida):
          <select name="programaIda" value={flight.programaIda} onChange={handleChange} className="mt-1 p-2 rounded border">
            {["Latam", "Smiles", "Azul", "Iberia", "American Airlines", "British", "Qatar"].map((p) => (
              <option className="text-lg font-bold bg-gray-400 text-gray-900" key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          Milhas por passageiro (ida):
          <input type="number" step="1" name="milhasPorPassageiroIda" value={flight.milhasPorPassageiroIda} onChange={handleChange} className="mt-1 p-2 rounded border" />
        </label>

        <label className="flex flex-col">
          Preço do milheiro (ida):
          <input type="number" step="0.01" name="precoMilheiroIda" value={flight.precoMilheiroIda} onChange={handleChange} className="mt-1 p-2 rounded border" />
        </label>

        <div className="flex flex-col justify-end">
          Total (ida): <strong className="text-2xl font-extrabold">R$ {totalIda.toFixed(2)}</strong>
        </div>
      </div>

      {/* Volta */}
      {flight.tipoviagem === "Ida e Volta" && (
        <>
          <div>
            <h2 className="text-2xl font-bold">Dados volta</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 rounded-lg shadow">
            <div className="flex text-lg font-bold flex-col">
              <label>Data (volta):</label>
              <input type="date" name="voltaData" value={flight.voltaData} onChange={handleChange} className="mt-1 p-2 rounded border" />

              <label className="mt-3">Horário embarque (volta):</label>
              <input type="time" name="voltaEmbarqueHora" value={flight.voltaEmbarqueHora} onChange={handleChange} className="mt-1 p-2 rounded border" />

              <label className="mt-3">Horário chegada (volta):</label>
              <input type="time" name="voltaChegadaHora" value={flight.voltaChegadaHora} onChange={handleChange} className="mt-1 p-2 rounded border" />
            </div>

            <label className="flex text-lg font-bold flex-col">
              Aeroporto origem (volta):
              <input type="text" maxLength={3} name="voltaAeroporto" value={flight.voltaAeroporto} onChange={handleChange} className="mt-1 p-2 rounded text-center border uppercase" />
            </label>

            <label className="flex text-lg font-bold flex-col">
              Aeroporto destino (volta):
              <input type="text" maxLength={3} name="voltaChegadaAeroporto" value={flight.voltaChegadaAeroporto} onChange={handleChange} className="mt-1 p-2 rounded text-center border uppercase" />
            </label>

            <label className="flex text-lg font-bold flex-col">
              Taxa (volta):
              <input type="number" name="voltaTaxaManual" value={flight.voltaTaxaManual} onChange={handleChange} className="mt-1 p-2 rounded text-center border" />
              <span className="text-lg font-bold mt-1">Valor automático: 
                <br></br>
                R$ {getAirportTax(flight.voltaAeroporto, "", flight.classificacao).toFixed(2)}</span>
            </label>

            <label className="flex text-lg font-bold  flex-col">
              Quantidade de bagagens (volta):
              <select name="bagagemQuantidadeVolta" value={flight.bagagemQuantidadeVolta} onChange={handleChange} className="mt-1 p-2 rounded border">
                {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                  <option className="bg-gray-400 text-lg font-bold text-gray-900" key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex text-lg font-bold flex-col">
              Valor unitário bagagem (volta):
              <input type="number" name="bagagemPrecoVolta" value={flight.bagagemPrecoVolta} onChange={handleChange} className="mt-1 p-2 rounded border" />
            </label>

            <div className="flex flex-col text-lg font-bold justify-end">
              Total bagagem (volta): <strong className="text-xl font-extrabold">R$ {totalBagagemVolta.toFixed(2)}</strong>
            </div>
          </div>

          {/* Programa / Milhas - VOLTA */}
          <div className="grid text-lg font-bold grid-cols-1 md:grid-cols-4 gap-6 p-4 rounded-lg shadow">
            <label className="flex flex-col">
              Programa (volta):
              <select name="programaVolta" value={flight.programaVolta} onChange={handleChange} className="mt-1 p-2 rounded border">
                {["Latam", "Smiles", "Azul", "Iberia", "American Airlines", "British", "Qatar"].map((p) => (
                  <option className="text-lg font-bold bg-gray-400 text-gray-900" key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col">
              Milhas por passageiro (volta):
              <input type="number" step="1" name="milhasPorPassageiroVolta" value={flight.milhasPorPassageiroVolta} onChange={handleChange} className="mt-1 p-2 rounded border" />
            </label>

            <label className="flex flex-col">
              Preço do milheiro (volta):
              <input type="number" step="0.01" name="precoMilheiroVolta" value={flight.precoMilheiroVolta} onChange={handleChange} className="mt-1 p-2 rounded border" />
            </label>

            <div className="flex flex-col text-lg font-bold justify-end">
              Total (volta): <strong className="text-2xl font-extrabold">R$ {totalVolta.toFixed(2)}</strong>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col justify-end text-xl font-bold">
        Valor total: <h1 className="text-3xl font-extrabold">R$ {totalGeral.toFixed(2)}</h1>
      </div>

      <div className="pt-2">
        <Button className="p-7" onClick={gerarPDF}>
          <p className="font-extrabold text-xl">Gerar PDF</p>
        </Button>
      </div>
    </div>
  );
}
