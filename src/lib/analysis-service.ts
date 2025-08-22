
import { GoogleGenerativeAI } from '@google/generative-ai';
import playwright from 'playwright';
import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export interface AnalysisResult {
  functionMap: Record<string, string>;
  success: boolean;
  error?: string;
}

export const analyzeProject = async (
  projectName: string,
  githubUrl?: string,
  scrapeUrl?: string
): Promise<AnalysisResult> => {
  try {
    let functionMap: Record<string, string> = {};

    if (scrapeUrl) {
      console.log(`Scraping website: ${scrapeUrl}`);
      functionMap = await analyzeWebsite(scrapeUrl);
    } else if (githubUrl) {
      console.log(`Analyzing repository: ${githubUrl}`);
      functionMap = await analyzeRepository(githubUrl);
    } else {
      return { success: false, error: 'Either scrapeUrl or githubUrl is required', functionMap: {} };
    }

    return { success: true, functionMap };
  } catch (error) {
    console.error('Analysis error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Analysis failed', functionMap: {} };
  }
};

const analyzeWebsite = async (url: string): Promise<Record<string, string>> => {
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Extract page content
    const content = await page.evaluate(() => {
      // Remove script and style elements
      const scripts = document.querySelectorAll('script, style');
      scripts.forEach(el => el.remove());
      
      return {
        title: document.title,
        headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.textContent?.trim()),
        paragraphs: Array.from(document.querySelectorAll('p')).map(p => p.textContent?.trim()).filter(text => text && text.length > 20),
        links: Array.from(document.querySelectorAll('a')).map(a => ({ text: a.textContent?.trim(), href: a.href })),
        forms: Array.from(document.querySelectorAll('form')).map(form => {
          const inputs = Array.from(form.querySelectorAll('input, textarea, select')).map(input => ({
            type: input.getAttribute('type') || input.tagName.toLowerCase(),
            placeholder: input.getAttribute('placeholder') || '',
            name: input.getAttribute('name') || ''
          }));
          return { inputs };
        })
      };
    });

    await browser.close();

    // Analyze content with AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Analyze this website content and create a function map for interactive learning elements.
      
      Website Content:
      Title: ${content.title}
      Headings: ${content.headings.join(', ')}
      Content: ${content.paragraphs.slice(0, 10).join(' ')}
      Forms: ${JSON.stringify(content.forms)}
      
      Create a JSON object mapping unique IDs to simple explanations of what each element does.
      Use IDs like: main-header, hero-section, contact-form, navigation, search-bar, etc.
      
      Return only the JSON object, no other text.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      return JSON.parse(response);
    } catch {
      // Fallback if AI doesn't return valid JSON
      return {
        'main-header': 'The main navigation header of the website',
        'hero-section': 'The primary hero section introducing the website',
        'content-area': 'Main content area with key information',
        'footer': 'Website footer with additional links and information'
      };
    }
  } catch (error) {
    await browser.close();
    throw error;
  }
};

const analyzeRepository = async (githubUrl: string): Promise<Record<string, string>> => {
  const tempDir = path.join(process.cwd(), 'temp', `repo-${Date.now()}`);
  
  try {
    // Clone repository
    const git = simpleGit();
    await git.clone(githubUrl, tempDir);
    
    // Read relevant files
    const files = await getRelevantFiles(tempDir);
    const functionMap: Record<string, string> = {};
    
    // Analyze files with AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    for (const file of files.slice(0, 10)) { // Limit to 10 files to avoid API limits
      const content = fs.readFileSync(file.path, 'utf-8');
      
      const prompt = `
        Analyze this ${file.extension} file and identify user-facing functionalities or components.
        
        File: ${file.name}
        Content: ${content.slice(0, 2000)} // First 2000 chars
        
        Create JSON entries mapping component/element IDs to simple explanations.
        Focus on user-facing elements like buttons, forms, navigation, etc.
        Use descriptive IDs like: login-button, user-profile, dashboard-nav, etc.
        
        Return only JSON entries, no other text.
      `;

      try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        const fileFunctionMap = JSON.parse(response);
        Object.assign(functionMap, fileFunctionMap);
      } catch (error) {
        console.log(`Failed to analyze file ${file.name}:`, error);
      }
    }
    
    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });
    
    // Return functionMap or fallback
    return Object.keys(functionMap).length > 0 ? functionMap : {
      'app-component': 'Main application component',
      'user-interface': 'User interface elements',
      'navigation': 'Application navigation system',
      'content-display': 'Content display components'
    };
    
  } catch (error) {
    // Cleanup on error
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    throw error;
  }
};

const getRelevantFiles = async (dir: string): Promise<Array<{name: string, path: string, extension: string}>> => {
  const files: Array<{name: string, path: string, extension: string}> = [];
  const relevantExtensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.vue', '.py', '.php'];
  
  const scanDirectory = (currentDir: string) => {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && !['node_modules', 'dist', 'build'].includes(item)) {
        scanDirectory(fullPath);
      } else if (stat.isFile()) {
        const extension = path.extname(item);
        if (relevantExtensions.includes(extension)) {
          files.push({
            name: item,
            path: fullPath,
            extension
          });
        }
      }
    }
  };
  
  scanDirectory(dir);
  return files;
};
