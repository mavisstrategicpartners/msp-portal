import { useState, useMemo, useRef } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'

import { uid } from '../../lib/useLocalStorage.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'
import { toast } from 'sonner'
import {
  Folder,
  FolderOpen,
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
  User,
  Users,
  CheckCircle2,
  Plus,
  FileCheck,
  KeyRound,
  File,
  SlidersHorizontal,
  CloudUpload,
  Layers,
  Sparkles,
} from 'lucide-react'

const CATEGORIES = [
  'All',
  'Contracts',
  'Identification',
  'Tax & Banking',
  'Qualifications',
  'Performance',
  'Medical',
  'Other'
]

const ACCESS_LEVELS = [
  {
    id: 'HR Only',
    label: 'Human Resources Only (Confidential)',
    description: 'Strictly confidential — accessible to Human Resources only.',
    badgeClass: 'badge-purple',
    icon: Lock,
  },
  {
    id: 'HR Executive Only',
    label: 'HR Executive & Leadership Only',
    description: 'Executive committee and senior Human Resources management access.',
    badgeClass: 'badge-danger',
    icon: Shield,
  },
  {
    id: 'HR Compliance Hold',
    label: 'HR Compliance & Audit Hold',
    description: 'Restricted for POPIA regulatory, labour audit, and tax compliance.',
    badgeClass: 'badge-warning',
    icon: Lock,
  },
]

// Category color accents for modern document cards
const getCategoryStyle = (cat) => {
  switch (cat) {
    case 'Contracts':
      return { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: 'rgba(59, 130, 246, 0.25)' }
    case 'Identification':
      return { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: 'rgba(16, 185, 129, 0.25)' }
    case 'Tax & Banking':
      return { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: 'rgba(245, 158, 11, 0.25)' }
    case 'Qualifications':
      return { bg: 'rgba(147, 51, 234, 0.1)', color: '#9333ea', border: 'rgba(147, 51, 234, 0.25)' }
    case 'Performance':
      return { bg: 'rgba(236, 72, 153, 0.1)', color: '#db2777', border: 'rgba(236, 72, 153, 0.25)' }
    default:
      return { bg: 'rgba(100, 116, 139, 0.1)', color: '#475569', border: 'rgba(100, 116, 139, 0.25)' }
  }
}

