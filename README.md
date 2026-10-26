# CryptoRadar Pro - He Thong Quan Sat Thi Truong Da Tru Cot & Dinh Luong AI

CryptoRadar Pro la nen tang phan tich du lieu thi truong tai chinh tien ma hoa chuyen sau, duoc thiet ke dua tren mo hinh 5 tru cot dinh luong doc lap ket hop cung cong nghe suy luan tri tue nhan tao do tre thap (Low-Latency LLM Inference via Groq LPU). 

He thong loai bo yeu to cam xuc trong giao dich bang cach tong hop so lieu on-chain, dong von to chuc Wall Street, ban do thanh ly va cac su kien kinh te vi mo de dua ra chan doan vao lenh xac suat cao.

---

## 1. Mo Hinh 5 Tru Cot Dinh Luong (Quantitative Pillars)

He thong hoat dong dua tren 5 nguon du lieu thoi gian thuc, dong bo da chieu de xac dinh dong tien thong minh (Smart Money):

| Tru Cot | Pham Vi Du Lieu | Nguon Cung Cap (Live Data) | Vai Tro Phan Tich |
| :--- | :--- | :--- | :--- |
| **Tru cot 1** | Ban do thanh khoan & Open Interest | Binance Futures WebSocket / Coinglass | Xac dinh cac cum thanh ly (Liquidation Clusters), ty le Long/Short va vung bay gia |
| **Tru cot 2** | On-Chain Wallets & Chinh phu My | Mempool.space API / Arkham Intelligence | Truy van truc tiep blockchain Bitcoin, theo doi vi tich thu DOJ, vi lanh san giao dich va ca voi |
| **Tru cot 3** | Dong von ETF Wall Street & Kho quy | Farside Investors / CoinGecko Holdings | Do luong dong tien ruc rong hang ngay tu cac quy IBIT, FBTC va kho du tru MicroStrategy, Tether |
| **Tru cot 4** | Lich kinh te vi mo & Lai suat Fed | ForexFactory API Feed | Theo doi cac chi so then chot: CPI, PPI, NFP, GDP va quyet dinh lai suat FOMC |
| **Tru cot 5** | Lich mo khoa Token (Token Unlocks) | TokenUnlocks Protocol | Du bao ap luc xa token (Cliff/Linear), ty le phan tram so voi luu hanh va do pha loang |

---

## 2. Co Che Chan Doan Lenh AI (Groq LPU Engine)

He thong tich hop cong nghe suy luan tri tue nhan tao voi toc do xu ly cao thong qua Groq LPU (Language Processing Unit), ap dung cac mo hinh ma nguon mo tien tien:

- **OpenAI GPT OSS 120B**: Mo hinh ly luan chuyen sau, tong hop xac suat phuc tap tu 5 tru cot.
- **OpenAI GPT OSS 20B**: Mo hinh can bang giua toc do phan hoi va do chinh xac tinh toan.
- **Qwen 3.8 27B**: Mo hinh toi uu hoa cho phan tich dinh luong va logic thi truong.

Moi luot phan tich se tu dong tinh toan:
- Hanh dong chieu luoc: `LONG`, `SHORT` hoac `WAIT` (Dung ngoai).
- Diem tin cay (Confidence Score, 0 - 100%).
- Khuyen nghi vung gia vao lenh (Entry Zone), Cat lo (Stop Loss), va Chot loi (Take Profit).
- Ty le loi nhuan tren rui ro (Risk/Reward Ratio).

---

## 3. Kien Truc Luu Tru & Co So Du Lieu (TiDB Cloud Serverless)

CryptoRadar Pro su dung co so du lieu phan tan **TiDB Cloud Serverless** (tuong thich giao thuc MySQL, bao mat SSL) de luu tru vinh vien cac tin hieu giao dich:

- **Bang `ai_verdicts`**: Tu dong ghi nhan moi ket qua phan tich tu LLM bao gom ma coin, muc gia, hanh dong, stop loss, take profit va toan bo lap luan ky thuat.
- **Tu dong dong bo**: Duoc thuc thi bat dong bo o che do nen, khong lam anh huong den toc do phan hoi tren giao dien nguoi dung.
- **Endpoint Quan ly**:
  - `GET /api/verdicts`: Truy van danh sach tin hieu gan nhat theo ma tai san.
  - `POST /api/verdicts`: Ghi nhan ban ghi chan doan moi vao co so du lieu.

---

## 4. Kien Truc Trien Khai & Giam Sat (Deployment Topologies)

He thong duoc kien truc hoa de co the trien khai linh hoat tren ca hai nen tang dien toan dam may pho bien:

### 4.1. Trien khai tren Vercel (Kien truc khuyen nghi)
- **Frontend**: Vite Single Page Application duoc phan phoi qua Global Edge CDN.
- **Backend API**: Serverless Functions duoc xu ly tai thu muc `/api/`.
- **Dac tinh**: Khong bi roi vao trang thai ngu (No cold sleep), toc do phan hoi duoi 1 giay tren pham vi toan cau.
- **Tep cau hinh**: `vercel.json` da duoc thiet lap san rewrites routing cho SPA va Serverless API.

### 4.2. Trien khai tren Render (Container Web Service)
- **Runtime**: Node.js Container thuc thi `server.js` (Express).
- **Phuc vu noi dung**: Dong thoi xu ly REST API va phuc vu file tinh `dist/`.
- **Tep cau hinh**: `render.yaml` dinh nghia Blueprint chuan cho qua trinh Build va Health Check.

