import { Student, Payment } from '../types';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

const STUDENTS_KEY = 'school_students';
const PAYMENTS_KEY = 'school_payments';
const STUDENTS_COLLECTION = 'students';
const PAYMENTS_COLLECTION = 'payments';

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  return !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Local Storage Functions
const getLocalStudents = (): Student[] => {
  const data = localStorage.getItem(STUDENTS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalStudents = (students: Student[]): void => {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
};

const getLocalPayments = (): Payment[] => {
  const data = localStorage.getItem(PAYMENTS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalPayments = (payments: Payment[]): void => {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
};

// Firebase Functions
const getFirebaseStudents = async (): Promise<Student[]> => {
  try {
    const q = query(collection(db, STUDENTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
  } catch (error) {
    console.error('Error fetching students from Firebase:', error);
    return getLocalStudents();
  }
};

const saveFirebaseStudent = async (student: Student): Promise<void> => {
  try {
    if (student.id && student.id.length > 20) {
      // Update existing document
      await updateDoc(doc(db, STUDENTS_COLLECTION, student.id), student);
    } else {
      // Add new document
      const docRef = await addDoc(collection(db, STUDENTS_COLLECTION), student);
      student.id = docRef.id;
    }
  } catch (error) {
    console.error('Error saving student to Firebase:', error);
    throw error;
  }
};

const getFirebasePayments = async (): Promise<Payment[]> => {
  try {
    const q = query(collection(db, PAYMENTS_COLLECTION), orderBy('paymentDate', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
  } catch (error) {
    console.error('Error fetching payments from Firebase:', error);
    return getLocalPayments();
  }
};

const saveFirebasePayments = async (payments: Payment[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    for (const payment of payments) {
      if (payment.id && payment.id.length > 20) {
        // Update existing document
        const paymentRef = doc(db, PAYMENTS_COLLECTION, payment.id);
        batch.update(paymentRef, payment);
      } else {
        // Add new document
        const paymentRef = doc(collection(db, PAYMENTS_COLLECTION));
        batch.set(paymentRef, { ...payment, id: paymentRef.id });
      }
    }
    
    await batch.commit();
  } catch (error) {
    console.error('Error saving payments to Firebase:', error);
    throw error;
  }
};

// Sync functions
const syncToFirebase = async () => {
  if (!isFirebaseConfigured()) return;
  
  try {
    const localStudents = getLocalStudents();
    const localPayments = getLocalPayments();
    
    // Sync students
    for (const student of localStudents) {
      await saveFirebaseStudent(student);
    }
    
    // Sync payments
    if (localPayments.length > 0) {
      await saveFirebasePayments(localPayments);
    }
  } catch (error) {
    console.error('Error syncing to Firebase:', error);
  }
};

const syncFromFirebase = async () => {
  if (!isFirebaseConfigured()) return;
  
  try {
    const firebaseStudents = await getFirebaseStudents();
    const firebasePayments = await getFirebasePayments();
    
    saveLocalStudents(firebaseStudents);
    saveLocalPayments(firebasePayments);
  } catch (error) {
    console.error('Error syncing from Firebase:', error);
  }
};

// Public API
export const getStudents = async (): Promise<Student[]> => {
  if (isFirebaseConfigured()) {
    try {
      const students = await getFirebaseStudents();
      saveLocalStudents(students); // Cache locally
      return students;
    } catch (error) {
      console.error('Firebase error, falling back to localStorage:', error);
      return getLocalStudents();
    }
  }
  return getLocalStudents();
};

export const saveStudents = async (students: Student[]): Promise<void> => {
  // Always save to localStorage first
  saveLocalStudents(students);
  
  if (isFirebaseConfigured()) {
    try {
      for (const student of students) {
        await saveFirebaseStudent(student);
      }
    } catch (error) {
      console.error('Error saving to Firebase, data saved locally:', error);
    }
  }
};

export const getPayments = async (): Promise<Payment[]> => {
  if (isFirebaseConfigured()) {
    try {
      const payments = await getFirebasePayments();
      saveLocalPayments(payments); // Cache locally
      return payments;
    } catch (error) {
      console.error('Firebase error, falling back to localStorage:', error);
      return getLocalPayments();
    }
  }
  return getLocalPayments();
};

export const savePayments = async (payments: Payment[]): Promise<void> => {
  // Always save to localStorage first
  saveLocalPayments(payments);
  
  if (isFirebaseConfigured()) {
    try {
      await saveFirebasePayments(payments);
    } catch (error) {
      console.error('Error saving to Firebase, data saved locally:', error);
    }
  }
};

// Real-time listeners
export const subscribeToStudents = (callback: (students: Student[]) => void) => {
  if (!isFirebaseConfigured()) {
    // For localStorage, we'll just call the callback with current data
    callback(getLocalStudents());
    return () => {};
  }
  
  const q = query(collection(db, STUDENTS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const students = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
    saveLocalStudents(students); // Cache locally
    callback(students);
  }, (error) => {
    console.error('Error in students subscription:', error);
    callback(getLocalStudents());
  });
};

export const subscribeToPayments = (callback: (payments: Payment[]) => void) => {
  if (!isFirebaseConfigured()) {
    // For localStorage, we'll just call the callback with current data
    callback(getLocalPayments());
    return () => {};
  }
  
  const q = query(collection(db, PAYMENTS_COLLECTION), orderBy('paymentDate', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const payments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
    saveLocalPayments(payments); // Cache locally
    callback(payments);
  }, (error) => {
    console.error('Error in payments subscription:', error);
    callback(getLocalPayments());
  });
};

// Initialize sync
export const initializeStorage = async () => {
  if (isFirebaseConfigured()) {
    await syncFromFirebase();
  }
};

// Export sync functions for manual use
export { syncToFirebase, syncFromFirebase };