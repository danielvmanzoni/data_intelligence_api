import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/winston.logger';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { LogInterceptor } from './log/interceptors/log.interceptor';
import { LogService } from './log/log.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // Configurar CORS para permitir requisições do frontend
  app.enableCors({
    origin: [
      'http://localhost:3000', // React/Next.js padrão
      'http://localhost:3001', // Alternativa React
      'http://localhost:5173', // Vite
      'http://localhost:5174', // Vite alternativo
      'http://localhost:8080', // Vue.js
      'http://localhost:4200', // Angular
      'http://127.0.0.1:3000', // Localhost alternativo
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:4200',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Tenant-Context',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('API de Gestão de Chamados')
    .setDescription(
      'API multi-tenant para gerenciamento de tickets/chamados de suporte com identidade visual personalizada',
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Insira o token JWT no formato: Bearer <token>',
    })
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-Tenant-Context',
        in: 'header',
        description: 'Identificador do tenant (subdomínio ou ID)',
      },
      'tenant-header',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(new ValidationPipe());

  const logService = app.get(LogService);

  app.useGlobalInterceptors(new LogInterceptor(logService));

  await app.listen(3010);
}
bootstrap();
