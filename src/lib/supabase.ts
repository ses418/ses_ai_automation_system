import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

// Debug: Log configuration
console.log('=== SUPABASE CLIENT INITIALIZATION ===');
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
console.log('=====================================');

// Runtime guard to ensure configuration is set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('=== MISSING SUPABASE CONFIGURATION ===');
  console.error('SUPABASE_URL:', SUPABASE_URL ? 'SET' : 'MISSING');
  console.error('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
  console.error('=====================================');
  
  throw new Error(
    'Missing Supabase configuration. Please check the config.ts file.'
  );
}

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Log successful connection
console.log('Supabase client initialized successfully with URL:', SUPABASE_URL);
console.log('Supabase client initialized successfully with Key:', SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
