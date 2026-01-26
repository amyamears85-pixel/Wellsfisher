import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Globe, Navigation, FormInput, MousePointer, Layout, Link2, Image, ArrowLeft, FileText, Layers } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface AnalysisResult {
  title: string;
  hasNav: boolean;
  forms: number;
  buttons: number;
  inputs: number;
  sections: number;
  headings: string[];
  links: number;
  images: number;
  hasFooter: boolean;
  hasHeader: boolean;
}

export default function AnalyzerPage() {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (websiteUrl: string) => {
      const response = await apiRequest("POST", "/api/analyze", { url: websiteUrl });
      return response.json() as Promise<AnalysisResult>;
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Could not analyze the website. Please check the URL and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    let processedUrl = url.trim();
    if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
      processedUrl = "https://" + processedUrl;
    }
    
    analyzeMutation.mutate(processedUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-300 hover-elevate" data-testid="link-back-dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4" data-testid="text-page-title">
            AI Website Builder
          </h1>
          <p className="text-slate-400 text-lg" data-testid="text-page-description">
            Enter a website URL to generate an original inspired design
          </p>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                  data-testid="input-url"
                />
              </div>
              <Button 
                type="submit" 
                disabled={analyzeMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-generate"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Generate"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {analyzeMutation.data && (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm" data-testid="card-analysis-results">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3" data-testid="text-analysis-title">
                <Globe className="w-6 h-6 text-blue-400" />
                {analyzeMutation.data.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {analyzeMutation.data.hasNav && (
                  <div className="flex items-center gap-2 text-slate-300 bg-white/5 p-3 rounded-lg" data-testid="badge-has-nav">
                    <Navigation className="w-5 h-5 text-green-400" />
                    <span>Navigation layout created</span>
                  </div>
                )}
                {analyzeMutation.data.hasHeader && (
                  <div className="flex items-center gap-2 text-slate-300 bg-white/5 p-3 rounded-lg" data-testid="badge-has-header">
                    <Layout className="w-5 h-5 text-purple-400" />
                    <span>Header detected</span>
                  </div>
                )}
                {analyzeMutation.data.hasFooter && (
                  <div className="flex items-center gap-2 text-slate-300 bg-white/5 p-3 rounded-lg" data-testid="badge-has-footer">
                    <Layout className="w-5 h-5 text-orange-400" />
                    <span>Footer detected</span>
                  </div>
                )}
                {analyzeMutation.data.forms > 0 && (
                  <div className="flex items-center gap-2 text-slate-300 bg-white/5 p-3 rounded-lg" data-testid="badge-forms">
                    <FormInput className="w-5 h-5 text-yellow-400" />
                    <span>Secure access module generated</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 p-4 rounded-lg" data-testid="stat-buttons">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <MousePointer className="w-4 h-4" />
                    <span className="text-sm">Buttons</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{analyzeMutation.data.buttons}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg" data-testid="stat-sections">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Layers className="w-4 h-4" />
                    <span className="text-sm">Sections</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{analyzeMutation.data.sections}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg" data-testid="stat-inputs">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <FormInput className="w-4 h-4" />
                    <span className="text-sm">Inputs</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{analyzeMutation.data.inputs}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg" data-testid="stat-forms">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Forms</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{analyzeMutation.data.forms}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg" data-testid="stat-links">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Link2 className="w-4 h-4" />
                    <span className="text-sm">Links</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{analyzeMutation.data.links}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg" data-testid="stat-images">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Image className="w-4 h-4" />
                    <span className="text-sm">Images</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{analyzeMutation.data.images}</p>
                </div>
              </div>

              {analyzeMutation.data.headings.length > 0 && (
                <div className="bg-white/5 p-4 rounded-lg" data-testid="section-headings">
                  <h3 className="text-slate-400 text-sm mb-3">Key Headings</h3>
                  <ul className="space-y-2">
                    {analyzeMutation.data.headings.map((heading, index) => (
                      <li key={index} className="text-white text-sm flex items-start gap-2" data-testid={`text-heading-${index}`}>
                        <span className="text-blue-400">•</span>
                        {heading}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                data-testid="button-launch-app"
              >
                Launch New App
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
