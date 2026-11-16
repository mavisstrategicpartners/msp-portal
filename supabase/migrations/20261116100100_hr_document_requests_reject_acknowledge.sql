-- Document requests: a "Rejected" outcome and a "Read & acknowledge" request type.
alter table public.hr_document_requests drop constraint if exists hr_document_requests_status_check;
alter table public.hr_document_requests add constraint hr_document_requests_status_check check (status in ('Outstanding', 'Submitted', 'Signed', 'Accepted', 'Returned', 'Rejected', 'Cancelled'));
alter table public.hr_document_requests drop constraint if exists hr_document_requests_kind_check;
alter table public.hr_document_requests add constraint hr_document_requests_kind_check check (kind in ('sign', 'acknowledge', 'complete', 'upload', 'declaration'));
