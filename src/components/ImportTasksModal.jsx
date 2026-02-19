import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, FileJson, FileSpreadsheet, Plus, 
  Download, AlertTriangle, CheckCircle2, 
  RefreshCw, ArrowLeft, Save, Copy, ArrowRight 
} from 'lucide-react';
import CronBuilder, { getCronDescription } from './CronBuilder';

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
  const [step, setStep] = useState('input'); // 'input' | 'preview' | 'saving' | 'success' | 'error'
  const [tab, setTab] = useState('import');
  const [fileType, setFileType] = useState('csv');
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  
  const [previewTasks, setPreviewTasks] = useState([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [manualTasks, setManualTasks] = useState([]);
  const [saveProgress, setSaveProgress] = useState(0);
  
  const [newTask, setNewTask] = useState({
    name: '', category: '', mode: 'schedule', cronExpression: '* * * * *' 
  });

  const handleProcess = async () => {
    setParsing(true); 
    setError('');
    setSkippedCount(0);
    
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

      // --- Deduplication Logic ---
      const existingNames = new Set(existingTasks.map(t => t.title.toLowerCase().trim()));
      const uniqueTasks = [];
      let duplicateCount = 0;

      importedRawTasks.forEach(task => {
         const name = (task.TaskName || task.taskName || task.name || 'Untitled Task').trim();
         const lowerName = name.toLowerCase();
         if (existingNames.has(lowerName)) {
             duplicateCount++;
         } else {
             existingNames.add(lowerName); // Add to set to prevent internal duplicates
             uniqueTasks.push(processTaskData(task, name));
         }
      });

      if (uniqueTasks.length === 0) {
          throw new Error(`All ${duplicateCount} task(s) already exist in your system.`);
      }

      setSkippedCount(duplicateCount);
      setPreviewTasks(uniqueTasks);
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
    setStep('saving');
    try {
      const timer = setInterval(() => {
         setSaveProgress(prev => prev >= 90 ? 90 : prev + 15);
      }, 200);

      await onImport(previewTasks, tab === 'manual' ? 'Manual' : 'Import');
      
      clearInterval(timer);
      setSaveProgress(100);
      setStep('success');
    } catch (err) {
      setError(err.message || 'Failed to save tasks');
      setStep('error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      
      {/* Header specific to Import View */}
      <div className="px-8 py-6 border-b border-slate-100 bg-white z-10 shrink-0">
         <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Data Ingestion</h2>
         <p className="text-slate-500 font-medium mt-1 text-sm">Bulk import schedules safely without duplicating records.</p>
      </div>

      {/* Dynamic Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-slate-50/30">
        
        {/* STEP 1: INPUT */}
        {step === 'input' && (
          <div className="flex-1 flex flex-col p-8 overflow-y-auto">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-200">
              <button onClick={() => setTab('import')} className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${tab === 'import' ? 'border-teal-500 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <Upload size={16} /> Bulk Upload
              </button>
              <button onClick={() => setTab('manual')} className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${tab === 'manual' ? 'border-teal-500 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <Plus size={16} /> Fast Entry
              </button>
            </div>

            {/* Bulk Upload Tab */}
            {tab === 'import' && (
              <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                    <FileTypeCard active={fileType === 'csv'} onClick={() => setFileType('csv')} icon={<FileSpreadsheet className="text-emerald-500" />} label="CSV File" desc="Standard comma format" />
                    <FileTypeCard active={fileType === 'json'} onClick={() => setFileType('json')} icon={<FileJson className="text-amber-500" />} label="JSON Array" desc="Structured data format" />
                    <FileTypeCard active={fileType === 'gsheet'} onClick={() => setFileType('gsheet')} icon={<FileText className="text-blue-500" />} label="Google Sheets" desc="Public published link" />
                </div>

                <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col min-h-0">
                  {fileType === 'gsheet' ? (
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-700">Google Sheet Published URL</label>
                      <input type="text" value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-medium text-slate-700" />
                      
                      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm mt-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-slate-800">Required Column Headers</h4>
                          <button onClick={copyHeadersToClipboard} className="flex items-center gap-1.5 text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors font-bold shadow-sm">
                            <Copy size={12} /> Copy Headers
                          </button>
                        </div>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                              <th className="px-4 py-2 text-left">TaskName</th>
                              <th className="px-4 py-2 text-left">TaskCategory</th>
                              <th className="px-4 py-2 text-left">CronExpression</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            <tr><td className="px-4 py-2 font-medium">Database Backup</td><td className="px-4 py-2 text-slate-500">Maintenance</td><td className="px-4 py-2 font-mono text-teal-600 text-xs">0 2 * * *</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-4">
                       <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-teal-300 transition-all relative shrink-0">
                        <input type="file" accept={fileType === 'csv' ? '.csv' : '.json'} onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                          <Upload className="text-slate-400" size={32} />
                          <span className="text-slate-700 font-bold">{file ? file.name : "Drop file or click to browse"}</span>
                        </div>
                      </div>
                      <div className="text-center text-xs font-bold text-slate-400 uppercase">OR</div>
                      <textarea value={rawData} onChange={(e) => setRawData(e.target.value)} placeholder="Paste your raw text data here..." className="flex-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 outline-none text-sm font-mono resize-none min-h-[120px]" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fast Entry Tab */}
            {tab === 'manual' && (
              <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-500">
                 <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 shrink-0">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Task Identifier</label>
                          <input value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none" placeholder="e.g. Database Backup"/>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</label>
                          <input value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none" placeholder="e.g. Maintenance"/>
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Recurring Schedule</label>
                       <div className="border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
                          <CronBuilder value={newTask.cronExpression} onChange={val => setNewTask({...newTask, cronExpression: val})} />
                       </div>
                    </div>
                    <button onClick={addManualTask} className="w-full py-3.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 active:scale-95 transition-all flex items-center justify-center gap-2"><Plus size={18}/> Queue Task</button>
                 </div>
                 
                 {manualTasks.length > 0 && (
                    <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm overflow-hidden flex flex-col">
                       <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-teal-500"></div> Staging Queue ({manualTasks.length})</h4>
                       <div className="overflow-y-auto pr-2 space-y-2">
                          {manualTasks.map((t, i) => (
                             <div key={i} className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                                <div>
                                   <div className="font-bold text-slate-700">{t.name}</div>
                                   <div className="text-xs text-slate-500 font-medium">{getCronDescription(t.cronExpression)}</div>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">{t.category}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}
              </div>
            )}

            {error && <div className="mt-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold flex items-center gap-2 shrink-0"><AlertTriangle size={16}/> {error}</div>}
          </div>
        )}

        {/* Input Footer Action */}
        {step === 'input' && (
            <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
               {fileType === 'csv' && tab === 'import' ? (
                  <button onClick={downloadSampleCSV} className="text-sm text-teal-600 font-bold hover:text-teal-700 flex items-center gap-1.5"><Download size={16}/> Template</button>
               ) : <div></div>}
               <button 
                  onClick={handleProcess} 
                  disabled={parsing}
                  className="px-8 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
               >
                  {parsing ? <RefreshCw className="animate-spin" size={18}/> : <ArrowRight size={18}/>}
                  {parsing ? 'Processing...' : 'Import Tasks from CSV'}
               </button>
            </div>
        )}


        {/* STEP 2: PREVIEW */}
        {step === 'preview' && (
          <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex-1 flex flex-col p-8 overflow-hidden">
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                       <CheckCircle2 className="text-emerald-500" size={24}/> 
                       Validated {previewTasks.length} Task(s)
                    </h3>
                    {skippedCount > 0 && (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                           {skippedCount} duplicates skipped
                        </span>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 sticky top-0">
                         <tr>
                            <th className="px-6 py-4">Task Identifier</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Execution Logic</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {previewTasks.map((t, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                               <td className="px-6 py-4 font-bold text-slate-800">{t.taskName}</td>
                               <td className="px-6 py-4"><span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">{t.category}</span></td>
                               <td className="px-6 py-4">
                                  <div className="text-xs font-mono bg-teal-50 text-teal-700 px-2 py-1 rounded w-fit font-bold border border-teal-100/50">{t.cron_schedule}</div>
                                  <div className="text-[11px] font-medium text-slate-400 mt-1">{t.previewSchedule}</div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>

             <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
                <button onClick={() => setStep('input')} className="text-slate-500 font-bold hover:text-slate-800 flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                   <ArrowLeft size={18}/> Review Changes
                </button>
                <button 
                   onClick={handleSaveToDatabase} 
                   className="bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold shadow-xl shadow-slate-800/20 hover:bg-slate-900 active:scale-95 transition-all flex items-center gap-2"
                >
                   <Save size={18}/> Commit to Database
                </button>
             </div>
          </div>
        )}

        {/* STEP 3: SAVING */}
        {step === 'saving' && (
          <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 bg-white/50">
             <div className="relative w-28 h-28 mb-6">
                 <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center font-bold text-teal-600 text-xl">{saveProgress}%</div>
             </div>
             <h3 className="text-2xl font-extrabold text-slate-800">Securing Data...</h3>
             <p className="text-slate-500 font-medium mt-2">Integrating logic into the global timeline.</p>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'success' && (
          <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 bg-white">
             <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30">
                 <CheckCircle2 size={48} strokeWidth={2.5} />
             </div>
             <h3 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">Import Successful!</h3>
             <p className="text-slate-500 font-medium max-w-sm text-center leading-relaxed mb-8">
                 Successfully mapped <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{previewTasks.length}</span> records. They are now actively tracked in your ops environment.
             </p>
             <button onClick={onViewTasks} className="bg-slate-800 text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:bg-slate-900 hover:shadow-xl active:scale-95 transition-all flex items-center gap-2">
                 Go to Global Timeline <ArrowRight size={20} />
             </button>
          </div>
        )}

        {/* STEP 5: ERROR */}
        {step === 'error' && (
          <div className="h-full flex flex-col items-center justify-center bg-white p-8">
             <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
                 <AlertTriangle size={40} />
             </div>
             <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Import Interrupted</h3>
             <p className="text-rose-600 font-medium mb-8 bg-rose-50 p-4 rounded-xl border border-rose-100 max-w-md text-center">{error}</p>
             <div className="flex gap-4">
                <button onClick={() => setStep('input')} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Start Over</button>
                <button onClick={handleSaveToDatabase} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold shadow-lg hover:bg-slate-900">Retry Save</button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}

const FileTypeCard = ({ active, onClick, icon, label, desc }) => (
  <button onClick={onClick} className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 group ${active ? 'border-teal-500 bg-teal-50/30 shadow-md shadow-teal-500/10' : 'border-slate-200 bg-white hover:border-teal-300'}`}>
    <div className={`mb-3 p-2.5 rounded-xl w-fit shadow-sm border transition-transform duration-300 ${active ? 'bg-white border-teal-100 scale-110' : 'bg-slate-50 border-slate-100 group-hover:scale-110'}`}>{icon}</div>
    <div className="font-extrabold text-slate-800">{label}</div>
    <div className="text-xs font-medium text-slate-400 mt-1">{desc}</div>
  </button>
);