
import { NextRequest } from 'next/server';
import { dbOperations } from '@/lib/database';
import { analyzeProject } from '@/lib/analysis-service';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, scrapeUrl, githubUrl } = body;

    if (!projectName) {
      return Response.json({ error: 'Project name is required' }, { status: 400 });
    }

    if (!scrapeUrl && !githubUrl) {
      return Response.json({ error: 'Either scrapeUrl or githubUrl is required' }, { status: 400 });
    }

    // Generate unique API key
    const apiKey = 'learn_' + crypto.randomBytes(16).toString('hex');

    // Analyze the project
    const analysisResult = await analyzeProject(projectName, githubUrl, scrapeUrl);

    if (!analysisResult.success) {
      return Response.json({ error: analysisResult.error }, { status: 500 });
    }

    // Save to database
    const projectId = dbOperations.createProject({
      projectName,
      apiKey,
      githubUrl,
      scrapeUrl,
      functionMap: analysisResult.functionMap
    });

    // Log activity
    dbOperations.logActivity(projectId as number, 'Project created');

    const project = dbOperations.getProjectById(projectId as number);

    return Response.json({
      success: true,
      project: {
        id: project.id,
        projectName: project.project_name,
        apiKey: project.api_key,
        functionMap: project.function_map,
        createdAt: project.created_at
      }
    });

  } catch (error) {
    console.error('Project creation error:', error);
    return Response.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const projects = dbOperations.getAllProjects();
    
    return Response.json({
      success: true,
      projects: projects.map(project => ({
        id: project.id,
        projectName: project.project_name,
        apiKey: project.api_key,
        githubUrl: project.github_url,
        scrapeUrl: project.scrape_url,
        functionMapCount: Object.keys(project.function_map).length,
        createdAt: project.created_at
      }))
    });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return Response.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
