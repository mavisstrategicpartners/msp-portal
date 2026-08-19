import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import { useLocalStorage } from '../../lib/useLocalStorage.js'

const empty = {
  host_full_name: '', contact_number: '', contact_email: '', alt_email: '', contact_title: '',
  company_name: '', registration_number: '', business_address: '', company_overview: '',
  sector: '', years_operating: 1, footprint: '', employees: 0,
  learners_current: 0, learners_previous: 0, last_intake: '', website: '',
  learners_needed: 0, roles_needed: '',
  accommodate_disability: false, disability_types: '',
  virtual_site_visit: false, proximity_transport: '',
}
const labelStyle = { fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '.05em' }
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)', fontSize: 13 }

function Field({ label, k, form, set, type = 'text', full }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <label style={labelStyle}>{label}</label>
      {type === 'textarea'
        ? <textarea rows={3} style={inputStyle} value={form[k]} onChange={set(k)} />
        : <input type={type} style={inputStyle} value={form[k]} onChange={set(k)} />}
    </div>
  )
}

export default function HostCheck() {
  const [form, setForm] = useLocalStorage('host.host_check', empty)
  const [saved, setSaved] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? Number(e.target.value) : e.target.value }))
  const submit = (e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 3000) }

  return (
    <DashboardLayout title="Host Employer Check">
      <div className="card" style={{ marginBottom: 16, background: 'var(--brand-soft)', border: '1px solid var(--brand)' }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>Host intake & vetting form</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Complete this once per intake cycle. Your responses inform learner matching, site visits, and reporting.</div>
      </div>

      <form onSubmit={submit} className="card">
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>Contact person</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <Field label="Host full name" k="host_full_name" form={form} set={set} />
          <Field label="Title / position" k="contact_title" form={form} set={set} />
          <Field label="Contact number" k="contact_number" form={form} set={set} />
          <Field label="Contact email" k="contact_email" form={form} set={set} type="email" />
          <Field label="Alternative email" k="alt_email" form={form} set={set} type="email" />
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '22px 0 12px' }}>Company details</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <Field label="Company name" k="company_name" form={form} set={set} />
          <Field label="Registration number" k="registration_number" form={form} set={set} />
          <Field label="Business address" k="business_address" form={form} set={set} full />
          <Field label="Company overview" k="company_overview" form={form} set={set} type="textarea" full />
          <Field label="Sector / industry" k="sector" form={form} set={set} />
          <Field label="Years of operation" k="years_operating" form={form} set={set} type="number" />
          <Field label="Footprint (provinces / regions)" k="footprint" form={form} set={set} />
          <Field label="Website / portfolio link" k="website" form={form} set={set} />
          <Field label="Number of employees" k="employees" form={form} set={set} type="number" />
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '22px 0 12px' }}>Learner hosting</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <Field label="Learners currently hosting" k="learners_current" form={form} set={set} type="number" />
          <Field label="Learners previously hosted" k="learners_previous" form={form} set={set} type="number" />
          <Field label="Date of last intake" k="last_intake" form={form} set={set} type="date" />
          <Field label="Number of learners requested / needed" k="learners_needed" form={form} set={set} type="number" />
          <Field label="Specific roles to be filled" k="roles_needed" form={form} set={set} type="textarea" full />
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '22px 0 12px' }}>Inclusion & logistics</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, marginTop: 20 }}>
              <input type="checkbox" checked={form.accommodate_disability} onChange={set('accommodate_disability')} />
              Can accommodate a person living with a disability
            </label>
          </div>
          <Field label="Which disabilities can you support?" k="disability_types" form={form} set={set} />
          <div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, marginTop: 20 }}>
              <input type="checkbox" checked={form.virtual_site_visit} onChange={set('virtual_site_visit')} />
              Willing to accept a virtual site visit
            </label>
          </div>
          <Field label="Proximity to public transport" k="proximity_transport" form={form} set={set} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
          {saved && <span className="badge badge-success" style={{ alignSelf: 'center' }}>✓ Saved</span>}
          <button type="submit" className="btn btn-primary">Save intake form</button>
        </div>
      </form>
    </DashboardLayout>
  )
}
