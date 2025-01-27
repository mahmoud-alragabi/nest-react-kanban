import { SetMetadata } from '@nestjs/common';

export const OwnerOf = (model: string) => SetMetadata('resourceModel', model);
