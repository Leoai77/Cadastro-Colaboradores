export interface Dependent {
  nome: string;
  data_nascimento: string;
  grau_parentesco: string;
  cpf: string;
}

export interface Employee {
  id?: string;
  uid: string;
  createdAt: string;

  // Empresa
  razao_social: string;
  cnpj: string;

  // Dados Pessoais
  nome: string;
  cpf: string;
  rg: string;
  uf_rg: string;
  data_emissao_rg: string;
  data_nascimento: string;
  naturalidade: string;
  email: string;
  telefone: string;
  celular: string;
  nome_mae: string;
  nome_pai: string;
  estado_civil: string;
  grau_instrucao: string;

  // Endereço
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;

  // Documentos
  pis_pasep: string;
  ctps_numero: string;
  ctps_serie: string;
  titulo_eleitor: string;
  zona: string;
  secao: string;
  habilitacao: string;
  categoria_cnh: string;
  reservista: string;

  // Dados Bancários
  banco: string;
  agencia: string;
  conta: string;

  // Contrato
  data_admissao: string;
  salario: string;
  funcao: string;
  setor: string;
  horario_trabalho: string;
  trabalha_sabado: string;
  vale_transporte: string;
  vale_alimentacao: string;

  // Dependentes
  dependentes: Dependent[];
}
