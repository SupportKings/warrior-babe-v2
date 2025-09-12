# Grace Period Activity Periods

## Overview

This feature automatically creates "grace period" activity periods when clients are late on payments but CS reps give them additional time to pay. This ensures coaches continue to be compensated during these grace periods.

## How It Works

### Automatic Detection
- **Daily Cron Job**: Runs at 9 AM via Vercel Cron (`/api/cron/grace-periods`)
- **Detection Logic**: 
  - Finds payment plans where `term_end_date` > today (active plans)
  - Checks if last activity period `end_date` < today (overdue)
  - Creates 14-day grace period if none exists

### Payment Processing
- **When Payment Received**: Grace periods are automatically converted to regular periods
- **Continues Normal Flow**: Regular activity periods are generated after grace periods

## Files Modified/Created

### New Files
- `apps/web/src/features/client_activity_period/services/detectGracePeriods.ts` - Grace period detection logic
- `apps/web/src/app/api/cron/grace-periods/route.ts` - Cron job endpoint
- `vercel.json` - Cron job configuration

### Modified Files
- `apps/web/src/features/client_activity_period/services/generateActivityPeriods.ts` - Added grace period conversion
- `apps/web/src/features/finance/actions/updatePaymentSlot.ts` - Added grace period messaging
- `apps/web/src/features/clients/components/table-columns/activity-period-columns.tsx` - Added grace period UI display

## Database Schema

The `client_activity_period` table already includes:
- `is_grace: boolean` - Marks periods as grace periods
- `payment_slot: string` - Links to payment slot (null for grace periods)
- `payment_plan: string` - Links to payment plan

## Testing

### Manual Testing
1. **Trigger Grace Period Detection**:
   ```bash
   curl https://your-app.vercel.app/api/cron/grace-periods
   ```

2. **Test Scenario**:
   - Create a payment plan with activity periods
   - Ensure last activity period has ended
   - Run grace period detection
   - Verify grace period is created with `is_grace: true`

### Expected Behavior
1. **Grace Period Creation**:
   - Only creates grace periods for plans where last period has ended
   - Grace periods are 14 days long
   - Marked with `is_grace: true`
   - No `payment_slot` assigned

2. **Payment Processing**:
   - When payment slot is assigned, grace periods become regular periods (`is_grace: false`)
   - Normal activity period generation continues
   - UI shows conversion message

3. **UI Display**:
   - Grace periods show as "Grace Period" with yellow badge
   - Regular periods show as "Regular" with blue badge
   - Activity period tables include Type column

## Monitoring

- Check Vercel Function logs for cron job execution
- Monitor activity period creation in database
- Review payment slot assignment messages for grace period conversion

## Configuration

### Cron Schedule
- **Current**: Daily at 9 AM (`0 9 * * *`)
- **Modify**: Update `vercel.json` to change schedule

### Grace Period Duration
- **Current**: 14 days
- **Modify**: Update duration in `detectGracePeriods.ts` line 228

## Security Notes

- Cron endpoint allows GET for manual testing
- Add `CRON_SECRET` environment variable for production security
- Uncomment authorization check in `/api/cron/grace-periods/route.ts`