-- EcoWatch AI Database Schema
-- Run this in your Supabase SQL Editor to initialize the tables.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users / Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to users" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Trigger to sync auth.users with public.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Eco Watcher')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Illegal Dumping', 
        'Water Pollution', 
        'Deforestation', 
        'Wildlife Threat', 
        'Air Pollution', 
        'Hazardous Waste'
    )),
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    location_name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Under Review', 'Resolved')),
    risk_score INTEGER DEFAULT 0,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to reports" ON public.reports
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow owners to update their own reports" ON public.reports
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IN (
        -- Admins or moderators can be specified here if needed
        SELECT id FROM public.users WHERE email LIKE '%@ecowatch.ai'
    ));


-- 4. Report Votes Table (Confirm / Dispute)
CREATE TABLE IF NOT EXISTS public.report_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('confirm', 'dispute')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (report_id, user_id)
);

-- Enable RLS on votes
ALTER TABLE public.report_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to votes" ON public.report_votes
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to cast votes" ON public.report_votes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Allow users to delete or modify their own votes" ON public.report_votes
    FOR ALL USING (auth.uid() = user_id);


-- 5. Before & After Updates Table
CREATE TABLE IF NOT EXISTS public.report_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    description TEXT NOT NULL,
    improvement_pct INTEGER NOT NULL CHECK (improvement_pct BETWEEN 0 AND 100),
    pollution_reduced INTEGER NOT NULL CHECK (pollution_reduced BETWEEN 0 AND 100),
    recovery_status TEXT NOT NULL CHECK (recovery_status IN ('Improving', 'Recovered', 'Unchanged')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on report updates
ALTER TABLE public.report_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to updates" ON public.report_updates
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to submit updates" ON public.report_updates
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- 6. AI Analysis Table
CREATE TABLE IF NOT EXISTS public.ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    detected_issue TEXT NOT NULL,
    confidence INTEGER NOT NULL CHECK (confidence BETWEEN 0 AND 100),
    severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    environmental_impact TEXT NOT NULL,
    raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on AI Analysis
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to AI analysis" ON public.ai_analysis
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert of AI analysis" ON public.ai_analysis
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
