// src/components/TelaAula.tsx
"use client"

import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Quiz from './Quiz'; // Garantindo que o componente Quiz seja importado

// --- INTERFACES ---
// /src/components/TelaAula.tsx
interface IQuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string; // <-- ADICIONE ESTA LINHA
}
interface IEtapa {
  title: string;
  content: string;
  quiz: IQuizQuestion[];
}
interface DetalheEtapaResponse {
  etapa: IEtapa;
}
interface TelaAulaProps {
  secaoOrder: number;
  etapaOrder: number;
  onVoltar: () => void;
  onEtapaConcluida: () => void;
}

export default function TelaAula({ secaoOrder, etapaOrder, onVoltar, onEtapaConcluida }: TelaAulaProps) {
  const [etapa, setEtapa] = useState<IEtapa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(''); // Corrigido para string

  useEffect(() => {
    const fetchEtapaData = async () => {
      setIsLoading(true); // Adicionado para consistência
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get<DetalheEtapaResponse>(`http://localhost:3001/api/trilha/secao/${secaoOrder}/etapa/${etapaOrder}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEtapa(response.data.etapa);
      } catch (err) {
        setError("Não foi possível carregar os dados da aula."); // Adicionado feedback de erro
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEtapaData();
  }, [secaoOrder, etapaOrder]);

  const handleCompletarEtapa = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('http://localhost:3001/api/trilha/completar-etapa', 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Parabéns! Etapa concluída."); 
      onEtapaConcluida();

    } catch (error) {
      console.error("Erro ao completar etapa:", error);
      toast.error("Não foi possível salvar seu progresso."); // Trocado alert por toast
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Carregando Aula...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  if (!etapa) {
    return <div className="text-center p-10 text-red-500">Conteúdo da aula não encontrado.</div>;
  }

  return (
    <div>
      <button onClick={onVoltar} className="mb-4 text-teal-600 font-semibold hover:underline">
        &larr; Voltar para a Trilha
      </button>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{etapa.title}</h1>
        
        <div className="prose lg:prose-xl max-w-none" dangerouslySetInnerHTML={{ __html: etapa.content }} />

        {/* LÓGICA CORRIGIDA: Renderiza o Quiz se ele existir, ou o botão de Concluir se não houver quiz */}
        {etapa.quiz && etapa.quiz.length > 0 ? (
          <Quiz questions={etapa.quiz} onQuizComplete={handleCompletarEtapa} />
        ) : (
          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleCompletarEtapa}
              className="bg-teal-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-teal-700"
            >
              Marcar como Concluída
            </button>
          </div>
        )}
      </div>
    </div>
  );
}