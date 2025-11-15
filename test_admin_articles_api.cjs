const http = require('http');

// Test the admin articles API endpoint
const testAdminAPI = () => {
    console.log('🧪 Testing Admin Articles API...');

    // First, login to get token
    const loginData = JSON.stringify({
        username: 'admin',
        password: 'admin123'
    });

    const loginOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
        }
    };

    const loginReq = http.request(loginOptions, (loginRes) => {
        let loginData = '';

        loginRes.on('data', (chunk) => {
            loginData += chunk;
        });

        loginRes.on('end', () => {
            try {
                const loginResponse = JSON.parse(loginData);
                console.log('✅ Login successful:', loginResponse);

                if (loginResponse.token) {
                    // Now test articles endpoint
                    testArticlesEndpoint(loginResponse.token);
                } else {
                    console.error('❌ No token received');
                }
            } catch (error) {
                console.error('❌ Login response parse error:', error);
                console.error('Raw response:', loginData);
            }
        });
    });

    loginReq.on('error', (error) => {
        console.error('❌ Login request error:', error);
    });

    loginReq.write(loginData);
    loginReq.end();
};

const testArticlesEndpoint = (token) => {
    console.log('\n🧪 Testing Articles Endpoint...');

    const articlesOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/articles?channel=ambal',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
        }
    };

    const articlesReq = http.request(articlesOptions, (articlesRes) => {
        let articlesData = '';

        articlesRes.on('data', (chunk) => {
            articlesData += chunk;
        });

        articlesRes.on('end', () => {
            console.log('📡 Response status:', articlesRes.statusCode);
            console.log('📡 Response headers:', articlesRes.headers);
            console.log('📄 Raw response length:', articlesData.length);
            console.log('📄 Raw response preview:', articlesData.substring(0, 200) + '...');

            try {
                const articlesResponse = JSON.parse(articlesData);
                console.log('✅ Articles response type:', typeof articlesResponse);
                console.log('✅ Is array?', Array.isArray(articlesResponse));

                if (Array.isArray(articlesResponse)) {
                    console.log('✅ Articles count:', articlesResponse.length);
                    if (articlesResponse.length > 0) {
                        console.log('✅ First article keys:', Object.keys(articlesResponse[0]));
                        console.log('✅ First article sample:', {
                            slug: articlesResponse[0].slug,
                            title: articlesResponse[0].title,
                            category: articlesResponse[0].category
                        });
                    }
                } else {
                    console.error('❌ Expected array but got:', typeof articlesResponse);
                    console.error('❌ Response:', articlesResponse);
                }
            } catch (error) {
                console.error('❌ Articles response parse error:', error);
                console.error('Raw response:', articlesData);
            }
        });
    });

    articlesReq.on('error', (error) => {
        console.error('❌ Articles request error:', error);
    });

    articlesReq.end();
};

// Run the test
testAdminAPI();
