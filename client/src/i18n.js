import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import ta from "./locales/ta.json";
import hi from "./locales/hi.json";
import ml from "./locales/ml.json";
import te from "./locales/te.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ta: { translation: ta },
      hi: { translation: hi },
      ml: { translation: ml },
      te: { translation: te },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18n;
