"use client";

import Link from 'next/link';
import Chatbot from './Chatbot';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-16 bg-white border-r h-screen sticky top-0 flex flex-col items-center py-4 space-y-4 z-40">
          <Link href="/">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-300 to-orange-400 rounded-xl flex items-center justify-center shadow-lg cursor-pointer">
              <span>🐱</span>
            </div>
          </Link>
          <nav className="flex flex-col space-y-3">
            <Link href="/">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200" title="Dashboard">
                <span>🏠</span>
              </div>
            </Link>
            <Link href="/trilha">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200" title="Trilha">
                <span>📚</span>
              </div>
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Chatbot />
    </div>
  );
}