# 🎯 Mock Project: Split Bill & Tracking App

## 🧩 Mục tiêu

Ứng dụng chia tiền khi đi ăn / du lịch chung.  
Người dùng có thể tạo nhóm, thêm chi tiêu và ứng dụng tự tính **ai nợ ai bao nhiêu**.

---

## 👥 Nhóm thực tập sinh

-   **Frontend (Next.js)**: 2 bạn
-   **Backend (NestJS)**: 2 bạn

---

## ⚙️ Tech Stack gợi ý

-   **FE**: Next.js (TypeScript, TailwindCSS, ShadCN UI, React Query)
-   **BE**: NestJS, Prisma ORM, PostgreSQL
-   **Auth**: JWT (hoặc mock login nếu chưa kịp)
-   **Deployment**: Docker Compose (FE + BE + DB)

---

## 🗓️ Kế hoạch 1 tuần

### 🔹 **Day 1 — Setup & Planning**

**FE:**

-   [ ] Khởi tạo Next.js project
-   [ ] Cấu hình Tailwind + ShadCN UI
-   [ ] Tạo layout cơ bản (Header, Sidebar, Main)
-   [ ] Tạo route: `/login`, `/groups`, `/groups/[id]`

**BE:**

-   [x] Khởi tạo NestJS project + Prisma + tạo Database
-   [x] Tạo module `Auth` (mock login / JWT cơ bản)
-   [x] Tạo module `Group` (tạo nhóm, xem danh sách nhóm)

---

### 🔹 **Day 2 — Tạo nhóm & Danh sách nhóm**

**FE:**

-   [ ] Trang “My Groups” hiển thị danh sách nhóm
-   [ ] Modal / Form tạo nhóm mới
-   [ ] Gọi API `GET /groups` và `POST /groups`

**BE:**

-   [ ] API `POST /groups` (tạo nhóm mới)
-   [ ] API `GET /groups` (lấy danh sách nhóm của user)
-   [ ] Cấu trúc dữ liệu nhóm (group name, createdBy, members)

---

### 🔹 **Day 3 — Chi tiêu (Expenses)**

**FE:**

-   [ ] Trang chi tiết nhóm (`/groups/[id]`)
-   [ ] Form thêm chi tiêu (người chi, số tiền, mô tả)
-   [ ] Hiển thị danh sách chi tiêu

**BE:**

-   [ ] API `POST /expenses` (tạo chi tiêu)
-   [ ] API `GET /groups/:id/expenses` (danh sách chi tiêu)
-   [ ] Xử lý logic lưu ai chi bao nhiêu

---

### 🔹 **Day 4 — Tính toán chia tiền**

**FE:**

-   [ ] Hiển thị phần “Ai nợ ai” trong trang nhóm
-   [ ] Loading + error handling cơ bản

**BE:**

-   [ ] Endpoint `GET /groups/:id/settlement`
-   [ ] Tính toán: tổng chi của từng người, phần chênh lệch, kết quả nợ/giao dịch

---

### 🔹 **Day 5 — Hoàn thiện & Kết nối**

**FE:**

-   [ ] Gắn JWT (nếu có) vào API calls
-   [ ] Dọn giao diện, thêm feedback UI (toasts, states)

**BE:**

-   [ ] Thêm validation, error handling, JWT guard
-   [ ] Viết file seed data demo
-   [ ] Chuẩn bị Docker Compose (NestJS + PostgreSQL)

---

### 🔹 **Day 6–7 — Testing & Demo**

**Cả nhóm:**

-   [ ] Kết nối FE ↔ BE thật qua `.env`
-   [ ] Test toàn bộ flow:  
        `Login → Tạo nhóm → Thêm chi tiêu → Xem kết quả chia tiền`
-   [ ] Fix bug + chuẩn bị slide hoặc demo video ngắn
-   [ ] Viết README hướng dẫn chạy project

---

## ✅ Kết quả mong đợi

-   Chạy được **end-to-end flow** trên local hoặc Docker Compose
-   Hiểu rõ cách kết nối giữa FE ↔ BE
-   Có thể demo mượt mà trong buổi review cuối tuần

---

> ⚡ **Mentor Note:** Ưu tiên làm xong core flow (chia tiền) trước, rồi mới polish UI hoặc thêm tính năng phụ.  
> Mỗi ngày push code + tạo PR, review chéo giữa các thành viên.
