import { Toaster } from 'react-hot-toast';
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import 'react-day-picker/dist/style.css'
import "./globals.css"



const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Portflow - Plataforma de Estudos",
  description: "Plataforma educacional gamificada para auxiliar estudantes na preparação para o ENEM, com foco em Língua Portuguesa",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" /> {/* 2. Adicionar o componente */}
      </body>
    </html>
  )
}