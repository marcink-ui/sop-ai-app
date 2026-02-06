// Simulate what NextAuth CredentialsProvider does
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 40) + '...');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testAuth(email, password) {
  console.log(`\nTesting auth for: ${email}`);
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { organization: true }
  });
  
  if (!user) {
    console.log('  User not found!');
    return;
  }
  
  console.log('  User found:', user.name, user.role);
  console.log('  HashedPassword:', user.hashedPassword?.substring(0, 20) + '...');
  
  if (!user.hashedPassword) {
    console.log('  No hashedPassword!');
    return;
  }
  
  const isValid = await bcrypt.compare(password, user.hashedPassword);
  console.log('  Password valid:', isValid);
}

async function main() {
  await testAuth('demo@vantage.os', 'demo123');
  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
