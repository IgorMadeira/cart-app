import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@app001.local' },
    update: {},
    create: {
      email: 'admin@app001.local',
      name: 'Admin User',
      passwordHash,
      role: 'admin',
    },
  });

  await prisma.user.upsert({
    where: { email: 'viewer@app001.local' },
    update: {},
    create: {
      email: 'viewer@app001.local',
      name: 'Viewer User',
      passwordHash: await bcrypt.hash('Viewer123!', 10),
      role: 'viewer',
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
