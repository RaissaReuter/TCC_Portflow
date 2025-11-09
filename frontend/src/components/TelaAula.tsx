"use client"

import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Quiz from './Quiz';
import { api } from '@/services/api';

// --- INTERFACES ---
interface IContentSection {
  title?: string;
  text?: string;
  subtopics?: { [key: string]: IContentSection };
}
type StructuredContent = { [key: string]: IContentSection } | { erro?: string };

interface IQuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}
interface IEnemExample {
  source: string;
  supportText?: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}
interface IEtapa {
  title: string;
  content: StructuredContent;
  quiz?: IQuizQuestion[];
  enem_explanation?: string;
  enem_example?: IEnemExample;
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

const ConteudoEstruturado = ({ data }: { data: StructuredContent }) => {
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0 || ('erro' in data && data.erro)) {
    console.error("ConteudoEstruturado recebeu dados inválidos ou de erro:", data);
    return <p className="text-center text-gray-500 italic my-8">O conteúdo teórico desta aula não pôde ser carregado.</p>;
  }
  
  const Markdown = ({ content }: { content: string }) => (
    <ReactMarkdown
      components={{
        // --- CORREÇÃO APLICADA AQUI ---
        // Removidos os parênteses extras ')' antes do '=>'
        p: ({...props}) => <p className="text-base sm:text-lg text-gray-700 leading-relaxed text-justify mb-4" {...props} />,
        strong: ({...props}) => <strong className="font-bold text-teal-700" {...props} />,
        ul: ({...props}) => <ul className="list-disc list-inside space-y-2 mb-4 pl-4" {...props} />,
        li: ({...props}) => <li className="text-base sm:text-lg text-gray-700 leading-relaxed" {...props} />,
      }}
    >{content}</ReactMarkdown>
  );

  return (
    <div className="space-y-4 border-t border-b border-gray-200 py-8">
      {Object.keys(data).sort().map((key) => {
        const section = (data as { [key: string]: IContentSection })[key];
        if (typeof section !== 'object' || section === null) {
          return null;
        }
        return (
          <div key={key}>
            {section.title && (
              <h2 className="text-2xl font-bold text-teal-600 mt-6 mb-3">{section.title}</h2>
            )}
            {section.text && (
              <div className="prose prose-lg max-w-none">
                <Markdown content={section.text} />
              </div>
            )}
            {section.subtopics && (
              <div className="pl-4 sm:pl-6 mt-4 border-l-4 border-teal-200">
                <ConteudoEstruturado data={section.subtopics} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function TelaAula({ secaoOrder, etapaOrder, onVoltar, onEtapaConcluida }: TelaAulaProps) {
  const [etapa, setEtapa] = useState<IEtapa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [enemQuizCompleted, setEnemQuizCompleted] = useState(false);

  useEffect(() => {
    const fetchEtapaData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get<DetalheEtapaResponse>(`/trilha/secao/${secaoOrder}/etapa/${etapaOrder}`);
        setEtapa(response.data.etapa);
      } catch (err) {
        console.error("Erro ao buscar dados da etapa:", err);
        setError("Não foi possível carregar os dados da aula.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEtapaData();
  }, [secaoOrder, etapaOrder]);

  const handleCompletarEtapa = async () => {
    try {
      await api.post('/trilha/completar-etapa', { secaoOrder, etapaOrder });
      toast.success("Parabéns! Etapa concluída.");
      onEtapaConcluida();
    } catch (err) {
      console.error("Erro ao completar etapa:", err);
      toast.error("Não foi possível salvar seu progresso.");
    }
  };

  const handleQuizCompletion = () => {
    setQuizCompleted(true);
    if (!etapa?.enem_example?.questionText) {
      setEnemQuizCompleted(true);
      toast.success("Quiz finalizado! Etapa pronta para ser concluída.");
    } else {
      toast.success("Quiz finalizado! Agora, um desafio no estilo ENEM.");
    }
  };

  const handleEnemQuizCompletion = () => {
    setEnemQuizCompleted(true);
    toast.success("Desafio ENEM concluído! Ótimo trabalho.");
  };

  if (isLoading) return <div className="text-center p-10">Carregando Aula...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!etapa) return <div className="text-center p-10 text-red-500">Conteúdo da aula não encontrado.</div>;

  return (
    <div>
      <button onClick={onVoltar} className="mb-4 text-teal-600 font-semibold hover:underline">&larr; Voltar para a Seção</button>
      
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100 space-y-8">
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-teal-600">{etapa.title}</h1>
        
        <ConteudoEstruturado data={etapa.content} />

        {etapa.quiz && etapa.quiz.length > 0 && !quizCompleted && (
          <Quiz questions={etapa.quiz} onQuizComplete={handleQuizCompletion} />
        )}

        {quizCompleted && (
          <div className="border-t-2 border-dashed border-gray-200 pt-8 space-y-8 animate-fade-in">
            {etapa.enem_explanation && (
              <div className="bg-teal-50 p-6 rounded-2xl border-2 border-teal-200 shadow-sm">
                <h3 className="text-2xl font-bold text-teal-700 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                  Como isso cai no ENEM?
                </h3>
                <p className="text-lg text-teal-800 leading-relaxed">{etapa.enem_explanation}</p>
              </div>
            )}

            {etapa.enem_example && etapa.enem_example.questionText && !enemQuizCompleted && (
              <div className="bg-white p-0 sm:p-2 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center px-4 pt-4">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  Exemplo Prático (Estilo ENEM)
                </h3>
                <Quiz
                  questions={[
                    {
                      questionText: `*${etapa.enem_example.source}*\n\n> ${etapa.enem_example.supportText || ''}\n\n**${etapa.enem_example.questionText}**`,
                      options: etapa.enem_example.options,
                      correctAnswerIndex: etapa.enem_example.correctAnswerIndex,
                      explanation: etapa.enem_example.explanation,
                    }
                  ]}
                  onQuizComplete={handleEnemQuizCompletion}
                />
              </div>
            )}

            {enemQuizCompleted && (
              <div className="flex justify-center pt-4">
                <button 
                  onClick={handleCompletarEtapa}
                  className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-transform transform hover:scale-105 shadow-lg"
                >
                  Concluir e Avançar para a Próxima Etapa
                </button>
              </div>
            )}
          </div>
        )}

        {(!etapa.quiz || etapa.quiz.length === 0) && (
          <div className="flex justify-end">
            <button onClick={handleCompletarEtapa} className="bg-teal-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-teal-700">
              Marcar como Concluída
            </button>
          </div>
        )}
      </div>
    </div>
  );
}