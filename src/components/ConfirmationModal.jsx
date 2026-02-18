import React from 'react';
import { AlertTriangle, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';

const ConfirmationModal = ({ action, isProcessing, isSuccess, onConfirm, onCancel, onSuccessClose, onViewTasks }) => {
    if (!action && !isProcessing && !isSuccess) {
        return null;
    }

    const getActionSpecificContent = (type) => {
        switch (type) {
            case 'load_demo':
                return {
                    iconColor: 'bg-indigo-100 text-indigo-600',
                    buttonColor: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
                    processingText: 'Loading demo environment...',
                    successTitle: 'Load Complete!',
                    successDesc: 'Demo tasks have been successfully loaded.'
                };
            case 'clear_demo':
                return {
                    iconColor: 'bg-amber-100 text-amber-600',
                    buttonColor: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
                    processingText: 'Cleaning up database records.',
                    successTitle: 'Cleanup Complete!',
                    successDesc: 'Demo tasks have been successfully removed.'
                };
            case 'delete_all':
                return {
                    iconColor: 'bg-rose-100 text-rose-600',
                    buttonColor: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
                    processingText: 'Permanently deleting all data.',
                    successTitle: 'Deletion Complete!',
                    successDesc: 'All data has been permanently erased.'
                };
            default:
                return {
                    iconColor: 'bg-slate-100 text-slate-600',
                    buttonColor: 'bg-slate-600 hover:bg-slate-700 shadow-slate-200',
                    processingText: 'Processing your request...',
                    successTitle: 'Action Complete!',
                    successDesc: 'The action was completed successfully.'
                };
        }
    };

    const content = action ? getActionSpecificContent(action.type) : getActionSpecificContent(null);

    return (
        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-100 shadow-2xl shadow-indigo-500/10 rounded-3xl p-8 max-w-sm w-full text-center ring-1 ring-slate-50 relative z-10">
                
                {/* STATE 1: LOADING */}
                {isProcessing && (
                    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
                       <div className="relative mb-4">
                         <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                         <div className="absolute inset-0 flex items-center justify-center">
                           <RefreshCw size={20} className="text-indigo-500 animate-pulse"/>
                         </div>
                       </div>
                       <h3 className="text-xl font-bold text-slate-800 mb-1">Processing...</h3>
                       <p className="text-sm text-slate-500">{content.processingText}</p>
                    </div>
                )}

                {/* STATE 2: SUCCESS */}
                {isSuccess && (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                       <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-100">
                          <CheckCircle2 size={32} strokeWidth={3} />
                       </div>
                       <h3 className="text-xl font-bold text-slate-800 mb-2">{content.successTitle}</h3>
                       <p className="text-sm text-slate-500 mb-6">{content.successDesc}</p>
                       <button 
                          onClick={action?.type === 'clear_demo' ? onViewTasks : onSuccessClose}
                          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                       >
                          {action?.type === 'clear_demo' ? 'Go to Tasks' : 'View Dashboard'} <ArrowRight size={18}/>
                       </button>
                    </div>
                )}

                {/* STATE 3: CONFIRMATION (Initial) */}
                {action && !isProcessing && !isSuccess && (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                       <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${content.iconColor}`}>
                          <AlertTriangle size={28}/>
                       </div>
                       <h3 className="text-xl font-bold text-slate-800 mb-2">{action.title}</h3>
                       <p className="text-sm text-slate-500 mb-8 leading-relaxed px-2">{action.desc}</p>
                       <div className="flex gap-3">
                          <button onClick={onCancel} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                          <button onClick={onConfirm} className={`flex-1 px-4 py-3 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-95 ${content.buttonColor}`}>
                              Confirm
                          </button>
                       </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConfirmationModal;