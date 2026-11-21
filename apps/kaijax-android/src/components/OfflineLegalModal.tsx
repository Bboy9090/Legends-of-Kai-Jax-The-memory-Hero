import React from 'react';
import { Shield, X } from 'lucide-react';
import { OFFLINE_LEGAL_DOCS } from '../game/legal/offlineLegal';

interface OfflineLegalModalProps {
  docId: 'privacy' | 'terms';
  onClose: () => void;
}

export const OfflineLegalModal: React.FC<OfflineLegalModalProps> = ({ docId, onClose }) => {
  const doc = OFFLINE_LEGAL_DOCS[docId];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 safe-area-pad pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="w-full max-w-xl max-h-[85vh] rounded-2xl bg-[#0d1018] border border-slate-700 flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-800 bg-[#0a0b10]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Shield className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <h2 id="legal-modal-title" className="font-display text-2xl font-bold text-slate-50 truncate">
                {doc.title}
              </h2>
              <p className="text-xs text-slate-300">Offline Bundle · Updated {doc.updated}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close legal notice"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs px-3 gap-1 shrink-0"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll p-5 space-y-4">
          {doc.sections.map((section) => (
            <section key={section.heading} className="rounded-xl bg-[#131620] border border-slate-800 p-4">
              <h3 className="text-sm font-semibold text-amber-300">{section.heading}</h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-200 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
