# 🗄️ SUPABASE DATABASE SETUP

## DATABASE STATUS: ✅ READY

Your database schema is already configured with 15 migrations. Here's what you need to verify:

## 1. VERIFY YOUR SUPABASE PROJECT

### Check Database Tables:
Go to Supabase Dashboard → Table Editor

**REQUIRED MVP TABLES (MUST EXIST):**
- ✅ `profiles` - User profiles
- ✅ `food_logs` - Food tracking entries  
- ✅ `body_measurements` - Weight/body metrics
- ✅ `foods` - Food database (8000+ USDA foods)

### Check Authentication:
Go to Supabase Dashboard → Authentication → Settings
- ✅ Email auth enabled
- ✅ Auto-confirm users: ON (for easy signup)
- ✅ Email templates configured

## 2. APPLY MIGRATIONS (IF NEEDED)

If tables don't exist, run migrations:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply all migrations
supabase db push

# OR run specific migrations manually in SQL Editor:
# Copy content from supabase/migrations/*.sql files
```

## 3. SEED DATA (OPTIONAL)

The app works without seed data, but you can add test foods:

```sql
-- Run in Supabase SQL Editor
-- Add some common foods for testing
INSERT INTO foods (description, "caloriesPer100g", "proteinG", "carbsG", "fatG", verified) VALUES
('Chicken breast, grilled', 165, 31, 0, 3.6, true),
('White rice, cooked', 130, 2.7, 28, 0.3, true),
('Banana, medium', 89, 1.1, 23, 0.3, true),
('Whole milk', 61, 3.2, 4.8, 3.3, true),
('Olive oil', 884, 0, 0, 100, true);
```

## 4. ROW LEVEL SECURITY (ALREADY CONFIGURED)

Your tables already have RLS policies:
- Users can only see/edit their own data
- No user can access other users' information
- Authentication required for all operations

## 5. API ENDPOINTS (AUTO-GENERATED)

Supabase automatically provides REST API for:
- `GET /rest/v1/food_logs` - User's food entries
- `POST /rest/v1/food_logs` - Add food entry
- `GET /rest/v1/body_measurements` - User's weight data
- `POST /rest/v1/body_measurements` - Add weight entry
- `GET /rest/v1/foods` - Search food database

## 6. VERIFICATION CHECKLIST

### ✅ Database Structure:
- [ ] Tables exist (profiles, food_logs, body_measurements, foods)
- [ ] RLS policies active
- [ ] Indexes created for performance

### ✅ Authentication:
- [ ] Email signup enabled
- [ ] Email confirmation works (or auto-confirm enabled)
- [ ] JWT tokens generated correctly

### ✅ API Access:
- [ ] Anon key allows read/write with RLS
- [ ] Service role key has full access
- [ ] CORS configured for your domain

## 7. COMMON ISSUES & FIXES

### "Failed to fetch" errors:
- Check SUPABASE_URL is correct
- Verify ANON_KEY is valid
- Confirm RLS policies allow user access

### Authentication failures:
- Enable auto-confirm users in Auth settings
- Check email templates are configured
- Verify JWT secret is correct

### Data not saving:
- Check RLS policies allow INSERT
- Verify user is authenticated
- Check column names match exactly

## 8. PRODUCTION CHECKLIST

Before going live:
- [ ] Change auto-confirm to false (require email verification)
- [ ] Set up custom email templates
- [ ] Configure password reset flow
- [ ] Set up database backups
- [ ] Monitor usage limits

## 9. SUPABASE URLS TO BOOKMARK

- **Dashboard**: https://supabase.com/dashboard/project/your-project-ref
- **Table Editor**: https://supabase.com/dashboard/project/your-project-ref/editor
- **Auth Settings**: https://supabase.com/dashboard/project/your-project-ref/auth/settings
- **API Docs**: https://supabase.com/dashboard/project/your-project-ref/api
- **Logs**: https://supabase.com/dashboard/project/your-project-ref/logs

Your database is **READY TO GO**. The app will work as soon as you add the correct environment variables!