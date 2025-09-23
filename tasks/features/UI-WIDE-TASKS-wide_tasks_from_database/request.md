# UI-WIDE-TASKS: Wide tasks from database with modal_clicks logic

## Request
Add support for wide tasks stored in database with conditional display based on modal_clicks table.

## What needs to be done
1. Add `wide` boolean column to `task_definitions` table
2. Insert wide task for "SIGN UP FOR FREE TRIAL" with `wide = true`
3. Update API to check `modal_clicks` for `try_for_free` clicks
4. Hide wide tasks if user has `try_for_free` clicks
5. Update frontend to render wide tasks from database

## Why
- Move wide task logic from hardcoded frontend to database
- Allow dynamic control of wide task display
- Hide wide tasks after user clicks "TRY FOR FREE" button
- Use proper badge numbers from `unlockLevel` field
