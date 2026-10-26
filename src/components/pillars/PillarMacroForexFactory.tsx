import React, { useState, useEffect } from 'react';
import { MacroEvent } from '../../types/cryptoRadar';
import { fetchLiveMacroEvents } from '../../services/macroService';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ExternalLink, Bell, RefreshCw, Radio } from 'lucide-react';

interface PillarMacroProps {
  onOpenAlerts: () => void;
  isCompact?: boolean;
}

export const PillarMacroForexFactory: React.FC<PillarMacroProps> = ({ onOpenAlerts, isCompact = false }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [filterImpact, setFilterImpact] = useState<'all' | 'high'>('high');
  const [events, setEvents] = useState<MacroEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLiveMacroEvents();
      if (data && data.length > 0) {
        setEvents(data);
      }
    } catch (err) {
      console.warn('Macro fetch error:', err);
    } finally {
      setIsLoading(false);
      setLastRefreshed(new Date().toLocaleTimeString('vi-VN', { hour12: false }));
    }
  };

  useEffect(() => {
    loadData();
    const refreshInterval = setInterval(loadData, 60000); // 1 minute auto-refresh
    return () => clearInterval(refreshInterval);
  }, []);

  // Precision 1-second interval to synchronize countdown with release timestamps
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateTimeRemaining = (targetTimeStr: string) => {
    const target = new Date(targetTimeStr).getTime();
    const diff = target - currentTime.getTime();

    if (diff <= 0) return { expired: true, text: 'Đã phát hành' };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      expired: false,
      hours,
      minutes,
      seconds,
      text: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    };
  };

  const nextUpcoming = events.find((e) => !e.hasPassed) || events[0];
  const nextRemaining = nextUpcoming ? calculateTimeRemaining(nextUpcoming.scheduledTime) : { expired: false, text: '--:--:--' };

  const filteredEvents = events.filter((e) => {
    if (filterImpact === 'high') return e.impact === 'high';
    return true;
  });

  return (
    <div className={isCompact ? 'space-y-3' : 'space-y-6'}>
      <Card isCompact={isCompact} className="border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="bearish">TRỤ CỘT 4: LỊCH TIN TỨC VĨ MÔ CHÍNH XÁC TỪNG GIÂY</Badge>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono-numbers">
                <Radio className="w-3 h-3 text-emerald-500" />
                ForexFactory Live API ({events.length} sự kiện)
              </span>
            </div>
            <h1 className={`font-bold text-white mt-1.5 ${isCompact ? 'text-base' : 'text-xl'}`}>
              ForexFactory: Bộ Lọc Thẻ Màu ĐỎ (High Impact Tuần Này)
            </h1>
            {!isCompact && (
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Dữ liệu JSON lấy trực tiếp từ máy chủ lịch kinh tế ForexFactory. Chuẩn múi giờ Việt Nam (GMT+7) với đồng hồ đếm ngược từng giây đến thời điểm công bố.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
              title="Cập nhật tin tức mới nhất từ ForexFactory"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onOpenAlerts}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              <span>Tùy Chỉnh Báo Giờ</span>
            </button>
            <a
              href="https://www.forexfactory.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>ForexFactory</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800/80">
          <div className="p-3 bg-[#070a10] rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400">Giờ Hiện Tại (Múi Giờ VN GMT+7):</span>
              <div className="text-lg font-bold font-mono-numbers text-white mt-0.5">
                {currentTime.toLocaleTimeString('vi-VN', { hour12: false })} · {currentTime.toLocaleDateString('vi-VN')}
              </div>
            </div>
            <div className="text-right">
              <Badge tone="neutral">ĐỒNG BỘ 100% API</Badge>
              {lastRefreshed && (
                <div className="text-[10px] text-slate-400 font-mono-numbers mt-1">Cập nhật: {lastRefreshed}</div>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-700/80 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-300 font-semibold uppercase">
                ⚡ Đếm Ngược Đến Tin Kế Tiếp: {nextUpcoming ? nextUpcoming.title.split('(')[0] : 'Đang tải...'}
              </span>
              <div className="text-xl font-bold font-mono-numbers text-slate-100 mt-0.5">
                {nextRemaining.text}
              </div>
            </div>
            {nextUpcoming && (
              <span className="text-xs text-rose-300 font-mono-numbers bg-rose-950/60 border border-rose-900/60 px-2 py-1 rounded-lg font-medium">
                {nextUpcoming.timeDisplayVn}
              </span>
            )}
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d131f] p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Bộ lọc mức độ tác động:</span>
          <button
            onClick={() => setFilterImpact('high')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
              filterImpact === 'high'
                ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                : 'bg-[#090d16] text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            Chỉ Tin Thẻ ĐỎ (High Impact)
          </button>
          <button
            onClick={() => setFilterImpact('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
              filterImpact === 'all'
                ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                : 'bg-[#090d16] text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            Tất Cả ({events.length})
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Hiển thị <strong>{filteredEvents.length}</strong> sự kiện trực tiếp từ ForexFactory
        </div>
      </div>

      <div className="space-y-3">
        {isLoading && events.length === 0 ? (
          <div className="p-8 text-center bg-[#0d131f] border border-slate-800 rounded-xl text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-300" />
            Đang tải dữ liệu lịch vĩ mô trực tiếp từ ForexFactory API...
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const timeData = calculateTimeRemaining(evt.scheduledTime);

            return (
              <div
                key={evt.id}
                className={`p-4 rounded-xl border transition-all ${
                  evt.hasPassed
                    ? 'bg-[#070a10]/50 border-slate-800/80 opacity-75'
                    : 'bg-[#0d131f] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{evt.flag}</span>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-300">
                          [{evt.country}]
                        </span>
                        <h3 className={`text-sm font-bold ${evt.hasPassed ? 'text-slate-300' : 'text-white'}`}>
                          {evt.title}
                        </h3>
                        <Badge tone={evt.impact === 'high' ? 'bearish' : 'warning'}>
                          {evt.impact === 'high' ? 'THẺ ĐỎ' : 'THẺ CAM'}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="text-[11px] text-slate-300 mt-1.5">
                        ▸ <strong>Tác động thị trường:</strong> {evt.marketImpactGuide}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 self-end lg:self-center shrink-0">
                    <div className="text-right text-xs space-y-0.5 font-mono-numbers">
                      <div className="text-slate-400">
                        Dự báo: <strong className="text-white">{evt.forecast}</strong>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Trước đó: {evt.previous}
                      </div>
                    </div>

                    <div className="p-2.5 bg-[#0d131f] rounded-lg border border-slate-800 text-center min-w-[90px]">
                      <span className="text-[10px] text-slate-400 uppercase block">Thực Tế</span>
                      <div className="text-sm font-bold font-mono-numbers mt-0.5">
                        {evt.actual ? (
                          <span className="text-emerald-400">{evt.actual}</span>
                        ) : (
                          <span className="text-slate-500 italic">Chờ ra tin</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <div className="text-[10px] text-slate-400">{evt.timeDisplayVn}</div>
                      <div className={`text-xs font-bold font-mono-numbers mt-0.5 ${evt.hasPassed ? 'text-slate-500' : 'text-slate-200'}`}>
                        {timeData.text}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
