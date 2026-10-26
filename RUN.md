# 🚀 Tổng Hợp Lệnh Chạy & Hướng Dẫn Vận Hành Dự Án CryptoRadar

> **Dự án:** **CryptoRadar - 5 Trụ Cột Quan Sát Thị Trường Pro**  
> **Công nghệ:** React 19 + TypeScript + Vite 8 + TailwindCSS v4 + Google Gemini AI

---

## 📌 1. Bảng Tổng Hợp Các Lệnh Chạy (Cheat Sheet)

| Mục đích | Lệnh chạy | Ghi chú |
| :--- | :--- | :--- |
| **Cài đặt thư viện** | `npm install` | Đã cấu hình tự động xử lý qua `.npmrc` |
| **Khởi động server dev** | `npm run dev` | Chạy tại: `http://localhost:3000` (host: `0.0.0.0`) |
| **Chạy dev với port tùy chọn** | `npx vite --port=5173` | Dùng khi port 3000 đang bận |
| **Kiểm tra lỗi TypeScript** | `npm run lint` | Chạy `tsc --noEmit` để bắt lỗi kiểu |
| **Đóng gói sản phẩm (Build)** | `npm run build` | Biên dịch ra thư mục `dist/` |
| **Xem trước bản Build** | `npm run preview` | Test preview bản build production nội bộ |
| **Dọn dẹp thư mục build** | `npm run clean` | Xoá `dist` và file tạm |
| **Xóa sạch và cài lại từ đầu** | *(Xem mục Deep Clean bên dưới)* | Dùng khi gặp lỗi cache / dependencies |

---

## 🛠️ 2. Xử Lý Lỗi `npm install` (`edgesOut`)

Nếu bạn vừa gặp lỗi sau khi chạy `npm install`:
```text
npm error Cannot read properties of null (reading 'edgesOut')
```

### 🔍 Nguyên nhân:
Đây là lỗi nội bộ của thuật toán phân giải cây phụ thuộc (Arborist) trên npm khi cài đặt các dự án sử dụng **React 19** cùng các thư viện có peer dependencies cũ hơn.

### ✅ Giải pháp đã áp dụng:
Đã bổ sung file cấu hình `.npmrc` tại thư mục gốc của dự án với nội dung:
```ini
legacy-peer-deps=true
```
👉 **Từ bây giờ bạn chỉ cần gõ:**
```bash
npm install
```
Lệnh sẽ chạy mượt mà và không còn bị crash bởi lỗi `edgesOut`.

*(Nếu chạy ở môi trường khác chưa có file `.npmrc`, bạn dùng: `npm install --legacy-peer-deps`)*

---

## ⚙️ 3. Cấu Hình Biến Môi Trường (`.env`)

Mở file `.env` tại thư mục gốc và cấu hình các API Key:

```env
# ==============================================================================
# CRYPTORADAR PRO - CONFIGURATION & GROQ API KEYS
# ==============================================================================

# GROQ OPENAI API KEY (Dùng cho AI Trading Chẩn Đoán Lệnh)
# Lấy Key miễn phí 100% tại: https://console.groq.com/keys (bắt đầu bằng gsk_...)
# Lưu ý: Tiền tố VITE_ giúp Vite nạp biến này an toàn vào môi trường Client-side.
VITE_GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# GROQ API KEY cho Backend / Reverse Proxy (Tùy chọn)
GROQ_API_KEY=""

# MODEL MẶC ĐỊNH (Khuyên dùng: deepseek-r1-distill-llama-70b | llama-3.1-8b-instant | llama-3.3-70b-versatile)
VITE_DEFAULT_GROQ_MODEL="deepseek-r1-distill-llama-70b"

# APP URL
APP_URL="http://localhost:3000"
```

