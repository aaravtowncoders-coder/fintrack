import { useEffect, useState } from 'react';
import {
  getTransactions, createTransaction, deleteTransaction, exportTransactionsCsv
} from '../api/transactions';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Plus, Trash2, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities', 'Salary', 'Freelance', 'Investment', 'Other'];

interface FormState {
  description: string;
  amount: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  notes: string;
}

const defaultForm: FormState = {
  description: '', amount: '', type: 'EXPENSE', category: 'Other', date: new Date().toISOString().split('T')[0], notes: ''
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  const fetchData = () => {
    setLoading(true);
    getTransactions()
      .then(({ data }) => setTransactions(data))
      .catch(() => toast.error('Failed to load transactions'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTransaction({ ...form, amount: parseFloat(form.amount) });
      toast.success('Transaction added!');
      setShowModal(false);
      setForm(defaultForm);
      fetchData();
    } catch {
      toast.error('Failed to add transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      toast.success('Deleted');
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleExport = async () => {
    try {
      const { data } = await exportTransactionsCsv();
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  };

  const filtered = filterType === 'ALL' ? transactions : transactions.filter((t) => t.type === filterType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            <Plus size={16} /> Add Transaction
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {['ALL', 'INCOME', 'EXPENSE'].map((t) => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterType === t ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No transactions found.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{tx.description}</p>
                    {tx.notes && <p className="text-xs text-gray-400">{tx.notes}</p>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tx.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(tx.date)}</td>
                  <td className={`px-6 py-4 text-right font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(tx.id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Transaction</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input type="number" step="0.01" min="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'INCOME' | 'EXPENSE' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                {submitting ? 'Adding...' : 'Add Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
