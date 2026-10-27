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
  if (
    t.includes('funds rate') ||
    t.includes('interest rate') ||
    t.includes('fomc statement') ||
    t.includes('press conference')
  ) {
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

// Hàm hỗ trợ tạo lịch vĩ mô mặc định có ngày động theo tuần hiện tại
function generateDefaultMacroEvents(): MacroEvent[] {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diffToMonday));

  const createEventDate = (daysFromMonday: number, hours: number, minutes: number) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + daysFromMonday);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  const rawEvents = [
    {
      title: 'Fed Interest Rate Decision & FOMC Statement',
      country: 'USD',
      date: createEventDate(2, 19, 0), // 19:00 UTC
      impact: 'high' as const,
      forecast: '4.50%',
      previous: '4.75%',
      description: 'Quyết định Lãi suất Quỹ Liên bang Mỹ (FOMC). Sự kiện rủi ro cấp độ 1 quyết định thanh khoản toàn cầu.',
      marketImpactGuide: 'Quyết định Lãi suất Fed & Họp báo Powell. Biến động cực mạnh 2 đầu quét stop loss.',
    },
    {
      title: 'FOMC Press Conference (Chủ Tịch Jerome Powell Họp Báo)',
      country: 'USD',
      date: createEventDate(2, 19, 30),
      impact: 'high' as const,
      forecast: 'Trực tiếp',
      previous: 'Diều hâu',
      description: 'Phát biểu định hướng chính sách tiền tệ tiếp theo của Jerome Powell.',
      marketImpactGuide: 'Từng câu từ của Powell có thể giật râu nến 1,000 - 3,000 giá BTC ngay lập tức.',
    },
    {
      title: 'Core CPI m/m & CPI y/y (Chỉ Số Giá Tiêu Dùng Mỹ)',
      country: 'USD',
      date: createEventDate(3, 13, 30),
      impact: 'high' as const,
      forecast: '0.3%',
      previous: '0.3%',
      description: 'Thước đo lạm phát tiêu chuẩn của nền kinh tế Mỹ.',
      marketImpactGuide: 'Lạm phát cao hơn dự báo => Dollar tăng, Crypto giảm. Lạm phát hạ nhiệt => Crypto tăng mạnh.',
    },
    {
      title: 'Non-Farm Employment Change (NFP Mỹ)',
      country: 'USD',
      date: createEventDate(4, 13, 30),
      impact: 'high' as const,
      forecast: '145K',
      previous: '128K',
      description: 'Số lượng việc làm phi nông nghiệp được tạo ra trong tháng.',
      marketImpactGuide: 'NFP cao hơn dự kiến cho thấy kinh tế quá nóng, đẩy lùi kỳ vọng hạ lãi suất.',
    },
    {
      title: 'Unemployment Rate (Tỷ Lệ Thất Nghiệp Mỹ)',
      country: 'USD',
      date: createEventDate(4, 13, 30),
      impact: 'high' as const,
      forecast: '4.1%',
      previous: '4.1%',
      description: 'Tỷ lệ người lao động thất nghiệp đang tích cực tìm kiếm việc làm tại Mỹ.',
      marketImpactGuide: 'Thất nghiệp tăng nhẹ thúc đẩy Fed nới lỏng chính sách tiền tệ nhanh hơn.',
    },
    {
      title: 'ECB Main Refinancing Rate (Lãi Suất Ngân Hàng Trung Ương Châu Âu)',
      country: 'EUR',
      date: createEventDate(3, 12, 15),
      impact: 'high' as const,
      forecast: '3.25%',
      previous: '3.40%',
      description: 'Quyết định lãi suất chính thức của Ngân hàng Trung ương Châu Âu.',
      marketImpactGuide: 'Tác động trực tiếp đến tỷ giá EUR/USD và thanh khoản tiền pháp định toàn cầu.',
    },
    {
      title: 'Advance GDP q/q (Tăng Trưởng GDP Mỹ Quý)',
      country: 'USD',
      date: createEventDate(3, 13, 30),
      impact: 'high' as const,
      forecast: '2.8%',
      previous: '3.0%',
      description: 'Tổng sản phẩm quốc nội sơ bộ quý của Hoa Kỳ.',
      marketImpactGuide: 'GDP mạnh phản ánh kinh tế vững chắc nhưng có thể làm chậm quá trình hạ lãi suất.',
    },
    {
      title: 'Core PCE Price Index m/m (Chỉ Số Lạm Phát Ưa Thích Của Fed)',
      country: 'USD',
      date: createEventDate(4, 13, 30),
      impact: 'high' as const,
      forecast: '0.3%',
      previous: '0.2%',
      description: 'Chỉ số chi tiêu tiêu dùng cá nhân lõi - thước đo lạm phát cốt lõi mà Fed tin cậy nhất.',
      marketImpactGuide: 'PCE hạ nhiệt là tín hiệu xanh mạnh nhất cho thị trường tiền mã hóa bùng nổ.',
    },
  ];

  const nowMs = Date.now();

  return rawEvents.map((item, idx) => {
    const scheduledDate = new Date(item.date);
    const scheduledTimestamp = scheduledDate.getTime();
    const hasPassed = scheduledTimestamp < nowMs;

    const timeDisplayVn = scheduledDate.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      weekday: 'short',
    });

    return {
      id: `default-ff-${idx}-${item.country}`,
      title: item.title,
      country: item.country,
      flag: COUNTRY_FLAGS[item.country] || '🇺🇸',
      scheduledTime: item.date,
      timeDisplayVn: `${timeDisplayVn} (VN)`,
      impact: item.impact,
      forecast: item.forecast,
      previous: item.previous,
      actual: hasPassed ? item.forecast : undefined,
      unit: '%',
      description: item.description,
      marketImpactGuide: item.marketImpactGuide,
      hasPassed,
    };
  });
}

