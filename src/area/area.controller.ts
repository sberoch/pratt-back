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
import { AreaService } from './area.service';
import { CreateAreaDto, UpdateAreaDto, AreaQueryParams } from './area.dto';

@ApiTags('Areas')
@Controller('area')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @ApiOkResponse()
  @Get()
  async findAll(@Query() query: AreaQueryParams) {
    return this.areaService.findAll(query);
  }

  @ApiOkResponse()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.areaService.findOne(+id);
  }

  @ApiCreatedResponse()
  @Post()
  async create(@Body() createAreaDto: CreateAreaDto) {
    return this.areaService.create(createAreaDto);
  }

  @ApiOkResponse()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
    return this.areaService.update(+id, updateAreaDto);
  }

  @ApiOkResponse()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.areaService.remove(+id);
  }
}
