import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // Register
  async register(data: {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) {
    const { firstName, lastName, userName, email, phoneNumber, password } =
      data;

    // DB lookup for user with the same username and email
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { userName }] },
    });
    if (existingUser)
      throw new BadRequestException('Email or username already exists');

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        userName,
        email,
        phoneNumber,
        password: hashedPassword,
      },
      select: {
        id: true,
        userName: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
      },
    });

    return { message: 'User registered successfully', user };
  }

  async login(data: { userNameOrEmail: string; password: string }) {
    const { userNameOrEmail, password } = data;

    // Find user by username or email
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: userNameOrEmail }, { userName: userNameOrEmail }],
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    // Generate JWT token
    const token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      userName: user.userName,
    });

    return {
      message: 'Login successful',
      access_token: token,
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarPath: user.avatarPath,
        paymentQrPath: user.paymentQrPath,
      },
    };
  }

  async validateUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        userName: true,
        email: true,
        phoneNumber: true,
        role: true,
      },
    });
  }

  async validate(payload: any): Promise<any> {
    const user = await this.validateUserById(payload.sub);
    if (!user) return null;
    return {
      sub: user.id,
      id: user.id,
      userName: user.userName,
      email: user.email,
      role: user.role,
    };
  }
}
