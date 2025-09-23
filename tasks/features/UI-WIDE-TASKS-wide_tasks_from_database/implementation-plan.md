# Implementation Plan: Wide tasks from database

## 1. Database Changes
- ✅ Add `wide` boolean column to `task_definitions` table
- ✅ Create index for efficient querying by wide status  
- ✅ Insert wide task for "SIGN UP FOR FREE TRIAL" with `wide = true`

## 2. API Updates
- ✅ Update `/api/v1/tasks` to include `wide` column in SELECT query
- ✅ Add logic to check `modal_clicks` table for `try_for_free` clicks
- ✅ Implement conditional logic: if user has `try_for_free` clicks, hide wide tasks

## 3. Frontend Updates
- ✅ Update `EarnItem` type to include `wide` boolean field
- ✅ Update `TaskDef` type to include `wide` boolean field
- ✅ Modify `EarnGrid` to render wide tasks from database instead of hardcoded logic
- ✅ Filter out tasks with `state = 'hidden'` (wide tasks that should be hidden)

## 4. Logic Flow
1. User visits EARN section
2. API checks if user has any `try_for_free` clicks in `modal_clicks`
3. If no clicks: show wide task as `available`
4. If has clicks: set wide task state to `hidden` (filtered out in frontend)
5. Frontend renders wide tasks from database with proper badge numbers

## 5. Files Modified
- `supabase/migrations/013_add_wide_column_to_task_definitions.sql` - Database migration
- `web/src/app/api/v1/tasks/route.ts` - API logic for wide tasks
- `web/src/ui/earn/EarnGrid/EarnGrid.tsx` - Frontend rendering
- `web/src/app/page.tsx` - Type updates and data passing

## 6. Testing
- Test with new user (no modal_clicks) - should see wide task
- Test after clicking "TRY FOR FREE" - wide task should disappear
- Test badge numbers match `unlockLevel` from database
- Test wide task appears in both available and completed tabs when appropriate
