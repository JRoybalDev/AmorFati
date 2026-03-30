import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Starting unseeding (cleaning database)...');

  // 1. Delete all posts
  // We delete posts first to avoid foreign key constraint issues if any exist
  const deletePosts = await prisma.post.deleteMany({});
  console.log(`Deleted ${deletePosts.count} posts.`);

  // 2. Delete the specific admin user created by the seed script
  const deleteUsers = await prisma.user.deleteMany({
    where: {
      id: 'user_default_admin',
    },
  });
  console.log(`Deleted ${deleteUsers.count} user(s).`);

  console.log('Unseeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
