-- TerraMind AI - Database Schema
-- Run this in your Supabase SQL Editor to initialize the tables.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    org_type TEXT NOT NULL CHECK (org_type IN ('NGO', 'Government Agency', 'Research Institution', 'Community Coalition')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to organizations" ON public.organizations
    FOR SELECT USING (true);


-- 3. Users Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
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
    INSERT INTO public.users (id, email, full_name, org_id)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Terra Mind Watcher'),
        (new.raw_user_meta_data->>'org_id')::uuid
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 4. Incidents Table
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Illegal Dumping', 
        'Water Pollution', 
        'Air Pollution',
        'Deforestation', 
        'Wildlife Threats', 
        'Hazardous Waste'
    )),
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    location_name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('Low', 'Moderate', 'High', 'Critical')),
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Under Review', 'Investigating', 'Resolved')),
    risk_score INTEGER DEFAULT 0,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    additional_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on incidents
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to incidents" ON public.incidents
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to submit incidents" ON public.incidents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow owners or assigned organizations to update incidents" ON public.incidents
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        (SELECT org_id FROM public.users WHERE id = auth.uid()) = assigned_org_id
    );


-- 5. Votes Table (Community Validation)
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('confirm', 'dispute')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (incident_id, user_id)
);

-- Enable RLS on votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to votes" ON public.votes
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to cast votes" ON public.votes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Allow users to delete or modify their own votes" ON public.votes
    FOR ALL USING (auth.uid() = user_id);


-- 6. Incident Updates Table
CREATE TABLE IF NOT EXISTS public.incident_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    image_url TEXT,
    description TEXT NOT NULL,
    update_type TEXT NOT NULL CHECK (update_type IN ('cleanup', 'investigation', 'comment')),
    improvement_pct INTEGER NOT NULL DEFAULT 0 CHECK (improvement_pct BETWEEN 0 AND 100),
    waste_removed_kg INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on incident updates
ALTER TABLE public.incident_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to updates" ON public.incident_updates
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to log updates" ON public.incident_updates
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- 7. AI Analysis Table
CREATE TABLE IF NOT EXISTS public.ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    detected_issue TEXT NOT NULL,
    confidence INTEGER NOT NULL CHECK (confidence BETWEEN 0 AND 100),
    severity TEXT NOT NULL CHECK (severity IN ('Low', 'Moderate', 'High', 'Critical')),
    environmental_impact TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on AI Analysis
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to AI analysis" ON public.ai_analysis
    FOR SELECT USING (true);

CREATE POLICY "Allow system insert of AI analysis" ON public.ai_analysis
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- 8. Risk Scores Table (5-Factor breakdown)
CREATE TABLE IF NOT EXISTS public.risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    base_severity INTEGER NOT NULL CHECK (base_severity BETWEEN 1 AND 10),
    validation_factor INTEGER NOT NULL DEFAULT 0,
    population_density INTEGER NOT NULL DEFAULT 5 CHECK (population_density BETWEEN 1 AND 10),
    env_sensitivity INTEGER NOT NULL DEFAULT 5 CHECK (env_sensitivity BETWEEN 1 AND 10),
    frequency_index INTEGER NOT NULL DEFAULT 1 CHECK (frequency_index BETWEEN 1 AND 10),
    composite_score INTEGER NOT NULL CHECK (composite_score BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on risk scores
ALTER TABLE public.risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to risk scores" ON public.risk_scores
    FOR SELECT USING (true);


-- 9. Impact Metrics Table
CREATE TABLE IF NOT EXISTS public.impact_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_resolved INTEGER NOT NULL DEFAULT 0,
    waste_removed_kg INTEGER NOT NULL DEFAULT 0,
    area_restored_sqm INTEGER NOT NULL DEFAULT 0,
    average_risk_reduction_pct INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on impact metrics
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to impact metrics" ON public.impact_metrics
    FOR SELECT USING (true);


-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);
