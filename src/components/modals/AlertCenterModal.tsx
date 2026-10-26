import React, { useState } from 'react';
import { CustomMacroAlert, CustomTokenUnlockAlert } from '../../types/cryptoRadar';
import { soundManager, requestBrowserNotificationPermission, dispatchSystemNotification } from '../../services/alertService';
import { Badge } from '../ui/Badge';
import { Bell, X, Plus, Trash2, Volume2, Globe, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AlertCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  macroAlerts: CustomMacroAlert[];
  onSaveMacroAlerts: (alerts: CustomMacroAlert[]) => void;
  unlockAlerts: CustomTokenUnlockAlert[];
  onSaveUnlockAlerts: (alerts: CustomTokenUnlockAlert[]) => void;
}

export const AlertCenterModal: React.FC<AlertCenterModalProps> = ({
  isOpen,
  onClose,
  macroAlerts,
  onSaveMacroAlerts,
  unlockAlerts,
  onSaveUnlockAlerts,
}) => {
  const [activeTab, setActiveTab] = useState<'macro' | 'unlocks'>('macro');

  const [macroEvent, setMacroEvent] = useState('CPI (Lạm phát Mỹ)');
  const [macroLeadTime, setMacroLeadTime] = useState<number>(15);
  const [macroSound, setMacroSound] = useState(true);
  const [macroBrowser, setMacroBrowser] = useState(false);

  const [unlockSymbol, setUnlockSymbol] = useState('');
  const [unlockMinPercent, setUnlockMinPercent] = useState<number>(3);
  const [unlockMinUsd] = useState<number>(50);
  const [unlockDaysBefore, setUnlockDaysBefore] = useState<number>(3);
  const [unlockSound, setUnlockSound] = useState(true);
  const [unlockBrowser, setUnlockBrowser] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleTestMacroSound = () => {
    soundManager.playChime('macro');
    showFeedback('Đã phát âm thanh thử nghiệm: Chuông Báo Tin Vĩ Mô');
  };

  const handleTestUnlockSound = () => {
    soundManager.playChime('unlock');
    showFeedback('Đã phát âm thanh thử nghiệm: Cảnh Báo Xả Hàng Token Unlock');
  };

  const handleRequestBrowserPermission = async () => {
    const granted = await requestBrowserNotificationPermission();
    if (granted) {
      dispatchSystemNotification('CryptoRadar Pro', 'Thông báo đẩy trình duyệt đã sẵn sàng hoạt động!');
      showFeedback('Trình duyệt đã cấp quyền thông báo thành công!');
    } else {
      showFeedback('Trình duyệt từ chối quyền hoặc chưa được hỗ trợ.');
    }
  };

  const handleAddMacroAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!macroEvent.trim()) return;

    const newAlert: CustomMacroAlert = {
      id: `macro-${Date.now()}`,
      eventType: macroEvent.trim(),
      leadTimeMinutes: Number(macroLeadTime),
      soundEnabled: macroSound,
      notifyBrowser: macroBrowser,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    onSaveMacroAlerts([newAlert, ...macroAlerts]);
    soundManager.playChime('tick');
    showFeedback(`Đã thêm cảnh báo vĩ mô: ${newAlert.eventType} (${newAlert.leadTimeMinutes === 0 ? 'Đúng giờ tin ra' : `Trước ${newAlert.leadTimeMinutes} phút`})`);
  };

  const handleDeleteMacroAlert = (id: string) => {
    onSaveMacroAlerts(macroAlerts.filter((a) => a.id !== id));
  };

  const handleToggleMacroAlert = (id: string) => {
    onSaveMacroAlerts(
      macroAlerts.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleAddUnlockAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockSymbol.trim()) return;

    const newAlert: CustomTokenUnlockAlert = {
      id: `unlock-${Date.now()}`,
      symbol: unlockSymbol.trim().toUpperCase(),
      minUnlockPercentage: Number(unlockMinPercent),
      minUsdValueMillion: Number(unlockMinUsd),
      notifyDaysBefore: Number(unlockDaysBefore),
      soundEnabled: unlockSound,
      notifyBrowser: unlockBrowser,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    onSaveUnlockAlerts([newAlert, ...unlockAlerts]);
    setUnlockSymbol('');
    soundManager.playChime('tick');
    showFeedback(`Đã thiết lập cảnh báo mở khóa cho $${newAlert.symbol} (Trước ${newAlert.notifyDaysBefore} ngày)`);
  };

  const handleDeleteUnlockAlert = (id: string) => {
    onSaveUnlockAlerts(unlockAlerts.filter((a) => a.id !== id));
  };

  const handleToggleUnlockAlert = (id: string) => {
    onSaveUnlockAlerts(
      unlockAlerts.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0d131f] border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070a10]/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Trung Tâm Cảnh Báo Chủ Động
              </h2>
              <p className="text-xs text-slate-400">
                Tự động thông báo trước giờ tin Vĩ mô (ForexFactory) & Lịch xả Token (Token.unlocks)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-[#090e17]">
          <button
            onClick={() => setActiveTab('macro')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'macro'
                ? 'border-slate-300 text-white bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ⏰ Cảnh Báo Tin Vĩ Mô ({macroAlerts.filter((a) => a.isActive).length} đang bật)
          </button>
          <button
            onClick={() => setActiveTab('unlocks')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'unlocks'
                ? 'border-slate-300 text-white bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🔓 Cảnh Báo Token Unlocks ({unlockAlerts.filter((a) => a.isActive).length} đang bật)
          </button>
        </div>

        {feedbackMsg && (
          <div className="px-6 py-2 bg-emerald-950/40 border-b border-emerald-800/40 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5" />
              <span>{feedbackMsg}</span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'macro' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#070a10]/60 border border-slate-700/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    + Thêm Cảnh Báo Tin Tức Mới
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestMacroSound}
                      className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 bg-slate-700/60 px-2 py-1 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <Volume2 className="w-3 h-3 text-slate-400" />
                      Test chuông
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestBrowserPermission}
                      className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 bg-slate-700/60 px-2 py-1 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <Globe className="w-3 h-3 text-slate-400" />
                      Cấp quyền Browser
                    </button>
                  </div>
                </div>

                <form onSubmit={handleAddMacroAlert} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-5">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Loại Tin Tức (ForexFactory Thẻ Đỏ)
                    </label>
                    <select
                      value={macroEvent}
                      onChange={(e) => setMacroEvent(e.target.value)}
                      className="w-full bg-[#0d131f] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-slate-500"
                    >
                      <option value="CPI (Lạm phát Mỹ)">CPI (Lạm phát Mỹ m/m & y/y)</option>
                      <option value="FOMC (Lãi suất Fed & Họp báo Powell)">FOMC (Quyết định Lãi suất Fed)</option>
                      <option value="Non-Farm Payrolls (NFP)">Non-Farm Payrolls (Việc làm NFP)</option>
                      <option value="PPI (Chỉ số Giá Sản xuất)">PPI (Giá Sản xuất MoM)</option>
                      <option value="Core Retail Sales (Doanh số Bán lẻ)">Core Retail Sales (Doanh số Bán lẻ)</option>
                      <option value="Prelim GDP (Tăng trưởng GDP)">Prelim GDP (Tăng trưởng GDP)</option>
                      <option value="Tất cả tin Thẻ Đỏ trong ngày">Tất cả tin Thẻ Đỏ trong ngày</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Thời Gian Nhận Thông Báo
                    </label>
                    <select
                      value={macroLeadTime}
                      onChange={(e) => setMacroLeadTime(Number(e.target.value))}
                      className="w-full bg-[#0d131f] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-slate-500"
                    >
                      <option value={0}>Đúng giây tin ra (0 phút)</option>
                      <option value={5}>Trước 5 phút</option>
                      <option value={15}>Trước 15 phút (Khuyên dùng)</option>
                      <option value={30}>Trước 30 phút</option>
                      <option value={60}>Trước 1 giờ</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={macroSound}
                        onChange={(e) => setMacroSound(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-slate-500 focus:ring-0"
                      />
                      Âm thanh
                    </label>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={macroBrowser}
                        onChange={(e) => setMacroBrowser(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-slate-500 focus:ring-0"
                      />
                      Browser
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-slate-100 hover:bg-white text-slate-950 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Lưu Báo Giờ
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Danh sách sự kiện đang theo dõi ({macroAlerts.length})</span>
                  <span>Trạng thái</span>
                </div>

                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-[#070a10]/40">
                  {macroAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={alert.isActive}
                          onChange={() => handleToggleMacroAlert(alert.id)}
                          className="rounded bg-slate-900 border-slate-700 text-slate-500 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold ${alert.isActive ? 'text-white' : 'text-slate-500 line-through'}`}>
                              {alert.eventType}
                            </span>
                            <Badge tone="bearish">THẺ ĐỎ</Badge>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>
                              Báo: {alert.leadTimeMinutes === 0 ? 'Ngay khi tin ra' : `Trước ${alert.leadTimeMinutes} phút`}
                            </span>
                            <span>·</span>
                            <span>{alert.soundEnabled ? '🔊 Chuông bật' : '🔇 Chuông tắt'}</span>
                            {alert.notifyBrowser && (
                              <>
                                <span>·</span>
                                <span className="text-slate-400">🌐 Push</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteMacroAlert(alert.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
                        title="Xóa cảnh báo này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'unlocks' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#070a10]/60 border border-slate-700/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    + Thêm Cảnh Báo Mở Khóa Token (Token.unlocks)
                  </h3>
                  <button
                    type="button"
                    onClick={handleTestUnlockSound}
                    className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 bg-slate-700/60 px-2 py-1 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <Volume2 className="w-3 h-3 text-slate-400" />
                    Test âm thanh xả hàng
                  </button>
                </div>

                <form onSubmit={handleAddUnlockAlert} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-3">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Mã Token (VD: TIA, ARB, SUI)
                    </label>
                    <input
                      type="text"
                      placeholder="TIA, ARB, SUI..."
                      value={unlockSymbol}
                      onChange={(e) => setUnlockSymbol(e.target.value)}
                      className="w-full bg-[#0d131f] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-slate-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Ngưỡng Xả Cảnh Báo
                    </label>
                    <select
                      value={unlockMinPercent}
                      onChange={(e) => setUnlockMinPercent(Number(e.target.value))}
                      className="w-full bg-[#0d131f] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-slate-500"
                    >
                      <option value={3}>Unlock &gt; 3% Tổng Cung (Khuyên dùng)</option>
                      <option value={5}>Unlock &gt; 5% Tổng Cung (Cực nguy hiểm)</option>
                      <option value={1}>Mọi đợt Cliff unlock (&gt; 1%)</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Báo Trước Bao Lâu?
                    </label>
                    <select
                      value={unlockDaysBefore}
                      onChange={(e) => setUnlockDaysBefore(Number(e.target.value))}
                      className="w-full bg-[#0d131f] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-slate-500"
                    >
                      <option value={1}>Trước 1 ngày (24 giờ)</option>
                      <option value={3}>Trước 3 ngày (Khuyên dùng để né)</option>
                      <option value={7}>Trước 7 ngày (1 tuần)</option>
                      <option value={14}>Trước 14 ngày</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      className="w-full bg-slate-100 hover:bg-white text-slate-950 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Lưu Cảnh Báo
                    </button>
                  </div>
                </form>

                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                  <span>
                    <strong>Quy tắc né xả hàng chuyên nghiệp:</strong> Bất cứ khi nào một đồng coin có đợt Cliff Unlock &gt; 3% - 5% tổng cung (như vụ $156M token $XPL hay đợt mở khóa TIA), nhà đầu tư VCs có xu hướng bán Spot hoặc Hedging Short trên sàn phái sinh trước ngày mở khóa. Hãy né xa hoặc canh Short!
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Tokens đang được canh chừng ({unlockAlerts.length})</span>
                  <span>Hành động</span>
                </div>

                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-[#070a10]/40">
                  {unlockAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={alert.isActive}
                          onChange={() => handleToggleUnlockAlert(alert.id)}
                          className="rounded bg-slate-900 border-slate-700 text-slate-500 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold font-mono-numbers ${alert.isActive ? 'text-slate-100' : 'text-slate-500 line-through'}`}>
                              ${alert.symbol}
                            </span>
                            <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-mono-numbers">
                              Ngưỡng: &gt;{alert.minUnlockPercentage}% cung
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Báo trước: {alert.notifyDaysBefore} ngày</span>
                            <span>·</span>
                            <span>{alert.soundEnabled ? '🔊 Chuông cảnh báo' : '🔇 Tắt chuông'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteUnlockAlert(alert.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
                        title="Xóa cảnh báo token này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-[#070a10]/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dữ liệu cấu hình tự động lưu trữ an toàn trên trình duyệt (LocalStorage)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
