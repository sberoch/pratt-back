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
import { IndustryService } from './industry.service';
import {
  CreateIndustryDto,
  UpdateIndustryDto,
  IndustryQueryParams,
} from './industry.dto';

@ApiTags('Industries')
@Controller('industry')
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  @ApiOkResponse()
  @Get()
  async findAll(@Query() query: IndustryQueryParams) {
    return this.industryService.findAll(query);
  }

  @ApiOkResponse()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.industryService.findOne(+id);
  }

  @ApiCreatedResponse()
  @Post()
  async create(@Body() createIndustryDto: CreateIndustryDto) {
    return this.industryService.create(createIndustryDto);
  }

  @ApiOkResponse()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIndustryDto: UpdateIndustryDto,
  ) {
    return this.industryService.update(+id, updateIndustryDto);
  }

  @ApiOkResponse()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.industryService.remove(+id);
  }
}
