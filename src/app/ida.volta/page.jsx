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
    idaHora: "",
    idaAeroporto: "",
    idaChegadaAeroporto: "",
    idaTaxaManual: "",

    // Volta
    voltaData: "",
    voltaHora: "",
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

  // total de passageiros
  const totalPax =
    Number(flight.adultos || 0) + Number(flight.criancas || 0) + Number(flight.bebes || 0);

  // bagagens por trecho
  const totalBagagemIda =
    Number(flight.bagagemQuantidadeIda || 0) * Number(flight.bagagemPrecoIda || 0);
  const totalBagagemVolta =
    Number(flight.bagagemQuantidadeVolta || 0) * Number(flight.bagagemPrecoVolta || 0);

  // taxas (manual ou automática via aeroporto)
  const taxaIda = getAirportTax(flight.idaAeroporto, flight.idaTaxaManual, flight.classificacao);
  const taxaVolta =
    flight.tipoviagem === "Ida e Volta"
      ? getAirportTax(flight.voltaChegadaAeroporto, flight.voltaTaxaManual, flight.classificacao)
      : 0;

  // ===== CÁLCULOS DAS MILHAS (USANDO MILHEIRO: /1000 * precoMilheiro * pax) =====
  const valorMilhasIda =
    (Number(flight.milhasPorPassageiroIda || 0)) *
    Number(flight.precoMilheiroIda || 0) *
    totalPax;

  const valorMilhasVolta =
    flight.tipoviagem === "Ida e Volta"
      ? (Number(flight.milhasPorPassageiroVolta || 0)) *
        Number(flight.precoMilheiroVolta || 0) *
        totalPax
      : 0;

  // totais por trecho
  const totalIda = valorMilhasIda + Number(taxaIda || 0) + Number(totalBagagemIda || 0);
  const totalVolta =
    flight.tipoviagem === "Ida e Volta" ? valorMilhasVolta + Number(taxaVolta || 0) + Number(totalBagagemVolta || 0) : 0;

const totalGeral = totalIda + totalVolta;


// Sempre salva o total

useEffect(() => {
  localStorage.setItem("valorTotal", String(totalGeral));
}, [totalGeral]);

// Controle para impedir salvar vazio na primeira renderização
const [loaded, setLoaded] = useState(false);

// Carrega dados salvos quando a página abre
useEffect(() => {
  const savedData = localStorage.getItem("flightData");
  if (savedData) {
    setFlight(JSON.parse(savedData));
  }
  setLoaded(true);
}, []);

