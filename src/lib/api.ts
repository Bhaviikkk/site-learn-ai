
import { dbOperations } from './database';
import { analyzeProject } from './analysis-service';
import crypto from 'crypto';

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

export interface CreateProjectRequest {
  projectName: string;
  githubUrl?: string;
  scrapeUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Projects API
export const createProject = async (request: CreateProjectRequest): Promise<ApiResponse<Project>> => {
  try {
    const { projectName, scrapeUrl, githubUrl } = request;

    if (!projectName) {
      return { success: false, error: 'Project name is required' };
    }

    if (!scrapeUrl && !githubUrl) {
      return { success: false, error: 'Either scrapeUrl or githubUrl is required' };
    }

    // Generate unique API key
    const apiKey = 'learn_' + crypto.randomBytes(16).toString('hex');

    // Analyze the project
    const analysisResult = await analyzeProject(projectName, githubUrl, scrapeUrl);

    if (!analysisResult.success) {
      return { success: false, error: analysisResult.error };
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

    return {
      success: true,
      data: {
        id: project.id,
        projectName: project.project_name,
        apiKey: project.api_key,
        githubUrl: project.github_url,
        scrapeUrl: project.scrape_url,
        functionMap: project.function_map,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }
    };

  } catch (error) {
    console.error('Project creation error:', error);
    return { success: false, error: 'Failed to create project' };
  }
};

export const getAllProjects = (): ApiResponse<Project[]> => {
  try {
    const projects = dbOperations.getAllProjects();
    
    return {
      success: true,
      data: projects.map(project => ({
        id: project.id,
        projectName: project.project_name,
        apiKey: project.api_key,
        githubUrl: project.github_url,
        scrapeUrl: project.scrape_url,
        functionMap: project.function_map,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }))
    };
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return { success: false, error: 'Failed to fetch projects' };
  }
};

export const getProjectById = (id: number): ApiResponse<Project> => {
  try {
    const project = dbOperations.getProjectById(id);

    if (!project) {
      return { success: false, error: 'Project not found' };
    }

    return {
      success: true,
      data: {
        id: project.id,
        projectName: project.project_name,
        apiKey: project.api_key,
        githubUrl: project.github_url,
        scrapeUrl: project.scrape_url,
        functionMap: project.function_map,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }
    };

  } catch (error) {
    console.error('Failed to fetch project:', error);
    return { success: false, error: 'Failed to fetch project' };
  }
};

export const deleteProject = (id: number): ApiResponse<{ message: string }> => {
  try {
    const result = dbOperations.deleteProject(id);

    if (result.changes === 0) {
      return { success: false, error: 'Project not found' };
    }

    return { success: true, data: { message: 'Project deleted successfully' } };

  } catch (error) {
    console.error('Failed to delete project:', error);
    return { success: false, error: 'Failed to delete project' };
  }
};

// Plugin API
export const generatePlugin = (apiKey: string): string => {
  try {
    const project = dbOperations.getProjectByApiKey(apiKey);

    if (!project) {
      return '// Plugin not found';
    }

    // Generate the plugin JavaScript with embedded function map
    return generatePluginCode(project.function_map);

  } catch (error) {
    console.error('Failed to generate plugin:', error);
    return '// Plugin generation failed';
  }
};

const generatePluginCode = (functionMap: Record<string, string>): string => {
  return `
(function() {
  'use strict';
  
  // Embedded function map - no API calls needed
  const FUNCTION_MAP = ${JSON.stringify(functionMap, null, 2)};
  
  // Plugin configuration
  const PLUGIN_CONFIG = {
    buttonStyle: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '10000',
      padding: '12px 24px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '50px',
      cursor: 'pointer',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)'
    },
    infoButtonStyle: {
      position: 'absolute',
      width: '24px',
      height: '24px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 'bold',
      zIndex: '9999',
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
      transition: 'all 0.2s ease'
    },
    modalStyle: {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '10001',
      backdropFilter: 'blur(5px)'
    },
    modalContentStyle: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '16px',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflow: 'auto',
      margin: '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      lineHeight: '1.6'
    }
  };

  class LearningPlugin {
    constructor() {
      this.isActive = false;
      this.toggleButton = null;
      this.infoButtons = [];
      this.currentModal = null;
      
      this.init();
    }

    init() {
      this.createToggleButton();
      console.log('Learning Plugin initialized with', Object.keys(FUNCTION_MAP).length, 'learning elements');
    }

    createToggleButton() {
      this.toggleButton = document.createElement('button');
      this.toggleButton.innerHTML = '🧠 Learning Mode: OFF';
      
      Object.assign(this.toggleButton.style, PLUGIN_CONFIG.buttonStyle);
      
      this.toggleButton.addEventListener('click', () => {
        this.toggle();
      });

      this.toggleButton.addEventListener('mouseenter', () => {
        this.toggleButton.style.transform = 'translateY(-2px)';
        this.toggleButton.style.boxShadow = '0 6px 25px rgba(59, 130, 246, 0.5)';
      });

      this.toggleButton.addEventListener('mouseleave', () => {
        this.toggleButton.style.transform = 'translateY(0)';
        this.toggleButton.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.4)';
      });

      document.body.appendChild(this.toggleButton);
    }

    toggle() {
      this.isActive = !this.isActive;
      
      if (this.isActive) {
        this.activateLearningMode();
        this.toggleButton.innerHTML = '🧠 Learning Mode: ON';
        this.toggleButton.style.backgroundColor = '#10b981';
      } else {
        this.deactivateLearningMode();
        this.toggleButton.innerHTML = '🧠 Learning Mode: OFF';
        this.toggleButton.style.backgroundColor = '#3b82f6';
      }
    }

    activateLearningMode() {
      const learnableElements = document.querySelectorAll('[data-learn-id]');
      
      learnableElements.forEach(element => {
        const learnId = element.getAttribute('data-learn-id');
        if (FUNCTION_MAP[learnId]) {
          this.addInfoButton(element, learnId);
        }
      });
    }

    deactivateLearningMode() {
      this.infoButtons.forEach(button => {
        if (button.parentNode) {
          button.parentNode.removeChild(button);
        }
      });
      this.infoButtons = [];
      
      if (this.currentModal) {
        this.closeModal();
      }
    }

    addInfoButton(element, learnId) {
      const infoButton = document.createElement('button');
      infoButton.innerHTML = 'i';
      infoButton.className = 'learning-plugin-info-btn';
      
      Object.assign(infoButton.style, PLUGIN_CONFIG.infoButtonStyle);
      
      const rect = element.getBoundingClientRect();
      infoButton.style.top = \`\${rect.top + window.scrollY - 12}px\`;
      infoButton.style.left = \`\${rect.right + window.scrollX + 10}px\`;

      infoButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showExplanation(learnId);
      });

      infoButton.addEventListener('mouseenter', () => {
        infoButton.style.transform = 'scale(1.1)';
        infoButton.style.backgroundColor = '#1d4ed8';
      });

      infoButton.addEventListener('mouseleave', () => {
        infoButton.style.transform = 'scale(1)';
        infoButton.style.backgroundColor = '#3b82f6';
      });

      document.body.appendChild(infoButton);
      this.infoButtons.push(infoButton);

      const updatePosition = () => {
        if (this.isActive && infoButton.parentNode) {
          const newRect = element.getBoundingClientRect();
          infoButton.style.top = \`\${newRect.top + window.scrollY - 12}px\`;
          infoButton.style.left = \`\${newRect.right + window.scrollX + 10}px\`;
        }
      };

      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }

    showExplanation(learnId) {
      const explanation = FUNCTION_MAP[learnId];
      if (!explanation) return;

      const modal = document.createElement('div');
      Object.assign(modal.style, PLUGIN_CONFIG.modalStyle);
      
      const modalContent = document.createElement('div');
      Object.assign(modalContent.style, PLUGIN_CONFIG.modalContentStyle);
      
      modalContent.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 15px;">
          <h3 style="margin: 0; color: #1f2937; font-size: 20px; font-weight: 600;">Element Explanation</h3>
          <button id="closeModal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; padding: 5px;">×</button>
        </div>
        <div style="margin-bottom: 15px;">
          <strong style="color: #3b82f6; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Element ID:</strong>
          <code style="display: block; background: #f9fafb; padding: 8px 12px; border-radius: 6px; margin-top: 5px; font-family: monospace; font-size: 14px;">\${learnId}</code>
        </div>
        <div>
          <strong style="color: #1f2937; margin-bottom: 10px; display: block;">What this element does:</strong>
          <p style="margin: 0; color: #4b5563; line-height: 1.7; font-size: 16px;">\${explanation}</p>
        </div>
      \`;
      
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
      this.currentModal = modal;

      const closeBtn = modalContent.querySelector('#closeModal');
      const closeModal = () => this.closeModal();
      
      closeBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
      
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
      });

      modal.style.opacity = '0';
      modalContent.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        modal.style.transition = 'opacity 0.3s ease';
        modalContent.style.transition = 'transform 0.3s ease';
        modal.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
      }, 10);
    }

    closeModal() {
      if (this.currentModal) {
        this.currentModal.style.opacity = '0';
        setTimeout(() => {
          if (this.currentModal && this.currentModal.parentNode) {
            this.currentModal.parentNode.removeChild(this.currentModal);
          }
          this.currentModal = null;
        }, 300);
      }
    }
  }

  // Initialize plugin when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new LearningPlugin();
    });
  } else {
    new LearningPlugin();
  }
})();
`;
};

// Activity API
export const getActivity = (): ApiResponse<any[]> => {
  try {
    const activities = dbOperations.getActivity();
    
    return {
      success: true,
      data: activities.map(activity => ({
        id: activity.id,
        projectId: activity.project_id,
        projectName: activity.project_name,
        action: activity.action,
        timestamp: activity.timestamp
      }))
    };
  } catch (error) {
    console.error('Failed to fetch activity:', error);
    return { success: false, error: 'Failed to fetch activity' };
  }
};
