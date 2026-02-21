import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trash2, UserPlus, Shield, X, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

interface AuthorizedUser {
  id: number;
  email: string;
  created_at: string;
}

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('usuarios_autorizados')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    
    setAdding(true);
    const { error } = await supabase
      .from('usuarios_autorizados')
      .insert([{ email: newEmail.trim().toLowerCase() }]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      setNewEmail('');
      fetchUsers();
    }
    setAdding(false);
  };

  const removeUser = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    const { error } = await supabase
      .from('usuarios_autorizados')
      .delete()
      .eq('id', id);

    if (!error) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold">Panel de Administración</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Add User Form */}
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <form onSubmit={addUser} className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="nuevo@usuario.com"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              required
            />
            <button 
              type="submit" 
              disabled={adding}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors disabled:opacity-70"
            >
              {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            </button>
          </form>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Usuarios Autorizados ({users.length})
          </h3>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                  <span className="text-gray-700 font-medium">{user.email}</span>
                  <button 
                    onClick={() => removeUser(user.id)}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Eliminar acceso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-center text-gray-400 py-4">No hay usuarios registrados.</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
