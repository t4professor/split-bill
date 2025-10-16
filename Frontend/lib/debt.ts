// Utility functions for calculating debts

import { SeedGroupDetail, SeedMember, SeedExpense } from "./seedData";

export type DebtEntry = {
  fromUserId: string;
  toUserId: string;
  amount: number;
  expenseIds: string[];
};

export type DebtSummary = {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: "you_owe" | "owes_you";
  expenseCount: number;
};

// Calculate balances for each member in the group
export function calculateBalances(
  detail: SeedGroupDetail
): Record<string, number> {
  const balances: Record<string, number> = {};

  detail.members.forEach((member) => {
    balances[member.id] = 0;
  });

  detail.expenses.forEach((expense) => {
    const share = expense.amount / expense.participantIds.length;
    const payerId = detail.members.find((m) => m.name === expense.paidBy)?.id;

    if (!payerId) {
      console.warn(`Payer not found for expense: ${expense.description}`);
      return;
    }

    balances[payerId] += expense.amount;

    expense.participantIds.forEach((participantId) => {
      balances[participantId] -= share;
    });
  });

  return balances;
}

// Optimize debts between members
export function optimizeDebts(balances: Record<string, number>): DebtEntry[] {
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  Object.entries(balances).forEach(([id, balance]) => {
    if (balance < 0) {
      debtors.push({ id, amount: -balance });
    } else if (balance > 0) {
      creditors.push({ id, amount: balance });
    }
  });

  const debts: DebtEntry[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtAmount = Math.min(debtors[i].amount, creditors[j].amount);

    debts.push({
      fromUserId: debtors[i].id,
      toUserId: creditors[j].id,
      amount: debtAmount,
      expenseIds: [], // This will be filled later
    });

    debtors[i].amount -= debtAmount;
    creditors[j].amount -= debtAmount;

    if (debtors[i].amount === 0) i++;
    if (creditors[j].amount === 0) j++;
  }

  return debts;
}

// Build debt summary for UI
export function buildDebtSummary(
  entries: DebtEntry[],
  members: SeedMember[],
  currentUserId: string
): {
  debts: DebtSummary[];
  youOwe: number;
  oweYou: number;
  netBalance: number;
} {
  const debts: DebtSummary[] = [];
  let youOwe = 0;
  let oweYou = 0;

  entries.forEach((entry) => {
    const fromMember = members.find((m) => m.id === entry.fromUserId);
    const toMember = members.find((m) => m.id === entry.toUserId);

    if (!fromMember || !toMember) return;

    const isCurrentUserOwing = entry.fromUserId === currentUserId;
    const amount = entry.amount;

    debts.push({
      id: entry.fromUserId + entry.toUserId,
      userId: isCurrentUserOwing ? toMember.id : fromMember.id,
      userName: isCurrentUserOwing ? toMember.name : fromMember.name,
      amount,
      type: isCurrentUserOwing ? "you_owe" : "owes_you",
      expenseCount: entry.expenseIds.length,
    });

    if (isCurrentUserOwing) {
      youOwe += amount;
    } else {
      oweYou += amount;
    }
  });

  return {
    debts,
    youOwe,
    oweYou,
    netBalance: oweYou - youOwe,
  };
}
