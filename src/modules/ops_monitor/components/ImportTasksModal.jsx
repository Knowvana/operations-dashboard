import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, FileJson, FileSpreadsheet, Plus, 
  Download, AlertTriangle, CheckCircle2, AlertCircle,
  RefreshCw, ArrowLeft, Save, Copy, ArrowRight 
} from 'lucide-react';
import { CronBuilder, getCronDescription } from '@shared';

const GOOGLE_SHEET_HEADERS = `TaskName,TaskCategory,CronExpression`;
const SAMPLE_CSV = `TaskName,TaskCategory,CronExpression
Database Backup,Maintenance,0 2 * * *
API Health Check,Monitoring,*/15 * * * *
System Update,System,0 3 1 * *
Log Cleanup,Maintenance,0 1 * * *
Security Scan,Security,0 4 * * 0`;

const copyHeadersToClipboard = () => {
  const headersForSheets = GOOGLE_SHEET_HEADERS.replace(/,/g, '\t');
  navigator.clipboard.writeText(headersForSheets);
  
  const tempMessage = document.createElement('div');
  tempMessage.textContent = 'Headers copied to clipboard!';
  tempMessage.style.cssText = `
    position: fixed; bottom: 40px; right: 40px;
    background: #0f172a; color: white; padding: 12px 20px;
    border-radius: 8px; font-weight: 600; font-size: 14px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;
  document.body.appendChild(tempMessage);
  setTimeout(() => { if (document.body.contains(tempMessage)) document.body.removeChild(tempMessage); }, 2000);
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

export default function ImportTasksModal({ onImport, onViewTasks, existingTasks = [] }) {
  const [step, setStep] = useState('input'); // 'input' | 'preview'
  const [overlay, setOverlay] = useState('none'); // 'none' | 'saving' | 'success' | 'error'
  
  const [tab, setTab] = useState('import');
  const [fileType, setFileType] = useState('csv');
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  
  const [previewTasks, setPreviewTasks] = useState([]);
  const [validTaskCount, setValidTaskCount] = useState(0);
  const [manualTasks, setManualTasks] = useState([]);
  const [saveProgress, setSaveProgress] = useState(0);
  
  const [newTask, setNewTask] = useState({
    name: '', category: '', mode: 'schedule', cronExpression: '* * * * *' 
  });

  const handleProcess = async () => {
    setParsing(true); 
    setError('');
    
    try {
      let importedRawTasks = [];
      if (tab === 'manual') {
        if (manualTasks.length === 0) throw new Error("No tasks added to queue");
        importedRawTasks = [...manualTasks];
      } else {
        if (fileType === 'csv') {
          const text = rawData || (file ? await file.text() : '');
          if(!text) throw new Error("No data provided");
          importedRawTasks = parseCSV(text);
        } else if (fileType === 'json') {
          const text = rawData || (file ? await file.text() : '');
          if(!text) throw new Error("No data provided");
          importedRawTasks = JSON.parse(text);
        } else if (fileType === 'gsheet') {
          if (!sheetUrl) throw new Error('Google Sheet URL required');
          importedRawTasks = await fetchGoogleSheet(sheetUrl);
        }
      }
      
      if (!importedRawTasks || importedRawTasks.length === 0) throw new Error("No valid tasks found");

      // --- Deduplication & Processing Logic ---
      const existingNames = new Set(existingTasks.map(t => t.title.toLowerCase().trim()));
      const processedTasks = [];
      let validCount = 0;

      importedRawTasks.forEach(task => {
         const name = (task.TaskName || task.taskName || task.name || 'Untitled Task').trim();
         const lowerName = name.toLowerCase();
         const processed = processTaskData(task, name);
         
         if (existingNames.has(lowerName)) {
             processed.importStatus = 'error';
             processed.importComment = 'Duplicate task (skipped)';
         } else {
             existingNames.add(lowerName); // Add to set to prevent internal duplicates
             processed.importStatus = 'success';
             processed.importComment = 'Ready to import';
             validCount++;
         }
         processedTasks.push(processed);
      });

      setValidTaskCount(validCount);
      setPreviewTasks(processedTasks);
      setStep('preview');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setParsing(false);
    }
  };

  const processTaskData = (task, finalName) => {
    let cronSchedule = task.CronExpression || task.cronExpression || task.cron_schedule || '';
    return {
      taskId: `task_${finalName.replace(/\s+/g, '_')}_${Math.random().toString(36).substr(2, 9)}`,
      taskName: finalName,
      cron_schedule: cronSchedule,
      category: task.TaskCategory || task.category || 'General',
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
    setNewTask({ ...newTask, name: '' });
  };

  const handleSaveToDatabase = async () => {
    const tasksToSave = previewTasks.filter(t => t.importStatus === 'success');
    
    if (tasksToSave.length === 0) {
      setError("No valid tasks available to save.");
      return;
    }

    setOverlay('saving');
    try {
      let currentProgress = 0;
      const timer = setInterval(() => {
         currentProgress += 15;
         setSaveProgress(currentProgress >= 90 ? 90 : currentProgress);
      }, 200);

      await onImport(tasksToSave, tab === 'manual' ? 'Manual' : 'Import');
      
      clearInterval(timer);
      setSaveProgress(100);
      
      setTimeout(() => {
        setOverlay('success');
      }, 300);

    } catch (err) {
      setError(err.message || 'Failed to save tasks');
      setOverlay('error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      
      {/* Header specific to Import View */}
      <div className="px-6 py-5 border-b border-slate-100 bg-white z-10 shrink-0">
         <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Data Ingestion</h2>
         <p className="text-slate-500 font-medium mt-0.5 text-xs">Bulk import schedules safely without duplicating records.</p>
      </div>

      {/* Dynamic Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-slate-50/30">
        
        {/* STEP 1: INPUT */}
        {step === 'input' && (
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            {/* Tabs */}
            <div className="flex gap-4 mb-5 border-b border-slate-200 shrink-0">
              <button onClick={() => setTab('import')} className={`pb-2 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${tab === 'import' ? 'border-teal-500 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <Upload size={16} /> Bulk Upload
              </button>
              <button onClick={() => setTab('manual')} className={`pb-2 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${tab === 'manual' ? 'border-teal-500 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <Plus size={16} /> Fast Entry
              </button>
            </div>

            {/* Bulk Upload Tab */}
            {tab === 'import' && (
              <div className="flex-1 flex flex-col gap-4 animate-in fade-in duration-500 min-h-0">
                
                {/* HORIZONTAL FILE TYPE CARDS (Removes Scrollbar) */}
                <div className="grid grid-cols-3 gap-3 shrink-0">
                    <FileTypeCard active={fileType === 'csv'} onClick={() => setFileType('csv')} icon={<FileSpreadsheet className="text-emerald-500" />} label="CSV" desc="Comma format" />
                    <FileTypeCard active={fileType === 'json'} onClick={() => setFileType('json')} icon={<FileJson className="text-amber-500" />} label="JSON" desc="Structured array" />
                    <FileTypeCard active={fileType === 'gsheet'} onClick={() => setFileType('gsheet')} icon={<FileText className="text-blue-500" />} label="Sheets" desc="Published link" />
                </div>

                <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col min-h-0 overflow-hidden">
                  {fileType === 'gsheet' ? (
                    <div className="space-y-3 flex flex-col h-full">
                      <div className="shrink-0">
                         <label className="text-xs font-bold text-slate-700 uppercase">Google Sheet Published URL</label>
                         <input type="text" value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." className="w-full px-4 py-2.5 mt-1 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-medium text-sm text-slate-700" />
                      </div>
                      
                      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm flex-1 overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold text-slate-800">Required Column Headers</h4>
                          <button onClick={copyHeadersToClipboard} className="flex items-center gap-1.5 text-[10px] bg-slate-800 text-white px-2 py-1.5 rounded-lg hover:bg-slate-700 transition-colors font-bold shadow-sm">
                            <Copy size={12} /> Copy Headers
                          </button>
                        </div>
                        <div className="overflow-x-auto border border-slate-200 rounded-lg">
                           <table className="w-full text-xs">
                             <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                               <tr>
                                 <th className="px-3 py-2 text-left">TaskName</th>
                                 <th className="px-3 py-2 text-left">TaskCategory</th>
                                 <th className="px-3 py-2 text-left">CronExpression</th>
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100 bg-white">
                               <tr>
                                 <td className="px-3 py-2 font-medium">Database Backup</td>
                                 <td className="px-3 py-2 text-slate-500">Maintenance</td>
                                 <td className="px-3 py-2 font-mono text-teal-600 text-[10px]">0 2 * * *</td>
                               </tr>
                               <tr>
                                 <td className="px-3 py-2 font-medium">API Check</td>
                                 <td className="px-3 py-2 text-slate-500">Monitoring</td>
                                 <td className="px-3 py-2 font-mono text-teal-600 text-[10px]">*/15 * * * *</td>
                               </tr>
                             </tbody>
                           </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-3 h-full">
                       <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex-1 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-teal-300 transition-all relative min-h-[100px]">
                        <input type="file" accept={fileType === 'csv' ? '.csv' : '.json'} onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <Upload className="text-slate-400 mb-2" size={24} />
                        <span className="text-slate-700 font-bold text-sm">{file ? file.name : "Drop file or click to browse"}</span>
                      </div>
                      <div className="text-center text-[10px] font-bold text-slate-400 uppercase shrink-0">OR</div>
                      <textarea value={rawData} onChange={(e) => setRawData(e.target.value)} placeholder="Paste your raw text data here..." className="flex-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 outline-none text-xs font-mono resize-none min-h-[80px]" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fast Entry Tab */}
            {tab === 'manual' && (
              <div className="flex-1 flex flex-col gap-4 animate-in fade-in duration-500 min-h-0">
                 <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 shrink-0">
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Task Identifier</label>
                          <input value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none" placeholder="e.g. Database Backup"/>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Category</label>
                          <input value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none" placeholder="e.g. Maintenance"/>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Recurring Schedule</label>
                       <div className="border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                          <CronBuilder value={newTask.cronExpression} onChange={val => setNewTask({...newTask, cronExpression: val})} />
                       </div>
                    </div>
                    <button onClick={addManualTask} className="w-full py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-900 active:scale-95 transition-all flex items-center justify-center gap-2"><Plus size={16}/> Queue Task</button>
                 </div>
                 
                 {manualTasks.length > 0 && (
                    <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm overflow-hidden flex flex-col min-h-0">
                       <h4 className="font-bold text-slate-800 mb-2 text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-teal-500"></div> Staging Queue ({manualTasks.length})</h4>
                       <div className="overflow-y-auto pr-2 space-y-2">
                          {manualTasks.map((t, i) => (
                             <div key={i} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                <div>
                                   <div className="font-bold text-slate-700 text-sm">{t.name}</div>
                                   <div className="text-[10px] text-slate-500 font-medium">{getCronDescription(t.cronExpression)}</div>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">{t.category}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}
              </div>
            )}

            {error && <div className="mt-3 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"><AlertTriangle size={14}/> {error}</div>}
          </div>
        )}

        {/* Input Footer Action */}
        {step === 'input' && (
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
               {fileType === 'csv' && tab === 'import' ? (
                  <button onClick={downloadSampleCSV} className="text-xs text-teal-600 font-bold hover:text-teal-700 flex items-center gap-1.5"><Download size={14}/> Template</button>
               ) : <div></div>}
               <button 
                  onClick={handleProcess} 
                  disabled={parsing}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-sm rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
               >
                  {parsing ? <RefreshCw className="animate-spin" size={16}/> : <ArrowRight size={16}/>}
                  {parsing ? 'Processing...' : 'Import Tasks from CSV'}
               </button>
            </div>
        )}


        {/* STEP 2: PREVIEW & INLINE OVERLAYS */}
        {step === 'preview' && (
          <div className="absolute inset-0 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex-1 flex flex-col p-6 overflow-hidden relative">
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <div>
                        <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                           Review Tasks
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Found {previewTasks.length} total tasks. ({validTaskCount} valid)</p>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
                   <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 sticky top-0 z-10">
                         <tr>
                            <th className="px-4 py-3">Task Identifier</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Execution Logic</th>
                            <th className="px-4 py-3">Status / Comment</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {previewTasks.map((t, i) => (
                            <tr key={i} className={`hover:bg-slate-50/50 transition-colors ${t.importStatus === 'error' ? 'bg-rose-50/30' : ''}`}>
                               <td className="px-4 py-3 font-bold text-slate-800">{t.taskName}</td>
                               <td className="px-4 py-3"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">{t.category}</span></td>
                               <td className="px-4 py-3">
                                  <div className="font-mono bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded w-fit font-bold border border-slate-100">{t.cron_schedule}</div>
                               </td>
                               <td className="px-4 py-3">
                                  {t.importStatus === 'success' ? (
                                     <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                                        <CheckCircle2 size={14}/> {t.importComment}
                                     </span>
                                  ) : (
                                     <span className="flex items-center gap-1.5 font-bold text-rose-600">
                                        <AlertCircle size={14}/> {t.importComment}
                                     </span>
                                  )}
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>

                {error && overlay === 'none' && <div className="mt-3 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold">{error}</div>}
             </div>

             <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
                <button onClick={() => setStep('input')} className="text-sm text-slate-500 font-bold hover:text-slate-800 flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50" disabled={overlay !== 'none'}>
                   <ArrowLeft size={16}/> Go Back
                </button>
                <button 
                   onClick={handleSaveToDatabase}
                   disabled={validTaskCount === 0 || overlay !== 'none'}
                   className="text-sm bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-800/20 hover:bg-slate-900 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                   <Save size={16}/> {validTaskCount > 0 ? `Save ${validTaskCount} Tasks` : 'Nothing to Save'}
                </button>
             </div>

             {/* INLINE MODAL OVERLAYS (Covers the table but stays inside Settings) */}
             {overlay !== 'none' && (
                <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                   <div className="bg-white border border-slate-100 shadow-2xl rounded-3xl p-8 max-w-sm w-full text-center">
                      
                      {overlay === 'saving' && (
                         <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                             <div className="relative w-20 h-20 mb-5">
                                 <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                 <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
                                 <div className="absolute inset-0 flex items-center justify-center font-bold text-teal-600 text-sm">{saveProgress}%</div>
                             </div>
                             <h3 className="text-xl font-extrabold text-slate-800">Securing Data...</h3>
                             <p className="text-slate-500 text-sm mt-1">Please wait while tasks are inserted.</p>
                         </div>
                      )}

                      {overlay === 'success' && (
                         <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                             <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-full flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/30">
                                 <CheckCircle2 size={32} strokeWidth={3} />
                             </div>
                             <h3 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">Success!</h3>
                             <p className="text-slate-500 text-sm mb-6 font-medium">
                                 Success, task saved to database.
                             </p>
                             <button onClick={() => { onViewTasks(); }} className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl font-bold shadow-md hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
                                 Click to go to Tasks Taskboard <ArrowRight size={16} />
                             </button>
                         </div>
                      )}

                      {overlay === 'error' && (
                         <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                             <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-5">
                                 <AlertTriangle size={32} strokeWidth={2.5}/>
                             </div>
                             <h3 className="text-xl font-extrabold text-slate-800 mb-2">Import Failed</h3>
                             <p className="text-rose-600 text-xs font-bold mb-6 bg-rose-50 p-3 rounded-lg border border-rose-100 w-full">{error}</p>
                             <div className="flex gap-3 w-full">
                                <button onClick={() => setOverlay('none')} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 text-sm">Dismiss</button>
                                <button onClick={handleSaveToDatabase} className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 shadow-md text-sm">Retry</button>
                             </div>
                         </div>
                      )}

                   </div>
                </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
}

// Compact File Type Card component to save vertical space
const FileTypeCard = ({ active, onClick, icon, label, desc }) => (
  <button onClick={onClick} className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all duration-300 group ${active ? 'border-teal-500 bg-teal-50/30 shadow-sm' : 'border-slate-200 bg-white hover:border-teal-300'}`}>
    <div className={`p-2 rounded-lg shrink-0 transition-transform duration-300 ${active ? 'bg-white border-teal-100 scale-105 shadow-sm' : 'bg-slate-50 border-slate-100 group-hover:scale-105'}`}>{icon}</div>
    <div className="text-left">
      <div className="font-extrabold text-slate-800 text-xs leading-tight">{label}</div>
      <div className="text-[10px] font-medium text-slate-400 mt-0.5 leading-tight">{desc}</div>
    </div>
  </button>
);