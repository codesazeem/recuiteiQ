'use client';

import { useState } from 'react';
import type { ExtractedCandidate } from '@/src/services/cvExtractionService';
import { X } from 'lucide-react';

interface CandidateFormProps {
  initialData?: ExtractedCandidate;
  onSubmit: (data: ExtractedCandidate) => Promise<void>;
  isLoading?: boolean;
}

export function CandidateForm({ initialData, onSubmit, isLoading = false }: CandidateFormProps) {
  const [formData, setFormData] = useState<ExtractedCandidate & { skills: string[]; educationSummary: string; email: string }>({
    firstName: initialData?.firstName ?? '',
    lastName: initialData?.lastName ?? '',
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    currentRole: initialData?.currentRole ?? '',
    yearsOfExperience: initialData?.yearsOfExperience,
    skills: initialData?.skills ?? [],
    educationSummary: initialData?.educationSummary ?? '',
    summary: initialData?.summary ?? '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'yearsOfExperience' ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills ?? []), newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: (prev.skills ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email?.trim()) {
        setError('First name, last name, and email are required');
        return;
      }

      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-950">Candidate Information</h2>
        <p className="text-sm text-slate-600">Review and confirm the extracted details</p>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-950">First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none"
            placeholder="John"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-950">Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none"
            placeholder="Doe"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-950">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none"
            placeholder="john@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-950">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-950">Current Role</label>
          <input
            type="text"
            name="currentRole"
            value={formData.currentRole || ''}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none"
            placeholder="Senior Software Engineer"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-950">Years of Experience</label>
          <input
            type="number"
            name="yearsOfExperience"
            value={formData.yearsOfExperience || ''}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none"
            placeholder="5"
            min="0"
            max="70"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-950">Education Summary</label>
          <textarea
            name="educationSummary"
            value={formData.educationSummary || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, educationSummary: e.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none"
            placeholder="B.Tech in Computer Science from XYZ University, graduated 2022"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-950">Key Skills</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none"
            placeholder="Add a skill and press Enter"
          />
          <button
            type="button"
            onClick={addSkill}
            className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Add
          </button>
        </div>

        {(formData?.skills ?? []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(formData.skills ?? []).map((skill, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 rounded-3xl bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="flex-shrink-0 transition hover:text-indigo-900"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-3xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Candidate'}
        </button>
      </div>
    </form>
  );
}
