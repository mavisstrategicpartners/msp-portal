import { useState, useMemo, useRef, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { uid } from '../../lib/useLocalStorage.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'
import { supabase } from '@/integrations/supabase/client'
import {
  seedEmployees,
  seedFolderSettings,
  seedHrDocuments
} from '../../data/mockData.js'
import { toast } from 'sonner'
import {
  Folder,
  FolderOpen,
  FolderPlus,
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
  UserPlus,
  Building2,
  Briefcase,
  Mail,
  Calendar,
  AlertCircle
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

const COMMON_DEPARTMENTS = [
  'Human Resources',
  'IT Department',
  'Marketing Team',
  'Operations',
  'Finance',
  'Sales & Business Development',
  'Graphics & Design',
  'Media Buying',
  'Executive',
  'General'
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
    case 'Medical':
      return { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: 'rgba(239, 68, 68, 0.25)' }
    default:
      return { bg: 'rgba(100, 116, 139, 0.1)', color: '#475569', border: 'rgba(100, 116, 139, 0.25)' }
  }
}

export default function HRDocuments() {
  const [documents, setDocuments] = useSupabaseTable('hr_documents', seedHrDocuments)
  const [folderSettings, setFolderSettings] = useSupabaseTable('hr_folder_settings', seedFolderSettings)
  const [employees, setEmployees] = useSupabaseTable('hr_employees', seedEmployees)
  const [profiles, setProfiles] = useState([])

  // Fetch real staff profiles from Supabase to easily suggest/create folders for them
  useEffect(() => {
    async function loadProfiles() {
      try {
        const { data } = await supabase.from('profiles').select('*').order('full_name')
        if (data && data.length > 0) {
          setProfiles(data)
        }
      } catch (err) {
        console.warn('Could not load profiles for folder selector:', err)
      }
    }
    loadProfiles()
  }, [])

  // Build unified staff list from employees table
  const allStaff = useMemo(() => {
    return employees.map(e => ({
      id: e.id,
      full_name: e.full_name || e.name || 'Unknown',
      role: e.role || e.job_title || 'Staff Member',
      department: e.department || 'General',
      type: e.employment_type || e.type || 'Permanent Staff',
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
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false)
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

  // Sync selectedStaffId if not set or invalid
  useEffect(() => {
    if (allStaff.length > 0 && !allStaff.some(s => s.id === selectedStaffId)) {
      setSelectedStaffId(allStaff[0].id)
    }
  }, [allStaff, selectedStaffId])

  const activeStaff = allStaff.find(s => s.id === selectedStaffId) || allStaff[0]

  // Folder settings for the active employee
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
      if (staffTab === 'Employees' && s.type.toLowerCase().includes('intern')) return false
      if (staffTab === 'Interns' && !s.type.toLowerCase().includes('intern')) return false
      return true
    })
  }, [allStaff, staffSearch, staffTab])

  // Active employee's documents
  const employeeDocs = useMemo(() => {
    if (!activeStaff) return []
    return documents.filter(d => d.employee_id === activeStaff.id)
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

  // Create a new employee folder
  const handleCreateFolder = (folderData) => {
    const newId = folderData.profileId || `EMP-${Date.now()}`
    const newStaff = {
      id: newId,
      full_name: folderData.fullName.trim(),
      role: folderData.role.trim() || 'Staff Member',
      department: folderData.department.trim() || 'General',
      employment_type: folderData.employmentType || 'Permanent Staff',
      type: folderData.employmentType || 'Permanent Staff',
      email: folderData.email.trim() || '',
      join_date: new Date().toISOString().slice(0, 10),
    }

    // Add to employees list
    setEmployees(prev => [newStaff, ...prev.filter(e => e.id !== newId)])

    // Add folder settings
    const newSetting = {
      employee_id: newId,
      access_level: folderData.accessLevel || 'HR Only',
      restricted: true,
      allow_employee_view: false,
      allow_manager_view: false,
      popia_consent: true,
      retention_years: Number(folderData.retention || 5),
      notes: folderData.notes || 'Created by HR'
    }
    setFolderSettings(prev => [newSetting, ...prev.filter(f => f.employee_id !== newId)])

    setSelectedStaffId(newId)
    setCreateFolderModalOpen(false)
    toast.success(`Created employee folder for "${newStaff.full_name}"`)
  }

  // Delete an employee folder
  const handleDeleteFolder = (staff) => {
    if (!staff) return
    const docCount = documents.filter(d => d.employee_id === staff.id).length
    const confirmMsg = `Are you sure you want to delete the folder for "${staff.full_name}"?` +
      (docCount > 0 ? ` All ${docCount} document(s) in this folder will also be removed.` : '')
    
    if (window.confirm(confirmMsg)) {
      setEmployees(prev => prev.filter(e => e.id !== staff.id))
      setDocuments(prev => prev.filter(d => d.employee_id !== staff.id))
      setFolderSettings(prev => prev.filter(f => f.employee_id !== staff.id))
      toast.success(`Deleted folder for ${staff.full_name}`)
      const remaining = allStaff.filter(s => s.id !== staff.id)
      if (remaining.length > 0) {
        setSelectedStaffId(remaining[0].id)
      }
    }
  }

  // Handle uploading document to active folder
  const handleUploadSubmit = (e) => {
    e?.preventDefault()
    if (!activeStaff) {
      toast.error('Please select an employee folder first.')
      return
    }

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
    if (window.confirm(`Delete "${doc.name}" from ${activeStaff?.full_name}'s folder?`)) {
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
      const content = `MSP HR Document Vault\nDocument: ${doc.name}\nEmployee: ${doc.employee_name}\nCategory: ${doc.category}\nAccess: ${doc.access}\nDate: ${doc.uploaded}\nNotes: ${doc.notes || 'None'}\n`
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

  return (
    <DashboardLayout title="Employee Documents">
      {/* Sleek Workspace Explorer Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '290px minmax(0, 1fr)', gap: 16, alignItems: 'start' }}>
        
        {/* Left Explorer Sidebar: Clean Employee Folders List */}
        <div
          className="card"
          style={{
            padding: 14,
            background: 'var(--bg-primary)',
            borderRadius: 12,
            border: '1px solid var(--border-color)',
          }}
        >
          {/* Create Folder Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setCreateFolderModalOpen(true)}
            style={{
              width: '100%',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 12.5,
              fontWeight: 700,
              padding: '9px 14px',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)'
            }}
          >
            <FolderPlus size={16} /> Create Employee Folder
          </button>

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
          <div style={{ display: 'grid', gap: 4, maxHeight: 'calc(100vh - 300px)', overflowY: 'auto', paddingRight: 2 }}>
            {filteredStaff.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)', fontSize: 12 }}>
                <Folder size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                No employee folders found.
                <div style={{ marginTop: 8 }}>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setCreateFolderModalOpen(true)}
                    style={{ fontSize: 11, color: 'var(--brand)' }}
                  >
                    + Create a folder
                  </button>
                </div>
              </div>
            ) : (
              filteredStaff.map(staff => {
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
                        {staff.department} · {staff.role}
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
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Employee's Document Vault */}
        {activeStaff ? (
          <div style={{ display: 'grid', gap: 14 }}>
            
            {/* Clean, Unified Folder Header Bar */}
            <div
              className="card"
              style={{
                padding: '14px 18px',
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
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: 'var(--brand-soft)',
                    color: 'var(--brand)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 15,
                    flexShrink: 0
                  }}
                >
                  {activeStaff.full_name.charAt(0)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 17, fontWeight: 800 }}>{activeStaff.full_name}</span>
                    <span className="badge badge-neutral" style={{ fontSize: 10 }}>{activeStaff.type}</span>
                    
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

                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {activeStaff.role} · {activeStaff.department} {activeStaff.email ? `· ${activeStaff.email}` : ''}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: 170 }}>
                  <Search size={13} style={{ position: 'absolute', left: 9, top: 10, color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Filter files..."
                    value={docSearch}
                    onChange={e => setDocSearch(e.target.value)}
                    style={{ ...field, paddingLeft: 28, height: 34, fontSize: 11.5, borderRadius: 8 }}
                  />
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setUploadAccess(activeSetting.access_level || 'HR Only')
                    setUploadModalOpen(true)
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 8, padding: '7px 14px', fontWeight: 600 }}
                >
                  <Upload size={14} /> Add Document
                </button>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDeleteFolder(activeStaff)}
                  title="Delete employee folder"
                  style={{ color: 'var(--danger)', borderRadius: 8, padding: '7px 10px' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Minimal Category Filter Tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {CATEGORIES.map(cat => {
                const count = cat === 'All'
                  ? employeeDocs.length
                  : employeeDocs.filter(d => d.category === cat).length
                if (cat !== 'All' && count === 0) return null
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

            {/* Document Cards Grid */}
            {displayedDocs.length === 0 ? (
              <div
                className="card"
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDropFile}
                style={{
                  padding: '46px 20px',
                  textAlign: 'center',
                  borderRadius: 12,
                  border: isDragging ? '2px dashed var(--brand)' : '1px dashed var(--border-color)',
                  background: isDragging ? 'var(--brand-soft)' : 'var(--bg-primary)',
                  transition: 'all 0.2s ease'
                }}
              >
                <CloudUpload size={42} color={isDragging ? 'var(--brand)' : 'var(--text-muted)'} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
                <div style={{ fontSize: 15, fontWeight: 700 }}>Folder is empty</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, maxWidth: 380, margin: '6px auto 16px' }}>
                  Add documents for <b>{activeStaff.full_name}</b> such as employment contracts, ID copies, qualifications, or tax certificates.
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setUploadAccess(activeSetting.access_level || 'HR Only')
                    setUploadModalOpen(true)
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                >
                  <Plus size={14} /> Add Document
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

            {/* Dropzone footer */}
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
                <span>Drag & drop files here to add to <b>{activeStaff.full_name}</b>'s folder</span>
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <Folder size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
            <h3 style={{ margin: 0, fontSize: 16 }}>No Employee Folder Selected</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>
              Select an employee from the left sidebar or create a new folder.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setCreateFolderModalOpen(true)}
              style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <FolderPlus size={15} /> Create Employee Folder
            </button>
          </div>
        )}
      </div>

      {/* Create Employee Folder Modal */}
      {createFolderModalOpen && (
        <CreateEmployeeFolderModal
          existingStaff={allStaff}
          profiles={profiles}
          onClose={() => setCreateFolderModalOpen(false)}
          onCreate={handleCreateFolder}
        />
      )}

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <Modal
          open
          onClose={() => setUploadModalOpen(false)}
          title={`Add Document to ${activeStaff?.full_name}'s Folder`}
          subtitle="File will be stored securely with HR access restrictions."
          width={520}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setUploadModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" type="submit" form="upload-doc-form">
                Save to Folder
              </button>
            </>
          }
        >
          <form id="upload-doc-form" onSubmit={handleUploadSubmit} style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={labelStyle}>File Attachment</label>
              <input
                ref={fileInputRef}
                type="file"
                style={{ ...field, padding: 8 }}
                onChange={e => {
                  const f = e.target.files?.[0]
                  setUploadFile(f || null)
                  if (f && !uploadTitle) {
                    setUploadTitle(f.name)
                  }
                }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Accepts PDF, Word, Excel, images, and text documents.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
              <label style={labelStyle}>Document Title *</label>
              <input
                type="text"
                required
                style={field}
                placeholder="e.g. Employment_Agreement_Signed.pdf"
                value={uploadTitle}
                onChange={e => setUploadTitle(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Notes / Description (Optional)</label>
              <input
                type="text"
                style={field}
                placeholder="e.g. Certified copy, verified by HR"
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

// Modal to create a new employee folder
function CreateEmployeeFolderModal({ existingStaff, profiles, onClose, onCreate }) {
  const [mode, setMode] = useState('select') // 'select' | 'custom'
  const [selectedProfileId, setSelectedProfileId] = useState('')
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('Human Resources')
  const [role, setRole] = useState('')
  const [employmentType, setEmploymentType] = useState('Permanent Staff')
  const [email, setEmail] = useState('')
  const [accessLevel, setAccessLevel] = useState('HR Only')
  const [retention, setRetention] = useState('5')

  // Filter profiles that are not yet in existingStaff (exclude root admins)
  const availableProfiles = useMemo(() => {
    return profiles.filter(p => {
      const isRootAdmin =
        p.role_tier === 'root_admin' ||
        p.email === 'admin@mavisstrategicpartners.co.za' ||
        p.email === 'superadmin@mavisstrategicpartners.co.za' ||
        (p.full_name && p.full_name.toLowerCase().includes('superadmin'))
      if (isRootAdmin) return false

      const name = p.full_name || p.email
      return name && !existingStaff.some(s => s.id === p.id || s.full_name.toLowerCase() === name.toLowerCase())
    })
  }, [profiles, existingStaff])

  const handleProfileSelect = (pId) => {
    setSelectedProfileId(pId)
    const prof = profiles.find(p => p.id === pId)
    if (prof) {
      setFullName(prof.full_name || prof.email || '')
      setDepartment(prof.department || 'General')
      setRole(prof.job_title || 'Staff Member')
      setEmail(prof.email || '')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!fullName.trim()) {
      toast.error('Please enter the employee name or select a staff member.')
      return
    }

    onCreate({
      profileId: mode === 'select' ? selectedProfileId : null,
      fullName: fullName.trim(),
      department: department.trim(),
      role: role.trim(),
      employmentType,
      email: email.trim(),
      accessLevel,
      retention
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Create Employee Folder"
      subtitle="Set up a private personnel document vault for an employee or intern."
      width={520}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit" form="create-folder-form">
            <FolderPlus size={14} style={{ marginRight: 6 }} /> Create Folder
          </button>
        </>
      }
    >
      <form id="create-folder-form" onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
        {/* Mode Toggle */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--bg-secondary)', padding: 3, borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => { setMode('select'); if (availableProfiles[0]) handleProfileSelect(availableProfiles[0].id) }}
            style={{
              flex: 1,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: mode === 'select' ? 700 : 500,
              border: 0,
              borderRadius: 6,
              background: mode === 'select' ? 'var(--brand)' : 'transparent',
              color: mode === 'select' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Select Existing Staff ({availableProfiles.length})
          </button>
          <button
            type="button"
            onClick={() => { setMode('custom'); setSelectedProfileId(''); setFullName('') }}
            style={{
              flex: 1,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: mode === 'custom' ? 700 : 500,
              border: 0,
              borderRadius: 6,
              background: mode === 'custom' ? 'var(--brand)' : 'transparent',
              color: mode === 'custom' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            New Staff / Intern
          </button>
        </div>

        {mode === 'select' && availableProfiles.length > 0 && (
          <div>
            <label style={labelStyle}>Choose Staff Member</label>
            <select
              style={field}
              value={selectedProfileId}
              onChange={e => handleProfileSelect(e.target.value)}
            >
              <option value="">-- Choose employee from system --</option>
              {availableProfiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name || p.email} ({p.department || 'General'} · {p.job_title || 'Staff'})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label style={labelStyle}>Employee Full Name *</label>
          <input
            type="text"
            required
            style={field}
            placeholder="e.g. Mavis Muchena"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelStyle}>Department</label>
            <input
              type="text"
              list="common-departments"
              style={field}
              placeholder="e.g. Human Resources"
              value={department}
              onChange={e => setDepartment(e.target.value)}
            />
            <datalist id="common-departments">
              {COMMON_DEPARTMENTS.map(d => <option key={d} value={d} />)}
            </datalist>
          </div>

          <div>
            <label style={labelStyle}>Job Title / Role</label>
            <input
              type="text"
              style={field}
              placeholder="e.g. HR Generalist"
              value={role}
              onChange={e => setRole(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelStyle}>Employment Type</label>
            <select
              style={field}
              value={employmentType}
              onChange={e => setEmploymentType(e.target.value)}
            >
              <option value="Permanent Staff">Permanent Staff</option>
              <option value="Intern">Intern</option>
              <option value="Contractor">Contractor</option>
              <option value="Executive">Executive</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Work Email (Optional)</label>
            <input
              type="email"
              style={field}
              placeholder="name@mavisstrategicpartners.co.za"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelStyle}>Folder Access Level</label>
            <select
              style={field}
              value={accessLevel}
              onChange={e => setAccessLevel(e.target.value)}
            >
              {ACCESS_LEVELS.map(lvl => (
                <option key={lvl.id} value={lvl.id}>{lvl.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Statutory Retention</label>
            <select
              style={field}
              value={retention}
              onChange={e => setRetention(e.target.value)}
            >
              <option value="3">3 Years (Standard)</option>
              <option value="5">5 Years (Tax & SARS)</option>
              <option value="7">7 Years (Executive)</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
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
