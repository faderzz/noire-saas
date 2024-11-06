# Noire SaaS Platform - Next.js Technical Specification

## Technical Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **State Management**: 
  - React Context for global UI state
  - React Query for server state management
- **Styling**: 
  - Tailwind CSS
  - shadcn/ui for component library
  - CSS Modules for custom components
- **Forms**: React Hook Form with Zod validation
- **Charts/Visualizations**: 
  - Recharts for analytics
  - React DnD for Kanban boards
  - Gantt charts using custom implementation

### Backend
- **API**: Next.js API routes with Edge Runtime where applicable
- **Database**: 
  - PostgreSQL with Prisma ORM
  - Redis for caching and real-time features
- **Authentication**: 
  - Next-Auth with multiple providers
  - JWT for session management
- **File Storage**: Amazon S3 or similar
- **Email**: Resend for transactional emails
- **Search**: Elasticsearch or Meilisearch

### DevOps
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions
- **Domain Management**: Custom domains via Vercel
- **Monitoring**: 
  - Vercel Analytics
  - Sentry for error tracking
  - OpenTelemetry for performance monitoring

## Multi-tenancy Implementation

### Database Schema
```prisma
model Organization {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  customDomain  String?  @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  users         User[]
  clients       Client[]
  projects      Project[]
  subscriptionTier SubscriptionTier @relation(fields: [tierId], references: [id])
  tierId        String
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  role          Role     @default(USER)
  organizationId String
  organization  Organization @relation(fields: [organizationId], references: [id])
}
```

