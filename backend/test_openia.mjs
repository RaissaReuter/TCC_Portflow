// teste_openai.js
import OpenAI from "openai";
import dotenv from "dotenv";

// Carrega as variáveis do arquivo .env
dotenv.config();

// Inicializa o cliente. Se a chave não estiver no .env, isso vai falhar.
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function testarAPI() {
    console.log("Tentando chamar a API da OpenAI...");
    
    try {
        const chatCompletion = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "user", "content": "Isso é apenas uma chamada de teste da API, retorne a palavra 'sucesso'." }
            ],
        });
        
        console.log("Chamada bem-sucedida!");
        console.log("Resposta da IA:", chatCompletion.choices[0].message.content);

    } catch (error) {
        console.error("\n--- ERRO NA CHAMADA DA API ---");
        // O objeto de erro da OpenAI é rico em detalhes
        if (error instanceof OpenAI.APIError) {
            console.error("Status do Erro:", error.status);     // ex: 400
            console.error("Tipo do Erro:", error.type);         // ex: invalid_request_error
            console.error("Código do Erro:", error.code);       // ex: model_not_found
            console.error("Mensagem de Erro:", error.message);  // A mensagem detalhada
        } else {
            console.error("Erro inesperado:", error);
        }
    }
}

testarAPI();