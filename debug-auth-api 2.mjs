// Direct test of auth API endpoint behavior
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

console.log('\n=== Environment Check ===');
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 50));

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('\n=== Database Connection Test ===');
  
  const users = await prisma.user.findMany({
    select: { email: true, hashedPassword: true }
  });
  
  console.log(`Found ${users.length} users in database`);
  
  const demoUser = users.find(u => u.email === 'demo@vantage.os');
  if (demoUser) {
    console.log('\nDemo user found!');
    console.log('Hashed password (first 30 chars):', demoUser.hashedPassword?.substring(0, 30));
    
    const isValid = await bcrypt.compare('demo123', demoUser.hashedPassword);
    console.log('Password "demo123" validates:', isValid);
  } else {
    console.log('\n❌ Demo user NOT found!');
    console.log('Available emails:', users.map(u => u.email));
  }
  
  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
