
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Initialize SQLite database
const dbPath = path.join(process.cwd(), 'data', 'learning-service.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize database schema
const initDatabase = () => {
  // Create projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name TEXT NOT NULL,
      api_key TEXT UNIQUE NOT NULL,
      github_url TEXT,
      scrape_url TEXT,
      function_map TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create activity table for tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      action TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id)
    )
  `);
};

// Initialize database on startup
initDatabase();

// Database operations
export const dbOperations = {
  // Projects
  createProject: (projectData: {
    projectName: string;
    apiKey: string;
    githubUrl?: string;
    scrapeUrl?: string;
    functionMap: Record<string, string>;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO projects (project_name, api_key, github_url, scrape_url, function_map)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      projectData.projectName,
      projectData.apiKey,
      projectData.githubUrl || null,
      projectData.scrapeUrl || null,
      JSON.stringify(projectData.functionMap)
    );
    return result.lastInsertRowid;
  },

  getProjectById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    const project = stmt.get(id);
    if (project) {
      project.function_map = JSON.parse(project.function_map);
    }
    return project;
  },

  getProjectByApiKey: (apiKey: string) => {
    const stmt = db.prepare('SELECT * FROM projects WHERE api_key = ?');
    const project = stmt.get(apiKey);
    if (project) {
      project.function_map = JSON.parse(project.function_map);
    }
    return project;
  },

  getAllProjects: () => {
    const stmt = db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
    const projects = stmt.all();
    return projects.map(project => ({
      ...project,
      function_map: JSON.parse(project.function_map)
    }));
  },

  deleteProject: (id: number) => {
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    return stmt.run(id);
  },

  // Activity tracking
  logActivity: (projectId: number, action: string) => {
    const stmt = db.prepare('INSERT INTO activity (project_id, action) VALUES (?, ?)');
    return stmt.run(projectId, action);
  },

  getActivity: () => {
    const stmt = db.prepare(`
      SELECT a.*, p.project_name 
      FROM activity a 
      LEFT JOIN projects p ON a.project_id = p.id 
      ORDER BY a.timestamp DESC 
      LIMIT 10
    `);
    return stmt.all();
  }
};

export default db;
