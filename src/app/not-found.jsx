"use client";

import { Button } from "./components/ui/button";
import { Navigation } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-6 bg-background text-foreground">
      {/* Imagem */}
      <img
        src="/logo.png"
        alt="Logo da empresa"
        className="w-32 h-auto m-10 rounded"
      />

      {/* Texto principal */}
      <h1 className="text-9xl font-extrabold drop-shadow-lg animate-bounce">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Página não encontrada</h2>
      <p className="mt-2 font-bold">
        Poxa! Parece que você se perdeu, ou não tem acesso a essa página.
      </p>

      {/* Botão de voltar */}
      <Button
        onClick={() => router.push("/")}
        className="mt-6 px-6 p-6 py-3 rounded-2xl text-lg font-semibold hover:bg-blue-600 transition-colors duration-200"
      >
        <p className="p-5">Voltar para a página inicial</p>
      </Button>
    </div>
  );
}
