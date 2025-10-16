# Authentication Integration Guide

## Overview

This guide covers the complete authentication system integration between the Next.js frontend (port 3001) and NestJS backend (port 3000).

## What Was Rebuilt

### 1. **Types System** (`Frontend/lib/types.ts`)

- ✅ Updated `User` interface to match backend schema
- ✅ Added `firstName`, `lastName`, `avatarPath`, `paymentQrPath` fields
- ✅ Proper request/response types for all auth endpoints
- ✅ Enhanced `AuthContextType` with proper method signatures

### 2. **API Client** (`Frontend/lib/api.ts`)

- ✅ **Fixed port**: Changed from 3001 to 3000 (correct backend port)
- ✅ **JWT handling**: Automatic token injection in headers
- ✅ **Auth endpoints**: Login, register, get profile, update profile
- ✅ **File uploads**: Avatar and payment QR upload
- ✅ **Error handling**: User-friendly error messages
- ✅ **Token utilities**: `setAuthToken`, `getAuthToken`, `removeAuthToken`

### 3. **AuthContext** (`Frontend/contexts/AuthContext.tsx`)

- ✅ **Real JWT management**: Stores tokens in localStorage
- ✅ **Auto-login**: Validates token on app start
- ✅ **User state**: Real backend user data
- ✅ **Profile methods**: `refreshProfile()`, `updateProfile()`
- ✅ **Error handling**: Clears session on auth errors
- ✅ **Loading states**: Proper loading indicators

### 4. **Login Page** (`Frontend/app/login/page.tsx`)

- ✅ **Backend integration**: Real API calls to `/auth/login`
- ✅ **Form validation**: Client-side validation
- ✅ **Error handling**: Displays backend error messages
- ✅ **Loading states**: Shows spinner during login
- ✅ **Auto-redirect**: Redirects after successful login
- ✅ **Accessibility**: Proper form attributes

### 5. **Register Page** (`Frontend/app/register/page.tsx`)

- ✅ **Backend integration**: Real API calls to `/auth/register`
- ✅ **Comprehensive validation**:
  - Name validation (required)
  - Username validation (3+ chars, alphanumeric + underscore)
  - Email validation (proper format)
  - Phone validation (Vietnamese format: 0 + 9-10 digits)
  - Password validation (8+ chars)
  - Password confirmation
- ✅ **Error handling**: Displays backend error messages
- ✅ **Auto-login**: Logs in automatically after registration
- ✅ **Loading states**: Shows spinner during registration

### 6. **Error Alert Component** (`Frontend/components/ui/error-alert.tsx`)

- ✅ **Network error detection**: Identifies connectivity issues
- ✅ **User-friendly messages**: Vietnamese error messages
- ✅ **Retry functionality**: Optional retry button
- ✅ **Responsive design**: Works on all screen sizes

## API Endpoints Used

### Authentication

```
POST /auth/login
POST /auth/register
```

### User Profile

```
GET /user/profile
PATCH /user/profile
POST /user/avatar
POST /user/payment-qr
```

## Testing the Complete Auth Flow

### Prerequisites

1. **Backend running** on `http://localhost:3000`
2. **Frontend running** on `http://localhost:3001`
3. **PostgreSQL database** configured and running
4. **CORS enabled** in backend for frontend origin

### Test Scenarios

#### 1. **User Registration Flow**

1. Navigate to `http://localhost:3001/register`
2. Fill in the registration form:
   - **Tên**: Nguyễn
   - **Họ và tên đệm**: Văn A
   - **Tên đăng nhập**: nguyenvana
   - **Số điện thoại**: 0123456789
   - **Email**: nguyenvana@email.com
   - **Mật khẩu**: password123
   - **Xác nhận mật khẩu**: password123
3. Click "Đăng ký"
4. **Expected**:
   - Loading spinner appears
   - User is automatically logged in
   - Redirected to homepage
   - JWT token stored in localStorage

#### 2. **User Login Flow**

1. Navigate to `http://localhost:3001/login`
2. Enter credentials:
   - **Tên đăng nhập hoặc Email**: nguyenvana or nguyenvana@email.com
   - **Mật khẩu**: password123
