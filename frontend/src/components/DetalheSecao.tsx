// src/components/DetalheSecao.tsx
"use client"

import { useState, useEffect } from 'react';
import axios from 'axios';

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
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get<DetalheSecaoResponse>(`http://localhost:3001/api/trilha/secao/${secaoOrder}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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

  const progressoTotal = progresso.etapaAtual > secao.etapas.length 
    ? 100 
    : ((progresso.etapaAtual - 1) / secao.etapas.length) * 100;

  // Dentro do componente DetalheSecao, substitua o return inteiro

  return (
    <div>
      {/* Card Superior */}
      <div className="bg-teal-600 text-white p-6 rounded-2xl mb-8">
        <h1 className="text-3xl font-bold">{secao.title}</h1>
        <p className="text-teal-100 mt-1">{secao.description}</p>
        <p className="text-sm font-semibold mt-4 mb-1">Meu Progresso</p>
        <div className="w-full bg-teal-800 rounded-full h-2.5">
          <div className="bg-white h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressoTotal}%` }}></div>
        </div>
      </div>

      {/* Trilha Simplificada */}
      <div className="flex flex-col items-center">
        {secao.etapas.map((etapa, index) => {
          const isCompleted = progresso.etapaAtual > etapa.order;
          const isActive = progresso.etapaAtual === etapa.order;
          const isLocked = progresso.etapaAtual < etapa.order;
          const isLastElement = index === secao.etapas.length - 1;

          const isClickable = isActive || isCompleted;

          return (
            <div key={etapa._id} className="flex flex-col items-center">
              {/* Círculo da Etapa */}
              <div 
                // ADICIONADO AQUI:
                onClick={() => isClickable && onEtapaClick(etapa.order)}
                className="relative" // Adicionado para o tooltip
              >
                <div 
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-300
                    ${isActive ? 'bg-teal-600 border-white shadow-lg scale-110 z-10 cursor-pointer' : ''}
                    ${isCompleted ? 'bg-teal-500 border-teal-200' : ''}
                    ${isLocked ? 'bg-gray-300 border-gray-100' : ''}
                  `}
                >
                  <IconeEtapa iconName={etapa.icon} />
                </div>
                {/* Tooltip para a etapa ativa */}
                {isActive && (
                  <div className="absolute bottom-full mb-2 w-48 bg-teal-700 text-white text-center text-sm rounded-lg p-2 transform -translate-x-1/2 left-1/2">
                    <p className="font-bold">{etapa.title}</p>
                    <p className="text-xs">Clique para iniciar a aula</p>
                    <div className="absolute top-full left-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-teal-700 transform -translate-x-1/2"></div>
                  </div>
                )}
              </div>
              
              {/* Linha de Conexão Vertical */}
              {!isLastElement && (
                <div className="w-1 h-16 bg-teal-200"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}