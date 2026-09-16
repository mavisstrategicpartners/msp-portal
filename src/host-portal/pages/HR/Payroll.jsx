import { useMemo, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedEmployees } from '../../data/mockData.js'
import { useLocalStorage, uid } from '../../lib/useLocalStorage.js'
import { Calculator, Lock, Plus, Trash2 } from 'lucide-react'

const money = value => `R ${Number(value || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const emptyRecord = employee => ({ id: '', employee_id: employee?.id || '', employee: employee?.full_name || '', basic_salary: 0, sales_amount: 0, sales_percent: 0, incentive: 0, gift: 0, uif: 0, loan: 0, advance_salary: 0, period: new Date().toISOString().slice(0, 7) })

function totals(record) {
  const salesCommission = Number(record.sales_amount || 0) * (Number(record.sales_percent || 0) / 100)
  const gross = Number(record.basic_salary || 0) + salesCommission + Number(record.incentive || 0) + Number(record.gift || 0)
  const deductions = Number(record.uif || 0) + Number(record.loan || 0) + Number(record.advance_salary || 0)
  return { salesCommission, gross, deductions, net: gross - deductions }
}

export default function Payroll() {
  const [records, setRecords] = useLocalStorage('hr.payroll_records', [])
  const [selectedEmployee, setSelectedEmployee] = useState(seedEmployees[0]?.id || '')
  const [form, setForm] = useState(null)
  const employee = seedEmployees.find(item => item.id === selectedEmployee) || seedEmployees[0]
  const selectedRecords = records.filter(record => record.employee_id === selectedEmployee)
  const monthTotal = useMemo(() => selectedRecords.reduce((sum, record) => sum + totals(record).net, 0), [selectedRecords])

  const save = event => {
    event.preventDefault()
    const next = { ...form, employee_id: selectedEmployee, employee: employee.full_name }
    setRecords(previous => next.id ? previous.map(record => record.id === next.id ? next : record) : [{ ...next, id: uid('PAY') }, ...previous])
    setForm(null)
  }

  const remove = record => {
    if (window.confirm(`Delete payroll record for ${record.employee}?`)) setRecords(previous => previous.filter(item => item.id !== record.id))
  }

  return (
    <DashboardLayout title="Payroll Platform">
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div><div style={{ fontSize: 16, fontWeight: 700 }}>Payroll workspace</div><div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Calculate sales commission, incentives, gifts, deductions and net pay by employee and month.</div></div>
          <span className="badge badge-purple"><Lock size={12} /> HR controlled</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(210px, .7fr) minmax(0, 1.8fr)', gap: 16, alignItems: 'start' }}>
        <div className="card" style={{ padding: 10 }}>
          <div style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Employees</div>
          {seedEmployees.map(item => <button key={item.id} type="button" onClick={() => setSelectedEmployee(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: 10, border: 0, borderRadius: 8, background: selectedEmployee === item.id ? 'var(--brand-soft)' : 'transparent', color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer' }}><Calculator size={16} color="var(--brand)" /><span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{item.full_name}</span></button>)}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'start', marginBottom: 14 }}><div><div style={{ fontSize: 18, fontWeight: 700 }}>{employee?.full_name}</div><div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{employee?.role}</div></div><button className="btn btn-primary" onClick={() => setForm(emptyRecord(employee))}><Plus size={15} /> New payroll</button></div>
          <div className="card" style={{ padding: 14, background: 'var(--bg-secondary)', marginBottom: 14 }}><div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Selected records net total</div><div style={{ fontSize: 25, fontWeight: 800, color: 'var(--brand)', marginTop: 3 }}>{money(monthTotal)}</div></div>
          {selectedRecords.length === 0 ? <div style={{ padding: '25px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No payroll records yet for this employee.</div> : <div style={{ display: 'grid', gap: 8 }}>{selectedRecords.map(record => { const calculated = totals(record); return <div key={record.id} style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}><div><b>{record.period}</b><div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Basic {money(record.basic_salary)} · Sales commission {money(calculated.salesCommission)}</div></div><b style={{ color: 'var(--brand)' }}>{money(calculated.net)}</b></div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10, fontSize: 11 }}><span className="badge badge-info">Gross {money(calculated.gross)}</span><span className="badge badge-warning">Deductions {money(calculated.deductions)}</span><button className="btn btn-ghost" onClick={() => setForm(record)}>Edit</button><button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => remove(record)} aria-label="Delete payroll record"><Trash2 size={14} /></button></div></div> })}</div>}
        </div>
      </div>

      {form && <Modal open onClose={() => setForm(null)} title={`Payroll — ${employee?.full_name}`} subtitle="All amounts are in South African Rand (ZAR)." width={700} footer={<><button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary" type="submit" form="payroll-form">Save payroll</button></>}>
        <form id="payroll-form" onSubmit={save} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>Pay period</label><input required type="month" style={field} value={form.period} onChange={event => setForm({ ...form, period: event.target.value })} /></div>
          <div><label style={labelStyle}>Basic salary</label><input required min="0" type="number" step="0.01" style={field} value={form.basic_salary} onChange={event => setForm({ ...form, basic_salary: event.target.value })} /></div>
          <div><label style={labelStyle}>Sales amount</label><input min="0" type="number" step="0.01" style={field} value={form.sales_amount} onChange={event => setForm({ ...form, sales_amount: event.target.value })} /></div>
          <div><label style={labelStyle}>Sales %</label><input min="0" type="number" step="0.01" style={field} value={form.sales_percent} onChange={event => setForm({ ...form, sales_percent: event.target.value })} /></div>
          <div><label style={labelStyle}>Incentive</label><input min="0" type="number" step="0.01" style={field} value={form.incentive} onChange={event => setForm({ ...form, incentive: event.target.value })} /></div>
          <div><label style={labelStyle}>Gift</label><input min="0" type="number" step="0.01" style={field} value={form.gift} onChange={event => setForm({ ...form, gift: event.target.value })} /></div>
          <div><label style={labelStyle}>UIF deduction</label><input min="0" type="number" step="0.01" style={field} value={form.uif} onChange={event => setForm({ ...form, uif: event.target.value })} /></div>
          <div><label style={labelStyle}>Loan deduction</label><input min="0" type="number" step="0.01" style={field} value={form.loan} onChange={event => setForm({ ...form, loan: event.target.value })} /></div>
          <div><label style={labelStyle}>Advance salary deduction</label><input min="0" type="number" step="0.01" style={field} value={form.advance_salary} onChange={event => setForm({ ...form, advance_salary: event.target.value })} /></div>
          <div style={{ gridColumn: '1 / -1', padding: 12, borderRadius: 8, background: 'var(--bg-secondary)' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>Sales commission</span><b>{money(totals(form).salesCommission)}</b></div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 6 }}><span>Gross pay</span><b>{money(totals(form).gross)}</b></div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, marginTop: 8, color: 'var(--brand)' }}><span>Net pay</span><b>{money(totals(form).net)}</b></div></div>
        </form>
      </Modal>}
    </DashboardLayout>
  )
}
