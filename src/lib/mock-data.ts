// Mock data and storage for frontend-only implementation
export interface Project {
  id: number;
  projectName: string;
  apiKey: string;
  githubUrl?: string;
  scrapeUrl?: string;
  functionMap: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: number;
  projectId: number;
  projectName: string;
  action: string;
  timestamp: string;
}

// Generate sample function maps for different types of projects
const generateMockFunctionMap = (projectName: string, url?: string): Record<string, string> => {
  if (url?.includes('github.com')) {
    return {
      'header-nav': 'Main navigation header with menu items',
      'hero-section': 'Hero section introducing the project',
      'code-editor': 'Interactive code editor component',
      'file-tree': 'File explorer showing project structure',
      'search-bar': 'Search functionality for code and files',
      'user-profile': 'User profile dropdown menu',
      'settings-panel': 'Application settings configuration',
      'terminal': 'Integrated terminal for running commands'
    };
  } else {
    return {
      'main-header': 'Website main navigation header',
      'hero-banner': 'Primary hero section with call-to-action',
      'contact-form': 'Contact form for user inquiries',
      'footer-links': 'Footer navigation and social links',
      'search-widget': 'Site search functionality',
      'newsletter-signup': 'Email newsletter subscription form',
      'product-grid': 'Product or service showcase grid',
      'testimonials': 'Customer testimonials section'
    };
  }
};

// Local storage helpers
const STORAGE_KEYS = {
  PROJECTS: 'learning-service-projects',
  ACTIVITIES: 'learning-service-activities',
  NEXT_ID: 'learning-service-next-id'
};

export const mockStorage = {
  getProjects: (): Project[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return stored ? JSON.parse(stored) : [];
  },

  saveProjects: (projects: Project[]) => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  getActivities: (): Activity[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return stored ? JSON.parse(stored) : [];
  },

  saveActivities: (activities: Activity[]) => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  },

  getNextId: (): number => {
    const stored = localStorage.getItem(STORAGE_KEYS.NEXT_ID);
    const nextId = stored ? parseInt(stored, 10) : 1;
    localStorage.setItem(STORAGE_KEYS.NEXT_ID, (nextId + 1).toString());
    return nextId;
  }
};

// Generate API key
export const generateApiKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'learn_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Mock analysis function
export const mockAnalyzeProject = async (
  projectName: string,
  githubUrl?: string,
  scrapeUrl?: string
): Promise<{ success: boolean; functionMap: Record<string, string>; error?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (!projectName) {
    return { success: false, error: 'Project name is required', functionMap: {} };
  }

  if (!githubUrl && !scrapeUrl) {
    return { success: false, error: 'Either GitHub URL or scrape URL is required', functionMap: {} };
  }

  // Simulate occasional failures for realism
  if (Math.random() < 0.1) {
    return { success: false, error: 'Analysis temporarily unavailable', functionMap: {} };
  }

  const functionMap = generateMockFunctionMap(projectName, githubUrl || scrapeUrl);
  
  return { success: true, functionMap };
};

// Add activity log
export const addActivity = (projectId: number, projectName: string, action: string) => {
  const activities = mockStorage.getActivities();
  const newActivity: Activity = {
    id: mockStorage.getNextId(),
    projectId,
    projectName,
    action,
    timestamp: new Date().toISOString()
  };
  
  activities.unshift(newActivity);
  // Keep only last 50 activities
  if (activities.length > 50) {
    activities.splice(50);
  }
  
  mockStorage.saveActivities(activities);
};
