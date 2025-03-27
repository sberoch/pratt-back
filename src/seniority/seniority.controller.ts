import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { SeniorityService } from './seniority.service';
import {
  CreateSeniorityDto,
  UpdateSeniorityDto,
  SeniorityQueryParams,
} from './seniority.dto';

@ApiTags('Seniorities')
@Controller('seniority')
export class SeniorityController {
  constructor(private readonly seniorityService: SeniorityService) {}

  @ApiOkResponse()
  @Get()
  async findAll(@Query() query: SeniorityQueryParams) {
    return this.seniorityService.findAll(query);
  }

  @ApiOkResponse()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.seniorityService.findOne(+id);
  }

  @ApiCreatedResponse()
  @Post()
  async create(@Body() createSeniorityDto: CreateSeniorityDto) {
    return this.seniorityService.create(createSeniorityDto);
  }

  @ApiOkResponse()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSeniorityDto: UpdateSeniorityDto,
  ) {
    return this.seniorityService.update(+id, updateSeniorityDto);
  }

  @ApiOkResponse()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.seniorityService.remove(+id);
  }
}
