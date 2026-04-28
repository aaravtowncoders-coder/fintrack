import { useEffect, useState } from 'react';
import { getChallenges, createChallenge, deleteChallenge, updateChallengeProgress } from '../api/challenges';
import { Challenge } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Plus, Trash2, X, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

interface FormState { title: string; description: string; targetAmount: string; startDate: string; endDate: string; }
const defaultForm: FormState = { title: '', description: '', targetAmount: '', startDate: new Date().toISOString().split('T')[0], endDate: '' };

export default function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [progressInput, setProgressInput] = useState<Record<string, string>>({});

  const fetchData = () => {
    setLoading(true);
    getChallenges()
      .then(({ data }) => setChallenges(data))
      .catch(() => toast.error('Failed to load challenges'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createChallenge({ ...form, targetAmount: parseFloat(form.targetAmount) });
      toast.success('Challenge created!');
      setShowModal(false);
      setForm(defaultForm);
      fetchData();
    } catch {
      toast.error('Failed to create challenge');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this challenge?')) return;
    try {
      await deleteChallenge(id);
      toast.success('Challenge deleted');
      setChallenges((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleUpdateProgress = async (id: string) => {
    const amount = parseFloat(progressInput[id] || '0');
    if (isNaN(amount) || amount <= 0) { toast.error('Enter a valid amount'); return; }
    try {
      await updateChallengeProgress(id, amount);
      toast.success('Progress updated!');
      setProgressInput((prev) => ({ ...prev, [id]: '' }));
      fetchData();
    } catch {
      toast.error('Failed to update progress');
    }
  };

  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Challenges</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
          <Plus size={16} /> New Challenge
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : challenges.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center text-gray-500">
          <Trophy size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No challenges yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {challenges.map((c) => {
            const pct = Math.min(100, Math.round((c.currentAmount / c.targetAmount) * 100));
            return (
              <div key={c.id} className="bg-white rounded-xl shadow-sm p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{c.title}</h3>
                    {c.description && <p className="text-sm text-gray-500 mt-0.5">{c.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                    <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{formatCurrency(c.currentAmount)} / {formatCurrency(c.targetAmount)}</span>
                    <span className="font-medium text-indigo-600">{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  {formatDate(c.startDate)} → {formatDate(c.endDate)}
                </div>

                {c.status === 'ACTIVE' && (
                  <div className="flex gap-2">
                    <input
                      type="number" step="0.01" min="0.01" placeholder="Add amount"
                      value={progressInput[c.id] || ''}
                      onChange={(e) => setProgressInput((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button onClick={() => handleUpdateProgress(c.id)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                      Update
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Challenge</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                <input type="number" step="0.01" min="1" required value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Challenge'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
