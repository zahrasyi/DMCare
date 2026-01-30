import { useState, useEffect } from 'react';
import { Plus, Calendar, CheckCircle, Clock, Printer, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { supabase } from '../../lib/supabase';

export function SickLeavePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [inputValue, setInputValue] = useState('');

  const [formData, setFormData] = useState({
    studentId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: allSt } = await supabase.from('students').select('*');
      if (allSt) setStudents(allSt);

      const { data: medRecords } = await supabase.from('medical_records').select('student_id');
      if (medRecords && allSt) {
        const studentIdsWithRecords = medRecords.map(r => r.student_id);
        const filtered = allSt.filter(s => studentIdsWithRecords.includes(s.id));
        setEligibleStudents(filtered);
      }
      await fetchSickLeaves();
    } finally {
      setLoading(false);
    }
  };

  const fetchSickLeaves = async () => {
    let query = supabase.from('sick_leaves').select('*');
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    const { data } = await query.order('created_at', { ascending: false });
    if (data) setLeaves(data);
  };

  useEffect(() => { fetchSickLeaves(); }, [statusFilter]);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('sick_leaves')
      .update({ status: newStatus })
      .eq('id', id);
    if (!error) fetchSickLeaves();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) {
      alert("Pilih mahasiswa dari daftar dropdown!");
      return;
    }
    const { error } = await supabase.from('sick_leaves').insert([{
      student_id: formData.studentId,
      start_date: formData.startDate,
      end_date: formData.endDate,
      reason: formData.reason,
      additional_notes: formData.notes,
      status: 'Pending'
    }]);

    if (!error) {
      alert("Berhasil simpan!");
      setShowAddDialog(false);
      fetchSickLeaves();
      setInputValue('');
      setFormData({ ...formData, studentId: '', reason: '', notes: '' });
    }
  };

  // FITUR PRINT LENGKAP SESUAI GAMBAR
  const handlePrint = (leave: any, student: any) => {
    const win = window.open('', '', 'width=800,height=900');
    if (!win) return;
    
    const duration = Math.ceil((new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;

    win.document.write(`
      <html>
        <head>
          <title>Sick Leave - ${student?.full_name}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #1f2937; }
            h1 { font-size: 24px; margin-bottom: 5px; }
            .header-line { border-bottom: 3px solid #3b82f6; margin-bottom: 30px; }
            .info-row { display: flex; margin-bottom: 10px; }
            .label { width: 150px; font-weight: bold; color: #4b5563; }
            .status { color: #f59e0b; font-weight: bold; text-transform: uppercase; }
            .section-title { font-weight: bold; margin-top: 25px; color: #4b5563; }
            .footer { margin-top: 50px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <h1>School Health Management - Sick Leave Certificate</h1>
          <div class="header-line"></div>
          <div class="info-row"><div class="label">Student Name:</div><div>${student?.full_name}</div></div>
          <div class="info-row"><div class="label">Medical Number:</div><div>${student?.medical_record_number}</div></div>
          <div class="info-row"><div class="label">Grade:</div><div>${student?.grade || '-'}</div></div>
          <div class="info-row"><div class="label">Status:</div><div class="status">${leave.status}</div></div>
          <div class="info-row"><div class="label">Start Date:</div><div>${leave.start_date}</div></div>
          <div class="info-row"><div class="label">End Date:</div><div>${leave.end_date}</div></div>
          <div class="info-row"><div class="label">Duration:</div><div>${duration} day(s)</div></div>
          
          <div class="section-title">Reason:</div>
          <div>${leave.reason}</div>
          
          <div class="section-title">Additional Notes:</div>
          <div>${leave.additional_notes || '-'}</div>
          
          <div class="footer">Generated on ${new Date().toLocaleString()}</div>
        </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  };

  const getStudentInfo = (id: string) => students.find(s => s.id === id);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pemantauan Izin Sakit</h1>
          <p className="text-gray-500">Lacak mahasiswa yang sedang cuti medis</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 font-semibold"><Plus className="w-4 h-4 mr-2" /> Tambah Izin Sakit</Button>
      </div>

      {/* DASHBOARD STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-sm border-gray-100"><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-sm text-gray-500 font-medium">Sedang Cuti</p><p className="text-2xl font-bold text-yellow-600">{leaves.filter(l=>l.status==='Pending').length}</p></div>
          <div className="bg-yellow-50 p-2 rounded-lg"><Clock className="text-yellow-600" /></div>
        </CardContent></Card>
        <Card className="shadow-sm border-gray-100"><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-sm text-gray-500 font-medium">Total Bulan Ini</p><p className="text-2xl font-bold text-blue-600">{leaves.length}</p></div>
          <div className="bg-blue-50 p-2 rounded-lg"><Calendar className="text-blue-600" /></div>
        </CardContent></Card>
        <Card className="shadow-sm border-gray-100"><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-sm text-gray-500 font-medium">Selesai</p><p className="text-2xl font-bold text-green-600">{leaves.filter(l=>l.status==='Approved').length}</p></div>
          <div className="bg-green-50 p-2 rounded-lg"><CheckCircle className="text-green-600" /></div>
        </CardContent></Card>
      </div>

      <div className="flex gap-2 mb-8 bg-white p-2 rounded-lg border border-gray-100 w-fit">
        {['all', 'Pending', 'Approved', 'Rejected'].map((f) => (
          <Button key={f} variant={statusFilter === f ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(f)}>
            {f === 'all' ? 'Semua' : f === 'Pending' ? 'Aktif' : f === 'Approved' ? 'Selesai' : 'Dibatalkan'}
          </Button>
        ))}
      </div>

      {/* LIST KARTU IZIN SESUAI DESAIN */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-800">Manajemen Kesehatan Sekolah - Laporan Izin Sakit</h2>
        {leaves.map((leave) => {
          const student = getStudentInfo(leave.student_id);
          return (
            <Card key={leave.id} className="border-gray-200 shadow-sm rounded-xl bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-4 w-full">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-gray-900">{student?.full_name || 'Memuat...'}</span>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-bold">{student?.medical_record_number}</Badge>
                      <Badge className={leave.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-green-50 text-green-700 border-green-100'}>
                        <Clock className="w-3 h-3 mr-1"/> {leave.status === 'Pending' ? 'active' : 'completed'}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-gray-500">Prodi/Sem: {student?.grade || '-'}</p>
                    <div className="grid grid-cols-2 gap-10">
                      <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Periode Cuti</p>
                        <p className="text-sm font-bold text-gray-800">{leave.start_date} - {leave.endDate || leave.end_date}</p></div>
                      <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Durasi</p>
                        <p className="text-sm font-bold text-gray-800">1 hari</p></div>
                    </div>
                    <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Alasan</p>
                      <p className="text-sm text-gray-800 font-medium">{leave.reason}</p></div>
                    {leave.additional_notes && (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Catatan Tambahan</p>
                        <p className="text-sm text-gray-700 font-medium">{leave.additional_notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handlePrint(leave, student)} className="text-blue-600 border-blue-200 font-semibold"><Printer className="w-4 h-4 mr-2" /> Cetak</Button>
                    {leave.status === 'Pending' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => updateStatus(leave.id, 'Approved')} className="border-gray-200 font-semibold">Tandai Selesai</Button>
                        <Button variant="outline" size="sm" onClick={() => updateStatus(leave.id, 'Rejected')} className="border-gray-200 font-semibold text-red-500">Batalkan</Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-bold">Tambah Izin Sakit</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-bold text-gray-700">Mahasiswa *</label>
              <input list="mhs-list" className="w-full border rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ketik Nama atau NIM..." value={inputValue} autoComplete="off"
                onChange={(e) => {
                  setInputValue(e.target.value);
                  const match = eligibleStudents.find(s => `[${s.medical_record_number}] ${s.full_name}` === e.target.value);
                  if (match) setFormData({ ...formData, studentId: match.id });
                }}
              />
              <datalist id="mhs-list">{eligibleStudents.map(s => <option key={s.id} value={`[${s.medical_record_number}] ${s.full_name}`} />)}</datalist>
              <p className="text-[10px] text-blue-600 italic mt-1">*Hanya mahasiswa terdaftar di Rekam Medis</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="date" className="border rounded-lg p-2" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
              <input type="date" className="border rounded-lg p-2" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
            </div>
            <textarea placeholder="Alasan izin sakit..." className="w-full border rounded-lg p-2" rows={3} value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} required />
            <textarea placeholder="Informasi tambahan..." className="w-full border rounded-lg p-2" rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-blue-600 font-bold">Simpan Izin</Button>
              <Button type="button" variant="outline" className="flex-1 font-bold" onClick={() => setShowAddDialog(false)}>Batal</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}