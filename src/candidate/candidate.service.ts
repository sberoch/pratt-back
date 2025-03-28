import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  gte,
  ilike,
  lte,
  sql,
  SQL,
} from 'drizzle-orm';
import { areas } from 'src/common/database/schemas/area.schema';
import {
  Candidate,
  candidateAreas,
  candidateFilesRelation,
  candidateIndustries,
  candidates,
  candidateSeniorities,
} from 'src/common/database/schemas/candidate.schema';
import { candidateFiles } from 'src/common/database/schemas/candidatefile.schema';
import { candidateSources } from 'src/common/database/schemas/candidatesource.schema';
import { industries } from 'src/common/database/schemas/industry.schema';
import { seniorities } from 'src/common/database/schemas/seniority.schema';
import { DrizzleProvider } from '../common/database/drizzle.module';
import { DrizzleDatabase } from '../common/database/types/drizzle';
import { PaginatedResponse } from '../common/pagination/pagination.params';
import {
  buildPaginationQuery,
  paginatedResponse,
  PaginationQuery,
  withPagination,
} from '../common/pagination/pagination.utils';
import {
  CandidateQueryParams,
  CreateCandidateDto,
  UpdateCandidateDto,
} from './candidate.dto';

@Injectable()
export class CandidateService {
  constructor(@Inject(DrizzleProvider) private readonly db: DrizzleDatabase) {}

  async findAll(
    params: CandidateQueryParams,
  ): Promise<PaginatedResponse<Candidate>> {
    const paginationQuery = buildPaginationQuery(params);

    let itemsQuery = this.db
      .select({
        candidateId: candidates.id,
        name: candidates.name,
        image: candidates.image,
        dateOfBirth: candidates.dateOfBirth,
        gender: candidates.gender,
        shortDescription: candidates.shortDescription,
        email: candidates.email,
        linkedin: candidates.linkedin,
        address: candidates.address,
        documentNumber: candidates.documentNumber,
        phone: candidates.phone,
        stars: candidates.stars,
        blacklisted: candidates.blacklisted,
        source: candidateSources,
        seniorities: sql<string>`json_agg(distinct ${seniorities})`.as(
          'seniorities',
        ),

        areas: sql<string>`json_agg(distinct ${areas})`.as('areas'),
        industries: sql<string>`json_agg(distinct ${industries})`.as(
          'industries',
        ),
        files: sql<string>`json_agg(distinct ${candidateFiles})`.as('files'),
        deleted: candidates.deleted,
      })
      .from(candidates)
      // .where(eq(candidates.deleted, false))
      .leftJoin(candidateSources, eq(candidateSources.id, candidates.sourceId))
      .leftJoin(
        candidateSeniorities,
        eq(candidateSeniorities.candidateId, candidates.id),
      )
      .leftJoin(
        seniorities,
        eq(seniorities.id, candidateSeniorities.seniorityId),
      )
      .leftJoin(candidateAreas, eq(candidateAreas.candidateId, candidates.id))
      .leftJoin(areas, eq(areas.id, candidateAreas.areaId))
      .leftJoin(
        candidateIndustries,
        eq(candidateIndustries.candidateId, candidates.id),
      )
      .leftJoin(industries, eq(industries.id, candidateIndustries.industryId))
      .leftJoin(
        candidateFilesRelation,
        eq(candidateFilesRelation.candidateId, candidates.id),
      )
      .leftJoin(
        candidateFiles,
        eq(candidateFiles.id, candidateFilesRelation.fileId),
      )
      .groupBy(candidates.id, candidateSources.id)
      .$dynamic();

    itemsQuery = this.withFilters(itemsQuery, params);
    itemsQuery = this.withOrder(itemsQuery, paginationQuery);
    itemsQuery = withPagination(itemsQuery, paginationQuery);

    let countQuery = this.db.select({ count: count() }).from(candidates);
    countQuery = this.withFilters(countQuery, params);

    const [items, [{ count: totalItems }]] = await Promise.all([
      itemsQuery,
      countQuery,
    ]);

    const parsedItems = items.map((item) => ({
      id: item.candidateId,
      sourceId: item.source?.id || null,
      ...item,
      seniorities: Array.isArray(item.seniorities)
        ? item.seniorities.filter(Boolean)
        : [],
      areas: Array.isArray(item.areas) ? item.areas.filter(Boolean) : [],
      industries: Array.isArray(item.industries)
        ? item.industries.filter(Boolean)
        : [],
      files: Array.isArray(item.files) ? item.files.filter(Boolean) : [],
    }));

    return paginatedResponse(parsedItems, totalItems, paginationQuery);
  }

