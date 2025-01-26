import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { KyselyService } from '../kysely/kysely.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: KyselyService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.db
      .selectFrom('User')
      .selectAll()
      .where('email', '=', dto.email)
      .executeTakeFirst();

    if (!user) throw new Error('INVALID_CREDENTIALS');

    const isPasswordMatch = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordMatch) throw new Error('INVALID_CREDENTIALS');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1h',
    });

    return {
      access_token: accessToken,
    };
  }
}
