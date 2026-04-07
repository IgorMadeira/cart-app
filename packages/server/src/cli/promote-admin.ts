import prisma from '../prisma/client';
import { ROLES } from '@app001/shared';

const email = process.argv[2];

if (!email) {
  console.error('Usage: bun src/cli/promote-admin.ts <email>');
  process.exit(1);
}

const user = await prisma.user.findUnique({ where: { email } });

if (!user) {
  console.error(`User with email "${email}" not found.`);
  process.exit(1);
}

if (user.role === ROLES.ADMIN) {
  console.log(`User "${email}" is already an admin.`);
  process.exit(0);
}

await prisma.user.update({
  where: { email },
  data: { role: ROLES.ADMIN },
});

console.log(`User "${email}" promoted to admin.`);
await prisma.$disconnect();
