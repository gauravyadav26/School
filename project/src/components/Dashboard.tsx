import React from 'react';
import { Student, Payment } from '../types';
import { DollarSign, Users, Calendar, AlertCircle } from 'lucide-react';

interface Props {
  students: Student[];
  payments: Payment[];
}

export const Dashboard: React.FC<Props> = ({ students, payments }) => {
  const totalStudents = students.length;
  const totalCollected = payments.reduce((sum, payment) => sum + payment.totalAmount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const overduePayments = payments.filter(p => p.status === 'overdue').length;

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Collected',
      value: `$${totalCollected.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Pending Payments',
      value: pendingPayments,
      icon: Calendar,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Overdue Payments',
      value: overduePayments,
      icon: AlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">School Fee Management</h1>
        <p className="text-blue-100">Manage student fees, track payments, and monitor outstanding balances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {students.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Yet</h3>
          <p className="text-gray-600">Add your first student to get started with fee management.</p>
        </div>
      )}
    </div>
  );
};