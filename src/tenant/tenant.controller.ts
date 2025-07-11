import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@ApiTags('Tenants')
@Controller('tenants')
@ApiBearerAuth()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo tenant' })
  @ApiResponse({
    status: 201,
    description: 'Tenant criado com sucesso',
  })
  @ApiResponse({
    status: 409,
    description: 'CNPJ, subdomínio ou domínio já em uso',
  })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os tenants' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tenants retornada com sucesso',
  })
  findAll() {
    return this.tenantService.findAll();
  }

  @Get('brands')
  @ApiOperation({ summary: 'Listar todas as marcas disponíveis' })
  @ApiResponse({
    status: 200,
    description: 'Lista de marcas retornada com sucesso',
  })
  getAllBrands() {
    return this.tenantService.getAllBrands();
  }

  @Get('segments')
  @ApiOperation({ summary: 'Listar todos os segmentos disponíveis' })
  @ApiResponse({
    status: 200,
    description: 'Lista de segmentos retornada com sucesso',
  })
  getAllSegments() {
    return this.tenantService.getAllSegments();
  }

  @Get('by-brand/:brand')
  @ApiOperation({ summary: 'Buscar tenants por marca' })
  @ApiParam({ name: 'brand', description: 'Nome da marca' })
  @ApiResponse({
    status: 200,
    description: 'Tenants da marca encontrados',
  })
  findByBrand(@Param('brand') brand: string) {
    return this.tenantService.findByBrand(brand);
  }

  @Get('by-segment/:segment')
  @ApiOperation({ summary: 'Buscar tenants por segmento' })
  @ApiParam({ name: 'segment', description: 'Segmento' })
  @ApiResponse({
    status: 200,
    description: 'Tenants do segmento encontrados',
  })
  findBySegment(@Param('segment') segment: string) {
    return this.tenantService.findBySegment(segment as any);
  }

  @Get('franchises/:franchisorId')
  @ApiOperation({ summary: 'Buscar franquias de um franqueador' })
  @ApiParam({ name: 'franchisorId', description: 'ID do franqueador' })
  @ApiResponse({
    status: 200,
    description: 'Franquias encontradas',
  })
  @ApiResponse({
    status: 404,
    description: 'Franqueador não encontrado',
  })
  findFranchisesByFranchisor(@Param('franchisorId') franchisorId: string) {
    return this.tenantService.findFranchisesByFranchisor(franchisorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tenant por ID' })
  @ApiParam({ name: 'id', description: 'ID do tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Get('cnpj/:cnpj')
  @ApiOperation({ summary: 'Buscar tenant por CNPJ' })
  @ApiParam({ name: 'cnpj', description: 'CNPJ do tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant não encontrado',
  })
  findByCnpj(@Param('cnpj') cnpj: string) {
    return this.tenantService.findByCnpj(cnpj);
  }

  @Get('subdomain/:subdomain')
  @ApiOperation({ summary: 'Buscar tenant por subdomínio' })
  @ApiParam({ name: 'subdomain', description: 'Subdomínio do tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant não encontrado',
  })
  findBySubdomain(@Param('subdomain') subdomain: string) {
    return this.tenantService.findBySubdomain(subdomain);
  }

  @Get('domain/:domain')
  @ApiOperation({ summary: 'Buscar tenant por domínio' })
  @ApiParam({ name: 'domain', description: 'Domínio do tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant não encontrado',
  })
  findByDomain(@Param('domain') domain: string) {
    return this.tenantService.findByDomain(domain);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tenant' })
  @ApiParam({ name: 'id', description: 'ID do tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito de CNPJ, subdomínio ou domínio',
  })
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Ativar/desativar tenant' })
  @ApiParam({ name: 'id', description: 'ID do tenant' })
  @ApiResponse({
    status: 200,
    description: 'Status do tenant alterado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant não encontrado',
  })
  toggleActive(@Param('id') id: string) {
    return this.tenantService.toggleActive(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover tenant' })
  @ApiParam({ name: 'id', description: 'ID do tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Não é possível remover franqueador com franquias',
  })
  remove(@Param('id') id: string) {
    return this.tenantService.remove(id);
  }
}
