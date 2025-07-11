import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TranslationState {
  currentLang: 'en' | 'fr';
  setLanguage: (lang: 'en' | 'fr') => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    'header.welcome': 'Welcome',
    'header.profile': 'Profile',
    'header.logout': 'Logout',
    'header.switchToFrench': 'Switch to French',
    'header.switchToEnglish': 'Switch to English',
    'header.backToDashboard': 'Back to Dashboard',
    
    // Dashboard
    'dashboard.title': 'BEAVERNET System',
    'dashboard.subtitle': 'Municipal Services Management Platform',
    'dashboard.services': 'Services',
    'dashboard.clickToOpen': 'Click to Open',
    'dashboard.notImplemented': 'not yet implemented',
    
    // Services
    'service.beaverpatch': 'BeaverPatch',
    'service.beaverpatch.desc': 'CAD System',
    'service.beaverpaws': 'BeaverPaws',
    'service.beaverpaws.desc': 'Animal Controls',
    'service.beavercrm': 'BeaverCRM',
    'service.beavercrm.desc': 'Customer Management',
    'service.beaverdoc': 'BeaverDoc',
    'service.beaverdoc.desc': 'Legal Documents',
    'service.beaverpay': 'BeaverPay',
    'service.beaverpay.desc': 'Payment Management',
    'service.beavermonitor': 'BeaverMonitor',
    'service.beavermonitor.desc': 'System Monitoring',
    'service.beaverdmv': 'BeaverDMV',
    'service.beaverdmv.desc': 'DMV Services',
    'service.beaverisk': 'BeaverRisk',
    'service.beaverisk.desc': 'Risk Assessment',
    'service.beaveraudit': 'BeaverAudit',
    'service.beaveraudit.desc': 'Audit & Compliance',
    
    // Common
    'common.loading': 'Loading...',
    'common.search': 'Search',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.time': 'Time',
    'common.type': 'Type',
    'common.description': 'Description',
    'common.location': 'Location',
    'common.priority': 'Priority',
    'common.assign': 'Assign',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.details': 'Details',
    'common.actions': 'Actions',
  },
  fr: {
    // Header
    'header.welcome': 'Bienvenue',
    'header.profile': 'Profil',
    'header.logout': 'Déconnexion',
    'header.switchToFrench': 'Passer au français',
    'header.switchToEnglish': 'Passer à l\'anglais',
    'header.backToDashboard': 'Retour au tableau de bord',
    
    // Dashboard
    'dashboard.title': 'Système BEAVERNET',
    'dashboard.subtitle': 'Plateforme de gestion des services municipaux',
    'dashboard.services': 'Services',
    'dashboard.clickToOpen': 'Cliquer pour ouvrir',
    'dashboard.notImplemented': 'pas encore implémenté',
    
    // Services
    'service.beaverpatch': 'BeaverPatch',
    'service.beaverpatch.desc': 'Système CAO',
    'service.beaverpaws': 'BeaverPaws',
    'service.beaverpaws.desc': 'Contrôle Animalier',
    'service.beavercrm': 'BeaverCRM',
    'service.beavercrm.desc': 'Gestion Clientèle',
    'service.beaverdoc': 'BeaverDoc',
    'service.beaverdoc.desc': 'Documents Légaux',
    'service.beaverpay': 'BeaverPay',
    'service.beaverpay.desc': 'Gestion Paiements',
    'service.beavermonitor': 'BeaverMonitor',
    'service.beavermonitor.desc': 'Surveillance Système',
    'service.beaverdmv': 'BeaverDMV',
    'service.beaverdmv.desc': 'Services SAAQ',
    'service.beaverisk': 'BeaverRisk',
    'service.beaverisk.desc': 'Évaluation Risques',
    'service.beaveraudit': 'BeaverAudit',
    'service.beaveraudit.desc': 'Audit et Conformité',
    
    // Common
    'common.loading': 'Chargement...',
    'common.search': 'Rechercher',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.status': 'Statut',
    'common.date': 'Date',
    'common.time': 'Heure',
    'common.type': 'Type',
    'common.description': 'Description',
    'common.location': 'Emplacement',
    'common.priority': 'Priorité',
    'common.assign': 'Assigner',
    'common.submit': 'Soumettre',
    'common.close': 'Fermer',
    'common.details': 'Détails',
    'common.actions': 'Actions',
  },
};

export const useTranslation = create<TranslationState>()(
  persist(
    (set, get) => ({
      currentLang: 'en',
      setLanguage: (lang: 'en' | 'fr') => set({ currentLang: lang }),
      t: (key: string) => {
        const { currentLang } = get();
        return translations[currentLang][key] || key;
      },
    }),
    {
      name: 'beavernet-language',
    }
  )
);