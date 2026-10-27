import React, { useState, useEffect, useCallback } from 'react';
import { fetchLiveEtfFlows, LiveEtfOverview, SOL_ETF_FILINGS, XRP_ETF_FILINGS } from '../../services/etfService';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ExternalLink, Clock, ArrowUpRight, TrendingUp, Radio, RefreshCw, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PillarEtfProps {
  isCompact?: boolean;
}

export const PillarFarsideETF: React.FC<PillarEtfProps> = ({ isCompact = false }) => {
  const [assetType, setAssetType] = useState<'BTC' | 'ETH' | 'SOL' | 'XRP'>('BTC');
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
  const solRows = etfData?.solFlows || [];
  const xrpRows = etfData?.xrpFlows || [];

  const currentBtcNet = btcRows.length > 0 ? btcRows[btcRows.length - 1].totalNet : 0;
  const currentEthNet = ethRows.length > 0 ? ethRows[ethRows.length - 1].totalNet : 0;
  const currentSolNet = solRows.length > 0 ? solRows[solRows.length - 1].totalNet : 0;
  const currentXrpNet = xrpRows.length > 0 ? xrpRows[xrpRows.length - 1].totalNet : 0;

  const totalBtcCumulative = btcRows.reduce((acc, cur) => acc + cur.totalNet, 0);
  const totalEthCumulative = ethRows.reduce((acc, cur) => acc + cur.totalNet, 0);
  const totalSolCumulative = solRows.reduce((acc, cur) => acc + cur.totalNet, 0);
  const totalXrpCumulative = xrpRows.reduce((acc, cur) => acc + cur.totalNet, 0);

  const activeFilings = assetType === 'SOL' ? (etfData?.solFilings || SOL_ETF_FILINGS) : (etfData?.xrpFilings || XRP_ETF_FILINGS);

  return (
    <div className={isCompact ? 'space-y-3' : 'space-y-6'}>
      <Card isCompact={isCompact} className="border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="etf">TRỤ CỘT 3: DÒNG TIỀN ETF & ĐỊNH CHẾ PHỐ WALL</Badge>
              {etfData?.isLive && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <Radio className="w-3 h-3 text-emerald-400" />
                  Live Institutional API
                </span>
              )}
            </div>
            <h1 className={`font-bold text-white mt-1.5 ${isCompact ? 'text-base' : 'text-xl'}`}>
              Dòng Vốn Thể Chế & Hồ Sơ Spot ETF (BTC · ETH · SOL · XRP)
            </h1>
            {!isCompact && (
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Theo dõi chính xác dòng tiền mua/bán ròng hàng ngày của Phố Wall (BlackRock, Fidelity, Grayscale) và tiến độ nộp đơn Spot ETF lên SEC của Solana và Ripple (XRP).
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadEtfData}
              disabled={isLoading}
              className="px-2.5 py-1.5 bg-[#070a10] hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Làm mới dữ liệu ETF"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-slate-200' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Cập nhật</span>
            </button>

            <a
              href={assetType === 'ETH' ? 'https://farside.co.uk/eth/' : 'https://farside.co.uk/btc/'}
              target="_blank"
              rel="noreferrer noopener"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Farside Investors</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* 4 Asset Selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAssetType('BTC')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                assetType === 'BTC'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600 shadow-sm'
                  : 'bg-[#090d16] text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              Bitcoin Spot ETF (BTC)
            </button>
            <button
              onClick={() => setAssetType('ETH')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                assetType === 'ETH'
                  ? 'bg-blue-950/80 text-blue-300 border-blue-600 shadow-sm'
                  : 'bg-[#090d16] text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              Ethereum Spot ETF (ETH)
            </button>
            <button
              onClick={() => setAssetType('SOL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer flex items-center gap-1.5 ${
                assetType === 'SOL'
                  ? 'bg-purple-950/80 text-purple-300 border-purple-500 shadow-sm'
                  : 'bg-[#090d16] text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <span>Solana ETF & Thể Chế (SOL)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-900/60 text-purple-200 border border-purple-700/50">SEC S-1</span>
            </button>
            <button
              onClick={() => setAssetType('XRP')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer flex items-center gap-1.5 ${
                assetType === 'XRP'
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500 shadow-sm'
                  : 'bg-[#090d16] text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <span>Ripple XRP ETF (XRP)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-900/60 text-cyan-200 border border-cyan-700/50">SEC S-1</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#070a10]/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              <strong>Giờ Vàng Cập Nhật:</strong> 04:00 - 05:00 Sáng VN (Chốt NAV phiên Mỹ)
            </span>
          </div>
        </div>
      </Card>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#0d131f] border border-slate-800/80 rounded-xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Dòng Tiền Ròng Phiên Gần Nhất ({assetType})</span>
            <Badge tone="bullish">
              {assetType === 'BTC' || assetType === 'ETH' ? 'PHỐ WALL MUA RÒNG' : 'THỂ CHẾ GOM RÒNG'}
            </Badge>
          </div>
          <div className="text-2xl font-bold font-mono-numbers mt-1.5 text-emerald-300 flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-emerald-300" />
            <span>
              +${assetType === 'BTC'
                ? currentBtcNet
                : assetType === 'ETH'
                ? currentEthNet
                : assetType === 'SOL'
                ? currentSolNet
                : currentXrpNet}M USD
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {assetType === 'BTC' && 'BlackRock IBIT & Fidelity FBTC dẫn đầu nhóm quỹ với dòng vốn ròng dương mạnh mẽ.'}
            {assetType === 'ETH' && 'BlackRock ETHA & Fidelity FETH dẫn đầu dòng vốn ròng tích lũy Ethereum.'}
            {assetType === 'SOL' && 'Grayscale Solana Trust (GSOL) & 21Shares Solana ETP liên tục được các tổ chức mua gom.'}
            {assetType === 'XRP' && 'Grayscale XRP Trust (GXRP) & 21Shares Core ETP ghi nhận dòng vốn vào ổn định.'}
          </p>
        </div>

        <div className="p-4 bg-[#0d131f] border border-slate-800/80 rounded-xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>
              {assetType === 'BTC' || assetType === 'ETH'
                ? 'Tổng Tích Lũy 7 Phiên Gần Nhất'
                : 'Quy Mô AUM Thể Chế Đang Quản Lý'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono-numbers">Institutional Metric</span>
          </div>
          <div className="text-2xl font-bold font-mono-numbers mt-1.5 text-white">
            {assetType === 'BTC' && `+$${totalBtcCumulative.toFixed(1)}M USD`}
            {assetType === 'ETH' && `+$${totalEthCumulative.toFixed(1)}M USD`}
            {assetType === 'SOL' && `$${etfData?.solAumMillion || 185.4}M USD`}
            {assetType === 'XRP' && `$${etfData?.xrpAumMillion || 68.5}M USD`}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {assetType === 'BTC' || assetType === 'ETH'
              ? 'Lực gom hấp thụ nguồn cung bán lẻ, củng cố đáy giá vững chắc.'
              : 'Tổng tài sản của các sản phẩm ủy thác và ETP châu Âu trước khi được duyệt Spot ETF tại Mỹ.'}
          </p>
        </div>

        <div className="p-4 bg-[#0d131f] border border-slate-800/80 rounded-xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>
              {assetType === 'BTC' || assetType === 'ETH'
                ? 'Quy Tắc Đọc Dữ Liệu Nhanh'
                : `Xác Suất SEC Phê Duyệt Spot ${assetType} ETF`}
            </span>
            <Badge tone="neutral">
              {assetType === 'BTC' || assetType === 'ETH' ? '1 Phút Mỗi Sáng' : 'Bloomberg Intelligence'}
            </Badge>
          </div>

          {assetType === 'BTC' || assetType === 'ETH' ? (
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
          ) : (
            <div className="mt-1.5 space-y-1">
              <div className="text-2xl font-bold text-purple-300 font-mono-numbers">
                {assetType === 'SOL' ? '75% - 85%' : '80% - 88%'}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {assetType === 'SOL'
                  ? 'Kỳ hạn phán quyết trọng yếu của SEC dự kiến vào Q1/2025 - 2026 sau hồ sơ S-1 của VanEck & 21Shares.'
                  : 'Vụ kiện Ripple vs SEC kết thúc mở đường cho Bitwise, Canary và 21Shares đưa XRP Spot ETF niêm yết.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Special SEC Filings Tracker Table for SOL and XRP */}
      {(assetType === 'SOL' || assetType === 'XRP') && (
        <div className="bg-[#0d131f] border border-purple-900/40 rounded-xl p-5 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Bảng Theo Dõi Tiến Độ Nộp Đơn {assetType} Spot ETF Lên SEC (US SEC Filings Tracker)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Các tổ chức quản lý tài sản hàng đầu thế giới đã nộp đơn đăng ký mẫu 19b-4 và S-1
              </p>
            </div>
            <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2.5 py-1 rounded-lg">
              {activeFilings.length} Định chế đã nộp hồ sơ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2.5 font-medium">Tổ Chức Quản Lý (Issuer)</th>
                  <th className="pb-2.5 font-medium">Mã Ticker</th>
                  <th className="pb-2.5 font-medium">Loại Hồ Sơ</th>
                  <th className="pb-2.5 font-medium">Trạng Thái Pháp Lý</th>
                  <th className="pb-2.5 font-medium">Ngày Nộp</th>
                  <th className="pb-2.5 font-medium">Kỳ Hạn SEC</th>
                  <th className="pb-2.5 font-medium">Đơn Vị Lưu Ký</th>
                  <th className="pb-2.5 font-medium text-right">Xác Suất Duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeFilings.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-semibold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{f.issuer}</span>
                    </td>
                    <td className="py-3 font-mono font-bold text-purple-300">{f.ticker}</td>
                    <td className="py-3 font-mono text-slate-300 text-[11px]">{f.filingType}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        f.status === 'Đang xét duyệt SEC'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          : f.status === 'Đang giao dịch ETP'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                          : 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">{f.filingDate}</td>
                    <td className="py-3 text-slate-300 font-mono text-[11px]">{f.secDeadline}</td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">{f.custodian}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${f.approvalProbability}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-purple-300 text-xs">
                          {f.approvalProbability}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#080d17] border border-slate-800/80 rounded-xl text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>Ý nghĩa chiến lược đối với chu kỳ giá {assetType}:</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tương tự kịch bản Bitcoin (tháng 01/2024) và Ethereum (tháng 07/2024), giai đoạn nộp đơn S-1 và xét duyệt 19b-4 là thời điểm các tổ chức tích lũy ngầm thông qua quỹ tín thác OTC (như Grayscale Trust) trước khi dòng tiền tỷ USD từ các tài khoản môi giới bán lẻ Phố Wall ùa vào.
            </p>
          </div>
        </div>
      )}

      {/* Daily Flow Chart */}
      <div className="bg-[#0d131f] border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-300" />
              Biểu Đồ Cột Dòng Tiền Ròng Hàng Ngày ({assetType} - $ Triệu USD)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {assetType === 'BTC' || assetType === 'ETH'
                ? 'So sánh quy mô dòng vốn giữa các phiên giao dịch của Phố Wall'
                : `Dòng vốn tích lũy hàng ngày của các sản phẩm ETP/Trust thể chế ${assetType}`}
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
          {(assetType === 'BTC'
            ? btcRows
            : assetType === 'ETH'
            ? ethRows
            : assetType === 'SOL'
            ? solRows
            : xrpRows
          ).map((day) => {
            const isPos = day.totalNet >= 0;
            const maxVal = assetType === 'BTC' ? 650 : assetType === 'ETH' ? 200 : 15;
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

      {/* Detailed Breakdown Table */}
      <div className="bg-[#0d131f] border border-slate-800/80 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">
              Bảng Tổng Hợp Chi Tiết Từng Quỹ Phát Hành (Đơn vị: $ Triệu USD)
            </h3>
            <p className="text-xs text-slate-400">
              {assetType === 'BTC' && 'IBIT (BlackRock) · FBTC (Fidelity) · BITB (Bitwise) · ARKB (ARK) · GBTC (Grayscale)'}
              {assetType === 'ETH' && 'ETHA (BlackRock) · FETH (Fidelity) · ETHW (Bitwise) · ETHE (Grayscale)'}
              {assetType === 'SOL' && 'GSOL (Grayscale Solana Trust) · ASOL (21Shares Solana ETP) · VanEck Solana ETN Europe'}
              {assetType === 'XRP' && 'GXRP (Grayscale XRP Trust) · AXRP (21Shares Ripple XRP ETP Europe)'}
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono-numbers">
            {assetType === 'BTC' || assetType === 'ETH' ? 'Nguồn: Farside / SEC Data' : 'Nguồn: Grayscale & 21Shares ETP Data'}
          </span>
        </div>

        <div className="overflow-x-auto">
          {assetType === 'BTC' && (
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
          )}

          {assetType === 'ETH' && (
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

          {assetType === 'SOL' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2 font-medium">Ngày</th>
                  <th className="pb-2 font-medium text-right">Grayscale GSOL</th>
                  <th className="pb-2 font-medium text-right">21Shares ASOL (ETP)</th>
                  <th className="pb-2 font-medium text-right">VanEck Solana ETN</th>
                  <th className="pb-2 font-medium text-right">Quỹ Châu Âu khác</th>
                  <th className="pb-2 font-medium text-right font-bold text-purple-300">TỔNG NET FLOW ($M)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                {solRows.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-sans font-semibold text-white">
                      {row.date} <span className="text-slate-500 font-normal text-[11px]">({row.dayOfWeek})</span>
                    </td>
                    <td className="py-2.5 text-right text-emerald-400">+{row.gsol}</td>
                    <td className="py-2.5 text-right text-emerald-400">+{row.asol}</td>
                    <td className="py-2.5 text-right text-purple-300">+{row.vaneckEu}</td>
                    <td className="py-2.5 text-right text-slate-400">+{row.others}</td>
                    <td className="py-2.5 text-right font-bold text-sm text-emerald-300 bg-emerald-950/20">
                      +{row.totalNet}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {assetType === 'XRP' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2 font-medium">Ngày</th>
                  <th className="pb-2 font-medium text-right">Grayscale GXRP (Trust)</th>
                  <th className="pb-2 font-medium text-right">21Shares AXRP (ETP Europe)</th>
                  <th className="pb-2 font-medium text-right">Quỹ Thể Chế Khác</th>
                  <th className="pb-2 font-medium text-right font-bold text-cyan-300">TỔNG NET FLOW ($M)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                {xrpRows.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-sans font-semibold text-white">
                      {row.date} <span className="text-slate-500 font-normal text-[11px]">({row.dayOfWeek})</span>
                    </td>
                    <td className="py-2.5 text-right text-emerald-400">+{row.gxrp}</td>
                    <td className="py-2.5 text-right text-emerald-400">+{row.axrp}</td>
                    <td className="py-2.5 text-right text-slate-400">+{row.others}</td>
                    <td className="py-2.5 text-right font-bold text-sm text-cyan-300 bg-cyan-950/20">
                      +{row.totalNet}
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
