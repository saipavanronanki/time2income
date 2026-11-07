
const SUPABASE_URL = 'https://ifbdrlftbwhppqsfnreo.supabase.co';

const SUPABASE_PUBLIC_KEY = 'sb_publishable_HIzCLq8UjNPOMbR_61V38g_gdFbiNvo';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLIC_KEY
);
window.supabaseClient = supabaseClient;
console.log('TIME2INCOME Supabase client ready:', !!window.supabaseClient);