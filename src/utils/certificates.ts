import { Certificate, Language } from '../types';
import { labelFor } from '../i18n/labels';

const certificateCopy = {
  en: {
    title: 'KomekHub Certificate of Volunteering',
    certifies: 'This certifies that',
    completed: 'has successfully completed the volunteering activity:',
    organization: 'Organization',
    city: 'City',
    hours: 'Volunteer hours',
    issued: 'Issued date',
    id: 'Certificate ID',
    verified: 'Verified through KomekHub',
  },
  ru: {
    title: 'Сертификат волонтёрства KomekHub',
    certifies: 'Настоящим подтверждается, что',
    completed: 'успешно принял(а) участие в волонтёрской активности:',
    organization: 'Организация',
    city: 'Город',
    hours: 'Количество часов',
    issued: 'Дата выдачи',
    id: 'ID сертификата',
    verified: 'Подтверждено через KomekHub',
  },
  kk: {
    title: 'KomekHub волонтёрлік сертификаты',
    certifies: 'Осы арқылы расталады:',
    completed: 'мына волонтёрлік қызметті сәтті аяқтады:',
    organization: 'Ұйым',
    city: 'Қала',
    hours: 'Волонтёрлік сағаттар',
    issued: 'Берілген күні',
    id: 'Сертификат ID',
    verified: 'KomekHub арқылы расталды',
  },
} satisfies Record<Language, Record<string, string>>;

export function formatDate(value: string, language: Language) {
  const locale = language === 'ru' ? 'ru-KZ' : language === 'kk' ? 'kk-KZ' : 'en-KZ';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

export async function downloadCertificatePdf(certificate: Certificate, language: Language) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const copy = certificateCopy[language];
  const opportunityTitle = certificate.opportunityTitle[language] || certificate.opportunityTitle.en;
  const rows = [
    `${copy.organization}: ${certificate.organizationName}`,
    `${copy.city}: ${labelFor(certificate.city, language)}`,
    `${copy.hours}: ${certificate.volunteerHours}`,
    `${copy.issued}: ${formatDate(certificate.issuedAt, language)}`,
    `${copy.id}: ${certificate.certificateNumber}`,
  ];
  const element = document.createElement('div');
  element.style.width = '842px';
  element.style.height = '595px';
  element.style.padding = '42px';
  element.style.boxSizing = 'border-box';
  element.style.background = '#f6faf9';
  element.style.color = '#17212b';
  element.style.fontFamily = 'Inter, Arial, sans-serif';
  element.innerHTML = `
    <div style="height:511px;border:3px solid #1f9d72;border-radius:18px;padding:54px 64px;text-align:center;box-sizing:border-box;background:white;">
      <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:28px;">
        <img src="/logo-icon.png" alt="" style="width:48px;height:48px;object-fit:contain;border-radius:12px;" />
        <div style="font-size:28px;font-weight:800;">Komek<span style="color:#2f80ed;">Hub</span></div>
      </div>
      <h1 style="font-size:30px;line-height:1.2;margin:0 0 34px;font-weight:800;">${escapeHtml(copy.title)}</h1>
      <p style="font-size:17px;margin:0 0 14px;">${escapeHtml(copy.certifies)}</p>
      <div style="font-size:34px;font-weight:800;margin-bottom:22px;">${escapeHtml(certificate.volunteerName)}</div>
      <p style="font-size:16px;margin:0 0 12px;">${escapeHtml(copy.completed)}</p>
      <div style="font-size:22px;font-weight:800;margin:0 auto 30px;max-width:650px;line-height:1.3;">${escapeHtml(opportunityTitle)}</div>
      <div style="display:grid;gap:10px;font-size:15px;line-height:1.35;">
        ${rows.map((row) => `<div>${escapeHtml(row)}</div>`).join('')}
      </div>
      <div style="margin-top:34px;color:#2f80ed;font-size:16px;font-weight:800;">${escapeHtml(copy.verified)}</div>
    </div>
  `;
  element.style.position = 'fixed';
  element.style.left = '-10000px';
  element.style.top = '0';
  document.body.appendChild(element);

  try {
    await doc.html(element, {
      x: 0,
      y: 0,
      width: 842,
      windowWidth: 842,
      callback: (pdf) => pdf.save(`${certificate.certificateNumber}.pdf`),
    });
  } finally {
    element.remove();
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return entities[character];
  });
}
