import React, { useState } from 'react';
import { 
  Users, UserPlus, Search, Shield, Eye, Edit2, Ban, CheckCircle2, X, AlertCircle 
} from 'lucide-react';
import { useTraining } from '../../context/TrainingContext';

export default function UserManagement() {
  const { usersList, setUsersList, setSelectedAuditUser, setCurrentView, showToast, updateUserPermissions } = useTraining();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'employee',
    department: 'Bay 4 Inbound Logistics',
    progress: 0,
    avgScore: 0,
    status: 'Active'
  });

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      showToast('Please provide a name and email.', 'warning');
      return;
    }
    const created = {
      ...newUser,
      role: 'employee',
      id: `EMP-${Math.floor(4000 + Math.random() * 900)}`,
      joinedDate: new Date().toISOString().split('T')[0],
      completedModules: [],
      lastActive: 'Just now',
      avatarBg: 'from-blue-600 to-cyan-500'
    };
    setUsersList([created, ...usersList]);
    setShowAddModal(false);
    setNewUser({ name: '', email: '', role: 'employee', department: 'Bay 4 Inbound Logistics', progress: 0, avgScore: 0, status: 'Active' });
    showToast(`Added ${created.name} to warehouse training roster`, 'success');
  };

  const handleSavePermissions = (e) => {
    e.preventDefault();
    if (!editingUser.name || !editingUser.email) {
      showToast('Please provide a name and email.', 'warning');
      return;
    }
    updateUserPermissions(editingUser.id, editingUser);
    setEditingUser(null);
  };

  const handleToggleStatus = (userId) => {
    setUsersList(usersList.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'Active' ? 'Disabled' : 'Active';
        showToast(`User status changed to ${newStatus}`, 'info');
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const handleViewDossier = (user) => {
    setSelectedAuditUser(user);
    setCurrentView('user-progress');
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider px-2.5 py-1 rounded bg-cyan-50 border border-cyan-200">
            Workforce Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            User & Learner Management
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Maintain employee rosters, audit training progress, and adjust access permissions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or bay..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
        </div>

        <div className="text-xs text-slate-600">
          Showing <strong className="text-slate-900">{filteredUsers.length}</strong> registered learners
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-white text-slate-600 uppercase font-mono border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Employee Name</th>
                <th className="px-6 py-4">Department / Bay</th>
                <th className="px-6 py-4">Training Progress</th>
                <th className="px-6 py-4">Average Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-100 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                    <div className="text-[11px] text-slate-500">{user.email}</div>
                  </td>

                  <td className="px-6 py-4 font-medium text-slate-600">
                    {user.department}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${user.progress}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-900">{user.progress}%</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-emerald-700">
                      {user.avgScore}%
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      user.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : user.status === 'Disabled'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {user.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewDossier(user)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-100 text-cyan-700 hover:text-slate-900 transition-colors"
                        title="View Individual Dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => alert(`Editing permissions for ${user.name}`)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.status === 'Active'
                            ? 'bg-slate-100 hover:bg-rose-50 text-rose-700'
                            : 'bg-slate-100 hover:bg-emerald-50 text-emerald-700'
                        }`}
                        title={user.status === 'Active' ? "Disable Access" : "Activate Access"}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-sm">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-600 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">Add New Employee</h3>
            <p className="text-xs text-slate-600 mb-6">Enroll a new operator into mandatory safety training.</p>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Jordan Reed"
                  className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g. jordan.reed@logistics.demo"
                  className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Department</label>
                <select
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="Bay 4 Inbound Logistics">Bay 4 Inbound Logistics</option>
                  <option value="Automotive Parts Assembly">Automotive Parts Assembly</option>
                  <option value="Forklift Fleet Operations">Forklift Fleet Operations</option>
                  <option value="Dispatch & Outbound">Dispatch & Outbound</option>
                  <option value="High-Bay Bulk Storage">High-Bay Bulk Storage</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black text-xs font-extrabold"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}