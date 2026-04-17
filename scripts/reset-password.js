// const bcrypt = require('bcryptjs');

// const newPassword = 'adminanu$1234'; // Change this to your desired password
// const email = 'ananyahouseoffurniture@ananya.com'; // Change this to your email

// bcrypt.hash(newPassword, 10, async (err, hash) => {
//   if (err) {
//     console.error('Error hashing password:', err);
//     return;
//   }
//   console.log('========================================');
//   console.log('NEW PASSWORD HASH GENERATED!');
//   console.log('========================================');
//   console.log('Email:', email);
//   console.log('New Password:', newPassword);
//   console.log('Hash:', hash);
//   console.log('========================================');
//   console.log('\nRun this command in MongoDB to update:\n');
//   console.log(`db.users.updateOne(`);
//   console.log(`  { email: "${email}" },`);
//   console.log(`  { $set: { password: "${hash}" } }`);
//   console.log(`);`);
// });
