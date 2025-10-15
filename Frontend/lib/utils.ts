import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateInviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const randomSegment = () =>
    Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")
  return `${randomSegment()}-${randomSegment()}`
}

export function buildInvitePath(groupId: string, inviteCode: string): string {
  if (!groupId || !inviteCode) {
    return ""
  }

  return `/groups/join?group=${groupId}&code=${inviteCode}`
}

export function resolveInviteLink(inviteLink?: string, origin?: string): string {
  if (!inviteLink) {
    return ""
  }

  if (/^https?:\/\//i.test(inviteLink)) {
    return inviteLink
  }

  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "")
  if (!base) {
    return inviteLink.startsWith("/") ? inviteLink : `/${inviteLink}`
  }

  const normalizedBase = base.replace(/\/$/, "")
  const normalizedPath = inviteLink.startsWith("/") ? inviteLink : `/${inviteLink}`
  return `${normalizedBase}${normalizedPath}`
}

export function parseInviteInput(input: string): {
  groupId?: string
  inviteCode?: string
} {
  const trimmed = input.trim()
  if (!trimmed) {
    return {}
  }

  const fallbackOrigin = typeof window !== "undefined" ? window.location.origin : "https://placeholder.local"

  try {
    const url = trimmed.startsWith("http")
      ? new URL(trimmed)
      : new URL(trimmed, fallbackOrigin)
    const inviteCode = url.searchParams.get("code") ?? undefined
    const groupId = url.searchParams.get("group") ?? url.searchParams.get("id") ?? undefined
    if (inviteCode || groupId) {
      return {
        groupId,
        inviteCode: inviteCode?.toUpperCase(),
      }
    }
  } catch {
    // ignore parse failures and continue with regex extraction
  }

  const codeMatch = trimmed.match(/code=([A-Za-z0-9-]+)/i)
  const groupMatch = trimmed.match(/group=([A-Za-z0-9-]+)/i)
  if (codeMatch || groupMatch) {
    return {
      groupId: groupMatch?.[1],
      inviteCode: codeMatch?.[1]?.toUpperCase(),
    }
  }

  return {
    inviteCode: trimmed.replace(/\s+/g, "").toUpperCase(),
  }
}
