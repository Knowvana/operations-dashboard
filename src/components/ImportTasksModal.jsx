import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, FileJson, FileSpreadsheet, X, Plus, 
  Calendar, Clock, Download, AlertTriangle, CheckCircle2, 
  ArrowRight, RefreshCw, Hash 
} from 'lucide-react';
import CronBuilder, { getCronDescription } from './CronBuilder';

const SAMPLE_CSV = `Task Name,Schedule,Category,Frequency\nDB Backup,Manual,Maintenance,Daily\nAPI Health Check,Cron,Monitoring,Every 15 min`;

// --- Utility: Download Sample ---
const downloadSampleCSV = () => {
  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_tasks.csv';
  a.click();
  URL.revokeObjectURL(url);
};

export default function ImportTasksModal({ open, onClose, onImport }) {
  const [tab, setTab] = useState('import');
  const [fileType, setFileType] = useState('csv');
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  const [manualTasks, setManualTasks] = useState([]);
  
  const [newTask, setNewTask] = useState({
    name: '',
    category: '',
    mode: 'manual',
    manualDate: '',
    manualTime: '',
    cronExpression: '* * * * *' 
  });

  if (!open) return null;

  const handleImport = async () => {
    setParsing(true); 
    setError('');
    try {
      let tasks = [];
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
      onImport([...tasks, ...manualTasks]);
      onClose();
    } catch (err) {
      setError(err.message);
    }
    setParsing(false);
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

  return (
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

        {/* Tabs */}
        <div className="px-8 pt-6 pb-0 bg-slate-50/50">
          <div className="flex gap-6 border-b border-slate-200">
            <TabButton active={tab === 'import'} onClick={() => setTab('import')} icon={<Upload size={18} />} label="Bulk Import" />
            <TabButton active={tab === 'manual'} onClick={() => setTab('manual')} icon={<Plus size={18} />} label="Create Manually" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          
          {/* IMPORT TAB */}
          {tab === 'import' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* File Type Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FileTypeCard 
                  active={fileType === 'csv'} 
                  onClick={() => setFileType('csv')} 
                  icon={<FileSpreadsheet className="text-emerald-500" />} 
                  label="CSV File" 
                  desc="Standard comma separated" 
                />
                <FileTypeCard 
                  active={fileType === 'json'} 
                  onClick={() => setFileType('json')} 
                  icon={<FileJson className="text-amber-500" />} 
                  label="JSON File" 
                  desc="Structured data format" 
                />
                <FileTypeCard 
                  active={fileType === 'gsheet'} 
                  onClick={() => setFileType('gsheet')} 
                  icon={<FileText className="text-blue-500" />} 
                  label="Google Sheets" 
                  desc="Import via public link" 
                />
              </div>

              {/* Input Area */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                {fileType === 'gsheet' ? (
                   <div className="space-y-3">
                     <label className="text-sm font-semibold text-slate-700">Google Sheet URL</label>
                     <input 
                       type="text" 
                       value={sheetUrl} 
                       onChange={(e) => setSheetUrl(e.target.value)}
                       placeholder="https://docs.google.com/spreadsheets/d/..."
                       className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                     />
                     <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-md">
                        <AlertTriangle size={14} className="mt-0.5" />
                        <span>Ensure the sheet is set to "Anyone with the link" or published to the web.</span>
                     </div>
                   </div>
                ) : (
                  <div className="space-y-4">
                     <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
                        <input 
                          type="file" 
                          accept={fileType === 'csv' ? '.csv' : '.json'}
                          onChange={(e) => setFile(e.target.files[0])}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                          <Upload className="text-slate-300" size={32} />
                          <span className="text-slate-600 font-medium">Click to upload or drag file here</span>
                          <span className="text-xs text-slate-400">{file ? file.name : `Accepts .${fileType}`}</span>
                        </div>
                     </div>
                     <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Or paste text</span></div>
                     </div>
                     <textarea 
                       value={rawData}
                       onChange={(e) => setRawData(e.target.value)}
                       rows={3}
                       placeholder={`Paste your ${fileType.toUpperCase()} data here...`}
                       className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm font-mono bg-slate-50"
                     />
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex justify-between items-center pt-2">
                <button onClick={downloadSampleCSV} className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                  <Download size={16} /> Download Sample
                </button>
                <button 
                  onClick={handleImport} 
                  disabled={parsing}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {parsing ? <RefreshCw className="animate-spin" size={18}/> : <CheckCircle2 size={18}/>}
                  {parsing ? 'Processing...' : 'Import Data'}
                </button>
              </div>
              {error && <div className="text-red-500 bg-red-50 px-4 py-3 rounded-lg text-sm font-medium animate-in slide-in-from-top-2">{error}</div>}
            </div>
          )}

          {/* MANUAL TAB */}
          {tab === 'manual' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                  
                  {/* Task Name & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Task Name</label>
                      <input 
                        value={newTask.name}
                        onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                        placeholder="e.g., Database Backup"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Category</label>
                      <input 
                        value={newTask.category}
                        onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                        placeholder="e.g., Maintenance"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="p-1 bg-slate-100 rounded-lg inline-flex">
                    <button 
                      onClick={() => setNewTask({...newTask, mode: 'manual'})}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${newTask.mode === 'manual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      One-time
                    </button>
                    <button 
                      onClick={() => setNewTask({...newTask, mode: 'schedule'})}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${newTask.mode === 'schedule' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Recurring (Cron)
                    </button>
                  </div>

                  {/* One-Time Inputs */}
                  {newTask.mode === 'manual' && (
                     <div className="grid grid-cols-2 gap-5 animate-in fade-in">
                       <div className="space-y-1.5">
                         <label className="text-sm font-semibold text-slate-700">Date</label>
                         <div className="relative">
                           <input type="date" value={newTask.manualDate} onChange={e => setNewTask({...newTask, manualDate: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500" />
                           <Calendar className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16}/>
                         </div>
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-sm font-semibold text-slate-700">Time</label>
                         <div className="relative">
                           <input type="time" value={newTask.manualTime} onChange={e => setNewTask({...newTask, manualTime: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500" />
                           <Clock className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16}/>
                         </div>
                       </div>
                     </div>
                  )}

                  {/* Cron Builder - Visible in Schedule Mode */}
                  {newTask.mode === 'schedule' && (
                    <CronBuilder 
                      value={newTask.cronExpression} 
                      onChange={(val) => setNewTask({...newTask, cronExpression: val})} 
                    />
                  )}
                </div>

                {/* Add Button */}
                <button 
                  onClick={addManualTask}
                  className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Add to Queue
                </button>

                {/* Queue List */}
                {manualTasks.length > 0 && (
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tasks Ready to Import</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                       {manualTasks.map((t, i) => (
                         <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center text-sm">
                            <div>
                              <div className="font-semibold text-slate-800">{t.name}</div>
                              <div className="text-xs text-slate-500">
                                {t.mode === 'manual' ? `${t.manualDate} at ${t.manualTime}` : getCronDescription(t.cronExpression)}
                              </div>
                            </div>
                            <div className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 font-medium">{t.category}</div>
                         </div>
                       ))}
                    </div>
                    <button onClick={() => { onImport(manualTasks); onClose(); }} className="mt-4 text-sm text-indigo-600 font-semibold w-full text-center hover:underline">
                      Finalize Import ({manualTasks.length})
                    </button>
                  </div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Helpers ---
const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`pb-4 px-2 text-sm font-semibold flex items-center gap-2 transition-all relative ${active ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
  >
    {icon} {label}
    {active && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
  </button>
);

const FileTypeCard = ({ active, onClick, icon, label, desc }) => (
  <button 
    onClick={onClick} 
    className={`p-4 rounded-xl border-2 text-left transition-all group ${active ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'}`}
  >
    <div className="mb-3 p-2 bg-white rounded-lg w-fit shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">{icon}</div>
    <div className="font-semibold text-slate-800 text-sm">{label}</div>
    <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
  </button>
);
