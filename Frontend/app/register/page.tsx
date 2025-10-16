"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { register, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const validateForm = (): string | null => {
    if (!firstName.trim()) {
      return "Vui lòng nhập tên";
    }

    if (!lastName.trim()) {
      return "Vui lòng nhập họ và tên đệm";
    }

    if (!userName.trim()) {
      return "Vui lòng nhập tên đăng nhập";
    }

    if (userName.length < 3) {
      return "Tên đăng nhập phải có ít nhất 3 ký tự";
    }

    if (!/^[a-zA-Z0-9_]+$/.test(userName)) {
      return "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới";
    }

    if (!email.trim()) {
      return "Vui lòng nhập email";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Email không hợp lệ";
    }

    if (!phoneNumber.trim()) {
      return "Vui lòng nhập số điện thoại";
    }

    if (!/^(0)[0-9]{9,10}$/.test(phoneNumber.replace(/\s/g, ""))) {
      return "Số điện thoại không hợp lệ (bắt đầu bằng 0, 10-11 số)";
    }

    if (!password) {
      return "Vui lòng nhập mật khẩu";
    }

    if (password.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự";
    }

    if (!confirmPassword) {
      return "Vui lòng xác nhận mật khẩu";
    }

    if (password !== confirmPassword) {
      return "Mật khẩu xác nhận không khớp";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        userName: userName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.replace(/\s/g, ""), // Remove spaces
        password,
      });

      // Registration successful, redirect will happen via useEffect
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    }
  };

  // Show loading while checking auth
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary text-primary-foreground rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Đăng ký tài khoản
          </CardTitle>
          <CardDescription className="text-center">
            Tạo tài khoản để bắt đầu chia bill
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorAlert error={error} className="mb-4" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Tên</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Nguyễn Văn"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Họ và tên đệm</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="A"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userName">Tên đăng nhập</Label>
              <Input
                id="userName"
                type="text"
                placeholder="nguyenvana"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="username"
              />
              <p className="text-xs text-muted-foreground">
                Chứa chữ cái, số, dấu gạch dưới, tối thiểu 3 ký tự
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="0123456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="tel"
              />
              <p className="text-xs text-muted-foreground">
                Bắt đầu bằng 0, 10-11 số
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">Tối thiểu 8 ký tự</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                "Đăng ký"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Đăng nhập
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
