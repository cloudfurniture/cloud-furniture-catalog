CLOUD FURNITURE — WORKING NETLIFY VERSION

This version uses:
- Netlify Functions
- Netlify Blobs for product data and product photos
- A private admin password

IMPORTANT:
A normal Netlify Drop does not build server functions. Deploy this folder through a GitHub-connected Netlify project or Netlify CLI.

Netlify settings required:
1. Build command: npm install
2. Publish directory: site
3. Functions directory is already set in netlify.toml
4. Add environment variables:
   ADMIN_PASSWORD = your private password
   ADMIN_SECRET = a long random secret (at least 32 characters)

Public catalog:
https://your-site.netlify.app/

Private admin:
https://your-site.netlify.app/admin.html

Product images are compressed in the browser before upload.
