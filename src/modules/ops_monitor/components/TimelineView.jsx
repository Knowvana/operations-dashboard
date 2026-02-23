import React, { useRef, useEffect } from 'react';
import { Rocket, Clock, CheckCircle, XCircle, MessageSquare, Tag } from 'lucide-react';
import { formatTime, getTimelineHours, isTimeInShift, getShiftActivityStatus } from '@shared';

const TimelineView = ({ 
  tasks, 
  shifts, 
  currentTime, 
  onSelectTask 
}) => {
  const timelineRef = useRef(null);
  const times = getTimelineHours();
  const timeString = formatTime(currentTime);
  const currentHour = currentTime.getHours().toString().padStart(2, '0');
  const currentMinute = currentTime.getMinutes() < 30 ? '00' : '30';
  const currentSlot = `${currentHour}:${currentMinute}`;

  useEffect(() => {
    if (tasks.length > 0) {
      const el = document.getElementById(`slot-${currentSlot}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [tasks.length]);

  return (
    <div className="relative py-8" ref={timelineRef}>
      {/* The Timeline Spine */}
      <div className="absolute left-[80px] top-0 bottom-0 w-px bg-slate-200 z-0"></div>

      {/* Current Time Indicator - left side, not overlapping */}
      <div 
        className="absolute left-0 w-[70px] h-6 flex items-center justify-end z-20"
        style={{ top: `${(currentTime.getHours() * 60 + (currentTime.getMinutes() < 30 ? 0 : 30)) / (24 * 60) * 100}%` }}
      >
        <div className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
          Current: {formatTime(currentTime)}
        </div>
      </div>

      {times.map((slot) => {
        const [hour, minute] = slot.split(':');
        const slotTasks = tasks.filter(t => {
          return t.plannedStart === slot;
        });
        const isCurrentSlot = slot === currentSlot;
        const shiftEnding = shifts.find(s => s.end === slot);
        const shiftStarting = shifts.find(s => s.start === slot);

        return (
          <div key={slot} id={`slot-${slot}`} className={`relative group ${shiftStarting ? 'my-12' : 'pb-8'}`}>
            {/* Shift Handover Badge */}
            {shiftStarting && shiftEnding && (
              <div className="absolute top-[-32px] left-[100px] right-0 flex items-center z-10">
                  <div className="h-px bg-indigo-100 flex-1"></div>
                  <div className="bg-slate-800 text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2 mx-4 border-2 border-white ring-2 ring-indigo-50">
                      <Rocket size={14} className="text-indigo-300" />
                      Handover: {shiftEnding.name} <span className="text-slate-500">→</span> {shiftStarting.name}
                  </div>
                  <div className="h-px bg-indigo-100 flex-1"></div>
              </div>
            )}

            {/* Timeline Time Marker */}
            <div className={`absolute left-0 w-[60px] text-right text-xs font-mono font-bold tracking-tight pt-1 transition-colors
              ${isCurrentSlot ? 'text-indigo-600' : 'text-slate-400'}`}>
              {slot}
            </div>

            {/* Timeline Node (Dot) */}
            <div className={`absolute left-[76px] top-2 h-2 w-2 rounded-full border-2 bg-white z-10
              ${isCurrentSlot ? 'border-indigo-600 scale-125' : 'border-slate-300'}`}>
            </div>

            {/* Slot Content */}
            <div className={`transition-all duration-500 ml-[100px] ${isCurrentSlot ? 'opacity-100' : 'opacity-90'}`}>
              {slotTasks.length === 0 ? (
                <div className="h-6 border-b border-dashed border-slate-200/50 w-full" />
              ) : (
                <div className="space-y-4">
                  {slotTasks.map(task => {
                    const shiftStatus = getShiftActivityStatus(task, timeString);
                    return (
                      <div 
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className={`relative rounded-xl shadow-sm border border-slate-200 overflow-hidden group/card hover:shadow-md transition-all cursor-pointer ${isCurrentSlot ? 'bg-gradient-to-r from-indigo-50 via-indigo-100 to-white' : 'bg-white'}`}
                      >
                          {/* Left Gradient Border */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${shiftStatus.gradient}`}></div>

                          {/* Main Content */}
                          <div className="p-4 pl-6">
                              {/* Top Row: Title, Tag & Updated By */}
                              <div className="flex justify-between items-start mb-2">
                                  <div className="flex flex-col gap-1">
                                      {/* Status Badge */}
                                      <div className="flex items-center gap-2">
                                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${shiftStatus.badge}`}>
                                              {shiftStatus.label}
                                          </span>
                                          <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 border border-slate-100 px-1.5 py-0.5 rounded">
                                              <Tag size={10} /> {task.type || 'General'}
                                          </span>
                                      </div>
                                      <h3 className="text-sm font-bold text-slate-800">{task.title}</h3>
                                  </div>
                                  
                                  {(task.updatedBy || task.updatedAt) && (
                                      <div className="text-right">
                                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Updated By</p>
                                          <p className="text-xs font-medium text-slate-600">{task.updatedBy}</p>
                                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">{task.updatedAt ? new Date(task.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</p>
                                      </div>
                                  )}
                              </div>

                              {/* Middle Row: Consolidated Data */}
                              <div className="flex flex-wrap items-center gap-6 mt-4">
                                  {/* 1. Scheduled (Planned) */}
                                  <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PLANNED EXECUTION TIME</span>
                                      <span className="font-mono text-[10px] text-slate-500">
                                          {task.plannedStart} - {task.plannedEnd}
                                      </span>
                                  </div>

                                  {/* 2. Actual Performance */}
                                  <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">ACTUAL EXECUTION TIME</span>
                                      {task.actualStart ? (
                                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700">
                                              <Clock size={12} className="text-indigo-400" />
                                              {task.actualStart} <span className="text-slate-300">→</span> {task.actualEnd}
                                          </div>
                                      ) : (
                                          <span className="text-xs text-slate-400 italic">Pending...</span>
                                      )}
                                  </div>

                                  {/* 3. Execution Status */}
                                  {task.status !== 'pending' && (
                                      <div className="flex flex-col">
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">EXECUTION STATUS</span>
                                          <span className={`inline-flex items-center gap-1 font-medium text-xs capitalize ${shiftStatus.text}`}>
                                              {task.status === 'completed' && <CheckCircle size={14}/>}
                                              {task.status === 'aborted' && <XCircle size={14}/>}
                                              {task.status.replace('_', ' ')}
                                          </span>
                                      </div>
                                  )}
                              </div>

                              {/* Bottom: Resource Log */}
                              {task.comments && (
                                  <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-600 bg-slate-50/50 border border-slate-100 p-2 rounded shadow-sm">
                                      <MessageSquare size={12} className="mt-0.5 text-indigo-300 flex-shrink-0" />
                                      <span className="italic">"{task.comments}"</span>
                                  </div>
                              )}
                          </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineView;
