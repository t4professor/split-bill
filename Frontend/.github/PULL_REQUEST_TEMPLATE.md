# 🚀 Pull Request

## 🧠 Mô tả

> Tóm tắt ngắn gọn thay đổi của PR này (chức năng chính, file nào ảnh hưởng, lý do cần thay đổi)

Ví dụ:

-   Tạo trang My Groups (FE)
-   Thêm API GET /groups (BE)
-   Cập nhật layout chung (FE)

---

## 🔗 Liên kết Issue

> Mỗi PR **phải liên kết ít nhất 1 issue** để tự động đóng issue khi merge.

Ví dụ:
Fixes #5
hoặc
Part of: #3

---

## ✅ Checklist

> Kiểm tra trước khi gửi PR

-   [ ] Đã pull `develop` mới nhất
-   [ ] Đã chạy app và test tính năng
-   [ ] Code tuân thủ convention của team
-   [ ] Không chứa log hoặc console không cần thiết
-   [ ] Đã được review local (nếu có pair)
-   [ ] Đã link đúng issue (Fixes #...)

---

## 🧩 Thay đổi chính

> Liệt kê chi tiết phần thay đổi (FE/BE)

### 🖥️ Frontend

-   [ ] Component mới
-   [ ] Layout/UI
-   [ ] API integration
-   [ ] Logic / Validation

### ⚙️ Backend

-   [ ] New API
-   [ ] Update Service / Controller
-   [ ] Database schema (nếu có)
-   [ ] Business logic

---

## 🧪 Cách test

> Hướng dẫn reviewer test nhanh

Ví dụ:

1. Chạy `docker-compose up`
2. Vào `/groups`
3. Kiểm tra có thể thêm group mới thành công

---

## 👀 Reviewer

> Gắn ít nhất 1 người review

@<github-username>

---

🟢 **Lưu ý:**

-   Không merge PR khi chưa có ít nhất **1 approval**
-   PR phải merge vào `develop`
