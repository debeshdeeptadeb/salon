import fetch from 'node-fetch';

async function testLoginAPI() {
    try {
        console.log('🔐 Testing login API endpoint...\n');

        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@minjalsalon.com',
                password: 'Admin@123'
            })
        });

        const data = await response.json();

        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok && data.success) {
            console.log('\n✅ Login successful!');
            console.log('Token:', data.data.token.substring(0, 20) + '...');
        } else {
            console.log('\n❌ Login failed!');
            console.log('Error:', data.error || 'Unknown error');
        }

    } catch (error) {
        console.error('❌ Error testing API:', error.message);
    }
}

testLoginAPI();
