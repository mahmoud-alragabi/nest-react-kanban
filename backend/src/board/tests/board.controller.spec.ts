import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from '../board.controller';
import { BoardModule } from '../board.module';

describe('BoardController', () => {
  let controller: BoardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [BoardModule],
    }).compile();

    controller = module.get<BoardController>(BoardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
