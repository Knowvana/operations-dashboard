import React, { useState } from 'react';
import { Search, Clock, Tag, User, Calendar, Hash, Repeat, Filter, CheckCircle2, AlertCircle } from 'lucide-react';

const TasksListView = ({ tasks, onSelectTask }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredTasks = tasks.filter(t => {
    return t.title.toLowerCase().includes(search.toLowerCase()) || 
           (t.type || '').toLowerCase().includes(search.toLowerCase());
  });

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Pending Sync';
      return d.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
    } catch (e) {
      return '—';
    }
  };

  const generateCron = (task) => {
    if (task.cronExpression) return task.cronExpression;
    const time = task.plannedStart || '00:00';
    const [h, m] = time.split(':');
    if (task.frequency?.toLowerCase() === 'daily') return `${m} ${h} * * *`;
    if (task.frequency?.toLowerCase() === 'weekly') return `${m} ${h} * * 1`; 
    return `${m} ${h} * * *`; 
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-800">All Tasks</h2>
           <p className="text-sm text-slate-500">Manage and review schedule entries</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none"
              />
           </div>
           <select 
             value={filterType}
             onChange={e => setFilterType(e.target.value)}
             className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 focus:border-indigo-500 outline-none"
           >
             <option value="all">All Status</option>
             <option value="pending">Pending</option>
             <option value="completed">Completed</option>
             <option value="aborted">Aborted</option>
           </select>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4 w-[20%]">Task Name</th>
                <th className="px-6 py-4 w-[35%]">Schedule Details</th>
                <th className="px-6 py-4 w-[15%]">Category</th>
                <th className="px-6 py-4 w-[15%]">Date Added</th>
                <th className="px-6 py-4 w-[15%]">Added by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) => (
                <tr 
                  key={task.id} 
                  onClick={() => onSelectTask(task)}
                  className="hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 align-top">
                    <div className="font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">{task.title}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{task.id}</div>
                  </td>
                  
                  {/* Detailed Schedule Column */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-2 text-xs">
                        
                        {/* Time - Removed End Time */}
                        <div className="flex items-center gap-2">
                             <span className="font-bold text-slate-400 w-28 text-[10px] uppercase tracking-wider whitespace-nowrap">Time:</span>
                             <span className="font-mono text-slate-700 font-bold bg-slate-50 px-1 rounded">
                                {task.plannedStart}
                             </span>
                        </div>

                        {/* Date (Optional) */}
                        {task.manualDate && (
                             <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-400 w-28 text-[10px] uppercase tracking-wider whitespace-nowrap">Date:</span>
                                <span className="text-slate-600">{formatDate(task.manualDate)}</span>
                             </div>
                        )}

                        {/* Frequency */}
                        <div className="flex items-start gap-2">
                             <span className="font-bold text-slate-400 w-28 text-[10px] uppercase tracking-wider mt-0.5 whitespace-nowrap">Frequency:</span>
                             <span className="text-slate-600 break-words flex-1 leading-relaxed">
                                {task.frequency === 'Weekdays' ? 'Sun, Mon, Tue, Wed, Thu' : (task.frequency || 'One-time')}
                             </span>
                        </div>

                        {/* Cron Expression */}
                        <div className="flex items-center gap-2">
                             <span className="font-bold text-slate-400 w-28 text-[10px] uppercase tracking-wider whitespace-nowrap">Cron Expression:</span>
                             <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                {generateCron(task)}
                             </span>
                        </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 align-top">
                    <span className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full w-fit border border-slate-200 text-xs font-medium">
                       <Tag size={12}/> {task.type || 'General'}
                    </span>
                  </td>

                  <td className="px-6 py-4 align-top">
                      <div className="text-slate-500 text-xs font-medium">
                          {formatDate(task.createdAt)}
                      </div>
                  </td>

                  <td className="px-6 py-4 align-top">
                     <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-700">{task.addedBy || 'System Import'}</span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                           <User size={10}/> 
                           {task.user || 'Static User'}
                        </div>
                     </div>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                   <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                      No tasks found.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TasksListView;