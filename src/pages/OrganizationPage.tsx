import { BriefcaseBusiness, Star } from 'lucide-react';
import { opportunities, organizations } from '../data/mockData';
import { labelFor } from '../i18n/labels';
import { useI18n } from '../i18n/useI18n';
import { Language, Page } from '../types';
import { OpportunityCard } from '../components/OpportunityCard';
import { SectionHeader } from '../components/ui';

export function OrganizationPage({
  language,
  savedIds,
  appliedIds,
  onNavigate,
  onOpenOpportunity,
  onApply,
  onSave,
}: {
  language: Language;
  savedIds: number[];
  appliedIds: number[];
  onNavigate: (page: Page) => void;
  onOpenOpportunity: (id: number) => void;
  onApply: (id: number) => void;
  onSave: (id: number) => void;
}) {
  const { t, localize } = useI18n(language);
  const featured = organizations[0];
  const published = opportunities.filter((item) => item.organization === featured.name).concat(opportunities.slice(1, 3));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <img src={featured.logo} alt={featured.name} className="h-28 w-28 rounded-3xl object-cover shadow-soft" />
          <h1 className="mt-5 text-3xl font-extrabold">{featured.name}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{localize(featured.description)}</p>
          <div className="mt-5 flex items-center gap-2 text-sm font-bold text-amber-600">
            <Star size={18} fill="currentColor" />
            {featured.rating} · {featured.reviews} {t('reviews')}
          </div>
          <button
            onClick={() => onNavigate('post')}
            className="pressable mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3.5 text-base font-extrabold text-white transition hover:bg-slate-800"
          >
            <BriefcaseBusiness size={18} />
            {t('postOpportunity')}
          </button>
        </aside>

        <section>
          <SectionHeader eyebrow={t('navOrganizations')} title={t('organizationsTitle')} />
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            {organizations.map((org) => (
              <div key={org.name} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex items-center gap-4">
                  <img src={org.logo} alt={org.name} className="h-14 w-14 rounded-2xl object-cover" />
                  <div>
                    <h3 className="font-extrabold">{org.name}</h3>
                    <p className="text-sm font-semibold text-slate-500">{labelFor(org.city, language)}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{localize(org.description)}</p>
              </div>
            ))}
          </div>

          <SectionHeader eyebrow={featured.name} title={t('publishedByOrg')} />
          <div className="grid gap-5">
            {published.map((item) => (
              <OpportunityCard
                key={item.id}
                opportunity={item}
                language={language}
                onOpen={() => onOpenOpportunity(item.id)}
                onApply={() => onApply(item.id)}
                isSaved={savedIds.includes(item.id)}
                isApplied={appliedIds.includes(item.id)}
                onSave={() => onSave(item.id)}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
