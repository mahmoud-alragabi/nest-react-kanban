// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { KyselyService } from 'src/kysely/kysely.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly db: KyselyService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const userInfo: Awaited<User> | undefined = await this.db
      .selectFrom('User')
      .selectAll()
      .where('id', '=', payload.sub)
      .executeTakeFirst();

    if (!userInfo) throw new UnauthorizedException();

    const { password, ...user } = userInfo;

    return user;
  }
}
