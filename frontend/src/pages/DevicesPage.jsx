import { useState, useEffect, useCallback } from 'react';
import { getDevices, addDevice, deleteDevice } from '../api/client';
import { SectionHeader, Badge, Spinner, ErrorBox, Button, EmptyState } from '../components/UI';
import { sounds } from '../utils/soundEngine';

const TYPE_ICONS = { Server: '🖥', PC: '💻', Database: '🗄', Router: '📡', Firewall: '🛡' };

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', type: 'Server', ip: '' });
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await getDevices();
      setDevices(res.data.devices);
    } catch {
      setError('Failed to fetch devices.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    setAdding(true);
    try {
      await addDevice(form);
      sounds.deviceAdded();
      setForm({ name: '', type: 'Server', ip: '' });
      setShowForm(false);
      await fetchDevices();
    } catch (err) {
      sounds.warning();
      setFormError(err.response?.data?.error || 'Failed to add device.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from inventory?`)) return;
    try {
      await deleteDevice(id);
      sounds.deviceRemoved();
      await fetchDevices();
    } catch {
      sounds.warning();
      setError('Failed to delete device.');
    }
  };

  const handleToggleForm = () => {
    sounds.click();
    setShowForm(s => !s);
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 slide-in">
      <SectionHeader
        title="DEVICE INVENTORY"
        subtitle="Manage network devices in the simulation environment"
        action={
          <Button onClick={handleToggleForm} variant={showForm ? 'ghost' : 'primary'}>
            {showForm ? '✕ Cancel' : '+ Add Device'}
          </Button>
        }
      />

      {error && <ErrorBox message={error} />}

      {/* Add device form */}
      {showForm && (
        <div className="card p-5 border-accent/20 slide-in">
          <div className="text-accent text-xs font-mono uppercase tracking-widest mb-4">Register New Device</div>
          {formError && <ErrorBox message={formError} />}
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-textDim text-xs font-mono mb-1">Device Name *</label>
              <input
                className="w-full bg-bg border border-border rounded px-3 py-2 text-text text-sm font-mono focus:outline-none focus:border-accent transition-colors"
                placeholder="e.g. API-SERVER-03"
                value={form.name}
                onChange={e => { sounds.keystroke(); setForm(f => ({ ...f, name: e.target.value })); }}
                required
              />
            </div>
            <div>
              <label className="block text-textDim text-xs font-mono mb-1">Type *</label>
              <select
                className="w-full bg-bg border border-border rounded px-3 py-2 text-text text-sm font-mono focus:outline-none focus:border-accent transition-colors"
                value={form.type}
                onChange={e => { sounds.click(); setForm(f => ({ ...f, type: e.target.value })); }}
              >
                {['Server', 'PC', 'Database', 'Router', 'Firewall'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-textDim text-xs font-mono mb-1">IP Address (optional)</label>
              <input
                className="w-full bg-bg border border-border rounded px-3 py-2 text-text text-sm font-mono focus:outline-none focus:border-accent transition-colors"
                placeholder="192.168.x.x"
                value={form.ip}
                onChange={e => { sounds.keystroke(); setForm(f => ({ ...f, ip: e.target.value })); }}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" loading={adding} className="w-full justify-center">
                Register Device
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', val: devices.length, color: 'text-text' },
          { label: 'Safe', val: devices.filter(d => !d.compromised).length, color: 'text-accent' },
          { label: 'Compromised', val: devices.filter(d => d.compromised).length, color: 'text-red' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <div className={`font-display text-2xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-textDim text-xs font-mono mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Devices table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-border">
          <span className="text-textDim text-xs font-mono uppercase tracking-widest">
            Network Devices ({devices.length})
          </span>
        </div>
        {devices.length === 0 ? (
          <EmptyState icon="⬟" message="No devices registered. Add a device to begin." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Device', 'Type', 'IP Address', 'Status', 'Attack Stages', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-textDim font-mono text-xs uppercase tracking-widest font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {devices.map((d, i) => (
                  <tr
                    key={d.id}
                    className={`border-b border-border transition-colors hover:bg-surface ${
                      d.compromised ? 'bg-red/5' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{TYPE_ICONS[d.type] || '💡'}</span>
                        <div>
                          <div className="text-text font-mono text-sm font-medium">{d.name}</div>
                          <div className="text-textDim text-xs font-mono">ID: {d.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-textDim font-mono text-xs bg-surface border border-border px-2 py-1 rounded">
                        {d.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm text-text">{d.ip}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${d.compromised ? 'bg-red animate-pulse' : 'bg-accent'}`} />
                        <Badge type={d.status} />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {d.attackStages.length === 0 ? (
                        <span className="text-textDim text-xs font-mono">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {d.attackStages.map(s => (
                            <span key={s} className="text-[10px] font-mono bg-red/10 text-red border border-red/20 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        onClick={() => handleDelete(d.id, d.name)}
                        variant="danger"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}