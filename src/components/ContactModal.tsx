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
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 px-4 py-4 dark:bg-black/80"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-950/15 bg-white p-5 shadow-2xl dark:border-white/15 dark:bg-[#080d12] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-950/10 pb-4 dark:border-white/10">
          <div>
            <h3 className="font-display text-lg font-semibold text-zinc-950 dark:text-slate-50">
              Contact Valerio Serino
            </h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-slate-400">
              Senior IT Consultant · AI &amp; Distributed Enterprise Systems
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close contact dialog"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-zinc-950/15 bg-zinc-100 text-zinc-800 transition-colors hover:bg-zinc-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-3 text-sm sm:space-y-3.5">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-950/10 bg-zinc-50 px-4 py-3 text-zinc-900 dark:border-white/5 dark:bg-[#05090d] dark:text-slate-200">
            <MapPin className="h-4 w-4 shrink-0 text-zinc-950 dark:text-teal-300" />
            <span className="min-w-0">{CONTACT_INFO.location}</span>
          </div>

          <a
            href={CONTACT_INFO.phoneHref}
            className="flex items-center justify-between gap-3 rounded-xl border border-zinc-950/10 bg-zinc-50 px-4 py-3 text-zinc-900 transition-colors hover:border-zinc-950 dark:border-white/5 dark:bg-[#05090d] dark:text-slate-200 dark:hover:border-teal-300/40 dark:hover:text-teal-200"
          >
            <span className="flex min-w-0 items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-zinc-950 dark:text-teal-300" />
              <span className="font-mono-tabular truncate">{CONTACT_INFO.phoneDisplay}</span>
            </span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-slate-500" />
          </a>

          <a
            href={CONTACT_INFO.emailHref}
            className="flex items-center justify-between gap-3 rounded-xl border border-zinc-950/10 bg-zinc-50 px-4 py-3 text-zinc-900 transition-colors hover:border-zinc-950 dark:border-white/5 dark:bg-[#05090d] dark:text-slate-200 dark:hover:border-teal-300/40 dark:hover:text-teal-200"
          >
            <span className="flex min-w-0 items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-zinc-950 dark:text-teal-300" />
              <span className="truncate">{CONTACT_INFO.email}</span>
            </span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-slate-500" />
          </a>

          <a
            href={CONTACT_INFO.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-xl border border-zinc-950/10 bg-zinc-50 px-4 py-3 text-zinc-900 transition-colors hover:border-zinc-950 dark:border-white/5 dark:bg-[#05090d] dark:text-slate-200 dark:hover:border-teal-300/40 dark:hover:text-teal-200"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-xs bg-zinc-950 text-[10px] font-bold text-white dark:bg-teal-300/20 dark:text-teal-300">
                in
              </span>
              <span className="truncate">LinkedIn · {CONTACT_INFO.linkedinLabel}</span>
            </span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-slate-500" />
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-zinc-950/10 pt-4 dark:border-white/10">
          <a
            href={ASSETS.cvPdf}
            download="Valerio_Serino_CV_Resume.pdf"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CV PDF</span>
          </a>
        </div>
      </div>
    </div>
  );
}
