import { GoogleGenAI } from "@google/genai";
import { Employee } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function parseEmployeePdf(pdfBase64: string): Promise<Partial<Employee>> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Extract all employee registration data from this PDF.
    Return the data in JSON format matching this structure:
    {
      "razao_social": "string",
      "cnpj": "string",
      "nome": "string",
      "cpf": "string",
      "rg": "string",
      "uf_rg": "string",
      "data_emissao_rg": "string",
      "data_nascimento": "string",
      "naturalidade": "string",
      "email": "string",
      "telefone": "string",
      "celular": "string",
      "nome_mae": "string",
      "nome_pai": "string",
      "estado_civil": "string",
      "grau_instrucao": "string",
      "logradouro": "string",
      "bairro": "string",
      "cidade": "string",
      "uf": "string",
      "cep": "string",
      "pis_pasep": "string",
      "ctps_numero": "string",
      "ctps_serie": "string",
      "titulo_eleitor": "string",
      "zona": "string",
      "secao": "string",
      "habilitacao": "string",
      "categoria_cnh": "string",
      "reservista": "string",
      "banco": "string",
      "agencia": "string",
      "conta": "string",
      "data_admissao": "string",
      "salario": "string",
      "funcao": "string",
      "setor": "string",
      "horario_trabalho": "string",
      "trabalha_sabado": "string",
      "vale_transporte": "string",
      "vale_alimentacao": "string",
      "dependentes": [
        {
          "nome": "string",
          "data_nascimento": "string",
          "grau_parentesco": "string",
          "cpf": "string"
        }
      ]
    }
    If a field is not found, leave it as an empty string.
  `;

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
    },
  });

  try {
    const text = response.text || "{}";
    // Clean up markdown code blocks if present
    const cleanJson = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return {};
  }
}
