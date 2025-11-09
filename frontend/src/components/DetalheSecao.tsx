"use client"

import { useState, useEffect } from 'react';
import { api } from '@/services/api';

// --- INTERFACES ---
interface IEtapa {
  _id: string;
  title: string;
  icon: string;
  order: number;
}
interface ISecao {
  title: string;
  description: string;
  etapas: IEtapa[];
}
interface IProgresso {
  etapaAtual: number;
}
interface DetalheSecaoResponse {
  secao: ISecao;
  progresso: IProgresso;
}
interface DetalheSecaoProps {
  secaoOrder: number;
  onEtapaClick: (etapaOrder: number) => void;
}

const IconeEtapa = ({ iconName }: { iconName: string }) => {
  const iconMap: { [key: string]: string } = {
    book: '📖', pencil: '✏️', abc: '🔤',
    repeat: '🔁', undo: '↩️', info: 'ℹ️', flag: '🏁',
  };
  return <span className="text-2xl">{iconMap[iconName] || '🔘'}</span>;
};

export default function DetalheSecao({ secaoOrder, onEtapaClick }: DetalheSecaoProps) {
  const [secao, setSecao] = useState<ISecao | null>(null);
  const [progresso, setProgresso] = useState<IProgresso | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!secaoOrder) return;
    const fetchDetalheData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get<DetalheSecaoResponse>(`/trilha/secao/${secaoOrder}`);
        setSecao(response.data.secao);
        setProgresso(response.data.progresso);
      } catch (err) {
        setError('Não foi possível carregar os detalhes da seção.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetalheData();
  }, [secaoOrder]);

  if (isLoading) {
    return <div className="text-center p-10">Carregando Seção...</div>;
  }

  if (error || !secao || !progresso) {
    return <div className="text-red-500 text-center p-10">{error || 'Dados não encontrados.'}</div>;
  }

  // --- 1. LÓGICA DA BARRA DE PROGRESSO ---
  // Se a etapa atual for 3, significa que 2 etapas foram completas.
  // A fórmula é (etapas completas / total de etapas) * 100.
  const etapasCompletas = progresso.etapaAtual - 1;
  const totalEtapas = secao.etapas.length;
  // Garante que o progresso não passe de 100% se o usuário já terminou a seção
  const progressoPercentual = Math.min((etapasCompletas / totalEtapas) * 100, 100);

  return (
    <div>
      {/* Card Superior com a Barra de Progresso */}
      <div className="bg-teal-600 text-white p-6 rounded-2xl mb-8">
        <h1 className="text-3xl font-bold">{secao.title}</h1>
        <p className="text-teal-100 mt-1">{secao.description}</p>
        <p className="text-sm font-semibold mt-4 mb-1">Meu Progresso</p>
        <div className="w-full bg-teal-800 rounded-full h-2.5">
          <div 
            className="bg-white h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progressoPercentual}%` }}
          ></div>
        </div>
      </div>

      {/* Trilha Vertical com Lógica de Travamento */}
      <div className="flex flex-col items-center">
        {secao.etapas.map((etapa, index) => {
          // --- 2. LÓGICA DE TRAVAMENTO DAS AULAS ---
          const isCompleted = progresso.etapaAtual > etapa.order;
          const isActive = progresso.etapaAtual === etapa.order;
          const isLocked = progresso.etapaAtual < etapa.order;
          
          const isClickable = isActive || isCompleted;
          const isLastElement = index === secao.etapas.length - 1;

          return (
            <div key={etapa._id} className="flex flex-col items-center w-full">
              <div 
                onClick={() => isClickable && onEtapaClick(etapa.order)}
                className={`relative flex items-center gap-4 w-full max-w-sm p-4 rounded-2xl border-2 transition-all duration-300
                  ${isActive ? 'bg-white shadow-lg scale-105 z-10 cursor-pointer border-teal-500' : ''}
                  ${isCompleted ? 'bg-white border-gray-200 cursor-pointer hover:bg-teal-50' : ''}
                  ${isLocked ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed' : ''}
                `}
              >
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                    ${isActive ? 'bg-teal-600 text-white' : ''}
                    ${isCompleted ? 'bg-teal-500 text-white' : ''}
                    ${isLocked ? 'bg-gray-300 text-gray-500' : ''}
                  `}
                >
                  <IconeEtapa iconName={etapa.icon} />
                </div>
                <span className={`font-bold ${isLocked ? 'text-gray-500' : 'text-gray-800'}`}>
                  {etapa.title}
                </span>
              </div>
              
              {!isLastElement && (
                <div className={`w-1 h-8 ${isCompleted || isActive ? 'bg-teal-300' : 'bg-gray-300'}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
