import { Controller, Post, Body, Get, Patch, Req, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const { user, generatedPassword } = await this.usersService.create(createUserDto);
    
    return {
      id: user._id,
      email: user.email,
      telegram: user.telegram,
      generatedPassword,
    };
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.usersService.validateUser(loginUserDto.email, loginUserDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user._id,
      email: user.email,
      telegram: user.telegram,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      addresses: user.addresses,
    };
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
    const userId = req.headers['user-id'];
    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user._id,
      email: user.email,
      telegram: user.telegram,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      addresses: user.addresses,
    };
  }

  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() updateData: any) {
    const userId = req.headers['user-id'];
    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    const updatedUser = await this.usersService.updateProfile(userId, updateData);
    if (!updatedUser) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: updatedUser._id,
      email: updatedUser.email,
      telegram: updatedUser.telegram,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      addresses: updatedUser.addresses,
    };
  }
}
