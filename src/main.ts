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
