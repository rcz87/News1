const https = require('https');

// Test browser compatibility issues for Chrome vs Edge
const testBrowserCompatibility = () => {
    console.log('🧪 Testing Browser Compatibility Issues for Chrome vs Edge');

    // Test 1: Check SSL Certificate
    const testSSLCertificate = () => {
        return new Promise((resolve, reject) => {
            console.log('\n🔒 Test 1: SSL Certificate Check');

            const options = {
                hostname: 'wisanggeni.cloud',
                port: 443,
                path: '/',
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            };

            const req = https.request(options, (res) => {
                console.log('✅ SSL Connection Status:', res.statusCode);
                console.log('✅ SSL Protocol:', res.socket.getProtocol());
                console.log('✅ Cipher:', res.socket.getCipher());
                console.log('✅ Certificate Subject:', res.socket.getPeerCertificate().subject);
                console.log('✅ Certificate Issuer:', res.socket.getPeerCertificate().issuer);
                console.log('✅ Certificate Valid From:', res.socket.getPeerCertificate().valid_from);
                console.log('✅ Certificate Valid To:', res.socket.getPeerCertificate().valid_to);

                // Check for common SSL issues
                const cert = res.socket.getPeerCertificate();
                const now = new Date();
                const validTo = new Date(cert.valid_to);

                if (validTo < now) {
                    console.error('❌ SSL Certificate has expired!');
                } else {
                    console.log('✅ SSL Certificate is valid');
                }

                resolve();
            });

            req.on('error', (error) => {
                console.error('❌ SSL Connection Error:', error.message);
                reject(error);
            });

            req.end();
        });
    };

    // Test 2: Check CORS Headers
    const testCORSHeaders = () => {
        return new Promise((resolve, reject) => {
            console.log('\n🌐 Test 2: CORS Headers Check');

            const options = {
                hostname: 'wisanggeni.cloud',
                port: 443,
                path: '/api/admin/login',
                method: 'OPTIONS',
                headers: {
                    'Origin': 'https://wisanggeni.cloud',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            };

            const req = https.request(options, (res) => {
                console.log('✅ OPTIONS Status:', res.statusCode);
                console.log('✅ CORS Headers:');
                console.log('   - Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
                console.log('   - Access-Control-Allow-Methods:', res.headers['access-control-allow-methods']);
                console.log('   - Access-Control-Allow-Headers:', res.headers['access-control-allow-headers']);
                console.log('   - Access-Control-Allow-Credentials:', res.headers['access-control-allow-credentials']);

                resolve();
            });

            req.on('error', reject);
            req.end();
        });
    };

    // Test 3: Check Security Headers
    const testSecurityHeaders = () => {
        return new Promise((resolve, reject) => {
            console.log('\n🛡️ Test 3: Security Headers Check');

            const options = {
                hostname: 'wisanggeni.cloud',
                port: 443,
                path: '/admin.html',
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            };

            const req = https.request(options, (res) => {
                console.log('✅ Security Headers:');
                console.log('   - Content-Security-Policy:', res.headers['content-security-policy']);
                console.log('   - X-Frame-Options:', res.headers['x-frame-options']);
                console.log('   - X-Content-Type-Options:', res.headers['x-content-type-options']);
                console.log('   - X-XSS-Protection:', res.headers['x-xss-protection']);
                console.log('   - Strict-Transport-Security:', res.headers['strict-transport-security']);
                console.log('   - Referrer-Policy:', res.headers['referrer-policy']);

                // Check for CSP issues that might affect Chrome
                const csp = res.headers['content-security-policy'];
                if (csp) {
                    console.log('✅ CSP Policy found');
                    if (csp.includes('script-src') && !csp.includes('unsafe-inline')) {
                        console.log('⚠️ CSP might block inline scripts in Chrome');
                    }
                    if (csp.includes('connect-src')) {
                        console.log('✅ CSP allows API connections');
                    }
                } else {
                    console.log('ℹ️ No CSP header found');
                }

                resolve();
            });

            req.on('error', reject);
            req.end();
        });
    };

    // Test 4: Simulate Chrome API Request
    const testChromeAPIRequest = () => {
        return new Promise((resolve, reject) => {
            console.log('\n🔄 Test 4: Chrome API Request Simulation');

            const loginData = JSON.stringify({
                username: 'admin',
                password: 'admin123'
            });

            const options = {
                hostname: 'wisanggeni.cloud',
                port: 443,
                path: '/api/admin/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(loginData),
                    'Origin': 'https://wisanggeni.cloud',
                    'Referer': 'https://wisanggeni.cloud/admin.html',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    console.log('✅ Chrome API Status:', res.statusCode);
                    console.log('✅ Response Headers:');
                    console.log('   - Content-Type:', res.headers['content-type']);
                    console.log('   - Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
                    console.log('   - Access-Control-Allow-Credentials:', res.headers['access-control-allow-credentials']);

                    try {
                        const response = JSON.parse(data);
                        console.log('✅ Chrome API Response:', response);

                        if (response.token) {
                            console.log('✅ Chrome login simulation successful');
                        } else {
                            console.error('❌ Chrome login simulation failed');
                        }
                    } catch (error) {
                        console.error('❌ Chrome API response parse error:', error);
                        console.error('Raw response:', data);
                    }

                    resolve();
                });
            });

            req.on('error', (error) => {
                console.error('❌ Chrome API request error:', error.message);
                reject(error);
            });

            req.write(loginData);
            req.end();
        });
    };

    // Test 5: Check for Mixed Content
    const testMixedContent = () => {
        return new Promise((resolve, reject) => {
            console.log('\n🔀 Test 5: Mixed Content Check');

            const options = {
                hostname: 'wisanggeni.cloud',
                port: 443,
                path: '/admin.html',
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    // Check for HTTP resources in HTTPS page
                    const httpResources = data.match(/http:\/\/[^"'\s>]+/gi) || [];
                    const httpsResources = data.match(/https:\/\/[^"'\s>]+/gi) || [];
                    const relativeResources = data.match(/src=["'][^"']*["']/gi) || [];

                    console.log('✅ HTTP Resources (potential mixed content):', httpResources.length);
                    console.log('✅ HTTPS Resources:', httpsResources.length);
                    console.log('✅ Relative Resources:', relativeResources.length);

                    if (httpResources.length > 0) {
                        console.log('⚠️ Potential mixed content issues:');
                        httpResources.forEach(resource => {
                            console.log('   -', resource);
                        });
                    } else {
                        console.log('✅ No mixed content detected');
                    }

                    resolve();
                });
            });

            req.on('error', reject);
            req.end();
        });
    };

    // Run all tests
    testSSLCertificate()
        .then(() => testCORSHeaders())
        .then(() => testSecurityHeaders())
        .then(() => testChromeAPIRequest())
        .then(() => testMixedContent())
        .then(() => {
            console.log('\n🎉 Browser Compatibility Tests Completed!');
            console.log('\n📋 Chrome vs Edge Issue Analysis:');
            console.log('1. Check Chrome Developer Console for specific errors');
            console.log('2. Verify Chrome extensions are not blocking the site');
            console.log('3. Clear Chrome cache and cookies');
            console.log('4. Check Chrome security settings');
            console.log('5. Verify Chrome is up to date');
        })
        .catch((error) => {
            console.error('\n❌ Browser compatibility test failed:', error.message);
        });
};

// Run the browser compatibility test
testBrowserCompatibility();
