import { LEGAL_VERSION } from '@budget-app/shared';

// ─────────────────────────────────────────────────────────────────────────────
//  FILL THIS IN before you publish.
//  Every value in [square brackets] is a placeholder: it shows highlighted on
//  the legal pages so it cannot be missed. Replace it with your real details.
//  When the Terms / Privacy / Cookie text changes in a way people must accept
//  again, change the date below AND LEGAL_VERSION in packages/shared (API and
//  web) — everyone is then asked to accept the new version.
// ─────────────────────────────────────────────────────────────────────────────
export const LEGAL = {
  appName: 'Rayza Budget',
  version: LEGAL_VERSION,
  lastUpdated: '1 October 2026',

  // The "responsible party" under POPIA and the supplier under ECTA s43.
  responsibleParty: '[Your full name or company name]',
  legalStatus: '[e.g. Individual, or (Pty) Ltd with registration number]',
  address: '[Your physical address in South Africa]',
  email: '[Your contact email address]',
  // Your Information Officer (for a sole owner this is normally you). The
  // Information Officer must be registered with the Information Regulator.
  informationOfficer: {
    name: '[Information Officer full name]',
    email: '[Information Officer email address]',
  },

  // Who helps run the app and sees the data. Edit to match what you really use.
  operators: [
    { name: 'Netlify, Inc.', does: 'Hosts the web app', where: 'United States / global network' },
    { name: '[API hosting provider]', does: 'Runs the server that processes your budget data', where: '[Country]' },
    { name: '[Database provider, e.g. MongoDB Atlas]', does: 'Stores your account and budget data', where: '[Country / region]' },
    { name: '[Redis provider]', does: 'Holds short-lived session security data', where: '[Country / region]' },
    { name: '[Email provider, e.g. Resend or Brevo]', does: 'Sends password-reset emails', where: '[Country]' },
    { name: 'Google Fonts (Google LLC)', does: 'Delivers the typefaces the app uses', where: 'United States / global' },
  ],

  logRetention: '[30] days',
  backupRetention: '[30] days',
  governingCourts: '[the courts of the Republic of South Africa that have jurisdiction where you live]',
  fees: 'The app is free to use at the date above. If that changes, we will tell you before you are charged anything.',
};

// The Information Regulator (South Africa) — where complaints can be taken.
export const REGULATOR = {
  name: 'The Information Regulator (South Africa)',
  address: 'JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001',
  post: 'P.O. Box 31533, Braamfontein, Johannesburg, 2017',
  complaintsEmail: 'POPIAComplaints@inforegulator.org.za',
  enquiriesEmail: 'enquiries@inforegulator.org.za',
  website: 'https://inforegulator.org.za',
};
