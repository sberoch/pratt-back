import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  SQL,
} from 'drizzle-orm';
import { Area } from 'src/common/database/schemas/area.schema';
import {
  Candidate,
  candidateAreas,
  candidateFilesRelation,
  candidateIndustries,
  candidates,
  candidateSeniorities,
} from 'src/common/database/schemas/candidate.schema';
import { CandidateFile } from 'src/common/database/schemas/candidatefile.schema';
import { CandidateSource } from 'src/common/database/schemas/candidatesource.schema';
import { Industry } from 'src/common/database/schemas/industry.schema';
import { Seniority } from 'src/common/database/schemas/seniority.schema';
import { DrizzleProvider } from '../common/database/drizzle.module';
import { DrizzleDatabase } from '../common/database/types/drizzle';
import { PaginatedResponse } from '../common/pagination/pagination.params';
import {
  buildPaginationQuery,
  paginatedResponse,
} from '../common/pagination/pagination.utils';
import {
  CandidateQueryParams,
  CreateCandidateDto,
  UpdateCandidateDto,
} from './candidate.dto';

type CandidateQueryResult = Candidate & {
  source: CandidateSource;
  candidateAreas: Array<{ area: Area }>;
  candidateIndustries: Array<{ industry: Industry }>;
  candidateSeniorities: Array<{ seniority: Seniority }>;
  candidateFilesRelation: Array<{ file: CandidateFile }>;
};

export type CandidateApiResponse = Omit<Candidate, 'deleted'> & {
  source: CandidateSource;
  areas: Area[];
  industries: Industry[];
  seniorities: Seniority[];
  files: CandidateFile[];
};

@Injectable()
export class CandidateService {
  constructor(@Inject(DrizzleProvider) private readonly db: DrizzleDatabase) {}

  async findAll(
    params: CandidateQueryParams,
  ): Promise<PaginatedResponse<CandidateApiResponse>> {
    const paginationQuery = buildPaginationQuery(params);
    const whereClause = this.buildWhereClause(params);
    const orderClause = this.buildOrderBy(params);

    const itemsQuery = this.db.query.candidates.findMany({
      where: whereClause,
      orderBy: orderClause,
      limit: paginationQuery.limit,
      offset: paginationQuery.offset,
      with: {
        source: true,
        candidateAreas: { with: { area: true } },
        candidateIndustries: { with: { industry: true } },
        candidateSeniorities: { with: { seniority: true } },
        candidateFilesRelation: { with: { file: true } },
      },
    });

    const countQuery = this.db
      .select({ count: count(candidates.id) })
      .from(candidates)
      .where(whereClause);

    const [items, [{ count: totalItems }]] = await Promise.all([
      itemsQuery,
      countQuery,
    ]);

    const parsedItems = items.map(this.transformQueryResult);
    return paginatedResponse(parsedItems, totalItems, paginationQuery);
  }

