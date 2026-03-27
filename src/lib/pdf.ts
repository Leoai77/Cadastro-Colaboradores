import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Employee } from '../types';

export async function generateFilledPdf(employee: Employee, templatePdfBytes?: ArrayBuffer): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawText = (text: string, x: number, y: number, size = 10, isBold = false) => {
    if (!text) return;
    page.drawText(text, {
      x,
      y: height - y,
      size,
      font: isBold ? boldFont : font,
      color: rgb(0, 0, 0),
    });
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    page.drawLine({
      start: { x: x1, y: height - y1 },
      end: { x: x2, y: height - y2 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
  };

  // Header
  page.drawRectangle({
    x: 20,
    y: height - 60,
    width: width - 40,
    height: 30,
    color: rgb(0.4, 0.6, 0.2),
  });
  drawText("FICHA CADASTRAL PARA ADMISSÃO", width / 2 - 100, 50, 14, true);

  let currentY = 80;

  // Section: Empresa
  drawText("EMPRESA", 25, currentY, 10, true);
  currentY += 15;
  drawText(`Razão Social: ${employee.razao_social}`, 30, currentY);
  drawText(`CNPJ: ${employee.cnpj}`, 400, currentY);
  currentY += 20;
  drawLine(20, currentY, width - 20, currentY);
  currentY += 15;

  // Section: Dados Pessoais
  drawText("DADOS PESSOAIS", 25, currentY, 10, true);
  currentY += 15;
  drawText(`Nome: ${employee.nome}`, 30, currentY);
  currentY += 15;
  drawText(`CPF: ${employee.cpf}`, 30, currentY);
  drawText(`RG: ${employee.rg} (${employee.uf_rg})`, 200, currentY);
  drawText(`Emissão: ${employee.data_emissao_rg}`, 400, currentY);
  currentY += 15;
  drawText(`Nascimento: ${employee.data_nascimento}`, 30, currentY);
  drawText(`Naturalidade: ${employee.naturalidade}`, 200, currentY);
  currentY += 15;
  drawText(`E-mail: ${employee.email}`, 30, currentY);
  currentY += 15;
  drawText(`Telefone: ${employee.telefone}`, 30, currentY);
  drawText(`Celular: ${employee.celular}`, 200, currentY);
  currentY += 15;
  drawText(`Mãe: ${employee.nome_mae}`, 30, currentY);
  currentY += 15;
  drawText(`Pai: ${employee.nome_pai}`, 30, currentY);
  currentY += 15;
  drawText(`Estado Civil: ${employee.estado_civil}`, 30, currentY);
  drawText(`Instrução: ${employee.grau_instrucao}`, 200, currentY);
  currentY += 20;
  drawLine(20, currentY, width - 20, currentY);
  currentY += 15;

  // Section: Endereço
  drawText("ENDEREÇO", 25, currentY, 10, true);
  currentY += 15;
  drawText(`Logradouro: ${employee.logradouro}`, 30, currentY);
  currentY += 15;
  drawText(`Bairro: ${employee.bairro}`, 30, currentY);
  drawText(`Cidade: ${employee.cidade} - ${employee.uf}`, 200, currentY);
  drawText(`CEP: ${employee.cep}`, 400, currentY);
  currentY += 20;
  drawLine(20, currentY, width - 20, currentY);
  currentY += 15;

  // Section: Documentos
  drawText("DOCUMENTAÇÃO", 25, currentY, 10, true);
  currentY += 15;
  drawText(`PIS/PASEP: ${employee.pis_pasep}`, 30, currentY);
  drawText(`CTPS: ${employee.ctps_numero} / ${employee.ctps_serie}`, 200, currentY);
  currentY += 15;
  drawText(`Título Eleitor: ${employee.titulo_eleitor}`, 30, currentY);
  drawText(`Zona: ${employee.zona}`, 200, currentY);
  drawText(`Seção: ${employee.secao}`, 300, currentY);
  currentY += 15;
  drawText(`Habilitação: ${employee.habilitacao} (${employee.categoria_cnh})`, 30, currentY);
  drawText(`Reservista: ${employee.reservista}`, 200, currentY);
  currentY += 20;
  drawLine(20, currentY, width - 20, currentY);
  currentY += 15;

  // Section: Dados Bancários
  drawText("DADOS BANCÁRIOS", 25, currentY, 10, true);
  currentY += 15;
  drawText(`Banco: ${employee.banco}`, 30, currentY);
  drawText(`Agência: ${employee.agencia}`, 200, currentY);
  drawText(`Conta: ${employee.conta}`, 350, currentY);
  currentY += 20;
  drawLine(20, currentY, width - 20, currentY);
  currentY += 15;

  // Section: Contrato
  drawText("DADOS DO CONTRATO DE TRABALHO", 25, currentY, 10, true);
  currentY += 15;
  drawText(`Admissão: ${employee.data_admissao}`, 30, currentY);
  drawText(`Salário: ${employee.salario}`, 200, currentY);
  currentY += 15;
  drawText(`Função: ${employee.funcao}`, 30, currentY);
  drawText(`Setor: ${employee.setor}`, 200, currentY);
  currentY += 15;
  drawText(`Horário: ${employee.horario_trabalho}`, 30, currentY);
  drawText(`Sábado: ${employee.trabalha_sabado}`, 200, currentY);
  currentY += 15;
  drawText(`VT: ${employee.vale_transporte}`, 30, currentY);
  drawText(`VA: ${employee.vale_alimentacao}`, 100, currentY);
  currentY += 20;
  drawLine(20, currentY, width - 20, currentY);
  currentY += 15;

  // Section: Dependentes
  drawText("DEPENDENTES", 25, currentY, 10, true);
  currentY += 15;
  employee.dependentes.forEach((dep, index) => {
    drawText(`${index + 1}. ${dep.nome} - ${dep.grau_parentesco} (Nasc: ${dep.data_nascimento}, CPF: ${dep.cpf})`, 30, currentY);
    currentY += 12;
  });

  currentY += 40;
  drawText("________________________________________________", 100, currentY);
  drawText("Assinatura do Funcionário", 150, currentY + 15);

  return await pdfDoc.save();
}
