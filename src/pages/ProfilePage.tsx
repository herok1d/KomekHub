import { MapPin } from 'lucide-react';
import { opportunities } from '../data/mockData';
import { useI18n } from '../i18n/useI18n';
import { Language, Opportunity } from '../types';
import { OpportunityCard } from '../components/OpportunityCard';
import { Pill, SectionHeader } from '../components/ui';

export function ProfilePage({
  language,
  savedOpportunities,
  appliedIds,
  onOpenOpportunity,
  onApply,
  onSave,
}: {
  language: Language;
  savedOpportunities: Opportunity[];
  appliedIds: number[];
  onOpenOpportunity: (id: number) => void;
  onApply: (id: number) => void;
  onSave: (id: number) => void;
}) {
  const { t } = useI18n(language);
  const history = opportunities.filter((item) => appliedIds.includes(item.id)).slice(0, 4);
  const fallbackHistory = history.length ? history : opportunities.slice(0, 3);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
        <div className="h-36 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[300px_1fr]">
          <div className="-mt-20">
            <img
              src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=240&q=80"
              alt="AITU student volunteer"
              className="h-32 w-32 rounded-[2rem] border-4 border-white object-cover shadow-lift"
            />
            <h1 className="mt-5 text-3xl font-extrabold">Aigerim Sapar</h1>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <MapPin size={17} />
              {t('profileCity')} · AITU
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-600">{t('profileSummary')}</p>
            <div className="mt-5 rounded-3xl bg-mist p-5">
              <div className="text-4xl font-extrabold text-leaf">148</div>
              <div className="text-sm font-semibold text-slate-600">{t('hoursLogged')}</div>
            </div>
          </div>

          <div className="grid gap-6">
            <ProfileChips title={t('languages')} items={['Kazakh', 'Russian', 'English']} />
            <ProfileChips title={t('interests')} items={['Education', 'IT & Digital', 'Youth', 'Inclusive education', 'Community']} />
            <ProfileChips title={t('skills')} items={['Mentoring', 'React basics', 'Public speaking', 'SMM', 'Research']} />
            <div>
              <h2 className="mb-3 text-xl font-extrabold">{t('applicationHistory')}</h2>
              <div className="grid gap-3">
                {fallbackHistory.map((item, index) => (
                  <button key={item.id} onClick={() => onOpenOpportunity(item.id)} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left hover:border-ocean/40">
                    <span>
                      <span className="block font-bold">{item.title[language]}</span>
                      <span className="text-sm text-slate-500">{item.organization}</span>
                    </span>
                    <span className="rounded-full bg-skysoft px-3 py-1 text-xs font-extrabold text-ocean">{index === 0 ? t('underReview') : t('accepted')}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader eyebrow={t('saved')} title={t('savedVolunteering')} />
        <div className="grid gap-5 md:grid-cols-2">
          {savedOpportunities.map((item) => (
            <OpportunityCard
              key={item.id}
              opportunity={item}
              language={language}
              onOpen={() => onOpenOpportunity(item.id)}
              onApply={() => onApply(item.id)}
              isSaved
              isApplied={appliedIds.includes(item.id)}
              onSave={() => onSave(item.id)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function ProfileChips({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="mb-3 text-xl font-extrabold">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Pill key={item} label={item} />
        ))}
      </div>
    </div>
  );
}
