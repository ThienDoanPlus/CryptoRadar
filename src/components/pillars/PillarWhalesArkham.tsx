import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchLiveWhalesData,
  LiveWhalesData,
  INITIAL_WHALES_DATA,
  inspectBitcoinAddress,
  CustomInspectedWallet,
} from '../../services/whalesService';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  ExternalLink,
  Shield,
  Building,
  Radio,
  RefreshCw,
  Activity,
  Search,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface PillarWhalesProps {
  isCompact?: boolean;
}

const PRESET_WALLETS = [
  {
    label: 'Chính Phủ Mỹ (DOJ Silk Road)',
    address: 'bc1qa5wkgaew2dkv56kfvj49j0av5nml45x9ek9hz6',
    desc: 'Cụm ví tịch thu 69,370 BTC từ Silk Road',
  },
  {
    label: 'Ví Lạnh Binance #1',
    address: '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo',
    desc: 'Ví Proof of Reserves lớn nhất thế giới (248K+ BTC)',
  },
  {
    label: 'Ví Lạnh Robinhood #3',
    address: 'bc1ql49ydapnjafl5t2cp9zqpjwe6pdgmxy98859v2',
    desc: 'Ví lưu ký tập trung lớn thứ 3 thế giới (140K+ BTC)',
  },
];

