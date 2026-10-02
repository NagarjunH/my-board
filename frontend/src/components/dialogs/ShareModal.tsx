import React, { useState } from 'react';
import { X, Copy, Check, Globe, Lock, ShieldCheck } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useBoardStore } from '../../store/boardStore';
import { boardApi } from '../../services/boardApi';

export const ShareModal: React.FC = () => {
  const isShareModalOpen = useUIStore((s) => s.isShareModalOpen);
  const setShareModalOpen = useUIStore((s) => s.setShareModalOpen);
  const activeBoard = useBoardStore((s) => s.getActiveBoard());

  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [copied, setCopied] = useState(false);
  const [shareToken, setShareToken] = useState('demo-share-js101');

  if (!isShareModalOpen) return null;

  const origin = window.location.origin;
  const shareUrl = `${origin}/share/${shareToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-[#161822] border border-[#EAE5DC] dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-800 dark:text-slate-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#EEEDFC] text-[#5B50E6]">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold">Share Board</h2>
          </div>
          <button
            onClick={() => setShareModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Anyone with this link can access <strong className="text-slate-800 dark:text-white">{activeBoard?.name || 'this board'}</strong>.
        </p>

        {/* Permission Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF8F5] dark:bg-slate-900 border border-[#EAE5DC] dark:border-slate-800 rounded-xl">
          <button
            onClick={() => setPermission('view')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
              permission === 'view'
                ? 'bg-[#5B50E6] text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            View only
          </button>
          <button
            onClick={() => setPermission('edit')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
              permission === 'edit'
                ? 'bg-[#5B50E6] text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Can edit
          </button>
        </div>

        <div className="border-t border-[#EAE5DC] dark:border-slate-800 pt-4 space-y-3">
          {/* Share Link Input */}
          <div className="flex items-center gap-2 bg-[#FAF8F5] dark:bg-slate-900 border border-[#EAE5DC] dark:border-slate-800 rounded-xl px-3 py-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-300 w-full focus:outline-none font-mono"
            />
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopyLink}
            className="w-full py-2.5 bg-[#5B50E6] hover:bg-[#4E44D4] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Private notes and user credentials are never exposed via share links.</span>
        </div>
      </div>
    </div>
  );
};
