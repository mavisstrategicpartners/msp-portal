import { useMemo, useRef, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedEmployees } from '../../data/mockData.js'
import { uid } from '../../lib/useLocalStorage.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'
import { Folder, FileText, Lock, Upload, Trash2 } from 'lucide-react'

const accessOptions = ['HR only', 'Employee + HR']

export default function Documents() {
  const [documents, setDocuments] = useSupabaseTable('hr_documents', [])
  const [selectedEmployee, setSelectedEmployee] = useState(seedEmployees[0]?.id || '')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [access, setAccess] = useState('HR only')
  const [file, setFile] = useState(null)
  const fileInput = useRef(null)

  const employees = useMemo(() => seedEmployees, [])
  const employee = employees.find(item => item.id === selectedEmployee) || employees[0]
  const employeeDocuments = documents.filter(document => document.employee_id === employee?.id)

  const upload = () => {
    if (!file || !employee) return
    const reader = new FileReader()
    reader.onload = () => {
      setDocuments(previous => [{
        id: uid('DOC'), employee_id: employee.id, employee_name: employee.full_name,
        name: file.name, type: file.type || 'application/octet-stream', size: file.size,
        access, uploaded: new Date().toISOString().slice(0, 10), data_url: reader.result,
      }, ...previous])
      setFile(null)
      setAccess('HR only')
      setUploadOpen(false)
    }
    reader.readAsDataURL(file)
  }

  const remove = document => {
    if (window.confirm(`Delete ${document.name}?`)) setDocuments(previous => previous.filter(item => item.id !== document.id))
  }

  return (
    <DashboardLayout title="Employee Documents">
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Employee document folders</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Each employee has a separate folder. Access is set per document and managed by HR.</div>
          </div>
          <button className="btn btn-primary" onClick={() => setUploadOpen(true)}><Upload size={15} /> Upload document</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(210px, .7fr) minmax(0, 1.8fr)', gap: 16, alignItems: 'start' }}>
        <div className="card" style={{ padding: 10 }}>
          <div style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Employee folders</div>
          {employees.map(item => {
            const count = documents.filter(document => document.employee_id === item.id).length
            return <button key={item.id} type="button" onClick={() => setSelectedEmployee(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px', border: 0, borderRadius: 8, background: selectedEmployee === item.id ? 'var(--brand-soft)' : 'transparent', color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer' }}>
              <Folder size={17} color="var(--brand)" /><span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{item.full_name}</span><span className="badge badge-info">{count}</span>
            </button>
          })}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 10, marginBottom: 14 }}>
            <div><div style={{ fontSize: 18, fontWeight: 700 }}>{employee?.full_name}</div><div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{employee?.role} · {employee?.department}</div></div>
            <span className="badge badge-purple"><Lock size={12} /> HR controlled</span>
          </div>
          {employeeDocuments.length === 0 ? <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No documents in this employee folder yet.</div> : <div style={{ display: 'grid', gap: 8 }}>
            {employeeDocuments.map(document => <div key={document.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, border: '1px solid var(--border-color)', borderRadius: 8 }}>
              <FileText size={18} color="var(--brand)" /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{document.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{document.uploaded} · {Math.max(1, Math.round(document.size / 1024))} KB</div></div><span className="badge badge-info">{document.access}</span><button className="btn btn-ghost" onClick={() => remove(document)} aria-label={`Delete ${document.name}`}><Trash2 size={15} /></button>
            </div>)}
          </div>}
        </div>
      </div>

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title={`Upload to ${employee?.full_name || 'employee folder'}`} width={520} footer={<><button className="btn btn-ghost" onClick={() => setUploadOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={upload} disabled={!file}>Upload document</button></>}>
        <div style={{ display: 'grid', gap: 14 }}>
          <div><label style={labelStyle}>Employee folder</label><select style={field} value={selectedEmployee} onChange={event => setSelectedEmployee(event.target.value)}>{employees.map(item => <option key={item.id} value={item.id}>{item.full_name}</option>)}</select></div>
          <div><label style={labelStyle}>Document</label><input ref={fileInput} type="file" style={{ ...field, padding: 8 }} onChange={event => setFile(event.target.files?.[0] || null)} /></div>
          <div><label style={labelStyle}>Access restriction</label><select style={field} value={access} onChange={event => setAccess(event.target.value)}>{accessOptions.map(option => <option key={option}>{option}</option>)}</select><div style={{ marginTop: 5, fontSize: 11, color: 'var(--text-muted)' }}>HR only keeps the document private. Employee + HR allows the employee to view it once employee self-service is enabled.</div></div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