export const DEFAULT_MACRO_EVENTS: MacroEvent[] = generateDefaultMacroEvents();

export async function fetchLiveMacroEvents(): Promise<MacroEvent[]> {
  try {
    // 1. Thử gọi API Serverless nội bộ (/api/forexfactory) - hoạt động tốt cả trên Vercel, Render và Local
    let res: Response | null = null;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      res = await fetch('/api/forexfactory', {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);
    } catch (e) {
      // Bỏ qua lỗi và chuyển sang fallback
    }

    // 2. Fallback CORS Proxy nếu chạy client độc lập
    if (!res || !res.ok) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        res = await fetch('https://api.allorigins.win/raw?url=https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
          signal: controller.signal,
        });
        clearTimeout(timeout);
      } catch (e) {
        // Fallback tiếp
      }
    }

    // 3. Fallback trực tiếp
    if (!res || !res.ok) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        res = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
          signal: controller.signal,
        });
        clearTimeout(timeout);
      } catch (e) {
        // Fallback
      }
    }

    if (!res || !res.ok) {
      console.warn('Tất cả các nguồn ForexFactory trực tiếp đều không phản hồi, sử dụng dữ liệu vĩ mô cơ sở.');
      return DEFAULT_MACRO_EVENTS;
    }

    const items: ForexFactoryRawItem[] = await res.json();
    if (!Array.isArray(items) || items.length === 0) {
      return DEFAULT_MACRO_EVENTS;
    }

    const now = Date.now();

    // Lọc các tin tức Thẻ Đỏ (High) hoặc Thẻ Cam (Medium) ảnh hưởng đến thanh khoản tiền mã hóa
    const filtered = items.filter((item) => {
      const imp = item.impact?.toLowerCase();
      const isKeyImpact = imp === 'high' || imp === 'medium';
      const isKeyCountry = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'].includes(item.country);
      return isKeyImpact && isKeyCountry;
    });

    if (filtered.length === 0) {
      return DEFAULT_MACRO_EVENTS;
    }

    const mapped: MacroEvent[] = filtered.map((item, idx) => {
      const scheduledDate = new Date(item.date);
      const scheduledTimestamp = scheduledDate.getTime();
      const hasPassed = scheduledTimestamp < now;

      // Định dạng ngày giờ hiển thị múi giờ Việt Nam GMT+7
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

    // Sắp xếp: sự kiện sắp tới lên trước, sau đó đến các sự kiện đã qua
    return mapped.sort((a, b) => {
      const timeA = new Date(a.scheduledTime).getTime();
      const timeB = new Date(b.scheduledTime).getTime();
      if (a.hasPassed !== b.hasPassed) {
        return a.hasPassed ? 1 : -1;
      }
      return timeA - timeB;
    });
  } catch (error) {
    console.warn('Lỗi xử lý ForexFactory calendar, sử dụng dữ liệu cơ sở:', error);
    return DEFAULT_MACRO_EVENTS;
  }
}
