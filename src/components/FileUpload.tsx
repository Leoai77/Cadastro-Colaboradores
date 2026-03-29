import React, { useCallback, useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseEmployeePdf } from '../lib/gemini';
import { Employee } from '../types';

interface FileUploadProps {
  onDataExtracted: (data: Partial<Employee>) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataExtracted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Por favor, envie um arquivo PDF.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const data = await parseEmployeePdf(base64);
          onDataExtracted(data);
          setSuccess(true);
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Erro ao processar o PDF com IA.');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        setError('Erro ao ler o arquivo.');
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError('Erro ao iniciar o processamento do arquivo.');
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
          ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-gray-300 bg-white hover:border-primary/50'}
          ${isProcessing ? 'pointer-events-none opacity-70' : ''}
        `}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={onFileChange}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-lg font-medium text-gray-700">Analisando ficha cadastral...</p>
            <p className="text-sm text-gray-500">A IA está extraindo os dados do PDF</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="text-lg font-medium text-gray-700">Dados extraídos com sucesso!</p>
            <p className="text-sm text-gray-500 text-center">O formulário abaixo foi preenchido automaticamente.</p>
            <button 
              className="mt-2 text-primary font-semibold hover:underline"
              onClick={(e) => { e.stopPropagation(); setSuccess(false); }}
            >
              Enviar outro arquivo
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">Arraste a ficha cadastral aqui</p>
              <p className="text-sm text-gray-500 mt-1">ou clique para selecionar um arquivo PDF</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
              <FileText className="w-4 h-4" />
              <span>Apenas arquivos PDF são suportados</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
