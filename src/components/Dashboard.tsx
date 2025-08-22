
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Github, Globe, Sparkles } from 'lucide-react';
import { createProject } from '@/lib/api';
import { ProjectsList } from './ProjectsList';

export const Dashboard = () => {
  const [projectName, setProjectName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubmit = async (type: 'github' | 'url') => {
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    if (type === 'github' && !githubUrl.trim()) {
      setError('GitHub URL is required');
      return;
    }

    if (type === 'url' && !scrapeUrl.trim()) {
      setError('Website URL is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await createProject({
        projectName: projectName.trim(),
        githubUrl: type === 'github' ? githubUrl.trim() : undefined,
        scrapeUrl: type === 'url' ? scrapeUrl.trim() : undefined
      });

      if (result.success && result.data) {
        setSuccess(`Project "${result.data.projectName}" created successfully!`);
        setProjectName('');
        setGithubUrl('');
        setScrapeUrl('');
        setRefreshKey(prev => prev + 1); // Trigger projects list refresh
      } else {
        setError(result.error || 'Failed to create project');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Project creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              AI Learning Service
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform any website or codebase into an interactive learning experience with AI-powered explanations
          </p>
        </div>

        {/* Create Project Section */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Create New Learning Project
            </CardTitle>
            <CardDescription className="text-gray-300">
              Analyze a website or GitHub repository to create interactive learning content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 bg-red-500/10 border-red-500/20">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-6 bg-green-500/10 border-green-500/20">
                <AlertDescription className="text-green-200">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-white">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="My Learning Project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  disabled={loading}
                />
              </div>

              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/10">
                  <TabsTrigger value="url" className="data-[state=active]:bg-white/20">
                    <Globe className="h-4 w-4 mr-2" />
                    Website URL
                  </TabsTrigger>
                  <TabsTrigger value="github" className="data-[state=active]:bg-white/20">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub Repo
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="scrapeUrl" className="text-white">Website URL</Label>
                    <Input
                      id="scrapeUrl"
                      placeholder="https://example.com"
                      value={scrapeUrl}
                      onChange={(e) => setScrapeUrl(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    onClick={() => handleSubmit('url')}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Website...
                      </>
                    ) : (
                      <>
                        <Globe className="mr-2 h-4 w-4" />
                        Analyze Website
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="github" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl" className="text-white">GitHub Repository URL</Label>
                    <Input
                      id="githubUrl"
                      placeholder="https://github.com/username/repository"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    onClick={() => handleSubmit('github')}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Repository...
                      </>
                    ) : (
                      <>
                        <Github className="mr-2 h-4 w-4" />
                        Analyze Repository
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        <ProjectsList key={refreshKey} />
      </div>
    </div>
  );
};
