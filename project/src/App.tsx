import React, { useState, useEffect } from 'react';
import { Student, Payment } from './types';
import { getStudents, getPayments, subscribeToStudents, subscribeToPayments, initializeStorage } from './utils/storage';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { PaymentManager } from './components/PaymentManager';
import { LayoutDashboard, Users, CreditCard, Wifi, WifiOff } from 'lucide-react';

type View = 'dashboard' | 'students' | 'payments';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let studentsUnsubscribe: (() => void) | undefined;
    let paymentsUnsubscribe: (() => void) | undefined;

    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Initialize storage and sync
        await initializeStorage();
        
        // Set up real-time subscriptions
        studentsUnsubscribe = subscribeToStudents(setStudents);
        paymentsUnsubscribe = subscribeToPayments(setPayments);
        
        // Load initial data if subscriptions don't work
        const initialStudents = await getStudents();
        const initialPayments = await getPayments();
        
        setStudents(initialStudents);
        setPayments(initialPayments);
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    return () => {
      if (studentsUnsubscribe) studentsUnsubscribe();
      if (paymentsUnsubscribe) paymentsUnsubscribe();
    };
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading school data...</p>
        </div>
      </div>
    );
  }

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
              {/* Online/Offline Status */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                isOnline 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isOnline ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </>
                )}
              </div>
              
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
            onPaymentClick={handleStudentSelect}
          />
        )}
        
        {currentView === 'payments' && selectedStudent && (
          <PaymentManager
            student={selectedStudent}
            onBack={handleBackToStudents}
          />
        )}
      </main>
    </div>
  );
}

export default App;