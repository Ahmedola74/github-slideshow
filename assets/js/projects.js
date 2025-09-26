import { computeBasePath, slugify } from './utils.js';

const STORAGE_KEY = 'ahmed-adel-projects';
const clone = (value) => (typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)));
const generateId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
let projectCache = null;
let subscribers = [];

const notify = () => {
  subscribers.forEach((callback) => callback(getProjectsSync()));
};

const getProjectsSync = () => (projectCache ? clone(projectCache) : []);

export const subscribeToProjects = (callback) => {
  subscribers.push(callback);
  return () => {
    subscribers = subscribers.filter((cb) => cb !== callback);
  };
};

const fetchSeedProjects = async () => {
  const basePath = computeBasePath();
  const response = await fetch(`${basePath}/assets/data/projects.json?_=${Date.now()}`);
  if (!response.ok) {
    throw new Error('Unable to load project data');
  }
  const data = await response.json();
  return data.projects || [];
};

const readStoredProjects = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Local storage unavailable', error);
    return null;
  }
};

const persistProjects = (projects) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.warn('Unable to persist projects', error);
  }
};

export const loadProjects = async () => {
  if (projectCache) return clone(projectCache);
  const stored = readStoredProjects();
  if (stored && Array.isArray(stored)) {
    projectCache = stored;
    return clone(projectCache);
  }
  const seeded = await fetchSeedProjects();
  projectCache = seeded;
  persistProjects(projectCache);
  return clone(projectCache);
};

export const resetProjectsToSeed = async () => {
  const seeded = await fetchSeedProjects();
  projectCache = seeded;
  persistProjects(projectCache);
  notify();
  return clone(projectCache);
};

export const saveProjects = (projects) => {
  projectCache = clone(projects);
  persistProjects(projectCache);
  notify();
  return clone(projectCache);
};

export const upsertProject = (project) => {
  const projects = getProjectsSync();
  const existingIndex = projects.findIndex((p) => p.id === project.id);
  if (existingIndex >= 0) {
    projects[existingIndex] = { ...projects[existingIndex], ...project, updatedAt: new Date().toISOString() };
  } else {
    const timestamp = new Date().toISOString();
    projects.push({
      ...project,
      id: project.id || generateId(),
      slug: project.slug || slugify(project.projectName),
      createdAt: timestamp,
      updatedAt: timestamp
    });
  }
  projects.sort((a, b) => (b.order || 0) - (a.order || 0));
  saveProjects(projects);
  return clone(projects);
};

export const deleteProject = (id) => {
  const projects = getProjectsSync().filter((project) => project.id !== id);
  saveProjects(projects);
};

export const getProjectBySlug = (slug) => {
  const projects = getProjectsSync();
  return projects.find((project) => project.slug === slug);
};

export const getProjectsBySection = (section) => {
  const projects = getProjectsSync().filter((project) => project.section === section && project.published !== false);
  return projects.sort((a, b) => (b.order || 0) - (a.order || 0));
};

export const getFeaturedProjects = () => {
  const projects = getProjectsSync().filter((project) => project.featured && project.published !== false);
  return projects.sort((a, b) => (b.order || 0) - (a.order || 0));
};

export const getPublishedProjects = () =>
  getProjectsSync()
    .filter((project) => project.published !== false)
    .sort((a, b) => (b.order || 0) - (a.order || 0));

export const importProjects = (projects) => {
  if (!Array.isArray(projects)) throw new Error('Projects data must be an array');
  projectCache = projects.map((project) => ({
    ...project,
    slug: project.slug || slugify(project.projectName)
  }));
  persistProjects(projectCache);
  notify();
};

export const getCategoryNavigation = (currentSection) => {
  const sections = new Set(getProjectsSync().map((project) => project.section));
  return Array.from(sections)
    .filter(Boolean)
    .sort()
    .map((section) => ({
      section,
      active: section === currentSection
    }));
};

export const getSiblingProjects = (slug) => {
  const project = getProjectBySlug(slug);
  if (!project) return { previous: null, next: null };
  const scoped = getProjectsBySection(project.section);
  const index = scoped.findIndex((item) => item.slug === slug);
  return {
    previous: scoped[index - 1] || null,
    next: scoped[index + 1] || null
  };
};
