import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Employee } from '../types';
import { Save, Download, Plus, Trash2, User, Building2, MapPin, FileText, Landmark, Briefcase, Users, Loader2 } from 'lucide-react';
import { generateFilledPdf } from '../lib/pdf';

interface EmployeeFormProps {
  initialData?: Partial<Employee>;
  onSave: (data: Employee) => void;
  isSaving?: boolean;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ initialData, onSave, isSaving }) => {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<Employee>({
    defaultValues: {
      dependentes: [],
      ...initialData
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "dependentes"
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const handleDownload = async (data: Employee) => {
    try {
      const pdfBytes = await generateFilledPdf(data);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cadastro_${data.nome.replace(/\s+/g, '_') || 'funcionario'}_${data.cpf || 'sem_cpf'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Erro ao gerar o PDF. Verifique os dados e tente novamente.");
    }
  };

  const Section = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );

  const Input = ({ label, name, type = "text", required = false }: { label: string, name: keyof Employee, type?: string, required?: boolean }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...register(name as any)}
        type={type}
        className={`px-4 py-2.5 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-primary/20 outline-none
          ${errors[name as keyof Employee] ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'}
        `}
      />
      {errors[name as keyof Employee] && <span className="text-xs text-red-500">Campo obrigatório</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSave)} className="w-full max-w-5xl mx-auto pb-32">
      <Section title="Empresa" icon={Building2}>
        <Input label="Razão Social" name="razao_social" />
        <Input label="CNPJ" name="cnpj" />
      </Section>

      <Section title="Dados Pessoais" icon={User}>
        <Input label="Nome Completo" name="nome" required />
        <Input label="CPF" name="cpf" required />
        <Input label="RG" name="rg" />
        <Input label="UF RG" name="uf_rg" />
        <Input label="Data Emissão RG" name="data_emissao_rg" />
        <Input label="Data de Nascimento" name="data_nascimento" required />
        <Input label="Naturalidade" name="naturalidade" />
        <Input label="E-mail" name="email" type="email" />
        <Input label="Telefone Residencial" name="telefone" />
        <Input label="Celular" name="celular" />
        <Input label="Nome da Mãe" name="nome_mae" />
        <Input label="Nome do Pai" name="nome_pai" />
        <Input label="Estado Civil" name="estado_civil" />
        <Input label="Grau de Instrução" name="grau_instrucao" />
      </Section>

      <Section title="Endereço" icon={MapPin}>
        <Input label="Logradouro" name="logradouro" />
        <Input label="Bairro" name="bairro" />
        <Input label="Cidade" name="cidade" />
        <Input label="UF" name="uf" />
        <Input label="CEP" name="cep" />
      </Section>

      <Section title="Documentos" icon={FileText}>
        <Input label="PIS/PASEP" name="pis_pasep" />
        <Input label="CTPS n°" name="ctps_numero" />
        <Input label="Série" name="ctps_serie" />
        <Input label="Título de Eleitor" name="titulo_eleitor" />
        <Input label="Zona" name="zona" />
        <Input label="Seção" name="secao" />
        <Input label="Habilitação" name="habilitacao" />
        <Input label="Categoria CNH" name="categoria_cnh" />
        <Input label="Reservista" name="reservista" />
      </Section>

      <Section title="Dados Bancários" icon={Landmark}>
        <Input label="Banco" name="banco" />
        <Input label="Agência" name="agencia" />
        <Input label="Conta" name="conta" />
      </Section>

      <Section title="Contrato de Trabalho" icon={Briefcase}>
        <Input label="Data de Admissão" name="data_admissao" required />
        <Input label="Salário" name="salario" />
        <Input label="Função" name="funcao" />
        <Input label="Setor" name="setor" />
        <Input label="Horário de Trabalho" name="horario_trabalho" />
        <Input label="Trabalha Sábado?" name="trabalha_sabado" />
        <Input label="Vale Transporte" name="vale_transporte" />
        <Input label="Vale Alimentação" name="vale_alimentacao" />
      </Section>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Dependentes</h3>
          </div>
          <button
            type="button"
            onClick={() => append({ nome: '', data_nascimento: '', grau_parentesco: '', cpf: '' })}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Dependente
          </button>
        </div>
        <div className="p-6 space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl relative group">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">Nome</label>
                <input {...register(`dependentes.${index}.nome` as const)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">Nascimento</label>
                <input {...register(`dependentes.${index}.data_nascimento` as const)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">Parentesco</label>
                <input {...register(`dependentes.${index}.grau_parentesco` as const)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">CPF</label>
                <input {...register(`dependentes.${index}.cpf` as const)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-red-100 text-red-500 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {fields.length === 0 && (
            <p className="text-center text-gray-400 py-4 text-sm italic">Nenhum dependente adicionado.</p>
          )}
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/50 z-50">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Salvar Cadastro
        </button>
        <button
          type="button"
          onClick={handleSubmit(handleDownload)}
          className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
        >
          <Download className="w-5 h-5" />
          Baixar PDF
        </button>
      </div>
    </form>
  );
};
