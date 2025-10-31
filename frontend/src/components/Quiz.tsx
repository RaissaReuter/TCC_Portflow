"use client"

import { useState } from 'react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown'; // <-- 1. IMPORTAÇÃO ADICIONADA

// --- INTERFACES ---
interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  onQuizComplete: () => void;
}

// --- ÍCONES (sem alterações) ---
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);


export default function Quiz({ questions, onQuizComplete }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  if (!questions || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerClick = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) {
      toast.error("Por favor, selecione uma resposta.");
      return;
    }
    
    const correct = selectedAnswer === currentQuestion.correctAnswerIndex;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(null);
    } else {
      // Se for um quiz de mais de uma pergunta, mostra o resultado final
      if (questions.length > 1) {
        // A pontuação final precisa incluir o acerto da última questão
        const finalScore = score + (isCorrect ? 1 : 0);
        toast.success(`Quiz finalizado! Você acertou ${finalScore} de ${questions.length}.`);
      }
      onQuizComplete();
    }
  };

  const getOptionClass = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index
        ? 'bg-teal-200 border-teal-500 ring-2 ring-teal-400'
        : 'bg-gray-100 border-gray-200 hover:bg-teal-100 hover:border-teal-300';
    } else {
      if (index === currentQuestion.correctAnswerIndex) {
        return 'bg-green-200 border-green-500 text-green-800 font-semibold';
      }
      if (index === selectedAnswer) {
        return 'bg-red-200 border-red-500 text-red-800';
      }
      return 'bg-gray-100 border-gray-200 opacity-60';
    }
  };

  return (
    <div className="mt-12 border-t-2 border-gray-100 pt-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
        
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-teal-600 mb-2">
          {questions.length > 1 ? `QUIZ DA AULA` : `DESAFIO ENEM`}
        </h2>
        <p className="text-center text-gray-500 mb-8">
          {questions.length > 1 ? `Pergunta ${currentQuestionIndex + 1} de ${questions.length}` : 'Teste seus conhecimentos!'}
        </p>
        
        <div className="text-lg text-gray-700 font-semibold mb-6">
            <ReactMarkdown
              components={{
                p: ({...props}) => <p className="text-center" {...props} />,
                strong: ({...props}) => <strong className="font-bold text-gray-800" {...props} />,
                blockquote: ({...props}) => <blockquote className="text-base text-left italic border-l-4 border-gray-300 pl-4 my-4 text-gray-600" {...props} />,
              }}
            >
              {currentQuestion.questionText}
            </ReactMarkdown>
        </div>
        
        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(index)}
              disabled={showResult}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ease-in-out transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none ${getOptionClass(index)}`}
            >
              <span className="font-medium">{option}</span>
            </button>
          ))}
        </div>

        <div className="mt-8">
          {showResult ? (
            <div className={`p-6 rounded-lg text-center ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                {isCorrect ? <CheckIcon /> : <XIcon />}
              </div>
              <h3 className={`text-xl font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta!'}
              </h3>
              
              <div className="mt-4 text-left p-4 bg-white rounded-md border border-gray-200">
                <p className="font-semibold text-gray-800">Justificativa:</p>
                <p className="text-gray-700 mt-1">{currentQuestion.explanation}</p>
              </div>
              
              <button 
                onClick={handleNext} 
                className="mt-6 w-full sm:w-auto bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-transform transform hover:scale-105"
              >
                {/* 2. CORREÇÃO DA LÓGICA DO BOTÃO */}
                {currentQuestionIndex < questions.length - 1 ? 'Próxima Pergunta' : 'Continuar'}
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button 
                onClick={handleCheckAnswer} 
                disabled={selectedAnswer === null} 
                className="w-full sm:w-auto bg-teal-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-600 transition-transform transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
              >
                Verificar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}