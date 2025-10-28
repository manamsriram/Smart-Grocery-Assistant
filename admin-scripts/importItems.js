const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./pantrypal-af9e6-firebase-adminsdk-fbsvc-472fbeef18'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Load data array
const items = JSON.parse(fs.readFileSync('items.json', 'utf8'));

// Import each item to 'items' collection (as auto-ID docs)
async function importItems() {
  console.log(`Importing ${items.length} items...`);
  let count = 0;
  for (const item of items) {
    // Add completed: false
    const itemWithCompleted = { ...item, completed: false };

    await db.collection('items').add(itemWithCompleted);
    count++;
    if (count % 100 === 0) console.log(`Imported ${count} items...`);
  }
  console.log('All items imported!');
}

importItems().catch(console.error);
