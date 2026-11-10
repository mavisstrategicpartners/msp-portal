import { useState, useMemo } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal from '../../components/Modal.jsx'
import { seedIntegrations } from '../../data/mockData.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'
import { toast } from 'sonner'
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Settings,
  ShieldCheck,
  Zap,
  Clock,
  ExternalLink,
  Layers,
  Database,
  Cpu,
  Lock,
  Search,
  Filter
} from 'lucide-react'

const initialIntegrations = [
  {
    id: 'INT-1',
    name: 'Sage Pastel Payroll & HR',
    category: 'Payroll & Remuneration',
    description: 'Automated tax tables, monthly IRP5 generation, and SARS statutory submission data sync.',
    status: 'Connected',
    last_sync: '2026-10-04 14:30',
    frequency: 'Hourly',
    records_synced: '56 active employees'
  },
  {
    id: 'INT-2',
    name: 'SimplePay SA',
    category: 'Payroll & Remuneration',
    description: 'Cloud payroll engine for UIF, SDL, PAYE calculation and direct electronic payslip dispatch.',
    status: 'Connected',
    last_sync: '2026-10-04 12:15',
    frequency: 'Daily',
    records_synced: 'Payslips generated'
  },
  {
    id: 'INT-3',
    name: 'ZKTeco Biometric Clock-in Devices',
    category: 'Biometrics & Attendance',
    description: 'Fingerprint and facial recognition terminal bridge for real-time live staff presence and punch logs.',
    status: 'Connected',
    last_sync: '2026-10-04 15:45',
    frequency: 'Real-time (WebSocket)',
    records_synced: '112 punches logged today'
  },
  {
    id: 'INT-4',
    name: 'Microsoft Teams Presence & Graph API',
    category: 'Biometrics & Attendance',
    description: 'Sync status indicators (Available, Busy, In a Call, Away) with Live Staff Presence Command Center.',
    status: 'Connected',
    last_sync: '2026-10-04 15:58',
    frequency: 'Real-time (Polling)',
    records_synced: '38 users tracked'
  },
  {
    id: 'INT-5',
    name: 'SA Youth / Harambee Employment Accelerator',
    category: 'Recruitment & Job Boards',
    description: 'Direct candidate sourcing and demographic verification for learnership and graduate hiring.',
    status: 'Connected',
    last_sync: '2026-10-03 18:20',
    frequency: 'Daily',
    records_synced: '42 candidates synced'
  },
  {
    id: 'INT-6',
    name: 'LinkedIn Talent Solutions & Jobs',
    category: 'Recruitment & Job Boards',
    description: 'Automatic vacancy cross-posting and candidate applicant pipeline synchronization.',
    status: 'Connected',
    last_sync: '2026-10-04 09:00',
    frequency: 'Every 6 hours',
    records_synced: '7 active job posts'
  },
  {
    id: 'INT-7',
    name: 'Microsoft Entra ID (Azure Active Directory)',
    category: 'Identity & SSO',
    description: 'Single Sign-On (SSO), Multi-Factor Authentication (MFA), and automated role SCIM provisioning.',
    status: 'Connected',
    last_sync: '2026-10-04 15:00',
    frequency: 'Continuous',
    records_synced: 'Directory synchronized'
  },
  {
    id: 'INT-8',
    name: 'DocuSign Electronic Signature',
    category: 'Documents & E-Sign',
    description: 'Legally binding digital employment contracts, NDAs, and remote onboarding sign-offs.',
    status: 'Connected',
    last_sync: '2026-10-02 11:30',
    frequency: 'On-demand webhook',
    records_synced: '14 documents signed'
  },
  {
    id: 'INT-9',
    name: 'Coursera for Enterprise / AWS Skill Builder',
    category: 'Learning & LMS',
    description: 'Automated skill course enrollments and professional certification status updates.',
    status: 'Not Connected',
    last_sync: null,
    frequency: 'Daily',
    records_synced: 'None'
  },
  {
    id: 'INT-10',
    name: 'Xero Accounting & Invoicing',
    category: 'Payroll & Remuneration',
    description: 'Contractor time tracking sync and client billing invoice allocation.',
    status: 'Not Connected',
    last_sync: null,
    frequency: 'Daily',
    records_synced: 'None'
  }
]

