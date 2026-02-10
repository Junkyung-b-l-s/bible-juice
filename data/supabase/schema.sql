-- Create a table to store user search history
create table if not exists search_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  input_text text not null,
  analysis_json jsonb, -- Stores the full analysis result from OpenAI
  situation_ids text[], -- Array of matched situation IDs
  recommended_verses text[] -- Array of recommended verse keys
);

-- Enable Row Level Security (RLS)
alter table search_logs enable row level security;

-- Create a policy to allow inserting logs (anyone can insert, or restrict to service role)
-- For now, allowing public insert for simplicity if anon key is used, 
-- but ideally this should be service_role only in the API.
-- Since we use supabase-js in API route (server-side), we can use service role key if available,
-- OR just allow anon insert if using public key.
-- Assuming the API route uses standard client which might be anon.
create policy "Enable insert for all users" on search_logs for insert with check (true);

-- Create policy to allow reading logs (optional, maybe only for admin)
create policy "Enable read for service role only" on search_logs for select using (auth.role() = 'service_role');
