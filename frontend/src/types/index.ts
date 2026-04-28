export interface User {
  userId: string;
  username: string;
  email: string;
  token: string;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  progressPercentage: number;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  activeChallenges: number;
  recentTransactions: Transaction[];
  expenseByCategory: Record<string, number>;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}
