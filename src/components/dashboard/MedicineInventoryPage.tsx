import { useState, useEffect } from 'react';
import { Search, Plus, Pill, AlertTriangle, Calendar, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { supabase } from '../../lib/supabase';

interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  min_stock: number;
  expiry_date: string;
  description: string;
}

export function MedicineInventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State Form sesuai gambar ke-3 yang kamu minta
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    category: '',
    initial_stock: 0,
    unit: 'tablets',
    min_stock: 10,
    expiry_date: '',
    description: ''
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) {
        setMedicines(data.map(m => ({
          id: m.id,
          name: m.name,
          category: m.category,
          stock: m.initial_stock, 
          unit: m.unit,
          min_stock: m.min_stock,
          expiry_date: m.expiry_date,
          description: m.description
        })));
      }
    } catch (error) {
      console.error('Error fetch medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMedicine = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase.from('medicines').insert([newMedicine]);
      if (error) throw error;
      
      setShowAddDialog(false);
      fetchMedicines();
      setNewMedicine({ name: '', category: '', initial_stock: 0, unit: 'tablets', min_stock: 10, expiry_date: '', description: '' });
      alert('Obat berhasil ditambahkan!');
    } catch (error: any) {
      alert('Gagal simpan: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const lowStockItems = medicines.filter(m => m.stock <= m.min_stock);
  const expiredItems = medicines.filter(m => m.expiry_date && new Date(m.expiry_date) < new Date());
  const filteredMedicines = medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventaris Obat</h1>
          <p className="text-sm text-gray-500">Kelola stok dan transaksi obat DMCcare</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Tambah Obat
        </Button>
      </div>

      {/* Stats Cards 4 Kolom */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-medium text-gray-500 uppercase">Total Item</p>
              <p className="text-2xl font-bold text-blue-600">{medicines.length}</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg text-blue-500"><Package className="w-5 h-5" /></div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-medium text-gray-500 uppercase">Stok Rendah</p>
              <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
            </div>
            <div className="bg-red-50 p-2 rounded-lg text-red-500"><AlertTriangle className="w-5 h-5" /></div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-medium text-gray-500 uppercase">Stok Kadaluarsa</p>
              <p className="text-2xl font-bold text-red-600">{expiredItems.length}</p>
            </div>
            <div className="bg-red-50 p-2 rounded-lg text-red-500"><AlertTriangle className="w-5 h-5" /></div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-medium text-green-600 uppercase">Stok Masuk</p>
              <p className="text-2xl font-bold text-green-600">0</p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg text-green-500"><ArrowUpRight className="w-5 h-5" /></div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        {expiredItems.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> <strong>{expiredItems.length} item</strong> telah kadaluarsa!
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <input 
          placeholder="Cari obat..." 
          className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Medicine List */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Stok Obat ({medicines.length})</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {loading ? <p className="text-center py-10 text-sm text-gray-400">Loading data...</p> : 
            filteredMedicines.map(m => (
            <div key={m.id} className="p-5 rounded-xl border border-gray-100 space-y-4 bg-white">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800">{m.name}</h3>
                  <Badge variant="secondary" className="text-[10px] font-normal">{m.category}</Badge>
                  {m.stock <= m.min_stock && <Badge className="bg-red-100 text-red-700 text-[9px]">Stok Rendah</Badge>}
                </div>
              </div>
              <p className="text-xs text-gray-500">{m.description}</p>
              <div className="grid grid-cols-3 text-[13px] gap-4">
                <div><p className="text-gray-400 mb-1">Stok Saat Ini</p><p className="font-bold">{m.stock} {m.unit}</p></div>
                <div><p className="text-gray-400 mb-1">Stok Minimum</p><p className="font-bold">{m.min_stock} {m.unit}</p></div>
                <div><p className="text-gray-400 mb-1">Tanggal Kadaluarsa</p><p className="font-bold">{m.expiry_date || '-'}</p></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="text-[11px] h-8"><ArrowUpRight className="w-3 h-3 mr-1" /> Stok Masuk</Button>
                <Button variant="outline" size="sm" className="text-[11px] h-8"><ArrowDownRight className="w-3 h-3 mr-1" /> Stok Keluar</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* MODAL ADD NEW MEDICINE (Gambar ke-3) */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader><DialogTitle className="text-lg font-bold">Add New Medicine</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4 text-sm">
            <div className="space-y-1">
              <label className="font-semibold">Nama Obat *</label>
              <input className="w-full border rounded-lg p-2" placeholder="cth., Paracetamol"
                value={newMedicine.name} onChange={e => setNewMedicine({...newMedicine, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="font-semibold">Kategori</label>
              <input className="w-full border rounded-lg p-2" placeholder="Pain Relief"
                value={newMedicine.category} onChange={e => setNewMedicine({...newMedicine, category: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-blue-600">Stok Awal *</label>
              <input type="number" className="w-full border border-blue-500 rounded-lg p-2 outline-none" 
                value={newMedicine.initial_stock} onChange={e => setNewMedicine({...newMedicine, initial_stock: parseInt(e.target.value) || 0})} />
            </div>
            <div className="space-y-1">
              <label className="font-semibold">Satuan *</label>
              <input className="w-full border rounded-lg p-2" placeholder="tablets"
                value={newMedicine.unit} onChange={e => setNewMedicine({...newMedicine, unit: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="font-semibold">Stok Minimum *</label>
              <input type="number" className="w-full border rounded-lg p-2" 
                value={newMedicine.min_stock} onChange={e => setNewMedicine({...newMedicine, min_stock: parseInt(e.target.value) || 0})} />
            </div>
            <div className="space-y-1">
              <label className="font-semibold">Tanggal Kadaluarsa</label>
              <input type="date" className="w-full border rounded-lg p-2 text-gray-500" 
                value={newMedicine.expiry_date} onChange={e => setNewMedicine({...newMedicine, expiry_date: e.target.value})} />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="font-semibold">Deskripsi</label>
              <textarea className="w-full border rounded-lg p-2 h-20" placeholder="Deskripsi obat..."
                value={newMedicine.description} onChange={e => setNewMedicine({...newMedicine, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter className="flex justify-start gap-2 pt-2">
            <Button className="bg-blue-600 text-white font-bold px-6" onClick={handleSaveMedicine} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Tambah Obat'}
            </Button>
            <Button variant="outline" className="font-bold px-6" onClick={() => setShowAddDialog(false)}>Batal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}