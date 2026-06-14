import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:4200',
    'https://antoniorevertmentoria.vercel.app',
    process.env.CORS_ORIGIN,
  ].filter((origin): origin is string => !!origin);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.getHttpAdapter().getInstance().set('etag', false);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(3000);
  console.log('API on http://localhost:3000');
}
bootstrap();
