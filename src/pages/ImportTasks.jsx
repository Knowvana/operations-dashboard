import React, { useState } from 'react';
import { Upload, FileText, FileJson, FileSpreadsheet } from 'lucide-react';

const ImportTasks = ({ onImport }) => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('csv');
  const [rawData, setRawData] = useState('');
  const [error, setError] = useState('');
  const [parsing, setParsing] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleTypeChange = (e) => {
    setFileType(e.target.value);
    setError('');
  };

  const handleRawDataChange = (e) => {
    setRawData(e.target.value);
    setError('');
  };

  const handleImport = async () => {
    setParsing(true);
    setError('');
    try {
      let tasks = [];
      if (fileType === 'csv') {
        const text = rawData || await file.text();
        tasks = parseCSV(text);
      } else if (fileType === 'json') {
        const text = rawData || await file.text();
        tasks = JSON.parse(text);
      } else if (fileType === 'gsheet') {
        setError('Google Sheets import coming soon!');
        setParsing(false);
        return;
      }
      onImport(tasks);
    } catch (err) {
      setError('Import failed: ' + err.message);
    }
    setParsing(false);
  };

  // Simple CSV parser for demo
  function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((h, i) => obj[h] = values[i]?.trim());
      return obj;
    });
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md mt-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Upload /> Import Tasks
      </h2>
      <div className="mb-4 flex gap-4">
        <label className="flex items-center gap-2">
          <input type="radio" value="csv" checked={fileType==='csv'} onChange={handleTypeChange} />
          <FileSpreadsheet size={18}/> CSV
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" value="json" checked={fileType==='json'} onChange={handleTypeChange} />
          <FileJson size={18}/> JSON
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" value="gsheet" checked={fileType==='gsheet'} onChange={handleTypeChange} />
          <FileText size={18}/> Google Sheets
        </label>
      </div>
      <div className="mb-4">
        <input type="file" accept={fileType==='csv' ? '.csv' : fileType==='json' ? '.json' : ''} onChange={handleFileChange} className="mb-2" />
        <div className="text-xs text-slate-500">Or paste data below:</div>
        <textarea value={rawData} onChange={handleRawDataChange} rows={5} className="w-full border rounded p-2 mt-1 text-sm" placeholder="Paste CSV or JSON here..." />
      </div>
      <button onClick={handleImport} disabled={parsing} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold hover:bg-indigo-700 disabled:opacity-50">
        {parsing ? 'Importing...' : 'Import Tasks'}
      </button>
      {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
      <div className="mt-6 text-xs text-slate-500">
        <b>CSV/JSON columns:</b> Task Name, Schedule, Category, Frequency<br/>
        <b>Example CSV:</b><br/>
        Task Name,Schedule,Category,Frequency<br/>
        DB Backup,Manual,Maintenance,Daily<br/>
        API Health Check,Cron,Monitoring,Every 15 min
      </div>
    </div>
  );
};

export default ImportTasks;
