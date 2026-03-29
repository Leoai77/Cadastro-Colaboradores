import { GoogleGenAI, Type } from "@google/genai";
import { Employee } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAi() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      console.warn("GEMINI_API_KEY is missing. Please set it in your environment variables (e.g., Netlify settings).");
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function parseEmployeePdf(pdfBase64: string): Promise<Partial<Employee>> {
  console.log("Iniciando extração de dados com Gemini...");
  const ai = getAi();
  if (!ai) {
    throw new Error("Chave de API do Gemini não configurada. Verifique as configurações do ambiente.");
  }
  
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Extraia todos os dados de registro do funcionário deste PDF.
    Retorne os dados seguindo exatamente a estrutura JSON fornecida.
    Se um campo não for encontrado, deixe-o como uma string vazia.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            razao_social: { type: Type.STRING },
            cnpj: { type: Type.STRING },
            nome: { type: Type.STRING },
            cpf: { type: Type.STRING },
            rg: { type: Type.STRING },
            uf_rg: { type: Type.STRING },
            data_emissao_rg: { type: Type.STRING },
            data_nascimento: { type: Type.STRING },
            naturalidade: { type: Type.STRING },
            email: { type: Type.STRING },
            telefone: { type: Type.STRING },
            celular: { type: Type.STRING },
            nome_mae: { type: Type.STRING },
            nome_pai: { type: Type.STRING },
            estado_civil: { type: Type.STRING },
            grau_instrucao: { type: Type.STRING },
            logradouro: { type: Type.STRING },
            bairro: { type: Type.STRING },
            cidade: { type: Type.STRING },
            uf: { type: Type.STRING },
            cep: { type: Type.STRING },
            pis_pasep: { type: Type.STRING },
            ctps_numero: { type: Type.STRING },
            ctps_serie: { type: Type.STRING },
            titulo_eleitor: { type: Type.STRING },
            zona: { type: Type.STRING },
            secao: { type: Type.STRING },
            habilitacao: { type: Type.STRING },
            categoria_cnh: { type: Type.STRING },
            reservista: { type: Type.STRING },
            banco: { type: Type.STRING },
            agencia: { type: Type.STRING },
            conta: { type: Type.STRING },
            data_admissao: { type: Type.STRING },
            salario: { type: Type.STRING },
            funcao: { type: Type.STRING },
            setor: { type: Type.STRING },
            horario_trabalho: { type: Type.STRING },
            trabalha_sabado: { type: Type.STRING },
            vale_transporte: { type: Type.STRING },
            vale_alimentacao: { type: Type.STRING },
            dependentes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nome: { type: Type.STRING },
                  data_nascimento: { type: Type.STRING },
                  grau_parentesco: { type: Type.STRING },
                  cpf: { type: Type.STRING }
                }
              }
            }
          }
        }
      },
    });

    const text = response.text;
    if (!text) {
      console.warn("Gemini retornou uma resposta vazia.");
      return {};
    }
    
    console.log("Dados extraídos com sucesso.");
    return JSON.parse(text);
  } catch (e) {
    console.error("Erro na chamada ao Gemini:", e);
    throw new Error("Erro ao processar o PDF. Verifique se a chave de API é válida e se o arquivo não é muito grande.");
  }
}
