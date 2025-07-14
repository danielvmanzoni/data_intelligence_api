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
      'API multi-tenant para gerenciamento de tickets/chamados de suporte com identidade visual personalizada.\n\n' +
        '## Autenticação\n\n' +
        '1. Faça login usando o endpoint `/auth/login` para obter o token JWT\n' +
        '2. Clique no botão "Authorize" (🔓) no topo da página\n' +
        '3. Cole APENAS o token JWT (sem a palavra "Bearer")\n' +
        '4. Clique em "Authorize" e depois em "Close"\n\n' +
        '## Tenants\n\n' +
        'Todas as rotas que começam com `/:tenant` precisam do slug do tenant na URL.\n' +
        'Exemplo: Para o tenant "crown", use `/crown/tickets`',
    )
    .setVersion('1.0')
    .addSecurityRequirements('bearer')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      syntaxHighlight: {
        theme: 'monokai',
      },
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      operationsSorter: 'alpha',
      tagsSorter: 'alpha',
    },
    customSiteTitle: 'API de Gestão de Chamados - Documentação',
    customfavIcon: 'https://fastapi.tiangolo.com/img/favicon.png',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
    ],
  });

  app.useGlobalPipes(new ValidationPipe());

  const logService = app.get(LogService);
  app.useGlobalInterceptors(new LogInterceptor(logService));

  await app.listen(3010);
}

bootstrap();
