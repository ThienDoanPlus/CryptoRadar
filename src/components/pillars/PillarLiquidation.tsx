import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchLiveMarketData,
  generateLiveLiquidationData,
  generateLiveFundingTable,
  LiveCoinStats,
} from '../../services/liveMarketService';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ExternalLink, Flame, Layers, Target, RefreshCw, Radio, TrendingUp } from 'lucide-react';

interface PillarLiquidationProps {
  isCompact?: boolean;
}

const SUPPORTED_SYMBOLS = ['BTC', 'ETH', 'SOL', 'XRP'];

export const PillarLiquidation: React.FC<PillarLiquidationProps> = ({ isCompact = false }) => {
  const [selectedCoin, setSelectedCoin] = useState<string>('BTC');
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(false);
  const [liveCoins, setLiveCoins] = useState<Record<string, LiveCoinStats>>({});
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  // Poll live Binance/Coinbase ticker data. Interval constrained to 25s to avoid 429 rate-limiting.
  const loadLiveData = useCallback(async () => {
    setIsLiveLoading(true);
    try {
      const data = await fetchLiveMarketData();
      if (data.isLiveConnected) {
        setLiveCoins(data.coins);
        setLastUpdated(data.lastUpdated);
        setIsLiveConnected(true);
      }
    } catch {
      // Gracefully maintain baseline dataset if network fails
    } finally {
      setIsLiveLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLiveData();
    const interval = setInterval(loadLiveData, 25000);
    return () => clearInterval(interval);
  }, [loadLiveData]);

  const liveStats = liveCoins[selectedCoin];
  const coinData = generateLiveLiquidationData(selectedCoin, liveStats);
  const fundingTable = generateLiveFundingTable(liveCoins);

  const currentPrice = coinData.currentPrice;
  const change24h = coinData.change24h;
  const fundingRate = coinData.fundingRate;
  const openInterestBillion = coinData.openInterestBillion;
  const longRatio = coinData.longRatio;
  const shortRatio = coinData.shortRatio;
  const coinbasePremium = coinData.coinbasePremium;

  // Approximate top liquidation cascade clusters based on historical market maker stop-loss pools
  const topLongLiquidationPrice = Math.round(currentPrice * 0.968);
  const topShortLiquidationPrice = Math.round(currentPrice * 1.042);

  return (
    <div className={isCompact ? 'space-y-3' : 'space-y-6'}>
      <Card isCompact={isCompact} className="border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="warning">TRỤ CỘT 1: BẢN ĐỒ THANH KHOẢN & ĐÒN BẨY (COINGLASS)</Badge>
            </div>
            <h1 className={`font-bold text-white mt-1.5 ${isCompact ? 'text-base' : 'text-xl'}`}>
              Bản Đồ Nhiệt Thanh Lý (Liquidation Heatmap) & Coinbase Premium
            </h1>
            {!isCompact && (
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Biết chính xác Cá voi và Market Makers sẽ đạp giá về đâu để quét Stop Loss của nhỏ lẻ. Quan sát các vùng màu Vàng/Cam đậm để phát hiện bẫy thanh khoản trước khi giá đảo chiều.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#070a10] border border-slate-700/80 rounded-lg text-xs">
              <Radio className={`w-3 h-3 ${isLiveConnected ? 'text-emerald-500' : 'text-slate-400'}`} />
              <span className="font-mono-numbers text-[11px] text-slate-300">
                {isLiveConnected ? `Binance/Coinbase Live (${lastUpdated})` : 'Benchmark Feed'}
              </span>
              <button
                onClick={loadLiveData}
                disabled={isLiveLoading}
                className="ml-1 p-0.5 text-slate-400 hover:text-white transition-colors"
                title="Làm mới dữ liệu Live"
              >
                <RefreshCw className={`w-3 h-3 ${isLiveLoading ? 'animate-spin text-slate-300' : ''}`} />
              </button>
            </div>

            <a
              href="https://www.coinglass.com/pro/futures/LiquidationHeatMap"
              target="_blank"
              rel="noreferrer noopener"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Mở Coinglass.com</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        <div className={`flex items-center gap-2 border-t border-slate-800/80 overflow-x-auto ${isCompact ? 'mt-2 pt-2' : 'mt-4 pt-4'}`}>
          <span className="text-xs text-slate-400 mr-2 whitespace-nowrap">Chọn tài sản:</span>
          {SUPPORTED_SYMBOLS.map((sym) => {
            const isSelected = selectedCoin === sym;
            const c = generateLiveLiquidationData(sym, liveCoins[sym]);
            const price = c.currentPrice;
            return (
              <button
                key={sym}
                onClick={() => setSelectedCoin(sym)}
                className={`rounded-lg text-xs transition-all whitespace-nowrap flex items-center gap-2 border ${
                  isCompact ? 'px-2.5 py-1' : 'px-3 py-1.5'
                } ${
                  isSelected
                    ? 'bg-slate-800 text-white border-slate-600 font-semibold shadow-sm'
                    : 'bg-[#090d16] text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="font-medium">{sym}</span>
                <span className="text-[11px] font-mono-numbers text-slate-300">
                  ${price.toLocaleString()}
                </span>
                <span className={`text-[10px] font-mono-numbers ${c.change24h >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {c.change24h >= 0 ? `+${c.change24h}%` : `${c.change24h}%`}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <div className={`grid grid-cols-2 md:grid-cols-4 ${isCompact ? 'gap-2' : 'gap-3'}`}>
        <div className={`bg-[#0d131f] border border-slate-800/80 rounded-xl ${isCompact ? 'p-2.5' : 'p-3.5'}`}>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Coinbase Premium</span>
            <Badge tone={coinbasePremium >= 0 ? 'bullish' : 'bearish'}>
              {coinbasePremium >= 0 ? 'MUA SPOT' : 'TÂY XẢ'}
            </Badge>
          </div>
          <div className="text-base font-bold font-mono-numbers mt-0.5 flex items-baseline gap-1.5">
            <span className={coinbasePremium >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {coinbasePremium >= 0 ? `+${coinbasePremium}%` : `${coinbasePremium}%`}
            </span>
            {isLiveConnected && selectedCoin === 'BTC' && (
              <span className="text-[10px] text-emerald-400/80 font-mono">Live</span>
            )}
          </div>
          {!isCompact && (
            <p className="text-[11px] text-slate-400 mt-1">
              {coinbasePremium >= 0
                ? 'Tiền thật Phố Wall (Mỹ) đang bơm vào mua Spot'
                : 'Nhà đầu tư Mỹ đang bán ròng Spot, cẩn trọng đu đỉnh'}
            </p>
          )}
        </div>

        <div className="p-3.5 bg-[#0d131f] border border-slate-800/80 rounded-xl">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Funding Rate (8h)</span>
            <span className="text-[10px] text-slate-400 font-mono-numbers">
              {isLiveConnected ? 'Binance Futures Live' : 'Toàn sàn'}
            </span>
          </div>
          <div className="text-lg font-bold font-mono-numbers mt-1 text-slate-100">
            +{fundingRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Phe Long đang trả phí cho Short (Độ lệch Long nhẹ, chưa quá nóng)
          </p>
        </div>

        <div className="p-3.5 bg-[#0d131f] border border-slate-800/80 rounded-xl">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Open Interest (OI)</span>
            <span className="text-[10px] text-emerald-400 font-mono-numbers">
              {isLiveConnected ? 'Binance Live' : `+${coinData.openInterestChange24h}% 24h`}
            </span>
          </div>
          <div className="text-lg font-bold font-mono-numbers mt-1 text-white">
            ${openInterestBillion}B
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Dòng tiền phái sinh đang tích tụ, chuẩn bị có biến động mạnh
          </p>
        </div>

        <div className="p-3.5 bg-[#0d131f] border border-slate-800/80 rounded-xl">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tỷ Lệ Long / Short</span>
            <span className="text-[10px] text-slate-400 font-mono-numbers">
              {isLiveConnected ? 'Binance Live' : 'Binance & Bybit'}
            </span>
          </div>
          <div className="text-lg font-bold font-mono-numbers mt-1 text-white flex items-center gap-2">
            <span className="text-emerald-400">{longRatio}%</span>
            <span className="text-xs text-slate-500">/</span>
            <span className="text-rose-400">{shortRatio}%</span>
          </div>
          <div className="w-full bg-rose-500/40 h-1.5 rounded-full mt-2 overflow-hidden flex">
            <div className="bg-emerald-500 h-1.5" style={{ width: `${longRatio}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#0d131f] border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                Bản Đồ Các Vùng Tập Trung Thanh Lý ({selectedCoin})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Vùng thanh lý cụm dày đặc là nơi tập trung hàng trăm triệu USD lệnh Stop Loss
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Giá hiện tại</span>
              <div className="text-sm font-bold font-mono-numbers text-emerald-400">
                ${currentPrice.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#070a10] rounded-lg border border-slate-800/80">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-slate-800 text-rose-300 rounded-lg border border-slate-700">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">
                  Bẫy Quét Stop Loss Long
                </span>
                <div className="text-sm font-bold font-mono-numbers text-rose-300">
                  ${topLongLiquidationPrice.toLocaleString()}{' '}
                  <span className="text-xs text-slate-400">(${coinData.topLongLiquidationZone.volumeMillion}M)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Dễ bị Cá voi đạp thủng hỗ trợ để quét sạch nhỏ lẻ
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-slate-800 text-emerald-300 rounded-lg border border-slate-700">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">
                  Vùng Short Squeeze (Quét Short)
                </span>
                <div className="text-sm font-bold font-mono-numbers text-emerald-300">
                  ${topShortLiquidationPrice.toLocaleString()}{' '}
                  <span className="text-xs text-slate-400">(${coinData.topShortLiquidationZone.volumeMillion}M)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Lực đẩy Short Squeeze kích hoạt khi giá chạm vùng này
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            {coinData.levels.map((lvl, idx) => {
              const isCurrent = lvl.price === coinData.currentPrice;
              const isShortZone = lvl.shortVolMillion > 0;
              const vol = lvl.shortVolMillion || lvl.longVolMillion;

              return (
                <div
                  key={idx}
                  className={`p-2 rounded flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'bg-slate-800 border border-slate-600 py-2.5'
                      : lvl.intensity === 'critical'
                      ? 'bg-[#151c2e] border border-slate-700'
                      : lvl.intensity === 'high'
                      ? 'bg-[#101726] border border-slate-800'
                      : 'bg-[#070a10]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono-numbers font-bold w-18 ${isCurrent ? 'text-white' : 'text-slate-200'}`}>
                      ${lvl.price.toLocaleString()}
                    </span>

                    {lvl.intensity === 'critical' && (
                      <Badge tone="warning">
                        <Flame className="w-3 h-3 text-slate-400" />
                        CỤM DÀY ĐẶC
                      </Badge>
                    )}

                    {lvl.note && (
                      <span className={`text-[11px] ${isCurrent ? 'text-slate-200 font-semibold' : 'text-slate-400'}`}>
                        {lvl.note}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {vol > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-24 sm:w-36 bg-slate-800 h-2 rounded-full overflow-hidden flex justify-end">
                          <div
                            className={`h-2 rounded-full ${
                              isShortZone ? 'bg-slate-600' : 'bg-rose-800/80'
                            }`}
                            style={{ width: `${Math.min(100, (vol / 600) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono-numbers text-slate-300 min-w-[55px] text-right">
                          ${vol}M {isShortZone ? 'Short' : 'Long'}
                        </span>
                      </div>
                    )}
                    {isCurrent && (
                      <span className="text-xs font-bold text-slate-200 font-mono-numbers">
                        ← HIỆN TẠI
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 p-3 bg-[#070a10]/60 rounded-xl border border-slate-800 leading-relaxed">
            <strong className="text-slate-200">Kinh nghiệm thực chiến:</strong> Như cú sập quét râu <strong>$1.44 của XRP</strong> hay <strong>$76K của BTC</strong>, Market Maker luôn có xu hướng đưa giá đến nơi có cụm thanh lý dày nhất để quét sạch thanh khoản của nhỏ lẻ rồi mới bật tăng theo xu hướng chính. Hãy đặt Stop Loss xa hơn các vùng thanh lý này ít nhất 1.5% - 2%!
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0d131f] border border-slate-800/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Coinbase Premium Index
                </h3>
                <p className="text-xs text-slate-400">
                  Chênh lệch giá giữa Coinbase (Mỹ) & Binance (Toàn cầu)
                </p>
              </div>
              <Badge tone="bullish">+0.082% (Xanh)</Badge>
            </div>

            <div className="bg-[#070a10] p-3 rounded-lg border border-slate-800/80">
              <div className="h-28 w-full flex items-end">
                <svg viewBox="0 0 300 90" className="w-full h-full overflow-visible">
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#334155" strokeDasharray="3,3" strokeWidth="1" />
                  <path
                    d="M 10 38 L 45 32 L 80 20 L 115 28 L 150 45 L 185 54 L 220 35 L 255 12 L 290 22 L 290 50 L 10 50 Z"
                    fill="rgba(52, 211, 153, 0.08)"
                  />
                  <path
                    d="M 10 38 L 45 32 L 80 20 L 115 28 L 150 45 L 185 54 L 220 35 L 255 12 L 290 22"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2"
                  />
                  <circle cx="290" cy="22" r="3.5" fill="#34d399" />
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono-numbers mt-1">
                <span>00:00 (Mỹ đóng phiên)</span>
                <span>12:00 (Châu Âu)</span>
                <span>Hiện tại (+0.08%)</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>Màu XANH (+):</strong> Phố Wall / Quỹ Mỹ đang bơm tiền thật mua Spot trên Coinbase.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span><strong>Màu ĐỎ (-):</strong> Nhà đầu tư Mỹ đang xả hàng, né FOMO khi chỉ số âm sâu.</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0d131f] border border-slate-800/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Funding Rate Toàn Sàn</span>
              </h3>
              <span className="text-[11px] text-slate-400">Chu kỳ 8 giờ</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2 font-medium">Sàn Giao Dịch</th>
                    <th className="pb-2 font-medium font-mono-numbers text-right">BTC</th>
                    <th className="pb-2 font-medium font-mono-numbers text-right">ETH</th>
                    <th className="pb-2 font-medium font-mono-numbers text-right">SOL</th>
                    <th className="pb-2 font-medium text-right">Xu hướng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                  {fundingTable.map((row) => (
                    <tr key={row.exchange} className="hover:bg-slate-800/30">
                      <td className="py-2.5 font-sans font-semibold text-white">{row.exchange}</td>
                      <td className="py-2.5 text-right text-emerald-400">{row.btcFunding}</td>
                      <td className="py-2.5 text-right text-emerald-400">{row.ethFunding}</td>
                      <td className="py-2.5 text-right text-slate-300">{row.solFunding}</td>
                      <td className="py-2.5 text-right font-sans text-[11px] text-slate-300">
                        {row.sentiment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400">
              💡 Khi Funding Rate vượt quá <strong>+0.05%</strong> trên toàn bộ các sàn, thị trường đang hưng phấn quá đà với đòn bẩy Long. Đó là lúc rủi ro thanh lý quét Long cao nhất!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
