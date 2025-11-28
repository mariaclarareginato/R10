export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-6 bg-background text-foreground">
      {/* Imagem */}
      <img
        src="/logo.png"
        alt="Logo da empresa"
        className="w-32 h-auto m-30"
      />

      {/* Texto principal */}
      <h1 className="text-9xl font-extrabold drop-shadow-lg animate-bounce">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Página não encontrada</h2>
      <p className="mt-2 font-bold">
        Poxa! Parece que você se perdeu, ou não tem acesso a essa página.
      </p>

      {/* Botão de voltar */}
      <a
        href="/"
        className="mt-6 px-6 py-3 rounded-2xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors duration-200"
      >
        Voltar para a página inicial
      </a>
    </div>
  );
}
