# Calendar & Chatbot Implementation Progress

**Last Updated:** 2026-02-09
**Implementation Strategy:** Option A - Calendar First

---

## ✅ Completed (Phase 1-3.1)

### Phase 1: Dependencies & Environment Setup
- [x] Installed `openai` (v6.18.0) and `chrono-node` (v2.9.0)
- [x] Added `OPENAI_API_KEY` to `.env.example`
- [x] Dependencies ready for both Calendar and Chatbot features

### Phase 2: Database Schema
- [x] Added `calendarEvents` table to `src/database/schema.ts`
- [x] Added `chatConversations` table (for future chatbot)
- [x] Added `chatMessages` table (for future chatbot)
- [x] Created indexes for performance optimization
- [x] Schema includes all required fields with proper types and constraints

**Note:** Database migrations pending - User needs to:
1. Create `.env` file from `.env.example`
2. Configure `DATABASE_URL` with PostgreSQL connection string
3. Run `npx drizzle-kit push` to apply schema changes

### Phase 3.1: Backend Implementation
- [x] **Natural Date Parser** (`src/lib/calendar/natural-date-parser.ts`)
  - Parses natural language dates using chrono-node
  - Examples: "tomorrow at 2pm", "next Monday", "3pm to 5pm"
  - Utility functions for date handling

- [x] **Calendar Utilities** (`src/lib/calendar/calendar-utils.ts`)
  - Calendar grid generation (42 days)
  - Date comparison and filtering functions
  - Event sorting and grouping
  - Category colors and badge styling
  - Date/time formatting utilities

- [x] **Form Validation Schema** (`src/lib/calendar/schema.ts`)
  - Zod schemas for form and API validation
  - Type-safe form data structures
  - Conversion utilities between form and API formats

- [x] **API Routes**
  - `GET /api/calendar/events` - Fetch all user events with optional date filtering
  - `POST /api/calendar/events` - Create new event
  - `GET /api/calendar/events/[eventId]` - Get specific event
  - `PUT /api/calendar/events/[eventId]` - Update event
  - `DELETE /api/calendar/events/[eventId]` - Delete event
  - All routes include authentication via Better Auth
  - Proper error handling and validation

---

## 🚧 In Progress / Remaining

### Phase 3.2: UI Components (Next Steps)

#### Components to Create:

1. **Event Form Component** (`src/components/calendar/event-form.tsx`)
   - React Hook Form integration
   - Zod validation
   - All event fields (title, dates, location, category, etc.)
   - Category selector with icons
   - Reminder and recurrence options

2. **Event Modal Component** (`src/components/calendar/event-modal.tsx`)
   - Uses existing `<Dialog>` from ui/dialog.tsx
   - Wraps event form
   - Create and edit modes
   - Delete confirmation

3. **Calendar Grid Component** (`src/components/calendar/calendar-grid.tsx`)
   - 7x6 grid (42 days)
   - Current month highlighting
   - Today indicator
   - Event dots on days with events
   - Click to view/create events

4. **Event Card Component** (`src/components/calendar/event-card.tsx`)
   - Display event details
   - Category badge
   - Click to edit
   - Time and duration display

5. **Upcoming Events List** (`src/components/calendar/upcoming-events-list.tsx`)
   - Sidebar widget
   - Shows next 10 events
   - Sorted by date
   - Quick actions (edit/delete)

### Phase 3.3: Page Integration

1. **Calendar Page** (`src/app/dashboard/calendar/page.tsx`)
   - Main calendar view
   - Month navigation
   - Event list sidebar
   - "Add Event" button
   - State management for current month

2. **Sidebar Navigation**
   - Add calendar icon and link to `src/components/layout/app-sidebar.tsx`
   - Proper active state highlighting

### Phase 3.4: Testing
- CRUD operations
- Date handling across timezones
- Responsive design (mobile/tablet/desktop)
- Natural language date parsing
- Form validation

---

## 📁 File Structure Created

