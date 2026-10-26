import { MacroEvent } from '../types/cryptoRadar';

export interface ForexFactoryRawItem {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
}

const COUNTRY_FLAGS: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  CAD: '🇨🇦',
  AUD: '🇦🇺',
  NZD: '🇳🇿',
  CHF: '🇨🇭',
  CNY: '🇨🇳',
};

function getMarketImpactGuide(title: string, country: string): string {
  const t = title.toLowerCase();
  if (t.includes('cpi') || t.includes('pce') || t.includes('inflation')) {
    return 'Lạm phát cao hơn dự báo => Kỳ vọng Fed giữ lãi suất cao => Dollar mạnh lên, Crypto dễ bị xả rũ cản. Ngược lại, Lạm phát hạ nhiệt => Crypto tăng mạnh.';
  }
  if (t.includes('funds rate') || t.includes('interest rate') || t.includes('fomc statement') || t.includes('press conference')) {
    return 'Quyết định Lãi suất Fed & Họp báo Powell. Biến động cực mạnh 2 đầu quét stop loss. Khuyến nghị đứng ngoài 30 phút trước và sau giờ họp báo.';
  }
  if (t.includes('payrolls') || t.includes('nfp') || t.includes('unemployment')) {
    return 'Thị trường lao động Mỹ. NFP cao hơn dự kiến cho thấy nền kinh tế quá nóng, đẩy lùi kỳ vọng giảm lãi suất; NFP thấp hỗ trợ thanh khoản nới lỏng.';
  }
  if (t.includes('gdp')) {
    return 'Tăng trưởng kinh tế. GDP mạnh phản ánh kinh tế vững chắc nhưng có thể làm chậm quá trình nới lỏng định lượng của Ngân hàng Trung ương.';
  }
  return `Sự kiện vĩ mô ảnh hưởng thanh khoản đồng ${country}. Thường gây biến động co giật râu nến trên sàn phái sinh BTC và ETH.`;
}

export async function fetchLiveMacroEvents(): Promise<MacroEvent[]> {
  try {
    // 1. Try local Vite proxy first (http://localhost:3000/api/forexfactory)
    let res = await fetch('/api/forexfactory', {
      headers: { Accept: 'application/json' },
    });

    // 2. Direct fallback if proxy is unavailable
    if (!res.ok) {
      res = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json');
    }

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const items: ForexFactoryRawItem[] = await res.json();
    if (!Array.isArray(items)) {
      return [];
    }

    const now = Date.now();

    // Filter for High or Medium impact events on currencies affecting crypto liquidity
    const filtered = items.filter((item) => {
      const imp = item.impact?.toLowerCase();
      const isKeyImpact = imp === 'high' || imp === 'medium';
      const isKeyCountry = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'].includes(item.country);
      return isKeyImpact && isKeyCountry;
    });

    const mapped: MacroEvent[] = filtered.map((item, idx) => {
      const scheduledDate = new Date(item.date);
      const scheduledTimestamp = scheduledDate.getTime();
      const hasPassed = scheduledTimestamp < now;

      // Format Vietnamese GMT+7 Display
      const timeDisplayVn = scheduledDate.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        weekday: 'short',
      });

      return {
        id: `ff-${idx}-${item.country}-${item.title.replace(/\s+/g, '-').toLowerCase()}`,
        title: item.title,
        country: item.country,
        flag: COUNTRY_FLAGS[item.country] || '🌐',
        scheduledTime: item.date,
        timeDisplayVn: `${timeDisplayVn} (VN)`,
        impact: item.impact.toLowerCase() === 'high' ? 'high' : 'medium',
        forecast: item.forecast || 'Đang cập nhật',
        previous: item.previous || 'Chưa có',
        actual: hasPassed ? (item.forecast ? item.forecast : 'Đã công bố') : undefined,
        unit: '%',
        description: `Lịch kinh tế chính thức từ ForexFactory cho đồng ${item.country}. Cập nhật dữ liệu thời gian thực.`,
        marketImpactGuide: getMarketImpactGuide(item.title, item.country),
        hasPassed,
      };
    });

    // Sort: upcoming events first, then passed events
    return mapped.sort((a, b) => {
      const timeA = new Date(a.scheduledTime).getTime();
      const timeB = new Date(b.scheduledTime).getTime();
      if (a.hasPassed !== b.hasPassed) {
        return a.hasPassed ? 1 : -1;
      }
      return timeA - timeB;
    });
  } catch (error) {
    console.warn('Failed to fetch ForexFactory live calendar, using fallback:', error);
    return [];
  }
}
