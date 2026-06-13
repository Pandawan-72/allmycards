import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FR from "./locales/fr";
import EN from "./locales/en";
import DE from "./locales/de";
import ES from "./locales/es";
import IT from "./locales/it";
import PT from "./locales/pt";
import NL from "./locales/nl";
import RU from "./locales/ru";

import legalFr from "./locales/legal/fr";
import legalEn from "./locales/legal/en";
import legalDe from "./locales/legal/de";
import legalEs from "./locales/legal/es";
import legalIt from "./locales/legal/it";
import legalPt from "./locales/legal/pt";
import legalNl from "./locales/legal/nl";
import legalRu from "./locales/legal/ru";

export const SUPPORTED_LANGS = ["fr", "en", "de", "es", "it", "pt", "nl", "ru"] as const;
export type AppLang = typeof SUPPORTED_LANGS[number];

const LANG_KEY = "amc2.lang";

const resources = {
  fr: { translation: { ...FR, legal: legalFr } },
  en: { translation: { ...EN, legal: legalEn } },
  de: { translation: { ...DE, legal: legalDe } },
  es: { translation: { ...ES, legal: legalEs } },
  it: { translation: { ...IT, legal: legalIt } },
  pt: { translation: { ...PT, legal: legalPt } },
  nl: { translation: { ...NL, legal: legalNl } },
  ru: { translation: { ...RU, legal: legalRu } },
};

const deviceLang = (Localization.getLocales?.()?.[0]?.languageCode || "fr") as string;
const defaultLang = SUPPORTED_LANGS.includes(deviceLang as AppLang) ? deviceLang : "fr";

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLang,
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

export async function loadSavedLang(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(LANG_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved as AppLang)) {
      await i18n.changeLanguage(saved);
    }
  } catch {}
}

export async function setAppLang(lang: AppLang): Promise<void> {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANG_KEY, lang);
}

export default i18n;
