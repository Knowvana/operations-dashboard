import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, FileJson, FileSpreadsheet, X, Plus, 
  Calendar, Clock, Download, AlertTriangle, CheckCircle2, 
  RefreshCw, Hash, ArrowRight, Loader2, Table, HelpCircle, Copy
} from 'lucide-react';

const SAMPLE_CSV = `Task Name,Schedule,Category,Frequency\nDB Backup,09:00,Maintenance,Daily\nAPI Health Check,10:30,Monitoring,Every 15 min`;

const downloadSampleCSV = () => {
  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_tasks.csv';
  a.click();
  URL.revokeObjectURL(url);
};

export default function ImportTasksModal({ open, onClose, onImport, onViewTasks }) {
  const [tab, setTab] = useState('import');
  const [stage, setStage] = useState('input'); // input | importing | summary
  const [importStats, setImportStats] = useState({ count: 0, type: '' });
  
  const [fileType, setFileType] = useState('csv'); 
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [error, setError] = useState('');
  const [manualTasks, setManualTasks] = useState([]);
  const [copiedHeaders, setCopiedHeaders] = useState(false);
  
  const [newTask, setNewTask] = useState({
    name: '', category: '', mode: 'manual', manualDate: '', manualTime: '', cronExpression: '* * * * *' 
  });

  // Reset state when opening
  useEffect(() => {
    if (open && stage === 'summary') {
      setStage('input');
      setFile(null);
      setRawData('');
      setManualTasks([]);
      setError('');
    }
  }, [open]);

  const copyHeaders = () => {
    navigator.clipboard.writeText("Task Name\tSchedule\tCategory\tFrequency");
    setCopiedHeaders(true);
    setTimeout(() => setCopiedHeaders(false), 2000);
  };

  if (!open) return null;

  const handleImport = async () => {
    setStage('importing');
    setError('');
    
    // Artificial delay for UX
    await new Promise(r => setTimeout(r, 800));

    try {
      let tasks = [];
      let sourceLabel = '';

      if (fileType === 'csv') {
        const text = rawData || (file ? await file.text() : '');
        if(!text) throw new Error("No data provided");
        tasks = parseCSV(text);
        sourceLabel = 'Import CSV';
      } else if (fileType === 'json') {
        const text = rawData || (file ? await file.text() : '');
        if(!text) throw new Error("No data provided");
        tasks = JSON.parse(text);
        sourceLabel = 'Import JSON';
      } else if (fileType === 'gsheet') {
        if (!sheetUrl) throw new Error('Google Sheet URL required');
        tasks = await fetchGoogleSheet(sheetUrl);
        sourceLabel = 'Google Sheet';
      } else {
         // Manual
         sourceLabel = 'Manual Entry';
      }

      const allTasks = [...tasks, ...manualTasks];
      if (allTasks.length === 0) throw new Error("No tasks found. Please check your column headers match the expected format.");

      // Pass data AND source label to parent
      onImport(allTasks, sourceLabel);
      
      // Update local state for summary view
      setImportStats({ count: allTasks.length, type: fileType === 'gsheet' ? 'Google Sheet' : 'File' });
      setStage('summary');

    } catch (err) {
      console.error(err);
      setError(err.message);
      setStage('input'); // Go back to input on error
    }
  };

  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"(.*)"$/, '$1'));
    return lines.slice(1).map(line => {
      const values = [];
      let inQuote = false, buffer = '';
      for(let i=0; i<line.length; i++) {
          const char = line[i];
          if(char === '"') inQuote = !inQuote;
          else if(char === ',' && !inQuote) { values.push(buffer.trim()); buffer = ''; }
          else buffer += char;
      }
      values.push(buffer.trim());
      const obj = {};
      headers.forEach((h, i) => obj[h] = values[i]?.replace(/^"(.*)"$/, '$1'));
      return obj;
    });
  };

  const fetchGoogleSheet = async (url) => {
    let csvUrl = url;
    if (url.includes('docs.google.com/spreadsheets')) {
        const match = url.match(/\/d\/(.*?)(\/|$)/);
        if (match) csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
    }
    try {
        const resp = await fetch(csvUrl);
        if (!resp.ok) {
            if(resp.status === 401 || resp.status === 403) throw new Error('Access denied. Please "Publish to Web" (File > Share > Publish to web).');
            throw new Error(`Failed to fetch (${resp.status}). Check URL.`);
        }
        return parseCSV(await resp.text());
    } catch (e) { throw new Error(e.message); }
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

        {/* --- STAGE: INPUT --- */}
        {stage === 'input' && (
          <>
            <div className="px-8 pt-6 pb-0 bg-slate-50/50">
              <div className="flex gap-6 border-b border-slate-200">
                <TabButton active={tab === 'import'} onClick={() => setTab('import')} icon={<Upload size={18} />} label="Bulk Import" />
                <TabButton active={tab === 'manual'} onClick={() => setTab('manual')} icon={<Plus size={18} />} label="Create Manually" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              {tab === 'import' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FileTypeCard active={fileType === 'csv'} onClick={() => setFileType('csv')} icon={<FileSpreadsheet className="text-emerald-500" />} label="CSV File" desc="Standard comma separated" />
                    <FileTypeCard active={fileType === 'json'} onClick={() => setFileType('json')} icon={<FileJson className="text-amber-500" />} label="JSON File" desc="Structured data format" />
                    <FileTypeCard active={fileType === 'gsheet'} onClick={() => setFileType('gsheet')} icon={<FileText className="text-blue-500" />} label="Google Sheets" desc="Import via public link" />
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                    {fileType === 'gsheet' ? (
                       <div className="space-y-4">
                         {/* Input Section */}
                         <div className="space-y-3">
                           <label className="text-sm font-semibold text-slate-700">Google Sheet URL</label>
                           <input type="text" value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                         </div>
                         
                         {/* Visual Guide for Sheets */}
                         <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <Table size={14} className="text-indigo-500"/> Expected Columns
                                </h4>
                                <button 
                                  onClick={copyHeaders}
                                  className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                                >
                                  {copiedHeaders ? <CheckCircle2 size={12}/> : <Copy size={12}/>}
                                  {copiedHeaders ? 'COPIED' : 'COPY HEADERS'}
                                </button>
                            </div>
                            
                            <div className="overflow-hidden rounded-lg border border-slate-200">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="px-3 py-2 w-1/3">Task Name</th>
                                            <th className="px-3 py-2 w-1/4">Schedule</th>
                                            <th className="px-3 py-2 w-1/4">Category</th>
                                            <th className="px-3 py-2">Frequency</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white text-slate-600 divide-y divide-slate-100">
                                        <tr>
                                            <td className="px-3 py-2">Database Backup</td>
                                            <td className="px-3 py-2 font-mono text-[10px] bg-slate-50 w-fit rounded">09:00</td>
                                            <td className="px-3 py-2">Maintenance</td>
                                            <td className="px-3 py-2">Daily</td>
                                        </tr>
                                        <tr>
                                            <td className="px-3 py-2">API Health Check</td>
                                            <td className="px-3 py-2 font-mono text-[10px] bg-slate-50 w-fit rounded">14:30</td>
                                            <td className="px-3 py-2">Monitoring</td>
                                            <td className="px-3 py-2">Weekly</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex items-start gap-2 text-[11px] text-slate-500 mt-3 bg-slate-100 p-2 rounded">
                                <HelpCircle size={14} className="text-indigo-400 mt-0.5 shrink-0"/>
                                <p>You must <strong>Publish to Web</strong> first: File &gt; Share &gt; Publish to web &gt; Entire Document &gt; CSV.</p>
                            </div>
                         </div>
                       </div>
                    ) : (
                      <div className="space-y-4">
                         <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
                            <input type="file" accept={fileType === 'csv' ? '.csv' : '.json'} onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <div className="flex flex-col items-center gap-2 pointer-events-none"><Upload className="text-slate-300" size={32} /><span className="text-slate-600 font-medium">Click to upload or drag file here</span></div>
                         </div>
                         <textarea value={rawData} onChange={(e) => setRawData(e.target.value)} rows={3} placeholder={`Or paste ${fileType.toUpperCase()} content directly...`} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm font-mono bg-slate-50" />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button onClick={downloadSampleCSV} className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1.5"><Download size={16} /> Download Sample CSV</button>
                    <button onClick={handleImport} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">Import Data</button>
                  </div>
                  {error && <div className="text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2"><AlertTriangle size={16}/>{error}</div>}
                </div>
              )}

              {tab === 'manual' && (
                 <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input value={newTask.name} onChange={(e) => setNewTask({...newTask, name: e.target.value})} placeholder="Task Name" className="w-full px-4 py-2.5 rounded-lg border border-slate-200" />
                        <input value={newTask.category} onChange={(e) => setNewTask({...newTask, category: e.target.value})} placeholder="Category" className="w-full px-4 py-2.5 rounded-lg border border-slate-200" />
                      </div>
                      <button onClick={addManualTask} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">Add to Queue</button>
                    </div>
                    {manualTasks.length > 0 && (
                      <div className="bg-slate-100 rounded-xl p-4">
                        <div className="space-y-2">{manualTasks.map((t, i) => <div key={i} className="bg-white p-2 rounded border border-slate-200 text-sm">{t.name}</div>)}</div>
                        <button onClick={() => { onImport(manualTasks, 'Manual Entry'); onClose(); }} className="mt-4 w-full bg-indigo-600 text-white py-2 rounded font-bold">Import {manualTasks.length} Tasks</button>
                      </div>
                    )}
                 </div>
              )}
            </div>
          </>
        )}

        {/* --- STAGE: IMPORTING --- */}
        {stage === 'importing' && (
           <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-6">
              <div className="relative">
                 <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="text-indigo-600 animate-pulse" size={24}/></div>
              </div>
              <div className="text-center space-y-1">
                 <h3 className="text-xl font-bold text-slate-800">Importing Data...</h3>
                 <p className="text-slate-500">Parsing file and generating schedule</p>
              </div>
           </div>
        )}

        {/* --- STAGE: SUMMARY --- */}
        {stage === 'summary' && (
           <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-8 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-100">
                 <CheckCircle2 size={40} strokeWidth={3} />
              </div>
              <div className="text-center space-y-2">
                 <h3 className="text-2xl font-bold text-slate-800">Import Complete!</h3>
                 <p className="text-slate-500 max-w-xs mx-auto">
                    Successfully imported <strong className="text-slate-800">{importStats.count} tasks</strong> from {importStats.type}.
                 </p>
              </div>
              <div className="flex gap-4 w-full max-w-sm">
                 <button onClick={onClose} className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">
                    Close
                 </button>
                 <button 
                   onClick={() => {
                     onViewTasks(); 
                     onClose();
                   }}
                   className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                 >
                    View Tasks <ArrowRight size={18}/>
                 </button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}

const TabButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`pb-4 px-2 text-sm font-semibold flex items-center gap-2 transition-all relative ${active ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
    {icon} {label} {active && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
  </button>
);

const FileTypeCard = ({ active, onClick, icon, label, desc }) => (
  <button onClick={onClick} className={`p-4 rounded-xl border-2 text-left transition-all group ${active ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'}`}>
    <div className="mb-3 p-2 bg-white rounded-lg w-fit shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">{icon}</div>
    <div className="font-semibold text-slate-800 text-sm">{label}</div>
    <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
  </button>
);