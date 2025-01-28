import { Test, TestingModule } from '@nestjs/testing';
import { ListController } from '../list.controller';
import { ListModule } from '../list.module';

describe('ListController', () => {
  let controller: ListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ListModule],
    }).compile();

    controller = module.get<ListController>(ListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
