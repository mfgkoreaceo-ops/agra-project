import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient(); async function main() { const u = await prisma.user.findFirst({ where: { name: 'Ω≈º±¡÷' } }); console.log(u); } main();