  async findOne(id: number) {
    const candidate = await this.db.query.candidates.findFirst({
      where: eq(candidates.id, id),
      with: {
        source: true,
        candidateAreas: { with: { area: true } },
        candidateIndustries: { with: { industry: true } },
        candidateSeniorities: { with: { seniority: true } },
        candidateFilesRelation: { with: { file: true } },
      },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    return this.transformQueryResult(candidate);
  }

  async create(createCandidateDto: CreateCandidateDto) {
    return this.db.transaction(async (tx) => {
      const [candidate] = await tx
        .insert(candidates)
        .values({ ...createCandidateDto })
        .returning();

      if (!candidate) throw new Error('Error creating candidate');

      if (createCandidateDto.areaIds?.length) {
        await tx.insert(candidateAreas).values(
          createCandidateDto.areaIds.map((areaId) => ({
            candidateId: candidate.id,
            areaId,
          })),
        );
      }

      if (createCandidateDto.industryIds?.length) {
        await tx.insert(candidateIndustries).values(
          createCandidateDto.industryIds.map((industryId) => ({
            candidateId: candidate.id,
            industryId,
          })),
        );
      }

      if (createCandidateDto.seniorityIds?.length) {
        await tx.insert(candidateSeniorities).values(
          createCandidateDto.seniorityIds.map((seniorityId) => ({
            candidateId: candidate.id,
            seniorityId,
          })),
        );
      }

      if (createCandidateDto.fileIds?.length) {
        await tx.insert(candidateFilesRelation).values(
          createCandidateDto.fileIds.map((fileId) => ({
            candidateId: candidate.id,
            fileId,
          })),
        );
      }

      return candidate;
    });
  }

  async update(id: number, updateCandidateDto: UpdateCandidateDto) {
    const [candidate] = await this.db
      .update(candidates)
      .set(updateCandidateDto)
      .where(eq(candidates.id, id))
      .returning();
    return candidate;
  }

  async remove(id: number) {
    const [candidate] = await this.db
      .update(candidates)
      .set({
        deleted: true,
      } as Partial<Candidate>)
      .where(eq(candidates.id, id))
      .returning();
    return candidate;
  }

  /**
   * Helper methods for query building
   * These methods handle filtering, ordering, and pagination of post queries
   */

  private transformQueryResult(
    result: CandidateQueryResult,
  ): CandidateApiResponse {
    const {
      candidateAreas,
      candidateIndustries,
      candidateSeniorities,
      candidateFilesRelation,
      source,
      ...rest
    } = result;
    return {
      ...rest,
      source: result.source,
      areas: result.candidateAreas.map((ca) => ca.area).filter(Boolean), // Extract area and filter nulls if any join issue
      industries: result.candidateIndustries
        .map((ci) => ci.industry)
        .filter(Boolean),
      seniorities: result.candidateSeniorities
        .map((cs) => cs.seniority)
        .filter(Boolean),
      files: result.candidateFilesRelation
        .map((cfj) => cfj.file)
        .filter(Boolean),
    };
  }

  private buildOrderBy(params: CandidateQueryParams): SQL[] {
    const [sortBy, sortOrderString] = params.order?.split(':') || ['id', 'asc'];
    const sortOrder = sortOrderString?.toLowerCase() === 'desc' ? desc : asc;
    // Basic safety check: ensure sortBy is a valid column key
    const column = candidates[sortBy];
    if (column) {
      return [sortOrder(column)];
    }
    throw new BadRequestException('Invalid sortBy parameter');
  }

  private buildWhereClause(query: CandidateQueryParams) {
    const filters: SQL[] = [];
    if (query.id) {
      filters.push(eq(candidates.id, query.id));
    }
    if (query.name) {
      filters.push(ilike(candidates.name, `%${query.name}%`));
    }
    if (query.gender) {
      filters.push(ilike(candidates.gender, `%${query.gender}%`));
    }
    if (query.shortDescription) {
      filters.push(
        ilike(candidates.shortDescription, `%${query.shortDescription}%`),
      );
    }
    if (query.email) {
      filters.push(ilike(candidates.email, `%${query.email}%`));
    }
    if (query.linkedin) {
      filters.push(ilike(candidates.linkedin, `%${query.linkedin}%`));
    }
    if (query.address) {
      filters.push(ilike(candidates.address, `%${query.address}%`));
    }
    if (query.documentNumber) {
      filters.push(
        ilike(candidates.documentNumber, `%${query.documentNumber}%`),
      );
    }
    if (query.phone) {
      filters.push(ilike(candidates.phone, `%${query.phone}%`));
    }
    if (query.minimumStars) {
      filters.push(gte(candidates.stars, String(query.minimumStars)));
    }
    if (query.maximumStars) {
      filters.push(lte(candidates.stars, String(query.maximumStars)));
    }
    if (query.blacklisted) {
      filters.push(eq(candidates.blacklisted, query.blacklisted));
    }
    if (query.sourceId) {
      filters.push(eq(candidates.sourceId, query.sourceId));
    }

    // Add filters for areaIds, industryIds, and seniorityIds
    if (query.areaIds && query.areaIds.length > 0) {
      const areaSubquery = this.db
        .select({ candidateId: candidateAreas.candidateId })
        .from(candidateAreas)
        .where(inArray(candidateAreas.areaId, query.areaIds))
        .as('area_subquery');

      filters.push(
        inArray(
          candidates.id,
          this.db.select({ id: areaSubquery.candidateId }).from(areaSubquery),
        ),
      );
    }

    if (query.industryIds && query.industryIds.length > 0) {
      const industrySubquery = this.db
        .select({ candidateId: candidateIndustries.candidateId })
        .from(candidateIndustries)
        .where(inArray(candidateIndustries.industryId, query.industryIds))
        .as('industry_subquery');

      filters.push(
        inArray(
          candidates.id,
          this.db
            .select({ id: industrySubquery.candidateId })
            .from(industrySubquery),
        ),
      );
    }

    if (query.seniorityIds && query.seniorityIds.length > 0) {
      const senioritySubquery = this.db
        .select({ candidateId: candidateSeniorities.candidateId })
        .from(candidateSeniorities)
        .where(inArray(candidateSeniorities.seniorityId, query.seniorityIds))
        .as('seniority_subquery');

      filters.push(
        inArray(
          candidates.id,
          this.db
            .select({ id: senioritySubquery.candidateId })
            .from(senioritySubquery),
        ),
      );
    }

    if (query.deleted) {
      filters.push(eq(candidates.deleted, query.deleted));
    } else {
      filters.push(eq(candidates.deleted, false));
    }

    return filters.length > 0 ? and(...filters) : undefined;
  }
}
