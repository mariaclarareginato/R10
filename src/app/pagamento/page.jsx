'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Button } from '../components/ui/button.jsx';
import logo from '../../../public/logo.png';
import { useSearchParams } from "next/navigation";


export default function ParcelamentoPage() {

  // Taxas
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
    { p: 12, link: 20.00, maquina: 14.16 }
  ];

  const [total, setTotal] = useState(0);
  const [metodo, setMetodo] = useState('link');
  const [parcelas, setParcelas] = useState(1);

const searchParams = useSearchParams();

useEffect(() => {
  const valorURL = searchParams.get("total");

  if (valorURL) {
    const numero = parseFloat(valorURL);
    setTotal(isNaN(numero) ? 0 : numero);
    localStorage.setItem("valorTotal", numero.toString());
  } else {
    const saved = localStorage.getItem("valorTotal");
    if (saved) {
      setTotal(parseFloat(saved));
    }
  }
}, [searchParams]);


  const taxaSelecionada = taxas.find(t => t.p === parcelas);
  const percentual = taxaSelecionada ? taxaSelecionada[metodo] : 0;
  const valorComTaxa = total + (total * percentual) / 100;
  const valorParcela = valorComTaxa / parcelas;


  // PDF

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

  const gerarPDF = async () => {
    try {
      const doc = new jsPDF();

      // Converte a imagem para base64
      let logoBase64 = null;
      try {
        const candidate = logo && (logo.src || logo);
        logoBase64 = await toBase64(candidate);
      } catch (err) {
        console.warn("Não foi possível converter logo:", err);
      }

      let y = 20;

      if (logoBase64) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const imgWidth = 40;
        const imgHeight = 30;
        const imgX = (pageWidth - imgWidth) / 2;
        doc.addImage(logoBase64, "PNG", imgX, 10, imgWidth, imgHeight);
        y = 50; // Texto começa abaixo da imagem
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Resumo do Pagamento`, 105, y, { align: "center" });
      doc.setFont("helvetica", "normal");
  
      y += 10;
      doc.text(`Método: ${metodo === 'link' ? 'Link de Pagamento' : 'Maquininha'}`, 10, y);
      y += 10;
      doc.text(`Parcelas: ${parcelas}x`, 10, y);
      y += 10;
      doc.text(`Valor Final: R$ ${valorComTaxa.toFixed(2)}`, 10, y);
      y += 10;
      doc.text(`Valor por Parcela: R$ ${valorParcela.toFixed(2)}`, 10, y);

      doc.save('pagamento-viagem.pdf');
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto rounded-xl space-y-5">
      <h2 className="text-3xl md:text-4xl font-bold p-5">Parcelamento do Pagamento $</h2>
      <p className='text-lg font-semibold'>Valor total: <strong className='font-extrabold text-2xl'>R$ {total.toFixed(2)}</strong></p> 

      <div className="space-y-2">
        <label className='text-lg font-semibold'>Método de Pagamento:</label>
        <select
          className="p-2 text-2xl font-extrabold rounded"
          value={metodo}
          onChange={e => setMetodo(e.target.value)}
        >
          <option className='bg-gray-300 text-lg text-gray-700' value="link">Link</option>
          <option className='bg-gray-300 text-lg text-gray-700' value="maquina">Maquininha</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className='text-lg font-semibold' >Parcelas:</label>
        <select
          className="p-2 text-2xl font-extrabold rounded"
          value={parcelas}
          onChange={e => setParcelas(Number(e.target.value))}
        
        >
          {taxas.map((t) => (
            <option className='bg-gray-300 text-lg text-gray-700' key={t.p} value={t.p}>{t.p}x</option>
          ))}
        </select>
      </div>

      <div className="border p-4 rounded space-y-1">
        <p className='text-lg font-semibold'>Taxa: <strong className='text-2xl front-extrabold'>{percentual}%</strong></p>
        <p className='text-lg font-semibold'>Total com taxa: <strong className='text-2xl front-extrabold'>R$ {valorComTaxa.toFixed(2)}</strong></p>
        <p className='text-lg font-semibold'>Parcela: <strong className='text-2xl front-extrabold'>R$ {valorParcela.toFixed(2)}</strong></p>
      </div>

      <Button className="p-7" onClick={gerarPDF}>
        <p className="font-bold text-xl">Gerar PDF</p>
      </Button>
    </div>
  );
}
