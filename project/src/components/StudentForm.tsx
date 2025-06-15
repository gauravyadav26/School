import React, { useState } from 'react';
import { Student } from '../types';
import { generateId, getStudents, saveStudents } from '../utils/storage';
import { getCurrentMonth } from '../utils/dateUtils';
import { X, Save } from 'lucide-react';

interface Props {
  onClose: () => void;
  onStudentAdded: () => void;
}

export const StudentForm: React.FC<Props> = ({ onClose, onStudentAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    fatherName: '',
    startingMonth: getCurrentMonth(),
    monthlyFee: 500,
    bookCharges: 150,
    dressCharges: 100
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Student name is required';
    if (!formData.class.trim()) newErrors.class = 'Class is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = "Father's name is required";
    if (formData.monthlyFee <= 0) newErrors.monthlyFee = 'Monthly fee must be greater than 0';
    if (formData.bookCharges < 0) newErrors.bookCharges = 'Book charges cannot be negative';
    if (formData.dressCharges < 0) newErrors.dressCharges = 'Dress charges cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const newStudent: Student = {
      id: generateId(),
      name: formData.name.trim(),
      class: formData.class.trim(),
      fatherName: formData.fatherName.trim(),
      startingMonth: formData.startingMonth,
      monthlyFee: formData.monthlyFee,
      bookCharges: formData.bookCharges,
      dressCharges: formData.dressCharges,
      createdAt: new Date().toISOString()
    };

    const students = getStudents();
    students.push(newStudent);
    saveStudents(students);
    
    onStudentAdded();
    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Student</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter student name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class *
            </label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => handleInputChange('class', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.class ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 10th A, Grade 5"
            />
            {errors.class && <p className="text-red-500 text-sm mt-1">{errors.class}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Father's Name *
            </label>
            <input
              type="text"
              value={formData.fatherName}
              onChange={(e) => handleInputChange('fatherName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.fatherName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter father's name"
            />
            {errors.fatherName && <p className="text-red-500 text-sm mt-1">{errors.fatherName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Starting Month
            </label>
            <input
              type="month"
              value={formData.startingMonth}
              onChange={(e) => handleInputChange('startingMonth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Fee ($) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.monthlyFee}
                onChange={(e) => handleInputChange('monthlyFee', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.monthlyFee ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.monthlyFee && <p className="text-red-500 text-sm mt-1">{errors.monthlyFee}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book Charges ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.bookCharges}
                onChange={(e) => handleInputChange('bookCharges', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.bookCharges ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.bookCharges && <p className="text-red-500 text-sm mt-1">{errors.bookCharges}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dress Charges ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.dressCharges}
                onChange={(e) => handleInputChange('dressCharges', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.dressCharges ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.dressCharges && <p className="text-red-500 text-sm mt-1">{errors.dressCharges}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};