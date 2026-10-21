-- Migration: Staff Dashboard Task Management and Performance Features
-- Tables: staff_tasks, staff_task_dependencies, staff_evidence_submissions, staff_notifications

-- 1. Staff Tasks Table
CREATE TABLE IF NOT EXISTS public.staff_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    assigned_to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to_name TEXT NOT NULL,
    assigned_to_email TEXT,
    assigned_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_by_name TEXT NOT NULL,
    assigned_by_role TEXT,
    department TEXT NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT,
    project_name TEXT,
    priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    status TEXT NOT NULL CHECK (status IN ('Not Started', 'In Progress', 'Blocked', 'Submitted for Review', 'Changes Requested', 'Completed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    assignment_date TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    completion_date TIMESTAMPTZ,
    instructions TEXT,
    attachments JSONB DEFAULT '[]'::JSONB,
    supporting_links JSONB DEFAULT '[]'::JSONB,
    progress_notes JSONB DEFAULT '[]'::JSONB,
    dependencies_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_tasks_assigned_to ON public.staff_tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_status ON public.staff_tasks(status);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_due_date ON public.staff_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_department ON public.staff_tasks(department);

-- 2. Task Dependency Requests Table
CREATE TABLE IF NOT EXISTS public.staff_task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.staff_tasks(id) ON DELETE CASCADE,
    task_title TEXT NOT NULL,
    requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    requester_name TEXT NOT NULL,
    requester_role TEXT,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    recipient_name TEXT,
    recipient_department TEXT NOT NULL,
    blocker_description TEXT NOT NULL,
    needed_resource TEXT NOT NULL,
    urgency TEXT NOT NULL CHECK (urgency IN ('Low', 'Medium', 'High', 'Urgent')),
    requested_by_date TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Acknowledged', 'In Progress', 'Fulfilled', 'Declined', 'Cancelled')),
    response_notes TEXT,
    responder_name TEXT,
    responded_at TIMESTAMPTZ,
    comments JSONB DEFAULT '[]'::JSONB,
    attachments JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_dependencies_task ON public.staff_task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_staff_dependencies_requester ON public.staff_task_dependencies(requester_id);
CREATE INDEX IF NOT EXISTS idx_staff_dependencies_recipient ON public.staff_task_dependencies(recipient_id);
CREATE INDEX IF NOT EXISTS idx_staff_dependencies_status ON public.staff_task_dependencies(status);

-- 3. Evidence Submissions Table
CREATE TABLE IF NOT EXISTS public.staff_evidence_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.staff_tasks(id) ON DELETE CASCADE,
    task_title TEXT NOT NULL,
    submitting_staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    submitting_staff_name TEXT NOT NULL,
    submission_number INTEGER DEFAULT 1,
    deliverable_links JSONB DEFAULT '[]'::JSONB,
    uploaded_files JSONB DEFAULT '[]'::JSONB,
    written_explanation TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Draft', 'Submitted for Review', 'Approved', 'Changes Requested')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_by_name TEXT,
    reviewer_feedback TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_evidence_task ON public.staff_evidence_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_staff_evidence_staff ON public.staff_evidence_submissions(submitting_staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_evidence_status ON public.staff_evidence_submissions(status);

-- 4. Staff Notifications Table
CREATE TABLE IF NOT EXISTS public.staff_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    related_task_id UUID,
    related_dependency_id UUID,
    related_evidence_id UUID,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_notifications_user ON public.staff_notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_staff_notifications_created ON public.staff_notifications(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.staff_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_evidence_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_notifications ENABLE ROW LEVEL SECURITY;

-- Base Policies
CREATE POLICY "Staff can view assigned tasks"
    ON public.staff_tasks FOR SELECT
    USING (assigned_to_id = auth.uid() OR is_manager_or_above(auth.uid()));

CREATE POLICY "Staff can update permitted task fields"
    ON public.staff_tasks FOR UPDATE
    USING (assigned_to_id = auth.uid() OR is_manager_or_above(auth.uid()));

CREATE POLICY "Managers can insert tasks"
    ON public.staff_tasks FOR INSERT
    WITH CHECK (is_manager_or_above(auth.uid()));

CREATE POLICY "Staff can manage dependencies"
    ON public.staff_task_dependencies FOR ALL
    USING (requester_id = auth.uid() OR recipient_id = auth.uid() OR is_manager_or_above(auth.uid()));

CREATE POLICY "Staff can manage evidence"
    ON public.staff_evidence_submissions FOR ALL
    USING (submitting_staff_id = auth.uid() OR is_manager_or_above(auth.uid()));

CREATE POLICY "Users view own notifications"
    ON public.staff_notifications FOR ALL
    USING (user_id = auth.uid());
