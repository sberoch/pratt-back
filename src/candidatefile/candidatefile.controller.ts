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
import { CandidateFileService } from './candidatefile.service';
import {
  CreateCandidateFileDto,
  UpdateCandidateFileDto,
  CandidateFileQueryParams,
} from './candidatefile.dto';

@ApiTags('CandidateFiles')
@Controller('candidatefile')
export class CandidateFileController {
  constructor(private readonly candidateFileService: CandidateFileService) {}

  @ApiOkResponse()
  @Get()
  async findAll(@Query() query: CandidateFileQueryParams) {
    return this.candidateFileService.findAll(query);
  }

  @ApiOkResponse()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.candidateFileService.findOne(+id);
  }

  @ApiCreatedResponse()
  @Post()
  async create(@Body() createCandidateFileDto: CreateCandidateFileDto) {
    return this.candidateFileService.create(createCandidateFileDto);
  }

  @ApiOkResponse()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCandidateFileDto: UpdateCandidateFileDto,
  ) {
    return this.candidateFileService.update(+id, updateCandidateFileDto);
  }

  @ApiOkResponse()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.candidateFileService.remove(+id);
  }
}
