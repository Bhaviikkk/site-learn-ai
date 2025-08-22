
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Github, Brain, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProjectsList from './ProjectsList';
import ProjectDetails from './ProjectDetails';

const Dashboard = () => {
  const [urlProjectName, setUrlProjectName] = useState('');
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [githubProjectName, setGithubProjectName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  const analyzeProject = async (type: 'url' | 'github') => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const payload = type === 'url' 
        ? { projectName: urlProjectName, scrapeUrl }
        : { projectName: githubProjectName, githubUrl };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Analysis Complete!",
          description: `Project "${data.project.projectName}" has been successfully analyzed.`,
        });
        
        // Clear form
        if (type === 'url') {
          setUrlProjectName('');
          setScrapeUrl('');
        } else {
          setGithubProjectName('');
          setGithubUrl('');
        }
        
        // Refresh projects list
        setRefreshTrigger(prev => prev + 1);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (selectedProjectId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <ProjectDetails 
            projectId={selectedProjectId} 
            onBack={() => setSelectedProjectId(null)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <Brain className="w-12 h-12 text-hero mr-4" />
              <Sparkles className="w-8 h-8 text-hero-accent animate-pulse-glow" />
            </div>
            <h1 className="hero-text mb-6">
              AI Learning Service
            </h1>
            <p className="hero-subtitle max-w-3xl mx-auto">
              Transform any website into an interactive learning experience. 
              Our AI analyzes your content and creates intelligent explanations for every element.
            </p>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {/* Create New Project */}
        <Tabs defaultValue="url" className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website URL
              </TabsTrigger>
              <TabsTrigger value="github" className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub Repo
              </TabsTrigger>
            </TabsList>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="url" className="animate-slide-in">
            <Card className="analysis-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Analyze Website by URL
                </CardTitle>
                <CardDescription>
                  Scrape and analyze a live website to generate interactive learning elements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project Name</label>
                    <Input
                      placeholder="My Awesome Website"
                      value={urlProjectName}
                      onChange={(e) => setUrlProjectName(e.target.value)}
                      disabled={isAnalyzing}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website URL</label>
                    <Input
                      placeholder="https://example.com"
                      value={scrapeUrl}
                      onChange={(e) => setScrapeUrl(e.target.value)}
                      disabled={isAnalyzing}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => analyzeProject('url')}
                  disabled={!urlProjectName || !scrapeUrl || isAnalyzing}
                  className="w-full glow-button"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Website
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="github" className="animate-slide-in">
            <Card className="analysis-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="w-5 h-5 text-primary" />
                  Analyze GitHub Repository
                </CardTitle>
                <CardDescription>
                  Clone and analyze a GitHub repository to understand the codebase structure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project Name</label>
                    <Input
                      placeholder="React Dashboard"
                      value={githubProjectName}
                      onChange={(e) => setGithubProjectName(e.target.value)}
                      disabled={isAnalyzing}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">GitHub Repository URL</label>
                    <Input
                      placeholder="https://github.com/user/repo"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      disabled={isAnalyzing}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => analyzeProject('github')}
                  disabled={!githubProjectName || !githubUrl || isAnalyzing}
                  className="w-full glow-button"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Repository
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Projects List */}
        <ProjectsList 
          onProjectSelect={setSelectedProjectId}
          refreshTrigger={refreshTrigger} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
