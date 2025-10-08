# 💸 Split Bill & Tracking App

Ứng dụng chia tiền khi đi ăn / du lịch chung.  
Người dùng có thể tạo nhóm, thêm chi tiêu và ứng dụng sẽ **tự tính toán ai nợ ai**.

---

## 🧩 Mục tiêu

-   Làm quen với **Next.js** (Frontend) và **NestJS** (Backend)
-   Hiểu cách phối hợp giữa FE ↔ BE trong một dự án fullstack
-   Triển khai workflow teamwork theo **Git Flow**

---

## ⚙️ Tech Stack

| Layer      | Technology                                                   |
| ---------- | ------------------------------------------------------------ |
| Frontend   | Next.js (TypeScript, TailwindCSS, ShadCN UI, Tanstack Query) |
| Backend    | NestJS, Prisma ORM                                           |
| Database   | PostgreSQL                                                   |
| Auth       | JWT (hoặc mock login)                                        |
| Deployment | Docker Compose (FE + BE + DB)                                |

---

## 🚀 Features

-   Đăng nhập / Đăng ký (mock login)
-   Tạo nhóm (Trip/Party)
-   Thêm thành viên (tạm thời có thể mock)
-   Ghi lại chi tiêu từng người
-   Tự tính toán “Ai nợ ai”
-   Hiển thị tổng kết nhóm

---

## 📦 Cấu trúc thư mục (gợi ý)

split-bill-tracking/
│
├── frontend/ # Next.js app
│ ├── src/
│ └── ...
│
├── backend/ # NestJS app
│ ├── src/
│ └── prisma/
│
├── docker-compose.yml
└── README.md
