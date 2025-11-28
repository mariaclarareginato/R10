
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "R10 Viagens",
  description: "Sistema para a R10: cálculo de preço",
};

export default function RootLayout({children}) {

  return (
    <html lang="ptBR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ant ialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
        {children}
         </ThemeProvider>
      </body>
    </html>
  );
}
