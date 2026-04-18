import prisma from '../prisma/client';

const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true, role: true, createdAt: true },
  orderBy: { createdAt: 'asc' },
});

if (users.length === 0) {
  console.log('No users found.');
} else {
  console.table(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    })),
  );
}

await prisma.$disconnect();