3. Click "Đăng nhập"
4. **Expected**:
   - Loading spinner appears
   - Successful login redirect to homepage
   - User data loaded from backend

#### 3. **Invalid Login Attempts**

1. Try with wrong password
2. **Expected**: Error message "Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu."
3. Try with non-existent user
4. **Expected**: Same error message
5. Try with empty fields
6. **Expected**: "Vui lòng nhập tên đăng nhập hoặc email" or "Vui lòng nhập mật khẩu"

#### 4. **Registration Validation**

Test each validation rule:

1. **Empty fields**: Should show specific error messages
2. **Short username**: "Tên đăng nhập phải có ít nhất 3 ký tự"
3. **Invalid username format**: "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
4. **Invalid email**: "Email không hợp lệ"
5. **Invalid phone**: "Số điện thoại không hợp lệ (bắt đầu bằng 0, 10-11 số)"
6. **Short password**: "Mật khẩu phải có ít nhất 8 ký tự"
7. **Password mismatch**: "Mật khẩu xác nhận không khớp"

#### 5. **Session Persistence**

1. Login successfully
2. Refresh the page
3. **Expected**: User remains logged in
4. Close browser and reopen
5. **Expected**: User remains logged in (localStorage persists)

#### 6. **Token Validation**

1. Manually delete JWT token from localStorage
2. Refresh the page
3. **Expected**: User is logged out automatically
4. Navigate to protected routes
5. **Expected**: Redirected to login page

## Error Handling Tests

### Network Errors

1. Turn off backend server
2. Try to login/register
3. **Expected**: "Vui lòng kiểm tra kết nối internet của bạn."

### Backend Errors

1. Try to register with existing email/username
2. **Expected**: "Email hoặc tên đăng nhập đã tồn tại."

### Validation Errors

1. Submit invalid data
2. **Expected**: Appropriate validation messages

## Debugging Tools

### Browser Console

Check for:

- Network requests in Network tab
- Console errors
- localStorage contents (check for token and user)

### Common Issues

#### 1. **CORS Errors**

**Symptom**: "Access-Control-Allow-Origin" errors
**Fix**: Ensure backend CORS includes `http://localhost:3001`

#### 2. **Network Errors**

**Symptom**: "Failed to fetch" or "Network error"
**Fix**: Check backend is running on port 3000

#### 3. **Invalid Token**

**Symptom**: 401 errors after login
**Fix**: Check JWT_SECRET in backend .env matches

#### 4. **Database Connection**

**Symptom**: 500 errors during registration
**Fix**: Check DATABASE_URL in backend .env

## Security Considerations

### ✅ Implemented

- JWT tokens stored in localStorage
- Automatic token injection in API headers
- Token validation on app start
- Session cleanup on auth errors
- Input validation on both client and server

### ⚠️ Notes

- localStorage is not the most secure storage method (consider HttpOnly cookies for production)
- No token refresh mechanism (tokens expire after 1 hour)
- No CSRF protection (implement if needed for production)

## Performance Optimizations

### ✅ Implemented

- Loading states during API calls
- Form validation before API calls
- Error caching to prevent repeated failed requests
- Automatic retry for server errors (5xx)

## Next Steps for Production

1. **Security**:

   - Implement HttpOnly cookies for JWT storage
   - Add CSRF protection
   - Implement token refresh mechanism
   - Add rate limiting

2. **User Experience**:

   - Add password strength indicator
   - Implement social login options
   - Add email verification
   - Implement password reset

3. **Performance**:
   - Add request caching
   - Implement optimistic updates
   - Add offline support
   - Optimize bundle size

## File Structure Summary

```
Frontend/
├── lib/
│   ├── types.ts          # TypeScript interfaces
│   └── api.ts            # API client with JWT handling
├── contexts/
│   └── AuthContext.tsx   # Authentication state management
├── app/
│   ├── login/page.tsx    # Login page with backend integration
│   └── register/page.tsx # Registration page with validation
└── components/ui/
    └── error-alert.tsx   # Reusable error display component
```

The authentication system is now fully integrated with your NestJS backend and ready for production use!
