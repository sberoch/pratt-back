# Manual del Desarrollador - Sistema de Gestión de Reclutamiento

## Índice
1. [Introducción](#introducción)
2. [Configuración del Entorno](#configuración-del-entorno)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Modelos de Datos](#modelos-de-datos)
5. [Módulos Principales](#módulos-principales)
6. [API y Endpoints](#api-y-endpoints)
7. [Guía de Desarrollo](#guía-de-desarrollo)
8. [Comandos y Scripts](#comandos-y-scripts)
9. [Deployment](#deployment)

## Introducción

Este proyecto es un **Sistema de Gestión de Reclutamiento** desarrollado con **NestJS**, **PostgreSQL** y **Drizzle ORM**. El sistema permite gestionar candidatos, vacantes, empresas y el proceso de reclutamiento completo.

### Tecnologías Principales
- **Backend**: NestJS (Node.js + TypeScript)
- **Base de Datos**: PostgreSQL 15.1
- **ORM**: Drizzle ORM
- **Autenticación**: JWT con Passport.js
- **Documentación**: Swagger/OpenAPI
- **Containerización**: Docker & Docker Compose
- **Seguridad**: Helmet, CORS
- **Testing**: Jest

### Funcionalidades Principales
- Gestión completa de candidatos con archivos y fuentes
- Administración de vacantes con filtros avanzados
- Sistema de empresas con industrias y áreas
- Autenticación y autorización por roles
- Dashboard con métricas y estadísticas
- Sistema de comentarios y blacklist
- API REST documentada con Swagger

## Configuración del Entorno

### Prerrequisitos
- Node.js (versión 18 o superior)
- Docker y Docker Compose
- Git

### Instalación Inicial

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd pratt/back
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear archivo `.env` en la raíz del proyecto:
   ```env
   # Base de datos
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=pratt_db
   DB_PORT=5432
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/pratt_db
   
   # Servidor
   SERVER_PORT=5000
   
   # JWT
   JWT_SECRET=your_very_secure_jwt_secret_key
   ```

4. **Inicializar base de datos y aplicación**
   ```bash
   # Primera vez - construir contenedores
   docker compose up --build
   
   # Ejecutar migraciones
   npm run db:migrate
   ```

### Comandos de Desarrollo

```bash
# Desarrollo con hot reload
npm run start:dev

# Modo debug
npm run start:debug

# Producción
npm run build
npm run start:prod

# Base de datos
npm run db:generate    # Generar migraciones
npm run db:migrate     # Ejecutar migraciones

# Testing
npm run test           # Tests unitarios
npm run test:watch     # Tests en modo watch
npm run test:e2e       # Tests end-to-end
npm run test:cov       # Coverage

# Linting y formato
npm run lint           # ESLint con corrección automática
npm run format         # Prettier
```

## Arquitectura del Sistema

### Estructura de Directorios

```
src/
├── app.module.ts              # Módulo principal
├── main.ts                    # Bootstrap de la aplicación
├── auth/                      # Autenticación y autorización
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── jwt/                   # Estrategia JWT
│   ├── local/                 # Estrategia local
│   └── roles/                 # Guards de roles
├── common/                    # Utilidades compartidas
│   ├── database/              # Configuración BD y esquemas
│   │   ├── drizzle.module.ts
│   │   ├── schemas/           # Esquemas Drizzle
│   │   └── types/
│   ├── pagination/            # Utilidades de paginación
│   ├── loader/                # Carga de datos inicial
│   └── logger/                # Middleware de logging
├── candidate/                 # Gestión de candidatos
├── vacancy/                   # Gestión de vacantes
├── company/                   # Gestión de empresas
├── user/                      # Gestión de usuarios
├── dashboard/                 # Dashboard y métricas
├── seed/                      # Datos de prueba
└── [otros módulos]/
```

### Patrones de Arquitectura

#### 1. **Patrón de Módulos NestJS**
Cada funcionalidad está organizada en módulos independientes:
```typescript
@Module({
  imports: [DrizzleModule],
  controllers: [CandidateController],
  providers: [CandidateService],
  exports: [CandidateService],
})
export class CandidateModule {}
```

#### 2. **Arquitectura por Capas**
- **Controller**: Maneja HTTP requests/responses
- **Service**: Lógica de negocio
- **Repository/Schema**: Acceso a datos con Drizzle ORM

#### 3. **Dependency Injection**
NestJS maneja automáticamente las dependencias entre servicios.

### Sistema de Autenticación

#### Roles de Usuario
```typescript
enum UserRole {
  ADMIN = 'ADMIN',        // Acceso total
  MANAGER = 'MANAGER',    // Gestión operativa
  BASIC = 'BASIC'         // Acceso limitado
}
```

#### Guards y Decoradores
- `@UseGuards(JwtAuthGuard)`: Protege rutas con JWT
- `@UseGuards(RolesGuard)`: Control de acceso por roles
- `@Roles(UserRole.ADMIN)`: Especifica roles requeridos

#### Flujo de Autenticación
1. Login con email/password → `auth/local.strategy.ts:13`
2. Generación de JWT token → `auth/auth.service.ts:23`
3. Validación en cada request → `auth/jwt/jwt.strategy.ts`
4. Actualización de último login → `auth/auth.service.ts:16`

## Modelos de Datos

### Esquema Principal de Base de Datos

#### Users (Usuarios)
```sql
users {
  id: serial PRIMARY KEY
  email: text UNIQUE NOT NULL
  password: text NOT NULL
  name: text NOT NULL
  active: boolean DEFAULT true
  role: enum(ADMIN, MANAGER, BASIC)
  last_login: timestamp
  created_at: timestamp DEFAULT NOW()
}
```

#### Candidates (Candidatos)
```sql
candidates {
  id: serial PRIMARY KEY
  name: text UNIQUE NOT NULL
  image: text
  date_of_birth: date
  gender: text
  short_description: text
  email: text NOT NULL
  linkedin: text
  address: text
  phone: text
  deleted: boolean DEFAULT false
  source_id: integer → candidate_sources.id
  stars: numeric
  is_in_company_via_pratt: boolean
  countries: text[]
  provinces: text[]
  languages: text[]
  created_at: timestamp DEFAULT NOW()
  updated_at: timestamp DEFAULT NOW()
}
```

#### Vacancies (Vacantes)
```sql
vacancies {
  id: serial PRIMARY KEY
  title: text NOT NULL
  description: text NOT NULL
  status_id: integer → vacancy_statuses.id
  vacancy_filters_id: integer → vacancy_filters.id
  company_id: integer → companies.id
  created_by: integer → users.id
  assigned_to: integer → users.id
  created_at: timestamp DEFAULT NOW()
  updated_at: timestamp DEFAULT NOW()
}
```

#### Companies (Empresas)
```sql
companies {
  id: serial PRIMARY KEY
  name: text UNIQUE NOT NULL
  description: text
  website: text
  email: text
  phone: text
  address: text
  status: enum(ACTIVE, INACTIVE, PROSPECT)
  created_at: timestamp DEFAULT NOW()
  updated_at: timestamp DEFAULT NOW()
}
```

### Relaciones Importantes

#### Tablas de Relación Many-to-Many
- `candidate_areas`: Candidato ↔ Áreas de trabajo
- `candidate_industries`: Candidato ↔ Industrias
- `candidate_seniorities`: Candidato ↔ Niveles de seniority
- `candidate_candidate_files`: Candidato ↔ Archivos
- `candidate_vacancies`: Candidato ↔ Vacante (con estado)

#### Tablas de Soporte
- `areas`: Áreas de trabajo (Frontend, Backend, etc.)
- `industries`: Industrias (Tecnología, Finanzas, etc.)
- `seniorities`: Niveles (Junior, Semi-Senior, Senior)
- `candidate_sources`: Fuentes de candidatos (LinkedIn, etc.)
- `vacancy_statuses`: Estados de vacantes (Abierta, Cerrada)
- `candidate_vacancy_statuses`: Estados candidato-vacante

## Módulos Principales

### 1. Módulo de Autenticación (`auth/`)

**Archivos principales:**
- `auth.service.ts`: Validación de usuarios y generación de JWT
- `jwt.strategy.ts`: Estrategia de autenticación JWT
- `local.strategy.ts`: Estrategia de login local
- `roles.guard.ts`: Control de acceso por roles

**Endpoints principales:**
```
POST /api/v1/auth/login    # Login con email/password
```

**Ejemplo de uso:**
```typescript
// Login
POST /api/v1/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}

// Respuesta
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Módulo de Candidatos (`candidate/`)

**Funcionalidades:**
- CRUD completo de candidatos
- Filtros avanzados (edad, género, ubicación, skills)
- Gestión de archivos asociados
- Sistema de valoración (estrellas)
- Control de candidatos en blacklist

**Endpoints principales:**
```
GET    /api/v1/candidate           # Listar con filtros
GET    /api/v1/candidate/:id       # Obtener por ID
POST   /api/v1/candidate           # Crear candidato
PATCH  /api/v1/candidate/:id       # Actualizar
DELETE /api/v1/candidate/:id       # Eliminar (soft delete)
GET    /api/v1/candidate/exists    # Verificar si existe por nombre
```

**Ejemplo de creación:**
```typescript
POST /api/v1/candidate
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "gender": "Masculino",
  "sourceId": 1,
  "seniorityIds": [2],
  "areaIds": [1, 3],
  "industryIds": [1],
  "fileIds": [],
  "stars": 4.5,
  "isInCompanyViaPratt": false,
  "countries": ["Argentina"],
  "provinces": ["Buenos Aires"],
  "languages": ["Español", "Inglés"]
}
```

### 3. Módulo de Vacantes (`vacancy/`)

**Funcionalidades:**
- Gestión completa de ofertas laborales
- Asignación a recruiters
- Filtros de búsqueda de candidatos
- Estados de vacante
- Relación con empresas

**Endpoints principales:**
```
GET    /api/v1/vacancy        # Listar vacantes
GET    /api/v1/vacancy/:id    # Obtener vacante
POST   /api/v1/vacancy        # Crear vacante
PATCH  /api/v1/vacancy/:id    # Actualizar
DELETE /api/v1/vacancy/:id    # Eliminar
```

### 4. Módulo de Empresas (`company/`)

**Funcionalidades:**
- Gestión de empresas cliente
- Estados (ACTIVE, INACTIVE, PROSPECT)
- Información de contacto
- Relación con vacantes

**Estados disponibles:**
```typescript
// src/company/company.status.ts:1
enum CompanyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PROSPECT = 'PROSPECT'
}
```

### 5. Módulo de Dashboard (`dashboard/`)

**Funcionalidades:**
- Métricas del sistema
- Estadísticas de candidatos y vacantes
- Reportes de rendimiento

### 6. Módulos de Soporte

- **Area**: Áreas de trabajo
- **Industry**: Industrias
- **Seniority**: Niveles de experiencia
- **CandidateSource**: Fuentes de candidatos
- **CandidateFile**: Gestión de archivos
- **Comment**: Sistema de comentarios
- **Blacklist**: Lista de candidatos bloqueados

## API y Endpoints

### Documentación Swagger

La API está completamente documentada con Swagger/OpenAPI:
- **URL Local**: `http://localhost:5000/docs`
- **Configuración**: `src/main.ts:14-21`

### Estructura de Respuestas

#### Respuestas Exitosas
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Respuestas de Error
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Autenticación en Requests

Todas las rutas (excepto login) requieren header de autorización:
```http
Authorization: Bearer [JWT_TOKEN]
```

### Paginación

Los endpoints de listado soportan paginación:
```
GET /api/v1/candidate?page=1&limit=10&orderBy=createdAt&orderDirection=desc
```

**Parámetros de paginación:**
- `page`: Página actual (default: 1)
- `limit`: Elementos por página (default: 10)
- `orderBy`: Campo para ordenar
- `orderDirection`: 'asc' o 'desc'

### Validaciones con DTOs

Todos los endpoints utilizan DTOs para validación:

```typescript
// Ejemplo: CreateCandidateDto
export class CreateCandidateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsArray()
  @IsInt({ each: true })
  seniorityIds: number[];
}
```

## Guía de Desarrollo

### Agregar un Nuevo Módulo

1. **Generar módulo con CLI de NestJS:**
   ```bash
   nest generate module nuevo-modulo
   nest generate controller nuevo-modulo
   nest generate service nuevo-modulo
   ```

2. **Crear esquema de base de datos:**
   ```typescript
   // src/common/database/schemas/nuevo-modulo.schema.ts
   export const nuevoModulos = pgTable('nuevo_modulos', {
     id: serial('id').primaryKey(),
     name: text('name').notNull(),
     createdAt: timestamp('created_at').defaultNow(),
   });
   ```

3. **Crear DTOs:**
   ```typescript
   // src/nuevo-modulo/nuevo-modulo.dto.ts
   export class CreateNuevoModuloDto {
     @IsString()
     @IsNotEmpty()
     name: string;
   }
   ```

4. **Implementar servicio:**
   ```typescript
   @Injectable()
   export class NuevoModuloService {
     constructor(@Inject(DATABASE) private db: DrizzleDB) {}

     async create(createDto: CreateNuevoModuloDto) {
       return this.db.insert(nuevoModulos).values(createDto);
     }
   }
   ```

5. **Configurar controlador:**
   ```typescript
   @Controller('nuevo-modulo')
   @UseGuards(RolesGuard)
   export class NuevoModuloController {
     // Endpoints aquí
   }
   ```

6. **Registrar en AppModule:**
   ```typescript
   // src/app.module.ts
   imports: [..., NuevoModuloModule]
   ```

### Mejores Prácticas

#### 1. **Estructura de Archivos**
```
modulo/
├── modulo.module.ts      # Configuración del módulo
├── modulo.controller.ts  # Endpoints HTTP
├── modulo.service.ts     # Lógica de negocio
├── modulo.dto.ts        # Validaciones y tipos
└── tests/
    ├── modulo.controller.spec.ts
    └── modulo.service.spec.ts
```

#### 2. **Convenciones de Nomenclatura**
- Archivos: `kebab-case.type.ts`
- Clases: `PascalCase`
- Variables/funciones: `camelCase`
- Constantes: `UPPER_CASE`
- Tablas BD: `snake_case`

#### 3. **Manejo de Errores**
```typescript
// Usar excepciones específicas de NestJS
if (!entity) {
  throw new NotFoundException('Entidad no encontrada');
}

if (invalidData) {
  throw new BadRequestException('Datos inválidos');
}
```

#### 4. **Logs y Debugging**
El sistema incluye middleware de logging en `src/common/logger/logger.middleware.ts` que registra todas las requests.

#### 5. **Testing**
```typescript
// Ejemplo de test unitario
describe('CandidateService', () => {
  let service: CandidateService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CandidateService, mockDatabase],
    }).compile();

    service = module.get<CandidateService>(CandidateService);
  });

  it('should create candidate', async () => {
    const result = await service.create(mockCreateDto);
    expect(result).toBeDefined();
  });
});
```

### Base de Datos y Migraciones

#### Generar Nueva Migración
```bash
# 1. Modificar esquema en src/common/database/schemas/
# 2. Generar migración
npm run db:generate

# 3. Aplicar migración
npm run db:migrate
```

#### Conexión a Base de Datos
```typescript
// Configuración en src/common/database/drizzle.module.ts
const DATABASE = Symbol('DATABASE');

@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: async () => {
        const client = new Client({
          connectionString: process.env.DATABASE_URL,
        });
        await client.connect();
        return drizzle(client);
      },
    },
  ],
  exports: [DATABASE],
})
export class DrizzleModule {}
```

#### Usar en Servicios
```typescript
@Injectable()
export class CandidateService {
  constructor(@Inject(DATABASE) private db: DrizzleDB) {}

  async findAll() {
    return this.db.select().from(candidates);
  }
}
```

## Comandos y Scripts

### Scripts Disponibles (package.json)

#### Desarrollo
```bash
npm run start:dev     # Servidor desarrollo con hot reload
npm run start:debug   # Modo debug (puerto 9229)
npm run start         # Inicio normal
npm run start:prod    # Producción (requiere build)
```

#### Build y Deploy
```bash
npm run prebuild      # Limpia dist/
npm run build         # Compila TypeScript
```

#### Testing
```bash
npm run test          # Tests unitarios
npm run test:watch    # Tests en modo watch
npm run test:cov      # Tests con coverage
npm run test:e2e      # Tests end-to-end
npm run ci:test       # Tests para CI/CD
npm run test:debug    # Debug de tests
```

#### Calidad de Código
```bash
npm run lint          # ESLint con auto-fix
npm run format        # Prettier formatting
```

#### Base de Datos
```bash
npm run db:generate   # Generar migraciones Drizzle
npm run db:migrate    # Ejecutar migraciones
```

### Scripts de Docker

```bash
# Primera vez - build completo
docker compose up --build

# Desarrollo normal
docker compose up

# Solo base de datos
docker compose up postgres

# Logs en tiempo real
docker compose logs -f

# Reconstruir solo app
docker compose up --build main
```

## Deployment

### Variables de Entorno de Producción

```env
# Base de datos
DATABASE_URL=postgresql://user:pass@host:5432/db

# Servidor
SERVER_PORT=5000
NODE_ENV=production

# Seguridad
JWT_SECRET=your-super-secure-jwt-secret-256-bits

# Opcional: Configuraciones adicionales
CORS_ORIGINS=https://yourdomain.com
LOG_LEVEL=info
```

### Build de Producción

```bash
# 1. Instalar dependencias
npm ci --only=production

# 2. Build
npm run build

# 3. Ejecutar migraciones
npm run db:migrate

# 4. Iniciar aplicación
npm run start:prod
```

### Docker en Producción

```dockerfile
# Dockerfile optimizado para producción
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 5000
CMD ["npm", "run", "start:prod"]
```

### Health Checks

La aplicación expone un endpoint de salud:
```
GET /api/v1/health
```

### Consideraciones de Seguridad

1. **Variables de Entorno**: Nunca commitear archivos `.env`
2. **JWT Secret**: Usar claves seguras (mínimo 256 bits)
3. **Base de Datos**: Conexiones SSL en producción
4. **CORS**: Configurar dominios específicos
5. **Rate Limiting**: Considerar implementar para APIs públicas

### Monitoreo y Logs

- Los logs se muestran en formato JSON en producción
- Implementar herramientas como Winston para logs avanzados
- Configurar alertas para errores críticos
- Monitorear performance de base de datos

---

## Recursos Adicionales

- **NestJS Documentation**: https://docs.nestjs.com/
- **Drizzle ORM**: https://orm.drizzle.team/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Swagger/OpenAPI**: https://swagger.io/docs/

---

Este manual cubre los aspectos principales del sistema. Para consultas específicas o funcionalidades avanzadas, revisar el código fuente y la documentación de Swagger en `/docs`.