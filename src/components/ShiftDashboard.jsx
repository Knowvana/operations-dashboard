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
      {/* Main Unified Container with Enhanced Spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Section 1: Monitoring Stats Card */}
        <div className="lg:col-span-7">
          <div className="h-full bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-white/90 backdrop-blur-xl rounded-3xl shadow-lg shadow-indigo-100/50 border border-indigo-100/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-200/60">
            <div className="p-6 h-full">
              <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-200/50 flex items-center justify-center text-white">
                        <BarChart2 size={16} />
                      </div>
                      <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Monitoring Stats</h3>
                  </div>
                  
                  {/* Enhanced Toggle */}
                  <div className="bg-gradient-to-r from-slate-100 to-slate-50 p-0.5 rounded-xl flex text-[10px] font-bold shadow-inner">
                      <button onClick={() => setMonitoringScope('shift')} className={`px-3 py-1 rounded-lg transition-all duration-200 ${monitoringScope === 'shift' ? 'bg-gradient-to-r from-white to-indigo-50 text-indigo-600 shadow-md shadow-indigo-100/50' : 'text-slate-400 hover:text-slate-600'}`}>SHIFT</button>
                      <button onClick={() => setMonitoringScope('day')} className={`px-3 py-1 rounded-lg transition-all duration-200 ${monitoringScope === 'day' ? 'bg-gradient-to-r from-white to-indigo-50 text-indigo-600 shadow-md shadow-indigo-100/50' : 'text-slate-400 hover:text-slate-600'}`}>DAY</button>
                  </div>
              </div>

              <div className="w-full overflow-hidden rounded-2xl border border-indigo-100/50 bg-white/60 backdrop-blur-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gradient-to-r from-indigo-50/80 to-blue-50/80 text-indigo-600 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4 w-1/3">Metric</th>
                      <th className="px-6 py-4 w-1/6 text-right">Count</th>
                      <th className="px-6 py-4 w-1/2">Distribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-50/30">
                    {/* Total */}
                    <tr className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all duration-200">
                      <td className="px-6 py-4 text-slate-700 font-medium">Total Activities</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">{activeMonitoringStats.total}</td>
                      <td className="px-6 py-4">
                          <ProgressBar value={activeMonitoringStats.total} total={activeMonitoringStats.total} colorClass="bg-gradient-to-r from-slate-400 to-slate-500" />
                      </td>
                    </tr>
                    {/* Updated On Time */}
                    <tr className="hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-green-50/30 transition-all duration-200">
                      <td className="px-6 py-4 text-slate-700 font-medium flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-sm shadow-emerald-200/50"></div>Updated On Time
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">{activeMonitoringStats.updatedOnTime}</td>
                      <td className="px-6 py-4">
                          <ProgressBar value={activeMonitoringStats.updatedOnTime} total={totalActivities} colorClass="bg-gradient-to-r from-emerald-400 to-emerald-600" />
                      </td>
                    </tr>
                    {/* Late */}
                    <tr className="hover:bg-gradient-to-r hover:from-rose-50/30 hover:to-red-50/30 transition-all duration-200">
                      <td className="px-6 py-4 text-slate-700 font-medium flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-rose-400 to-rose-600 shadow-sm shadow-rose-200/50"></div>Not Updated / Late
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-rose-600">{activeMonitoringStats.notUpdatedOnTime}</td>
                      <td className="px-6 py-4">
                          <ProgressBar value={activeMonitoringStats.notUpdatedOnTime} total={totalActivities} colorClass="bg-gradient-to-r from-rose-400 to-rose-600" />
                      </td>
                    </tr>
                    {/* Pending Future */}
                    <tr className="hover:bg-gradient-to-r hover:from-slate-50/30 hover:to-gray-50/30 transition-all duration-200">
                      <td className="px-6 py-4 text-slate-500 font-medium flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-slate-300 to-slate-400 shadow-sm shadow-slate-200/50"></div>Pending / Future
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-400">{activeMonitoringStats.pendingFuture}</td>
                      <td className="px-6 py-4">
                          <ProgressBar value={activeMonitoringStats.pendingFuture} total={totalActivities} colorClass="bg-gradient-to-r from-slate-300 to-slate-400" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Task Stats Card */}
        <div className="lg:col-span-5">
          <div className="h-full bg-gradient-to-br from-teal-50/80 via-emerald-50/60 to-white/90 backdrop-blur-xl rounded-3xl shadow-lg shadow-teal-100/50 border border-teal-100/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-teal-200/60">
            <div className="p-6 h-full">
              <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-200/50 flex items-center justify-center text-white">
                        <List size={16} />
                      </div>
                      <h3 className="text-xs font-bold text-teal-600 uppercase tracking-widest">Task Stats</h3>
                  </div>

                  {/* Enhanced Toggle */}
                  <div className="bg-gradient-to-r from-slate-100 to-slate-50 p-0.5 rounded-xl flex text-[10px] font-bold shadow-inner">
                      <button onClick={() => setTaskScope('shift')} className={`px-3 py-1 rounded-lg transition-all duration-200 ${taskScope === 'shift' ? 'bg-gradient-to-r from-white to-teal-50 text-teal-600 shadow-md shadow-teal-100/50' : 'text-slate-400 hover:text-slate-600'}`}>SHIFT</button>
                      <button onClick={() => setTaskScope('day')} className={`px-3 py-1 rounded-lg transition-all duration-200 ${taskScope === 'day' ? 'bg-gradient-to-r from-white to-teal-50 text-teal-600 shadow-md shadow-teal-100/50' : 'text-slate-400 hover:text-slate-600'}`}>DAY</button>
                  </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-teal-100/50 bg-white/60 backdrop-blur-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gradient-to-r from-teal-50/80 to-emerald-50/80 text-teal-600 font-semibold border-b border-teal-100/50">
                    <tr>
                      <th className="px-3 py-3">Category</th>
                      <th className="px-2 py-3 text-center">Total</th>
                      <th className="px-2 py-3 text-center text-emerald-600">OK</th>
                      <th className="px-2 py-3 text-center text-rose-500">Late</th>
                      <th className="px-3 py-3 text-center w-24">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-teal-50/30">
                    {Object.entries(activeCategoryStats).map(([category, data]) => {
                      const delayedOrPending = data.total - data.success - data.aborted;
                      const pctSuccess = (data.success / data.total) * 100;
                      const pctLate = (delayedOrPending / data.total) * 100;
                      const pctAborted = (data.aborted / data.total) * 100;

                      return (
                          <tr key={category} className="hover:bg-gradient-to-r hover:from-teal-50/30 hover:to-emerald-50/30 transition-all duration-200">
                              <td className="px-3 py-3 font-medium text-slate-700 capitalize flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full shadow-sm ${
                                  category === 'critical' ? 'bg-gradient-to-r from-rose-400 to-rose-600 shadow-rose-200/50' : 
                                  category === 'routine' ? 'bg-gradient-to-r from-indigo-400 to-indigo-600 shadow-indigo-200/50' : 'bg-gradient-to-r from-slate-400 to-slate-600 shadow-slate-200/50'
                                  }`}></span>
                                  {category}
                              </td>
                              <td className="px-2 py-3 text-center font-bold text-slate-700">{data.total}</td>
                              <td className="px-2 py-3 text-center font-bold text-emerald-600 bg-gradient-to-r from-emerald-50/50 to-green-50/50">{data.success}</td>
                              <td className="px-2 py-3 text-center font-bold text-rose-500 bg-gradient-to-r from-rose-50/50 to-red-50/50">{delayedOrPending}</td>
                              <td className="px-3 py-3">
                                  <div className="flex w-full h-2 rounded-full overflow-hidden bg-slate-100/80 shadow-inner">
                                      <div style={{ width: `${pctSuccess}%` }} className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full shadow-sm shadow-emerald-200/30" title="Success"/>
                                      <div style={{ width: `${pctLate}%` }} className="bg-gradient-to-r from-rose-400 to-rose-600 h-full shadow-sm shadow-rose-200/30" title="Late/Pending"/>
                                      <div style={{ width: `${pctAborted}%` }} className="bg-gradient-to-r from-slate-400 to-slate-600 h-full shadow-sm shadow-slate-200/30" title="Aborted"/>
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
    </div>
  );
};

export default ShiftDashboard;
