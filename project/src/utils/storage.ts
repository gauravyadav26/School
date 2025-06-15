import { Student, Payment } from '../types';

const STUDENTS_KEY = 'school_students';
const PAYMENTS_KEY = 'school_payments';

export const getStudents = (): Student[] => {
  const data = localStorage.getItem(STUDENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveStudents = (students: Student[]): void => {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
};

export const getPayments = (): Payment[] => {
  const data = localStorage.getItem(PAYMENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const savePayments = (payments: Payment[]): void => {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};