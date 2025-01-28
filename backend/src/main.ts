import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  if (!existsSync('./uploads')) {
    mkdirSync('./uploads');
    console.log('Uploads directory created at ./uploads');
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

  // Enable CORS if needed
  app.enableCors();

  console.log('Application is running on: http://localhost:3000');
}
bootstrap();
