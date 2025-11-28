// Quick script to reset Kamal's password using Supabase Admin API
const SUPABASE_URL = 'https://kxboqjmswkraudlrhkex.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4Ym9xam1zd2tyYXVkbHJoa2V4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY0NzA3OSwiZXhwIjoyMDc5MjIzMDc5fQ.qDxATKCRPfQfAJ9aJmbsFh6d0YPqEEkCDeSesQcc3-U';
const USER_ID = '1e4393d6-c4dd-4b76-900d-93fdc77a906a';
const NEW_PASSWORD = 'Maikedah@2025';

fetch(`${SUPABASE_URL}/auth/v1/admin/users/${USER_ID}`, {
    method: 'PUT',
    headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY
    },
    body: JSON.stringify({
        password: NEW_PASSWORD
    })
})
    .then(response => response.json())
    .then(data => {
        console.log('✅ Password updated successfully!');
        console.log('You can now login with:');
        console.log('Email: abdulrahmandev141@gmail.com');
        console.log('Password: Maikedah@2025');
    })
    .catch(error => {
        console.error('❌ Error:', error);
    });
