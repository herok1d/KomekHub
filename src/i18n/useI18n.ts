import { translations, TranslationKey } from './translations';
import { Language, LocalizedText } from '../types';

export function useI18n(language: Language) {
  function t(key: TranslationKey) {
    return translations[language][key] ?? translations.en[key] ?? key;
  }

  function localize(value: LocalizedText) {
    return value[language] || value.en;
  }

  return { t, localize };
}
