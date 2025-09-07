// src/components/TelaAula.tsx
"use client"

import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import axios from 'axios';

// --- INTERFACES ---
interface IEtapa {
  title: string;
  content: string;
  // Futuramente, aqui teremos o conteúdo da aula, quiz, etc.
}

// Interface para a resposta da nossa API
interface DetalheEtapaResponse {
  etapa: IEtapa;
}

interface TelaAulaProps {
  secaoOrder: number;
  etapaOrder: number;
  onVoltar: () => void; // Função para voltar para a trilha
  onEtapaConcluida: () => void; // Função para marcar a etapa como concluída

}

export default function TelaAula({ secaoOrder, etapaOrder, onVoltar, onEtapaConcluida }: TelaAulaProps) {
  const [etapa, setEtapa] = useState<IEtapa | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEtapaData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        // CORREÇÃO: Dizendo ao Axios qual o tipo de dados esperamos
        const response = await axios.get<DetalheEtapaResponse>(`http://localhost:3001/api/trilha/secao/${secaoOrder}/etapa/${etapaOrder}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Agora o TypeScript sabe que response.data tem a propriedade 'etapa'
        setEtapa(response.data.etapa);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEtapaData();
  }, [secaoOrder, etapaOrder]);

  if (isLoading) {
    return <div className="text-center p-10">Carregando Aula...</div>;
  }

  if (!etapa) {
    return <div className="text-center p-10 text-red-500">Não foi possível carregar o conteúdo da aula.</div>;
  }

  const handleCompletarEtapa = async () => {
  try {
    const token = localStorage.getItem('authToken');
    await axios.post('http://localhost:3001/api/trilha/completar-etapa', 
      {}, // Corpo da requisição vazio, pois o backend pega o ID do aluno pelo token
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    toast.success("Parabéns! Etapa concluída."); 
    onEtapaConcluida(); // Avisa a página principal para atualizar o estado

  } catch (error) {
    console.error("Erro ao completar etapa:", error);
    alert("Não foi possível salvar seu progresso. Tente novamente.");
  }
};

  return (
    <div>
      <button onClick={onVoltar} className="mb-4 text-teal-600 font-semibold hover:underline">
        &larr; Voltar para a Trilha
      </button>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{etapa.title}</h1>
        
        <div className="prose lg:prose-xl max-w-none">
          {/* CORREÇÃO: Renderizando o conteúdo HTML do backend */}
          <div dangerouslySetInnerHTML={{ __html: etapa.content }} />
        </div>

        {/* CORREÇÃO: Apenas um botão, no lugar certo, com a função conectada */}
        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleCompletarEtapa}
            className="bg-teal-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-teal-700"
          >
            Marcar como Concluída
          </button>
        </div>
      </div>
    </div>
  );
}