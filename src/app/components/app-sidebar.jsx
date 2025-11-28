"use client"

import { useEffect, useState } from "react"
import { NavMain } from "../components/nav-main"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "../components/ui/sidebar"

export function AppSidebar({ ...props }) {
  const [user, setUser] = useState({ name: "", email: "" })

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const data = {
    navegacao: [
      { name: "Ida/volta", url: "/ida.volta" },
      { name: "Pagamento", url: "/pagamento" },
    ],
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Header */}
      <SidebarHeader className="hover:bg-transparent transition-none">
         <SidebarHeader>
        <div className="flex w-full items-center justify-center p-5">
          <h1 className="text-3xl font-extrabold text-center leading-tight">
            R10 Viagens
          </h1>
        </div>
        </SidebarHeader>
      </SidebarHeader>

      {/* Conteúdo da Sidebar */}
      <SidebarContent className="font-semibold text-lg">
        <NavMain items={data.navegacao} />
      </SidebarContent>
    </Sidebar>
  )
}
