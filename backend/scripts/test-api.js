const axios = require('axios');

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...\n');

    // Test getAllEvents
    console.log('1️⃣ Testing GET /api/events');
    const eventsRes = await axios.get('http://localhost:5000/api/events');
    console.log('   Raw response:', JSON.stringify(eventsRes.data).substring(0, 200));
    
    const events = eventsRes.data.data?.data || eventsRes.data.data || eventsRes.data || [];
    console.log(`   ✅ Found ${Array.isArray(events) ? events.length : 0} events`);
    
    if (Array.isArray(events) && events.length > 0) {
      const firstEvent = events[0];
      console.log(`   📅 Event: ${firstEvent.name}`);
      console.log(`   🖼️  ImageUrl: ${firstEvent.imageUrl ? '✓' : '✗'}`);
      console.log(`   🎫 Ticket types: ${firstEvent.ticketTypes?.length || 0}`);
      
      if (firstEvent.ticketTypes && firstEvent.ticketTypes.length > 0) {
        const soldTickets = firstEvent.ticketTypes.filter(tt => tt.currentSupply > 0);
        console.log(`   📊 Sold tickets: ${soldTickets.length}/${firstEvent.ticketTypes.length} types`);
        
        soldTickets.forEach(tt => {
          console.log(`      - ${tt.name}: ${tt.currentSupply}/${tt.maxSupply} sold`);
        });
      }
      
      // Test getEventById với event đầu tiên
      console.log(`\n2️⃣ Testing GET /api/events/${firstEvent.eventId}`);
      const eventRes = await axios.get(`http://localhost:5000/api/events/${firstEvent.eventId}`);
      console.log(`   ✅ Event: ${eventRes.data.name}`);
      console.log(`   📊 Current supply from blockchain: ${eventRes.data.currentSupply}`);
    }

    // Test user's tickets (cần auth token, skip nếu không có)
    console.log('\n3️⃣ Testing GET /api/tickets/my-tickets (requires auth)');
    console.log('   ⚠️  Skipped - requires authentication');

    console.log('\n✅ API tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Đợi 2 giây để server khởi động
setTimeout(testAPI, 2000);
