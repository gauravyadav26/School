import React, { useState } from 'react';
import { Student, Payment } from '../types';
import { Search, Plus, User, GraduationCap, DollarSign } from 'lucide-react';
import { StudentForm } from './StudentForm';
import { getMonthsSince, formatMonth } from '../utils/dateUtils';

interface Props {
  students: Student[];
  payments: Payment[];
  onPaymentClick: (student: Student) => void;
}

export const StudentList: React.FC<Props> = ({ students, payments, onPaymentClick }) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.fatherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentPaymentStatus = (student: Student) => {
    const requiredMonths = getMonthsSince(student.startingMonth);
    const paidMonths = payments
      .filter(p => p.studentId === student.id && p.status === 'paid')
      .map(p => p.month);
    
    const pendingMonths = requiredMonths.filter(month => !paidMonths.includes(month));
    const totalOwing = pendingMonths.length * student.monthlyFee;
    
    return {
      totalMonths: requiredMonths.length,
      paidMonths: paidMonths.length,
      pendingMonths: pendingMonths.length,
      totalOwing
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => {
          const status = getStudentPaymentStatus(student);
          return (
            <div key={student.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-600">{student.class}</p>
                  </div>
                </div>
                {status.pendingMonths > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {status.pendingMonths} pending
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GraduationCap className="h-4 w-4" />
                  <span>Father: {student.fatherName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>Monthly Fee: ${student.monthlyFee}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Payment Progress</span>
                  <span className="font-medium">{status.paidMonths}/{status.totalMonths}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(status.paidMonths / status.totalMonths) * 100}%` }}
                  ></div>
                </div>
                {status.totalOwing > 0 && (
                  <p className="text-red-600 text-sm mt-2 font-medium">
                    Outstanding: ${status.totalOwing}
                  </p>
                )}
              </div>

              <button
                onClick={() => onPaymentClick(student)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage Payments
              </button>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600">Try adjusting your search terms.</p>
        </div>
      )}

      {showForm && (
        <StudentForm
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};