### 4.3. Giam sat Uptime 24/7 voi UptimeRobot
- **Health Check Endpoint**: `/api/health`
- **Chuc nang**: Kiem tra tinh trang ket noi toi TiDB Cloud va do tre he thong.
- **Dac biet tren Render**: Cac HTTP ping dinh ky moi 5 phut tu UptimeRobot se giu cho Render Web Service khong bi chuyen sang che do ngu (Sleep mode).

---

## 5. Cong Nghe Su Dung (Technology Stack)

- **Frontend Core**: React 19, TypeScript, Vite 8.
- **Styling**: TailwindCSS v4, Lucide Icons, Framer Motion.
- **Backend & Serverless**: Node.js, Express, Vercel Serverless Functions.
- **Database Driver**: `@tidbcloud/serverless` (HTTP Driver), `mysql2`.
- **AI Infrastructure**: Groq Cloud API (OpenAI Compatible SDK).
- **On-Chain API**: Mempool.space Blockchain REST API.

---

## 6. Huong Dan Cai Dat & Chay Cuc Bo (Local Setup)

### 6.1. Yeu cau he thong
- Node.js phien ban 18.0.0 tro len.
- Trinh quan ly goi `npm` hoac `yarn`.

### 6.2. Cai dat goi phu thuoc
```bash
npm install
```

### 6.3. Thiet lap bien moi truong
Tao file `.env` tai thu muc goc cua du an (tham khao file `.env.example`):

```env
# Groq API Key cho AI Chan Doan
VITE_GROQ_API_KEY="gsk_your_groq_api_key"
VITE_DEFAULT_GROQ_MODEL="openai/gpt-oss-120b"

# TiDB Cloud Serverless (Tuy chon luu tru lich su)
DATABASE_URL="mysql://<user>:<pass>@gateway01.<region>.prod.aws.tidbcloud.com:4000/cryptoradar?ssl={\"rejectUnauthorized\":true}"

# Port may chu noi bo
PORT=3000
```

### 6.4. Chay may chu phat trien (Development Server)
```bash
npm run dev
```
Truy cap trinh duyet tai dia chi: `http://localhost:3000/`.

### 6.5. Kiem tra kieu du lieu va dong goi san pham (Typecheck & Build)
```bash
# Kiem tra loi TypeScript
npm run lint

# Dong goi san pham cho Production
npm run build
```

### 6.6. Chay may chu Production cuc bo
```bash
npm start
```

---

## 7. Cau Truc Thu Muc Du An (Directory Structure)

```text
crypto/
├── api/                             # Vercel Serverless & Express API Handlers
│   ├── _tidb.js                     # TiDB Cloud Serverless Connection & Helpers
│   ├── health.js                    # UptimeRobot Health Check Endpoint
│   └── verdicts.js                  # REST API quan ly tin hieu chot loi/cat lo
├── src/
│   ├── components/
│   │   ├── ai/                      # Module AI Chan Doan Lenh (Groq LLM)
│   │   ├── modals/                  # Cac hop thoai (TiDB History, Alerts, Sources)
│   │   ├── navigation/              # Header va Tab Navigation
│   │   ├── pillars/                 # Giao dien 5 Tru Cot Chuyen Biet
│   │   └── ui/                      # Cac thanh phan Design System co ban
│   ├── constants/                   # Cau hinh routine, portals, danh ba to chuc
│   ├── services/                    # Cac module ket noi Live API (Whales, Forex, AI)
│   ├── types/                       # Khai bao Typescript Interfaces
│   ├── App.tsx                      # Root Application Component
│   └── main.tsx                     # Entry Point
├── server.js                        # Express Production Server (Render Deployment)
├── vercel.json                      # Vercel Deployment & Rewrites Configuration
├── render.yaml                      # Render Blueprint Configuration
├── package.json                     # Scripts & Dependencies
├── vite.config.ts                   # Vite Build & Reverse Proxy Configuration
└── DEPLOY_VERCEL_RENDER_TIDB.md     # Huong dan chi tiet cac buoc trien khai
```

---

## 8. Tai Lieu Ky Thuat Bo Sung

Cac tai lieu bo sung di kem voi du an:
- **[ARCHITECTURE_AND_FLOW.md](ARCHITECTURE_AND_FLOW.md)**: Chi tiet thiet ke he thong, luong du lieu va thuat toan tinh toan chi so 5 tru cot.
- **[DEPLOY_VERCEL_RENDER_TIDB.md](DEPLOY_VERCEL_RENDER_TIDB.md)**: Huong dan chi tiet tung buoc trien khai len Vercel, Render, tao database TiDB Cloud va cai dat UptimeRobot.
- **[RUN.md](RUN.md)**: Huong dan cac cau lenh van hanh, xu ly su co cong mang va danh muc phim tat.

---

## 9. Tuyen Bo Mien Tru Trach Nhiem (Disclaimer)

He thong CryptoRadar Pro duoc xay dung voi muc dich ho tro nghien cuu va quan sat du lieu thi truong dinh luong. Cac nhan dinh va ket qua tu mo hinh AI khong duoc coi la loi khuyen dau tu tai chinh. Nguoi dung can tu chiu trach nhiem ve moi quyet dinh quan ly von va rui ro tren thi truong.
