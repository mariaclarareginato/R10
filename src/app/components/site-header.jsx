"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { SidebarTrigger } from "../components/ui/sidebar";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export function SiteHeader() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita problemas de hidratação
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // Tema atual real (resolve "system")
  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <header className="flex h-[--header-height] items-center border-b px-4 lg:px-6">
  {/* Área esquerda: botão da sidebar */}
  <div className="flex items-center">
    <SidebarTrigger />
  </div>

  {/* Área central: logo */}
  <div className="flex-1 flex justify-center">
    <img
      className="h-20 w-[120px] rounded-[20px] m-5"
      src="/logo.png"
      alt="Logo"
    />
  </div>

  {/* Área direita: dropdown de tema */}
  <div className="flex items-center justify-end">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="flex items-center gap-1 relative"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Claro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Escuro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>Sistema</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</header>

  );
}
