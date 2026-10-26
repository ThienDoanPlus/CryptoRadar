export interface PortalLink {
  pillarId: number;
  name: string;
  url: string;
  role: string;
  freeFeatures: string;
}

export const DIRECT_PORTAL_LINKS: PortalLink[] = [
  {
    pillarId: 1,
    name: 'Coinglass Liquidation Heatmap',
    url: 'https://www.coinglass.com/pro/futures/LiquidationHeatMap',
    role: 'Bản đồ nhiệt quét thanh lý & Coinbase Premium',
    freeFeatures: 'Xem cụm Long/Short dồn cục, Funding Rate, Open Interest toàn sàn',
  },
  {
    pillarId: 2,
    name: 'Arkham Intelligence',
    url: 'https://platform.arkhamintelligence.com/',
    role: 'Sơ đồ hình cây ví Chính phủ Mỹ & Quỹ lớn',
    freeFeatures: 'Gõ US Government, MicroStrategy, BlackRock để soi số dư thời gian thực',
  },
  {
    pillarId: 2,
    name: 'CryptoQuant Exchange Netflow',
    url: 'https://cryptoquant.com/',
    role: 'Chỉ số nạp/rút coin ròng toàn bộ sàn giao dịch',
    freeFeatures: 'Coin rút khỏi sàn liên tục = tín hiệu gom hàng tổ chức',
  },
  {
    pillarId: 3,
    name: 'Farside Investors ETF Flow',
    url: 'https://farside.co.uk/btc/',
    role: 'Bảng tổng hợp dòng tiền ETF Phố Wall mỗi ngày',
    freeFeatures: 'Cập nhật 4h-5h sáng VN sau khi phiên New York đóng cửa',
  },
  {
    pillarId: 4,
    name: 'ForexFactory Macro Calendar',
    url: 'https://www.forexfactory.com/',
    role: 'Lịch tin tức kinh tế thẻ ĐỎ đếm ngược từng giây',
    freeFeatures: 'Lọc thẻ ĐỎ (CPI, NFP, Fed), chỉnh GMT+7, Actual vs Forecast',
  },
  {
    pillarId: 5,
    name: 'Token.unlocks App',
    url: 'https://token.unlocks.app/',
    role: 'Lịch mở khóa Cliff & đợt xả của Quỹ VCs',
    freeFeatures: 'Soi ngày mở khóa, % token xả, lịch Cliff các dự án TIA, ARB, SUI, OP',
  },
];
