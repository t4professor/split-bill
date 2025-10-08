# 🌿 Git Flow Guidelines

Tài liệu này hướng dẫn quy trình làm việc chuẩn **Git Flow** cho dự án.
Tất cả thành viên **phải tuân thủ** để đảm bảo code đồng bộ, dễ review và tránh conflict.

---

## 🔹 1. Nhánh chính

| Branch    | Mục đích                                                   |
| --------- | ---------------------------------------------------------- |
| `main`    | Code **ổn định**, đã qua review, có thể demo hoặc deploy   |
| `develop` | Code **đang phát triển**, tổng hợp từ các feature branches |

---

## 🔹 2. Quy tắc đặt tên nhánh

Khi bắt đầu một task, **luôn tạo nhánh mới từ `develop`**.

**Cấu trúc:**

```
<type>/<scope>-<short-description>
```

**Các type thường dùng:**

-   `feature/` – thêm mới tính năng
-   `fix/` – sửa lỗi
-   `chore/` – cấu hình, tool
-   `refactor/` – cải tiến code, không đổi logic

**Ví dụ:**

```
feature/fe-create-group
feature/be-expense-api
fix/be-settlement-bug
refactor/be-expense-service
```

---

## 🔹 3. Quy trình làm việc tiêu chuẩn

### 1️⃣ Pull code mới nhất

```bash
git checkout develop
git pull origin develop
```

### 2️⃣ Tạo nhánh mới

```bash
git checkout -b feature/fe-create-group
```

### 3️⃣ Code & Commit

Commit nhỏ, rõ ràng, theo convention sau:

| Prefix     | Ý nghĩa             |
| ---------- | ------------------- |
| `feat`     | thêm tính năng mới  |
| `fix`      | sửa lỗi             |
| `refactor` | cải tiến code       |
| `style`    | thay đổi UI, CSS    |
| `chore`    | setup, config, tool |
| `docs`     | cập nhật tài liệu   |

**Ví dụ:**

```
feat: create group list page
fix: wrong total calculation in settlement logic
refactor: simplify expense model
```

### 4️⃣ Push lên remote

```bash
git push origin feature/fe-create-group
```

### 5️⃣ Tạo Pull Request (PR)

-   Merge **vào `develop`**
-   Tạo PR trên GitHub
-   Nội dung PR nên có:

    -   Mô tả ngắn gọn task
    -   Screenshot (nếu là FE)
    -   Checklist test đã thực hiện

**Checklist PR trước khi gửi:**

-   [ ] Đã pull `develop` mới nhất
-   [ ] Code chạy OK local
-   [ ] Không còn `console.log` / `TODO` thừa
-   [ ] Đặt tên commit rõ ràng
-   [ ] Có ít nhất 1 người review chéo

### 6️⃣ Review & Merge

-   Thành viên khác review PR
-   Mentor kiểm tra lần cuối
-   Sau khi pass review → merge vào `develop`
-   Khi code ổn định → merge `develop` → `main`

---

## 🔹 4. Quy trình release (nếu cần)

Nếu có giai đoạn demo hoặc deploy:

```
develop → release/x.y.z → main
```

Sau khi merge vào `main`, cần **tag phiên bản**:

```bash
git tag -a v1.0.0 -m "First stable release"
git push origin v1.0.0
```

---

## 🔹 5. Lưu ý quan trọng

-   ❌ Không commit trực tiếp vào `develop` hoặc `main`
-   ✅ Mỗi task làm việc trên **nhánh riêng của mình**
-   🔍 Luôn **review chéo PR** trước khi merge
-   🧩 Mỗi PR nên gói gọn **1 tính năng hoặc fix cụ thể**

---

## ✅ Ví dụ minh họa quy trình

```bash
# 1. Lấy code mới nhất
git checkout develop
git pull origin develop

# 2. Tạo nhánh mới cho tính năng
git checkout -b feature/be-create-expense

# 3. Commit theo convention
git add .
git commit -m "feat: create expense API"

# 4. Push và tạo PR
git push origin feature/be-create-expense

# 5. Sau review, merge PR → develop
# 6. Khi ổn định, mentor merge develop → main
```

---

## ⚡ Mentor Note

Mục tiêu của Git Flow là giúp nhóm làm việc **song song, không đụng code nhau**,
và đảm bảo mỗi commit, mỗi PR đều **được kiểm soát chất lượng**.

> Code đẹp không chỉ chạy được — mà còn phải **rõ ràng, có tổ chức và dễ maintain**.
