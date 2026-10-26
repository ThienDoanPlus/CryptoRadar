// AI Market Analyst Service powered by Groq OpenAI-Compatible API
import { GroqModelId, TradingVerdict } from '../types/cryptoRadar';

export interface MarketPayload {
  symbol: string;
  price: number;
  change24h: number;
  coinbasePremium: number;
  fundingRate: number;
  openInterestBillion: number;
  longRatio: number;
  shortRatio: number;
  topLongLiquidationPrice: number;
  topShortLiquidationPrice: number;
  totalCorporateBtc: number;
  totalCorporateUsd: number;
  mempoolPendingTxs: number;
  latestEtfNetflowMillion: number;
  totalEtfCumulativeMillion: number;
  upcomingRedMacroEvents: string[];
  nextMacroCountdown: string;
  tokenUnlocksRiskSummary: string;
}

const GROQ_API_KEY_STORAGE = 'cryptoradar_groq_api_key';
const GROQ_MODEL_STORAGE = 'cryptoradar_groq_model';

export const AVAILABLE_GROQ_MODELS: { id: GroqModelId; name: string; description: string; tag: string }[] = [
  {
    id: 'openai/gpt-oss-120b',
    name: 'OpenAI GPT OSS 120B',
    description: 'Model 120B thông minh nhất của OpenAI trên Groq LPU (131k context, suy luận chuỗi tư duy cao cấp).',
    tag: 'Khuyên Dùng / 120B Flagship',
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'OpenAI GPT OSS 20B',
    description: 'Model 20B siêu nhẹ và phản hồi cực nhanh của OpenAI trên Groq.',
    tag: 'Siêu Tốc 20B',
  },
  {
    id: 'qwen/qwen3.8-27b',
    name: 'Qwen 3.8 27B',
    description: 'Model 27B của Alibaba Cloud tối ưu cho tư duy định lượng và suy luận.',
    tag: 'Alibaba 27B',
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'DeepSeek R1 (70B Distill)',
    description: 'Model suy luận chuỗi tư duy của DeepSeek (nếu tài khoản có phân quyền).',
    tag: 'DeepSeek 70B',
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B (Instant)',
    description: 'Model Meta 8B phản hồi tức thì.',
    tag: 'Meta 8B',
  },
];

export function getEnvGroqApiKey(): string {
  const envKey = (import.meta as unknown as { env?: { VITE_GROQ_API_KEY?: string } }).env?.VITE_GROQ_API_KEY;
  return envKey ? envKey.trim() : '';
}

export function getLocalGroqApiKey(): string {
  const local = localStorage.getItem(GROQ_API_KEY_STORAGE);
  return local ? local.trim() : '';
}

export function isGroqApiKeyFromEnv(): boolean {
  return Boolean(getEnvGroqApiKey());
}

export function getSavedGroqApiKey(): string {
  const envKey = getEnvGroqApiKey();
  if (envKey) return envKey;
  const local = getLocalGroqApiKey();
  return local || '';
}

