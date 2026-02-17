import React, { useState } from 'react';
import { BarChart2, List } from 'lucide-react';
import ProgressBar from './ProgressBar';

const ShiftDashboard = ({ dayData, shiftData, shiftDetails }) => {
  const [monitoringScope, setMonitoringScope] = useState('shift');
  const [taskScope, setTaskScope] = useState('shift');

  const activeMonitoringStats = monitoringScope === 'shift' ? shiftData.stats : dayData.stats;
  const activeCategoryStats = taskScope === 'shift' ? shiftData.categoryStats : dayData.categoryStats;

  const totalActivities = activeMonitoringStats.total || 1;

  return (
    <div className="mb-8 font-sans">
      {/* Main Unified Container */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100/80">
          
          {/* Section 2: Monitoring Stats (Approx 60% width) */}
          <div className="lg:col-span-7 p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <BarChart2 size={16} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monitoring Stats</h3>
                </div>
                
                {/* Compact Toggle */}
                <div className="bg-slate-100 p-0.5 rounded-lg flex text-[10px] font-bold">
                    <button onClick={() => setMonitoringScope('shift')} className={`px-2 py-0.5 rounded transition-all ${monitoringScope === 'shift' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>SHIFT</button>
                    <button onClick={() => setMonitoringScope('day')} className={`px-2 py-0.5 rounded transition-all ${monitoringScope === 'day' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>DAY</button>
                </div>
            </div>

            <div className="w-full overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm text-left bg-white/50">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3 w-1/3">Metric</th>
                    <th className="px-6 py-3 w-1/6 text-right">Count</th>
                    <th className="px-6 py-3 w-1/2">Distribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Total */}
                  <tr>
                    <td className="px-6 py-3 text-slate-700 font-medium">Total Activities</td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-slate-800">{activeMonitoringStats.total}</td>
                    <td className="px-6 py-3">
                        <ProgressBar value={activeMonitoringStats.total} total={activeMonitoringStats.total} colorClass="bg-slate-300" />
                    </td>
                  </tr>
                  {/* Updated On Time */}
                  <tr>
                    <td className="px-6 py-3 text-slate-700 font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>Updated On Time
                    </td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-emerald-600">{activeMonitoringStats.updatedOnTime}</td>
                    <td className="px-6 py-3">
                        <ProgressBar value={activeMonitoringStats.updatedOnTime} total={totalActivities} colorClass="bg-emerald-500" />
                    </td>
                  </tr>
                  {/* Late */}
                  <tr>
                    <td className="px-6 py-3 text-slate-700 font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>Not Updated / Late
                    </td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-rose-600">{activeMonitoringStats.notUpdatedOnTime}</td>
                    <td className="px-6 py-3">
                        <ProgressBar value={activeMonitoringStats.notUpdatedOnTime} total={totalActivities} colorClass="bg-rose-500" />
                    </td>
                  </tr>
                  {/* Pending Future */}
                  <tr>
                    <td className="px-6 py-3 text-slate-500 font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>Pending / Future
                    </td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-slate-400">{activeMonitoringStats.pendingFuture}</td>
                    <td className="px-6 py-3">
                        <ProgressBar value={activeMonitoringStats.pendingFuture} total={totalActivities} colorClass="bg-slate-300" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Task Stats (Approx 40% width) */}
          <div className="lg:col-span-5 p-6 h-full bg-slate-50/30">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                      <List size={16} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Task Stats</h3>
                </div>

                {/* Compact Toggle */}
                <div className="bg-slate-100 p-0.5 rounded-lg flex text-[10px] font-bold">
                    <button onClick={() => setTaskScope('shift')} className={`px-2 py-0.5 rounded transition-all ${taskScope === 'shift' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400'}`}>SHIFT</button>
                    <button onClick={() => setTaskScope('day')} className={`px-2 py-0.5 rounded transition-all ${taskScope === 'day' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400'}`}>DAY</button>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-3 py-2.5">Category</th>
                    <th className="px-2 py-2.5 text-center">Total</th>
                    <th className="px-2 py-2.5 text-center text-emerald-600">OK</th>
                    <th className="px-2 py-2.5 text-center text-rose-500">Late</th>
                    <th className="px-3 py-2.5 text-center w-24">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {Object.entries(activeCategoryStats).map(([category, data]) => {
                    const delayedOrPending = data.total - data.success - data.aborted;
                    const pctSuccess = (data.success / data.total) * 100;
                    const pctLate = (delayedOrPending / data.total) * 100;
                    const pctAborted = (data.aborted / data.total) * 100;

                    return (
                        <tr key={category} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-3 py-2.5 font-medium text-slate-700 capitalize flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                category === 'critical' ? 'bg-rose-400' : 
                                category === 'routine' ? 'bg-indigo-400' : 'bg-slate-400'
                                }`}></span>
                                {category}
                            </td>
                            <td className="px-2 py-2.5 text-center font-bold text-slate-700">{data.total}</td>
                            <td className="px-2 py-2.5 text-center font-bold text-emerald-600 bg-emerald-50/30">{data.success}</td>
                            <td className="px-2 py-2.5 text-center font-bold text-rose-500 bg-rose-50/30">{delayedOrPending}</td>
                            <td className="px-3 py-2.5">
                                <div className="flex w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
                                    <div style={{ width: `${pctSuccess}%` }} className="bg-emerald-500 h-full" title="Success"/>
                                    <div style={{ width: `${pctLate}%` }} className="bg-rose-500 h-full" title="Late/Pending"/>
                                    <div style={{ width: `${pctAborted}%` }} className="bg-slate-400 h-full" title="Aborted"/>
                                </div>
                            </td>
                        </tr>
                    )
                  })}
                  {Object.keys(activeCategoryStats).length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-400 italic">
                        No tasks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftDashboard;
