// Supabase Configuration
// This file contains the Supabase credentials directly to bypass environment variable loading issues

export const SUPABASE_CONFIG = {
  url: 'https://malcoclwzccbphacjtgg.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hbGNvY2x3emNjYnBoYWNqdGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDM3MzEsImV4cCI6MjA2OTc3OTczMX0.AWGO4JC3tbxA1rhTmfHcLGCwRSfESaQitTZHXmjxsfI'
};

// Environment variable fallbacks
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || SUPABASE_CONFIG.url;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;

console.log('=== CONFIG LOADED ===');
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
console.log('=====================');
