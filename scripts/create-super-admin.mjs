/**
 * Create a platform super admin.
 * Usage: node scripts/create-super-admin.mjs <email> <password> [name]
 * Requires: MONGODB_URI in env / .env.local
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';

for (const f of ['.env.local', '.env']) {
  try {
    const raw = fs.readFileSync(f, 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        let v = m[2].trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        process.env[m[1]] = v;
      }
    }
  } catch {}
}

const [email, password, name] = process.argv.slice(2);
if (!email || !password || password.length < 6) {
  console.error('Usage: node scripts/create-super-admin.mjs <email> <password(>=6 chars)> [name]');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set.');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

const existing = await User.findOne({ email: String(email).toLowerCase() });
const hashed = await bcrypt.hash(String(password), 10);
if (existing) {
  await User.updateOne(
    { _id: existing._id },
    { $set: { password: hashed, role: 'super_admin', isSuperAdmin: true, isAdmin: true, active: true, tenantId: null } },
  );
  console.log('Promoted existing user to super_admin:', email);
} else {
  await User.create({
    name: name || 'Super Admin',
    email: String(email).toLowerCase(),
    password: hashed,
    role: 'super_admin',
    isSuperAdmin: true,
    isAdmin: true,
    active: true,
    tenantId: null,
    createdAt: new Date(),
  });
  console.log('Created super_admin:', email);
}
await mongoose.disconnect();
