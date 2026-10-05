import { useState, useMemo, useRef } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedEmployees, seedLearners, seedHrDocuments, seedFolderSettings } from '../../data/mockData.js'
import { uid } from '../../lib/useLocalStorage.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'
import { toast } from 'sonner'
import {
  Folder,
  Lock,
  Unlock,
  FileText,
  Upload,
  Trash2,
  Eye,
  Download,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
  Users,
  CheckCircle2,
  Calendar,
  Building2,
  Plus,
  FileCheck,
  KeyRound,
  FileCode,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react'

const CATEGORIES = [
  'All',
  'Contracts',
  'Identification',
  'Tax & Banking',
  'Qualifications',
  'Performance',
  'Medical',
  'Disciplinary',
  'Other'
]

const ACCESS_LEVELS = [
  {
    id: 'HR Only',
    label: 'HR Only (Strictly Confidential)',
    description: 'Only HR Managers and Directors can access this folder and its documents.',
    badgeClass: 'badge-purple',
    icon: Lock,
  },
  {
    id: 'Manager + HR',
    label: 'Manager + HR',
    description: 'Accessible by the assigned Line Manager and HR Team.',
    badgeClass: 'badge-warning',
    icon: Shield,
  },
  {
    id: 'Employee + HR',
    label: 'Employee Self-Service (Employee + HR)',
    description: 'Employee can view their own documents, with HR management rights.',
    badgeClass: 'badge-success',
    icon: User,
  },
  {
    id: 'Executive Only',
    label: 'Executive & Legal Only',
    description: 'High restriction for legal, audit, or executive personnel files.',
    badgeClass: 'badge-danger',
    icon: ShieldAlert,
  },
]

export default function HRDocuments() {
  const [documents, setDocuments] = useSupabaseTable('hr_documents', seedHrDocuments)
  const [folderSettings, setFolderSettings] = useSupabaseTable('hr_folder_settings', seedFolderSettings)

  // Merge permanent employees and interns for full company coverage
  const allStaff = useMemo(() => {
    const regularEmployees = seedEmployees.map(e => ({
      id: e.id,
      full_name: e.full_name,
      role: e.role,
      department: e.department,
      type: 'Permanent Staff',
      email: e.email,
      phone: e.phone,
      join_date: e.join_date,
    }))

    const interns = seedLearners.slice(0, 6).map(l => ({
      id: l.id,
      full_name: l.full_name,
      role: `Intern (${l.program})`,
      department: 'Workplace Interns',
      type: 'Intern',
      email: l.email,
      phone: l.phone,
      join_date: l.start_date,
    }))

    return [...regularEmployees, ...interns]
  }, [])

  const [selectedStaffId, setSelectedStaffId] = useState(allStaff[0]?.id || 'E-1')
  const [staffSearch, setStaffSearch] = useState('')
  const [staffTypeFilter, setStaffTypeFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [docSearch, setDocSearch] = useState('')

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [singleDocAccessModal, setSingleDocAccessModal] = useState(null)

  // Upload form state
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadCategory, setUploadCategory] = useState('Contracts')
  const [uploadCustomName, setUploadCustomName] = useState('')
  const [uploadAccess, setUploadAccess] = useState('HR Only')
  const [uploadNotes, setUploadNotes] = useState('')
  const fileInputRef = useRef(null)

  const activeStaff = allStaff.find(s => s.id === selectedStaffId) || allStaff[0]

  // Get active folder settings or default
  const activeFolderSetting = useMemo(() => {
    const existing = folderSettings.find(f => f.employee_id === activeStaff?.id)
    if (existing) return existing
    return {
      employee_id: activeStaff?.id,
      access_level: 'HR Only',
      restricted: true,
      allow_employee_view: false,
      allow_manager_view: false,
      popia_consent: true,
      retention_years: 5,
      notes: 'Default privacy folder policy.'
    }
  }, [folderSettings, activeStaff])

  // Filtered staff list for left sidebar
  const filteredStaff = useMemo(() => {
    return allStaff.filter(s => {
      const matchSearch =
        s.full_name.toLowerCase().includes(staffSearch.toLowerCase()) ||
        s.role.toLowerCase().includes(staffSearch.toLowerCase()) ||
        s.department.toLowerCase().includes(staffSearch.toLowerCase())
      if (!matchSearch) return false
      if (staffTypeFilter === 'Permanent' && s.type !== 'Permanent Staff') return false
      if (staffTypeFilter === 'Interns' && s.type !== 'Intern') return false
      return true
    })
  }, [allStaff, staffSearch, staffTypeFilter])

  // Documents for the selected employee
  const currentEmployeeDocs = useMemo(() => {
    return documents.filter(d => d.employee_id === activeStaff?.id)
  }, [documents, activeStaff])

  // Filtered documents inside current folder
  const displayedDocs = useMemo(() => {
    return currentEmployeeDocs.filter(doc => {
      if (categoryFilter !== 'All' && doc.category !== categoryFilter) return false
      if (docSearch) {
        const query = docSearch.toLowerCase()
        return (
          doc.name.toLowerCase().includes(query) ||
          (doc.notes || '').toLowerCase().includes(query) ||
          (doc.category || '').toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [currentEmployeeDocs, categoryFilter, docSearch])

  // Handle uploading a file
  const handleUploadSubmit = (e) => {
    e.preventDefault()
    if (!uploadFile && !uploadCustomName) {
      toast.error('Please select a file or provide a document title.')
      return
    }

    const docTitle = uploadCustomName.trim() || uploadFile?.name || 'Untitled_Document.pdf'

    const saveDocument = (dataUrl = null) => {
      const newDoc = {
        id: uid('DOC'),
        employee_id: activeStaff.id,
        employee_name: activeStaff.full_name,
        name: docTitle,
        category: uploadCategory,
        type: uploadFile?.type || 'application/pdf',
        size: uploadFile?.size || 150000,
        access: uploadAccess,
        uploaded: new Date().toISOString().slice(0, 10),
        uploaded_by: 'Thandi Mokoena (HR Lead)',
        verified: true,
        notes: uploadNotes || 'Uploaded via HR Documents Portal',
        data_url: dataUrl
      }

      setDocuments(prev => [newDoc, ...prev])
      toast.success(`Uploaded "${docTitle}" to ${activeStaff.full_name}'s folder`)
      setUploadModalOpen(false)
      setUploadFile(null)
      setUploadCustomName('')
      setUploadNotes('')
      setUploadAccess(activeFolderSetting.access_level || 'HR Only')
    }

    if (uploadFile) {
      const reader = new FileReader()
      reader.onload = () => saveDocument(reader.result)
      reader.onerror = () => saveDocument(null)
      reader.readAsDataURL(uploadFile)
    } else {
      saveDocument(null)
    }
  }

  // Handle deleting a document
  const handleDeleteDoc = (doc) => {
    if (window.confirm(`Are you sure you want to permanently delete "${doc.name}" from ${activeStaff.full_name}'s folder?`)) {
      setDocuments(prev => prev.filter(d => d.id !== doc.id))
      toast.success(`Deleted ${doc.name}`)
    }
  }

  // Handle updating folder restriction
  const handleSavePermissions = (newSettings) => {
    setFolderSettings(prev => {
      const idx = prev.findIndex(f => f.employee_id === activeStaff.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], ...newSettings }
        return copy
      } else {
        return [...prev, { employee_id: activeStaff.id, ...newSettings }]
      }
    })
    toast.success(`Updated folder access permissions for ${activeStaff.full_name}`)
    setPermissionsModalOpen(false)
  }

  // Quick download helper
  const handleDownloadDoc = (doc) => {
    if (doc.data_url) {
      const link = document.createElement('a')
      link.href = doc.data_url
      link.download = doc.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`Downloading ${doc.name}`)
    } else {
      // Create simulated blob download
      const content = `Mavis Strategic Partners (Pty) Ltd\nConfidential HR Document\n--------------------------------\nDocument: ${doc.name}\nEmployee: ${doc.employee_name}\nCategory: ${doc.category}\nAccess Tier: ${doc.access}\nUpload Date: ${doc.uploaded}\nVerified: Yes\nNotes: ${doc.notes || 'N/A'}\n`
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = doc.name.endsWith('.pdf') ? doc.name.replace('.pdf', '.txt') : `${doc.name}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success(`Downloaded document file: ${doc.name}`)
    }
  }

  // Helper badge color for access levels
  const getAccessBadge = (level) => {
    const matched = ACCESS_LEVELS.find(a => a.id === level)
    return matched ? matched.badgeClass : 'badge-info'
  }

  const currentFolderConfig = ACCESS_LEVELS.find(a => a.id === activeFolderSetting.access_level) || ACCESS_LEVELS[0]
  const FolderIcon = currentFolderConfig.icon

  return (
    <DashboardLayout title="Employee Document Management">
      {/* Top Banner / System Status */}
      <div className="card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(59,29,77,0.06), rgba(99,102,241,0.06))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Folder size={22} color="var(--brand)" />
              <span style={{ fontSize: 18, fontWeight: 700 }}>Employee Folders & Access Control</span>
              <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={12} /> POPIA Compliant
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Secure document vault for Mavis Strategic Partners personnel. Set folder-level and document-level access restrictions to protect sensitive employee records.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setUploadAccess(activeFolderSetting.access_level || 'HR Only')
                setPermissionsModalOpen(true)
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <KeyRound size={15} /> Restrict Folder Access
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setUploadAccess(activeFolderSetting.access_level || 'HR Only')
                setUploadModalOpen(true)
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Upload size={15} /> Upload to Folder
            </button>
          </div>
        </div>

        {/* Quick summary metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Folders</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{allStaff.length} Staff</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Archived Documents</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--brand)', marginTop: 2 }}>{documents.length} Files</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Confidential (HR Only)</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#9333ea', marginTop: 2 }}>
              {folderSettings.filter(f => f.access_level === 'HR Only' || f.access_level === 'Executive Only').length} Folders
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Folder</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeStaff?.full_name}
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) minmax(0, 1fr)', gap: 18, alignItems: 'start' }}>
        
        {/* Left Column: Employee & Intern Folders List */}
        <div className="card" style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '4px 6px' }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)' }}>
              Employee Folders
            </span>
            <span className="badge badge-info">{filteredStaff.length}</span>
          </div>

          {/* Search staff */}
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search staff folder..."
              value={staffSearch}
              onChange={e => setStaffSearch(e.target.value)}
              style={{ ...field, paddingLeft: 30, fontSize: 12, height: 34 }}
            />
          </div>

          {/* Filter tabs: All / Permanent / Interns */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {['All', 'Permanent', 'Interns'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setStaffTypeFilter(type)}
                className={`btn btn-xs ${staffTypeFilter === type ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1, padding: '4px 6px', fontSize: 11 }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Staff Folder items list */}
          <div style={{ display: 'grid', gap: 4, maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
            {filteredStaff.map(staff => {
              const count = documents.filter(d => d.employee_id === staff.id).length
              const setting = folderSettings.find(f => f.employee_id === staff.id)
              const level = setting?.access_level || 'HR Only'
              const isSelected = selectedStaffId === staff.id

              return (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => {
                    setSelectedStaffId(staff.id)
                    setCategoryFilter('All')
                    setDocSearch('')
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
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
                  <div style={{ position: 'relative' }}>
                    <Folder size={20} color={isSelected ? 'var(--brand)' : 'var(--text-secondary)'} />
                    {level === 'HR Only' && (
                      <Lock size={10} color="#9333ea" style={{ position: 'absolute', bottom: -2, right: -4 }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {staff.full_name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {staff.role}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    <span className="badge badge-info" style={{ fontSize: 10, padding: '1px 6px' }}>{count}</span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{staff.type === 'Intern' ? 'Intern' : 'Staff'}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Column: Selected Employee Folder Contents & Access Controls */}
        <div style={{ display: 'grid', gap: 16 }}>
          
          {/* Active Folder Header Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{activeStaff?.full_name}</h2>
                  <span className={`badge ${currentFolderConfig.badgeClass}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                    <FolderIcon size={12} /> {activeFolderSetting.access_level}
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: 11 }}>{activeStaff?.type}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span><b>Department:</b> {activeStaff?.department}</span>
                  <span><b>Role:</b> {activeStaff?.role}</span>
                  <span><b>Staff ID:</b> {activeStaff?.id}</span>
                  <span><b>Joined:</b> {activeStaff?.join_date}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPermissionsModalOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Lock size={14} /> Restrict Folder
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setUploadAccess(activeFolderSetting.access_level || 'HR Only')
                    setUploadModalOpen(true)
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Upload size={14} /> Upload File
                </button>
              </div>
            </div>

            {/* Folder Access Banner */}
            <div
              style={{
                marginTop: 14,
                padding: '10px 14px',
                borderRadius: 8,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                <Shield size={16} color="var(--brand)" />
                <div>
                  <span style={{ fontWeight: 600 }}>Access Restrictions: </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{currentFolderConfig.description}</span>
                  {activeFolderSetting.allow_employee_view && (
                    <span style={{ color: 'var(--brand)', marginLeft: 8, fontWeight: 600 }}>• Employee Self-Service Enabled</span>
                  )}
                  {activeFolderSetting.allow_manager_view && (
                    <span style={{ color: '#f59e0b', marginLeft: 8, fontWeight: 600 }}>• Line Manager Granted</span>
                  )}
                </div>
              </div>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => setPermissionsModalOpen(true)}
                style={{ color: 'var(--brand)', fontWeight: 600 }}
              >
                Modify Access Permissions →
              </button>
            </div>
          </div>

          {/* Documents Workspace Card */}
          <div className="card">
            {/* Category tabs and Search inside this folder */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {CATEGORIES.map(cat => {
                  const count = cat === 'All'
                    ? currentEmployeeDocs.length
                    : currentEmployeeDocs.filter(d => d.category === cat).length
                  if (cat !== 'All' && count === 0) return null // Only show active categories or all
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`btn btn-xs ${categoryFilter === cat ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ fontSize: 12 }}
                    >
                      {cat} ({count})
                    </button>
                  )
                })}
              </div>

              {/* Search in documents */}
              <div style={{ minWidth: 200, position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter folder documents..."
                  value={docSearch}
                  onChange={e => setDocSearch(e.target.value)}
                  style={{ ...field, paddingLeft: 28, height: 32, fontSize: 12 }}
                />
              </div>
            </div>

            {/* Document list or empty state */}
            {displayedDocs.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Folder size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  No documents found in this folder
                </div>
                <div style={{ fontSize: 12, marginTop: 4, maxWidth: 380, margin: '4px auto 16px' }}>
                  {docSearch || categoryFilter !== 'All'
                    ? 'No documents match your filter criteria.'
                    : `Upload ${activeStaff?.full_name}'s employment contract, certified ID, qualifications, or tax directive.`}
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setUploadAccess(activeFolderSetting.access_level || 'HR Only')
                    setUploadModalOpen(true)
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Upload size={14} /> Upload First Document
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {displayedDocs.map(doc => {
                  const accessBadge = getAccessBadge(doc.access)
                  return (
                    <div
                      key={doc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 14px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 10,
                        background: 'var(--bg-primary)',
                        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 8,
                          background: 'var(--brand-soft)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <FileText size={20} color="var(--brand)" />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                            {doc.name}
                          </span>
                          <span className="badge badge-neutral" style={{ fontSize: 10 }}>{doc.category}</span>
                          <span className={`badge ${accessBadge}`} style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <Lock size={9} /> {doc.access}
                          </span>
                          {doc.verified && (
                            <span className="badge badge-success" style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <CheckCircle2 size={9} /> Verified
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                          <span><b>Uploaded:</b> {doc.uploaded}</span>
                          <span><b>Size:</b> {Math.max(1, Math.round(doc.size / 1024))} KB</span>
                          {doc.uploaded_by && <span><b>By:</b> {doc.uploaded_by}</span>}
                          {doc.notes && <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>"{doc.notes}"</span>}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setPreviewDoc(doc)}
                          title="Preview Document Details"
                          style={{ padding: '6px 8px' }}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDownloadDoc(doc)}
                          title="Download Document"
                          style={{ padding: '6px 8px' }}
                        >
                          <Download size={15} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSingleDocAccessModal(doc)}
                          title="Change Document Access Tier"
                          style={{ padding: '6px 8px' }}
                        >
                          <Lock size={15} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDeleteDoc(doc)}
                          title="Delete Document"
                          style={{ padding: '6px 8px', color: 'var(--danger)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <Modal
          open
          onClose={() => setUploadModalOpen(false)}
          title={`Upload to ${activeStaff?.full_name}'s Folder`}
          subtitle="Supports contracts, identification, certifications, and compliance paperwork."
          width={560}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setUploadModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" type="submit" form="upload-doc-form">
                Upload & Secure Document
              </button>
            </>
          }
        >
          <form id="upload-doc-form" onSubmit={handleUploadSubmit} style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={labelStyle}>Destination Folder (Employee / Intern)</label>
              <select
                style={field}
                value={selectedStaffId}
                onChange={e => setSelectedStaffId(e.target.value)}
              >
                {allStaff.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.department} · {s.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>File Attachment (PDF, Image, Docx)</label>
              <input
                ref={fileInputRef}
                type="file"
                style={{ ...field, padding: 8 }}
                onChange={e => {
                  const f = e.target.files?.[0]
                  setUploadFile(f || null)
                  if (f && !uploadCustomName) {
                    setUploadCustomName(f.name)
                  }
                }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Selected files are encrypted and processed according to company data retention policies.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Document Category</label>
                <select
                  style={field}
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value)}
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Access Restriction Tier</label>
                <select
                  style={field}
                  value={uploadAccess}
                  onChange={e => setUploadAccess(e.target.value)}
                >
                  {ACCESS_LEVELS.map(lvl => (
                    <option key={lvl.id} value={lvl.id}>{lvl.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Custom Document Title</label>
              <input
                type="text"
                style={field}
                placeholder="e.g. 2026_Signed_Offer_Letter.pdf"
                value={uploadCustomName}
                onChange={e => setUploadCustomName(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Confidentiality & Audit Notes</label>
              <textarea
                style={{ ...field, minHeight: 65, resize: 'vertical' }}
                placeholder="Optional audit trail remarks, certified verification details, or sign-off notes..."
                value={uploadNotes}
                onChange={e => setUploadNotes(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Folder Access Restrictions Modal */}
      {permissionsModalOpen && (
        <FolderPermissionsModal
          staff={activeStaff}
          setting={activeFolderSetting}
          onClose={() => setPermissionsModalOpen(false)}
          onSave={handleSavePermissions}
        />
      )}

      {/* Preview Document Modal */}
      {previewDoc && (
        <Modal
          open
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.name}
          subtitle={`Employee: ${previewDoc.employee_name} · ${previewDoc.category}`}
          width={600}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setPreviewDoc(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => handleDownloadDoc(previewDoc)}>
                <Download size={14} /> Download File
              </button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ background: 'var(--bg-secondary)', padding: 14, borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                <div><b>Document ID:</b> {previewDoc.id}</div>
                <div><b>Category:</b> {previewDoc.category}</div>
                <div><b>Access Level:</b> <span className={`badge ${getAccessBadge(previewDoc.access)}`}>{previewDoc.access}</span></div>
                <div><b>File Size:</b> {Math.round(previewDoc.size / 1024)} KB</div>
                <div><b>Upload Date:</b> {previewDoc.uploaded}</div>
                <div><b>Uploaded By:</b> {previewDoc.uploaded_by || 'HR Administrator'}</div>
              </div>
            </div>

            {previewDoc.notes && (
              <div>
                <label style={labelStyle}>Document Remarks</label>
                <div style={{ padding: 10, background: 'var(--bg-secondary)', borderRadius: 6, fontSize: 13 }}>
                  {previewDoc.notes}
                </div>
              </div>
            )}

            <div style={{ border: '1px dashed var(--border-color)', borderRadius: 8, padding: 25, textAlign: 'center' }}>
              <FileCheck size={36} color="var(--brand)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 14, fontWeight: 700 }}>Encrypted Personnel File</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                This record is secured under MSP's POPIA & Data Governance framework.
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Individual Document Access Tier Modal */}
      {singleDocAccessModal && (
        <Modal
          open
          onClose={() => setSingleDocAccessModal(null)}
          title={`Access Restriction for ${singleDocAccessModal.name}`}
          width={480}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setSingleDocAccessModal(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  toast.success(`Updated access tier for ${singleDocAccessModal.name}`)
                  setSingleDocAccessModal(null)
                }}
              >
                Apply Access Tier
              </button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Select which roles can view or download this specific document file:
            </div>
            {ACCESS_LEVELS.map(lvl => (
              <label
                key={lvl.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: 10,
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: singleDocAccessModal.access === lvl.id ? 'var(--brand-soft)' : 'transparent'
                }}
              >
                <input
                  type="radio"
                  name="doc-access"
                  checked={singleDocAccessModal.access === lvl.id}
                  onChange={() => {
                    const updated = { ...singleDocAccessModal, access: lvl.id }
                    setSingleDocAccessModal(updated)
                    setDocuments(prev => prev.map(d => d.id === updated.id ? updated : d))
                  }}
                  style={{ marginTop: 3 }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{lvl.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{lvl.description}</div>
                </div>
              </label>
            ))}
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

// Subcomponent: Folder Permissions & Access Restrictions Modal
function FolderPermissionsModal({ staff, setting, onClose, onSave }) {
  const [accessLevel, setAccessLevel] = useState(setting.access_level || 'HR Only')
  const [allowEmployeeView, setAllowEmployeeView] = useState(setting.allow_employee_view ?? false)
  const [allowManagerView, setAllowManagerView] = useState(setting.allow_manager_view ?? false)
  const [popiaConsent, setPopiaConsent] = useState(setting.popia_consent ?? true)
  const [retentionYears, setRetentionYears] = useState(setting.retention_years || 5)
  const [notes, setNotes] = useState(setting.notes || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      access_level: accessLevel,
      restricted: accessLevel === 'HR Only' || accessLevel === 'Executive Only',
      allow_employee_view: allowEmployeeView,
      allow_manager_view: allowManagerView,
      popia_consent: popiaConsent,
      retention_years: Number(retentionYears),
      notes: notes.trim()
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Folder Access Restrictions — ${staff?.full_name}`}
      subtitle="Configure role-based folder boundaries and South African POPIA compliance policies."
      width={620}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit" form="folder-permissions-form">
            Save Folder Restrictions
          </button>
        </>
      }
    >
      <form id="folder-permissions-form" onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <div>
          <label style={labelStyle}>Primary Folder Security Tier</label>
          <div style={{ display: 'grid', gap: 8, marginTop: 4 }}>
            {ACCESS_LEVELS.map(lvl => {
              const Icon = lvl.icon
              const isSelected = accessLevel === lvl.id
              return (
                <div
                  key={lvl.id}
                  onClick={() => setAccessLevel(lvl.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--brand)' : 'var(--border-color)',
                    background: isSelected ? 'var(--brand-soft)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={18} color={isSelected ? 'var(--brand)' : 'var(--text-muted)'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600 }}>{lvl.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{lvl.description}</div>
                  </div>
                  <input
                    type="radio"
                    name="folder-security-level"
                    checked={isSelected}
                    onChange={() => setAccessLevel(lvl.id)}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Granular access permissions */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
          <label style={labelStyle}>Granular Role Permissions</label>
          <div style={{ display: 'grid', gap: 10, marginTop: 6 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={allowEmployeeView}
                onChange={e => setAllowEmployeeView(e.target.checked)}
              />
              <span>Allow <b>{staff?.full_name}</b> to view their own non-confidential documents via self-service</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={allowManagerView}
                onChange={e => setAllowManagerView(e.target.checked)}
              />
              <span>Allow direct reporting Line Manager to inspect operational documents (KPIs, leave notes)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={popiaConsent}
                onChange={e => setPopiaConsent(e.target.checked)}
              />
              <span>POPIA privacy consent logged and validated for South African regulatory standards</span>
            </label>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Statutory Retention Period</label>
            <select
              style={field}
              value={retentionYears}
              onChange={e => setRetentionYears(e.target.value)}
            >
              <option value="3">3 Years (Basic Labour Law)</option>
              <option value="5">5 Years (SARS Tax & Payroll Standard)</option>
              <option value="7">7 Years (Companies Act & Senior Staff)</option>
              <option value="10">10 Years (Permanent Executive Archive)</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Restriction Justification</label>
            <input
              type="text"
              style={field}
              placeholder="e.g. Standard personnel file / Legal hold"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}
