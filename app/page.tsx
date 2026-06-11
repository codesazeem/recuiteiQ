import Link from 'next/link';
import { ArrowRight, Briefcase, FileText, Users, ShieldCheck } from 'lucide-react';
import clientPromise from '@/src/lib/mongodb';

const features = [
  {
    title: 'Centralized candidate repository',
    description: 'Capture candidate profiles, CVs, history and contacts in one searchable system.',
    icon: Users,
  },
  {
    title: 'Duplicate candidate detection',
    description: 'Avoid repeated screening by tracking applicants and matching profiles intelligently.',
    icon: ShieldCheck,
  },
  {
    title: 'Talent pool management',
    description: 'Park strong candidates for future roles and keep their profile ready when opportunity arises.',
    icon: Briefcase,
  },
  {
    title: 'CV storage & search',
    description: 'Store resumes centrally with powerful search and structured candidate data.',
    icon: FileText,
  },
];

export default async function Home() {
  const client = await clientPromise;
  console.log('Home page server render: MongoDB client connected:', !!client);

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-20">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white/90 p-10 shadow-2xl shadow-slate-200/60 backdrop-blur-xl">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm shadow-indigo-200/80">
              Centralized recruitment for growing teams
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Stop losing top talent to scattered CVs and inbox silos.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              RecruitIQ brings candidate history, CVs, contacts, and role tracking into one secure portal. Build consistent shortlisting, reduce duplicate interviews, and preserve knowledge when team members change.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Open dashboard
              </Link>
              <Link href="#features" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-50">
                Learn more <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-lg shadow-slate-950/10">
            <div className="mb-6 rounded-3xl bg-slate-900/95 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Pipeline health</p>
              <p className="mt-4 text-4xl font-semibold">84%</p>
              <p className="mt-2 text-sm text-slate-500">Candidates tracked across pipeline stages</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-800/95 p-5">
                <p className="text-sm text-slate-400">Active candidates</p>
                <p className="mt-3 text-2xl font-semibold">128</p>
              </div>
              <div className="rounded-3xl bg-slate-800/95 p-5">
                <p className="text-sm text-slate-400">Saved profiles</p>
                <p className="mt-3 text-2xl font-semibold">46</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto mt-16 max-w-6xl space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">What RecruitIQ solves</p>
          <h2 className="text-3xl font-semibold text-slate-950 sm:text-4xl">Designed for recruitment teams who need process, not chaos.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-700">
                  <Icon size={24} />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl rounded-[2rem] border border-slate-200 bg-slate-950/95 p-10 text-white shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Recruitment continuity</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Keep candidate knowledge inside the team, not in somebody's inbox.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              Resume imports, activity logs, candidate tags, and role matching all come together so your hiring process stays consistent and searchable.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-900/95 p-6">
              <p className="text-sm text-slate-400">Stored resumes</p>
              <p className="mt-3 text-3xl font-semibold">312</p>
            </div>
            <div className="rounded-3xl bg-slate-900/95 p-6">
              <p className="text-sm text-slate-400">Saved contacts</p>
              <p className="mt-3 text-3xl font-semibold">74</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
