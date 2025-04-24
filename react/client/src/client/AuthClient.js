import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igtizqtcgbxxdmpcoxhk.supabase.co'; // Здесь твой URL-адрес проекта
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlndGl6cXRjZ2J4eGRtcGNveGhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTUxMDQxMSwiZXhwIjoyMDYxMDg2NDExfQ.6mcMgmGUYgfcOXWBC_KuJ6JfRkAtT45I_2lxGORuwaQ'; // Здесь ключ проекта

export const supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
        auth: {
            persistSession: true,
            storage: localStorage
        }
    }
)
