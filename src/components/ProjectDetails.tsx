
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Copy, ArrowLeft, Globe, Github, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectDetailsProps {
  projectId: number;
  onBack: () => void;
}

interface ProjectDetail {
  id: number;
  projectName: string;
  apiKey: string;
  githubUrl?: string;
  scrapeUrl?: string;
  functionMap: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${projectId}`);
        const data = await response.json();
        
        if (data.success) {
          setProject(data.project);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch project details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, toast]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const generateIntegrationCode = (apiKey: string) => {
    const baseUrl = window.location.origin;
    return `<script src="${baseUrl}/api/plugin/${apiKey}/plugin.js"></script>`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">Loading project details...</div>
        </CardContent>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">Project not found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </div>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {project.githubUrl ? (
                  <Github className="w-5 h-5" />
                ) : (
                  <Globe className="w-5 h-5" />
                )}
                {project.projectName}
              </CardTitle>
              <CardDescription>
                {project.githubUrl ? project.githubUrl : project.scrapeUrl}
              </CardDescription>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Created {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Script</CardTitle>
            <CardDescription>
              Copy this script tag to your website to enable the learning plugin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  {project.apiKey}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(project.apiKey, 'API Key')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Script Tag</label>
              <Textarea
                readOnly
                value={generateIntegrationCode(project.apiKey)}
                className="font-mono text-xs resize-none"
                rows={3}
              />
              <Button
                size="sm"
                onClick={() => copyToClipboard(generateIntegrationCode(project.apiKey), 'Integration Script')}
              >
                Copy Script Tag
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Function Map */}
        <Card>
          <CardHeader>
            <CardTitle>Function Map</CardTitle>
            <CardDescription>
              AI-generated explanations for interactive elements ({Object.keys(project.functionMap).length} total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(project.functionMap).map(([id, explanation]) => (
                <div key={id} className="border-l-2 border-primary pl-4 py-2">
                  <div className="font-mono text-sm text-primary font-semibold">{id}</div>
                  <div className="text-sm text-muted-foreground mt-1">{explanation}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Add the Script</h4>
              <p className="text-sm text-muted-foreground">
                Copy the integration script and add it to your website's HTML, preferably before the closing &lt;/body&gt; tag.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. Add Learning IDs</h4>
              <p className="text-sm text-muted-foreground">
                Add <code className="bg-muted px-1 py-0.5 rounded">data-learn-id</code> attributes to elements you want to make interactive. 
                Use the IDs from your function map above.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. Test the Plugin</h4>
              <p className="text-sm text-muted-foreground">
                Visit your website and click the "Learning Mode" button to see interactive explanations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetails;