> 💡 **Cách lấy Groq API Key miễn phí:**
> 1. Truy cập [Groq Cloud Console](https://console.groq.com/keys).
> 2. Đăng nhập bằng Google / GitHub (100% Miễn phí).
> 3. Bấm **"Create API Key"** -> Copy mã `gsk_...` và dán vào biến `VITE_GROQ_API_KEY` trong file `.env`.
> 4. Khởi chạy dự án, hệ thống sẽ tự động nạp Key trực tiếp từ `.env`. Bạn không cần phải nhập qua bất kỳ giao diện nào trên web.

---

## 💻 4. Chi Tiết Các Lệnh Vận Hành

### 4.1. Khởi động môi trường phát triển (Development)
```bash
npm run dev
```
- Server sẽ lắng nghe tại:
  - **Local:** `http://localhost:3000/`
  - **Mạng LAN:** `http://<ip-máy-bạn>:3000/` (cho phép test trên điện thoại/máy tính bảng cùng wifi)
- Để dừng server: Bấm `Ctrl + C` trên bàn phím terminal.

### 4.2. Kiểm tra chất lượng mã nguồn (Type Check)
```bash
npm run lint
```
- Lệnh này sử dụng TypeScript compiler (`tsc --noEmit`) để kiểm tra toàn bộ kiểu dữ liệu mà không cần sinh file build.

### 4.3. Đóng gói triển khai (Production Build)
```bash
npm run build
```
- Vite sẽ biên dịch và tối ưu hóa toàn bộ mã nguồn vào thư mục `dist/`.
- File tĩnh trong `dist/` có thể deploy lên Vercel, Netlify, Cloudflare Pages, Firebase Hosting hoặc Docker Nginx.

### 4.4. Xem thử bản build (Preview)
```bash
npm run preview
```
- Khởi động một web server nhẹ để bạn kiểm tra lại website sau khi đã build production xem có lỗi gì trước khi deploy thật.

### 4.5. Làm sạch & Cài đặt lại từ đầu (Deep Clean & Reinstall)
Khi dự án bị lỗi xung đột package hoặc cache lạ:
```bash
# Xóa thư mục node_modules, lock file và dist
rm -rf node_modules package-lock.json dist

# Dọn dẹp cache của npm
npm cache clean --force

# Cài đặt lại toàn bộ dependencies
npm install
```

---

## 📂 5. Cấu Trúc Các Trụ Cột Tính Năng (`src/`)

Dự án gồm 5 trụ cột quan sát thị trường và các mô-đun hỗ trợ:

- **Trụ 1:** `src/components/PillarLiquidation.tsx` - Bản đồ nhiệt & quét thanh khoản (Liquidation Heatmap)
- **Trụ 2:** `src/components/PillarWhalesArkham.tsx` - Theo dõi dòng tiền & biến động ví cá voi On-chain
- **Trụ 3:** `src/components/PillarFarsideETF.tsx` - Dòng tiền ròng ETF Phố Wall (BTC & ETH ETF)
- **Trụ 4:** `src/components/PillarMacroForexFactory.tsx` - Lịch tin tức kinh tế vĩ mô (CPI, FOMC, Non-farm...)
- **Trụ 5:** `src/components/PillarTokenUnlocks.tsx` - Theo dõi lịch mở khóa Token & áp lực xả hàng
- **Morning Routine:** `src/components/MorningRoutineModal.tsx` - Quy trình 5 phút quét thị trường mỗi sáng
- **Alert Center:** `src/components/AlertCenterModal.tsx` - Trung tâm thiết lập cảnh báo tùy chỉnh
- **Executive Overview:** `src/components/OverviewExecutive.tsx` - Bảng điều khiển tổng quan nhanh

---

## ❓ 6. Các Lỗi Thường Gặp & Cách Khắc Phục

### 1. Cổng 3000 bị báo đang bận (`Port 3000 is in use`)
Tìm tiến trình đang chiếm port 3000 và tắt:
```bash
# Tìm PID tiến trình đang chiếm cổng 3000
lsof -i :3000

# Tắt tiến trình (thay PID bằng số tìm được)
kill -9 <PID>
```
Hoặc chạy Vite trên cổng khác:
```bash
npx vite --port=3001
```

### 2. Lỗi quyền truy cập (Permission Denied / EACCES)
Chạy lệnh sửa quyền thư mục dự án:
```bash
sudo chown -R $(whoami) ~/.npm /Users/macbook/Desktop/crypto
```
