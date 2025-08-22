
import { dbOperations } from '@/lib/database';

export async function GET() {
  try {
    const activities = dbOperations.getActivity();
    
    return Response.json({
      success: true,
      activities: activities.map(activity => ({
        id: activity.id,
        projectId: activity.project_id,
        projectName: activity.project_name,
        action: activity.action,
        timestamp: activity.timestamp
      }))
    });
  } catch (error) {
    console.error('Failed to fetch activity:', error);
    return Response.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
