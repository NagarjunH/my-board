import React, { useState, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Trash2,
  Copy,
  Edit2,
  MoreVertical,
} from 'lucide-react';
import { useBoardStore } from '../../store/boardStore';
import { useCanvasStore } from '../../store/canvasStore';
import { useUIStore } from '../../store/uiStore';

export const Sidebar: React.FC = () => {
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const setCreateBoardModalOpen = useUIStore((s) => s.setCreateBoardModalOpen);

  const boards = useBoardStore((s) => s.boards);
  const activeBoardId = useBoardStore((s) => s.activeBoardId);
  const activePageId = useBoardStore((s) => s.activePageId);
  const setActiveBoardId = useBoardStore((s) => s.setActiveBoardId);
  const setActivePageId = useBoardStore((s) => s.setActivePageId);
  const createPage = useBoardStore((s) => s.createPage);
  const duplicatePage = useBoardStore((s) => s.duplicatePage);
  const deletePage = useBoardStore((s) => s.deletePage);
  const deleteBoard = useBoardStore((s) => s.deleteBoard);
  const renamePage = useBoardStore((s) => s.renamePage);
  const searchQuery = useBoardStore((s) => s.searchQuery);
  const setSearchQuery = useBoardStore((s) => s.setSearchQuery);

  const setElements = useCanvasStore((s) => s.setElements);
  const setBackground = useCanvasStore((s) => s.setBackground);

  const [expandedBoardIds, setExpandedBoardIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeBoardId) {
      setExpandedBoardIds((prev) => ({ ...prev, [activeBoardId]: true }));
    }
  }, [activeBoardId]);

  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageRenameDraft, setPageRenameDraft] = useState('');
  const [activeMenuPageId, setActiveMenuPageId] = useState<string | null>(null);

  if (!isSidebarOpen) return null;

  const toggleExpand = (boardId: string) => {
    setExpandedBoardIds((prev) => ({
      ...prev,
      [boardId]: !prev[boardId],
    }));
  };

  const handleSelectPage = (boardId: string, pageId: string) => {
    setActiveBoardId(boardId);
    setActivePageId(pageId);

    // Sync canvas state to selected page
    const targetBoard = boards.find((b) => b.id === boardId);
    const targetPage = targetBoard?.pages?.find((p) => p.id === pageId);

    if (targetPage) {
      setElements(targetPage.canvasState.elements || []);
      setBackground(targetPage.backgroundConfig || { style: 'white' });
    }
  };

  const handleAddNewPage = (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPage = createPage(boardId);
    setExpandedBoardIds((prev) => ({ ...prev, [boardId]: true }));
    handleSelectPage(boardId, newPage.id);
  };

  const filteredBoards = boards.filter((b) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchesBoard = b.name.toLowerCase().includes(query);
    const matchesPages = b.pages?.some((p) => p.name.toLowerCase().includes(query));
    return matchesBoard || matchesPages;
  });

  return (
    <aside className="w-64 bg-[#FAF8F5] dark:bg-[#11131a] border-r border-[#EAE5DC] dark:border-slate-800 flex flex-col h-full select-none z-30 shrink-0 text-slate-800 dark:text-slate-200">
      {/* Sidebar Header & Search */}
      <div className="p-3 border-b border-[#EAE5DC] dark:border-slate-800 space-y-2">
        {/* + New Board Primary Button */}
        <button
          onClick={() => setCreateBoardModalOpen(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#5B50E6] hover:bg-[#4E44D4] text-white rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Board</span>
        </button>

        {/* Search input with Ctrl K badge */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search boards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-[#EAE5DC] dark:border-slate-800 rounded-xl pl-8 pr-12 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#5B50E6] shadow-2xs transition-colors"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono select-none">
            Ctrl K
          </span>
        </div>
      </div>

      {/* Boards List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredBoards.length === 0 ? (
          <div className="text-center py-10 px-3 space-y-2">
            <p className="text-xs text-slate-400">No boards found</p>
            <button
              onClick={() => setCreateBoardModalOpen(true)}
              className="text-xs font-semibold text-[#5B50E6] hover:underline"
            >
              + Create a new board
            </button>
          </div>
        ) : (
          filteredBoards.map((board) => {
            const isExpanded = !!expandedBoardIds[board.id];
            const isBoardActive = activeBoardId === board.id;

            return (
              <div key={board.id} className="space-y-0.5">
                {/* Board Header Row */}
                <div
                  onClick={() => {
                    toggleExpand(board.id);
                    if (!isBoardActive) {
                      setActiveBoardId(board.id);
                      if (board.pages && board.pages.length > 0) {
                        handleSelectPage(board.id, board.pages[0].id);
                      }
                    }
                  }}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer text-xs transition-colors group ${
                    isBoardActive
                      ? 'text-[#5B50E6] dark:text-[#a5b4fc] bg-[#EEEDFC] dark:bg-[#5B50E6]/25 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-[#F3EFE8] dark:hover:bg-slate-800/40 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {isExpanded ? (
                      <FolderOpen className={`w-4 h-4 shrink-0 ${isBoardActive ? 'text-[#5B50E6] dark:text-[#a5b4fc]' : 'text-slate-400'}`} />
                    ) : (
                      <Folder className={`w-4 h-4 shrink-0 ${isBoardActive ? 'text-[#5B50E6] dark:text-[#a5b4fc]' : 'text-slate-400'}`} />
                    )}
                    <span className="truncate">{board.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] ${isBoardActive ? 'text-[#5B50E6] dark:text-[#a5b4fc] font-bold' : 'text-slate-400 font-medium'}`}>
                      {board.pages?.length || 0}
                    </span>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleAddNewPage(board.id, e)}
                        className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded"
                        title="Add lesson page"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      {boards.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${board.name}"?`)) {
                              deleteBoard(board.id);
                            }
                          }}
                          className="p-0.5 text-slate-400 hover:text-rose-500 rounded"
                          title="Delete board"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

              {/* Nested Pages for this Board */}
              {isExpanded && board.pages && board.pages.length > 0 && (
                <div className="ml-3 pl-2 border-l border-[#EAE5DC] dark:border-slate-800/80 space-y-0.5 my-0.5">
                  {board.pages.map((page) => {
                    const isPageActive = activePageId === page.id;
                    const isEditing = editingPageId === page.id;

                    return (
                      <div
                        key={page.id}
                        className={`group relative flex items-center justify-between px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          isPageActive
                            ? 'bg-[#EEEDFC] dark:bg-[#5B50E6]/25 text-[#5B50E6] dark:text-[#a5b4fc] font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-[#F3EFE8] dark:hover:bg-slate-800/50'
                        }`}
                        onClick={() => handleSelectPage(board.id, page.id)}
                      >
                        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                          <Folder className={`w-3.5 h-3.5 shrink-0 ${isPageActive ? 'text-[#5B50E6] dark:text-[#a5b4fc]' : 'text-slate-400'}`} />
                          {isEditing ? (
                            <input
                              type="text"
                              value={pageRenameDraft}
                              onChange={(e) => setPageRenameDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  renamePage(page.id, pageRenameDraft);
                                  setEditingPageId(null);
                                }
                                if (e.key === 'Escape') setEditingPageId(null);
                              }}
                              autoFocus
                              className="bg-white dark:bg-slate-900 border border-[#5B50E6] rounded px-1.5 py-0.5 text-xs text-slate-800 dark:text-white w-full"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className="truncate">{page.name}</span>
                          )}
                        </div>

                        {/* Page action button */}
                        {!isEditing && (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuPageId(activeMenuPageId === page.id ? null : page.id);
                              }}
                              className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                                isPageActive ? 'hover:bg-[#E0DEFA] text-[#5B50E6]' : 'hover:bg-[#EAE5DC] text-slate-500'
                              }`}
                            >
                              <MoreVertical className="w-3 h-3" />
                            </button>

                            {/* Dropdown menu */}
                            {activeMenuPageId === page.id && (
                              <div
                                className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-900 border border-[#EAE5DC] dark:border-slate-700 rounded-xl shadow-xl p-1 z-50 text-slate-700 dark:text-slate-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    setEditingPageId(page.id);
                                    setPageRenameDraft(page.name);
                                    setActiveMenuPageId(null);
                                  }}
                                  className="w-full text-left px-2 py-1 text-xs hover:bg-[#FAF8F5] dark:hover:bg-slate-800 rounded flex items-center gap-1.5"
                                >
                                  <Edit2 className="w-3 h-3 text-[#5B50E6]" /> Rename
                                </button>
                                <button
                                  onClick={() => {
                                    duplicatePage(page.id);
                                    setActiveMenuPageId(null);
                                  }}
                                  className="w-full text-left px-2 py-1 text-xs hover:bg-[#FAF8F5] dark:hover:bg-slate-800 rounded flex items-center gap-1.5"
                                >
                                  <Copy className="w-3 h-3 text-blue-500" /> Duplicate
                                </button>
                                {board.pages && board.pages.length > 1 && (
                                  <button
                                    onClick={() => {
                                      deletePage(page.id);
                                      setActiveMenuPageId(null);
                                    }}
                                    className="w-full text-left px-2 py-1 text-xs hover:bg-rose-50 dark:hover:bg-red-900/40 text-rose-600 rounded flex items-center gap-1.5"
                                  >
                                    <Trash2 className="w-3 h-3" /> Delete
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }))}
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-[#EAE5DC] dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium">Boards ({boards.length})</span>
        <button
          onClick={() => setCreateBoardModalOpen(true)}
          className="p-1 hover:text-[#5B50E6] hover:bg-[#EEEDFC] rounded-lg transition-colors"
          title="Create new board"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
