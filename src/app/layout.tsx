import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crypto Analyzer - Análisis de Criptomonedas",
  description: "Sistema avanzado de análisis de criptomonedas con señales de trading y backtesting",
  keywords: ["criptomonedas", "trading", "análisis técnico", "bitcoin", "ethereum"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          {/* Header */}
          <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">₿</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Crypto Analyzer</h1>
                    <p className="text-xs text-gray-400">Sistema de Análisis y Trading</p>
                  </div>
                </div>
                
                <nav className="flex items-center space-x-4">
                  <a href="/" className="text-gray-300 hover:text-white transition-colors">
                    Dashboard
                  </a>
                  <a href="/indicators" className="text-gray-300 hover:text-white transition-colors">
                    Indicadores
                  </a>
                  <a href="/signals" className="text-gray-300 hover:text-white transition-colors">
                    Señales
                  </a>
                  <a href="/backtest" className="text-gray-300 hover:text-white transition-colors">
                    Backtesting
                  </a>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-gray-800/30 border-t border-gray-700 mt-12">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <p>© 2025 Crypto Analyzer - Desarrollado con Next.js y TypeScript</p>
                <p>Datos en tiempo real desde Binance</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

