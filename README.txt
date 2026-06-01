Organic Pestar Role-Based Static Website
========================================

Correct flow:
1. index.html opens as the public website.
2. Public users can request a quote on the normal website.
3. Staff click "Staff Login" to open login.html.
4. Admin logs in and goes to admin.html.
5. Technician logs in and goes to technician.html.
6. Admin can create jobs and assign them to technicians.
7. Technicians can only see jobs assigned to their own email.

Demo logins:
Admin:
- Email: admin@organicpestar.co.za
- Password: Admin123

Technician 1:
- Email: tech@organicpestar.co.za
- Password: Tech123

Technician 2:
- Email: tech2@organicpestar.co.za
- Password: Tech123

Upload structure:
public_html/
  index.html
  login.html
  admin.html
  technician.html
  assets/
    style.css
    app.js
    form.js

Important security note:
This version is still frontend-only and uses localStorage.
That means it is good for design/testing, but not safe for real staff data yet.
For production, connect the login, jobs and signatures to Supabase.
