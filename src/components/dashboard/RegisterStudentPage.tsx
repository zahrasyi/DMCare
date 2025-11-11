import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { API_URL } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle } from 'lucide-react';
import React from 'react';

export function RegisterStudentPage() {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    dateOfBirth: '',
    gender: 'Male',
    grade: '',
    bloodType: '',
    allergies: '',
    emergencyContact: '',
    emergencyPhone: '',
    email: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { accessToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register student');
      }

      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        studentId: '',
        dateOfBirth: '',
        gender: 'Male',
        grade: '',
        bloodType: '',
        allergies: '',
        emergencyContact: '',
        emergencyPhone: '',
        email: '',
        address: '',
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register student');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Register New Student</h1>
        <p className="text-gray-600">Add a new student to the health management system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Student registered successfully!
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-gray-900 mb-4">Basic Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-700">Student ID *</label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-700">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-700">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-gray-700">Grade/Class *</label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    placeholder="e.g., Grade 10A"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-700">Blood Type</label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                  >
                    <option value="">Select...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-gray-900 mb-4">Contact Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-gray-700">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-gray-700">Contact Name *</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder="Parent/Guardian name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-700">Contact Phone *</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Health Information */}
            <div>
              <h3 className="text-gray-900 mb-4">Health Information</h3>
              <div className="space-y-2">
                <label className="text-gray-700">Known Allergies</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  rows={3}
                  placeholder="List any known allergies (medications, food, etc.)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register Student'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    name: '',
                    studentId: '',
                    dateOfBirth: '',
                    gender: 'Male',
                    grade: '',
                    bloodType: '',
                    allergies: '',
                    emergencyContact: '',
                    emergencyPhone: '',
                    email: '',
                    address: '',
                  });
                  setError('');
                }}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
