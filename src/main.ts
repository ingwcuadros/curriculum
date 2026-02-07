import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );


  app.use(
    helmet({
      contentSecurityPolicy: false, // Desactivado por ahora para evitar conflictos
    }),
  );

  // 🟦 CORS habilitado temporalmente para cualquier origen
  //    Cuando tengas tu dominio final cámbialo en la sección comentada 👇
  app.enableCors({
    origin: true, // ⚠️ Permite cualquier origen temporalmente
    // origin: [
    //   'https://mi-frontend-produccion.com',
    //   'https://otro-dominio-permitido.com',
    //   'http://localhost:3000', // desarrollo
    //   'http://localhost:5173', // Vite
    // ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
