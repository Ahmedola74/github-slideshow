import { initNavigation, resolveAssetPath } from './nav.js';
import { loadProjects, getPublishedProjects } from './projects.js';
import { uniqueValues } from './utils.js';

const state = {
  section: 'all',
  client: 'all',
  year: 'all',
  search: ''
};

const createProjectCard = (project) => {
  const cover = project.media?.find((item) => item.isCover) || project.media?.[0];
  const mediaMarkup = cover
    ? cover.type === 'video'
      ? `<video src="${resolveAssetPath(cover.src)}" poster="${cover.poster ? resolveAssetPath(cover.poster) : ''}" muted loop playsinline></video>`
      : `<img src="${resolveAssetPath(cover.src)}" alt="${cover.alt || project.projectName}">`
    : '';

  return `<a class="project-card" href="./project.html?slug=${project.slug}">
      ${mediaMarkup}
      <div class="project-card-content">
        <span class="badge">${project.section}</span>
        <div class="project-card-title">${project.projectName}</div>
        <div class="project-card-meta">
          <span>${project.client || ''}</span>
          <span>${project.year || ''}</span>
        </div>
      </div>
    </a>`;
};

const applyFilters = (projects) =>
  projects.filter((project) => {
    const matchesSection = state.section === 'all' || project.section === state.section;
    const matchesClient = state.client === 'all' || project.client === state.client;
    const matchesYear = state.year === 'all' || `${project.year}` === state.year;
    const text = `${project.projectName} ${project.client} ${(project.tags || []).join(' ')}`.toLowerCase();
    const matchesSearch = !state.search || text.includes(state.search.toLowerCase());
    return matchesSection && matchesClient && matchesYear && matchesSearch;
  });

const renderProjects = (projects) => {
  const grid = document.querySelector('[data-works-grid]');
  if (!grid) return;
  const filtered = applyFilters(projects);
  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state">No projects match the filters yet. Try adjusting the filters.</div>';
    return;
  }
  grid.innerHTML = filtered.map((project) => createProjectCard(project)).join('');
};

const populateFilters = (projects) => {
  const sectionSelect = document.querySelector('[data-filter-section]');
  const clientSelect = document.querySelector('[data-filter-client]');
  const yearSelect = document.querySelector('[data-filter-year]');

  const sections = ['all', ...uniqueValues(projects, 'section')];
  const clients = ['all', ...uniqueValues(projects, 'client')];
  const years = ['all', ...uniqueValues(projects, 'year').reverse()];

  sectionSelect.innerHTML = sections
    .map((section) => `<option value="${section}">${section === 'all' ? 'All Kinds' : section}</option>`)
    .join('');
  clientSelect.innerHTML = clients
    .map((client) => `<option value="${client}">${client === 'all' ? 'All Clients' : client}</option>`)
    .join('');
  yearSelect.innerHTML = years
    .map((year) => `<option value="${year}">${year === 'all' ? 'All Years' : year}</option>`)
    .join('');
};

const attachFilterListeners = (projects) => {
  const sectionSelect = document.querySelector('[data-filter-section]');
  const clientSelect = document.querySelector('[data-filter-client]');
  const yearSelect = document.querySelector('[data-filter-year]');
  const searchInput = document.querySelector('[data-filter-search]');

  sectionSelect.addEventListener('change', (event) => {
    state.section = event.target.value;
    renderProjects(projects);
  });

  clientSelect.addEventListener('change', (event) => {
    state.client = event.target.value;
    renderProjects(projects);
  });

  yearSelect.addEventListener('change', (event) => {
    state.year = event.target.value;
    renderProjects(projects);
  });

  searchInput.addEventListener('input', (event) => {
    state.search = event.target.value;
    renderProjects(projects);
  });
};

const init = async () => {
  initNavigation('works');
  const projects = await loadProjects();
  const published = getPublishedProjects();
  populateFilters(published);
  attachFilterListeners(published);
  renderProjects(published);
};

document.addEventListener('DOMContentLoaded', init);
