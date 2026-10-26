import React, { useState, useEffect } from 'react';
import { MorningChecklistStep, TabId } from '../../types/cryptoRadar';
import { soundManager } from '../../services/alertService';
import { Badge } from '../ui/Badge';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  ExternalLink,
  ArrowRight,
  X,
  BookOpen,
  Save,
  Flame,
} from 'lucide-react';

interface MorningRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: MorningChecklistStep[];
  onToggleStep: (stepId: number) => void;
  onJumpToTab: (tabId: TabId) => void;
  streakDays: number;
}

export const MorningRoutineModal: React.FC<MorningRoutineModalProps> = ({
  isOpen,
  onClose,
  steps,
  onToggleStep,
  onJumpToTab,
  streakDays,
}) => {
  // 5-minute standard countdown (300 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [morningNotes, setMorningNotes] = useState<string>(() => {
    try {
      return localStorage.getItem('cryptoradar_morning_notes') || '';
    } catch {
      return '';
    }
  });
  const [savedNotesMsg, setSavedNotesMsg] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            soundManager.playChime('complete');
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const completedCount = steps.filter((s) => s.isCompleted).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  const handleStartTimer = () => {
    setIsRunning(true);
    soundManager.playChime('tick');
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(300);
  };

  const handleSaveNotes = () => {
    try {
      localStorage.setItem('cryptoradar_morning_notes', morningNotes);
    } catch {
      // Ignore private mode storage failure
    }
    soundManager.playChime('tick');
    setSavedNotesMsg(true);
    setTimeout(() => setSavedNotesMsg(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0d131f] border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-200">
        <div className="px-6 py-4 bg-[#070a10] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-base flex items-center gap-1.5">
                <Clock className="w-5 h-5 text-slate-400" />
                Quy Trình 5 Phút Quan Sát Mỗi Sáng
              </span>
              <div className="flex items-center gap-1 bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded border border-slate-700 font-mono-numbers">
                <Flame className="w-3.5 h-3.5 text-slate-400" />
                <span>Streak: {streakDays} ngày</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Từ bị động nghe tin tức sang chủ động quan sát số liệu trước khi bắt đầu ngày mới
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#0d131f] px-4 py-2 rounded-lg border border-slate-800">
            <span className="text-2xl font-bold font-mono-numbers text-slate-100 min-w-[70px]">
              {formattedTime}
            </span>
            <div className="flex items-center gap-1.5">
              {!isRunning ? (
                <button
                  onClick={handleStartTimer}
                  className="p-1.5 bg-slate-750 hover:bg-slate-700 text-emerald-400 rounded transition-colors border border-slate-700"
                  title="Bắt đầu đếm ngược 5 phút"
                >
                  <Play className="w-4 h-4 fill-emerald-400" />
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="p-1.5 bg-slate-750 hover:bg-slate-700 text-slate-200 rounded transition-colors border border-slate-700"
                  title="Tạm dừng"
                >
                  <Pause className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleResetTimer}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors border border-slate-700"
                title="Đặt lại 05:00"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="ml-2 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="w-full bg-slate-800 h-1.5">
          <div
            className="bg-slate-400 h-1.5 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="uppercase font-semibold tracking-wider">
                4 Bước Chuẩn Của Trader Chuyên Nghiệp ({completedCount}/{steps.length} hoàn thành)
              </span>
              <span>Thời lượng khuyến nghị: 5 Phút</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {steps.map((step) => {
                return (
                  <div
                    key={step.id}
                    className={`p-4 rounded-xl border transition-all ${
                      step.isCompleted
                        ? 'bg-[#070a10]/40 border-emerald-900/40 text-slate-300'
                        : 'bg-[#070a10]/80 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => {
                            onToggleStep(step.id);
                            soundManager.playChime(step.isCompleted ? 'tick' : 'complete');
                          }}
                          className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                          {step.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`text-sm font-semibold ${step.isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                              {step.title}
                            </h3>
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono-numbers">
                              {step.durationMinutes} phút
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {step.description}
                          </p>

                          <div className="mt-2.5 space-y-1">
                            {step.keyQuestions.map((q, qIdx) => (
                              <div key={qIdx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                                <span className="text-slate-500 font-mono">▸</span>
                                <span>{q}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            onJumpToTab(step.targetTab);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap shadow-sm"
                        >
                          <span>Xem Tab này</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        <a
                          href={step.toolUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                          title="Mở website chính thức"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-[#070a10]/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                Ghi Chú & Kế Hoạch Giao Dịch Sáng Nay
              </label>
              <div className="flex items-center gap-2">
                {savedNotesMsg && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Đã lưu
                  </span>
                )}
                <button
                  onClick={handleSaveNotes}
                  className="px-2.5 py-1 text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Save className="w-3 h-3 text-slate-400" />
                  Lưu ghi chú
                </button>
              </div>
            </div>
            <textarea
              rows={3}
              value={morningNotes}
              onChange={(e) => setMorningNotes(e.target.value)}
              placeholder="VD: Đêm qua ETF mua ròng +$423M rất mạnh. Tối nay 19:30 có CPI nên không vào lệnh Long đuổi gần cản $71.2K. Chờ cú quét thanh lý về $66.2K mới cân nhắc vào hàng..."
              className="w-full bg-[#0d131f] border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-500 font-sans leading-relaxed"
            />
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-[#070a10]/80 flex items-center justify-between text-xs text-slate-400">
          <span>Quy trình giúp loại bỏ 90% các quyết định cảm tính và FOMO theo tin tức giật gân.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-white text-slate-950 font-semibold rounded-lg text-xs transition-colors shadow-sm"
          >
            Đã Xong Buổi Sáng
          </button>
        </div>
      </div>
    </div>
  );
};
