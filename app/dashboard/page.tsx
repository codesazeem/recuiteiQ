import Link from 'next/link';
import { ArrowRight, Briefcase, FileText, Users, ShieldCheck } from 'lucide-react';

const stats = [
  { label: 'Total candidates', value: '128' },
  { label: 'Duplicate checks', value: '19' },
  { label: 'Talent pool', value: '46' },
  { label: 'Open roles', value: '8' },
];

const quickLinks = [
  { label: 'Candidates', href: '/dashboard/candidates' },
  { label: 'Roles', href: '/dashboard/roles' },
  { label: 'Pipeline', href: '/dashboard/pipeline' },
  { label: 'Reports', href: '/dashboard/reports' },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10 lg:px-20">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-600">Welcome to RecruitIQ</p>
              <h1 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">Your hiring operations cockpit</h1>
            </div>
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50">
              Back to homepage <ArrowRight size={16} />
            </Link>
          </div>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">
            Centralize candidate records, prevent duplicated outreach, and keep every resume searchable. Start by creating a candidate or reviewing the pipeline status below.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
          <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-3xl bg-slate-50 p-6">
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-8 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Recruitment insight</p>
                  <h2 className="mt-3 text-2xl font-semibold">Stop losing talent to manual workflows.</h2>
                </div>
                <ShieldCheck size={32} className="text-slate-200" />
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                Use a searchable, shared candidate repository so hiring decisions follow data, not who has the inbox.
              </p>
            </div>
          </div>

          <aside className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-600">Quick actions</p>
              <h2 className="text-2xl font-semibold text-slate-950">Get started</h2>
            </div>
            <div className="grid gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
