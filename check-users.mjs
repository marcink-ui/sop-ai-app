import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({ 
    select: { email: true, name: true, role: true, hashedPassword: true } 
  });
  console.log('\\n=== Users in database ===');
  for (const user of users) {
    console.log(`Email: ${user.email}, Name: ${user.name}, Role: ${user.role}`);
    console.log(`  HashedPassword present: ${!!user.hashedPassword}`);
    if (user.hashedPassword) {
      const valid = await bcrypt.compare('demo123', user.hashedPassword);
      console.log(`  Password 'demo123' validates: ${valid}`);
    }
  }
  await prisma.$disconnect();
  await pool.end();
}
main().catch(console.error);
