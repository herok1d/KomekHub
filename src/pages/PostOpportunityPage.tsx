import { FormEvent, useState } from 'react';
import { Send } from 'lucide-react';
import { categories, cities, formats, schedules } from '../data/mockData';
import { labelFor } from '../i18n/labels';
import { useI18n } from '../i18n/useI18n';
import { Language } from '../types';
import { SelectCombobox } from '../components/ui/SelectCombobox';

export function PostOpportunityPage({ language, onPublished }: { language: Language; onPublished: () => void }) {
  const { t } = useI18n(language);
  const toOptions = (values: string[]) => values.map((value) => ({ value, label: labelFor(value, language) }));
  const [form, setForm] = useState({
    title: '',
    description: '',
    city: 'Astana',
    format: 'Offline',
    category: 'Education',
    schedule: 'Flexible',
    duration: '',
    requirements: '',
    contacts: '',
  });
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const required = [form.title, form.description, form.duration, form.requirements, form.contacts];
    if (required.some((value) => !value.trim())) {
      setError(t('fillRequired'));
      return;
    }
    setError('');
    onPublished();
    setForm({ ...form, title: '', description: '', duration: '', requirements: '', contacts: '' });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-wide text-leaf">{t('postFormEyebrow')}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{t('postFormTitle')}</h1>
        <p className="mt-2 text-slate-600">{t('postFormSubtitle')}</p>
      </div>

      <form onSubmit={submit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label={t('title')} value={form.title} placeholder={t('titlePlaceholder')} onChange={(title) => setForm({ ...form, title })} />
          <Field label={t('duration')} value={form.duration} placeholder={t('durationPlaceholder')} onChange={(duration) => setForm({ ...form, duration })} />
          <SelectCombobox label={t('city')} value={form.city} options={toOptions(cities.filter((city) => city !== 'All Kazakhstan'))} onChange={(city) => setForm({ ...form, city })} />
          <SelectCombobox label={t('format')} value={form.format} options={toOptions(formats.filter((format) => format !== 'All formats'))} onChange={(format) => setForm({ ...form, format })} />
          <SelectCombobox label={t('category')} value={form.category} options={toOptions(categories.map((category) => category.name))} onChange={(category) => setForm({ ...form, category })} />
          <SelectCombobox label={t('schedule')} value={form.schedule} options={toOptions(schedules.filter((schedule) => schedule !== 'Any schedule'))} onChange={(schedule) => setForm({ ...form, schedule })} />
          <Field label={t('contacts')} value={form.contacts} placeholder={t('contactsPlaceholder')} onChange={(contacts) => setForm({ ...form, contacts })} />
          <TextArea label={t('description')} value={form.description} placeholder={t('descriptionPlaceholder')} onChange={(description) => setForm({ ...form, description })} />
          <TextArea label={t('requirements')} value={form.requirements} placeholder={t('requirementsPlaceholder')} onChange={(requirements) => setForm({ ...form, requirements })} />
        </div>
        {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}
        <button className="pressable mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-5 py-4 text-base font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-emerald-700">
          {t('publish')}
          <Send size={18} />
        </button>
      </form>
    </main>
  );
}

function Field({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold focus:border-ocean focus:outline-none focus:ring-4 focus:ring-ocean/15" />
    </label>
  );
}

function TextArea({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return (
    <label className="block md:col-span-2">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={5} placeholder={placeholder} className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold focus:border-ocean focus:outline-none focus:ring-4 focus:ring-ocean/15" />
    </label>
  );
}
