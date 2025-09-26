import { initNavigation, resolveAssetPath } from './nav.js';
import { loadProjects, getProjectsBySection } from './projects.js';
import { categoryDescriptions } from './utils.js';

const createProjectCard = (project) => {
  const cover = project.media?.find((item) => item.isCover) || project.media?.[0];
  const mediaMarkup = cover
    ? cover.type === 'video'
      ? `<video src="${resolveAssetPath(cover.src)}" poster="${cover.poster ? resolveAssetPath(cover.poster) : ''}" muted loop playsinline></video>`
      : `<img src="${resolveAssetPath(cover.src)}" alt="${cover.alt || project.projectName}">`
    : '';

  const tags = (project.tags || [])
    .map((tag) => `<span class="badge">${tag}</span>`)
    .join('');

  return `<a class="project-card" href="../project.html?slug=${project.slug}">
      ${mediaMarkup}
      <div class="project-card-content">
        <div class="project-card-title">${project.projectName}</div>
        <div class="project-card-meta">
          <span>${project.client || ''}</span>
          <span>${project.year || ''}</span>
        </div>
        <div class="project-tags">${tags}</div>
      </div>
    </a>`;
};

const renderCategoryDescription = (category) => {
  const description = categoryDescriptions[category];
  const element = document.querySelector('[data-category-description]');
  if (element && description) {
    element.textContent = description;
  }
};

const renderProjects = (projects) => {
  const grid = document.querySelector('[data-category-grid]');
  if (!grid) return;
  if (!projects.length) {
    grid.innerHTML = '<div class="empty-state">No projects published yet in this category. Publish one from the dashboard.</div>';
    return;
  }
  grid.innerHTML = projects.map((project) => createProjectCard(project)).join('');
};

const init = async () => {
  initNavigation('works');
  const category = document.body.getAttribute('data-category');
  if (!category) return;
  await loadProjects();
  renderCategoryDescription(category);
  const projects = getProjectsBySection(category);
  renderProjects(projects);
};

document.addEventListener('DOMContentLoaded', init);
