import i18n from "i18next";
import { initReactI18next } from "react-i18next";

let initialized = false;

export const initializeI18n = (translations: any = {}) => {
    if (initialized) return;

    i18n.use(initReactI18next).init({
        resources: translations,
        lng: "da",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
    }).then((res) => {
        console.log('I18n initialized', i18n?.language);
    }).catch((error: any) => {
        console.error('Error initializing i18n', error);
    });

    initialized = true;
};

export default i18n;