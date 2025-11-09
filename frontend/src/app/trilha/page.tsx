"use client";

import { useState } from 'react';
import ListaSecoes from '@/components/ListaSecoes';
import DetalheSecao from '@/components/DetalheSecao';
import TelaAula from '@/components/TelaAula';
import AppLayout from '@/components/AppLayout'; // Vamos criar este layout reutilizável

export default function TrilhaPage() {
  const [view, setView] = useState<'lista' | 'detalhe' | 'aula'>('lista');
  const [secaoAtiva, setSecaoAtiva] = useState<number | null>(null);
  const [etapaAtiva, setEtapaAtiva] = useState<number | null>(null);
  const [refreshTrilha, setRefreshTrilha] = useState(0);

  const handleNavigateToDetalhe = (order: number) => {
    setSecaoAtiva(order);
    setView('detalhe');
  };

  const handleNavigateToAula = (orderDaEtapa: number) => {
    setEtapaAtiva(orderDaEtapa);
    setView('aula');
  };

  const handleBackToLista = () => {
    setView('lista');
  };

  const handleBackToDetalhe = () => {
    setView('detalhe');
  };

  const handleEtapaConcluida = () => {
    setRefreshTrilha(prev => prev + 1);
    setView('detalhe');
  };

  const renderContent = () => {
    switch (view) {
      case 'detalhe':
        if (secaoAtiva === null) return null;
        return (
          <>
            <button onClick={handleBackToLista} className="mb-4 text-teal-600 font-semibold hover:underline">&larr; Voltar para a Trilha ENEM</button>
            <DetalheSecao secaoOrder={secaoAtiva} onEtapaClick={handleNavigateToAula} />
          </>
        );
      case 'aula':
        if (secaoAtiva === null || etapaAtiva === null) return null;
        return (
          <TelaAula 
            secaoOrder={secaoAtiva} 
            etapaOrder={etapaAtiva} 
            onVoltar={handleBackToDetalhe} 
            onEtapaConcluida={handleEtapaConcluida} 
          />
        );
      case 'lista':
      default:
        return (
          <>
            <div className="bg-teal-600 text-white p-6 rounded-2xl mb-8">
              <h1 className="text-3xl font-bold">Trilha ENEM</h1>
              <p>Vamos estudar com qualidade? O Portinho preparou a rota completa até o ENEM</p>
            </div>
            <ListaSecoes onSecaoClick={handleNavigateToDetalhe} refreshTrigger={refreshTrilha} />
          </>
        );
    }
  };

  return (
    <AppLayout>
      {renderContent()}
    </AppLayout>
  );
}