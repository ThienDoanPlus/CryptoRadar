import React from 'react';
import { TabId } from '../../types/cryptoRadar';
import { MAIN_NAV_ITEMS } from '../../constants/navigation';
import { Bell, Clock, Compass, Minimize2, Maximize2, Database } from 'lucide-react';

interface NavbarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onOpenRoutine: () => void;
  onOpenAlerts: () => void;
  onOpenPortals: () => void;
  onOpenDataSources: () => void;
  onOpenTidbHistory?: () => void;
  activeAlertCount: number;
  isCompactMode: boolean;
  onToggleCompactMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenRoutine,
  onOpenAlerts,
  onOpenPortals,
  onOpenDataSources,
  onOpenTidbHistory,
  activeAlertCount,
  isCompactMode,
  onToggleCompactMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800 text-slate-200 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-3">
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onSelectTab('overview')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs shadow-sm">
                CR
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold tracking-tight text-white group-hover:text-slate-200 transition-colors whitespace-nowrap">
                  CryptoRadar Pro
                </span>
                <span className="hidden md:inline-block text-[11px] text-slate-400 font-mono-numbers">
                  5 Trụ Cột Quan Sát
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onToggleCompactMode}
              title={isCompactMode ? 'Chuyển sang chế độ Tiêu chuẩn' : 'Chuyển sang chế độ Compact (Thu gọn để hiển thị nhiều dữ liệu hơn)'}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg transition-colors border ${
                isCompactMode
                  ? 'bg-slate-800 text-slate-200 border-slate-600 font-medium'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-850 hover:bg-slate-800 border-slate-800'
              }`}
            >
              {isCompactMode ? <Maximize2 className="w-3.5 h-3.5 text-slate-300" /> : <Minimize2 className="w-3.5 h-3.5" />}
              <span className="text-[11px] whitespace-nowrap">{isCompactMode ? 'Compact: Bật' : 'Compact'}</span>
            </button>

            <button
              onClick={onOpenDataSources}
              title="Xem chi tiết kết nối API Binance & Coinbase"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] whitespace-nowrap">Nguồn API</span>
            </button>

            {onOpenTidbHistory && (
              <button
                onClick={onOpenTidbHistory}
                title="Xem lịch sử tín hiệu lưu trong cơ sở dữ liệu TiDB Cloud Serverless"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] whitespace-nowrap hidden sm:inline">TiDB Cloud</span>
              </button>
            )}

            <button
              onClick={onOpenPortals}
              title="Danh bạ 5 Công cụ Miễn phí Chính thức"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-800"
            >
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] whitespace-nowrap">Link 5 Sàn</span>
            </button>

            <button
              onClick={onOpenAlerts}
              title="Trung tâm thiết lập cảnh báo Âm thanh & Trình duyệt"
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-slate-850 hover:bg-slate-800 text-slate-200 rounded-lg transition-colors border border-slate-800"
            >
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] whitespace-nowrap hidden sm:inline">Cảnh Báo</span>
              {activeAlertCount > 0 && (
                <span className="bg-slate-700 text-slate-200 font-mono-numbers font-semibold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {activeAlertCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenRoutine}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg shadow-sm transition-all active:scale-95"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] sm:text-xs whitespace-nowrap">Quy Trình 5 Phút</span>
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 border-t border-slate-800/60">
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-transparent'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