export default function HRDocuments() {
  const [documents, setDocuments] = useSupabaseTable('hr_documents', [])
  const [folderSettings, setFolderSettings] = useSupabaseTable('hr_folder_settings', [])
  const [employees] = useSupabaseTable('hr_employees', [])

  // Build staff directory from live employee records
  const allStaff = useMemo(() => {
    return employees.map(e => ({
      id: e.id,
      full_name: e.full_name || e.name || 'Unknown',
      role: e.role || e.job_title || '',
      department: e.department || '',
      type: e.employment_type || 'Employee',
      email: e.email || '',
      join_date: e.join_date || e.start_date || '',
    }))
  }, [employees])

  const [selectedStaffId, setSelectedStaffId] = useState(allStaff[0]?.id || 'E-1')
  const [staffSearch, setStaffSearch] = useState('')
  const [staffTab, setStaffTab] = useState('All') // 'All' | 'Employees' | 'Interns'
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [docSearch, setDocSearch] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)

  // Upload Form
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadCategory, setUploadCategory] = useState('Contracts')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadAccess, setUploadAccess] = useState('HR Only')
  const [uploadNotes, setUploadNotes] = useState('')
  const fileInputRef = useRef(null)

  const activeStaff = allStaff.find(s => s.id === selectedStaffId) || allStaff[0]

  // Folder settings
  const activeSetting = useMemo(() => {
    const found = folderSettings.find(f => f.employee_id === activeStaff?.id)
    if (found) return found
    return {
      employee_id: activeStaff?.id,
      access_level: 'HR Only',
      restricted: true,
      allow_employee_view: false,
      allow_manager_view: false,
      popia_consent: true,
      retention_years: 5,
      notes: ''
    }
  }, [folderSettings, activeStaff])

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return allStaff.filter(s => {
      const matchSearch =
        s.full_name.toLowerCase().includes(staffSearch.toLowerCase()) ||
        s.role.toLowerCase().includes(staffSearch.toLowerCase()) ||
        s.department.toLowerCase().includes(staffSearch.toLowerCase())
      if (!matchSearch) return false
      if (staffTab === 'Employees' && s.type !== 'Permanent Staff') return false
      if (staffTab === 'Interns' && s.type !== 'Intern') return false
      return true
    })
  }, [allStaff, staffSearch, staffTab])

  // Active employee's documents
  const employeeDocs = useMemo(() => {
    return documents.filter(d => d.employee_id === activeStaff?.id)
  }, [documents, activeStaff])

  // Filtered documents
  const displayedDocs = useMemo(() => {
    return employeeDocs.filter(doc => {
      if (categoryFilter !== 'All' && doc.category !== categoryFilter) return false
      if (docSearch) {
        const query = docSearch.toLowerCase()
        return (
          doc.name.toLowerCase().includes(query) ||
          (doc.notes || '').toLowerCase().includes(query) ||
          doc.category.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [employeeDocs, categoryFilter, docSearch])

  // Handle uploading document
  const handleUploadSubmit = (e) => {
    e?.preventDefault()
    if (!uploadFile && !uploadTitle.trim()) {
      toast.error('Please choose a file or enter a document title.')
      return
    }

    const title = uploadTitle.trim() || uploadFile?.name || 'Document.pdf'

    const createAndAddDoc = (dataUrl = null) => {
      const newDoc = {
        id: uid('DOC'),
        employee_id: activeStaff.id,
        employee_name: activeStaff.full_name,
        name: title,
        category: uploadCategory,
        type: uploadFile?.type || 'application/pdf',
        size: uploadFile?.size || 180000,
        access: uploadAccess,
        uploaded: new Date().toISOString().slice(0, 10),
        uploaded_by: 'HR Admin',
        verified: true,
        notes: uploadNotes,
        data_url: dataUrl
      }
      setDocuments(prev => [newDoc, ...prev])
      toast.success(`Saved "${title}" to ${activeStaff.full_name}'s folder`)
      setUploadModalOpen(false)
      setUploadFile(null)
      setUploadTitle('')
      setUploadNotes('')
    }

    if (uploadFile) {
      const reader = new FileReader()
      reader.onload = () => createAndAddDoc(reader.result)
      reader.onerror = () => createAndAddDoc(null)
      reader.readAsDataURL(uploadFile)
    } else {
      createAndAddDoc(null)
    }
  }

  // Handle drag-and-drop directly into folder
  const handleDropFile = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) {
      setUploadFile(file)
      setUploadTitle(file.name)
      setUploadAccess(activeSetting.access_level || 'HR Only')
      setUploadModalOpen(true)
    }
  }

  // Delete document
  const handleDeleteDoc = (doc) => {
    if (window.confirm(`Delete "${doc.name}" from ${activeStaff.full_name}'s folder?`)) {
      setDocuments(prev => prev.filter(d => d.id !== doc.id))
      toast.success(`Removed ${doc.name}`)
    }
  }

  // Download document
  const handleDownloadDoc = (doc) => {
    if (doc.data_url) {
      const link = document.createElement('a')
      link.href = doc.data_url
      link.download = doc.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`Downloaded ${doc.name}`)
    } else {
      const content = `MSP HR Document Vault\nDocument: ${doc.name}\nEmployee: ${doc.employee_name}\nCategory: ${doc.category}\nAccess: ${doc.access}\nDate: ${doc.uploaded}\n`
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = doc.name.endsWith('.pdf') ? doc.name.replace('.pdf', '.txt') : `${doc.name}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success(`Downloaded ${doc.name}`)
    }
  }

  // Save folder restrictions
  const handleSaveRestrictions = (newSettings) => {
    setFolderSettings(prev => {
      const idx = prev.findIndex(f => f.employee_id === activeStaff.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], ...newSettings }
        return copy
      }
      return [...prev, { employee_id: activeStaff.id, ...newSettings }]
    })
    toast.success(`Updated folder permissions for ${activeStaff.full_name}`)
    setPermissionsModalOpen(false)
  }

  const activeLevelConfig = ACCESS_LEVELS.find(a => a.id === activeSetting.access_level) || ACCESS_LEVELS[0]

  // Empty state when no employees in the system yet
  if (allStaff.length === 0) {
    return (
      <DashboardLayout title="Employee Documents">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 420, gap: 20, textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <Users size={36} style={{ color: '#818cf8' }} />
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>No Employees Added Yet</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', maxWidth: 400, lineHeight: 1.6 }}>
            Employee folders will appear here once employees are added to the system. Each employee gets a private, access-controlled document vault.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '12px 20px' }}>
            <ShieldCheck size={18} style={{ color: '#818cf8', flexShrink: 0 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>All documents are POPIA-compliant and HR-restricted by default.</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Employee Documents">
      {/* Sleek Workspace Explorer Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '270px minmax(0, 1fr)', gap: 16, alignItems: 'start' }}>
        
        {/* Left Explorer Sidebar: Clean Employee Folders List */}
        <div
          className="card"
          style={{
            padding: 12,
            background: 'var(--bg-primary)',
            borderRadius: 12,
            border: '1px solid var(--border-color)',
          }}
        >
          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search staff folder..."
              value={staffSearch}
              onChange={e => setStaffSearch(e.target.value)}
              style={{ ...field, paddingLeft: 30, height: 34, fontSize: 12, borderRadius: 8 }}
            />
          </div>

          {/* Quick Segment Filter */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 10, padding: 2, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            {['All', 'Employees', 'Interns'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setStaffTab(tab)}
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  fontSize: 11,
                  fontWeight: staffTab === tab ? 700 : 500,
                  border: 0,
                  borderRadius: 6,
                  background: staffTab === tab ? 'var(--brand)' : 'transparent',
                  color: staffTab === tab ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Staff List Items */}
          <div style={{ display: 'grid', gap: 3, maxHeight: 'calc(100vh - 270px)', overflowY: 'auto', paddingRight: 2 }}>
            {filteredStaff.map(staff => {
              const count = documents.filter(d => d.employee_id === staff.id).length
              const setting = folderSettings.find(f => f.employee_id === staff.id)
              const isRestricted = setting?.access_level === 'HR Only' || setting?.access_level === 'Executive Only'
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
                    borderRadius: 8,
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--brand)' : 'transparent',
                    background: isSelected ? 'var(--brand-soft)' : 'transparent',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Folder Icon / State */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {isSelected ? (
                      <FolderOpen size={18} color="var(--brand)" />
                    ) : (
                      <Folder size={18} color="var(--text-muted)" />
                    )}
                    {isRestricted && (
                      <Lock size={9} color="#9333ea" style={{ position: 'absolute', bottom: -2, right: -4 }} />
                    )}
                  </div>

                  {/* Name & Role */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {staff.full_name}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {staff.department}
                    </div>
                  </div>

                  {/* Document count pill */}
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 12,
                      background: isSelected ? 'var(--brand)' : 'var(--bg-secondary)',
                      color: isSelected ? '#fff' : 'var(--text-secondary)'
                    }}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Pane: Active Employee's Document Vault */}
        <div style={{ display: 'grid', gap: 14 }}>
          
          {/* Clean, Unified Folder Header Bar */}
          <div
            className="card"
            style={{
              padding: '12px 18px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              flexWrap: 'wrap',
              background: 'var(--bg-primary)'
            }}
          >
            {/* Left: Employee Info & Clickable Access Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'var(--brand-soft)',
                  color: 'var(--brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 14,
                  flexShrink: 0
                }}
              >
                {activeStaff?.full_name.charAt(0)}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 16, fontWeight: 800 }}>{activeStaff?.full_name}</span>
                  <span className="badge badge-neutral" style={{ fontSize: 10 }}>{activeStaff?.type}</span>
                  
                  {/* Interactive Access Restriction Pill */}
                  <button
                    type="button"
                    onClick={() => setPermissionsModalOpen(true)}
                    title="Click to modify folder access restrictions"
                    className={`badge ${activeLevelConfig.badgeClass}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 10.5,
                      cursor: 'pointer',
                      border: 0,
                      padding: '3px 8px',
                      transition: 'opacity 0.15s ease'
                    }}
                  >
                    <Lock size={10} />
                    <span>{activeSetting.access_level}</span>
                    <SlidersHorizontal size={9} style={{ opacity: 0.6, marginLeft: 2 }} />
                  </button>
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {activeStaff?.role} · {activeStaff?.department}
                </div>
              </div>
            </div>

            {/* Right: Search In Folder + Upload Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative', width: 170 }}>
                <Search size={13} style={{ position: 'absolute', left: 9, top: 10, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter files..."
                  value={docSearch}
                  onChange={e => setDocSearch(e.target.value)}
                  style={{ ...field, paddingLeft: 28, height: 32, fontSize: 11.5, borderRadius: 8 }}
                />
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setUploadAccess(activeSetting.access_level || 'HR Only')
                  setUploadModalOpen(true)
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 8, padding: '6px 14px' }}
              >
                <Upload size={14} /> Upload File
              </button>
            </div>
          </div>

          {/* Minimal Category Filter Tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {CATEGORIES.map(cat => {
              const count = cat === 'All'
                ? employeeDocs.length
                : employeeDocs.filter(d => d.category === cat).length
              if (cat !== 'All' && count === 0) return null // Hide empty categories to save space
              const isActive = categoryFilter === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 16,
                    fontSize: 11.5,
                    fontWeight: isActive ? 700 : 500,
                    border: '1px solid',
                    borderColor: isActive ? 'var(--brand)' : 'var(--border-color)',
                    background: isActive ? 'var(--brand)' : 'var(--bg-primary)',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat} ({count})
                </button>
              )
            })}
          </div>

          {/* Document Cards Grid (Modern, clean UI cards) */}
          {displayedDocs.length === 0 ? (
            <div
              className="card"
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDropFile}
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                borderRadius: 12,
                border: isDragging ? '2px dashed var(--brand)' : '1px dashed var(--border-color)',
                background: isDragging ? 'var(--brand-soft)' : 'var(--bg-primary)',
                transition: 'all 0.2s ease'
              }}
            >
              <CloudUpload size={38} color={isDragging ? 'var(--brand)' : 'var(--text-muted)'} style={{ margin: '0 auto 10px', opacity: 0.6 }} />
              <div style={{ fontSize: 14, fontWeight: 700 }}>Folder is empty</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, maxWidth: 360, margin: '4px auto 14px' }}>
                Drag & drop a document here, or click to upload contracts, IDs, tax papers, or certs.
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setUploadAccess(activeSetting.access_level || 'HR Only')
                  setUploadModalOpen(true)
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={14} /> Upload Document
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 12
              }}
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDropFile}
            >
              {displayedDocs.map(doc => {
                const badgeStyle = getCategoryStyle(doc.category)
                return (
                  <div
                    key={doc.id}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 10,
                      padding: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 10,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease'
                    }}
                  >
                    {/* Top strip: category badge + access lock */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 6,
                          background: badgeStyle.bg,
                          color: badgeStyle.color,
                          border: `1px solid ${badgeStyle.border}`
                        }}
                      >
                        {doc.category}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Lock size={10} color="#9333ea" /> {doc.access}
                      </span>
                    </div>

                    {/* Middle: Document icon + Title */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 2 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: badgeStyle.bg,
                          color: badgeStyle.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <FileText size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            lineHeight: 1.35,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            wordBreak: 'break-word'
                          }}
                          title={doc.name}
                        >
                          {doc.name}
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 3 }}>
                          {Math.max(1, Math.round(doc.size / 1024))} KB · {doc.uploaded}
                        </div>
                      </div>
                    </div>

                    {/* Bottom action buttons */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: 8,
                        marginTop: 4
                      }}
                    >
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {doc.verified ? '✓ Verified' : 'Uploaded'}
                      </span>

                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => setPreviewDoc(doc)}
                          title="Preview details"
                          style={{ padding: '4px 6px' }}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleDownloadDoc(doc)}
                          title="Download file"
                          style={{ padding: '4px 6px' }}
                        >
                          <Download size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleDeleteDoc(doc)}
                          title="Delete"
                          style={{ padding: '4px 6px', color: 'var(--danger)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Subtle Dropzone footer */}
          {displayedDocs.length > 0 && (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDropFile}
              onClick={() => {
                setUploadAccess(activeSetting.access_level || 'HR Only')
                setUploadModalOpen(true)
              }}
              style={{
                padding: '14px',
                textAlign: 'center',
                borderRadius: 10,
                border: isDragging ? '2px dashed var(--brand)' : '1px dashed var(--border-color)',
                background: isDragging ? 'var(--brand-soft)' : 'transparent',
                cursor: 'pointer',
                fontSize: 12,
                color: 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Drag & drop files here to upload to <b>{activeStaff?.full_name}</b>'s folder</span>
            </div>
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <Modal
          open
          onClose={() => setUploadModalOpen(false)}
          title={`Upload to ${activeStaff?.full_name}'s Folder`}
          subtitle="File will be stored securely with access restrictions."
          width={500}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setUploadModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" type="submit" form="upload-doc-form">
                Upload Document
              </button>
            </>
          }
        >
          <form id="upload-doc-form" onSubmit={handleUploadSubmit} style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={labelStyle}>File Attachment</label>
              <input
                ref={fileInputRef}
                type="file"
                style={{ ...field, padding: 8 }}
                onChange={e => {
                  const f = e.target.files?.[0]
                  setUploadFile(f || null)
                  if (f && !uploadTitle) setUploadTitle(f.name)
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Category</label>
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
                <label style={labelStyle}>Access Restriction</label>
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
              <label style={labelStyle}>Document Title</label>
              <input
                type="text"
                style={field}
                placeholder="e.g. Signed_Employment_Contract.pdf"
                value={uploadTitle}
                onChange={e => setUploadTitle(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Notes (Optional)</label>
              <input
                type="text"
                style={field}
                placeholder="Optional remark or verification notes..."
                value={uploadNotes}
                onChange={e => setUploadNotes(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Clean Folder Access Restrictions Modal */}
      {permissionsModalOpen && (
        <FolderPermissionsModal
          staff={activeStaff}
          setting={activeSetting}
          onClose={() => setPermissionsModalOpen(false)}
          onSave={handleSaveRestrictions}
        />
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <Modal
          open
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.name}
          subtitle={`${previewDoc.employee_name} · ${previewDoc.category}`}
          width={540}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setPreviewDoc(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => handleDownloadDoc(previewDoc)}>
                <Download size={14} /> Download File
              </button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8, fontSize: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><b>Category:</b> {previewDoc.category}</div>
                <div><b>Access Level:</b> <span className="badge badge-purple">{previewDoc.access}</span></div>
                <div><b>Size:</b> {Math.round(previewDoc.size / 1024)} KB</div>
                <div><b>Date:</b> {previewDoc.uploaded}</div>
              </div>
            </div>

            {previewDoc.notes && (
              <div style={{ fontSize: 12, padding: 10, background: 'var(--bg-secondary)', borderRadius: 6 }}>
                <b>Notes:</b> {previewDoc.notes}
              </div>
            )}

            <div style={{ padding: 24, textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 8 }}>
              <FileCheck size={32} color="var(--brand)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 13, fontWeight: 700 }}>Confidential Personnel Record</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Compliant with MSP POPIA and Information Security Policy.
              </div>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

// Clean Access Restrictions Dialog
function FolderPermissionsModal({ staff, setting, onClose, onSave }) {
  const [level, setLevel] = useState(setting.access_level || 'HR Only')
  const [allowEmployee, setAllowEmployee] = useState(setting.allow_employee_view ?? false)
  const [allowManager, setAllowManager] = useState(setting.allow_manager_view ?? false)
  const [retention, setRetention] = useState(setting.retention_years || 5)

  const handleSave = (e) => {
    e.preventDefault()
    onSave({
      access_level: level,
      restricted: level === 'HR Only' || level === 'Executive Only',
      allow_employee_view: allowEmployee,
      allow_manager_view: allowManager,
      popia_consent: true,
      retention_years: Number(retention)
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Folder Permissions — ${staff?.full_name}`}
      subtitle="Restrict who can view documents in this folder."
      width={520}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit" form="permissions-form">
            Save Restrictions
          </button>
        </>
      }
    >
      <form id="permissions-form" onSubmit={handleSave} style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gap: 6 }}>
          <label style={labelStyle}>Security Tier</label>
          {ACCESS_LEVELS.map(lvl => {
            const isSelected = level === lvl.id
            const Icon = lvl.icon
            return (
              <div
                key={lvl.id}
                onClick={() => setLevel(lvl.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--brand)' : 'var(--border-color)',
                  background: isSelected ? 'var(--brand-soft)' : 'var(--bg-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} color={isSelected ? 'var(--brand)' : 'var(--text-muted)'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: isSelected ? 700 : 600 }}>{lvl.label}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>{lvl.description}</div>
                </div>
                <input
                  type="radio"
                  name="folder-level"
                  checked={isSelected}
                  onChange={() => setLevel(lvl.id)}
                />
              </div>
            )
          })}
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10, background: 'var(--brand-soft)', padding: 12, borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: 'var(--brand)' }}>
            <Lock size={14} />
            <span>Human Resources Access Restriction Policy</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            In accordance with company confidentiality standards and POPIA compliance, employee folders and personnel records are accessible to Human Resources only.
          </div>
        </div>

        <div>
          <label style={labelStyle}>Statutory Retention</label>
          <select
            style={field}
            value={retention}
            onChange={e => setRetention(e.target.value)}
          >
            <option value="3">3 Years (Standard labour record)</option>
            <option value="5">5 Years (SARS tax & payroll compliance)</option>
            <option value="7">7 Years (Executive personnel record)</option>
          </select>
        </div>
      </form>
    </Modal>
  )
}
