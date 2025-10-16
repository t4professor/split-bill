import React from "react";
import { Alert, AlertDescription } from "./alert";
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";

interface ErrorAlertProps {
  error: Error | string | null;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({
  error,
  onRetry,
  className = "",
}: ErrorAlertProps) {
  if (!error) return null;

  const errorMessage = typeof error === "string" ? error : error.message;
  const isNetworkError =
    errorMessage.includes("Network") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("Failed to fetch");

  return (
    <Alert variant="destructive" className={className}>
      <div className="flex items-start gap-2">
        {isNetworkError ? (
          <WifiOff className="h-4 w-4 mt-0.5 flex-shrink-0" />
        ) : (
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        )}
        <AlertDescription className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm">{errorMessage}</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1 text-xs font-medium hover:underline"
                type="button"
              >
                <RefreshCw className="h-3 w-3" />
                Thử lại
              </button>
            )}
          </div>
          {isNetworkError && (
            <p className="text-xs mt-1 opacity-80">
              Vui lòng kiểm tra kết nối internet của bạn.
            </p>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
}
