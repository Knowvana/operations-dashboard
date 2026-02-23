// src/shell/components/DatabaseSetupTab.jsx
import React, { useState } from 'react';
import { Database, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';

export default function DatabaseSetupTab() {
  const [copied, setCopied] = useState(false);

  const firebaseConfig = {
    projectId: "knowvana-ops",
    databaseURL: "https://knowvana-ops-default-rtdb.firebaseio.com"
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const databaseStructure = `Platforms/ (Root Collection)
└── Knowvana/ (Document)
    │
    ├── ApplicationAdmins/ (Subcollection)
    │   └── {userId}/ (Document)
    │       ├── email: string
    │       ├── displayName: string
    │       ├── role: "super_admin" | "admin"
    │       ├── permissions: array
    │       ├── createdAt: timestamp
    │       └── updatedAt: timestamp
    │
    ├── TenantUsers/ (Subcollection)
    │   └── {userId}/ (Document)
    │       ├── email: string
    │       ├── displayName: string
    │       ├── tenants: map
    │       │   └── {tenantId}: {role, status, permissions}
    │       ├── createdAt: timestamp
    │       └── updatedAt: timestamp
    │
    └── Tenants/ (Subcollection)
        └── {tenantId}/ (Document)
            ├── metadata/ (Subcollection)
            │   └── info/ (Document)
            │       ├── tenantName: string
            │       ├── status: "active" | "suspended" | "trial"
            │       ├── plan: "free" | "pro" | "enterprise"
            │       ├── domain: string (optional)
            │       ├── owner: string
            │       ├── createdAt: timestamp
            │       └── updatedAt: timestamp
            │
            ├── config/ (Subcollection)
            │   └── app/ (Document)
            │       └── [app configuration]
            │
            └── tasks/ (Subcollection)
                └── {taskId}/ (Document)`;

  const setupSteps = [
    {
      title: "Create Firestore Database",
      description: "Go to Firebase Console → Firestore Database → Create Database",
      status: "required"
    },
    {
      title: "Set Security Rules",
      description: "Configure Firestore security rules to protect your data",
      status: "required"
    },
    {
      title: "Create Root Collection",
      description: "Create 'Knowvana' collection with ApplicationAdmins and Tenants subcollections",
      status: "required"
    },
    {
      title: "Add First Admin",
      description: "Use AdminSetupHelper to add your first application admin",
      status: "optional"
    }
  ];

  const securityRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Application Admins
    match /Platforms/Knowvana/ApplicationAdmins/{adminId} {
      allow read: if request.auth != null && request.auth.uid == adminId;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/Platforms/Knowvana/ApplicationAdmins/$(request.auth.uid));
    }
    
    // Tenant Users
    match /Platforms/Knowvana/TenantUsers/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/Platforms/Knowvana/ApplicationAdmins/$(request.auth.uid));
    }
    
    // Tenants and subcollections
    match /Platforms/Knowvana/Tenants/{tenantId}/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/Platforms/Knowvana/ApplicationAdmins/$(request.auth.uid));
    }
  }
}`;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Database Setup</h3>
        <p className="text-slate-600">Configure your Firebase Firestore database structure</p>
      </div>

      {/* Firebase Configuration */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database size={20} className="text-blue-600" />
          <h4 className="text-lg font-bold text-slate-800">Firebase Configuration</h4>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Project ID</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-2 bg-white rounded-lg border border-slate-200 font-mono text-sm">
                {firebaseConfig.projectId}
              </code>
              <button
                onClick={() => handleCopy(firebaseConfig.projectId)}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Copy size={16} className="text-blue-600" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Database URL</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-2 bg-white rounded-lg border border-slate-200 font-mono text-sm">
                {firebaseConfig.databaseURL}
              </code>
              <button
                onClick={() => handleCopy(firebaseConfig.databaseURL)}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Copy size={16} className="text-blue-600" />
              </button>
            </div>
          </div>
        </div>
        {copied && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
            <CheckCircle size={16} />
            <span>Copied to clipboard!</span>
          </div>
        )}
      </div>

      {/* Setup Steps */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h4 className="text-lg font-bold text-slate-800 mb-4">Setup Steps</h4>
        <div className="space-y-3">
          {setupSteps.map((step, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                {index + 1}
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-slate-800">{step.title}</h5>
                <p className="text-sm text-slate-600 mt-1">{step.description}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                step.status === 'required' 
                  ? 'bg-rose-100 text-rose-700' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {step.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Database Structure */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-slate-800">Database Structure</h4>
          <button
            onClick={() => handleCopy(databaseStructure)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Copy size={14} />
            Copy
          </button>
        </div>
        <pre className="bg-white p-4 rounded-lg border border-slate-200 overflow-x-auto text-xs font-mono text-slate-700 leading-relaxed">
{databaseStructure}
        </pre>
      </div>

      {/* Security Rules */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle size={20} className="text-amber-600" />
          <h4 className="text-lg font-bold text-slate-800">Firestore Security Rules</h4>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Copy these rules to your Firebase Console → Firestore → Rules
        </p>
        <div className="relative">
          <button
            onClick={() => handleCopy(securityRules)}
            className="absolute top-3 right-3 flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-600 hover:bg-amber-100 rounded-lg transition-colors z-10"
          >
            <Copy size={14} />
            Copy Rules
          </button>
          <pre className="bg-white p-4 rounded-lg border border-slate-200 overflow-x-auto text-xs font-mono text-slate-700 leading-relaxed pr-32">
{securityRules}
          </pre>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
        <h4 className="text-lg font-bold text-slate-800 mb-4">Quick Links</h4>
        <div className="space-y-2">
          <a
            href="https://console.firebase.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all group"
          >
            <ExternalLink size={18} className="text-indigo-600" />
            <div className="flex-1">
              <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                Firebase Console
              </p>
              <p className="text-xs text-slate-500">Manage your Firebase project</p>
            </div>
          </a>
          <a
            href="https://firebase.google.com/docs/firestore"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all group"
          >
            <ExternalLink size={18} className="text-indigo-600" />
            <div className="flex-1">
              <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                Firestore Documentation
              </p>
              <p className="text-xs text-slate-500">Learn about Firestore</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
