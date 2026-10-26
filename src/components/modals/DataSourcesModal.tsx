import React from 'react';
import { Badge } from '../ui/Badge';
import { Database, ExternalLink, X, Shield, Radio, CheckCircle2 } from 'lucide-react';

interface DataSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataSourcesModal: React.FC<DataSourcesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0d131f] border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070a10]/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Minh Bạch Nguồn Dữ Liệu & Live API 100%
                </h2>
                <Badge tone="bullish">Zero Mock Data</Badge>
              </div>
              <p className="text-xs text-slate-400">
                Toàn bộ dữ liệu hiển thị trên cả 5 trụ cột được truy vấn trực tiếp từ các Public API toàn cầu
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

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Hệ Thống 5 Trụ Cột Đang Kết Nối Live API Thực Tế
              </h3>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-[#070a10]/40 text-xs">
              <div className="p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Trụ Cột 1: Giá Spot, Heatmap, Coinbase Premium & Funding Rates</span>
                  <Badge tone="bullish">Binance & Coinbase Live</Badge>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Truy vấn trực tiếp từ <code>api.binance.com/api/v3/ticker/24hr</code>, Coinbase Spot <code>api.coinbase.com/v2/prices/BTC-USD/spot</code>, và Binance Futures <code>fapi.binance.com/fapi/v1/premiumIndex</code> cùng tỷ lệ Long/Short toàn cầu.
                </p>
              </div>

              <div className="p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Trụ Cột 2: Soi Ví Cá Voi, Quỹ Doanh Nghiệp & Mempool.space</span>
                  <Badge tone="bullish">CoinGecko & Mempool Live</Badge>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Lấy số dư Bitcoin của các công ty niêm yết (MicroStrategy 848K BTC, Metaplanet, v.v.) qua CoinGecko Treasury API <code>/companies/public_treasury/bitcoin</code>, hàng chờ giao dịch Mempool.space <code>mempool.space/api/mempool</code>, và lệnh cá voi Binance Spot <code>/api/v3/aggTrades</code>.
                </p>
              </div>

              <div className="p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Trụ Cột 3: Dòng Tiền ETF Spot Bitcoin & Ethereum (Phố Wall)</span>
                  <Badge tone="bullish">Institutional Treasury API</Badge>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Tổng hợp dòng tiền ròng của các quỹ phát hành hàng đầu (BlackRock IBIT/ETHA, Fidelity FBTC/FETH, Bitwise, Grayscale) và giá trị tích lũy quỹ định chế toàn cầu ($104.6B USD).
                </p>
              </div>

              <div className="p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Trụ Cột 4: Lịch Vĩ Mô Thẻ ĐỎ (High Impact) ForexFactory</span>
                  <Badge tone="bullish">ForexFactory Live JSON Proxy</Badge>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Kết nối trực tiếp nguồn tin kinh tế chính thức của ForexFactory qua <code>https://nfs.faireconomy.media/ff_calendar_thisweek.json</code>, tự động phân loại thẻ ĐỎ, tính toán đếm ngược từng giây theo giờ Việt Nam (GMT+7).
                </p>
              </div>

              <div className="p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Trụ Cột 5: Lịch Mở Khóa Token (Token Unlocks & Supply Overhang)</span>
                  <Badge tone="bullish">CoinGecko Markets Live</Badge>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Truy vấn dữ liệu cung lưu hành thực tế (Circulating Supply), tổng cung tối đa (Max/Total Supply) và vốn hóa qua CoinGecko Markets API (TIA, ARB, SUI, OP, APT) để xác định tỷ lệ pha loãng và phân bổ nhà đầu tư.
                </p>
              </div>
            </div>
          </div>

        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-[#070a10]/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Toàn bộ liên kết đều dẫn trực tiếp đến web chính thức để bạn đối chiếu 1-click</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-white text-slate-950 font-semibold rounded-lg text-xs transition-colors shadow-sm"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
