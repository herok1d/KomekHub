import { Language } from '../types';

const labels: Record<string, Record<Language, string>> = {
  'All Kazakhstan': { en: 'All Kazakhstan', ru: 'Весь Казахстан' },
  'All categories': { en: 'All categories', ru: 'Все категории' },
  'All formats': { en: 'All formats', ru: 'Все форматы' },
  'Any schedule': { en: 'Any schedule', ru: 'Любой график' },
  'Any language': { en: 'Any language', ru: 'Любой язык' },
  'Any badge': { en: 'Any badge', ru: 'Любой бейдж' },
  Online: { en: 'Online', ru: 'Онлайн' },
  Offline: { en: 'Offline', ru: 'Офлайн' },
  Hybrid: { en: 'Hybrid', ru: 'Гибридно' },
  'Few hours': { en: 'Few hours', ru: 'Несколько часов' },
  Weekend: { en: 'Weekend', ru: 'На выходных' },
  'Part-time': { en: 'Part-time', ru: 'Неполная занятость' },
  Project: { en: 'Project', ru: 'Проект' },
  Flexible: { en: 'Flexible', ru: 'Гибкий график' },
  Kazakh: { en: 'Kazakh', ru: 'Казахский' },
  Russian: { en: 'Russian', ru: 'Русский' },
  English: { en: 'English', ru: 'Английский' },
  Education: { en: 'Education', ru: 'Образование' },
  Health: { en: 'Health', ru: 'Здоровье' },
  Environment: { en: 'Environment', ru: 'Экология' },
  Animals: { en: 'Animals', ru: 'Животные' },
  Community: { en: 'Community', ru: 'Сообщество' },
  Events: { en: 'Events', ru: 'Мероприятия' },
  Media: { en: 'Media', ru: 'Медиа' },
  'IT & Digital': { en: 'IT & Digital', ru: 'IT и цифровые проекты' },
  Charity: { en: 'Charity', ru: 'Благотворительность' },
  Youth: { en: 'Youth', ru: 'Молодёжь' },
  'Student-friendly': { en: 'Student-friendly', ru: 'Для студентов' },
  Certificate: { en: 'Certificate', ru: 'Сертификат' },
  Urgent: { en: 'Urgent', ru: 'Срочно' },
  'No experience needed': { en: 'No experience needed', ru: 'Опыт не нужен' },
  'Kazakh language': { en: 'Kazakh language', ru: 'Казахский язык' },
  'Russian language': { en: 'Russian language', ru: 'Русский язык' },
  'English language': { en: 'English language', ru: 'Английский язык' },
  'Flexible schedule': { en: 'Flexible schedule', ru: 'Гибкий график' },
};

export function labelFor(value: string, language: Language) {
  return labels[value]?.[language] ?? value;
}
