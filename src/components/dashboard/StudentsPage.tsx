import { useState, useEffect } from 'react';
import { Search, Eye, Phone, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
// Ganti import ini agar memakai client supabase yang sudah kita perbaiki
import { supabase } from '../../lib/supabase'; 

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

  // 1. MODIFIKASI EFFECT UNTUK REALTIME
  useEffect(() => {
    fetchStudents();

    // --- BAGIAN REALTIME: Pantau perubahan tabel students ---
    const subscription = supabase
      .channel('students-live')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'students' }, 
        () => {
          console.log("Ada data baru! Mengambil ulang...");
          fetchStudents(); // Panggil fungsi fetch setiap ada INSERT/UPDATE/DELETE
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // 2. MODIFIKASI FETCH MENGGUNAKAN SUPABASE SDK
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false }); // Biar yang terbaru di atas

      if (error) throw error;

      if (data) {
        // Mapping dari database (snake_case) ke interface (camelCase)
        const formatted: Student[] = data.map((item) => ({
          id: item.id,
          name: item.full_name,
          studentId: item.medical_record_number,
          dateOfBirth: item.birth_date,
          gender: item.gender,
          grade: item.prodi_semester,
          bloodType: item.blood_type,
          allergies: item.known_allergies,
          emergencyContact: item.emergency_contact_name,
          emergencyPhone: item.emergency_contact_phone,
          email: item.telegram_number,
          address: item.address,
          createdAt: item.created_at,
        }));
        setStudents(formatted);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewStudentDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailDialog(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2 font-bold text-2xl">Manajemen Mahasiswa</h1>
        <p className="text-gray-600">Lihat dan kelola informasi mahasiswa (Live Update)</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600 mb-1">Total Mahasiswa</p>
            <p className="text-2xl font-bold text-blue-600">{students.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600 mb-1">Status Koneksi</p>
            <p className="text-2xl font-bold text-green-600">Terhubung</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600 mb-1">Baru Ditambahkan</p>
            <p className="text-2xl font-bold text-purple-600">
                {students.length > 0 ? "Live" : "0"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau nomor rekam medis..."
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
          <CardTitle>Semua Mahasiswa ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && students.length === 0 ? (
            <div className="text-center py-8 text-gray-500 italic">Menyinkronkan data...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Pencarian tidak ditemukan' : 'Database masih kosong'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 text-sm">
                  <tr className="text-left text-gray-500">
                    <th className="pb-3">Nomor Rekam Medis</th>
                    <th className="pb-3">Nama</th>
                    <th className="pb-3">Prodi/Sem</th>
                    <th className="pb-3">Jenis Kelamin</th>
                    <th className="pb-3">Gol. Darah</th>
                    <th className="pb-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-medium">{student.studentId}</td>
                      <td className="py-4">{student.name}</td>
                      <td className="py-4 text-sm">{student.grade}</td>
                      <td className="py-4">
                        <Badge variant="outline" className="font-normal">{student.gender}</Badge>
                      </td>
                      <td className="py-4">{student.bloodType || '-'}</td>
                      <td className="py-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => viewStudentDetails(student)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Lihat
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
            <DialogTitle className="text-xl">Detail Profil Mahasiswa</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6 pt-4">
              <div className="grid sm:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</p>
                  <p className="text-gray-900 font-semibold">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">No. Rekam Medis</p>
                  <p className="text-gray-900 font-semibold">{selectedStudent.studentId}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Program Studi</p>
                  <p className="text-gray-900">{selectedStudent.grade}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jenis Kelamin</p>
                  <Badge variant="secondary">{selectedStudent.gender}</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold border-b pb-1 text-blue-800">Kontak & Alamat</h3>
                <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedStudent.email || 'Tidak ada info telegram'}</span>
                </div>
                <div className="text-sm bg-blue-50 p-3 rounded border border-blue-100">
                    <p className="font-semibold text-blue-900 mb-1">Alamat Domisili:</p>
                    {selectedStudent.address || 'Alamat belum diinput'}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold border-b pb-1 text-red-800">Kontak Darurat</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500">Nama Wali</p>
                        <p className="font-medium">{selectedStudent.emergencyContact}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Telepon Darurat</p>
                        <div className="flex items-center gap-2 text-green-700 font-bold">
                            <Phone className="w-4 h-4" />
                            {selectedStudent.emergencyPhone}
                        </div>
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