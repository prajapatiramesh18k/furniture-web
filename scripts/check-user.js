const mongoose = require('mongoose');

async function checkUser() {
  try {
    await mongoose.connect('mongodb+srv://ramesh:ramesh123@cluster0.ataz1nj.mongodb.net/dbfurntiure');
    console.log('Connected to MongoDB');

    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\nAll users in database:');
    users.forEach(u => {
      console.log('- Email:', u.email);
      console.log('  Name:', u.name);
      console.log('  isAdmin:', u.isAdmin);
      console.log('');
    });

    const target = await mongoose.connection.db.collection('users').findOne({
      email: 'prajapatiramesh18k@gmail.com'
    });

    if (target) {
      console.log('User FOUND:', target);
    } else {
      console.log('User prajapatiramesh18k@gmail.com NOT FOUND in database');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkUser();
