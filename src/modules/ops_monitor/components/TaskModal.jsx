import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { formatTime } from '@shared';

const TaskModal = ({ task, onClose, onUpdate, shiftLead }) => {
  const [status, setStatus] = useState(task.status);
  const [actualStart, setActualStart] = useState(task.actualStart || task.plannedStart);
  const [actualEnd, setActualEnd] = useState(task.actualEnd || '');
  const [comments, setComments] = useState(task.comments || '');

  const handleSave = () => {
    onUpdate(task.id, {
      status,
      actualStart,
      actualEnd: status === 'completed' || status === 'aborted' ? (actualEnd || formatTime(new Date())) : '',
      comments,
      updatedAt: new Date().toISOString(),
      updatedBy: shiftLead
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-white p-6 transform transition-all scale-100">
        <h3 className="text-xl font-semibold text-slate-800 mb-1">{task.title}</h3>
        <p className="text-sm text-slate-500 mb-6 font-mono">Planned: {task.plannedStart} - {task.plannedEnd}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {['pending', 'in_progress', 'completed', 'aborted'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize
                    ${status === s 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Actual Start</label>
              <input 
                type="time" 
                value={actualStart}
                onChange={(e) => setActualStart(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            {(status === 'completed' || status === 'aborted') && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Actual End</label>
                <input 
                  type="time" 
                  value={actualEnd}
                  onChange={(e) => setActualEnd(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Comments <span className="text-slate-300 font-normal">(Required for deviations)</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Log reason for delay, completion notes, or errors..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-md transition-all flex items-center gap-2">
            <Save size={16} /> Update Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
