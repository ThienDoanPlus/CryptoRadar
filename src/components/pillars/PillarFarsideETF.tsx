import React, { useState, useEffect, useCallback } from 'react';
import { fetchLiveEtfFlows, LiveEtfOverview } from '../../services/etfService';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ExternalLink, Clock, ArrowUpRight, TrendingUp, Radio, RefreshCw } from 'lucide-react';

interface PillarEtfProps {
  isCompact?: boolean;
}

export const PillarFarsideETF: React.FC<PillarEtfProps> = ({ isCompact = false }) => {
  const [assetType, setAssetType] = useState<'BTC' | 'ETH'>('BTC');
  const [etfData, setEtfData] = useState<LiveEtfOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadEtfData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchLiveEtfFlows();
      setEtfData(data);
    } catch (e) {
      console.warn('Failed to fetch live ETF data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEtfData();
    const interval = setInterval(loadEtfData, 60000);
    return () => clearInterval(interval);
  }, [loadEtfData]);

  const btcRows = etfData?.btcFlows || [];
  const ethRows = etfData?.ethFlows || [];

  const currentBtcNet = btcRows.length > 0 ? btcRows[btcRows.length - 1].totalNet : 0;
  const currentEthNet = ethRows.length > 0 ? ethRows[ethRows.length - 1].totalNet : 0;

  const totalBtcCumulative = btcRows.reduce((acc, cur) => acc + cur.totalNet, 0);

  return (
    <div className={isCompact ? 'space-y-3' : 'space-y-6'}>
      <Card isCompact={isCompact} className="border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="etf">TRỤ CỘT 3: THEO DÕI DÒNG TIỀN ETF PHỐ WALL HÀNG NGÀY</Badge>
              {etfData?.isLive && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <Radio className="w-3 h-3 text-emerald-400" />
                  Live Institutional API
                </span>
              )}
            </div>
            <h1 className={`font-bold text-white mt-1.5 ${isCompact ? 'text-base' : 'text-xl'}`}>
              Farside Investors: Dòng Vốn Ròng Spot Bitcoin & Ethereum ETF
            </h1>
            {!isCompact && (
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Biết chính xác hôm nay Phố Wall (BlackRock IBIT, Fidelity FBTC, Grayscale...) đang MUA RÒNG hay BÁN RÒNG. Dữ liệu liên tục cập nhật theo chu kỳ giao dịch các quỹ (Live API).
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadEtfData}
              disabled={isLoading}
              className="px-2.5 py-1.5 bg-[#070a10] hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              title="Làm mới dữ liệu ETF"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-slate-200' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Cập nhật</span>
            </button>

            <a
              href="https://farside.co.uk/btc/"
              target="_blank"
              rel="noreferrer noopener"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Mở Farside Investors</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAssetType('BTC')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                assetType === 'BTC'
                  ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                  : 'bg-[#090d16] text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              Bitcoin Spot ETF (BTC)
            </button>
            <button
              onClick={() => setAssetType('ETH')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                assetType === 'ETH'
                  ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                  : 'bg-[#090d16] text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              Ethereum Spot ETF (ETH)
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#070a10]/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              <strong>Giờ Vàng Cập Nhật:</strong> 04:00 - 05:00 Sáng VN (Ngay sau khi các quỹ chốt NAV)
            </span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#0d131f] border border-slate-800/80 rounded-xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Dòng Tiền Ròng Phiên Gần Nhất ({assetType})</span>
            <Badge tone="bullish">PHỐ WALL MUA RÒNG</Badge>
          </div>
          <div className="text-2xl font-bold font-mono-numbers mt-1.5 text-emerald-300 flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-emerald-300" />
            <span>+${assetType === 'BTC' ? currentBtcNet : currentEthNet}M USD</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {assetType === 'BTC'
              ? 'BlackRock IBIT dẫn đầu nhóm quỹ với dòng vốn ròng dương mạnh mẽ.'
              : 'BlackRock ETHA & Fidelity FETH dẫn đầu dòng vốn ròng Ethereum.'}
          </p>
        </div>

        <div className="p-4 bg-[#0d131f] border border-slate-800/80 rounded-xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Tổng Tích Lũy 7 Phiên Gần Nhất</span>
            <span className="text-[10px] text-slate-400 font-mono-numbers">Live Feed</span>
          </div>
          <div className="text-2xl font-bold font-mono-numbers mt-1.5 text-white">
            +${totalBtcCumulative.toFixed(1)}M USD
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Lực gom bền bỉ hấp thụ hoàn toàn nguồn cung từ thợ đào và người bán lẻ.
          </p>
        </div>

        <div className="p-4 bg-[#0d131f] border border-slate-800/80 rounded-xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Quy Tắc Đọc Dữ Liệu Nhanh</span>
            <Badge tone="neutral">1 Phút Mỗi Sáng</Badge>
          </div>
          <div className="mt-2 space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span><strong>Cột Tổng Màu XANH (+):</strong> Phố Wall bơm thêm vốn, xu hướng Uptrend bền.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span><strong>Cột Tổng Màu ĐỎ (-):</strong> Phố Wall xả chốt lời, đề phòng điều chỉnh ngắn hạn.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0d131f] border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-300" />
              Biểu Đồ Cột Dòng Tiền Ròng Hàng Ngày ($ Triệu USD)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              So sánh quy mô dòng vốn giữa các phiên giao dịch của Phố Wall
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono-numbers">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-600/80 rounded-sm" /> Mua ròng (Inflow)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-rose-600/80 rounded-sm" /> Bán ròng (Outflow)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 items-end h-40 pt-4 px-2 bg-[#070a10]/60 rounded-xl border border-slate-800">
          {(assetType === 'BTC' ? btcRows : ethRows).map((day) => {
            const isPos = day.totalNet >= 0;
            const maxVal = assetType === 'BTC' ? 650 : 200;
            const heightPercent = Math.min(100, Math.max(12, (Math.abs(day.totalNet) / maxVal) * 100));

            return (
              <div key={day.date} className="flex flex-col items-center h-full justify-end group">
                <span className={`text-[10px] font-mono-numbers font-semibold mb-1 opacity-80 group-hover:opacity-100 ${isPos ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {isPos ? `+${day.totalNet}` : day.totalNet}
                </span>
                <div
                  className={`w-full rounded-t transition-all group-hover:brightness-110 ${
                    isPos ? 'bg-emerald-600/80' : 'bg-rose-600/80'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[10px] text-slate-400 font-mono-numbers mt-1.5 truncate">
                  {day.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#0d131f] border border-slate-800/80 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">
              Bảng Tổng Hợp Chi Tiết Từng Quỹ Phát Hành (Đơn vị: $ Triệu USD)
            </h3>
            <p className="text-xs text-slate-400">
              IBIT (BlackRock) · FBTC (Fidelity) · BITB (Bitwise) · ARKB (ARK) · GBTC (Grayscale)
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono-numbers">Nguồn: Farside / Live Treasury</span>
        </div>

        <div className="overflow-x-auto">
          {assetType === 'BTC' ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2 font-medium">Ngày</th>
                  <th className="pb-2 font-medium text-right">IBIT (BlackRock)</th>
                  <th className="pb-2 font-medium text-right">FBTC (Fidelity)</th>
                  <th className="pb-2 font-medium text-right">BITB (Bitwise)</th>
                  <th className="pb-2 font-medium text-right">ARKB (ARK)</th>
                  <th className="pb-2 font-medium text-right">GBTC (Grayscale)</th>
                  <th className="pb-2 font-medium text-right font-bold text-white">TỔNG NET FLOW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                {btcRows.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-sans font-semibold text-white">
                      {row.date} <span className="text-slate-500 font-normal text-[11px]">({row.dayOfWeek})</span>
                    </td>
                    <td className="py-2.5 text-right text-emerald-400">+{row.ibit}</td>
                    <td className="py-2.5 text-right text-emerald-400">+{row.fbtc}</td>
                    <td className="py-2.5 text-right text-slate-300">+{row.bitb}</td>
                    <td className={`py-2.5 text-right ${row.arkb >= 0 ? 'text-slate-300' : 'text-rose-400'}`}>
                      {row.arkb >= 0 ? `+${row.arkb}` : row.arkb}
                    </td>
                    <td className="py-2.5 text-right text-rose-400">{row.gbtc}</td>
                    <td className={`py-2.5 text-right font-bold text-sm ${row.totalNet >= 0 ? 'text-emerald-400 bg-emerald-950/20' : 'text-rose-400 bg-rose-950/20'}`}>
                      {row.totalNet >= 0 ? `+${row.totalNet}` : row.totalNet}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2 font-medium">Ngày</th>
                  <th className="pb-2 font-medium text-right">ETHA (BlackRock)</th>
                  <th className="pb-2 font-medium text-right">FETH (Fidelity)</th>
                  <th className="pb-2 font-medium text-right">ETHW (Bitwise)</th>
                  <th className="pb-2 font-medium text-right">ETHE (Grayscale)</th>
                  <th className="pb-2 font-medium text-right font-bold text-white">TỔNG NET FLOW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                {ethRows.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-sans font-semibold text-white">
                      {row.date} <span className="text-slate-500 font-normal text-[11px]">({row.dayOfWeek})</span>
                    </td>
                    <td className="py-2.5 text-right text-emerald-400">+{row.etha}</td>
                    <td className="py-2.5 text-right text-emerald-400">+{row.feth}</td>
                    <td className="py-2.5 text-right text-slate-300">+{row.ethw}</td>
                    <td className="py-2.5 text-right text-rose-400">{row.ethe}</td>
                    <td className={`py-2.5 text-right font-bold text-sm ${row.totalNet >= 0 ? 'text-emerald-400 bg-emerald-950/20' : 'text-rose-400 bg-rose-950/20'}`}>
                      {row.totalNet >= 0 ? `+${row.totalNet}` : row.totalNet}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
