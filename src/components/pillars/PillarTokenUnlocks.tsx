import React, { useState, useEffect, useCallback } from 'react';
import { fetchLiveTokenUnlocks } from '../../services/tokenUnlocksService';
import { TokenUnlock } from '../../types/cryptoRadar';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ExternalLink, AlertTriangle, Search, Bell, Radio, RefreshCw } from 'lucide-react';

interface PillarUnlocksProps {
  onOpenAlerts: () => void;
  isCompact?: boolean;
}

export const PillarTokenUnlocks: React.FC<PillarUnlocksProps> = ({ onOpenAlerts, isCompact = false }) => {
  const [unlocks, setUnlocks] = useState<TokenUnlock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'critical' | 'high'>('all');

  const loadUnlocksData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchLiveTokenUnlocks();
      if (data.length > 0) {
        setUnlocks(data);
        setIsLive(true);
      }
    } catch (e) {
      console.warn('Failed to load live token unlocks:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUnlocksData();
    const interval = setInterval(loadUnlocksData, 60000);
    return () => clearInterval(interval);
  }, [loadUnlocksData]);

  const filteredUnlocks = unlocks.filter((token) => {
    const matchesSearch =
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterRisk === 'critical') return token.riskLevel.includes('CRITICAL');
    if (filterRisk === 'high') return token.riskLevel.includes('CRITICAL') || token.riskLevel.includes('HIGH');
    return true;
  });

  return (
    <div className={isCompact ? 'space-y-3' : 'space-y-6'}>
      <Card isCompact={isCompact} className="border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="warning">TRỤ CỘT 5: LỊCH MỞ KHÓA TOKEN (TOKEN.UNLOCKS & DEFILLAMA)</Badge>
              {isLive && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <Radio className="w-3 h-3 text-emerald-400" />
                  CoinGecko Token Markets Live
                </span>
              )}
            </div>
            <h1 className={`font-bold text-white mt-1.5 ${isCompact ? 'text-base' : 'text-xl'}`}>
              Lịch Cliff Unlock & Cảnh Báo Xả Hàng Altcoin Khổng Lồ
            </h1>
            {!isCompact && (
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Tránh đu đỉnh các Altcoin sắp bị quỹ đầu tư (VCs) và dự án xả hàng. Dữ liệu cung lưu hành, tổng cung và định giá được truy vấn trực tiếp từ CoinGecko Live API.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadUnlocksData}
              disabled={isLoading}
              className="px-2.5 py-1.5 bg-[#070a10] hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              title="Làm mới dữ liệu Token"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-slate-200' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Cập nhật</span>
            </button>

            <button
              onClick={onOpenAlerts}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              <span>Cài Cảnh Báo Token</span>
            </button>
            <a
              href="https://token.unlocks.app/"
              target="_blank"
              rel="noreferrer noopener"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Token Unlocks</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-900 border border-slate-700/80 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong>Bài học thực tế từ các đợt mở khóa lớn:</strong> Khi một đồng coin mở khóa lượng lớn cho VCs và Đội ngũ (trên 3% - 5% tổng cung), giá thường sụt giảm từ 15% - 40% trong những tuần trước và sau ngày mở khóa. Luôn kiểm tra lịch Cliff Unlock trước khi quyết định mua giữ bất kỳ Altcoin nào!
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d131f] p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã token (TIA, ARB, SUI, OP, APT...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#070a10] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Lọc theo rủi ro:</span>
          <button
            onClick={() => setFilterRisk('all')}
            className={`px-2.5 py-1 text-xs rounded-lg transition-all border ${
              filterRisk === 'all'
                ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                : 'bg-[#090d16] text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterRisk('critical')}
            className={`px-2.5 py-1 text-xs rounded-lg transition-all border ${
              filterRisk === 'critical'
                ? 'bg-slate-800 text-rose-300 border-slate-600 shadow-sm'
                : 'bg-[#090d16] text-slate-400 hover:text-rose-300 border-slate-800'
            }`}
          >
            🚨 Nguy hiểm (&gt;5% cung)
          </button>
          <button
            onClick={() => setFilterRisk('high')}
            className={`px-2.5 py-1 text-xs rounded-lg transition-all border ${
              filterRisk === 'high'
                ? 'bg-slate-800 text-amber-200 border-slate-600 shadow-sm'
                : 'bg-[#090d16] text-slate-400 hover:text-amber-200 border-slate-800'
            }`}
          >
            ⚠️ Cảnh báo (&gt;3% cung)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUnlocks.map((token) => {
          const isCritical = token.riskLevel.includes('CRITICAL');
          const isHigh = token.riskLevel.includes('HIGH');

          return (
            <div
              key={token.id}
              className={`p-5 rounded-xl border transition-all ${
                isCritical
                  ? 'bg-[#18131d] border-rose-800/60 shadow-sm'
                  : isHigh
                  ? 'bg-[#141824] border-amber-700/60'
                  : 'bg-[#0d131f] border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white font-mono-numbers">
                      ${token.symbol}
                    </span>
                    <span className="text-xs text-slate-400">({token.name})</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-300 font-mono-numbers">
                      {token.unlockType} Unlock
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 font-mono-numbers">
                    <span>Ngày mở: {token.unlockDate}</span>
                    <span>·</span>
                    <span className="text-slate-300 font-semibold">Còn {token.daysRemaining} ngày</span>
                  </div>
                </div>

                <Badge tone={isCritical ? 'bearish' : isHigh ? 'warning' : 'neutral'}>
                  {token.riskLevel}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-[#070a10]/70 rounded-lg border border-slate-800/80 my-3 font-mono-numbers text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Giá Trị USD</span>
                  <span className="text-sm font-bold text-slate-100">
                    ${token.unlockedValueUsdMillion}M
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">% Cung Lưu Hành</span>
                  <span className={`text-sm font-bold ${token.percentOfCirculating > 10 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {token.percentOfCirculating}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">% Tổng Cung</span>
                  <span className="text-sm font-bold text-slate-200">
                    {token.percentOfTotalSupply}%
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 p-2.5 bg-[#0d131f]/60 rounded-lg border border-slate-800/80 leading-relaxed mb-3">
                {token.warningNote}
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Cơ Cấu Nhóm Nhận Token:
                </span>
                <div className="space-y-1">
                  {token.allocations.map((alloc, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-0.5 text-slate-300">
                      <span className="truncate pr-2">{alloc.category}</span>
                      <span className="font-mono-numbers text-slate-400 shrink-0">
                        {alloc.percent}% (${alloc.valueMillion}M)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
