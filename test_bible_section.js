// Simple test to verify Bible section functionality
const axios = require('axios');

async function testBibleSection() {
  try {
    console.log('Testing Bible API endpoint...');
    const response = await axios.get('http://localhost:8001/api/bible');
    
    console.log('✅ Bible API endpoint is working');
    console.log('Title:', response.data.title);
    console.log('Tagline:', response.data.tagline);
    console.log('Franchise Pillar:', response.data.franchise_pillar);
    
    // Check if required fields exist
    const requiredFields = ['title', 'tagline', 'franchise_pillar', 'genre', 'tone', 'coronation'];
    const missingFields = requiredFields.filter(field => !response.data[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ All required fields are present in the API response');
    } else {
      console.log('⚠️  Missing fields:', missingFields);
    }
    
    console.log('\n✅ Bible Section should work correctly with this data structure');
    
  } catch (error) {
    console.error('❌ Error testing Bible section:', error.message);
  }
}

testBibleSection();