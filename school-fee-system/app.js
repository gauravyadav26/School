// Firebase configuration
const firebaseConfig = {
    // Replace with your Firebase config object
    apiKey: "AIzaSyDhdPQWSG1jBYpXfg7fPgSq5W4Ad0HkcHQ",
  authDomain: "school-82015.firebaseapp.com",
  projectId: "school-82015",
  storageBucket: "school-82015.firebasestorage.app",
  messagingSenderId: "58098834019",
  appId: "1:58098834019:web:b9420aea97ed088b1bf656"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const addStudentBtn = document.getElementById('addStudentBtn');
const viewStudentsBtn = document.getElementById('viewStudentsBtn');
const feePaymentBtn = document.getElementById('feePaymentBtn');
const addStudentSection = document.getElementById('addStudentSection');
const viewStudentsSection = document.getElementById('viewStudentsSection');
const feePaymentSection = document.getElementById('feePaymentSection');
const studentForm = document.getElementById('studentForm');
const feePaymentForm = document.getElementById('feePaymentForm');
const studentsList = document.getElementById('studentsList');
const searchStudent = document.getElementById('searchStudent');
const studentSelect = document.getElementById('studentSelect');

// Navigation
addStudentBtn.addEventListener('click', () => showSection(addStudentSection));
viewStudentsBtn.addEventListener('click', () => {
    showSection(viewStudentsSection);
    loadStudents();
});
feePaymentBtn.addEventListener('click', () => {
    showSection(feePaymentSection);
    loadStudentSelect();
});

function showSection(section) {
    [addStudentSection, viewStudentsSection, feePaymentSection].forEach(s => {
        s.classList.add('hidden');
    });
    section.classList.remove('hidden');
}

// Add Student
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentData = {
        name: document.getElementById('studentName').value,
        class: document.getElementById('className').value,
        fatherName: document.getElementById('fatherName').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('students').add(studentData);
        alert('Student added successfully!');
        studentForm.reset();
    } catch (error) {
        console.error('Error adding student:', error);
        alert('Error adding student. Please try again.');
    }
});

// Load Students
async function loadStudents() {
    try {
        const snapshot = await db.collection('students').get();
        studentsList.innerHTML = '';
        snapshot.forEach(doc => {
            const student = doc.data();
            const studentCard = createStudentCard(doc.id, student);
            studentsList.appendChild(studentCard);
        });
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

function createStudentCard(id, student) {
    const card = document.createElement('div');
    card.className = 'student-card';
    card.innerHTML = `
        <h3>${student.name}</h3>
        <p>Class: ${student.class}</p>
        <p>Father's Name: ${student.fatherName}</p>
        <div class="payment-history">
            <h4>Payment History</h4>
            <div id="payment-history-${id}"></div>
        </div>
    `;
    loadPaymentHistory(id, card.querySelector(`#payment-history-${id}`));
    return card;
}

// Load Payment History
async function loadPaymentHistory(studentId, container) {
    try {
        const snapshot = await db.collection('payments')
            .where('studentId', '==', studentId)
            .orderBy('paymentDate', 'desc')
            .get();

        if (snapshot.empty) {
            container.innerHTML = '<p>No payment history available.</p>';
            return;
        }

        const historyList = document.createElement('ul');
        snapshot.forEach(doc => {
            const payment = doc.data();
            const li = document.createElement('li');
            li.textContent = `Date: ${payment.paymentDate.toDate().toLocaleDateString()} - 
                            Amount: $${payment.totalAmount} (Tuition: $${payment.tuitionFee}, 
                            Books: $${payment.booksFee}, Dress: $${payment.dressFee})`;
            historyList.appendChild(li);
        });
        container.appendChild(historyList);
    } catch (error) {
        console.error('Error loading payment history:', error);
    }
}

// Load Student Select for Fee Payment
async function loadStudentSelect() {
    try {
        const snapshot = await db.collection('students').get();
        studentSelect.innerHTML = '<option value="">Select a student</option>';
        snapshot.forEach(doc => {
            const student = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${student.name} (${student.class})`;
            studentSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading students for select:', error);
    }
}

// Fee Payment
feePaymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const paymentData = {
        studentId: studentSelect.value,
        paymentDate: firebase.firestore.FieldValue.serverTimestamp(),
        tuitionFee: parseFloat(document.getElementById('tuitionFee').value),
        booksFee: parseFloat(document.getElementById('booksFee').value),
        dressFee: parseFloat(document.getElementById('dressFee').value),
        totalAmount: parseFloat(document.getElementById('tuitionFee').value) +
                    parseFloat(document.getElementById('booksFee').value) +
                    parseFloat(document.getElementById('dressFee').value)
    };

    try {
        await db.collection('payments').add(paymentData);
        alert('Payment recorded successfully!');
        feePaymentForm.reset();
    } catch (error) {
        console.error('Error recording payment:', error);
        alert('Error recording payment. Please try again.');
    }
});

// Search Functionality
searchStudent.addEventListener('input', async (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const studentCards = document.querySelectorAll('.student-card');
    
    studentCards.forEach(card => {
        const studentName = card.querySelector('h3').textContent.toLowerCase();
        const className = card.querySelector('p').textContent.toLowerCase();
        if (studentName.includes(searchTerm) || className.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}); 