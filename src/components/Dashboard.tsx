
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Globe, Github, Brain, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  apiKey: string;
  functionMap: Record<string, string>;
  projectName: string;
}

const Dashboard = () => {
  const [urlProjectName, setUrlProjectName] = useState('');
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [githubProjectName, setGithubProjectName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeProject = async (type: 'url' | 'github') => {
    setIsAnalyzing(true);
    
    try {
      const payload = type === 'url' 
        ? { projectName: urlProjectName, scrapeUrl }
        : { projectName: githubProjectName, githubUrl };

      const response = await fetch('/api/analyze-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json();
      setAnalysisResult(result);
      
      toast({
        title: "Analysis Complete!",
        description: "Your project has been successfully analyzed and is ready for integration.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Please check your inputs and try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const generateIntegrationCode = (apiKey: string) => {
    return `<script src="https://your-domain.com/learning-plugin.js" data-api-key="${apiKey}"></script>`;
  };

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
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Tabs defaultValue="url" className="space-y-8">
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
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website URL</label>
                    <Input
                      placeholder="https://example.com"
                      value={scrapeUrl}
                      onChange={(e) => setScrapeUrl(e.target.value)}
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
                    "Analyzing..."
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
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">GitHub Repository URL</label>
                    <Input
                      placeholder="https://github.com/user/repo"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
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
                    "Analyzing..."
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

        {/* Analysis Results */}
        {analysisResult && (
          <div className="mt-12 animate-fade-in">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Analysis Complete!</h2>
              <p className="text-muted-foreground">
                Your project "{analysisResult.projectName}" is ready for integration
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* API Key Card */}
              <Card className="analysis-card">
                <CardHeader>
                  <CardTitle>API Key</CardTitle>
                  <CardDescription>
                    Use this secure key to integrate the learning plugin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {analysisResult.apiKey}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(analysisResult.apiKey, 'API Key')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Integration Script</label>
                    <Textarea
                      readOnly
                      value={generateIntegrationCode(analysisResult.apiKey)}
                      className="font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(generateIntegrationCode(analysisResult.apiKey), 'Integration Script')}
                    >
                      Copy Script Tag
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Function Map Card */}
              <Card className="analysis-card">
                <CardHeader>
                  <CardTitle>Generated Function Map</CardTitle>
                  <CardDescription>
                    AI-generated explanations for your website elements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {Object.entries(analysisResult.functionMap).map(([id, explanation]) => (
                      <div key={id} className="border-l-2 border-primary pl-4 py-2">
                        <div className="font-mono text-sm text-primary">{id}</div>
                        <div className="text-sm text-muted-foreground">{explanation}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
