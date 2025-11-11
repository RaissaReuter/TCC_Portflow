"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analisarRedacao = void 0;
const openai_1 = __importDefault(require("openai"));
const zod_1 = require("zod");
// Configuração do cliente da OpenAI
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const redacaoSchema = zod_1.z.object({
    tema: zod_1.z.string().min(1, "O tema não pode estar vazio.").max(300, "O tema é muito longo."),
    texto: zod_1.z.string().min(150, "A redação precisa ter no mínimo 150 caracteres.").max(7000, "A redação excedeu o limite de 7000 caracteres."),
});
const analisarRedacao = async (req, res) => {
    try {
        const { tema, texto } = redacaoSchema.parse(req.body);
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Usuário não autenticado." });
        }
        const systemPrompt = `Você é um corretor especialista do ENEM para a plataforma PortFlow. Sua tarefa é analisar a redação de um aluno e retornar um feedback ESTRITAMENTE no formato JSON.

    O JSON de saída deve ter a seguinte estrutura:
    {
      "notas": {
        "c1": "Nota de 0 a 200 para a Competência 1 (Domínio da norma culta).",
        "c2": "Nota de 0 a 200 para a Competência 2 (Compreensão do tema e estrutura).",
        "c3": "Nota de 0 a 200 para a Competência 3 (Seleção e organização de informações).",
        "c4": "Nota de 0 a 200 para a Competência 4 (Coesão textual).",
        "c5": "Nota de 0 a 200 para a Competência 5 (Proposta de intervenção).",
        "notaFinal": "A SOMA das 5 competências, resultando em um valor de 0 a 1000."
      },
      "analiseGeral": "Um parágrafo curto com suas impressões gerais sobre o texto.",
      "pontosFortes": [
        { "competencia": "C1", "descricao": "Descreva um ponto positivo aqui, relacionado à Competência 1." }
      ],
      "pontosAMelhorar": [
        { "competencia": "C3", "descricao": "Aponte uma área para melhoria com sugestões, relacionado à Competência 3." }
      ],
      "sugestaoFinal": "Finalize com uma frase de encorajamento para o estudante ${user.name}.",
      "errosSugeridos": [
        { "palavra": "palavra_errada_no_texto", "sugestao": "sugestão_de_correção" }
      ]
    }
    Seja rigoroso na avaliação, seguindo os critérios do ENEM. A notaFinal DEVE ser a soma exata das notas das competências. NÃO adicione nenhum texto antes ou depois do objeto JSON.`;
        const userPrompt = `Tema: "${tema}"\n\nRedação: "${texto}"`;
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.5,
            max_tokens: 2048,
        });
        const assistantResponse = completion.choices[0].message.content;
        if (!assistantResponse) {
            throw new Error("A IA não retornou um conteúdo válido.");
        }
        const feedbackJson = JSON.parse(assistantResponse);
        res.status(200).json({ feedback: feedbackJson });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({ message: "Dados da redação inválidos.", errors: error.issues });
        }
        if (error instanceof openai_1.default.APIError) {
            console.error("Erro da API da OpenAI:", error.status, error.message);
            return res.status(error.status || 500).json({ message: `Erro da OpenAI: ${error.message}` });
        }
        console.error("Erro desconhecido na API de Redação:", error);
        res.status(500).json({ message: "Ocorreu um erro inesperado ao processar sua redação." });
    }
};
exports.analisarRedacao = analisarRedacao;
