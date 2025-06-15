export interface Student {
  id: string;
  name: string;
  class: string;
  fatherName: string;
  startingMonth: string;
  monthlyFee: number;
  bookCharges: number;
  dressCharges: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  month: string;
  monthlyFee: number;
  bookCharges: number;
  dressCharges: number;
  totalAmount: number;
  paymentDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface FeeStructure {
  monthlyFee: number;
  bookCharges: number;
  dressCharges: number;
}