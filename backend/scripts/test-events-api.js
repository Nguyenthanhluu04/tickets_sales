const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testEventsAPI() {
  try {
    console.log('🧪 Testing Events API...\n');

    // Test 1: Get all events
    console.log('1️⃣  GET /api/events');
    const response = await axios.get(`${API_URL}/events`);
    
    if (response.data.success) {
      console.log(`✅ Success! Found ${response.data.data.data.length} events\n`);
      
      response.data.data.data.forEach((event, index) => {
        console.log(`${index + 1}. ${event.name}`);
        console.log(`   Category: ${event.category}`);
        console.log(`   Image URL: ${event.imageUrl}`);
        console.log(`   Banner Image: ${event.bannerImage}`);
        console.log(`   Banner IPFS: ${event.bannerImageIPFS}`);
        console.log('');
      });
    }

    // Test 2: Filter by category
    console.log('\n2️⃣  GET /api/events?category=music');
    const musicResponse = await axios.get(`${API_URL}/events?category=music`);
    
    if (musicResponse.data.success) {
      console.log(`✅ Success! Found ${musicResponse.data.data.data.length} music events\n`);
      musicResponse.data.data.data.forEach((event) => {
        console.log(`   - ${event.name} (${event.category})`);
      });
    }

    // Test 3: Filter by conference
    console.log('\n3️⃣  GET /api/events?category=conference');
    const confResponse = await axios.get(`${API_URL}/events?category=conference`);
    
    if (confResponse.data.success) {
      console.log(`✅ Success! Found ${confResponse.data.data.data.length} conference events\n`);
      confResponse.data.data.data.forEach((event) => {
        console.log(`   - ${event.name} (${event.category})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testEventsAPI();
