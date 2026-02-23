// src/shared/index.js

// ----------------------------------------------------------------------
// 1. COMPONENTS
// ----------------------------------------------------------------------
export { default as ProgressBar } from './components/ProgressBar';
export { default as EmptyState } from './components/EmptyState';
export { default as CronBuilder, getCronDescription } from './components/CronBuilder';
export { default as ConfirmationModal } from './components/ConfirmationModal';
export { default as ModuleLayout } from './components/layouts/ModuleLayout';
export { default as SettingsModal } from './components/SettingsModal'; // <-- ADD THIS LINE
// ----------------------------------------------------------------------
// 2. SERVICES
// ----------------------------------------------------------------------
export * from './services/firebaseService';

// ----------------------------------------------------------------------
// 3. UTILITIES
// ----------------------------------------------------------------------
export * from './utils/utils';

// ----------------------------------------------------------------------
// 4. CONFIG & DATA
// ----------------------------------------------------------------------
export { firebaseConfig } from './config/firebaseConfig';
export { default as rosterDefaults } from './data/rosterDefaults.json';
export { default as demoData } from './data/demoData.json';