// Salva os dados do voo sempre que mudar,
// mas SOMENTE após carregar primeiro
useEffect(() => {
  if (!loaded) return; // evita sobrescrever com vazio ao iniciar
  localStorage.setItem("flightData", JSON.stringify(flight));
}, [flight, loaded]);



  // ========================
  // Helpers para o PDF
  // ========================
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

  const generatePDF = async () => {
    try {
      const doc = new jsPDF();

      // Converte a imagem (logo) para base64
      let logoBase64 = null;
      try {
        const candidate = logo && (logo.src || logo);
        logoBase64 = await toBase64(candidate);
      } catch (err) {
        console.warn("Não foi possível converter logo para base64:", err);
      }

      if (logoBase64) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const imgWidth = 40;
        const imgHeight = 30;
        const imgX = (pageWidth - imgWidth) / 2;
        doc.addImage(logoBase64, "PNG", imgX, 10, imgWidth, imgHeight);
      }

      let y = logoBase64 ? 50 : 20;

      // Título
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Orçamento e informações da viagem", 105, y, { align: "center" });
      doc.setFont("helvetica", "normal");

      y += 12;
      doc.setFontSize(12);

      const write = (label, value) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${label}: ${value ?? "-"}`, 15, y);
        y += 8;
      };

      // Dados gerais
      write("Classificação", flight.classificacao);
      write("Tipo de viagem", flight.tipoviagem);
      write("Adultos", flight.adultos);
      write("Crianças", flight.criancas);
      write("Bebês", flight.bebes);

      y += 4;

      // Ida
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Trecho: IDA", 15, y);
      doc.setFont("helvetica", "normal");
      y += 10;

      write("Data ida", flight.idaData);
      write("Hora ida", flight.idaHora);
      write("Aeroporto origem (ida)", flight.idaAeroporto);
      write("Aeroporto destino (ida)", flight.idaChegadaAeroporto);
      write("Taxa ida (R$)", flight.idaTaxaManual !== "" ? flight.idaTaxaManual : taxaIda.toFixed(2));
      write("Bagagens ida", `${flight.bagagemQuantidadeIda} x R$ ${flight.bagagemPrecoIda}`);
      write("Valor milhas (ida) R$", valorMilhasIda.toFixed(2));
      write("Total ida R$", totalIda.toFixed(2));

      // Volta (se houver)
      if (flight.tipoviagem === "Ida e Volta") {
        y += 6;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Trecho: VOLTA", 15, y);
        doc.setFont("helvetica", "normal");
        y += 10;

        write("Data volta", flight.voltaData);
        write("Hora volta", flight.voltaHora);
        write("Aeroporto origem (volta)", flight.voltaAeroporto);
        write("Aeroporto destino (volta)", flight.voltaChegadaAeroporto);
        write("Taxa volta (R$)", flight.voltaTaxaManual !== "" ? flight.voltaTaxaManual : taxaVolta.toFixed(2));
        write("Bagagens volta", `${flight.bagagemQuantidadeVolta} x R$ ${flight.bagagemPrecoVolta}`);
        write("Valor milhas (volta) R$", valorMilhasVolta.toFixed(2));
        write("Total volta R$", totalVolta.toFixed(2));
      }

      y += 8;
      // Total geral
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`Total geral: R$ ${totalGeral.toFixed(2)}`, 105, y, { align: "center" });

      doc.save("orcamento_viagem.pdf");
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Ocorreu um erro ao gerar o PDF. Veja o console para mais detalhes.");
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

      <h1 className="text-4xl font-extrabold text-center mb-6">
        Orçamento de Viagem ✈️
      </h1>

      {/* Passageiros e Trecho */}

<br></br>
      <div>
          <h1 className="text-3xl font-bold underline">Dados gerais - </h1>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-lg shadow">
        <label className="flex flex-col text-lg font-semibold">
          Classificação:
          <select
            name="classificacao"
            value={flight.classificacao}
            onChange={handleChange}
            className="mt-1 p-2 text-lg rounded border"
          >
            <option className='bg-gray-300 font-semibold text-gray-700' value="Nacional">Nacional</option>
            <option className='bg-gray-300 font-semibold text-gray-700' value="Internacional">Internacional</option>
          </select>
        </label>

        <label className="flex flex-col text-lg font-semibold">
          Trecho:
          <select
            name="tipoviagem"
            value={flight.tipoviagem}
            onChange={handleChange}
            className="mt-1 p-2 rounded border"
          >
            <option className='bg-gray-300 font-semibold text-gray-700' value="Ida">Somente ida</option>
            <option className='bg-gray-300 font-semibold text-gray-700' value="Ida e Volta">Ida e volta</option>
          </select>
        </label>

        <div className="flex flex-col justify-center">
          <span className="font-semibold text-lg mb-1">Total de passageiros:</span>
          <div className="text-xl font-bold">{totalPax}</div>
        </div>

        <label className="flex flex-col text-lg font-semibold">
          Adultos:
          <select
            name="adultos"
            value={flight.adultos}
            onChange={handleChange}
            className="mt-1 p-2 rounded border"
          >
            {Array.from({ length: 10 }, (_, i) => i).map((n) => (
              <option className='bg-gray-300 font-semibold text-gray-700' key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-lg font-semibold">
          Crianças (2-11):
          <select
            name="criancas"
            value={flight.criancas}
            onChange={handleChange}
            className="mt-1 p-2 rounded border"
          >
            {Array.from({ length: 10 }, (_, i) => i).map((n) => (
              <option className='font-semibold bg-gray-300 text-gray-700' key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-lg font-semibold">
          Bebês (0-2):
          <select
            name="bebes"
            value={flight.bebes}
            onChange={handleChange}
            className="mt-1 p-2 rounded border"
          >
            {Array.from({ length: 4 }, (_, i) => i).map((n) => (
              <option className='font-semibold bg-gray-300 text-gray-700' key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>



      {/* Ida */}

         <div>
          <h1 className="text-3xl font-bold underline">Dados ida - </h1>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-lg shadow">
        <div className="flex flex-col font-semibold text-lg">
          <label>Data ida:</label>
          <input
            type="date"
            name="idaData"
            value={flight.idaData}
            onChange={handleChange}
            className="mt-1 p-2 rounded border"
          />
          <label className="mt-3">Hora ida:</label>
          <input
            type="time"
            name="idaHora"
            value={flight.idaHora}
            onChange={handleChange}
            className="mt-1 p-2 rounded border"
          />
        </div>

        <label className="flex flex-col font-semibold text-lg">
          Aeroporto ida (origem):
          <input
            type="text"
            maxLength={3}
            name="idaAeroporto"
            value={flight.idaAeroporto}
            onChange={handleChange}
            className="mt-1 p-2 rounded text-center border uppercase"
          />
        </label>

        <label className="flex flex-col font-semibold text-lg">
          Aeroporto ida (destino):
          <input
            type="text"
            maxLength={3}
            name="idaChegadaAeroporto"
            value={flight.idaChegadaAeroporto}
            onChange={handleChange}
            className="mt-1 p-2 rounded text-center border uppercase"
          />
        </label>

        <label className="flex flex-col font-semibold text-lg">
          Taxa ida (manual se necessário):
          <input
            type="number"
            name="idaTaxaManual"
            value={flight.idaTaxaManual}
            onChange={handleChange}
            className="mt-1 p-2 rounded text-center border"
          />
          <span className="text-lg mt-1">
            <p>Valor automático: </p> R$ {getAirportTax(flight.idaAeroporto, "", flight.classificacao).toFixed(2)}
          </span>
        </label>

        <label className="flex flex-col font-semibold text-lg">
          Bagagem ida (quantidade):
          <select
            name="bagagemQuantidadeIda"
            value={flight.bagagemQuantidadeIda}
            onChange={handleChange} 
            className="mt-1 p-2 rounded border"
          >
            {Array.from({ length: 11 }, (_, i) => i).map((n) => (
              <option className='font-semibold bg-gray-300 text-gray-700' key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col font-semibold text-lg">
          Valor unitário (R$) - bagagem ida:
          <input
            type="number"
            name="bagagemPrecoIda"
            value={flight.bagagemPrecoIda}
            onChange={handleChange}
            className="mt-1 p-2 rounded border"
          />
        </label>

        <div className="flex flex-col justify-end font-semibold text-lg">
          Total bagagem ida: <strong className="text-xl">R$ {totalBagagemIda.toFixed(2)}</strong>
        </div>
      </div>

      {/* Programa / Milhas - IDA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-lg shadow">
        <label className="flex flex-col font-semibold text-lg">
          Programa ida:
          <select
            name="programaIda"
            value={flight.programaIda}
            onChange={handleChange}
            className="mt-1 p-2 rounded border"
          >
            {["Latam", "Smiles", "Azul", "Iberia", "American Airlines", "British", "Qatar"].map((p) => (
              <option className='bg-gray-300 text-gray-700 font-semibold' key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col font-semibold text-lg">
          Milhas por passageiro (ida):
          <input
            type="number"
            step="1"
            name="milhasPorPassageiroIda"
            value={flight.milhasPorPassageiroIda}
            onChange={handleChange}
            className="mt-1 p-2 rounded border"
          />
        </label>

        <label className="flex flex-col justify-end font-semibold text-lg">
          Preço do milheiro - R$ (ida):
          <input
            type="number"
            step="0.01"
            name="precoMilheiroIda"
            value={flight.precoMilheiroIda}
            onChange={handleChange}
            className="mt-1 p-2 rounded border"
          />
        </label>

        <div className="flex flex-col justify-end text-lg font-semibold">
          Total Ida: <strong className="text-2xl">R$ {totalIda.toFixed(2)}</strong>
        </div>
      </div>

      {/* Volta */}


      {flight.tipoviagem === "Ida e Volta" && (
        <>
        <div>
          <h1 className="text-3xl font-bold underline">Dados volta - </h1>
        </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-lg shadow">
            <div className="flex flex-col font-semibold text-lg">
              <label>Data volta:</label>
              <input
                type="date"
                name="voltaData"
                value={flight.voltaData}
                onChange={handleChange}
                className="mt-1 p-2 rounded border"
              />
              <label className="mt-3">Hora volta:</label>
              <input
                type="time"
                name="voltaHora"
                value={flight.voltaHora}
                onChange={handleChange}
                className="mt-1 p-2 rounded border"
              />
            </div>

            <label className="flex flex-col font-semibold text-lg">
              Aeroporto volta (origem):
              <input
                type="text"
                maxLength={3}
                name="voltaAeroporto"
                value={flight.voltaAeroporto}
                onChange={handleChange}
                className="mt-1 p-2 rounded text-center border uppercase"
              />
            </label>

            <label className="flex flex-col font-semibold text-lg">
              Aeroporto volta (destino):
              <input
                type="text"
                maxLength={3}
                name="voltaChegadaAeroporto"
                value={flight.voltaChegadaAeroporto}
                onChange={handleChange}
                className="mt-1 p-2 rounded text-center border uppercase"
              />
            </label>

            <label className="flex flex-col font-semibold text-lg">
              Taxa volta (manual se necessário):
              <input
                type="number"
                name="voltaTaxaManual"
                value={flight.voltaTaxaManual}
                onChange={handleChange}
                className="mt-1 p-2 rounded text-center border"
              />
              <span className="text-lg mt-1">
               <p> Valor automático: </p>R$ {getAirportTax(flight.voltaChegadaAeroporto, "", flight.classificacao).toFixed(2)}
              </span>
            </label>

            <label className="flex flex-col font-semibold text-lg">
              Bagagem volta (quantidade):
              <select
                name="bagagemQuantidadeVolta"
                value={flight.bagagemQuantidadeVolta}
                onChange={handleChange}
                className="mt-1 p-2 rounded border"
              >
                {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                  <option className='font-semibold bg-gray-300 text-gray-700' key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col font-semibold text-lg">
              Valor unitário (R$) - bagagem volta:
              <input
                type="number"
                name="bagagemPrecoVolta"
                value={flight.bagagemPrecoVolta}
                onChange={handleChange}
                className="mt-1 p-2 rounded border"
              />
            </label>

            <div className="flex flex-col justify-end font-semibold text-lg">
              Total bagagem volta: <strong className="text-xl font-semibold">R$ {totalBagagemVolta.toFixed(2)}</strong>
            </div>
          </div>

          {/* Programa / Milhas - VOLTA */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-lg shadow">
            <label className="flex flex-col font-semibold text-lg">
              Programa volta:
              <select
                name="programaVolta"
                value={flight.programaVolta}
                onChange={handleChange}
                className="mt-1 p-2 rounded border"
              >
                {["Latam", "Smiles", "Azul", "Iberia", "American Airlines", "British", "Qatar"].map((p) => (
                  <option  className='font-semibold bg-gray-300 text-gray-700' key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col font-semibold text-lg">
              Milhas por passageiro (volta):
              <input
                type="number"
                step="1"
                name="milhasPorPassageiroVolta"
                value={flight.milhasPorPassageiroVolta}
                onChange={handleChange}
                className="mt-1 p-2 rounded border"
              />
            </label>

            <label className="flex flex-col font-semibold text-lg">
              Preço do milheiro - R$ (volta):
              <input
                type="number"
                step="0.01"
                name="precoMilheiroVolta"
                value={flight.precoMilheiroVolta}
                onChange={handleChange}
                className="mt-1 p-2 rounded border"
              />
            </label>

            <div className="flex flex-col justify-end text-lg font-bold">
              <p> Total Volta: </p> <strong className="text-2xl">R$ {totalVolta.toFixed(2)}</strong>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col justify-end text-xl font-bold">
        Valor total: <h1 className="text-3xl font-extrabold">R$ {totalGeral.toFixed(2)}</h1>
      </div>

      <div>
        <Button className="p-7" onClick={generatePDF}><p className="font-bold text-xl">Gerar PDF</p></Button>
      </div>
    </div>
  );
}
