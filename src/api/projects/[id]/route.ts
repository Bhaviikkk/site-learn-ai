
import { NextRequest } from 'next/server';
import { dbOperations } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return Response.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const project = dbOperations.getProjectById(projectId);

    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      project: {
        id: project.id,
        projectName: project.project_name,
        apiKey: project.api_key,
        githubUrl: project.github_url,
        scrapeUrl: project.scrape_url,
        functionMap: project.function_map,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }
    });

  } catch (error) {
    console.error('Failed to fetch project:', error);
    return Response.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return Response.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const result = dbOperations.deleteProject(projectId);

    if (result.changes === 0) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Project deleted successfully' });

  } catch (error) {
    console.error('Failed to delete project:', error);
    return Response.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