  async findOne(id: number) {
    const candidate = await this.db
      .select({
        candidateId: candidates.id,
        name: candidates.name,
        image: candidates.image,
        dateOfBirth: candidates.dateOfBirth,
        gender: candidates.gender,
        shortDescription: candidates.shortDescription,
        email: candidates.email,
        linkedin: candidates.linkedin,
        address: candidates.address,
        documentNumber: candidates.documentNumber,
        phone: candidates.phone,
        stars: candidates.stars,
        blacklisted: candidates.blacklisted,
        source: candidateSources,
        seniorities: sql<string>`json_agg(distinct ${seniorities})`.as(
          'seniorities',
        ),
        areas: sql<string>`json_agg(distinct ${areas})`.as('areas'),
        industries: sql<string>`json_agg(distinct ${industries})`.as(
          'industries',
        ),
        files: sql<string>`json_agg(distinct ${candidateFiles})`.as('files'),
      })
      .from(candidates)
      .leftJoin(candidateSources, eq(candidateSources.id, candidates.sourceId))
      .leftJoin(
        candidateSeniorities,
        eq(candidateSeniorities.candidateId, candidates.id),
      )
      .leftJoin(
        seniorities,
        eq(seniorities.id, candidateSeniorities.seniorityId),
      )
      .leftJoin(candidateAreas, eq(candidateAreas.candidateId, candidates.id))
      .leftJoin(areas, eq(areas.id, candidateAreas.areaId))
      .leftJoin(
        candidateIndustries,
        eq(candidateIndustries.candidateId, candidates.id),
      )
      .leftJoin(industries, eq(industries.id, candidateIndustries.industryId))
      .leftJoin(
        candidateFilesRelation,
        eq(candidateFilesRelation.candidateId, candidates.id),
      )
      .leftJoin(
        candidateFiles,
        eq(candidateFiles.id, candidateFilesRelation.fileId),
      )
      .where(and(eq(candidates.id, id), eq(candidates.deleted, false)))
      .groupBy(candidates.id, candidateSources.id)
      .limit(1);

    if (!candidate.length) throw new NotFoundException('Not found');

    return {
      ...candidate[0],
      sourceId: candidate[0].source?.id || null,
      seniorities: Array.isArray(candidate[0].seniorities)
        ? candidate[0].seniorities.filter(Boolean)
        : [],
      areas: Array.isArray(candidate[0].areas)
        ? candidate[0].areas.filter(Boolean)
        : [],
      industries: Array.isArray(candidate[0].industries)
        ? candidate[0].industries.filter(Boolean)
        : [],
      files: Array.isArray(candidate[0].files)
        ? candidate[0].files.filter(Boolean)
        : [],
    };
  }

  async create(createCandidateDto: CreateCandidateDto) {
    return this.db.transaction(async (tx) => {
      const [candidate] = await tx
        .insert(candidates)
        .values({
          ...createCandidateDto,
        })
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
  private withOrder(qb: any, query: PaginationQuery) {
    const orderBy =
      query.order.direction === 'asc'
        ? asc(candidates[query.order.key])
        : desc(candidates[query.order.key]);
    return qb.orderBy(orderBy);
  }

  private withFilters(qb: any, query: CandidateQueryParams) {
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
    if (query.areaIds?.length) {
      filters.push(
        ...query.areaIds.map((areaId) =>
          exists(
            this.db
              .select()
              .from(candidateAreas)
              .where(
                and(
                  eq(candidateAreas.areaId, areaId),
                  eq(candidateAreas.candidateId, candidates.id),
                ),
              ),
          ),
        ),
      );
    }

    if (query.industryIds?.length) {
      filters.push(
        ...query.industryIds.map((industryId) =>
          exists(
            this.db
              .select()
              .from(candidateIndustries)
              .where(
                and(
                  eq(candidateIndustries.industryId, industryId),
                  eq(candidateIndustries.candidateId, candidates.id),
                ),
              ),
          ),
        ),
      );
    }

    if (query.fileIds?.length) {
      filters.push(
        ...query.fileIds.map((fileId) =>
          exists(
            this.db
              .select()
              .from(candidateFilesRelation)
              .where(
                and(
                  eq(candidateFilesRelation.fileId, fileId),
                  eq(candidateFilesRelation.candidateId, candidates.id),
                ),
              ),
          ),
        ),
      );
    }

    if (query.seniorityIds && query.seniorityIds?.length) {
      filters.push(
        ...query.seniorityIds.map((seniorityId) =>
          exists(
            this.db
              .select()
              .from(candidateSeniorities)
              .where(
                and(
                  eq(candidateSeniorities.seniorityId, seniorityId),
                  eq(candidateSeniorities.candidateId, candidates.id),
                ),
              ),
          ),
        ),
      );
    }

    if (query.deleted) {
      filters.push(eq(candidates.deleted, query.deleted));
    } else {
      filters.push(eq(candidates.deleted, false));
    }

    return qb.where(and(...filters));
  }
}
