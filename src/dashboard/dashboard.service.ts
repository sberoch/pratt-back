import { Inject, Injectable } from '@nestjs/common';
import { count, eq, inArray } from 'drizzle-orm';
import { DrizzleProvider } from '../common/database/drizzle.module';
import { DrizzleDatabase } from '../common/database/types/drizzle';
import { Dashboard } from './dashboard.dto';
import { candidates } from '../common/database/schemas/candidate.schema';
import { vacancies } from '../common/database/schemas/vacancy.schema';
import { vacancyStatuses } from '../common/database/schemas/vacancystatus.schema';

const OPEN_STATUS_POSSIBLE_VALUES = ['Abierta', 'Abierto', 'Open'];

@Injectable()
export class DashboardService {
  constructor(@Inject(DrizzleProvider) private readonly db: DrizzleDatabase) {}

  async getDashboard(): Promise<Dashboard> {
    const activeCandidates = await this.db
      .select({
        count: count(candidates.id),
      })
      .from(candidates)
      .where(eq(candidates.deleted, false));

    const activeVacancies = await this.db
      .select({
        count: count(vacancies.id),
      })
      .from(vacancies)
      .fullJoin(vacancyStatuses, eq(vacancyStatuses.id, vacancies.statusId))
      .where(inArray(vacancyStatuses.name, OPEN_STATUS_POSSIBLE_VALUES));

    const dashboard: Dashboard = {
      activeCandidates: activeCandidates[0].count,
      activeVacancies: activeVacancies[0].count,
    };

    return dashboard;
  }
}
