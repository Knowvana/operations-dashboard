import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, FileJson, FileSpreadsheet, X, Plus, 
  Calendar, Clock, Download, AlertTriangle, CheckCircle2, 
  RefreshCw, ArrowLeft, Save, Copy, ArrowRight 
} from 'lucide-react';
import CronBuilder, { getCronDescription } from './CronBuilder';
import ImportProgressModal from './ImportProgressModal';

// UPDATED: Added TaskCategory and Sample Data
const GOOGLE_SHEET_HEADERS = `TaskName,TaskCategory,CronExpression`;
const SAMPLE_CSV = `TaskName,TaskCategory,CronExpression
Database Backup,Maintenance,0 2 * * *
API Health Check,Monitoring,*/15 * * * *
System Update,System,0 3 1 * *
Log Cleanup,Maintenance,0 1 * * *
Security Scan,Security,0 4 * * 0`;

// UPDATED: Copy logic for columns and toast message
const copyHeadersToClipboard = () => {
  // Replace comma with tab for spreadsheet column pasting
  const headersForSheets = GOOGLE_SHEET_HEADERS.replace(/,/g, '\t');
  navigator.clipboard.writeText(headersForSheets);
  
  // Show temporary message
  const tempMessage = document.createElement('div');
  tempMessage.textContent = 'Headers copied to clipboard!';
  tempMessage.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;
  document.body.appendChild(tempMessage);
  
  setTimeout(() => {
    if (document.body.contains(tempMessage)) {
      document.body.removeChild(tempMessage);
    }
  }, 2000);
};

const downloadSampleCSV = () => {
  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_tasks_schedule.csv';
  a.click();
  URL.revokeObjectURL(url);
};

