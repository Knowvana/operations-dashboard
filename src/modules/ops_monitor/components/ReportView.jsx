import React from 'react';

const ReportView = ({ tasks }) => {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Task</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Variance</th>
              <th className="px-6 py-4">Comments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const isDelayed = task.actualStart && task.actualStart > task.plannedStart;
              return (
                <tr key={task.id} className="hover:bg-white/80 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-600">{task.plannedStart}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{task.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      task.status === 'pending' ? 'bg-slate-100 text-slate-500' :
                      'bg-indigo-100 text-indigo-700'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {task.actualStart ? (
                      <span className={isDelayed ? 'text-rose-600' : 'text-emerald-600'}>
                        {task.actualStart} {isDelayed ? '(Late)' : ''}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-500 italic max-w-xs truncate">
                    {task.comments || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportView;