export const PillarWhalesArkham: React.FC<PillarWhalesProps> = ({ isCompact = false }) => {
  // Guaranteed initial dataset so UI is never blank
  const [liveData, setLiveData] = useState<LiveWhalesData>(INITIAL_WHALES_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('us-gov');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Government' | 'Institution' | 'Custodian'>('All');
  const [txFilter, setTxFilter] = useState<'all' | 'to_exchange' | 'from_exchange'>('all');

  // Live On-Chain Address Inspector State
  const [searchAddress, setSearchAddress] = useState<string>('bc1qa5wkgaew2dkv56kfvj49j0av5nml45x9ek9hz6');
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [inspectedWallet, setInspectedWallet] = useState<CustomInspectedWallet | null>(null);
  const [inspectError, setInspectError] = useState<string | null>(null);

  const loadWhaleData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchLiveWhalesData();
      setLiveData(res);
    } catch (err) {
      console.warn('Failed to refresh live whales data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWhaleData();
    const timer = setInterval(loadWhaleData, 30000);
    return () => clearInterval(timer);
  }, [loadWhaleData]);

  // Execute address lookup on Mempool.space Live API
  const handleInspectAddress = async (addrToInspect?: string) => {
    const target = (addrToInspect || searchAddress).trim();
    if (!target) return;

    setIsInspecting(true);
    setInspectError(null);
    try {
      const result = await inspectBitcoinAddress(target, 80460);
      setInspectedWallet(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setInspectError(msg);
      setInspectedWallet(null);
    } finally {
      setIsInspecting(false);
    }
  };

  // Inspect default address on first mount
  useEffect(() => {
    handleInspectAddress('bc1qa5wkgaew2dkv56kfvj49j0av5nml45x9ek9hz6');
  }, []);

  const entities = liveData.entities;
  const filteredEntities = entities.filter((e) => {
    if (categoryFilter === 'All') return true;
    return e.category === categoryFilter;
  });

  const selectedEntity = entities.find((e) => e.id === selectedEntityId) || entities[0];

  const whaleAlerts = liveData.whaleAlerts;
  const filteredWhaleAlerts = whaleAlerts.filter((item) => {
    if (txFilter === 'all') return true;
    return item.txType === txFilter;
  });

  const netflows = liveData.netflows;

  // Build Arkham URL for current entity
  const getArkhamUrl = () => {
    if (selectedEntity.arkhamSlug) {
      return `https://platform.arkhamintelligence.com/explorer/entity/${selectedEntity.arkhamSlug}`;
    }
    if (selectedEntity.address) {
      return `https://platform.arkhamintelligence.com/explorer/address/${selectedEntity.address}`;
    }
    return 'https://platform.arkhamintelligence.com/';
  };

  return (
    <div className={isCompact ? 'space-y-3' : 'space-y-6'}>
      {/* Header Card */}
      <Card isCompact={isCompact} className="border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="whale">TRỤ CỘT 2: SOI VÍ CÁ VOI & CHÍNH PHỦ MỸ (ON-CHAIN)</Badge>
              {liveData.isLive && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <Radio className="w-3 h-3 text-emerald-400" />
                  Mempool / CoinGecko Live API
                </span>
              )}
            </div>
            <h1 className={`font-bold text-white mt-1.5 ${isCompact ? 'text-base' : 'text-xl'}`}>
              Arkham Intelligence & CryptoQuant Exchange Netflow
            </h1>
            {!isCompact && (
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Soi trực tiếp số dư On-Chain của Chính phủ Mỹ (208,109 BTC), MicroStrategy, các ví lạnh sàn giao dịch và dòng tiền gom/xả ròng thời gian thực kết nối trực tiếp Mempool.space API.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadWhaleData}
              disabled={isLoading}
              className="px-2.5 py-1.5 bg-[#070a10] hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Làm mới On-chain"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-slate-200' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Cập nhật Live</span>
            </button>

            <a
              href="https://platform.arkhamintelligence.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Mở Arkham Platform</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <a
              href="https://cryptoquant.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>CryptoQuant</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Global Treasury & Mempool Live Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="p-2.5 bg-[#070a10] border border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-400 block font-medium">Kho Quỹ Định Chế Toàn Cầu</span>
            <span className="text-sm font-bold font-mono-numbers text-white">
              {liveData.totalTreasuryBtc.toLocaleString()} BTC
            </span>
          </div>
          <div className="p-2.5 bg-[#070a10] border border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-400 block font-medium">Tổng Định Giá USD</span>
            <span className="text-sm font-bold font-mono-numbers text-emerald-400">
              ${(liveData.totalTreasuryUsd / 1e9).toFixed(1)} Tỷ USD
            </span>
          </div>
          <div className="p-2.5 bg-[#070a10] border border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-400 block font-medium">Tỷ Lệ Chiếm Cung BTC</span>
            <span className="text-sm font-bold font-mono-numbers text-slate-200">
              {liveData.dominancePercent}% Tổng Cung
            </span>
          </div>
          <div className="p-2.5 bg-[#070a10] border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Hàng Chờ Mempool.space</span>
              <span className="text-sm font-bold font-mono-numbers text-slate-300">
                {liveData.mempoolTxCount.toLocaleString()} giao dịch
              </span>
            </div>
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>
        </div>
      </Card>

      {/* Interactive On-Chain Address Inspector Bar */}
      <div className="bg-[#0b101c] border border-slate-700/80 rounded-xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-800 text-emerald-400 rounded-lg border border-slate-700">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Công Cụ Soi Ví On-Chain Trực Tiếp (Mempool.space Live API)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 font-mono">
                  Blockchain Live
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Nhập hoặc chọn bất kỳ địa chỉ ví Bitcoin (1..., 3..., bc1...) để truy vấn số dư thực và lịch sử giao dịch tức thì:
              </p>
            </div>
          </div>
        </div>

        {/* Input & Search Button */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Wallet className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInspectAddress();
              }}
              placeholder="Dán địa chỉ ví Bitcoin: bc1q..., 34xp..., 1Jbez..."
              className="w-full pl-9 pr-3 py-2 bg-[#070a10] border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <button
            onClick={() => handleInspectAddress()}
            disabled={isInspecting}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isInspecting ? 'animate-spin' : ''}`} />
            <span>{isInspecting ? 'Đang Soi On-Chain...' : 'Soi Ví Ngay'}</span>
          </button>
        </div>

        {/* Preset Quick Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] text-slate-400">Ví cá voi mẫu:</span>
          {PRESET_WALLETS.map((pw) => (
            <button
              key={pw.address}
              onClick={() => {
                setSearchAddress(pw.address);
                handleInspectAddress(pw.address);
              }}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                searchAddress === pw.address
                  ? 'bg-slate-800 text-white border-slate-600 font-semibold shadow-sm'
                  : 'bg-[#070a10] text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
              title={pw.desc}
            >
              <span>{pw.label}</span>
              <code className="text-[10px] text-slate-400 font-mono">({pw.address.slice(0, 6)}...)</code>
            </button>
          ))}
        </div>

        {/* Inspect Error Message */}
        {inspectError && (
          <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{inspectError}</span>
          </div>
        )}

        {/* Live Inspected Address Result Box */}
        {inspectedWallet && (
          <div className="mt-3 p-4 bg-[#070a10] border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Địa chỉ đang soi:</span>
                  <code className="text-xs font-mono font-bold text-emerald-400 break-all">
                    {inspectedWallet.address}
                  </code>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Tổng giao dịch trên mạng lưới: <strong className="text-white font-mono">{inspectedWallet.txCount.toLocaleString()}</strong> giao dịch
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://platform.arkhamintelligence.com/explorer/address/${inspectedWallet.address}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Soi trên Arkham</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
                <a
                  href={`https://mempool.space/address/${inspectedWallet.address}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Mempool Explorer</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-[#0b101c] rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Số Dư Hiện Tại (Live)</span>
                <span className="text-sm font-bold font-mono-numbers text-white">
                  {inspectedWallet.balanceBtc.toLocaleString()} BTC
                </span>
              </div>
              <div className="p-2.5 bg-[#0b101c] rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Định Giá Khả Dụng (USD)</span>
                <span className="text-sm font-bold font-mono-numbers text-emerald-400">
                  ≈ ${inspectedWallet.usdValueMillion.toLocaleString()}M USD
                </span>
              </div>
              <div className="p-2.5 bg-[#0b101c] rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Tổng Lượng Đã Nhận</span>
                <span className="text-sm font-bold font-mono-numbers text-slate-300">
                  {inspectedWallet.totalReceivedBtc.toLocaleString()} BTC
                </span>
              </div>
              <div className="p-2.5 bg-[#0b101c] rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Tổng Lượng Đã Chuyển Đi</span>
                <span className="text-sm font-bold font-mono-numbers text-slate-300">
                  {inspectedWallet.totalSentBtc.toLocaleString()} BTC
                </span>
              </div>
            </div>

            {/* Recent Live On-Chain Transactions Table */}
            {inspectedWallet.recentTxs.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Giao Dịch Gần Nhất Ghi Nhận Trong Block (Mempool Live API)</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Hiển thị {inspectedWallet.recentTxs.length} txs mới nhất
                  </span>
                </div>
                <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                  {inspectedWallet.recentTxs.map((tx) => (
                    <div key={tx.txid} className="p-2.5 hover:bg-slate-800/40 transition-colors flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <a
                          href={`https://mempool.space/tx/${tx.txid}`}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="font-mono text-slate-300 hover:text-white underline truncate max-w-[180px] sm:max-w-xs"
                          title="Xem Transaction trên Mempool"
                        >
                          {tx.txid}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono-numbers font-bold text-white">{tx.amountBtc.toLocaleString()} BTC</span>
                        <span className="text-slate-400 text-[11px] font-mono-numbers">({tx.usdValue})</span>
                        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">{tx.timeAgo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Roster Filter & Entity Tabs */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
              Danh Mục Định Chế & Chính Phủ Lớn Nhất Thế Giới
            </h2>
            <span className="text-xs text-slate-400 font-mono-numbers">({filteredEntities.length} tổ chức)</span>
          </div>

          <div className="flex items-center gap-1 bg-[#070a10] p-1 rounded-lg border border-slate-800">
            {(['All', 'Government', 'Institution', 'Custodian'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-slate-800 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'All' ? 'Tất cả' : cat === 'Government' ? 'Chính Phủ' : cat === 'Institution' ? 'Quỹ Thể Chế' : 'Sàn / Lưu Ký'}
              </button>
            ))}
          </div>
        </div>

        {/* Entity Selector Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filteredEntities.map((entity) => {
            const isSelected = selectedEntityId === entity.id;
            return (
              <button
                key={entity.id}
                onClick={() => {
                  setSelectedEntityId(entity.id);
                  if (entity.address) {
                    setSearchAddress(entity.address);
                    handleInspectAddress(entity.address);
                  }
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-slate-500 shadow-md ring-1 ring-slate-600'
                    : 'bg-[#090d16] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    {entity.category === 'Government' ? 'Chính Phủ' : entity.category === 'Institution' ? 'Thể Chế' : 'Lưu Ký'}
                  </span>
                  <Badge
                    tone={
                      entity.status === 'Accumulating'
                        ? 'bullish'
                        : entity.status === 'Distributing'
                        ? 'bearish'
                        : 'neutral'
                    }
                  >
                    {entity.status === 'Accumulating' ? 'Đang gom' : entity.status === 'Distributing' ? 'Đang xả' : 'Đang giữ'}
                  </Badge>
                </div>
                <div className="text-xs font-bold text-white mt-1.5 truncate">
                  {entity.name}
                </div>
                <div className="text-sm font-bold font-mono-numbers text-slate-100 mt-1">
                  {entity.btcBalance.toLocaleString()} BTC
                </div>
                <div className="text-[10px] text-slate-400 font-mono-numbers">
                  ≈ ${entity.usdValueBillion} Tỷ USD
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Grid: Visual Tree Inspector & CryptoQuant/Whale Alert Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Arkham On-Chain Inspector */}
        <div className="lg:col-span-7 bg-[#0d131f] border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Arkham On-Chain Inspector: {selectedEntity.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Cụm ví: <code className="text-slate-300 font-mono text-[11px]">{selectedEntity.sourceAddressSnippet}</code> · Lần di chuyển gần nhất: {selectedEntity.lastMovementTime}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="bullish">Verified Entity</Badge>
              <a
                href={getArkhamUrl()}
                target="_blank"
                rel="noreferrer noopener"
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>Arkham Graph</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Sơ Đồ Luân Chuyển Dòng Tiền (Visual Tree Diagram) */}
          <div className="p-4 bg-[#070a10] rounded-xl border border-slate-800/80 space-y-3">
            <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
              Sơ Đồ Luân Chuyển Dòng Tiền (Visual Tree Diagram)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center py-2">
              <div className="p-3 bg-[#0d131f] border border-slate-700/80 rounded-lg text-center">
                <div className="text-[10px] text-slate-400">Kho Lưu Trữ Chính</div>
                <div className="text-xs font-bold text-white mt-1 truncate">{selectedEntity.name}</div>
                <div className="text-xs font-mono-numbers text-slate-200 font-bold mt-0.5">
                  {selectedEntity.btcBalance.toLocaleString()} BTC
                </div>
              </div>

              <div className="flex flex-col items-center justify-center text-slate-500">
                <span className="text-[10px] font-mono-numbers text-slate-400 text-center">
                  {selectedEntity.status === 'Accumulating'
                    ? '📥 Nạp thêm từ OTC'
                    : selectedEntity.status === 'Distributing'
                    ? '📤 Giải ngân trả nợ'
                    : '🔒 Khóa chặt trong kho'}
                </span>
                <div className="w-full flex items-center justify-center my-1">
                  <div className="h-0.5 w-16 bg-slate-700" />
                  <span className="text-slate-500 text-xs">►</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {selectedEntity.status === 'Accumulating' ? 'Gom hàng không qua sàn' : 'Không có lệnh nạp xả'}
                </span>
              </div>

              <div className="p-3 bg-[#0d131f] border border-slate-700/80 rounded-lg text-center">
                <div className="text-[10px] text-slate-400">Đối Tác Lưu Ký</div>
                <div className="text-xs font-bold text-white mt-1">Coinbase Prime / Custody</div>
                <div className="text-xs font-mono-numbers text-emerald-400 font-bold mt-0.5">
                  {selectedEntity.status === 'Accumulating' ? '+ Mua ròng Spot' : 'An Toàn 100%'}
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300 p-2.5 bg-[#0d131f]/60 rounded-lg border border-slate-800/80 leading-relaxed">
              <strong>Tình trạng hiện tại:</strong> {selectedEntity.recentAction}
            </div>
          </div>

          {/* Nhật Ký Giao Dịch On-Chain */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Nhật Ký Giao Dịch On-Chain Mẫu Của Thực Thể
            </h3>

            <div className="divide-y divide-slate-800/60 border border-slate-800 rounded-xl overflow-hidden bg-[#070a10]/50">
              {selectedEntity.recentTransactions.map((tx) => (
                <div key={tx.id} className="p-3 hover:bg-slate-800/30 transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        tone={
                          tx.txType.includes('Xả')
                            ? 'bearish'
                            : tx.txType.includes('Gom')
                            ? 'bullish'
                            : 'neutral'
                        }
                      >
                        {tx.txType}
                      </Badge>
                      <span className="text-xs font-bold text-white font-mono-numbers">{tx.amount}</span>
                      <span className="text-xs text-slate-400">({tx.usdValue})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                      <span>Từ: {tx.from}</span>
                      <span>→</span>
                      <span>Đến: {tx.to}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-mono-numbers">{tx.timestamp}</span>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">Tx: {tx.hash}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: CryptoQuant Netflow & Whale Alert Live Feed */}
        <div className="lg:col-span-5 space-y-6">
          {/* CryptoQuant: Exchange Netflow */}
          <div className="bg-[#0d131f] border border-slate-800/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-400" />
                  CryptoQuant: Exchange Netflow (7 Ngày)
                </h3>
                <p className="text-xs text-slate-400">
                  Tổng lượng BTC nạp (+) hoặc rút (-) khỏi toàn bộ sàn
                </p>
              </div>
              <Badge tone="bullish">Gom ròng liên tục</Badge>
            </div>

            <div className="space-y-1.5 pt-2">
              {netflows.map((day) => {
                const isOutflow = day.netflow < 0;
                return (
                  <div key={day.date} className="flex items-center justify-between text-xs py-1 hover:bg-slate-800/30 px-1 rounded">
                    <span className="text-slate-400 font-mono-numbers w-12">{day.date}</span>

                    <div className="flex-1 mx-3 flex items-center gap-2">
                      <div className="w-full bg-[#070a10] h-3 rounded overflow-hidden flex items-center">
                        <div
                          className={`h-full ${isOutflow ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(100, (Math.abs(day.netflow) / 10000) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-right font-mono-numbers min-w-[75px]">
                      <span className={isOutflow ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {day.netflow.toLocaleString()} BTC
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-emerald-300">
              ✅ <strong>Quy luật On-Chain:</strong> Khi coin bị rút khỏi sàn cất vào ví lạnh (Netflow âm), nguồn cung bán kiệt quệ, tạo đà bứt phá giá dài hạn.
            </div>
          </div>

          {/* Whale Alert Live Feed */}
          <div className="bg-[#0d131f] border border-slate-800/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span className="text-slate-200 font-bold">Whale Alert Live Feed</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Lệnh cá voi lớn khớp trực tiếp trên sổ lệnh Binance Spot
                </p>
              </div>

              <div className="flex items-center gap-1 bg-[#070a10] p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setTxFilter('all')}
                  className={`px-2 py-0.5 text-[10px] rounded cursor-pointer ${
                    txFilter === 'all' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setTxFilter('from_exchange')}
                  className={`px-2 py-0.5 text-[10px] rounded cursor-pointer ${
                    txFilter === 'from_exchange'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  Mua (Gom)
                </button>
                <button
                  onClick={() => setTxFilter('to_exchange')}
                  className={`px-2 py-0.5 text-[10px] rounded cursor-pointer ${
                    txFilter === 'to_exchange'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800/40 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  Bán (Xả)
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto pr-1">
              {filteredWhaleAlerts.map((wa) => (
                <div key={wa.id} className="py-2.5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono-numbers">
                        {wa.amount.toLocaleString()} {wa.symbol}
                      </span>
                      <span className="text-slate-300 font-mono-numbers font-semibold">
                        (${wa.amountUsdMillion}M)
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono-numbers">{wa.timeAgo}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="truncate">{wa.from}</span>
                    <span>→</span>
                    <span className="truncate">{wa.to}</span>
                  </div>

                  {wa.highlightNotice && (
                    <div
                      className={`text-[10px] font-medium ${
                        wa.txType === 'from_exchange'
                          ? 'text-emerald-400'
                          : wa.txType === 'to_exchange'
                          ? 'text-rose-400'
                          : 'text-slate-300'
                      }`}
                    >
                      ▸ {wa.highlightNotice}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
