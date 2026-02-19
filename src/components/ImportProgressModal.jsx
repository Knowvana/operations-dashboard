import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, RefreshCw, ArrowRight, AlertTriangle } from 'lucide-react';

export default function ImportProgressModal({ 
  isOpen, 
  tasks = [], 
  saveAction, 
  onSuccess, 
  onClose 
}) {
  const [status, setStatus] = useState('idle'); // idle, saving, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setStatus('saving');
      setProgress(0);
      setErrorMessage('');
      
      // Start save process
      performSave();
    }
  }, [isOpen]);

  const performSave = async () => {
    try {
      // Simulate progress steps for UX
      const timer = setInterval(() => {
         setProgress(prev => {
            if(prev >= 90) {
                clearInterval(timer);
                return 90;
            }
            return prev + 10;
         });
      }, 200);

      // Perform actual save
      if(saveAction) {
          await saveAction(tasks, 'Import'); // 'Import' is sourceLabel
      }
      
      clearInterval(timer);
      setProgress(100);
      setStatus('success');
      
    } catch (err) {
      console.error("Import Error:", err);
      setStatus('error');
      setErrorMessage(err.message || "Failed to save data.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-8 text-center relative">
        
        {/* Status: Saving */}
        {status === 'saving' && (
          <div className="py-4">
             <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-indigo-600 font-bold text-sm">{progress}%</div>
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">Saving to Database...</h3>
             <p className="text-slate-500 text-sm">Please wait while we secure your records.</p>
          </div>
        )}

        {/* Status: Success */}
        {status === 'success' && (
          <div className="py-2 animate-in zoom-in-95 duration-300">
             <div className="w-20 h-20 mx-auto mb-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                <CheckCircle2 size={40} />
             </div>
             <h3 className="text-2xl font-bold text-slate-800 mb-2">Save Successful!</h3>
             <p className="text-slate-500 text-sm mb-8">
                <span className="font-bold text-slate-800">{tasks.length}</span> tasks have been added to your schedule.
             </p>
             <button 
                onClick={onSuccess}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
             >
                Go to Tasks <ArrowRight size={20}/>
             </button>
          </div>
        )}

        {/* Status: Error */}
        {status === 'error' && (
          <div className="py-2">
             <div className="w-20 h-20 mx-auto mb-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                <AlertTriangle size={36} />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">Save Failed</h3>
             <p className="text-rose-600 text-sm font-medium mb-6 bg-rose-50 p-3 rounded-lg border border-rose-100">
                {errorMessage}
             </p>
             <div className="flex gap-3">
                <button 
                   onClick={onClose}
                   className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200"
                >
                   Cancel
                </button>
                <button 
                   onClick={() => { setStatus('saving'); performSave(); }}
                   className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900"
                >
                   Try Again
                </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}