# 🚀 Hướng Dẫn Deploy CryptoRadar Pro: Vercel / Render + TiDB Cloud + UptimeRobot

Tài liệu này hướng dẫn chi tiết cách triển khai ứng dụng CryptoRadar Pro lên môi trường Production với chi phí **$0 (Hoàn toàn miễn phí)**, kết nối cơ sở dữ liệu phân tán **TiDB Cloud Serverless** và giám sát uptime 24/7 bằng **UptimeRobot**.

---

## ⚖️ 1. So Sánh: Nên Chọn Vercel Hay Render?

| Tiêu Chí | Vercel (Khuyên Dùng ⭐) | Render (Web Service) |
| :--- | :--- | :--- |
| **Cơ chế hoạt động** | Static Edge CDN + Serverless Functions (`/api/`) | Node.js Container (`server.js` Express) |
| **Hiện tượng "Ngủ" (Sleep)** | ❌ **Không bao giờ ngủ**, tải trang tức thì < 1s | ⚠️ **Ngủ sau 15 phút rảnh** (Cần UptimeRobot ping để giữ thức) |
| **Cold Start** | Gần như bằng 0 | 30s - 50s nếu bị rơi vào trạng thái ngủ |
| **TiDB Cloud** | Kết nối trực tiếp qua driver `@tidbcloud/serverless` | Kết nối qua `server.js` |
| **Cấu hình sẵn** | Đã có [vercel.json](file:///Users/macbook/Desktop/crypto/vercel.json) | Đã có [render.yaml](file:///Users/macbook/Desktop/crypto/render.yaml) & [server.js](file:///Users/macbook/Desktop/crypto/server.js) |
| **Độ dễ triển khai** | Cực kỳ dễ (1-Click từ GitHub) | Dễ (Cần cấu hình Start Command) |

> 💡 **Khuyên dùng**: Bạn **hoàn toàn có thể dùng Vercel**! Vercel nhanh hơn, không bị ngủ và không cần phụ thuộc vào UptimeRobot để "giữ server sống". Nếu bạn thích Render, dự án cũng đã được cấu hình sẵn 100% để chạy mượt trên Render.

---

## 🗄️ 2. Tạo Cơ Sở Dữ Liệu Miễn Phí Trên TiDB Cloud (Serverless)

TiDB Cloud cung cấp gói **Serverless Tier miễn phí vĩnh viễn** (5GB lưu trữ, 50 triệu Request Units/tháng, tương thích hoàn toàn MySQL).

1. Truy cập [https://tidbcloud.com/](https://tidbcloud.com/) và đăng ký tài khoản miễn phí.
2. Tại bảng điều khiển, bấm **Create Cluster**:
   - Chọn **Serverless** (Free).
   - Chọn Region: **AWS Singapore (`ap-southeast-1`)** hoặc khu vực gần bạn nhất.
   - Đặt tên Cluster: `cryptoradar`.
   - Bấm **Create**.
3. Sau khi cụm khởi tạo xong, bấm nút **Connect** ở góc phải:
   - Tại mục **Connect With**, chọn **General** hoặc **Node.js**.
   - Bấm **Generate Password** để lấy mật khẩu kết nối.
   - Sao chép chuỗi kết nối (`Connection String`), có dạng:
     ```text
     mysql://<username>.<root>:<password>@gateway01.<region>.prod.aws.tidbcloud.com:4000/cryptoradar?ssl={"rejectUnauthorized":true}
     ```
   - Đây chính là biến `DATABASE_URL`.
4. *Lưu ý*: Bạn **không cần phải tự tạo bảng** thủ công. Khi website chạy lần đầu tiên, hệ thống sẽ tự động khởi tạo bảng `ai_verdicts` với đầy đủ các trường lưu trữ tín hiệu Long/Short, giá, Stop Loss, Take Profit và lý do phân tích.

---

## 🌐 3. Triển Khai Lên Vercel (Cách 1 - Tối Ưu Nhất)

### Bước 3.1: Đẩy mã nguồn lên GitHub
Nếu bạn chưa đưa code lên GitHub:
```bash
git init
git add .
git commit -m "feat: setup deployment for vercel and tidb"
git branch -M main
git remote add origin https://github.com/<tai-khoan-cua-ban>/crypto-radar.git
git push -u origin main
```

### Bước 3.2: Import dự án vào Vercel
1. Truy cập [https://vercel.com/](https://vercel.com/) và đăng nhập bằng tài khoản GitHub.
2. Bấm **Add New...** -> **Project**.
3. Chọn kho lưu trữ GitHub của dự án vừa đẩy lên.
4. Tại màn hình **Configure Project**:
   - **Framework Preset**: Chọn `Vite` (Vercel tự động nhận diện).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Mở rộng phần **Environment Variables** và thêm các biến:
   - `VITE_GROQ_API_KEY`: Điền API key Groq của bạn (`gsk_...`).
   - `VITE_DEFAULT_GROQ_MODEL`: `openai/gpt-oss-120b`
   - `DATABASE_URL`: Dán chuỗi kết nối từ TiDB Cloud đã lấy ở Bước 2.
6. Bấm nút **Deploy**. Sau khoảng 30 - 45 giây, bạn sẽ nhận được đường link website chính thức dạng: `https://<ten-app>.vercel.app`.

---

## 🖥️ 4. Triển Khai Lên Render (Cách 2 - Web Service)

Nếu bạn muốn deploy lên Render:

1. Truy cập [https://render.com/](https://render.com/) và đăng nhập.
2. Bấm **New +** -> Chọn **Web Service**.
3. Chọn repo GitHub của dự án.
4. Cấu hình các thông số:
   - **Name**: `cryptoradar-pro`
   - **Region**: `Singapore`
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Tại mục **Advanced** -> **Health Check Path**, nhập: `/api/health`.
6. Tại mục **Environment Variables**, thêm:
   - `NODE_ENV`: `production`
   - `VITE_GROQ_API_KEY`: API Key Groq của bạn
   - `VITE_DEFAULT_GROQ_MODEL`: `openai/gpt-oss-120b`
   - `DATABASE_URL`: Chuỗi kết nối TiDB Cloud
7. Bấm **Create Web Service**.

---

## ⏱️ 5. Cấu Hình UptimeRobot (Giám Sát Uptime & Giữ Render Không Ngủ)

UptimeRobot là dịch vụ miễn phí giúp kiểm tra trạng thái máy chủ định kỳ mỗi 5 phút.

* **Đối với Render**: Cực kỳ quan trọng, request định kỳ này sẽ **ngăn chặn Render rơi vào trạng thái ngủ (Sleep)**, giúp web luôn phản hồi tức thì 24/7.
* **Đối với Vercel**: Giúp bạn nhận cảnh báo qua Email/Telegram ngay lập tức nếu API gặp sự cố.

### Các bước cài đặt:
1. Đăng ký tài khoản miễn phí tại [https://uptimerobot.com/](https://uptimerobot.com/).
2. Tại Dashboard, bấm **+ Add New Monitor**.
3. Điền thông tin giám sát:
   - **Monitor Type**: Chọn `HTTP(s)`
   - **Friendly Name**: `CryptoRadar Pro API Health`
   - **URL (or IP)**:
     - Nếu dùng Vercel: `https://<ten-app>.vercel.app/api/health`
     - Nếu dùng Render: `https://<ten-app>.onrender.com/api/health`
   - **Monitoring Interval**: Chọn `5 minutes` (hoặc `10 minutes`).
   - **Alert Contacts To Notify**: Tích chọn Email của bạn (hoặc kết nối Telegram Bot).
4. Bấm **Create Monitor**.

---

## 🔍 6. Kiểm Tra Sau Khi Triển Khai

1. Mở trang web sau khi deploy (`https://<domain>/`).
2. Tại thẻ **AI Chẩn Đoán Lệnh**:
   - Bấm nút **"Lịch Sử TiDB"**: Modal sẽ hiển thị `TiDB Cloud: Đã kết nối`.
   - Bấm nút **"Chẩn Đoán BTC Ngay"**: AI sẽ phân tích số liệu 5 trụ cột và tự động lưu kết quả trực tiếp vào TiDB Cloud Serverless.
   - Bấm lại nút **"Lịch Sử TiDB"**: Tín hiệu vừa phân tích sẽ xuất hiện trong danh sách kèm đầy đủ mức giá Entry, Stop Loss, Take Profit và thời gian.
3. Kiểm tra endpoint giám sát:
   - Truy cập `https://<domain>/api/health`: Trình duyệt sẽ trả về JSON trạng thái hệ thống:
     ```json
     {
       "status": "ok",
       "service": "CryptoRadar Pro Backend",
       "uptimeSeconds": 120,
       "database": {
         "provider": "TiDB Cloud Serverless",
         "connected": true,
         "message": "Kết nối TiDB Cloud Serverless thành công",
         "latencyMs": 42
       }
     }
     ```
