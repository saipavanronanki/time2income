
const SUPABASE_URL = 'https://epylulnketqwhqxxyjgz.supabase.co';

const SUPABASE_PUBLIC_KEY = 'sb_publishable_nXCxWnwMkW6hmdmYbl1Sdw_U4q08z1T';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLIC_KEY
);
window.supabaseClient = supabaseClient;
console.log('TIME2INCOME Supabase client ready:', !!window.supabaseClient);