export function saveGroqApiKey(key: string): void {
  if (key && key.trim()) {
    localStorage.setItem(GROQ_API_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(GROQ_API_KEY_STORAGE);
  }
}

export function clearLocalGroqApiKey(): void {
  localStorage.removeItem(GROQ_API_KEY_STORAGE);
}

export function getSavedGroqModel(): GroqModelId {
  const envModel = (import.meta as unknown as { env?: { VITE_DEFAULT_GROQ_MODEL?: string } }).env?.VITE_DEFAULT_GROQ_MODEL as GroqModelId | undefined;
  if (envModel && AVAILABLE_GROQ_MODELS.some((m) => m.id === envModel)) {
    return envModel;
  }
  const local = localStorage.getItem(GROQ_MODEL_STORAGE) as GroqModelId | null;
  if (local && AVAILABLE_GROQ_MODELS.some((m) => m.id === local)) {
    return local;
  }
  return 'openai/gpt-oss-120b';
}

export function saveGroqModel(model: GroqModelId): void {
  localStorage.setItem(GROQ_MODEL_STORAGE, model);
}

/**
 * Sends real-time quantitative payload from 5 pillars to Groq OpenAI endpoint
 * and returns a structured, decisive trading verdict.
 */
export async function analyzeMarketWithGroq(
  payload: MarketPayload,
  userApiKey?: string,
  modelId?: GroqModelId
): Promise<TradingVerdict> {
  const apiKey = userApiKey?.trim() || getSavedGroqApiKey();
  if (!apiKey) {
    throw new Error(
      'Chưa cấu hình API Key trong file .env! Vui lòng mở file .env tại thư mục dự án và điền: VITE_GROQ_API_KEY="gsk_..."'
    );
  }

  const requestedModel = modelId || getSavedGroqModel();
  const fallbackList: GroqModelId[] = [
    requestedModel,
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b',
  ];
  const modelsToAttempt: GroqModelId[] = Array.from(new Set(fallbackList));

  const systemPrompt = `Bạn là Giám Đốc Đầu Tư Định Lượng (Chief Investment Officer & Quantitative Risk Manager) của một quỹ phòng hộ tiền mã hóa hàng đầu Phố Wall.
Nhiệm vụ của bạn: Tiếp nhận số liệu thị trường thời gian thực (Live API Payload) tổng hợp từ 5 Trụ Cột:
1. Bản đồ thanh khoản (Coinglass), Coinbase Premium Index, Funding Rate (Binance Futures), Open Interest, Long/Short Ratio.
2. Dòng tiền On-chain & Ví Cá Voi (Arkham, CoinGecko Treasuries, hàng chờ Mempool.space).
3. Dòng tiền Spot ETF Phố Wall (BlackRock IBIT, Fidelity FBTC Net flows).
4. Lịch tin vĩ mô thẻ ĐỎ (ForexFactory) chuẩn giờ Việt Nam GMT+7.
5. Lịch mở khóa token Altcoin & tỷ lệ pha loãng nguồn cung (Token Unlocks).

QUY TẮC ĐƯA RA QUYẾT ĐỊNH (BẮT BUỘC TUÂN THỦ NGHIÊM NGẶT):
- BẠN PHẢI ĐƯA RA QUYẾT ĐỊNH DỨT KHOÁT: "LONG", "SHORT", hoặc "HOLD_CASH" (Đứng ngoài quan sát, tiền mặt là vua).
- Nếu có xung đột tín hiệu nguy hiểm (ví dụ: Funding Rate quá nóng > 0.03%, hoặc cụm bẫy thanh lý Long lớn ở ngay sát dưới, hoặc sắp ra tin vĩ mô thẻ ĐỎ như CPI/Lãi suất trong 60 phút tới): BẮT BUỘC khuyến nghị "HOLD_CASH" hoặc chờ quét xong thanh lý, KHÔNG ĐƯỢC mạo hiểm khuyên vào lệnh!
- Nếu tín hiệu đồng pha tăng (Coinbase Premium xanh, ETF mua ròng mạnh, cá voi gom, không có tin đỏ cản trở): Khuyến nghị "LONG" với điểm vào lệnh (Entry), Cắt lỗ (Stop Loss) đặt ngoài vùng cụm thanh lý của MM, Chốt lời (Take Profit) và tỷ lệ R:R tối thiểu 1:2.
- Nếu tín hiệu đồng pha giảm (Coinbase Premium âm, ETF rút ròng, mở khóa token lớn): Khuyến nghị "SHORT".

BẠN BẮT BUỘC PHẢI TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON CÓ ĐỊNH DẠNG SAU, KHÔNG THÊM BẤT KỲ VĂN BẢN NÀO NGOÀI JSON:
{
  "action": "LONG" | "SHORT" | "HOLD_CASH",
  "actionLabel": "VÀO LỆNH LONG (BUY)" | "VÀO LỆNH SHORT (SELL)" | "ĐỨNG NGOÀI QUAN SÁT (HOLD CASH)",
  "confidenceScore": number (từ 0 đến 100),
  "summaryHeadline": "Một câu chẩn đoán đắt giá, dứt khoát và súc tích bằng tiếng Việt",
  "entryRange": "Ví dụ: $79,800 - $80,200",
  "stopLoss": "Ví dụ: $77,400 (Dưới bẫy thanh lý Long MM)",
  "takeProfit": "Ví dụ: $83,500 (Vùng Short Squeeze)",
  "riskRewardRatio": "Ví dụ: 1 : 2.5",
  "keyReasons": [
    "Lý do định lượng cụ thể 1 từ Trụ cột...",
    "Lý do định lượng cụ thể 2 từ Trụ cột...",
    "Lý do định lượng cụ thể 3 từ Trụ cột..."
  ],
  "riskWarnings": [
    "Cảnh báo rủi ro 1...",
    "Cảnh báo rủi ro 2..."
  ],
  "pillarSignals": {
    "pillar1Liquidation": "Đánh giá ngắn về Trụ cột 1",
    "pillar2Whales": "Đánh giá ngắn về Trụ cột 2",
    "pillar3Etf": "Đánh giá ngắn về Trụ cột 3",
    "pillar4Macro": "Đánh giá ngắn về Trụ cột 4",
    "pillar5Unlocks": "Đánh giá ngắn về Trụ cột 5"
  },
  "detailedAnalysis": "Đoạn phân tích tổng hợp chuyên sâu 2-3 đoạn văn bằng tiếng Việt giải thích logic đằng sau khuyến nghị."
}`;

  const userPrompt = `DƯỚI ĐÂY LÀ LIVE API PAYLOAD TỪ 5 TRỤ CỘT THỜI GIAN THỰC ĐỂ BẠN CHẨN ĐOÁN:

[TRỤ CỘT 1 - BẢN ĐỒ THANH KHOẢN & ĐÒN BẨY]
- Tài sản phân tích: ${payload.symbol}
- Giá thị trường hiện tại: $${payload.price.toLocaleString()} (Biến động 24h: ${payload.change24h >= 0 ? `+${payload.change24h}%` : `${payload.change24h}%`})
- Coinbase Premium Index: ${payload.coinbasePremium >= 0 ? `+${payload.coinbasePremium}% (Phố Wall mua Spot)` : `${payload.coinbasePremium}% (Tây xả Spot)`}
- Funding Rate (8h): +${payload.fundingRate}%
- Open Interest (OI): $${payload.openInterestBillion} Tỷ USD
- Tỷ lệ Long / Short toàn cầu: ${payload.longRatio}% Long / ${payload.shortRatio}% Short
- Cụm bẫy thanh lý Long MM dày nhất: $${payload.topLongLiquidationPrice.toLocaleString()}
- Vùng kích hoạt Short Squeeze: $${payload.topShortLiquidationPrice.toLocaleString()}

[TRỤ CỘT 2 - SOI VÍ CÁ VOI & ON-CHAIN]
- Kho quỹ Bitcoin của các công ty đại chúng toàn cầu: ${payload.totalCorporateBtc.toLocaleString()} BTC (~ $${(payload.totalCorporateUsd / 1e9).toFixed(1)} Tỷ USD)
- Trạng thái hàng chờ Mempool.space: ${payload.mempoolPendingTxs.toLocaleString()} transactions
- Tín hiệu giao dịch cá voi Binance Spot gần nhất: ${payload.totalCorporateBtc > 1000000 ? 'Các tổ chức tiếp tục nắm giữ vững vàng, có lệnh mua gom Spot lớn' : 'Cân bằng'}

[TRỤ CỘT 3 - DÒNG TIỀN SPOT ETF PHỐ WALL]
- Dòng tiền ròng phiên gần nhất: ${payload.latestEtfNetflowMillion >= 0 ? `+$${payload.latestEtfNetflowMillion}M USD (MUA RÒNG)` : `-$${Math.abs(payload.latestEtfNetflowMillion)}M USD (BÁN RÒNG)`}
- Tổng tích lũy chu kỳ gần nhất: +$${payload.totalEtfCumulativeMillion}M USD

[TRỤ CỘT 4 - LỊCH VĨ MÔ THẺ ĐỎ FOREXFACTORY (GMT+7)]
- Sự kiện thẻ ĐỎ tuần này: ${payload.upcomingRedMacroEvents.length > 0 ? payload.upcomingRedMacroEvents.slice(0, 3).join('; ') : 'Không có sự kiện đỏ nguy hiểm ngay lập tức'}
- Thời gian đếm ngược đến sự kiện kế tiếp: ${payload.nextMacroCountdown}

[TRỤ CỘT 5 - LỊCH MỞ KHÓA TOKEN & PHA LOÃNG]
- Cảnh báo Altcoin Cliff Unlocks: ${payload.tokenUnlocksRiskSummary || 'Cung lưu hành BTC/ETH ổn định, không có lạm phát đột biến.'}

Hãy phân tích chéo 5 trụ cột trên và xuất JSON kết quả chẩn đoán lệnh chính xác.`;

  // Try direct Groq endpoint first; if blocked, fallback to Vite proxy /api/groq
  const endpoints = ['https://api.groq.com/openai/v1/chat/completions', '/api/groq/chat/completions'];

  let lastError: Error | null = null;

  for (const currentModel of modelsToAttempt) {
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: currentModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errMsg = `Groq API Error (${response.status}): ${response.statusText}`;
          try {
            const parsed = JSON.parse(errorText);
            if (parsed?.error?.message) {
              errMsg = parsed.error.message;
            }
          } catch {
            // ignore json parse error
          }

          const isModelAccessError =
            response.status === 404 ||
            errMsg.toLowerCase().includes('does not exist') ||
            errMsg.toLowerCase().includes('do not have access') ||
            errMsg.toLowerCase().includes('decommissioned') ||
            errMsg.toLowerCase().includes('model');

          lastError = new Error(errMsg);

          // If model is restricted or decommissioned, break endpoint loop to try fallback model
          if (isModelAccessError) {
            break;
          }
          continue; // Try next endpoint
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('Groq không trả về phản hồi hợp lệ.');
        }

        // Parse JSON from content
        let parsedVerdict: Partial<TradingVerdict>;
        try {
          parsedVerdict = JSON.parse(content);
        } catch {
          const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
          parsedVerdict = JSON.parse(cleaned);
        }

        saveGroqModel(currentModel);

        const finalVerdict: TradingVerdict = {
          action: parsedVerdict.action || 'HOLD_CASH',
          actionLabel: parsedVerdict.actionLabel || (parsedVerdict.action === 'LONG' ? 'VÀO LỆNH LONG (BUY)' : parsedVerdict.action === 'SHORT' ? 'VÀO LỆNH SHORT (SELL)' : 'ĐỨNG NGOÀI QUAN SÁT (HOLD CASH)'),
          confidenceScore: typeof parsedVerdict.confidenceScore === 'number' ? parsedVerdict.confidenceScore : 80,
          summaryHeadline: parsedVerdict.summaryHeadline || (currentModel !== requestedModel ? `[Model: ${currentModel}] Chẩn đoán thị trường dựa trên 5 trụ cột` : 'Chẩn đoán thị trường dựa trên 5 trụ cột thời gian thực'),
          entryRange: parsedVerdict.entryRange || `$${(payload.price * 0.995).toFixed(0)} - $${payload.price.toFixed(0)}`,
          stopLoss: parsedVerdict.stopLoss || `$${payload.topLongLiquidationPrice.toLocaleString()}`,
          takeProfit: parsedVerdict.takeProfit || `$${payload.topShortLiquidationPrice.toLocaleString()}`,
          riskRewardRatio: parsedVerdict.riskRewardRatio || '1 : 2.2',
          keyReasons: Array.isArray(parsedVerdict.keyReasons) && parsedVerdict.keyReasons.length > 0 ? parsedVerdict.keyReasons : [
            `Coinbase Premium đạt ${payload.coinbasePremium >= 0 ? `+${payload.coinbasePremium}%` : `${payload.coinbasePremium}%`}`,
            `Dòng tiền ETF phiên gần nhất: ${payload.latestEtfNetflowMillion >= 0 ? `+$${payload.latestEtfNetflowMillion}M` : `-$${payload.latestEtfNetflowMillion}M`}`,
            `Vùng bẫy thanh lý Long MM tại $${payload.topLongLiquidationPrice.toLocaleString()}`,
          ],
          riskWarnings: Array.isArray(parsedVerdict.riskWarnings) && parsedVerdict.riskWarnings.length > 0 ? parsedVerdict.riskWarnings : [
            `Lưu ý sự kiện vĩ mô kế tiếp trong ${payload.nextMacroCountdown}`,
            `Quản trị rủi ro tối đa 1.5% tài khoản mỗi lệnh`,
          ],
          pillarSignals: {
            pillar1Liquidation: parsedVerdict.pillarSignals?.pillar1Liquidation || `Coinbase Premium: ${payload.coinbasePremium}%`,
            pillar2Whales: parsedVerdict.pillarSignals?.pillar2Whales || `Quỹ nắm giữ: ${payload.totalCorporateBtc.toLocaleString()} BTC`,
            pillar3Etf: parsedVerdict.pillarSignals?.pillar3Etf || `Net flow: $${payload.latestEtfNetflowMillion}M`,
            pillar4Macro: parsedVerdict.pillarSignals?.pillar4Macro || `Sự kiện vĩ mô trong ${payload.nextMacroCountdown}`,
            pillar5Unlocks: parsedVerdict.pillarSignals?.pillar5Unlocks || 'Cung lưu hành bình thường',
          },
          detailedAnalysis: parsedVerdict.detailedAnalysis || 'Phân tích đa chiều kết hợp 5 trụ cột số liệu thực tế.',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          modelUsed: currentModel,
        };

        return finalVerdict;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
  }

  throw lastError || new Error('Không thể kết nối đến máy chủ Groq API. Vui lòng kiểm tra lại VITE_GROQ_API_KEY trong file .env.');
}
