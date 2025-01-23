import { Test, TestingModule } from '@nestjs/testing';
import { KyselyService } from '../kysely.service';

describe('KyselyService', () => {
  let service: KyselyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KyselyService],
    }).compile();

    service = module.get<KyselyService>(KyselyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
