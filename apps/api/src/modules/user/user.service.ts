import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by phone
   */
  async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  /**
   * Get user with addresses
   */
  async findByIdWithAddresses(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: {
      displayName?: string;
      phone?: string;
    },
  ) {
    // Check phone uniqueness if being updated
    if (data.phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: {
          phone: data.phone,
          NOT: { id: userId },
        },
      });

      if (existingPhone) {
        throw new BadRequestException('Bu telefon numarası zaten kullanılıyor');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  /**
   * Mark user as verified
   */
  async verifyUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
  }

  /**
   * Upgrade user to seller
   */
  async upgradToSeller(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isSeller: true,
        sellerType: 'individual',
      },
    });
  }

  /**
   * Add user address
   */
  async addAddress(
    userId: string,
    data: {
      title?: string;
      fullName: string;
      phone: string;
      city: string;
      district: string;
      address: string;
      zipCode?: string;
      isDefault?: boolean;
    },
  ) {
    // If this is the default address, unset other defaults
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    // If this is the first address, make it default
    const existingAddresses = await this.prisma.address.count({
      where: { userId },
    });

    return this.prisma.address.create({
      data: {
        userId,
        fullName: data.fullName,
        phone: data.phone,
        title: data.title,
        city: data.city,
        district: data.district,
        address: data.address,
        zipCode: data.zipCode,
        isDefault: data.isDefault ?? existingAddresses === 0,
      },
    });
  }

  /**
   * Update user address
   */
  async updateAddress(
    userId: string,
    addressId: string,
    data: {
      title?: string;
      city?: string;
      district?: string;
      address?: string;
      zipCode?: string;
      isDefault?: boolean;
    },
  ) {
    // Verify ownership
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Adres bulunamadı');
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, NOT: { id: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  /**
   * Delete user address
   */
  async deleteAddress(userId: string, addressId: string) {
    // Verify ownership
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Adres bulunamadı');
    }

    await this.prisma.address.delete({
      where: { id: addressId },
    });

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const firstAddress = await this.prisma.address.findFirst({
        where: { userId },
      });

      if (firstAddress) {
        await this.prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return { message: 'Adres silindi' };
  }

  /**
   * Get user's addresses
   */
  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }
}
