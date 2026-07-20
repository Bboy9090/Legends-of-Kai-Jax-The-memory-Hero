/**
 * Quest Log UI Component
 * Displays player's active, available, and completed quests with progress tracking
 */

import React, { useState } from 'react';
import { useQuestLog } from '../../lib/stores/useQuestLog';
import type { Quest, QuestType } from '../../lib/questSystem';

const QUEST_TYPE_COLORS: Record<QuestType, { label: string; color: string }> = {
  story: { label: 'Story', color: '#3b82f6' },
  side: { label: 'Side', color: '#8b5cf6' },
  character: { label: 'Character', color: '#ec4899' },
  challenge: { label: 'Challenge', color: '#f59e0b' },
  secret: { label: 'Secret', color: '#6366f1' },
};

interface QuestLogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuestLog({ isOpen, onClose }: QuestLogProps) {
  const [filter, setFilter] = useState<'active' | 'available' | 'completed'>('active');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  const getActiveQuests = useQuestLog((state) => state.getActiveQuests);
  const getAvailableQuests = useQuestLog((state) => state.getAvailableQuests);
  const getCompletedQuests = useQuestLog((state) => state.getCompletedQuests);
  const activateQuest = useQuestLog((state) => state.activateQuest);

  const getFilteredQuests = () => {
    switch (filter) {
      case 'active':
        return getActiveQuests();
      case 'available':
        return getAvailableQuests();
      case 'completed':
        return getCompletedQuests();
      default:
        return [];
    }
  };

  const filteredQuests = getFilteredQuests();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center pointer-events-auto z-50">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/50 rounded-xl p-6 max-w-2xl max-h-[80vh] overflow-auto w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black tracking-wider text-white uppercase">Quest Log</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['active', 'available', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
                filter === tab
                  ? 'bg-cyan-500/30 border border-cyan-500 text-cyan-300'
                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {tab === 'active'
                ? `Active (${getActiveQuests().length})`
                : tab === 'available'
                  ? `Available (${getAvailableQuests().length})`
                  : `Completed (${getCompletedQuests().length})`}
            </button>
          ))}
        </div>

        {/* Quest list */}
        {filteredQuests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No quests to display</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {filteredQuests.map((quest) => (
              <button
                key={quest.id}
                onClick={() => setSelectedQuest(selectedQuest?.id === quest.id ? null : quest)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedQuest?.id === quest.id
                    ? 'border-cyan-500 bg-cyan-500/20'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: QUEST_TYPE_COLORS[quest.questType].color + '33',
                          color: QUEST_TYPE_COLORS[quest.questType].color,
                          border: `1px solid ${QUEST_TYPE_COLORS[quest.questType].color}`,
                        }}
                      >
                        {QUEST_TYPE_COLORS[quest.questType].label}
                      </span>
                    </div>
                    <h3 className="text-white font-bold">{quest.title}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-cyan-400">{quest.progressPercent}%</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${quest.progressPercent}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Selected quest details */}
        {selectedQuest && (
          <div className="border-t border-slate-700 pt-6 mt-6">
            <h3 className="text-lg font-bold text-white mb-2">{selectedQuest.title}</h3>
            <p className="text-slate-300 text-sm mb-4">{selectedQuest.description}</p>

            {/* Objectives */}
            <div className="mb-4">
              <h4 className="text-sm font-bold text-cyan-400 mb-2 uppercase">Objectives</h4>
              <div className="space-y-2">
                {selectedQuest.objectives.map((obj) => (
                  <div key={obj.id} className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded border border-slate-600 flex items-center justify-center">
                      {obj.completed && <span className="text-green-400">✓</span>}
                    </div>
                    <span
                      className={obj.completed ? 'text-slate-400 line-through' : 'text-white/90'}
                    >
                      {obj.description}
                    </span>
                    {obj.target && (
                      <span className="text-slate-500 ml-auto">
                        {obj.progress ?? 0}/{obj.target}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards */}
            <div className="bg-amber-950/30 border border-amber-700/50 rounded-lg p-3">
              <h4 className="text-xs font-bold text-amber-400 mb-2 uppercase">Rewards</h4>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-amber-400 font-bold">{selectedQuest.reward.xp} XP</span>
                </div>
                <div>
                  <span className="text-yellow-500 font-bold">{selectedQuest.reward.currency} Credits</span>
                </div>
              </div>
            </div>

            {/* Action button */}
            {selectedQuest.status === 'available' && (
              <button
                onClick={() => {
                  activateQuest(selectedQuest.id);
                  setSelectedQuest(null);
                }}
                className="w-full mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm uppercase tracking-wider hover:scale-105 transition-transform"
              >
                Activate Quest
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
