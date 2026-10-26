import { MorningChecklistStep } from '../types/cryptoRadar';

export const MORNING_CHECKLIST_STEPS: MorningChecklistStep[] = [
  {
    id: 1,
    durationMinutes: 1,
    title: 'Bước 1: Soi Dòng Tiền ETF Phố Wall (Farside Investors)',
    toolName: 'Farside Investors',
    toolUrl: 'https://farside.co.uk/btc/',
    targetTab: 'etf',
    description: 'Sau khi phiên Mỹ đóng cửa (4h–5h sáng giờ VN), kiểm tra xem BlackRock, Fidelity và toàn bộ Phố Wall đêm qua MUA RÒNG hay BÁN RÒNG.',
    keyQuestions: [
      'Cột Tổng Net Flow đêm qua là Màu Xanh (Dương) hay Màu Đỏ (Âm)?',
      'IBIT (BlackRock) nạp thêm bao nhiêu trăm triệu USD Spot?',
      'Grayscale (GBTC) xả nhiều hay ít so với các phiên trước?',
    ],
    isCompleted: false,
  },
  {
    id: 2,
    durationMinutes: 1,
    title: 'Bước 2: Quét Lịch Tin Tức Vĩ Mô Màu ĐỎ (ForexFactory)',
    toolName: 'ForexFactory.com',
    toolUrl: 'https://www.forexfactory.com/',
    targetTab: 'macro',
    description: 'Xem hôm nay và tối nay có tin tức vĩ mô màu ĐỎ (High Impact) nào không (CPI, PPI, NFP hay Fed họp) để hẹn giờ báo thức.',
    keyQuestions: [
      'Tối nay 19:30 hoặc 01:00 sáng mai có tin thẻ đỏ nào không?',
      'Con số dự báo (Forecast) đang nghiêng về tốt hay xấu?',
      'Đã bật chuông cảnh báo trước 15-30 phút chưa?',
    ],
    isCompleted: false,
  },
  {
    id: 3,
    durationMinutes: 1,
    title: 'Bước 3: Xem Bản Đồ Thanh Lý & Coinbase Premium (Coinglass)',
    toolName: 'Coinglass.com',
    toolUrl: 'https://www.coinglass.com/pro/futures/LiquidationHeatMap',
    targetTab: 'liquidation',
    description: 'Xác định các cụm thanh khoản của BTC, ETH, SOL, XRP để biết chính xác Cá voi chuẩn bị đạp về đâu để quét Stop Loss.',
    keyQuestions: [
      'Cụm thanh lý Long dày nhất nằm ở mức giá nào bên dưới?',
      'Coinbase Premium Index đang Xanh (Tây mua Spot) hay Đỏ (Tây xả)?',
      'Funding Rate có đang quá nóng (dương cao) cảnh báo sắp sập quét Long không?',
    ],
    isCompleted: false,
  },
  {
    id: 4,
    durationMinutes: 2,
    title: 'Bước 4: Cài Đặt Cảnh Báo Trên Biểu Đồ (TradingView / Binance)',
    toolName: 'TradingView & Binance',
    toolUrl: 'https://www.tradingview.com/',
    targetTab: 'overview',
    description: 'Mở biểu đồ, đánh dấu các vùng Hỗ trợ/Kháng cự On-chain và cụm thanh lý vừa tìm được. Đặt Alerts thông báo rồi yên tâm đi làm việc khác!',
    keyQuestions: [
      'Đã vẽ ranh giới bẫy thanh khoản cá voi vào TradingView chưa?',
      'Đã đặt cảnh báo giá (Price Alert) cách vùng thanh lý 0.5% - 1% chưa?',
      'Tâm lý hôm nay: Bình tĩnh theo số liệu, không FOMO theo tin đồn!',
    ],
    isCompleted: false,
  },
];