const recentLogs = [
  { id: 'LOG-1', time: '15:45:12', service: 'ZKTeco Biometric Bridge', event: 'Punch ingest batch #408', status: '200 OK', records: 14 },
  { id: 'LOG-2', time: '15:00:03', service: 'Microsoft Entra ID', event: 'SCIM user directory sync', status: '200 OK', records: 56 },
  { id: 'LOG-3', time: '14:30:19', service: 'Sage Pastel Payroll', event: 'Monthly remuneration batch export', status: '200 OK', records: 54 },
  { id: 'LOG-4', time: '12:15:44', service: 'SimplePay SA', event: 'Leave balance reconciliation', status: '200 OK', records: 54 },
  { id: 'LOG-5', time: '09:00:22', service: 'LinkedIn Talent Solutions', event: 'Applicant profile ingest', status: '200 OK', records: 6 }
]

export default function HRIntegrations() {
  const [integrations, setIntegrations] = useSupabaseTable('hr_integrations', initialIntegrations)
  const [syncingId, setSyncingId] = useState(null)
  const [configModal, setConfigModal] = useState(null)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [tab, setTab] = useState('integrations') // 'integrations' | 'logs'

  const categories = useMemo(() => {
    return Array.from(new Set(integrations.map(i => i.category)))
  }, [integrations])

  const filteredIntegrations = useMemo(() => {
    return integrations.filter(i => {
      const matchSearch =
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.description.toLowerCase().includes(search.toLowerCase())
      if (!matchSearch) return false

      if (catFilter !== 'All' && i.category !== catFilter) return false
      return true
    })
  }, [integrations, search, catFilter])

  const connectedCount = integrations.filter(i => i.status === 'Connected').length

  const toggleConnection = (id) => {
    setIntegrations(prev =>
      prev.map(i => {
        if (i.id !== id) return i
        const isConn = i.status === 'Connected'
        const nextStatus = isConn ? 'Not Connected' : 'Connected'
        const nextSync = isConn ? null : new Date().toISOString().slice(0, 16).replace('T', ' ')
        toast.info(isConn ? `Disconnected from ${i.name}` : `Connected to ${i.name}`, {
          description: isConn ? 'Automated sync paused.' : 'Live data sync initiated.'
        })
        return { ...i, status: nextStatus, last_sync: nextSync }
      })
    )
  }

  const triggerSync = (id, name) => {
    setSyncingId(id)
    setTimeout(() => {
      setSyncingId(null)
      const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
      setIntegrations(prev => prev.map(i => (i.id === id ? { ...i, last_sync: now } : i)))
      toast.success('Sync Completed', {
        description: `Successfully synchronized live data with ${name}.`
      })
    }, 1200)
  }

  const saveConfig = (e) => {
    e.preventDefault()
    toast.success('Configuration Saved', {
      description: `Settings for ${configModal.name} have been updated.`
    })
    setConfigModal(null)
  }

  return (
    <DashboardLayout title="Integrations & API Connectors">
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Active Connectors</span>
              <Zap className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{connectedCount} <span className="text-sm font-normal text-muted-foreground">/ {integrations.length}</span></div>
            <div className="mt-1 text-xs text-emerald-600 font-medium">All live connectors operational</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Sync Health</span>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">100%</div>
            <div className="mt-1 text-xs text-muted-foreground">Zero sync latency or auth errors</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Biometrics Terminal</span>
              <Clock className="h-4 w-4 text-purple-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">Active</div>
            <div className="mt-1 text-xs text-muted-foreground">Real-time attendance ingestion</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Daily Sync Operations</span>
              <Database className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">428</div>
            <div className="mt-1 text-xs text-muted-foreground">API events logged in last 24h</div>
          </div>
        </div>

        {/* Tab & Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-lg border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setTab('integrations')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                tab === 'integrations' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Connected Tools ({integrations.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('logs')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                tab === 'logs' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sync Activity & Webhooks
            </button>
          </div>

          {tab === 'integrations' && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter connectors…"
                  className="rounded-md border border-input bg-background pl-8 pr-3 py-1 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <select
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: INTEGRATIONS GRID */}
        {tab === 'integrations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIntegrations.map(item => {
              const isConnected = item.status === 'Connected'
              const isSyncing = syncingId === item.id

              return (
                <div key={item.id} className="card p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {item.category}
                        </span>
                        <h4 className="font-bold text-base text-foreground mt-0.5">{item.name}</h4>
                      </div>
                      <span className={`badge ${isConnected ? 'badge-success' : 'badge-danger'}`}>
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-border/60">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Sync Frequency: <b className="text-foreground">{item.frequency}</b></span>
                      <span>Last Sync: <b className="text-foreground">{item.last_sync || 'Never'}</b></span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        {isConnected && (
                          <button
                            type="button"
                            disabled={isSyncing}
                            onClick={() => triggerSync(item.id, item.name)}
                            className="btn btn-ghost text-xs py-1 px-2.5 inline-flex items-center gap-1"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
                            <span>{isSyncing ? 'Syncing…' : 'Sync Now'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setConfigModal(item)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Configure API settings"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleConnection(item.id)}
                        className={`btn text-xs py-1 px-3 ${
                          isConnected ? 'btn-ghost text-rose-600' : 'btn-primary'
                        }`}
                      >
                        {isConnected ? 'Disconnect' : 'Connect Tool'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* TAB 2: LOGS & WEBHOOKS */}
        {tab === 'logs' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Event Description</th>
                    <th className="py-3 px-4">HTTP Status</th>
                    <th className="py-3 px-4 text-right">Records Synced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono text-xs">
                  {recentLogs.map(l => (
                    <tr key={l.id} className="transition-colors hover:bg-muted/20">
                      <td className="py-3 px-4 text-muted-foreground">{l.time}</td>
                      <td className="py-3 px-4 font-sans font-semibold text-foreground">{l.service}</td>
                      <td className="py-3 px-4 font-sans text-muted-foreground">{l.event}</td>
                      <td className="py-3 px-4">
                        <span className="badge badge-success text-[10px]">{l.status}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-sans font-medium text-foreground">
                        {l.records} records
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: CONFIGURE CONNECTOR */}
      {configModal && (
        <Modal
          open
          onClose={() => setConfigModal(null)}
          title={`Configure Connector: ${configModal.name}`}
          subtitle={`Category: ${configModal.category}`}
          width={580}
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setConfigModal(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={saveConfig}>
                Save Configuration
              </button>
            </>
          }
        >
          <form onSubmit={saveConfig} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">API Endpoint URL</label>
              <input
                defaultValue={`https://api.${configModal.name.toLowerCase().replace(/[^a-z]/g, '')}.com/v2/sync`}
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">API Secret Key / Token</label>
              <input
                type="password"
                defaultValue=""
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Sync Frequency</label>
                <select
                  defaultValue={configModal.frequency}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Real-time (WebSocket)</option>
                  <option>Hourly</option>
                  <option>Every 6 hours</option>
                  <option>Daily</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Environment</label>
                <select
                  defaultValue="Production (Live)"
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Production (Live)</option>
                  <option>Sandbox / Staging</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg bg-muted/30 p-3 space-y-2">
              <span className="text-xs font-bold text-foreground">Automated Webhook Dispatch:</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Payload signatures verified using SHA-256 HMAC</span>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}
