// Firebase Connection Test
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyA-ucXLNkli79MYBnCERaauNuoVYJpJls4",
  authDomain: "rural-telemedicine-demo.firebaseapp.com",
  projectId: "rural-telemedicine-demo",
  storageBucket: "rural-telemedicine-demo.firebasestorage.app",
  messagingSenderId: "280923866954",
  appId: "1:280923866954:web:d3da39d1977b9745e763b3",
  measurementId: "G-BFJH8CRLZ5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebaseConnection() {
  console.log('Testing Firebase connection...');
  
  try {
    // Test 1: Check if we can connect to Firestore
    console.log('\n1. Testing Firestore connection...');
    const testCollection = collection(db, 'health_workers');
    console.log('✅ Firestore connection successful');
    
    // Test 2: Try to fetch all documents from health_workers collection
    console.log('\n2. Fetching all health_workers...');
    const allDocs = await getDocs(testCollection);
    console.log(`Found ${allDocs.size} documents in health_workers collection`);
    
    allDocs.forEach((doc) => {
      console.log(`- Document ID: ${doc.id}`);
      console.log(`- Data:`, doc.data());
    });
    
    // Test 3: Try to fetch specific doctor IDs
    console.log('\n3. Testing specific doctor IDs...');
    const doctorIds = ['acwD9Nf3glfTNIPUrVBX', 'fftxx6TlQUTHd2goh9it', 'gCmr6dABcocKdA1xXJai'];
    
    for (const doctorId of doctorIds) {
      try {
        const docRef = doc(db, 'health_workers', doctorId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          console.log(`✅ Doctor ${doctorId} found:`, docSnap.data());
        } else {
          console.log(`❌ Doctor ${doctorId} not found`);
        }
      } catch (error) {
        console.log(`❌ Error fetching doctor ${doctorId}:`, error.message);
      }
    }
    
    console.log('\n✅ Firebase test completed successfully!');
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
  }
}

testFirebaseConnection();