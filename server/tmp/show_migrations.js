const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const rows = await prisma.$queryRawUnsafe(
      'SELECT migration_name, logs, finished_at, rolled_back_at, applied_steps_count FROM "_prisma_migrations" ORDER BY started_at DESC'
    );
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
})();
