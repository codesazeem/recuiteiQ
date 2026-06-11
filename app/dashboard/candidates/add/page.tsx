'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CVUpload } from '@/components/CVUpload';
import { CandidateForm } from '@/components/CandidateForm';
import type { ExtractedCandidate } from '@/src/services/cvExtractionService';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddCandidatePage() {
  const router = useRouter();
  const [extractedData, setExtractedData] = useState<ExtractedCandidate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFormSubmit = async (data: ExtractedCandidate) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || '',
          currentRole: data.currentRole,
          yearsOfExperience: data.yearsOfExperience,
          educationSummary: data.educationSummary || '',
          status: 'lead',
          tags: data.skills ?? [],
          summary: `Years of experience: ${data.yearsOfExperience ?? 'Not specified'}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save candidate');
      }

      // Redirect to candidates list
      router.push('/dashboard/candidates');
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10 lg:px-20">
      <section className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/candidates"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-50 mb-8"
        >
          <ArrowLeft size={16} /> Back to candidates
        </Link>

        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold text-slate-950">Add New Candidate</h1>
            <p className="text-base text-slate-600">
              Upload a CV (PDF or DOCX) to auto-extract candidate information. Review and confirm before saving.
            </p>
          </div>

          {submitError && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          <CVUpload onExtracted={setExtractedData} />

          {extractedData && (
            <CandidateForm initialData={extractedData} onSubmit={handleFormSubmit} isLoading={isSubmitting} />
          )}

          {!extractedData && (
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-600">Upload a CV to see the extracted candidate data here</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
