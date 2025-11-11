import { useState, useEffect } from 'react';
import { Plus, Package, TrendingUp, TrendingDown, AlertTriangle, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { API_URL } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import React from 'react';

interface Medicine {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minimumStock: number;
  expiryDate?: string;
  category?: string;
  description?: string;
}

interface Transaction {
  id: string;
  medicineId: string;
  medicineName: string;
  type: 'in' | 'out';
  quantity: number;
  notes?: string;
  createdAt: string;
}

export function MedicineInventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMedicineDialog, setShowAddMedicineDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const { accessToken } = useAuth();

  const [medicineForm, setMedicineForm] = useState({
    name: '',
    stock: 0,
    unit: 'tablets',
    minimumStock: 10,
    expiryDate: '',
    category: 'Pain Relief',
    description: '',
  });

  const [transactionForm, setTransactionForm] = useState({
    medicineId: '',
    type: 'in' as 'in' | 'out',
    quantity: 0,
    notes: '',
  });

  useEffect(() => {
    fetchMedicines();
    fetchTransactions();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/medicine`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setMedicines(data.medicines);
      }
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/medicine-transactions`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/medicine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(medicineForm),
      });

      const data = await response.json();

      if (data.success) {
        setShowAddMedicineDialog(false);
        fetchMedicines();
        setMedicineForm({
          name: '',
          stock: 0,
          unit: 'tablets',
          minimumStock: 10,
          expiryDate: '',
          category: 'Pain Relief',
          description: '',
        });
      }
    } catch (error) {
      console.error('Failed to add medicine:', error);
    }
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/medicine-transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(transactionForm),
      });

      const data = await response.json();

      if (data.success) {
        setShowTransactionDialog(false);
        fetchMedicines();
        fetchTransactions();
        setTransactionForm({
          medicineId: '',
          type: 'in',
          quantity: 0,
          notes: '',
        });
      }
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const openTransactionDialog = (medicine: Medicine, type: 'in' | 'out') => {
    setSelectedMedicine(medicine);
    setTransactionForm({
      ...transactionForm,
      medicineId: medicine.id,
      type,
    });
    setShowTransactionDialog(true);
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockMedicines = medicines.filter(m => m.stock <= m.minimumStock);
  const totalValue = medicines.reduce((sum, m) => sum + m.stock, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Medicine Inventory</h1>
          <p className="text-gray-600">Manage medicine stock and transactions</p>
        </div>
        <Button
          onClick={() => setShowAddMedicineDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Medicine
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Items</p>
                <p className="text-blue-600">{medicines.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Low Stock</p>
                <p className="text-red-600">{lowStockMedicines.length}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Stock In (Today)</p>
                <p className="text-green-600">
                  {transactions.filter(t => 
                    t.type === 'in' && 
                    new Date(t.createdAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Stock Out (Today)</p>
                <p className="text-orange-600">
                  {transactions.filter(t => 
                    t.type === 'out' && 
                    new Date(t.createdAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingDown className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockMedicines.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <p>
                <span className="font-semibold">{lowStockMedicines.length} item(s)</span> are running low on stock!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Medicine List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Medicine Stock ({filteredMedicines.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredMedicines.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No medicines found' : 'No medicines in inventory'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMedicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className={`border rounded-lg p-4 ${
                    medicine.stock <= medicine.minimumStock
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-gray-900">{medicine.name}</h4>
                        {medicine.category && (
                          <Badge variant="outline">{medicine.category}</Badge>
                        )}
                        {medicine.stock <= medicine.minimumStock && (
                          <Badge className="bg-red-100 text-red-700">
                            Low Stock
                          </Badge>
                        )}
                      </div>
                      {medicine.description && (
                        <p className="text-gray-600">{medicine.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-gray-600">Current Stock</p>
                      <p className="text-gray-900">
                        {medicine.stock} {medicine.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Minimum Stock</p>
                      <p className="text-gray-900">
                        {medicine.minimumStock} {medicine.unit}
                      </p>
                    </div>
                    {medicine.expiryDate && (
                      <div>
                        <p className="text-gray-600">Expiry Date</p>
                        <p className="text-gray-900">
                          {new Date(medicine.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openTransactionDialog(medicine, 'in')}
                      className="flex items-center gap-1"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Stock In
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openTransactionDialog(medicine, 'out')}
                      className="flex items-center gap-1"
                    >
                      <TrendingDown className="w-4 h-4" />
                      Stock Out
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No transactions yet</div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'in' ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      {transaction.type === 'in' ? (
                        <TrendingUp className={`w-4 h-4 ${
                          transaction.type === 'in' ? 'text-green-600' : 'text-orange-600'
                        }`} />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-900">{transaction.medicineName}</p>
                      <p className="text-gray-600">
                        {transaction.type === 'in' ? '+' : '-'}{transaction.quantity} units
                        {transaction.notes && ` - ${transaction.notes}`}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Medicine Dialog */}
      <Dialog open={showAddMedicineDialog} onOpenChange={setShowAddMedicineDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Medicine</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMedicine} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-gray-700">Medicine Name *</label>
                <input
                  type="text"
                  value={medicineForm.name}
                  onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-700">Category</label>
                <select
                  value={medicineForm.category}
                  onChange={(e) => setMedicineForm({ ...medicineForm, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                >
                  <option value="Pain Relief">Pain Relief</option>
                  <option value="Antibiotic">Antibiotic</option>
                  <option value="Vitamin">Vitamin</option>
                  <option value="First Aid">First Aid</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-gray-700">Initial Stock *</label>
                <input
                  type="number"
                  value={medicineForm.stock}
                  onChange={(e) => setMedicineForm({ ...medicineForm, stock: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                  required
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-700">Unit *</label>
                <select
                  value={medicineForm.unit}
                  onChange={(e) => setMedicineForm({ ...medicineForm, unit: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                >
                  <option value="tablets">Tablets</option>
                  <option value="capsules">Capsules</option>
                  <option value="ml">ML</option>
                  <option value="bottles">Bottles</option>
                  <option value="boxes">Boxes</option>
                  <option value="pieces">Pieces</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-gray-700">Minimum Stock *</label>
                <input
                  type="number"
                  value={medicineForm.minimumStock}
                  onChange={(e) => setMedicineForm({ ...medicineForm, minimumStock: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                  required
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-700">Expiry Date</label>
                <input
                  type="date"
                  value={medicineForm.expiryDate}
                  onChange={(e) => setMedicineForm({ ...medicineForm, expiryDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-gray-700">Description</label>
                <textarea
                  value={medicineForm.description}
                  onChange={(e) => setMedicineForm({ ...medicineForm, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Medicine
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddMedicineDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transaction Dialog */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {transactionForm.type === 'in' ? 'Add Stock' : 'Remove Stock'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTransaction} className="space-y-4">
            <div>
              <p className="text-gray-600 mb-2">Medicine</p>
              <p className="text-gray-900">{selectedMedicine?.name}</p>
              <p className="text-gray-600">Current Stock: {selectedMedicine?.stock} {selectedMedicine?.unit}</p>
            </div>

            <div className="space-y-2">
              <label className="text-gray-700">Quantity *</label>
              <input
                type="number"
                value={transactionForm.quantity}
                onChange={(e) => setTransactionForm({ ...transactionForm, quantity: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-gray-700">Notes</label>
              <textarea
                value={transactionForm.notes}
                onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                rows={2}
                placeholder="Optional notes..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {transactionForm.type === 'in' ? 'Add Stock' : 'Remove Stock'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTransactionDialog(false)}
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
