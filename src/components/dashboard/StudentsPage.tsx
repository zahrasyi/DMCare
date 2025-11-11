import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Plus, Phone, Mail, Calendar } from 'lucide-react';
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
  dateOfBirth: string;
  gender: string;
  grade: string;
  bloodType?: string;
  allergies?: string;
  emergencyContact: string;
  emergencyPhone: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const { accessToken } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewStudentDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailDialog(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Student Management</h1>
        <p className="text-gray-600">View and manage student information</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600 mb-1">Total Students</p>
            <p className="text-blue-600">{students.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600 mb-1">Active This Month</p>
            <p className="text-green-600">{students.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600 mb-1">New This Week</p>
            <p className="text-purple-600">0</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>All Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading students...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No students found matching your search' : 'No students registered yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr className="text-left">
                    <th className="pb-3 text-gray-600">Student ID</th>
                    <th className="pb-3 text-gray-600">Name</th>
                    <th className="pb-3 text-gray-600">Grade</th>
                    <th className="pb-3 text-gray-600">Gender</th>
                    <th className="pb-3 text-gray-600">Blood Type</th>
                    <th className="pb-3 text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-gray-100">
                      <td className="py-4">{student.studentId}</td>
                      <td className="py-4">{student.name}</td>
                      <td className="py-4">{student.grade}</td>
                      <td className="py-4">
                        <Badge variant="outline">{student.gender}</Badge>
                      </td>
                      <td className="py-4">{student.bloodType || '-'}</td>
                      <td className="py-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewStudentDetails(student)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-gray-900 mb-3">Basic Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Full Name</p>
                    <p className="text-gray-900">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Student ID</p>
                    <p className="text-gray-900">{selectedStudent.studentId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date of Birth</p>
                    <p className="text-gray-900">{selectedStudent.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Gender</p>
                    <p className="text-gray-900">{selectedStudent.gender}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Grade</p>
                    <p className="text-gray-900">{selectedStudent.grade}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Blood Type</p>
                    <p className="text-gray-900">{selectedStudent.bloodType || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  {selectedStudent.email && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selectedStudent.email}
                    </div>
                  )}
                  {selectedStudent.address && (
                    <div className="text-gray-700">
                      <p className="text-gray-600 mb-1">Address</p>
                      <p>{selectedStudent.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-gray-900 mb-3">Emergency Contact</h3>
                <div className="space-y-2">
                  <div className="text-gray-700">
                    <p className="text-gray-600">Contact Name</p>
                    <p>{selectedStudent.emergencyContact}</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {selectedStudent.emergencyPhone}
                  </div>
                </div>
              </div>

              {/* Health Info */}
              <div>
                <h3 className="text-gray-900 mb-3">Health Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-gray-600">Allergies</p>
                    <p className="text-gray-900">{selectedStudent.allergies || 'None reported'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