### Domain Routing
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')
  const { pathname } = request.nextUrl
  
  // Check custom domain or subdomain logic
  const organization = await prisma.organization.findFirst({
    where: {
      OR: [
        { customDomain: hostname },
        { slug: hostname?.split('.')[0] }
      ]
    }
  })
  
  // Routing logic based on organization
}
```

## Development Phases

### Phase 1: Foundation Setup
1. **Project Initialization**
   - Initialize Next.js 14 project with TypeScript
   - Configure ESLint and Prettier
   - Set up Git repository with conventional commits
   - Implement Tailwind CSS and shadcn/ui
   - Create base layout components
   - Set up test environment with Jest and Testing Library

2. **Database & Authentication**
   ```typescript
   // prisma/schema.prisma
   model User {
     id            String   @id @default(cuid())
     email         String   @unique
     name          String?
     organizations OrganizationMember[]
     createdAt     DateTime @default(now())
     updatedAt     DateTime @updatedAt
   }

   model Organization {
     id            String   @id @default(cuid())
     name          String
     slug          String   @unique
     members       OrganizationMember[]
     customDomain  String?  @unique
   }

   model OrganizationMember {
     id             String       @id @default(cuid())
     organization   Organization @relation(fields: [organizationId], references: [id])
     organizationId String
     user           User         @relation(fields: [userId], references: [id])
     userId         String
     role           Role         @default(MEMBER)
     
     @@unique([organizationId, userId])
   }
   ```
   - Set up Prisma ORM with initial schema
   - Configure NextAuth with email and OAuth providers
   - Implement session management
   - Create basic user model and migration
   - Set up database backup system

3. **Multi-tenancy Infrastructure**
   ```typescript
   // middleware.ts
   import { createMiddleware } from '@/lib/middleware'
   
   export const middleware = createMiddleware({
     // Match all paths except public ones
     matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
   
     async handler(req) {
       const hostname = req.headers.get('host')
       const subdomain = getSubdomain(hostname)
       
       // Handle routing based on subdomain/custom domain
       const organization = await getOrganization(subdomain)
       if (!organization) {
         return new Response('Organization not found', { status: 404 })
       }
       
       // Add organization to request context
       req.organization = organization
     }
   })
   ```
   - Implement domain/subdomain routing
   - Create middleware for organization context
   - Set up organization resolution
   - Implement custom domain handling

### Phase 2: Core Platform Features
1. **User Management System**
   - Build user invitation flow
   - Implement role-based access control
   - Create user settings pages
   - Add organization member management
   - Implement user preferences

2. **Organization Settings**
   ```typescript
   // app/[organization]/settings/page.tsx
   export default function OrganizationSettings() {
     const { organization } = useOrganization()
     const updateOrganization = useMutation({
       mutationFn: async (data: OrganizationUpdateData) => {
         return await updateOrganizationSettings(organization.id, data)
       }
     })
     
     return (
       <SettingsForm 
         defaultValues={organization}
         onSubmit={updateOrganization.mutate}
       />
     )
   }
   ```
   - Create organization profile management
   - Build billing settings
   - Implement team settings
   - Add integration settings
   - Create audit log viewer

3. **Dashboard & Navigation**
   - Build responsive dashboard layout
   - Implement sidebar navigation
   - Create overview statistics
   - Add quick action buttons
   - Implement breadcrumb navigation

### Phase 3: Financial Infrastructure
1. **Stripe Integration**
   - Set up Stripe Connect
   - Implement subscription management
   - Create webhook handlers
   - Add payment processing
   - Implement usage tracking

2. **Invoice System**
   ```typescript
   // lib/invoices/generator.ts
   export class InvoiceGenerator {
     async generate(data: InvoiceData) {
       // Create invoice in database
       const invoice = await prisma.invoice.create({
         data: {
           organizationId: data.organizationId,
           amount: data.amount,
           items: data.items,
           dueDate: data.dueDate
         }
       })
       
       // Generate PDF
       const pdf = await generateInvoicePDF(invoice)
       
       // Store in S3
       await uploadToS3(pdf, `invoices/${invoice.id}.pdf`)
       
       return invoice
     }
   }
   ```
   - Create invoice generation system
   - Implement invoice templates
   - Build invoice management interface
   - Add payment tracking
   - Create payment reminders

3. **Budget Tracking**
   - Implement expense categories
   - Create budget allocation system
   - Build financial reports
   - Add spending alerts
   - Create financial dashboard

### Phase 4: Project Infrastructure
1. **Project Management**
   - Create project CRUD operations
   - Implement project settings
   - Build project dashboard
   - Add project member management
   - Create project templates

2. **Task Management**
   ```typescript
   // components/KanbanBoard/Column.tsx
   export function KanbanColumn({ 
     columnId, 
     tasks 
   }: KanbanColumnProps) {
     return (
       <Droppable droppableId={columnId}>
         {(provided) => (
           <div
             ref={provided.innerRef}
             {...provided.droppableProps}
             className="kanban-column"
           >
             {tasks.map((task, index) => (
               <DraggableTask 
                 key={task.id} 
                 task={task} 
                 index={index} 
               />
             ))}
             {provided.placeholder}
           </div>
         )}
       </Droppable>
     )
   }
   ```
   - Build Kanban board
   - Implement task assignments
   - Create task templates
   - Add time tracking
   - Implement task dependencies

3. **Calendar & Scheduling**
   - Build calendar views
   - Implement event scheduling
   - Create recurring events
   - Add deadline tracking
   - Implement calendar sharing

### Phase 5: Client Portal
1. **Client Management**
   - Create client profiles
   - Build client onboarding flow
   - Implement client access controls
   - Add client communication system
   - Create client dashboard

2. **Document Management**
   ```typescript
   // lib/documents/signing.ts
   export class DocumentSigning {
     async createSigningRequest(document: Document) {
       const signingUrl = await generateSigningUrl(document)
       
       await prisma.signingRequest.create({
         data: {
           documentId: document.id,
           status: 'PENDING',
           expiresAt: addDays(new Date(), 7),
           url: signingUrl
         }
       })
       
       return signingUrl
     }
   }
   ```
   - Implement document storage
   - Build document signing
   - Create document templates
   - Add version control
   - Implement document sharing

3. **Support System**
   - Build ticket system
   - Create support dashboard
   - Implement knowledge base
   - Add ticket assignments
   - Create SLA monitoring

### Phase 6: Lead Management
1. **Lead System**
   - Create lead database
   - Implement lead scoring
   - Build lead nurturing
   - Add lead assignment
   - Create lead reporting

2. **Automation Engine**
   ```typescript
   // lib/automation/engine.ts
   export class AutomationEngine {
     private async executeStep(step: WorkflowStep, context: WorkflowContext) {
       switch (step.type) {
         case 'trigger':
           return this.handleTrigger(step, context)
         case 'condition':
           return this.evaluateCondition(step, context)
         case 'action':
           return this.executeAction(step, context)
         default:
           throw new Error(`Unknown step type: ${step.type}`)
       }
     }
   }
   ```
   - Build workflow engine
   - Implement action system
   - Create trigger handlers
   - Add condition evaluator
   - Implement workflow testing

3. **Integration Framework**
   - Create webhook system
   - Implement OAuth connections
   - Build API integration
   - Add event system
   - Create integration marketplace

### Phase 7: Analytics & Reporting
1. **Analytics System**
   - Implement event tracking
   - Create metrics collection
   - Build dashboard widgets
   - Add custom reports
   - Implement data export

2. **Monitoring & Optimization**
   ```typescript
   // lib/monitoring/performance.ts
   export class PerformanceMonitor {
     async trackMetrics(metric: PerformanceMetric) {
       await prisma.performanceLog.create({
         data: {
           metricName: metric.name,
           value: metric.value,
           timestamp: new Date(),
           metadata: metric.metadata
         }
       })
       
       // Check thresholds
       await this.checkAlertThresholds(metric)
     }
   }
   ```
   - Set up error tracking
   - Implement performance monitoring
   - Create health checks
   - Add usage analytics
   - Build admin dashboards

## Deployment Strategy

### Development Environment
- Local PostgreSQL database
- Local Redis instance
- Mocked S3 storage
- Stripe test mode

### Staging Environment
- Vercel Preview Deployments
- Staging database cluster
- Separate Redis instance
- Test S3 bucket

### Production Environment
- Vercel Production Deployment
- Production database cluster with replicas
- Distributed Redis cluster
- Production S3 bucket with CDN

## Performance Optimization
- Implement static page generation where possible
- Use React Suspense for code splitting
- Implement efficient caching strategies
- Optimize database queries
- Use Edge functions for global performance

## Security Measures
- Implement RBAC (Role-Based Access Control)
- Set up CSP (Content Security Policy)
- Configure rate limiting
- Implement audit logging
- Regular security scanning

Would you like me to expand on any particular phase or technical implementation? I can provide more detailed code examples or architecture diagrams for specific features.