export default function ImportTasksModal({ open, onClose, onImport, onViewTasks }) {
  const [step, setStep] = useState('input'); // 'input' | 'preview'
  const [tab, setTab] = useState('import');
  const [fileType, setFileType] = useState('csv');
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  
  // Data State
  const [previewTasks, setPreviewTasks] = useState([]);
  const [manualTasks, setManualTasks] = useState([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  
  const [newTask, setNewTask] = useState({
    name: '',
    category: '',
    mode: 'manual',
    manualDate: '',
    manualTime: '',
    cronExpression: '* * * * *' 
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep('input');
      setPreviewTasks([]);
      setManualTasks([]);
      setError('');
      setParsing(false);
      setShowProgressModal(false);
    }
  }, [open]);

  if (!open) return null;

  const handleProcess = async () => {
    setParsing(true); 
    setError('');
    
    try {
      let tasks = [];
      
      if (tab === 'manual') {
        if (manualTasks.length === 0) throw new Error("No tasks added to queue");
        tasks = [...manualTasks];
      } else {
        // File Import Logic
        if (fileType === 'csv') {
          const text = rawData || (file ? await file.text() : '');
          if(!text) throw new Error("No data provided");
          tasks = parseCSV(text);
        } else if (fileType === 'json') {
          const text = rawData || (file ? await file.text() : '');
          if(!text) throw new Error("No data provided");
          tasks = JSON.parse(text);
        } else if (fileType === 'gsheet') {
          if (!sheetUrl) throw new Error('Google Sheet URL required');
          tasks = await fetchGoogleSheet(sheetUrl);
        }
      }
      
      if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        throw new Error("No valid tasks found to import");
      }
      
      // Normalize Data for Preview
      const processed = tasks.map(processTaskData);
      setPreviewTasks(processed);
      setStep('preview');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setParsing(false);
    }
  };

  const processTaskData = (task) => {
    const taskName = task.TaskName || task.taskName || task.name || 'Untitled Task';
    const taskId = task.taskId || `task_${taskName.replace(/\s+/g, '_')}_${Math.random().toString(36).substr(2, 9)}`;
    let cronSchedule = task.CronExpression || task.cronExpression || task.cron_schedule || '';
    
    return {
      taskId: taskId,
      taskName: taskName,
      cron_schedule: cronSchedule,
      // Priority to TaskCategory as per new header
      category: task.TaskCategory || task.category || 'General',
      
      // Fields for Preview UI
      previewSchedule: cronSchedule ? getCronDescription(cronSchedule) : 'No Schedule'
    };
  };

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((h, i) => obj[h] = values[i]?.trim());
      return obj;
    });
  };

  const fetchGoogleSheet = async (url) => {
    let csvUrl = url;
    if (url.includes('/edit')) {
      const match = url.match(/\/d\/(.*?)(\/|$)/);
      if (!match) throw new Error('Invalid Google Sheet URL');
      csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
    }
    const resp = await fetch(csvUrl);
    if (!resp.ok) throw new Error('Failed to fetch. Ensure sheet is public/published.');
    return parseCSV(await resp.text());
  };

  const addManualTask = () => {
    if(!newTask.name) return;
    setManualTasks([...manualTasks, { ...newTask }]);
    setNewTask({ ...newTask, name: '', manualDate: '', manualTime: '' });
  };

  const handleSaveToDatabase = () => {
    setShowProgressModal(true);
  };

  const handleSuccessNavigation = () => {
    setShowProgressModal(false);
    onViewTasks(); // Navigate to tasks view
    onClose(); // Close main modal
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all duration-300">
        <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Import Tasks</h2>
              <p className="text-slate-500 text-sm mt-1">Bulk upload or create recurring schedules</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
            
            {/* STEP 1: INPUT */}
            {step === 'input' && (
              <>
                {/* Tabs */}
                <div className="mb-6">
                  <div className="flex gap-6 border-b border-slate-200">
                    <TabButton active={tab === 'import'} onClick={() => setTab('import')} icon={<Upload size={18} />} label="Bulk Import" />
                    <TabButton active={tab === 'manual'} onClick={() => setTab('manual')} icon={<Plus size={18} />} label="Create Manually" />
                  </div>
                </div>

                {tab === 'import' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* File Type Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FileTypeCard active={fileType === 'csv'} onClick={() => setFileType('csv')} icon={<FileSpreadsheet className="text-emerald-500" />} label="CSV File" desc="Standard comma separated" />
                        <FileTypeCard active={fileType === 'json'} onClick={() => setFileType('json')} icon={<FileJson className="text-amber-500" />} label="JSON File" desc="Structured data format" />
                        <FileTypeCard active={fileType === 'gsheet'} onClick={() => setFileType('gsheet')} icon={<FileText className="text-blue-500" />} label="Google Sheets" desc="Import via public link" />
                    </div>

                    {/* Input Area */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                      {fileType === 'gsheet' ? (
                        <div className="space-y-4">
                          <label className="text-sm font-semibold text-slate-700">Google Sheet URL</label>
                          <input type="text" value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                          <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-md">
                            <AlertTriangle size={14} className="mt-0.5" />
                            <span>Ensure sheet is set to "Anyone with the link" or published to the web.</span>
                          </div>
                          
                          {/* Google Sheets Format Guide Table */}
                          <div className="bg-gradient-to-br from-white to-indigo-50/20 border border-indigo-200 rounded-xl p-4 shadow-lg shadow-indigo-100/30">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-semibold text-indigo-700">Google Sheets Format</h4>
                              <button 
                                onClick={copyHeadersToClipboard}
                                className="flex items-center gap-1.5 text-xs bg-indigo-500 text-white px-3 py-1.5 rounded-md hover:bg-indigo-600 transition-colors shadow-sm"
                              >
                                <Copy size={12} /> Copy Headers
                              </button>
                            </div>
                            
                            {/* Sample Data Table */}
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-indigo-50 text-indigo-700 font-semibold border-b border-indigo-200">
                                  <th className="px-4 py-2.5 text-left border-r border-indigo-200">TaskName</th>
                                  <th className="px-4 py-2.5 text-left border-r border-indigo-200">TaskCategory</th>
                                  <th className="px-4 py-2.5 text-left border-r border-indigo-200">CronExpression</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50 transition-colors">
                                  <td className="px-4 py-2.5 font-medium text-slate-800 border-r border-indigo-100">Database Backup</td>
                                  <td className="px-4 py-2.5 text-center border-r border-indigo-100">
                                    <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs text-slate-600 font-medium">Maintenance</span>
                                  </td>
                                  <td className="px-4 py-2.5 text-xs font-mono text-indigo-600 border-r border-indigo-100">0 2 * * *</td>
                                </tr>
                                <tr className="hover:bg-slate-50 transition-colors">
                                  <td className="px-4 py-2.5 font-medium text-slate-800 border-r border-indigo-100">API Health Check</td>
                                  <td className="px-4 py-2.5 text-center border-r border-indigo-100">
                                    <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs text-slate-600 font-medium">Monitoring</span>
                                  </td>
                                  <td className="px-4 py-2.5 text-xs font-mono text-indigo-600 border-r border-indigo-100">*/15 * * * *</td>
                                </tr>
                              </tbody>
                            </table>
                            <div className="flex items-start gap-2 text-indigo-600 font-medium mt-3 p-2 bg-indigo-50/50 rounded-lg text-xs">
                              <RefreshCw size={12} className="flex-shrink-0 mt-0.5" />
                              <span>Only <b>TaskName</b> and <b>CronExpression</b> are required. Cron expressions are saved directly to database.</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                           <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
                            <input type="file" accept={fileType === 'csv' ? '.csv' : '.json'} onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <div className="flex flex-col items-center gap-2 pointer-events-none">
                              <Upload className="text-slate-300" size={32} />
                              <span className="text-slate-600 font-medium">{file ? file.name : "Click to upload or drag file"}</span>
                            </div>
                          </div>
                          <textarea value={rawData} onChange={(e) => setRawData(e.target.value)} rows={4} placeholder="Or paste text content here..." className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm font-mono" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {tab === 'manual' && (
                  <div className="space-y-6 animate-in fade-in">
                     <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Task Name</label>
                              <input value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="Backup DB"/>
                           </div>
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                              <input value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="Maintenance"/>
                           </div>
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-slate-500 uppercase">Schedule</label>
                           <CronBuilder value={newTask.cronExpression} onChange={val => setNewTask({...newTask, cronExpression: val})} />
                        </div>
                        <button onClick={addManualTask} className="w-full py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg hover:bg-indigo-100 flex items-center justify-center gap-2"><Plus size={16}/> Add to Queue</button>
                     </div>
                     
                     {manualTasks.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                           <h4 className="font-bold text-slate-700 mb-2">Queue ({manualTasks.length})</h4>
                           <div className="space-y-2 max-h-40 overflow-y-auto">
                              {manualTasks.map((t, i) => (
                                 <div key={i} className="text-sm border-b border-slate-50 last:border-0 pb-2 mb-2">
                                    <div className="font-medium">{t.name}</div>
                                    <div className="text-xs text-slate-500">{t.category} • {getCronDescription(t.cronExpression)}</div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
                )}

                {/* Footer Buttons for Input Step */}
                <div className="flex justify-between items-center pt-6 mt-4 border-t border-slate-100">
                  {fileType === 'csv' && tab === 'import' ? (
                     <button onClick={downloadSampleCSV} className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1"><Download size={14}/> Sample CSV</button>
                  ) : <div></div>}
                  
                  <button 
                    onClick={handleProcess} 
                    disabled={parsing}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-slate-200"
                  >
                    {parsing ? <RefreshCw className="animate-spin" size={18}/> : <ArrowRight size={18}/>}
                    {parsing ? 'Processing...' : 'Import Tasks from CSV'}
                  </button>
                </div>
                {error && <div className="mt-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium">{error}</div>}
              </>
            )}

            {/* STEP 2: SUMMARY / PREVIEW */}
            {step === 'preview' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                 <div className="flex-1 overflow-hidden flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <CheckCircle2 className="text-green-500" size={20}/> 
                       Ready to Import {previewTasks.length} Tasks
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-white">
                       <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0">
                             <tr>
                                <th className="px-4 py-3">Task Name</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Schedule (Cron)</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {previewTasks.map((t, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                   <td className="px-4 py-3 font-medium text-slate-800">{t.taskName}</td>
                                   <td className="px-4 py-3 text-slate-600">{t.category}</td>
                                   <td className="px-4 py-3">
                                      <div className="text-xs font-mono bg-slate-100 px-2 py-1 rounded w-fit text-slate-600">{t.cron_schedule}</div>
                                      <div className="text-[10px] text-slate-400 mt-0.5">{t.previewSchedule}</div>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 {/* Footer Buttons for Preview Step */}
                 <div className="flex justify-between items-center pt-6 mt-4 border-t border-slate-100">
                    <button onClick={() => setStep('input')} className="text-slate-500 font-bold hover:text-slate-800 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                       <ArrowLeft size={18}/> Back
                    </button>
                    <button 
                       onClick={handleSaveToDatabase} 
                       className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 hover:scale-[1.02] transition-all flex items-center gap-2"
                    >
                       <Save size={18}/> Save to Database
                    </button>
                 </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Progress Modal */}
      <ImportProgressModal
        isOpen={showProgressModal}
        tasks={previewTasks}
        saveAction={onImport} // This is the App.jsx handleImportTasks function
        onSuccess={handleSuccessNavigation}
        onClose={() => setShowProgressModal(false)}
      />  
    </>
  );
}

// Helpers
const TabButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`pb-4 px-2 text-sm font-semibold flex items-center gap-2 transition-all relative ${active ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
    {icon} {label}
    {active && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
  </button>
);
const FileTypeCard = ({ active, onClick, icon, label, desc }) => (
  <button onClick={onClick} className={`p-4 rounded-xl border-2 text-left transition-all group ${active ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'}`}>
    <div className="mb-3 p-2 bg-white rounded-lg w-fit shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">{icon}</div>
    <div className="font-semibold text-slate-800 text-sm">{label}</div>
    <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
  </button>
);