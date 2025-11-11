import { useState, useEffect } from 'react';
import { Search, Plus, FileText, Printer, Calendar, Pill } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { API_URL } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import React from 'react';

interface Student {
  id: string;
  name: string;
  studentId: string;
}

interface MedicalRecord {
  id: string;
  studentId: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  medication: string;
  dosage: string;
  treatment: string;
  doctorNotes: string;
  needsPermission: boolean;
  createdAt: string;
}

export function MedicalRecordsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const { accessToken } = useAuth();

  const [formData, setFormData] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    symptoms: '',
    medication: '',
    dosage: '',
    treatment: '',
    doctorNotes: '',
    needsPermission: false,
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      fetchMedicalRecords(selectedStudentId);
    }
  }, [selectedStudentId]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/students`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchMedicalRecords = async (studentId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/medical-records/student/${studentId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setRecords(data.records);
      }
    } catch (error) {
      console.error('Failed to fetch medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/medical-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowAddDialog(false);
        if (selectedStudentId) {
          fetchMedicalRecords(selectedStudentId);
        }
        // Reset form
        setFormData({
          studentId: '',
          date: new Date().toISOString().split('T')[0],
          diagnosis: '',
          symptoms: '',
          medication: '',
          dosage: '',
          treatment: '',
          doctorNotes: '',
          needsPermission: false,
        });
      }
    } catch (error) {
      console.error('Failed to create medical record:', error);
    }
  };

  const printPermissionLetter = (record: MedicalRecord) => {
    const student = students.find(s => s.id === record.studentId);
    if (!student) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Treatment Permission Letter</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { margin: 20px 0; }
          .signature { margin-top: 60px; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>School Health Center</h1>
          <h2>Treatment Permission Letter</h2>
        </div>
        <div class="content">
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Student Name:</strong> ${student.name}</p>
          <p><strong>Student ID:</strong> ${student.studentId}</p>
          <p><strong>Date of Treatment:</strong> ${new Date(record.date).toLocaleDateString()}</p>
          
          <h3>Medical Information</h3>
          <p><strong>Diagnosis:</strong> ${record.diagnosis}</p>
          <p><strong>Symptoms:</strong> ${record.symptoms}</p>
          <p><strong>Treatment Provided:</strong> ${record.treatment}</p>
          <p><strong>Medication Prescribed:</strong> ${record.medication} (${record.dosage})</p>
          
          <h3>Recommendation</h3>
          <p>It is recommended that ${student.name} receive the above mentioned treatment. 
          The student may require rest and should follow the prescribed medication schedule.</p>
          
          <p><strong>Doctor's Notes:</strong><br>${record.doctorNotes}</p>
        </div>
        <div class="signature">
          <p>_______________________________</p>
          <p>School Health Officer Signature</p>
        </div>
        <div class="footer">
          <p>This is an official document from the School Health Management System.</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Medical Records</h1>
          <p className="text-gray-600">View and manage student medical history</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!selectedStudentId}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Record
        </Button>
      </div>

      {/* Student Selection */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="space-y-2">
            <label className="text-gray-700">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
            >
              <option value="">Choose a student...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.studentId}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      {selectedStudentId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Medical History - {selectedStudent?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading records...</div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No medical records found for this student
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-gray-900">{record.diagnosis}</h4>
                          <div className="flex items-center gap-2 text-gray-600 mt-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(record.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      {record.needsPermission && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => printPermissionLetter(record)}
                          className="flex items-center gap-2"
                        >
                          <Printer className="w-4 h-4" />
                          Print Permission
                        </Button>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-gray-600">Symptoms</p>
                        <p className="text-gray-900">{record.symptoms}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Treatment</p>
                        <p className="text-gray-900">{record.treatment}</p>
                      </div>
                    </div>

                    {record.medication && (
                      <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-2 rounded-lg mb-2">
                        <Pill className="w-4 h-4" />
                        <span>{record.medication} - {record.dosage}</span>
                      </div>
                    )}

                    {record.doctorNotes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 mb-1">Doctor's Notes</p>
                        <p className="text-gray-900">{record.doctorNotes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Record Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Medical Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-gray-700">Student *</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                  required
                >
                  <option value="">Select student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.studentId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-gray-700">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-gray-700">Diagnosis *</label>
                <input
                  type="text"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="e.g., Common Cold, Headache"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-gray-700">Symptoms *</label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  rows={2}
                  placeholder="Describe symptoms..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-700">Medication</label>
                <input
                  type="text"
                  value={formData.medication}
                  onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                  placeholder="e.g., Paracetamol"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-700">Dosage</label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="e.g., 500mg twice daily"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-gray-700">Treatment *</label>
                <textarea
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  rows={2}
                  placeholder="Describe treatment provided..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-gray-700">Doctor's Notes</label>
                <textarea
                  value={formData.doctorNotes}
                  onChange={(e) => setFormData({ ...formData, doctorNotes: e.target.value })}
                  rows={3}
                  placeholder="Additional notes or recommendations..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needsPermission}
                    onChange={(e) => setFormData({ ...formData, needsPermission: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Requires treatment permission letter</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Record
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
