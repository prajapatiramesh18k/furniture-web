const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createUser() {
  try {
    await mongoose.connect('mongodb+srv://ramesh:ramesh123@cluster0.ataz1nj.mongodb.net/dbfurntiure');
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('adminanu$1234', 10);

    const result = await mongoose.connection.db.collection('users').insertOne({
      name: 'Ramesh',
      email: 'prajapatiramesh18k@gmail.com',
      password: hashedPassword,
      isAdmin: true,
      createdAt: new Date()
    });

    console.log('User created successfully!');
    console.log('ID:', result.insertedId);
    console.log('\nCredentials:');
    console.log('Email: prajapatiramesh18k@gmail.com');
    console.log('Password: adminanu$1234');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

createUser();
