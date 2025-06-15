import React, { useState } from 'react';
import { Student, Payment } from '../types';
import { getPayments, savePayments, generateId } from '../utils/storage';
import { getMonthsSince, formatMonth } from '../utils/dateUtils';
import { ArrowLeft, Calendar, DollarSign, Check, Clock, AlertTriangle } from 'lucide-react';

interface Props {
  student: Student;
  onBack: () => void;
  onPaymentsChange: () => void;
}

export const PaymentManager: React.FC<Props> = ({ student, onBack, onPaymentsChange }) => {
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [includeBookCharges, setIncludeBookCharges] = useState(false);
  const [includeDressCharges, setIncludeDressCharges] = useState(false);

  const payments = getPayments();
  const studentPayments = payments.filter(p => p.studentId === student.id);
  const requiredMonths = getMonthsSince(student.startingMonth);
  
  const paidMonths = studentPayments
    .filter(p => p.status === 'paid')
    .map(p => p.month);
  
  const pendingMonths = requiredMonths.filter(month => !paidMonths.includes(month));

  const getPaymentStatus = (month: string) => {
    const payment = studentPayments.find(p => p.month === month);
    if (payment) return payment.status;
    return 'pending';
  };

  const calculateTotal = () => {
    const monthlyTotal = selectedMonths.length * student.monthlyFee;
    const bookTotal = includeBookCharges ? student.bookCharges : 0;
    const dressTotal = includeDressCharges ? student.dressCharges : 0;
    return monthlyTotal + bookTotal + dressTotal;
  };

  const handleMonthToggle = (month: string) => {
    if (paidMonths.includes(month)) return;
    
    setSelectedMonths(prev =>
      prev.includes(month)
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };

  const handlePayment = () => {
    if (selectedMonths.length === 0) return;

    const newPayments = selectedMonths.map(month => ({
      id: generateId(),
      studentId: student.id,
      studentName: student.name,
      month,
      monthlyFee: student.monthlyFee,
      bookCharges: includeBookCharges ? student.bookCharges : 0,
      dressCharges: includeDressCharges ? student.dressCharges : 0,
      totalAmount: student.monthlyFee + (includeBookCharges ? student.bookCharges : 0) + (includeDressCharges ? student.dressCharges : 0),
      paymentDate: new Date().toISOString(),
      status: 'paid' as const
    }));

    const allPayments = [...payments, ...newPayments];
    savePayments(allPayments);
    
    setSelectedMonths([]);
    setIncludeBookCharges(false);
    setIncludeDressCharges(false);
    onPaymentsChange();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <Check className="h-4 w-4" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-600">{student.class} • Father: {student.fatherName}</p>
        </div>
      </div>

      {/* Fee Structure */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Fee Structure</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Monthly Fee</p>
            <p className="text-lg font-semibold text-blue-600">${student.monthlyFee}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Book Charges</p>
            <p className="text-lg font-semibold text-green-600">${student.bookCharges}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Dress Charges</p>
            <p className="text-lg font-semibold text-purple-600">${student.dressCharges}</p>
          </div>
        </div>
      </div>

      {/* Payment Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Payments */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Payments</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {requiredMonths.map(month => {
              const status = getPaymentStatus(month);
              const isPaid = status === 'paid';
              const isSelected = selectedMonths.includes(month);
              
              return (
                <div
                  key={month}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    isPaid
                      ? 'bg-green-50 border-green-200 cursor-not-allowed opacity-75'
                      : isSelected
                      ? 'bg-blue-50 border-blue-300'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleMonthToggle(month)}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{formatMonth(month)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">${student.monthlyFee}</span>
                    <span className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1 ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Charges & Payment Summary */}
        <div className="space-y-6">
          {/* Additional Charges */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Charges</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBookCharges}
                  onChange={(e) => setIncludeBookCharges(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1 flex items-center justify-between">
                  <span>Book Charges</span>
                  <span className="font-semibold">${student.bookCharges}</span>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDressCharges}
                  onChange={(e) => setIncludeDressCharges(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1 flex items-center justify-between">
                  <span>Dress Charges</span>
                  <span className="font-semibold">${student.dressCharges}</span>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Selected Months ({selectedMonths.length})</span>
                <span>${selectedMonths.length * student.monthlyFee}</span>
              </div>
              {includeBookCharges && (
                <div className="flex justify-between">
                  <span>Book Charges</span>
                  <span>${student.bookCharges}</span>
                </div>
              )}
              {includeDressCharges && (
                <div className="flex justify-between">
                  <span>Dress Charges</span>
                  <span>${student.dressCharges}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total Amount</span>
                <span>${calculateTotal()}</span>
              </div>
            </div>
            
            <button
              onClick={handlePayment}
              disabled={selectedMonths.length === 0}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Process Payment
            </button>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {studentPayments.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">Month</th>
                  <th className="text-left py-2">Monthly Fee</th>
                  <th className="text-left py-2">Book Charges</th>
                  <th className="text-left py-2">Dress Charges</th>
                  <th className="text-left py-2">Total</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {studentPayments.map(payment => (
                  <tr key={payment.id} className="border-b border-gray-100">
                    <td className="py-2">{formatMonth(payment.month)}</td>
                    <td className="py-2">${payment.monthlyFee}</td>
                    <td className="py-2">${payment.bookCharges}</td>
                    <td className="py-2">${payment.dressCharges}</td>
                    <td className="py-2 font-semibold">${payment.totalAmount}</td>
                    <td className="py-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1 w-fit ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};