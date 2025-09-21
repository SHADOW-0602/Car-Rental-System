const axios = require('axios');

// Debug script to test ride acceptance
async function debugRideAccept() {
    const API_BASE = 'http://localhost:5000/api';
    
    // Test data - replace with actual values
    const testRideId = '68c2f8e8b5a4c2d1e3f4a5b6'; // Replace with actual ride ID
    const driverToken = 'your_driver_jwt_token_here'; // Replace with actual driver token
    
    console.log('🔍 Debugging ride acceptance...');
    console.log('Ride ID:', testRideId);
    console.log('Ride ID length:', testRideId.length);
    console.log('Is valid ObjectId format:', /^[0-9a-fA-F]{24}$/.test(testRideId));
    
    try {
        // Test 1: Check if API is accessible
        console.log('\n1️⃣ Testing API connectivity...');
        const apiTest = await axios.get(`${API_BASE}/rides/test-endpoint`);
        console.log('✅ API is accessible:', apiTest.data);
        
        // Test 2: Check if ride exists
        console.log('\n2️⃣ Testing if ride exists...');
        const rideTest = await axios.get(`${API_BASE}/rides/${testRideId}/test`, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        console.log('✅ Ride exists:', rideTest.data);
        
        // Test 3: Debug ride acceptance
        console.log('\n3️⃣ Testing ride acceptance debug...');
        const debugTest = await axios.get(`${API_BASE}/rides/${testRideId}/debug`, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        console.log('✅ Debug info:', debugTest.data);
        
        // Test 4: Attempt to accept ride
        console.log('\n4️⃣ Attempting to accept ride...');
        const acceptResponse = await axios.put(`${API_BASE}/rides/${testRideId}/accept`, {}, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        console.log('✅ Ride accepted:', acceptResponse.data);
        
    } catch (error) {
        console.error('❌ Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        
        if (error.response?.status === 404) {
            console.log('\n🔍 404 Error Analysis:');
            console.log('- Check if the ride ID is correct');
            console.log('- Verify the ride exists in the database');
            console.log('- Ensure the route is properly defined');
            console.log('- Check if another driver already accepted the ride');
        }
        
        if (error.response?.status === 401) {
            console.log('\n🔍 401 Error Analysis:');
            console.log('- Check if the JWT token is valid');
            console.log('- Verify the token has not expired');
            console.log('- Ensure the user has driver role');
        }
    }
}

// Instructions for use
console.log('📋 Instructions:');
console.log('1. Replace testRideId with an actual ride ID from your database');
console.log('2. Replace driverToken with a valid driver JWT token');
console.log('3. Make sure your backend server is running on port 5000');
console.log('4. Run: node debug-ride-accept.js');
console.log('\n' + '='.repeat(50));

// Uncomment the line below to run the debug
// debugRideAccept();

module.exports = debugRideAccept;