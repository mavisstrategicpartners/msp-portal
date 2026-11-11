-- Files attached to department records (design briefs). The files live in the private
-- "evidence" bucket under records/<department>/<uploader>/; only the server issues links.
alter table public.department_records add column if not exists attachments jsonb not null default '[]'::jsonb;
comment on column public.department_records.attachments is 'Files linked to the record: [{name,path,size,mimeType,uploadedBy,uploadedAt}] in the private evidence bucket under records/<department>/<uploader>/';
