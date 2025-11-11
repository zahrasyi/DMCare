import { useState, useEffect } from 'react';
import { Plus, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
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
  grade: string;
}

interface SickLeave {
  id: string;
  studentId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'active' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
}

export function SickLeavePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [leaves, setLeaves] = useState<SickLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { accessToken } = useAuth();

  const [formData, setFormData] = useState({
    studentId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    status: 'active' as 'active' | 'completed' | 'cancelled',
    notes: '',
  });

  useEffect(() => {
    fetchStudents();
    fetchSickLeaves();
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
    }
  };

  const fetchSickLeaves = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'all'
        ? `${API_URL}/sick-leave`
        : `${API_URL}/sick-leave?status=${statusFilter}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setLeaves(data.leaves);
      }
    } catch (error) {
      console.error('Failed to fetch sick leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSickLeaves();
  }, [statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/sick-leave`, {
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
        fetchSickLeaves();
        // Reset form
        setFormData({
          studentId: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          reason: '',
          status: 'active',
          notes: '',
        });
      }
    } catch (error) {
      console.error('Failed to create sick leave:', error);
    }
  };

  const updateLeaveStatus = async (leaveId: string, newStatus: 'active' | 'completed' | 'cancelled') => {
    try {
      const response = await fetch(`${API_URL}/sick-leave/${leaveId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        fetchSickLeaves();
      }
    } catch (error) {
      console.error('Failed to update sick leave:', error);
    }
  };

  const getStudentInfo = (studentId: string) => {
    return students.find(s => s.id === studentId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const activeLeaves = leaves.filter(l => l.status === 'active');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Sick Leave Monitoring</h1>
          <p className="text-gray-600">Track students on medical leave</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Sick Leave
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Currently On Leave</p>
                <p className="text-yellow-600">{activeLeaves.length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total This Month</p>
                <p className="text-blue-600">{leaves.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Completed</p>
                <p className="text-green-600">
                  {leaves.filter(l => l.status === 'completed').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              size="sm"
            >
              All Leaves
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('active')}
              size="sm"
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('completed')}
              size="sm"
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('cancelled')}
              size="sm"
            >
              Cancelled
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leaves List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter === 'all' ? 'All Sick Leaves' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Leaves`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No sick leaves found</div>
          ) : (
            <div className="space-y-4">
              {leaves.map((leave) => {
                const student = getStudentInfo(leave.studentId);
                if (!student) return null;

                return (
                  <div
                    key={leave.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-gray-900">{student.name}</h4>
                          <Badge variant="outline">{student.studentId}</Badge>
                          <Badge className={getStatusColor(leave.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(leave.status)}
                              {leave.status}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-gray-600">Grade: {student.grade}</p>
                      </div>
                      {leave.status === 'active' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateLeaveStatus(leave.id, 'completed')}
                          >
                            Mark Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateLeaveStatus(leave.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-gray-600">Leave Period</p>
                        <p className="text-gray-900">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p className="text-gray-900">
                          {Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s)
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-gray-600">Reason</p>
                      <p className="text-gray-900">{leave.reason}</p>
                    </div>

                    {leave.notes && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 mb-1">Additional Notes</p>
                        <p className="text-gray-900">{leave.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Sick Leave Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Sick Leave</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-gray-700">Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-700">End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-gray-700">Reason *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                placeholder="Reason for sick leave..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-gray-700">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="Any additional information..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Sick Leave
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
