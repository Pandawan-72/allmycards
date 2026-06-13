import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import FR from "./locales/fr";

const resources = {
  fr: { translation: FR },
};

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.getLocales?.()?.[0]?.languageCode || "fr",
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

export default i18n;
