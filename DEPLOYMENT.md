# Deployment Notes

1. Copy `.env.example` to `.env`.
2. Add your Supabase project URL and keys.
3. For Vercel, add the same variables under Project Settings → Environment Variables.
4. Do not put the Supabase service-role key in client-side variables such as VITE_*.
5. The original uploaded archive contained deployment secrets in `vercel.json`; that file was removed from this GitHub-ready package.
6. Configure Supabase Auth redirect URLs for your Vercel domain if using authentication.
