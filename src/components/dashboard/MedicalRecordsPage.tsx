import { useState, useEffect } from 'react';
import { Plus, FileText, Pill } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { supabase } from '../../lib/supabase';

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
}

export function MedicalRecordsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState(''); 
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [formData, setFormData] = useState({
    diagnosis: '',
    symptoms: '',
    medication: '',
    dosage: '',
    treatment: '',
    doctorNotes: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      fetchMedicalRecords(selectedStudentId);
    } else {
      setRecords([]);
    }
  }, [selectedStudentId]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, full_name, medical_record_number');
      
      if (error) throw error;
      if (data) {
        setStudents(data.map(s => ({
          id: s.id,
          name: s.full_name,
          studentId: s.medical_record_number
        })));
      }
    } catch (error) {
      console.error('Gagal fetch students:', error);
    }
  };

  const fetchMedicalRecords = async (studentUuid: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('student_id', studentUuid)
        .order('check_up_date', { ascending: false });

      if (error) throw error;
      if (data) {
        setRecords(data.map(r => ({
          id: r.id,
          studentId: r.student_id,
          date: r.check_up_date,
          diagnosis: r.diagnosis,
          symptoms: r.symptoms,
          medication: r.medicine_name,
          dosage: r.dosage,
          treatment: r.treatment,
          doctorNotes: r.doctor_notes,
        })));
      }
    } catch (error) {
      console.error('Gagal fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudentId) {
      alert("Pilih mahasiswa terlebih dahulu!");
      return;
    }

    try {
      // Data dikirim sesuai dengan struktur tabel baru (Tanpa NIM)
      const { error } = await supabase
        .from('medical_records')
        .insert([{
          student_id: selectedStudentId, 
          diagnosis: formData.diagnosis,
          symptoms: formData.symptoms,
          medicine_name: formData.medication,
          dosage: formData.dosage,
          treatment: formData.treatment,
          doctor_notes: formData.doctorNotes,
          // Kolom check_up_date akan otomatis terisi CURRENT_DATE dari database
        }]);

      if (error) throw error;

      alert('Rekam medis berhasil disimpan!');
      setShowAddDialog(false);
      
      // Refresh data list
      fetchMedicalRecords(selectedStudentId);
      
      // Reset Form
      setFormData({
        diagnosis: '', symptoms: '', medication: '',
        dosage: '', treatment: '', doctorNotes: '',
      });
      
    } catch (error: any) {
      console.error('Detail Error:', error);
      alert(`Gagal menyimpan: ${error.message || 'Terjadi kesalahan sistem'}`);
    }
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekam Medis</h1>
          <p className="text-gray-600">Kelola riwayat pemeriksaan kesehatan mahasiswa</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!selectedStudentId}
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Rekaman
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Pilih Pasien Mahasiswa</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Cari atau Pilih Mahasiswa --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  [{s.studentId}] {s.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {selectedStudentId ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Riwayat Medis: <span className="text-blue-600">{selectedStudent?.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4 text-gray-500">Memuat data medis...</p>
            ) : records.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                <p className="text-gray-500">Mahasiswa ini belum memiliki riwayat pemeriksaan.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <div key={record.id} className="border rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{record.diagnosis}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(record.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-1">
                        <p className="text-gray-400 font-semibold uppercase text-[10px]">Gejala</p>
                        <p className="text-gray-700">{record.symptoms}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400 font-semibold uppercase text-[10px]">Tindakan/Pengobatan</p>
                        <p className="text-gray-700">{record.treatment}</p>
                      </div>
                      {record.medication && (
                        <div className="col-span-full bg-purple-50 p-3 rounded-lg flex items-center gap-3">
                          <Pill className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-900 font-medium">{record.medication} ({record.dosage})</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-20 text-gray-400 border-2 border-dashed rounded-xl">
            Silakan pilih mahasiswa terlebih dahulu untuk melihat rekam medis.
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Input Hasil Pemeriksaan Medis</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 bg-gray-50 p-2 rounded text-sm">
                Pasien: <strong>{selectedStudent?.name}</strong> ({selectedStudent?.studentId})
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium">Diagnosis Utama</label>
                <input required className="w-full border rounded p-2" 
                  value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium">Gejala yang Dirasakan</label>
                <textarea required className="w-full border rounded p-2" 
                  value={formData.symptoms} onChange={e => setFormData({...formData, symptoms: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Nama Obat</label>
                <input className="w-full border rounded p-2" 
                  value={formData.medication} onChange={e => setFormData({...formData, medication: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Dosis</label>
                <input className="w-full border rounded p-2" 
                  value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium">Tindakan/Treatment</label>
                <textarea required className="w-full border rounded p-2" 
                  value={formData.treatment} onChange={e => setFormData({...formData, treatment: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium">Catatan Dokter (Opsional)</label>
                <textarea className="w-full border rounded p-2" 
                  value={formData.doctorNotes} onChange={e => setFormData({...formData, doctorNotes: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Batal</Button>
              <Button type="submit" className="bg-blue-600 text-white">Simpan Rekaman</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}