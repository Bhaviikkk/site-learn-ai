
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, Check, Code, Calendar, Link, Github } from 'lucide-react';
import { type Project, generatePlugin } from '@/lib/api';

interface ProjectDetailsProps {
  project: Project;
  onBack: () => void;
}

export const ProjectDetails = ({ project, onBack }: ProjectDetailsProps) => {
  const [copied, setCopied] = useState(false);

  const pluginCode = generatePlugin(project.apiKey);
  const scriptTag = `<script>\n${pluginCode}\n</script>`;

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(scriptTag);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>

      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-white text-2xl">{project.projectName}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
                {project.githubUrl && (
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </div>
                )}
                {project.scrapeUrl && (
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Website
                  </div>
                )}
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
              {Object.keys(project.functionMap).length} elements
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Key */}
          <div className="space-y-2">
            <h3 className="text-white font-semibold">API Key</h3>
            <div className="bg-black/20 p-3 rounded-lg">
              <code className="text-green-400 font-mono text-sm">{project.apiKey}</code>
            </div>
          </div>

          {/* Plugin Script */}
          <div className="space-y-2">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Code className="h-4 w-4" />
              Plugin Script
            </h3>
            <p className="text-gray-300 text-sm">
              Copy this script tag and paste it into your HTML to add the learning plugin:
            </p>
            <div className="relative">
              <pre className="bg-black/20 p-4 rounded-lg overflow-x-auto max-h-40 text-sm">
                <code className="text-gray-300">{scriptTag}</code>
              </pre>
              <Button
                size="sm"
                onClick={handleCopyScript}
                className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Function Map */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Learning Elements ({Object.keys(project.functionMap).length})</h3>
            <div className="grid gap-3">
              {Object.entries(project.functionMap).map(([id, explanation]) => (
                <Card key={id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs border-blue-400 text-blue-300">
                          {id}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
