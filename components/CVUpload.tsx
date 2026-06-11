'use client';

import { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import type { ExtractedCandidate } from '@/src/services/cvExtractionService';

interface CVUploadProps {
  onExtracted: (data: ExtractedCandidate) => void;
}

export function CVUpload({ onExtracted }: CVUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await fetch('/api/cv/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(true);
      onExtracted(data.candidate);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Clear success after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="rounded-[1.5rem] border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileUpload}
          disabled={isLoading}
          className="hidden"
          aria-label="Upload CV file"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="inline-flex flex-col items-center gap-3 rounded-3xl bg-white px-6 py-4 text-center transition hover:bg-slate-100 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader className="animate-spin text-indigo-600" size={32} />
          ) : (
            <Upload className="text-indigo-600" size={32} />
          )}
          <div>
            <p className="font-semibold text-slate-950">
              {isLoading ? 'Processing CV...' : 'Upload your CV'}
            </p>
            <p className="text-xs text-slate-500">PDF or DOCX up to 10MB</p>
          </div>
        </button>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 flex gap-3">
          <AlertCircle className="flex-shrink-0 text-red-600" size={20} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-3xl border border-green-200 bg-green-50 p-4 flex gap-3">
          <CheckCircle className="flex-shrink-0 text-green-600" size={20} />
          <p className="text-sm text-green-700">CV processed successfully! Review the data below.</p>
        </div>
      )}
    </div>
  );
}
