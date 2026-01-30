import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function RegisterStudentPage() {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    dateOfBirth: '',
    gender: 'Perempuan',
    grade: '',
    bloodType: '',
    allergies: '',
    emergencyContact: '',
    emergencyPhone: '',
    phone: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const nimInput = formData.studentId.trim();

      if (!nimInput) {
        throw new Error("Nomor NIM tidak boleh kosong.");
      }

      // AMBIL SEMUA NOMOR REKAM MEDIS
      const { data: allStudents, error: fetchError } = await supabase
        .from('students')
        .select('medical_record_number');

      if (fetchError) throw fetchError;

      let nextNumber = 1;

      // CARI NOMOR URUT TERTINGGI DARI SEMUA DATA
      if (allStudents && allStudents.length > 0) {
        const allSequences = allStudents
          .map(s => s.medical_record_number)
          .map(num => {
            const parts = num.split(' -- ');
            return parts.length > 1 ? parseInt(parts[1]) : 0;
          })
          .filter(n => !isNaN(n)); // Pastikan cuma angka valid

        if (allSequences.length > 0) {
          const maxSequence = Math.max(...allSequences);
          nextNumber = maxSequence + 1;
        }
      }

      // GENERATE NOMOR BARU
      const finalMedicalNumber = `${nimInput} -- ${nextNumber}`;

      // SIMPAN KE DATABASE
      const { error: supabaseError } = await supabase
        .from('students')
        .insert([
          {
            full_name: formData.name,
            medical_record_number: finalMedicalNumber,
            birth_date: formData.dateOfBirth,
            gender: formData.gender,
            prodi_semester: formData.grade,
            blood_type: formData.bloodType,
            known_allergies: formData.allergies,
            emergency_contact_name: formData.emergencyContact,
            emergency_contact_phone: formData.emergencyPhone,
            telegram_number: formData.phone,
            address: formData.address,
          },
        ]);

      if (supabaseError) throw supabaseError;

      setSuccess(true);
      alert(`Berhasil! Nomor Rekam Medis baru: ${finalMedicalNumber}`);

      // Reset form
      setFormData({
        name: '', studentId: '', dateOfBirth: '', gender: 'Perempuan',
        grade: '', bloodType: '', allergies: '', emergencyContact: '',
        emergencyPhone: '', phone: '', address: '',
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Gagal mendaftarkan mahasiswa');
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Daftar Mahasiswa Baru</h1>
        <p className="text-gray-600">Tambahkan mahasiswa baru ke sistem manajemen kesehatan DMCcare</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Mahasiswa</CardTitle>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 border border-green-200">
              <CheckCircle className="w-5 h-5" />
              Data berhasil disimpan! Nomor Medis: {formData.studentId}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informasi Dasar */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informasi Dasar</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nama Lengkap *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nomor Rekam Medis (NIM) *</label>
                  <input
                    type="text"
                    name="studentId"
                    placeholder="Masukkan NIM (cth: 442023...)"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-[10px] text-blue-500 italic">*Sistem otomatis menambah akhiran -- 1, -- 2, dst.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tanggal Lahir *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Jenis Kelamin *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Perempuan">Perempuan</option>
                    <option value="Laki-laki">Laki-laki</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Prodi/Sem *</label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    placeholder="cth., Teknik Informatika/5"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Golongan Darah</label>
                  <input
                    type="text"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    placeholder="A/B/AB/O"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Informasi Kontak */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informasi Kontak</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">No. Telegram/Telp</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Alamat Lengkap</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Kontak Darurat */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 text-red-600">Kontak Darurat</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nama Kontak *</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder="Nama orang tua/wali"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">No. Telp Darurat *</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Informasi Kesehatan */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informasi Kesehatan</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Alergi (Jika ada)</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Daftar alergi makanan atau obat-obatan..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan Data Mahasiswa'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    name: '',
                    studentId: '',
                    dateOfBirth: '',
                    gender: 'Perempuan',
                    grade: '',
                    bloodType: '',
                    allergies: '',
                    emergencyContact: '',
                    emergencyPhone: '',
                    phone: '',
                    address: '',
                  });
                }}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}