
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Calendar, Link, Github } from 'lucide-react';
import { getAllProjects, deleteProject, type Project } from '@/lib/api';
import { ProjectDetails } from './ProjectDetails';

export const ProjectsList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const loadProjects = () => {
    setLoading(true);
    const result = getAllProjects();
    
    if (result.success && result.data) {
      setProjects(result.data);
    } else {
      console.error('Failed to load projects:', result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = (projectId: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const result = deleteProject(projectId);
      
      if (result.success) {
        setProjects(projects.filter(p => p.id !== projectId));
      } else {
        console.error('Failed to delete project:', result.error);
      }
    }
  };

  const handleView = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBack = () => {
    setSelectedProject(null);
  };

  if (selectedProject) {
    return <ProjectDetails project={selectedProject} onBack={handleBack} />;
  }

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="p-8 text-center">
          <div className="text-gray-300">Loading projects...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Your Learning Projects</CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8 text-gray-300">
            No projects created yet. Create your first project above!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white text-lg truncate">
                      {project.projectName}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar className="h-4 w-4" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  
                  {project.githubUrl && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Github className="h-4 w-4" />
                      <span className="truncate">GitHub Repository</span>
                    </div>
                  )}
                  
                  {project.scrapeUrl && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Link className="h-4 w-4" />
                      <span className="truncate">Website Analysis</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                      {Object.keys(project.functionMap).length} elements
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleView(project)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
