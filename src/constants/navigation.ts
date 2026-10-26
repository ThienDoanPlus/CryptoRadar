import { TabId } from '../types/cryptoRadar';

export interface NavigationItem {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: string;
  badge?: string;
  description: string;
}

export const MAIN_NAV_ITEMS: readonly NavigationItem[] = [
  {
    id: 'overview',
    label: 'Tổng quan Thị trường',
    shortLabel: 'Tổng quan',
    icon: '📊',
    description: 'Bản đồ tổng thể kết hợp 5 trụ cột quan sát số liệu',
  },
  {
    id: 'liquidation',
    label: '1. Bản đồ Thanh khoản & OI',
    shortLabel: 'Thanh khoản',
    icon: '⚡',
    badge: 'Coinglass',
    description: 'Bản đồ nhiệt săn thanh lý & Open Interest',
  },
  {
    id: 'whales',
    label: '2. Soi ví Cá voi & On-chain',
    shortLabel: 'Cá voi On-chain',
    icon: '🐋',
    badge: 'Arkham',
    description: 'Ví Chính phủ Mỹ, các quỹ lớn & dòng coin sàn',
  },
  {
    id: 'etf',
    label: '3. Dòng tiền ETF Phố Wall',
    shortLabel: 'ETF Phố Wall',
    icon: '🏛️',
    badge: 'Farside',
    description: 'Dòng vốn ròng Spot BTC & ETH ETF hàng ngày',
  },
  {
    id: 'macro',
    label: '4. Lịch Vĩ mô Thẻ Đỏ',
    shortLabel: 'Lịch Vĩ mô',
    icon: '⏰',
    badge: 'ForexFactory',
    description: 'Tin tức kinh tế tác động trực tiếp đến USD & Crypto',
  },
  {
    id: 'unlocks',
    label: '5. Lịch Mở khóa Token',
    shortLabel: 'Token Unlocks',
    icon: '🔓',
    badge: 'DefiLlama',
    description: 'Áp lực pha loãng & lịch xả hàng Altcoin từ các quỹ',
  },
] as const;
