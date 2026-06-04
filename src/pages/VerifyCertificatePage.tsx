import { FormEvent, useEffect, useState } from 'react';
import { Award, Search, ShieldCheck } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';
import { Certificate, Language } from '../types';
import { labelFor } from '../i18n/labels';
import { formatDate } from '../utils/certificates';

export function VerifyCertificatePage({ language, certificates, initialNumber }: { language: Language; certificates: Certificate[]; initialNumber?: string }) {
  const { t } = useI18n(language);
  const [query, setQuery] = useState(initialNumber ?? '');
  const [submitted, setSubmitted] = useState(initialNumber ?? '');
  const certificate = certificates.find((item) => item.certificateNumber.toLowerCase() === submitted.trim().toLowerCase());

  useEffect(() => {
    if (!initialNumber) return;
    setQuery(initialNumber);
    setSubmitted(initialNumber);
  }, [initialNumber]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(query);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-leaf">
          <ShieldCheck size={28} />
        </div>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">{t('verifyPageTitle')}</h1>
        <p className="mt-3 max-w-2xl text-slate-600">{t('verifyPageSubtitle')}</p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('certificateInputPlaceholder')}
              className="h-14 w-full rounded-2xl border border-slate-200 pl-12 pr-4 text-base font-bold focus:border-ocean focus:outline-none focus:ring-4 focus:ring-ocean/15"
            />
          </div>
          <button className="pressable rounded-2xl bg-ink px-6 py-3 text-base font-extrabold text-white hover:bg-slate-800">{t('verify')}</button>
        </form>
      </section>

      {submitted && (
        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          {certificate ? (
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2 text-sm font-extrabold text-leaf">
                <Award size={18} />
                {t('validCertificate')}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <VerifyRow label={t('applicant')} value={certificate.volunteerName} />
                <VerifyRow label={t('certificateNumber')} value={certificate.certificateNumber} />
                <VerifyRow label={t('title')} value={certificate.opportunityTitle[language]} />
                <VerifyRow label={t('aboutOrganization')} value={certificate.organizationName} />
                <VerifyRow label={t('city')} value={labelFor(certificate.city, language)} />
                <VerifyRow label={t('volunteerHours')} value={String(certificate.volunteerHours)} />
                <VerifyRow label={t('issuedDate')} value={formatDate(certificate.issuedAt, language)} />
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-rose-50 p-5 text-base font-extrabold text-rose-700">{t('certificateNotFound')}</div>
          )}
        </section>
      )}
    </main>
  );
}

function VerifyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-mist p-4">
      <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-base font-extrabold text-ink">{value}</p>
    </div>
  );
}
