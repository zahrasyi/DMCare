import { useState, useEffect } from 'react';
import { Calendar, BarChart3, TrendingUp, Users, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_URL } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import React from 'react';

interface Statistics {
  month: number;
  year: number;
  totalVisits: number;
  totalStudents: number;
  activeSickLeaves: number;
  topIllnesses: Array<{ name: string; count: number }>;
  monthRecords: number;
}

export function HealthReportsPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { accessToken } = useAuth();

  useEffect(() => {
    fetchStatistics();
  }, [selectedMonth, selectedYear]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/reports/statistics?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Health Reports & Statistics</h1>
        <p className="text-gray-600">View monthly health statistics and trends</p>
      </div>

      {/* Date Selection */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">Select Period:</span>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <Button
              onClick={fetchStatistics}
              variant="outline"
              className="ml-auto"
            >
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading statistics...</div>
      ) : !statistics ? (
        <div className="text-center py-12 text-gray-500">No data available</div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Total Visits</p>
                    <p className="text-blue-600">{statistics.totalVisits}</p>
                    <p className="text-gray-500 mt-1">This month</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Total Students</p>
                    <p className="text-green-600">{statistics.totalStudents}</p>
                    <p className="text-gray-500 mt-1">Registered</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Active Sick Leaves</p>
                    <p className="text-yellow-600">{statistics.activeSickLeaves}</p>
                    <p className="text-gray-500 mt-1">Currently on leave</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Visit Rate</p>
                    <p className="text-purple-600">
                      {statistics.totalStudents > 0 
                        ? ((statistics.totalVisits / statistics.totalStudents) * 100).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-gray-500 mt-1">Of students</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Illnesses */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Most Common Illnesses - {months[selectedMonth - 1]} {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              {statistics.topIllnesses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No medical records for this period
                </div>
              ) : (
                <>
                  {/* Chart */}
                  <div className="mb-6 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statistics.topIllnesses}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#3b82f6" name="Number of Cases" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-200">
                        <tr className="text-left">
                          <th className="pb-3 text-gray-600">Rank</th>
                          <th className="pb-3 text-gray-600">Illness</th>
                          <th className="pb-3 text-gray-600">Cases</th>
                          <th className="pb-3 text-gray-600">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statistics.topIllnesses.map((illness, index) => {
                          const percentage = ((illness.count / statistics.totalVisits) * 100).toFixed(1);
                          return (
                            <tr key={illness.name} className="border-b border-gray-100">
                              <td className="py-3">{index + 1}</td>
                              <td className="py-3">{illness.name}</td>
                              <td className="py-3">{illness.count}</td>
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span>{percentage}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Summary Report */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-blue-900 mb-2">Key Highlights</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li>• Total of {statistics.totalVisits} health clinic visits recorded</li>
                    <li>
                      • {statistics.topIllnesses[0]?.name || 'N/A'} was the most common diagnosis with{' '}
                      {statistics.topIllnesses[0]?.count || 0} cases
                    </li>
                    <li>• {statistics.activeSickLeaves} students are currently on sick leave</li>
                    <li>
                      • {statistics.totalStudents > 0 
                        ? ((statistics.totalVisits / statistics.totalStudents) * 100).toFixed(1)
                        : 0}% of students visited the health clinic
                    </li>
                  </ul>
                </div>

                {statistics.topIllnesses.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h3 className="text-amber-900 mb-2">Health Trends</h3>
                    <p className="text-amber-800">
                      The top 3 health concerns this month were{' '}
                      {statistics.topIllnesses.slice(0, 3).map((illness, i) => (
                        <span key={illness.name}>
                          {i > 0 && (i === statistics.topIllnesses.slice(0, 3).length - 1 ? ' and ' : ', ')}
                          <strong>{illness.name}</strong>
                        </span>
                      ))}
                      . Health staff should ensure adequate supplies and resources are available to address these conditions.
                    </p>
                  </div>
                )}

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="text-green-900 mb-2">Recommendations</h3>
                  <ul className="space-y-2 text-green-800">
                    <li>• Continue monitoring health trends monthly</li>
                    <li>• Ensure medicine stock levels are adequate for common diagnoses</li>
                    <li>• Consider health education programs for prevention</li>
                    <li>• Maintain regular communication with parents about health issues</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
