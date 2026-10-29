export type Role = "owner" | "staff";

export interface User {
  _id: string;
  name: string;
  username: string;
  role: Role;
  phone?: string;
  active: boolean;
}

export interface Measurements {
  chest?: number;
  waist?: number;
  hips?: number;
  shoulder?: number;
  sleeve?: number;
  neck?: number;
  length?: number;
  trouserLength?: number;
  notes?: string;
}

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  address?: string;
  measurements: Measurements;
  archived: boolean;
  createdAt: string;
}

export type OrderStatus = "Pending" | "In progress" | "Ready" | "Delivered";

export interface Payment {
  _id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Order {
  _id: string;
  customer: Pick<Customer, "_id" | "name" | "phone" | "address">;
  assignedTo: Pick<User, "_id" | "name">;
  garmentType: string;
  measurements: Measurements;
  instructions?: string;
  price: number;
  advance: number;
  payments: Payment[];
  totalPaid: number;
  balance: number;
  isOverdue: boolean;
  dueDate: string;
  status: OrderStatus;
  workRate: number;
  photo?: {
    filename: string;
    originalName: string;
  };
  createdAt: string;
}

export interface DashboardData {
  activeOrders: number;
  readyOrders: number;
  overdueOrders: number;
  upcoming: Order[];
}