```
src/
├── lib/
│   └── calendar/
│       ├── natural-date-parser.ts     ✅ Created
│       ├── calendar-utils.ts          ✅ Created
│       └── schema.ts                  ✅ Created
│
├── database/
│   └── schema.ts                      ✅ Updated (added calendar & chat tables)
│
├── app/
│   └── api/
│       └── calendar/
│           └── events/
│               ├── route.ts                    ✅ Created (GET/POST)
│               └── [eventId]/
│                   └── route.ts                ✅ Created (GET/PUT/DELETE)
│
└── components/
    └── calendar/                      📁 Created (empty - ready for components)
```

---

## 🎯 Next Actions

### Immediate Next Steps:

1. **Create Event Form Component**
   ```bash
   # Component with React Hook Form + Zod
   src/components/calendar/event-form.tsx
   ```

2. **Create Event Modal**
   ```bash
   # Wrapper using Dialog component
   src/components/calendar/event-modal.tsx
   ```

3. **Create Calendar Grid**
   ```bash
   # Main calendar display
   src/components/calendar/calendar-grid.tsx
   ```

4. **Create Calendar Page**
   ```bash
   # Main dashboard page
   src/app/dashboard/calendar/page.tsx
   ```

5. **Update Sidebar Navigation**
   ```bash
   # Add calendar link
   src/components/layout/app-sidebar.tsx
   ```

---

## 🔧 Technical Decisions Made

### Authentication
- Using Better Auth session-based authentication
- All API routes check for valid user session
- Events scoped to authenticated user via `userId` foreign key

### Database
- PostgreSQL with Drizzle ORM
- Timestamps stored with timezone support
- Proper cascading deletes (user deletion → event deletion)
- Indexed on `userId` and `startDateTime` for performance

### Date Handling
- Using `chrono-node` for natural language parsing
- ISO string format for API communication
- Local timezone preservation
- Validation for start < end dates

### Styling
- Tailwind CSS utilities (no custom CSS)
- OKLCH color space (matches IndieSaas theme)
- Category colors: work=blue, personal=green, meeting=purple, appointment=orange, other=gray
- Responsive design with mobile-first approach

### Component Pattern
- Shadcn/ui component architecture
- Radix UI primitives (Dialog, Form, etc.)
- Server Components by default
- Client Components only where needed (forms, interactions)

---

## 📊 Estimated Remaining Time

| Phase | Task | Estimated Time |
|-------|------|----------------|
| 3.2 | Event Form Component | 30 min |
| 3.2 | Event Modal Component | 20 min |
| 3.2 | Calendar Grid Component | 45 min |
| 3.2 | Event Card Component | 20 min |
| 3.2 | Upcoming Events List | 25 min |
| 3.3 | Calendar Page | 30 min |
| 3.3 | Sidebar Navigation | 10 min |
| 3.4 | Testing & Polish | 30 min |
| **Total** | | **~3.5 hours** |

---

## 🐛 Known Issues / TODOs

1. **Database Setup Required**
   - User must configure `.env` with `DATABASE_URL`
   - Run migrations before API routes will work
   - Consider adding migration instructions to README

2. **Recurrence Not Fully Implemented**
   - Schema supports recurrence field
   - Logic for generating recurring events needs implementation
   - Consider using a library like `rrule` for complex recurrence

3. **Reminders Not Implemented**
   - Schema includes `reminderMinutes`
   - Email/push notification system needed
   - Could integrate with Resend for email reminders

4. **Timezone Handling**
   - Currently using server timezone
   - Consider storing user timezone preference
   - Display times in user's local timezone

---

## 🚀 After Calendar Completion

Once calendar is complete and tested, proceed to **Phase 4: Chatbot Implementation**

### Chatbot Implementation Plan:
1. OpenAI client setup
2. Intent recognition system
3. Chat API routes
4. Chat UI components
5. Calendar-Chat integration
6. Testing

**Estimated Time:** 2-3 days

---

## 📝 Notes

- All code follows IndieSaas coding conventions
- TypeScript strict mode enabled
- Components use existing UI library (no reinventing the wheel)
- API routes follow RESTful conventions
- Error handling in place for all API routes
- Natural language parsing working via chrono-node

---

**Ready to continue?** Run the next set of component creations or let me know if you want to test what's been built so far!
