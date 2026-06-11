import Link from 'next/link';
import { Plus, Mail, Phone, Briefcase, Award } from 'lucide-react';

async function getCandidates() {
  try {
    const response = await fetch('http://localhost:3000/api/candidates', {
      cache: 'no-store',
    });
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Failed to fetch candidates:', error);
    return [];
  }
}

export default async function CandidatesPage() {
  const candidates = await getCandidates();

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10 lg:px-20">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-600">Recruitment Pipeline</p>
              <h1 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">Candidates</h1>
            </div>
            <Link
              href="/dashboard/candidates/add"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus size={18} /> Add Candidate
            </Link>
          </div>
          <p className="text-sm text-slate-600">Manage your candidate pipeline and track recruitment progress</p>
        </div>

        {candidates.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-16 text-center shadow-lg shadow-slate-200/70">
            <Award size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-semibold text-slate-950">No candidates yet</p>
            <p className="mt-2 text-sm text-slate-600">Start by uploading a CV to add your first candidate</p>
            <Link
              href="/dashboard/candidates/add"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus size={18} /> Add First Candidate
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {candidates.map((candidate: any) => (
              <div
                key={candidate._id}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-950">
                      {candidate.firstName} {candidate.lastName}
                    </h3>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {candidate.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail size={16} className="flex-shrink-0 text-indigo-600" />
                          <a href={`mailto:${candidate.email}`} className="hover:text-indigo-600">
                            {candidate.email}
                          </a>
                        </div>
                      )}

                      {candidate.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={16} className="flex-shrink-0 text-indigo-600" />
                          {candidate.phone}
                        </div>
                      )}

                      {candidate.currentRole && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Briefcase size={16} className="flex-shrink-0 text-indigo-600" />
                          {candidate.currentRole}
                        </div>
                      )}

                      {candidate.yearsOfExperience != null && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="font-medium text-slate-800">Experience:</span> {candidate.yearsOfExperience} yrs
                        </div>
                      )}

                      <div className="inline-flex items-center gap-2 rounded-3xl bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 w-fit">
                        {candidate.status}
                      </div>
                    </div>

                    {candidate.educationSummary && (
                      <div className="mt-3 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                        <p className="font-semibold text-slate-900">Education</p>
                        <p>{candidate.educationSummary}</p>
                      </div>
                    )}

                    {candidate.tags && candidate.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {candidate.tags.map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex rounded-2xl bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
