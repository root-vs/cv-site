import { useEffect } from 'react';
import { Download, ExternalLink, Mail, MapPin, Phone, X } from 'lucide-react';
import { ASSETS, CONTACT_INFO } from '../data/cvVault';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Contact Valerio Serino"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#080d12] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-50">
              Contact Valerio Serino
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Senior IT Consultant · AI &amp; Distributed Enterprise Systems
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close contact dialog"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-3.5 text-sm">
          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#05090d] px-4 py-3 text-slate-200">
            <MapPin className="h-4 w-4 shrink-0 text-teal-300" />
            <span>{CONTACT_INFO.location}</span>
          </div>

          <a
            href={CONTACT_INFO.phoneHref}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#05090d] px-4 py-3 text-slate-200 transition-colors hover:border-teal-300/40 hover:text-teal-200"
          >
            <span className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-teal-300" />
              <span className="font-mono-tabular">{CONTACT_INFO.phoneDisplay}</span>
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
          </a>

          <a
            href={CONTACT_INFO.emailHref}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#05090d] px-4 py-3 text-slate-200 transition-colors hover:border-teal-300/40 hover:text-teal-200"
          >
            <span className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-teal-300" />
              <span>{CONTACT_INFO.email}</span>
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
          </a>

          <a
            href={CONTACT_INFO.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#05090d] px-4 py-3 text-slate-200 transition-colors hover:border-teal-300/40 hover:text-teal-200"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-xs bg-teal-300/20 text-[10px] font-bold text-teal-300">
                in
              </span>
              <span>LinkedIn · {CONTACT_INFO.linkedinLabel}</span>
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-4">
          <a
            href={ASSETS.cvPdf}
            download="Valerio_Serino_CV_Resume.pdf"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-teal-400 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-teal-300"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CV PDF</span>
          </a>
        </div>
      </div>
    </div>
  );
}
