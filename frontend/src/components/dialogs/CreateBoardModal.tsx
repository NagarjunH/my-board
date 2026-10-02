import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useBoardStore } from '../../store/boardStore';

export const CreateBoardModal: React.FC = () => {
  const isCreateBoardModalOpen = useUIStore((s) => s.isCreateBoardModalOpen);
  const setCreateBoardModalOpen = useUIStore((s) => s.setCreateBoardModalOpen);
  const createBoard = useBoardStore((s) => s.createBoard);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isCreateBoardModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createBoard(name.trim(), description.trim());
    setName('');
    setDescription('');
    setCreateBoardModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-[#161822] border border-[#EAE5DC] dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-800 dark:text-slate-100 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#EEEDFC] text-[#5B50E6]">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold">Create New Board</h2>
          </div>
          <button
            onClick={() => setCreateBoardModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Board / Course Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Next.js 15 Full Course"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#FAF8F5] dark:bg-slate-900 border border-[#EAE5DC] dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5B50E6]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              placeholder="e.g. YouTube playlist curriculum notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#FAF8F5] dark:bg-slate-900 border border-[#EAE5DC] dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5B50E6] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateBoardModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#5B50E6] hover:bg-[#4E44D4] text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              Create Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
