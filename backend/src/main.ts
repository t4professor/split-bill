import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const uploadDirs = [
    join(process.cwd(), 'uploads'),
    join(process.cwd(), 'uploads', 'avatars'),
    join(process.cwd(), 'uploads', 'payments'),
  ];

  uploadDirs.forEach((dir) => {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  });

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
