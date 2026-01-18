import { PrismaClient, UserRole, MembershipTier } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding admin user...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tarodan.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

  // Check if admin exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: hashedPassword,
      displayName: 'Admin',
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      membershipTier: MembershipTier.BUSINESS,
      isVerified: true,
      isSeller: true,
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   ID: ${admin.id}`);
  console.log('');
  console.log('⚠️  Remember to change the default password!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
