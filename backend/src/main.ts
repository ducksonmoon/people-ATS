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

  app.enableCors({
    // TODO:
    // origin: process.env.CORS_ORIGIN?.split(','),
    // credentials: true,
    origin: '*', // Allows requests from ANY frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*',
    credentials: false,
  });

  console.log('Application is running on: http://localhost:3000');
}
bootstrap();
