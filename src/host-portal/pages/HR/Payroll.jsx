import { useState, useMemo } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'

import { uid } from '../../lib/useLocalStorage.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'
import { toast } from 'sonner'
import {
  Calculator,
  Lock,
  Plus,
  Trash2,
  Edit2,
  Printer,
  Download,
  Search,
  DollarSign,
  TrendingUp,
  Gift,
  Award,
  FileText,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  Percent,
  Coins,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react'

// South African Rand currency formatter
const money = value =>
  `R ${Number(value || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// Calculate all line items for a payroll record
export function calculatePayrollTotals(record) {
  const basic = Number(record?.basic_salary || 0)
  const salesAmt = Number(record?.sales_amount || 0)
  const salesPct = Number(record?.sales_percent || 0)
  const salesCommission = salesAmt * (salesPct / 100)
  const incentive = Number(record?.incentive || 0)
  const gift = Number(record?.gift || 0)

  const gross = basic + salesCommission + incentive + gift

  // South African statutory UIF: 1% of remuneration, capped at R 177.12/month
  const calculatedUif = record?.uif !== undefined && record?.uif !== null && record?.uif !== ''
    ? Number(record.uif)
    : Math.min(gross * 0.01, 177.12)

  const paye = Number(record?.paye || 0)
  const loan = Number(record?.loan || 0)
  const advance = Number(record?.advance_salary || 0)

  const totalDeductions = calculatedUif + paye + loan + advance
  const net = Math.max(0, gross - totalDeductions)

  return {
    basic,
    salesAmt,
    salesPct,
    salesCommission,
    incentive,
    gift,
    gross,
    uif: calculatedUif,
    paye,
    loan,
    advance,
    totalDeductions,
    net
  }
}

export default function Payroll() {
  const [records, setRecords] = useSupabaseTable('hr_payroll_records', [])
  const [employees] = useSupabaseTable('hr_employees', [])

  // Build staff list from live employee records
  const allStaff = useMemo(() => {
    return employees.map(e => ({
      id: e.id,
      full_name: e.full_name || e.name || 'Unknown',
      role: e.role || e.job_title || '',
      department: e.department || '',
      type: e.employment_type || 'Employee',
      default_basic: Number(e.basic_salary || 0)
    }))
  }, [employees])

  const [selectedPeriod, setSelectedPeriod] = useState('2026-07')
  const [viewMode, setViewMode] = useState('worksheet') // 'worksheet' | 'register'
  const [selectedStaffId, setSelectedStaffId] = useState(allStaff[0]?.id || 'E-1')
  const [staffSearch, setStaffSearch] = useState('')

  // Modals
  const [formRecord, setFormRecord] = useState(null)
  const [payslipRecord, setPayslipRecord] = useState(null)
  const [incentiveModalOpen, setIncentiveModalOpen] = useState(false)
  const [giftModalOpen, setGiftModalOpen] = useState(false)

  // Quick Incentive State
  const [quickIncentiveAmt, setQuickIncentiveAmt] = useState('')
  const [quickIncentiveType, setQuickIncentiveType] = useState('Performance Target Bonus')

  // Quick Gift State
  const [quickGiftAmt, setQuickGiftAmt] = useState('')
  const [quickGiftType, setQuickGiftType] = useState('Employee Appreciation Gift Voucher')

  const activeStaff = allStaff.find(s => s.id === selectedStaffId) || allStaff[0]

  // Filter records by selected period
  const periodRecords = useMemo(() => {
    return records.filter(r => r.period === selectedPeriod)
  }, [records, selectedPeriod])

  // Current record for the active employee in this period (or empty template)
  const activeRecord = useMemo(() => {
    const existing = periodRecords.find(r => r.employee_id === activeStaff?.id)
    if (existing) return existing

    return {
      id: '',
      employee_id: activeStaff?.id || '',
      employee: activeStaff?.full_name || '',
      department: activeStaff?.department || '',
      period: selectedPeriod,
      pay_date: `${selectedPeriod}-25`,
      status: 'Draft',
      basic_salary: activeStaff?.default_basic || 25000,
      sales_amount: 0,
      sales_percent: 0,
      sales_commission: 0,
      incentive: 0,
      incentive_type: '',
      gift: 0,
      gift_type: '',
      uif: 177.12,
      paye: Math.round((activeStaff?.default_basic || 25000) * 0.18),
      loan: 0,
      advance_salary: 0,
      notes: ''
    }
  }, [periodRecords, activeStaff, selectedPeriod])

  // Summary statistics for the selected period
  const periodStats = useMemo(() => {
    let totalGross = 0
    let totalBasic = 0
    let totalSalesCommission = 0
    let totalIncentives = 0
    let totalGifts = 0
    let totalNet = 0

    periodRecords.forEach(r => {
      const calc = calculatePayrollTotals(r)
      totalGross += calc.gross
      totalBasic += calc.basic
      totalSalesCommission += calc.salesCommission
      totalIncentives += calc.incentive
      totalGifts += calc.gift
      totalNet += calc.net
    })

    return {
      totalGross,
      totalBasic,
      totalSalesCommission,
      totalIncentives,
      totalGifts,
      totalNet,
      processedCount: periodRecords.length,
      paidCount: periodRecords.filter(r => r.status === 'Paid').length
    }
  }, [periodRecords])

  // Save / Update a record
  const handleSaveRecord = (recordToSave) => {
    const calc = calculatePayrollTotals(recordToSave)
    const updated = {
      ...recordToSave,
      sales_commission: calc.salesCommission,
      uif: calc.uif,
      employee_id: activeStaff.id,
      employee: activeStaff.full_name,
      department: activeStaff.department,
      period: selectedPeriod,
    }

    if (updated.id) {
      setRecords(prev => prev.map(r => r.id === updated.id ? updated : r))
      toast.success(`Updated payroll for ${activeStaff.full_name}`)
    } else {
      const newRec = { ...updated, id: uid('PAY') }
      setRecords(prev => [newRec, ...prev])
      toast.success(`Created payroll record for ${activeStaff.full_name}`)
    }
    setFormRecord(null)
  }

  // Delete a record
  const handleDeleteRecord = (rec) => {
    if (window.confirm(`Delete payroll entry for ${rec.employee} (${rec.period})?`)) {
      setRecords(prev => prev.filter(r => r.id !== rec.id))
      toast.success(`Removed payroll record`)
    }
  }

  // Quick Add Incentive
  const handleApplyQuickIncentive = (e) => {
    e.preventDefault()
    const amt = Number(quickIncentiveAmt)
    if (isNaN(amt) || amt < 0) {
      toast.error('Please enter a valid incentive amount')
      return
    }

    const updated = {
      ...activeRecord,
      incentive: amt,
      incentive_type: quickIncentiveType
    }
    handleSaveRecord(updated)
    setIncentiveModalOpen(false)
    setQuickIncentiveAmt('')
    toast.success(`Added ${money(amt)} incentive for ${activeStaff.full_name}`)
  }

  // Quick Add Gift
  const handleApplyQuickGift = (e) => {
    e.preventDefault()
    const amt = Number(quickGiftAmt)
    if (isNaN(amt) || amt < 0) {
      toast.error('Please enter a valid gift amount')
      return
    }

    const updated = {
      ...activeRecord,
      gift: amt,
      gift_type: quickGiftType
    }
    handleSaveRecord(updated)
    setGiftModalOpen(false)
    setQuickGiftAmt('')
    toast.success(`Added ${money(amt)} gift voucher for ${activeStaff.full_name}`)
  }

  // Filtered staff list for left sidebar
  const filteredStaff = useMemo(() => {
    return allStaff.filter(s =>
      s.full_name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      s.role.toLowerCase().includes(staffSearch.toLowerCase()) ||
      s.department.toLowerCase().includes(staffSearch.toLowerCase())
    )
  }, [allStaff, staffSearch])

  const activeCalc = calculatePayrollTotals(activeRecord)

  // Empty state when no employees in the system yet
  if (allStaff.length === 0) {
    return (
      <DashboardLayout title="Payroll Platform">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 420, gap: 20, textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(59,130,246,0.15) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <Calculator size={36} style={{ color: '#10b981' }} />
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>No Employees Added Yet</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', maxWidth: 400, lineHeight: 1.6 }}>
            Payroll records will appear here once employees are added to the system. You'll be able to process salaries, commissions, incentives, and gifts.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '12px 20px' }}>
            <ShieldCheck size={18} style={{ color: '#10b981', flexShrink: 0 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Payroll data is restricted to HR personnel only.</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Payroll Platform">
      {/* Sleek, Compact Controls & Metrics Bar */}
      <div
        className="card"
        style={{
          marginBottom: 16,
          padding: '12px 16px',
          borderRadius: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          background: 'var(--bg-primary)'
        }}
      >
        {/* Metric summary chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Gross:</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--brand)' }}>{money(periodStats.totalGross)}</span>
          </div>
          <div style={{ height: 16, width: 1, background: 'var(--border-color)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Commission:</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6' }}>{money(periodStats.totalSalesCommission)}</span>
          </div>
          <div style={{ height: 16, width: 1, background: 'var(--border-color)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Incentives & Gifts:</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>{money(periodStats.totalIncentives + periodStats.totalGifts)}</span>
          </div>
          <div style={{ height: 16, width: 1, background: 'var(--border-color)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Net Payout:</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>{money(periodStats.totalNet)}</span>
          </div>
        </div>

        {/* Period Selector & View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            style={{ ...field, width: 130, height: 32, fontSize: 11.5, borderRadius: 8 }}
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
          >
            <option value="2026-08">Aug 2026</option>
            <option value="2026-07">Jul 2026</option>
            <option value="2026-06">Jun 2026</option>
            <option value="2026-05">May 2026</option>
          </select>

          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 8, padding: 2, background: 'var(--bg-secondary)' }}>
            <button
              type="button"
              className={`btn btn-xs ${viewMode === 'worksheet' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('worksheet')}
              style={{ fontSize: 11, borderRadius: 6 }}
            >
              Worksheet
            </button>
            <button
              type="button"
              className={`btn btn-xs ${viewMode === 'register' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('register')}
              style={{ fontSize: 11, borderRadius: 6 }}
            >
              Register ({periodRecords.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'worksheet' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) minmax(0, 1fr)', gap: 18, alignItems: 'start' }}>
          
          {/* Left Column: Staff Selector */}
          <div className="card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '4px 6px' }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)' }}>
                Staff Payroll Roster
              </span>
              <span className="badge badge-info">{filteredStaff.length}</span>
            </div>

            <div style={{ position: 'relative', marginBottom: 10 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search staff..."
                value={staffSearch}
                onChange={e => setStaffSearch(e.target.value)}
                style={{ ...field, paddingLeft: 30, fontSize: 12, height: 34 }}
              />
            </div>

            <div style={{ display: 'grid', gap: 4, maxHeight: 'calc(100vh - 360px)', overflowY: 'auto' }}>
              {filteredStaff.map(staff => {
                const rec = periodRecords.find(r => r.employee_id === staff.id)
                const isSelected = selectedStaffId === staff.id
                const isProcessed = !!rec

                return (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => setSelectedStaffId(staff.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 10px',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--brand)' : 'transparent',
                      borderRadius: 8,
                      background: isSelected ? 'var(--brand-soft)' : 'transparent',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: isSelected ? 'var(--brand)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? '#fff' : 'var(--text-secondary)', fontSize: 12, fontWeight: 700 }}>
                      {staff.full_name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {staff.full_name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {staff.role}
                      </div>
                    </div>
                    <div>
                      {isProcessed ? (
                        <span className={`badge ${rec.status === 'Paid' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                          {rec.status}
                        </span>
                      ) : (
                        <span className="badge badge-neutral" style={{ fontSize: 10 }}>Draft</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Column: Interactive Payroll Worksheet & Calculator */}
          <div style={{ display: 'grid', gap: 16 }}>
            
            {/* Employee Header & Action Bar */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{activeStaff?.full_name}</h2>
                    <span className="badge badge-purple">{activeStaff?.department}</span>
                    <span className={`badge ${activeRecord.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                      {activeRecord.status || 'Draft'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <span><b>Period:</b> {selectedPeriod}</span>
                    <span><b>Pay Date:</b> {activeRecord.pay_date || `${selectedPeriod}-25`}</span>
                    <span><b>Type:</b> {activeStaff?.type}</span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setQuickIncentiveAmt(activeRecord.incentive ? String(activeRecord.incentive) : '')
                      setIncentiveModalOpen(true)
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Award size={14} color="#10b981" /> Add Incentive
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setQuickGiftAmt(activeRecord.gift ? String(activeRecord.gift) : '')
                      setGiftModalOpen(true)
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Gift size={14} color="#f59e0b" /> Add Gift
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setPayslipRecord({ ...activeRecord, ...activeCalc })}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <FileText size={14} /> View Payslip
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Calculator Card */}
            <div className="card">
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Coins size={18} color="var(--brand)" />
                Remuneration Breakdown & Sales Commission Calculator
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault()
                  handleSaveRecord(activeRecord)
                }}
                style={{ display: 'grid', gap: 16 }}
              >
                {/* 1. Basic Salary */}
                <div style={{ padding: 14, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ ...labelStyle, margin: 0, fontSize: 13, fontWeight: 700 }}>
                      1. Basic Salary (Monthly Base Pay)
                    </label>
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                      {money(activeCalc.basic)}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 12, alignItems: 'center' }}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      style={field}
                      value={activeRecord.basic_salary}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0
                        const updated = { ...activeRecord, basic_salary: val }
                        setRecords(prev => {
                          const idx = prev.findIndex(r => r.employee_id === activeStaff.id && r.period === selectedPeriod)
                          if (idx >= 0) {
                            const copy = [...prev]
                            copy[idx] = updated
                            return copy
                          }
                          return [...prev, updated]
                        })
                      }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>ZAR / Month</span>
                  </div>
                </div>

                {/* 2. Sales Commission % Calculator */}
                <div style={{ padding: 14, borderRadius: 8, background: 'rgba(59, 130, 246, 0.04)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ ...labelStyle, margin: 0, fontSize: 13, fontWeight: 700, color: '#2563eb' }}>
                      2. Sales Commission Calculator (% Rate)
                    </label>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#2563eb' }}>
                      {money(activeCalc.salesCommission)}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Total Sales Achieved (R)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 150000"
                        style={field}
                        value={activeRecord.sales_amount || ''}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0
                          const updated = { ...activeRecord, sales_amount: val }
                          setRecords(prev => {
                            const idx = prev.findIndex(r => r.employee_id === activeStaff.id && r.period === selectedPeriod)
                            if (idx >= 0) {
                              const copy = [...prev]
                              copy[idx] = updated
                              return copy
                            }
                            return [...prev, updated]
                          })
                        }}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Commission Percentage (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="e.g. 5.0"
                        style={field}
                        value={activeRecord.sales_percent || ''}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0
                          const updated = { ...activeRecord, sales_percent: val }
                          setRecords(prev => {
                            const idx = prev.findIndex(r => r.employee_id === activeStaff.id && r.period === selectedPeriod)
                            if (idx >= 0) {
                              const copy = [...prev]
                              copy[idx] = updated
                              return copy
                            }
                            return [...prev, updated]
                          })
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Percent size={13} color="#2563eb" />
                    <span>
                      Formula: <b>{money(activeRecord.sales_amount || 0)}</b> × <b>{activeRecord.sales_percent || 0}%</b> = <b>{money(activeCalc.salesCommission)}</b>
                    </span>
                  </div>
                </div>

                {/* 3. Add Incentive & Add Gift */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Incentive Box */}
                  <div style={{ padding: 14, borderRadius: 8, background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ ...labelStyle, margin: 0, fontSize: 13, fontWeight: 700, color: '#059669' }}>
                        3. Add Incentive
                      </label>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>
                        {money(activeCalc.incentive)}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>Amount (R)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          style={field}
                          value={activeRecord.incentive || ''}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0
                            const updated = { ...activeRecord, incentive: val }
                            setRecords(prev => {
                              const idx = prev.findIndex(r => r.employee_id === activeStaff.id && r.period === selectedPeriod)
                              if (idx >= 0) {
                                const copy = [...prev]
                                copy[idx] = updated
                                return copy
                              }
                              return [...prev, updated]
                            })
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>Incentive Reason / KPI</label>
                        <input
                          type="text"
                          style={field}
                          placeholder="e.g. Monthly Performance Bonus"
                          value={activeRecord.incentive_type || ''}
                          onChange={e => {
                            const updated = { ...activeRecord, incentive_type: e.target.value }
                            setRecords(prev => {
                              const idx = prev.findIndex(r => r.employee_id === activeStaff.id && r.period === selectedPeriod)
                              if (idx >= 0) {
                                const copy = [...prev]
                                copy[idx] = updated
                                return copy
                              }
                              return [...prev, updated]
                            })
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gift Box */}
                  <div style={{ padding: 14, borderRadius: 8, background: 'rgba(245, 158, 11, 0.04)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ ...labelStyle, margin: 0, fontSize: 13, fontWeight: 700, color: '#d97706' }}>
                        4. Add Gift
                      </label>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#d97706' }}>
                        {money(activeCalc.gift)}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gift Value (R)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          style={field}
                          value={activeRecord.gift || ''}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0
                            const updated = { ...activeRecord, gift: val }
                            setRecords(prev => {
                              const idx = prev.findIndex(r => r.employee_id === activeStaff.id && r.period === selectedPeriod)
                              if (idx >= 0) {
                                const copy = [...prev]
                                copy[idx] = updated
                                return copy
                              }
                              return [...prev, updated]
                            })
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gift Description / Voucher</label>
                        <input
                          type="text"
                          style={field}
                          placeholder="e.g. Woolworths Hamper / Token"
                          value={activeRecord.gift_type || ''}
                          onChange={e => {
                            const updated = { ...activeRecord, gift_type: e.target.value }
                            setRecords(prev => {
                              const idx = prev.findIndex(r => r.employee_id === activeStaff.id && r.period === selectedPeriod)
                              if (idx >= 0) {
                                const copy = [...prev]
                                copy[idx] = updated
                                return copy
                              }
                              return [...prev, updated]
                            })
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Statutory & Voluntary Deductions */}
                <div style={{ padding: 14, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label style={{ ...labelStyle, margin: 0, fontSize: 13, fontWeight: 700 }}>
                      5. Statutory & Company Deductions
                    </label>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)' }}>
                      - {money(activeCalc.totalDeductions)}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>UIF (Max R 177.12)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        style={field}
                        value={activeRecord.uif !== undefined ? activeRecord.uif : activeCalc.uif}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0
                          const updated = { ...activeRecord, uif: val }
                          setRecords(prev => {
                            const idx = prev.findIndex(r => r.employee_id === activeStaff.id && r.period === selectedPeriod)
                            if (idx >= 0) {
                              const copy = [...prev]
                              copy[idx] = updated
                              return copy
                            }
                            return [...prev, updated]
                          })
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>PAYE Income Tax</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        style={field}
                        value={activeRecord.paye || 0}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0
                          const updated = { ...activeRecord, paye: val }
                          setRecords(prev => {
                            const idx = prev.findIndex(r => r.employee_id === activeStaff.id && r.period === selectedPeriod)
                            if (idx >= 0) {
                              const copy = [...prev]
                              copy[idx] = updated
                              return copy
                            }
                            return [...prev, updated]
                          })
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>Salary Advance Repayment</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        style={field}
                        value={activeRecord.advance_salary || 0}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0
                          const updated = { ...activeRecord, advance_salary: val }
                          setRecords(prev => {
                            const idx = prev.findIndex(r => r.employee_id === activeStaff.id && r.period === selectedPeriod)
                            if (idx >= 0) {
                              const copy = [...prev]
                              copy[idx] = updated
                              return copy
                            }
                            return [...prev, updated]
                          })
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Final Net Remuneration Total Card */}
                <div
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--brand-soft), rgba(16, 185, 129, 0.1))',
                    border: '1px solid var(--brand)',
                    display: 'grid',
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>Gross Earnings (Basic + Commission + Incentive + Gift)</span>
                    <b>{money(activeCalc.gross)}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--danger)' }}>
                    <span>Total Deductions (UIF + PAYE + Advances)</span>
                    <b>- {money(activeCalc.totalDeductions)}</b>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
                        Net Pay Disbursement
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--brand)' }}>
                        {money(activeCalc.net)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <select
                        style={{ ...field, width: 110, height: 36, fontSize: 12 }}
                        value={activeRecord.status || 'Draft'}
                        onChange={e => {
                          const updated = { ...activeRecord, status: e.target.value }
                          handleSaveRecord(updated)
                        }}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Approved">Approved</option>
                        <option value="Paid">Paid</option>
                      </select>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleSaveRecord(activeRecord)}
                      >
                        Save & Commit
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* View 2: Complete Monthly Payroll Register Table */
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                Monthly Payroll Register — {selectedPeriod}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Comprehensive list of all staff payroll entries, commission percentages, and disbursement statuses.
              </div>
            </div>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                const csvRows = [
                  ['Employee', 'Department', 'Period', 'Basic Salary', 'Sales Amount', 'Sales %', 'Commission', 'Incentive', 'Gift', 'Gross', 'UIF', 'PAYE', 'Net', 'Status'].join(','),
                  ...periodRecords.map(r => {
                    const c = calculatePayrollTotals(r)
                    return [
                      `"${r.employee}"`,
                      `"${r.department}"`,
                      r.period,
                      c.basic,
                      c.salesAmt,
                      c.salesPct,
                      c.salesCommission,
                      c.incentive,
                      c.gift,
                      c.gross,
                      c.uif,
                      c.paye,
                      c.net,
                      r.status
                    ].join(',')
                  })
                ].join('\n')

                const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `MSP_Payroll_Register_${selectedPeriod}.csv`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
                toast.success(`Exported payroll register for ${selectedPeriod}`)
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={14} /> Export CSV Register
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: 10, letterSpacing: '.05em' }}>
                  <th style={{ padding: '8px 10px' }}>Employee</th>
                  <th style={{ padding: '8px 10px' }}>Basic Salary</th>
                  <th style={{ padding: '8px 10px' }}>Sales Amount</th>
                  <th style={{ padding: '8px 10px' }}>Sales %</th>
                  <th style={{ padding: '8px 10px' }}>Commission</th>
                  <th style={{ padding: '8px 10px' }}>Incentive</th>
                  <th style={{ padding: '8px 10px' }}>Gift</th>
                  <th style={{ padding: '8px 10px' }}>Gross</th>
                  <th style={{ padding: '8px 10px' }}>Deductions</th>
                  <th style={{ padding: '8px 10px' }}>Net Pay</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {periodRecords.map(r => {
                  const calc = calculatePayrollTotals(r)
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px' }}>
                        <div style={{ fontWeight: 700 }}>{r.employee}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.department}</div>
                      </td>
                      <td style={{ padding: '10px' }}>{money(calc.basic)}</td>
                      <td style={{ padding: '10px' }}>{calc.salesAmt ? money(calc.salesAmt) : '—'}</td>
                      <td style={{ padding: '10px' }}>{calc.salesPct ? `${calc.salesPct}%` : '—'}</td>
                      <td style={{ padding: '10px', color: '#2563eb', fontWeight: 600 }}>{calc.salesCommission ? money(calc.salesCommission) : '—'}</td>
                      <td style={{ padding: '10px', color: '#059669', fontWeight: 600 }}>{calc.incentive ? money(calc.incentive) : '—'}</td>
                      <td style={{ padding: '10px', color: '#d97706', fontWeight: 600 }}>{calc.gift ? money(calc.gift) : '—'}</td>
                      <td style={{ padding: '10px', fontWeight: 700 }}>{money(calc.gross)}</td>
                      <td style={{ padding: '10px', color: 'var(--danger)' }}>- {money(calc.totalDeductions)}</td>
                      <td style={{ padding: '10px', fontWeight: 800, color: 'var(--brand)' }}>{money(calc.net)}</td>
                      <td style={{ padding: '10px' }}>
                        <span className={`badge ${r.status === 'Paid' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 4 }}>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => {
                              setSelectedStaffId(r.employee_id)
                              setViewMode('worksheet')
                            }}
                            title="Edit in Worksheet"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => setPayslipRecord({ ...r, ...calc })}
                            title="Generate Payslip"
                          >
                            <FileText size={13} />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleDeleteRecord(r)}
                            title="Delete"
                            style={{ color: 'var(--danger)' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Add Incentive Modal */}
      {incentiveModalOpen && (
        <Modal
          open
          onClose={() => setIncentiveModalOpen(false)}
          title={`Add Incentive — ${activeStaff?.full_name}`}
          subtitle="Reward targets, performance milestones, or quarterly achievements."
          width={480}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setIncentiveModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleApplyQuickIncentive}>
                Apply Incentive
              </button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={labelStyle}>Incentive Amount (ZAR)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 3500.00"
                style={field}
                value={quickIncentiveAmt}
                onChange={e => setQuickIncentiveAmt(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Incentive Type / Milestone</label>
              <select
                style={field}
                value={quickIncentiveType}
                onChange={e => setQuickIncentiveType(e.target.value)}
              >
                <option value="Performance Target Bonus">Performance Target Bonus</option>
                <option value="Quarterly Executive Milestone">Quarterly Executive Milestone</option>
                <option value="Project Completion Bonus">Project Completion Bonus</option>
                <option value="Client Retention Distinction">Client Retention Distinction</option>
                <option value="Zero Security Incidents Award">Zero Security Incidents Award</option>
                <option value="Intern Cohort Onboarding Bonus">Intern Cohort Onboarding Bonus</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Quick Add Gift Modal */}
      {giftModalOpen && (
        <Modal
          open
          onClose={() => setGiftModalOpen(false)}
          title={`Add Gift / Reward — ${activeStaff?.full_name}`}
          subtitle="Allocate seasonal appreciation gifts, wellness hampers, or shopping vouchers."
          width={480}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setGiftModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleApplyQuickGift}>
                Apply Gift Token
              </button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={labelStyle}>Gift Value (ZAR)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 1000.00"
                style={field}
                value={quickGiftAmt}
                onChange={e => setQuickGiftAmt(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Gift Category / Description</label>
              <select
                style={field}
                value={quickGiftType}
                onChange={e => setQuickGiftType(e.target.value)}
              >
                <option value="Woolworths Hamper / Voucher">Woolworths Hamper / Voucher</option>
                <option value="Takealot Reward Voucher">Takealot Reward Voucher</option>
                <option value="Winter Wellness Care Package">Winter Wellness Care Package</option>
                <option value="Mall of Africa Shopping Card">Mall of Africa Shopping Card</option>
                <option value="Tech Gear Appreciation Token">Tech Gear Appreciation Token</option>
                <option value="Employee of the Month Recognition Gift">Employee of the Month Recognition Gift</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Official MSP Payslip Preview & Print Modal */}
      {payslipRecord && (
        <Modal
          open
          onClose={() => setPayslipRecord(null)}
          title="Official Employee Payslip"
          width={700}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setPayslipRecord(null)}>Close</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  window.print()
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Printer size={15} /> Print Payslip
              </button>
            </>
          }
        >
          <div
            id="msp-payslip-content"
            style={{
              background: '#fff',
              color: '#0f172a',
              padding: 24,
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontFamily: 'Inter, system-ui, sans-serif'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #3b1d4d', paddingBottom: 14, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#3b1d4d' }}>Mavis Strategic Partners (Pty) Ltd</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  12 Innovation Drive, Sandton, Johannesburg, 2196<br />
                  Reg: 2018/456123/07 · Tax No: 987234501
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#3b1d4d' }}>CONFIDENTIAL PAYSLIP</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Period: {payslipRecord.period}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Pay Date: {payslipRecord.pay_date || '25th'}</div>
              </div>
            </div>

            {/* Employee Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: '#f8fafc', padding: 12, borderRadius: 6, fontSize: 12, marginBottom: 14 }}>
              <div>
                <div><b>Employee Name:</b> {payslipRecord.employee}</div>
                <div><b>Employee ID:</b> {payslipRecord.employee_id}</div>
                <div><b>Department:</b> {payslipRecord.department}</div>
              </div>
              <div>
                <div><b>Payment Method:</b> Direct EFT (Nedbank)</div>
                <div><b>Status:</b> {payslipRecord.status || 'Paid'}</div>
                <div><b>POPIA Verified:</b> Yes</div>
              </div>
            </div>

            {/* Itemized Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Earnings Column */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#3b1d4d', borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 6 }}>
                  Earnings (ZAR)
                </div>
                <div style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Basic Salary</span>
                    <b>{money(payslipRecord.basic)}</b>
                  </div>
                  {payslipRecord.salesCommission > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        Sales Commission ({payslipRecord.salesPct}%)
                        <br />
                        <small style={{ color: '#64748b' }}>on {money(payslipRecord.salesAmt)}</small>
                      </span>
                      <b>{money(payslipRecord.salesCommission)}</b>
                    </div>
                  )}
                  {payslipRecord.incentive > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        Incentive Bonus
                        {payslipRecord.incentive_type && (
                          <>
                            <br />
                            <small style={{ color: '#64748b' }}>{payslipRecord.incentive_type}</small>
                          </>
                        )}
                      </span>
                      <b>{money(payslipRecord.incentive)}</b>
                    </div>
                  )}
                  {payslipRecord.gift > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        Gift Token / Hamper
                        {payslipRecord.gift_type && (
                          <>
                            <br />
                            <small style={{ color: '#64748b' }}>{payslipRecord.gift_type}</small>
                          </>
                        )}
                      </span>
                      <b>{money(payslipRecord.gift)}</b>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 6, fontWeight: 800 }}>
                    <span>Total Gross Earnings</span>
                    <span>{money(payslipRecord.gross)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Column */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#991b1b', borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 6 }}>
                  Deductions (ZAR)
                </div>
                <div style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>UIF (Statutory 1%)</span>
                    <b>{money(payslipRecord.uif)}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>PAYE (Income Tax)</span>
                    <b>{money(payslipRecord.paye)}</b>
                  </div>
                  {payslipRecord.advance > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Salary Advance Repayment</span>
                      <b>{money(payslipRecord.advance)}</b>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 6, fontWeight: 800, color: '#991b1b' }}>
                    <span>Total Deductions</span>
                    <span>- {money(payslipRecord.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay Banner */}
            <div
              style={{
                marginTop: 18,
                padding: '12px 16px',
                borderRadius: 6,
                background: '#f1f5f9',
                borderLeft: '4px solid #3b1d4d',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 800, color: '#475569' }}>
                  NET REMUNERATION PAYABLE
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Transferred to registered bank account</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#3b1d4d' }}>
                {money(payslipRecord.net)}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
