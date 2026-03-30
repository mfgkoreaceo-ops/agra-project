import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: { employeeNumber: '202201031' }
    });
    console.log(user);

    const usersByName = await prisma.user.findMany({
        where: { name: { contains: '윤나라' } }
    });
    console.log("Users by name:");
    console.log(usersByName);
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
