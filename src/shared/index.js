// src/shared/index.js

// ----------------------------------------------------------------------
// 1. COMPONENTS
// ----------------------------------------------------------------------
export { default as ProgressBar } from './components/ProgressBar';
export { default as EmptyState } from './components/EmptyState';
export { default as CronBuilder, getCronDescription } from './components/CronBuilder';
export { default as ConfirmationModal } from './components/ConfirmationModal';
export { default as LoadingSpinner } from './components/LoadingSpinner';
export { default as ModuleLayout } from './components/layouts/ModuleLayout';
export { default as SettingsModal } from './components/SettingsModal';
export { default as LoginForm } from './components/LoginForm';
export { default as DefaultAdminLoginPage } from './components/DefaultAdminLoginPage';
// ----------------------------------------------------------------------
// 2. SERVICES
// ----------------------------------------------------------------------
export * from './services/firebaseService';
export * from './services/authService';
export * from './services/demoDataService';
export * from './services/tenantService';
export * from './services/adminService';
export * from './services/tenantUserService';

// ----------------------------------------------------------------------
// 3. UTILITIES
// ----------------------------------------------------------------------
export * from './utils/utils';

// ----------------------------------------------------------------------
// 4. CONFIG & DATA
// ----------------------------------------------------------------------
export { firebaseConfig } from './config/firebaseConfig';