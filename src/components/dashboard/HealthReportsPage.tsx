import { useState, useEffect } from 'react';
import { Calendar, BarChart3, TrendingUp, Users, FileText, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';

interface Statistics {
  totalVisits: number;
  totalStudents: number;
  activeSickLeaves: number;
  topIllnesses: Array<{ name: string; count: number }>;
}

export function HealthReportsPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchStatistics();
  }, [selectedMonth, selectedYear]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];

      const { count: visitsCount } = await supabase
        .from('medical_records')
        .select('*', { count: 'exact', head: true })
        .gte('check_up_date', startDate)
        .lte('check_up_date', endDate);

      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      const { count: sickLeavesCount } = await supabase
        .from('sick_leaves')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending');

      const { data: illnessData } = await supabase
        .from('medical_records')
        .select('diagnosis')
        .gte('check_up_date', startDate)
        .lte('check_up_date', endDate);

      const diagnosisMap: Record<string, number> = {};
      illnessData?.forEach((item) => {
        if (item.diagnosis) {
          diagnosisMap[item.diagnosis] = (diagnosisMap[item.diagnosis] || 0) + 1;
        }
      });

      const sortedIllnesses = Object.entries(diagnosisMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStatistics({
        totalVisits: visitsCount || 0,
        totalStudents: studentsCount || 0,
        activeSickLeaves: sickLeavesCount || 0,
        topIllnesses: sortedIllnesses,
      });

    } catch (error) {
      console.error('Failed to process statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header - MIRIP HALAMAN MAHASISWA */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Laporan Kesehatan</h1>
        <p className="text-gray-600">Data statistik dan analisis kesehatan mahasiswa</p>
      </div>

      {/* 3 Cards Atas - MIRIP HALAMAN MAHASISWA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Mahasiswa */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <p className="text-gray-500 text-sm font-medium mb-1">Total Mahasiswa</p>
            <p className="text-blue-600 text-3xl font-bold">{statistics?.totalStudents || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center gap-4">
        <Calendar className="w-5 h-5 text-blue-500" />
        <span className="font-semibold text-gray-700">Pilih Periode:</span>
        <select 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        >
          {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <input
          type="number"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 w-24 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data...</p>
        </div>
      ) : !statistics ? (
        <div className="text-center py-20 text-gray-400 font-medium">Data tidak ditemukan</div>
      ) : (
        <>
          {/* 4 Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Total Kunjungan */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm font-medium mb-1">Total Kunjungan</p>
                <p className="text-blue-600 text-3xl font-bold">{statistics.totalVisits}</p>
              </CardContent>
            </Card>

            {/* Total Siswa */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm font-medium mb-1">Total Siswa</p>
                <p className="text-green-600 text-3xl font-bold">{statistics.totalStudents}</p>
              </CardContent>
            </Card>

            {/* Izin Sakit */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm font-medium mb-1">Izin Sakit</p>
                <p className="text-yellow-600 text-3xl font-bold">{statistics.activeSickLeaves}</p>
              </CardContent>
            </Card>

            {/* Rasio Sakit */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm font-medium mb-1">Rasio Sakit</p>
                <p className="text-purple-600 text-3xl font-bold">
                  {statistics.totalStudents > 0 ? ((statistics.totalVisits / statistics.totalStudents) * 100).toFixed(1) : 0}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart Section */}
          <Card className="bg-white shadow-sm mb-6">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-bold text-gray-900">Tren Penyakit Terbanyak</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {statistics.topIllnesses.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statistics.topIllnesses}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f9fafb' }}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#3b82f6" 
                        radius={[8, 8, 0, 0]} 
                        name="Jumlah Kasus"
                        barSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-400 font-medium">
                  Tidak ada catatan medis bulan ini
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottom 2 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Poin Penting */}
            <Card className="bg-blue-600 text-white shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Poin Penting</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="font-medium">Total {statistics.totalVisits} kunjungan rekam medis</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="font-medium">Penyakit terbanyak: {statistics.topIllnesses[0]?.name || '-'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="font-medium">{statistics.activeSickLeaves} mahasiswa sedang izin sakit</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rekomendasi */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Rekomendasi</h3>
                <div className="space-y-3 text-gray-600">
                  <p className="font-medium">• Segera cek stok obat untuk diagnosis terbanyak bulan ini.</p>
                  <p className="font-medium">• Perketat edukasi kesehatan jika rasio kunjungan meningkat.</p>
                  <p className="font-medium">• Pantau mahasiswa yang sedang 'active' izin sakit secara berkala.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}