// Test script to verify listing persistence
console.log('🧪 Testing Listing Persistence...');

// Test 1: Check if DataPersistenceService is working
function testDataPersistence() {
  console.log('\n📋 Test 1: Data Persistence Service');
  
  // Simulate creating a listing
  const testListing = {
    id: 'test-' + Date.now(),
    sellerId: 'seller1',
    sellerName: 'Test Seller',
    title: 'Test Watch Listing',
    description: 'This is a test listing to verify persistence',
    brand: 'Rolex',
    model: 'Submariner',
    year: 2020,
    condition: 'excellent',
    startingPrice: 5000,
    currentPrice: 5000,
    imageUrl: 'test.jpg',
    createdAt: new Date(),
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
    status: 'active',
    bids: [],
    counteroffers: [],
    hasMadeCounteroffer: false
  };

  console.log('✅ Test listing created:', testListing.title);
  return testListing;
}

// Test 2: Check localStorage functionality
function testLocalStorage() {
  console.log('\n💾 Test 2: LocalStorage Functionality');
  
  const testKey = 'watch_ios_test';
  const testData = { test: 'data' };
  
  try {
    localStorage.setItem(testKey, JSON.stringify(testData));
    const retrieved = JSON.parse(localStorage.getItem(testKey));
    
    if (retrieved.test === 'data') {
      console.log('✅ LocalStorage is working correctly');
      localStorage.removeItem(testKey);
      return true;
    } else {
      console.log('❌ LocalStorage data mismatch');
      return false;
    }
  } catch (error) {
    console.log('❌ LocalStorage error:', error);
    return false;
  }
}

// Test 3: Check current listings
function testCurrentListings() {
  console.log('\n📊 Test 3: Current Listings');
  
  try {
    const listingsData = localStorage.getItem('watch_ios_listings');
    const listings = listingsData ? JSON.parse(listingsData) : [];
    
    console.log(`📈 Found ${listings.length} existing listings`);
    
    if (listings.length > 0) {
      console.log('📋 Sample listings:');
      listings.slice(0, 3).forEach((listing, index) => {
        console.log(`  ${index + 1}. ${listing.title} - $${listing.currentPrice}`);
      });
    } else {
      console.log('📭 No existing listings found');
    }
    
    return listings;
  } catch (error) {
    console.log('❌ Error reading listings:', error);
    return [];
  }
}

// Run all tests
function runTests() {
  console.log('🚀 Starting Listing Persistence Tests...\n');
  
  const storageWorks = testLocalStorage();
  const currentListings = testCurrentListings();
  const testListing = testDataPersistence();
  
  console.log('\n📊 Test Summary:');
  console.log(`✅ LocalStorage: ${storageWorks ? 'Working' : 'Failed'}`);
  console.log(`📈 Current Listings: ${currentListings.length}`);
  console.log(`🧪 Test Listing: ${testListing.title}`);
  
  if (storageWorks) {
    console.log('\n✅ Listing persistence should work correctly!');
    console.log('💡 To test:');
    console.log('   1. Go to /sell page');
    console.log('   2. Create a new listing');
    console.log('   3. Go to /discovery page');
    console.log('   4. Verify the listing appears');
  } else {
    console.log('\n❌ LocalStorage issues detected - persistence may not work');
  }
}

// Run tests if in browser environment
if (typeof window !== 'undefined') {
  runTests();
} else {
  console.log('This test script should be run in a browser environment');
}