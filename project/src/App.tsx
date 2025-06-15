import React, { useState, useEffect } from 'react';
import { Student, Payment } from './types';
import { getStudents, getPayments } from './utils/storage';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { PaymentManager } from './components/PaymentManager';
import { LayoutDashboard, Users, CreditCard } from 'lucide-react';

type View = 'dashboard' | 'students' | 'payments';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const loadData = () => {
    setStudents(getStudents());
    setPayments(getPayments());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setCurrentView('payments');
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
    setCurrentView('students');
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">SchoolFee Pro</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as View)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <Dashboard students={students} payments={payments} />
        )}
        
        {currentView === 'students' && (
          <StudentList
            students={students}
            payments={payments}
            onStudentsChange={loadData}
            onPaymentClick={handleStudentSelect}
          />
        )}
        
        {currentView === 'payments' && selectedStudent && (
          <PaymentManager
            student={selectedStudent}
            onBack={handleBackToStudents}
            onPaymentsChange={loadData}
          />
        )}
      </main>
    </div>
  );
}

export default App;