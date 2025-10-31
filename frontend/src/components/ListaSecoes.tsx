"use client"

import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';

// --- INTERFACES (Definindo a "forma" dos dados) ---
interface IEtapa {
  title: string;
  order: number;
}

interface ISecao {
  _id: string;
  title: string;
  description: string;
  order: number;
  etapas: IEtapa[];
}

interface IProgresso {
  secaoAtual: number;
}

// Interface para a resposta completa da nossa API
interface ListaSecoesResponse {
  secoes: ISecao[];
  progresso: IProgresso;
}

interface ListaSecoesProps {
  onSecaoClick: (secaoOrder: number) => void;
  refreshTrigger: number; // <-- NOVA PROP
}

export default function ListaSecoes({ onSecaoClick, refreshTrigger }: ListaSecoesProps) {
  const [secoes, setSecoes] = useState<ISecao[]>([]);
  const [progresso, setProgresso] = useState<IProgresso | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrilhaData = async () => {
      // O bloco try começa aqui e deve englobar toda a lógica da requisição
      try {
        const token = localStorage.getItem('authToken');
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/trilha`;
        
        const response = await axios.get<ListaSecoesResponse>(apiUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Estas linhas PRECISAM estar dentro do try, pois dependem da 'response'
        setSecoes(response.data.secoes);
        setProgresso(response.data.progresso);

      // A chave '}' do try fecha aqui, ANTES do catch
      } catch (err) {
        setError('Não foi possível carregar a trilha. Tente novamente.');
        console.error("Erro detalhado ao buscar trilha:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrilhaData();
  }, [refreshTrigger]); // Dependências vazias para rodar apenas uma vez

  if (isLoading) {
    return <div className="text-center p-10">Carregando Trilha...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-10">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {secoes.map((secao) => {
        const isUnlocked = progresso ? secao.order <= progresso.secaoAtual : false;
        const isCurrent = progresso ? secao.order === progresso.secaoAtual : false;
        
        const progressoPercentual = isCurrent ? 10 : (isUnlocked && !isCurrent ? 100 : 0);

        return (
          <div 
            key={secao._id}
            className={`p-4 rounded-2xl transition-all duration-300 ${isUnlocked ? 'bg-white border border-gray-200 shadow-sm' : 'bg-gray-100 opacity-70'}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">{secao.title}</h3>
                <p className="text-sm text-gray-500 mb-3">
                  {secao.etapas.length} unidades { !isUnlocked && '🔒' }
                </p>

                {isUnlocked && (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                      <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${progressoPercentual}%` }}></div>
                    </div>
                    <button 
                      onClick={() => onSecaoClick(secao.order)}
                      className="bg-teal-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                      {isCurrent ? 'Continuar' : 'Revisar'}
                    </button>
                  </>
                )}
                {!isUnlocked && (
                   <button 
                      disabled
                      className="bg-gray-400 text-white px-6 py-2 rounded-xl font-semibold cursor-not-allowed"
                    >
                      Ir para Seção {secao.order}
                    </button>
                )}
              </div>
              <div className="hidden sm:block">
                <Image src="/images/logoPortinho.png" alt="Mascote Portflow" width={100} height={100} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}