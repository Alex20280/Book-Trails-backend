import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { AdminSeedService } from './admin.seed.service';
import { GenreSeedService } from './genre/genre.seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  await app.get(AdminSeedService).run();
  await app.get(GenreSeedService).run();

  await app.close();
};

void runSeed();
