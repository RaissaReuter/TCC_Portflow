// src/components/Chatbot.tsx
"use client"

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Image from "next/image";

interface Message {
  text: string;
  sender: 'user' | 'assistant';
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Olá! Sou o Portinho, seu assistente de estudos. Como posso te ajudar hoje? 😊", sender: 'assistant' }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Para mostrar "Digitando..."
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage: Message = { text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMessages(prev => [...prev, { text: "Você precisa estar logado para falar comigo.", sender: 'assistant' }]);
        setIsLoading(false);
        return;
      }

      const response = await axios.post<{ reply: string }>(
        'http://localhost:3001/api/chatbot',
        { message: inputValue },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const assistantMessage: Message = { text: response.data.reply, sender: 'assistant' };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Erro ao contatar o chatbot:", error);
      const errorMessage: Message = { text: "Desculpe, estou com um pouco de dificuldade para me conectar. Tente novamente em alguns instantes.", sender: 'assistant' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 h-96 flex flex-col overflow-hidden transition-all duration-300 transform">
          <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
            <h3 className="font-bold">Portinho Assistente</h3>
            <button onClick={() => setIsOpen(false)} className="focus:outline-none">
              {/* Ícone de minimizar */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'assistant' && (
                  <Image src="/images/logoPortinho.png" alt="Portinho" width={32} height={32} className="w-8 h-8 rounded-full" />
                )}
                <div className={`flex flex-col max-w-[200px] leading-1.5 p-2 border-gray-200 ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-s-xl rounded-ee-xl' : 'bg-gray-100 rounded-e-xl rounded-es-xl'}`}>
                  <p className="text-sm font-normal">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <Image src="/images/logoPortinho.png" alt="Portinho" width={32} height={32} className="w-8 h-8 rounded-full" />
                <div className="flex flex-col max-w-[200px] leading-1.5 p-2 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl">
                  <p className="text-sm font-normal">Digitando...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Pergunte ao Portinho..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
                disabled={isLoading}
              >
                {/* Ícone de enviar */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform duration-300 hover:scale-110"
      >
        <Image src="/images/logoPortinho.png" alt="Abrir Chat" width={60} height={60} className="w-10 h-10" />
      </button>
    </div>
  );
}