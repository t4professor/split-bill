export type SeedGroup = {
  id: string;
  name: string;
  description?: string;
  members: number;
  totalBill: number;
};

export type SeedMember = {
  id: string;
  name: string;
  spent: number;
  owes: number;
};

export type SeedExpense = {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  participantIds: string[];
};

export type SeedGroupDetail = {
  id: string;
  name: string;
  description?: string;
  members: SeedMember[];
  expenses: SeedExpense[];
};

export const seedGroups: SeedGroup[] = [
  { id: "1", name: "Du lịch Đà Lạt", members: 5, totalBill: 2500000 },
  { id: "2", name: "Team outing", members: 8, totalBill: 4200000 },
  { id: "3", name: "Sinh nhật Minh", members: 12, totalBill: 3800000 },
];

export const seedGroupDetails: Record<string, SeedGroupDetail> = {
  "1": {
    id: "1",
    name: "Du lịch Đà Lạt",
    description: "Chuyến đi thú vị đến Đà Lạt",
    members: [
      { id: "1", name: "Nguyễn Văn A", spent: 500000, owes: 200000 },
      { id: "2", name: "Trần Thị B", spent: 800000, owes: -100000 },
      { id: "3", name: "Lê Văn C", spent: 300000, owes: 400000 },
    ],
    expenses: [
      {
        id: "1",
        description: "Khách sạn",
        amount: 1500000,
        paidBy: "Trần Thị B",
        date: "2024-01-15",
        participantIds: ["1", "2"],
      },
      {
        id: "2",
        description: "Ăn tối",
        amount: 600000,
        paidBy: "Nguyễn Văn A",
        date: "2024-01-15",
        participantIds: ["1", "3"],
      },
      {
        id: "3",
        description: "Xăng xe",
        amount: 500000,
        paidBy: "Trần Thị B",
        date: "2024-01-16",
        participantIds: ["2", "3"],
      },
    ],
  },
  "2": {
    id: "2",
    name: "Team outing",
    description: "Cuộc vui cùng đồng nghiệp",
    members: [],
    expenses: [],
  },
  "3": {
    id: "3",
    name: "Sinh nhật Minh",
    description: "Tổ chức sinh nhật cho Minh",
    members: [],
    expenses: [],
  },
};
