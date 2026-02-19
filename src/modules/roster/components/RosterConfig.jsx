import React, { useState } from 'react';
import { Settings, Trash2, Plus, CalendarX2, Users } from 'lucide-react';
import { COLORS } from '../utils/rosterConstants';

// Shared small badge component
const ShiftBadge = ({ shift, className = "" }) => {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${shift.color} ${className}`}>
      <span className="truncate">{shift.label}</span>
    </div>
  );
};

export default function RosterConfig({ 
  shifts, setShifts, 
  employees, setEmployees, 
  leaves, setLeaves 
}) {
  // Move local form states here (Parent doesn't need to track what user is typing)
  const [newShift, setNewShift] = useState({ label: '', time: '', color: COLORS[0].value, reqWeekday: 0, reqWeekend: 0 });
  const [newLeave, setNewLeave] = useState({ empId: '', date: '' });
  const [newEmployeeName, setNewEmployeeName] = useState('');

  // --- Handlers ---
  const addShift = () => {
    if (!newShift.label || !newShift.time) return;
    const id = newShift.label.toLowerCase().replace(/\s+/g, '-');
    setShifts([...shifts, { ...newShift, id, reqWeekday: Number(newShift.reqWeekday), reqWeekend: Number(newShift.reqWeekend) }]);
    setNewShift({ label: '', time: '', color: COLORS[0].value, reqWeekday: 0, reqWeekend: 0 });
  };

  const removeShift = (id) => { if (shifts.length > 1) setShifts(shifts.filter(s => s.id !== id)); };
  const updateShiftReq = (id, field, value) => setShifts(shifts.map(s => s.id === id ? { ...s, [field]: Number(value) } : s));

  const addLeave = () => {
    if (!newLeave.empId || !newLeave.date) return;
    setLeaves([...leaves, { ...newLeave, id: Date.now().toString() }]);
    setNewLeave({ empId: '', date: '' });
  };
  const removeLeave = (id) => setLeaves(leaves.filter(l => l.id !== id));

  const addEmployee = () => {
    if (!newEmployeeName.trim()) return;
    const newEmp = { id: `emp-${Date.now()}`, name: newEmployeeName, role: 'Operator' };
    setEmployees([...employees, newEmp]);
    setNewEmployeeName('');
  };
  const removeEmployee = (id) => setEmployees(employees.filter(e => e.id !== id));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 animate-in fade-in duration-300">
      
      {/* Left Column: Shifts & Leaves */}
      <div className="space-y-8">
        
        {/* SHIFTS CONFIG */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Settings size={24} /></div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">Shift Parameters</h2>
              <p className="text-sm text-slate-500 font-medium">Define capacity requirements per shift</p>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-12 gap-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-5">Shift Details</div>
              <div className="col-span-3 text-center">Weekday Req</div>
              <div className="col-span-3 text-center">Weekend Req</div>
              <div className="col-span-1"></div>
            </div>
            {shifts.map(shift => (
              <div key={shift.id} className="grid grid-cols-12 gap-4 items-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                  <div className="col-span-5">
                    <ShiftBadge shift={shift} className="w-fit mb-1.5" />
                    <span className="text-[11px] font-bold text-slate-400 font-mono ml-1">{shift.time}</span>
                  </div>
                  <div className="col-span-3">
                    <input type="number" min="0" value={shift.reqWeekday} onChange={(e) => updateShiftReq(shift.id, 'reqWeekday', e.target.value)} className="w-full text-center text-sm font-bold px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="col-span-3">
                    <input type="number" min="0" value={shift.reqWeekend} onChange={(e) => updateShiftReq(shift.id, 'reqWeekend', e.target.value)} className="w-full text-center text-sm font-bold px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => removeShift(shift.id)} className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </div>
              </div>
            ))}
          </div>

          {/* Add New Shift */}
          <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus size={16} className="text-blue-600"/> Add Custom Shift</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="Shift Name" className="text-sm font-medium px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" value={newShift.label} onChange={e => setNewShift({...newShift, label: e.target.value})} />
                  <input type="text" placeholder="Time (e.g. 10:00-18:00)" className="text-sm font-mono px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" value={newShift.time} onChange={e => setNewShift({...newShift, time: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute -top-2 left-3 bg-white px-2">Weekday Req</label>
                    <input type="number" min="0" placeholder="0" className="w-full font-bold text-sm px-4 py-3 rounded-xl border border-slate-200" value={newShift.reqWeekday || ''} onChange={e => setNewShift({...newShift, reqWeekday: e.target.value})} />
                  </div>
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute -top-2 left-3 bg-white px-2">Weekend Req</label>
                    <input type="number" min="0" placeholder="0" className="w-full font-bold text-sm px-4 py-3 rounded-xl border border-slate-200" value={newShift.reqWeekend || ''} onChange={e => setNewShift({...newShift, reqWeekend: e.target.value})} />
                  </div>
              </div>
              <div className="flex gap-3 items-center mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wider">Color:</span>
                  {COLORS.map(c => (
                    <button 
                      key={c.label} onClick={() => setNewShift({...newShift, color: c.value})} 
                      className={`w-8 h-8 rounded-full border-2 shadow-sm ${c.value.split(' ')[0]} ${newShift.color === c.value ? 'border-slate-800 scale-110 ring-4 ring-slate-200' : 'border-transparent'}`} title={c.label} 
                    />
                  ))}
              </div>
              <button onClick={addShift} disabled={!newShift.label || !newShift.time} className="w-full py-3.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 disabled:opacity-50 transition-colors shadow-lg shadow-slate-800/20">
                Add to Roster Template
              </button>
          </div>
        </div>

        {/* LEAVES CONFIG */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><CalendarX2 size={24} /></div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800">Planned Leaves</h2>
                  <p className="text-sm font-medium text-slate-500">Exempt employees from scheduling</p>
                </div>
            </div>
            <div className="flex gap-3 mb-6">
                <select className="flex-1 text-sm font-medium px-4 py-3 rounded-xl border border-slate-200 bg-white" value={newLeave.empId} onChange={e => setNewLeave({...newLeave, empId: e.target.value})}>
                    <option value="">Select Employee...</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
                <input type="date" className="w-48 text-sm font-medium px-4 py-3 rounded-xl border border-slate-200" value={newLeave.date} onChange={e => setNewLeave({...newLeave, date: e.target.value})} />
                <button onClick={addLeave} disabled={!newLeave.empId || !newLeave.date} className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 disabled:opacity-50 shadow-lg shadow-amber-500/20 transition-all">Add</button>
            </div>
            {leaves.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {leaves.map(leave => {
                        const empName = employees.find(e => e.id === leave.empId)?.name || 'Unknown';
                        return (
                            <div key={leave.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100 hover:shadow-sm transition-shadow">
                                <div className="text-sm font-bold text-amber-900">{empName}</div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-mono font-bold bg-white px-3 py-1.5 rounded-lg text-amber-700 shadow-sm border border-amber-100">{leave.date}</span>
                                    <button onClick={() => removeLeave(leave.id)} className="text-amber-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm font-medium">No upcoming leaves registered.</div>}
        </div>
      </div>

      {/* Right Column: Resource Pool */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full max-h-[1000px]">
        <div className="p-8 border-b border-slate-200">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
              <div>
                  <h2 className="text-xl font-extrabold text-slate-800">Resource Pool</h2>
                  <p className="text-sm font-medium text-slate-500">Currently managing <span className="font-bold text-slate-800">{employees.length}</span> active resources</p>
              </div>
            </div>
        </div>
        <div className="p-6 bg-slate-50/50 border-b border-slate-200 shrink-0">
          <div className="flex gap-3">
            <input type="text" value={newEmployeeName} onChange={(e) => setNewEmployeeName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addEmployee()} placeholder="Enter new employee name..." className="flex-1 px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm" />
            <button onClick={addEmployee} disabled={!newEmployeeName.trim()} className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"><Plus size={18} /> Add User</button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider rounded-l-xl">Name</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/80 group transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center text-sm font-black shadow-inner border border-blue-200/50">{emp.name.charAt(0)}</div>{emp.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{emp.role}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => removeEmployee(emp.id)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}