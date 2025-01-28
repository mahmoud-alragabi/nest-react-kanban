import { Test, TestingModule } from '@nestjs/testing';
import { ListService } from '../list.service';
import { ListModule } from '../list.module';

describe('ListService', () => {
  let service: ListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ListModule],
    }).compile();

    service = module.get<ListService>(ListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
