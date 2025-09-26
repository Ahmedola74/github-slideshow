import { initNavigation, resolveAssetPath } from './nav.js';
import { loadProjects, getProjectBySlug, getSiblingProjects } from './projects.js';
import { formatRichText } from './utils.js';

const renderProjectHero = (project) => {
  const container = document.querySelector('[data-project-hero]');
  if (!container) return;
  container.innerHTML = `
    <div class="badge">${project.section}</div>
    <h1>${project.projectName}</h1>
    <div class="project-meta">
      <span>${project.client || ''}</span>
      <span>${project.year || ''}</span>
      ${(project.tags || []).map((tag) => `<span class="badge">${tag}</span>`).join('')}
    </div>
  `;
};

const renderGallery = (project) => {
  const gallery = document.querySelector('[data-project-gallery]');
  if (!gallery) return;
  gallery.innerHTML = (project.media || [])
    .map((item) => {
      if (item.type === 'video') {
        return `<video src="${resolveAssetPath(item.src)}" poster="${item.poster ? resolveAssetPath(item.poster) : ''}" controls preload="metadata"></video>`;
      }
      return `<img src="${resolveAssetPath(item.src)}" alt="${item.alt || project.projectName}">`;
    })
    .join('');
};

const renderStory = (project) => {
  const story = document.querySelector('[data-project-story]');
  if (!story) return;
  if (!project.story) {
    story.classList.add('hidden');
    return;
  }
  story.classList.remove('hidden');
  story.innerHTML = formatRichText(project.story);
};

const renderExternalLink = (project) => {
  const link = document.querySelector('[data-project-link]');
  if (!link) return;
  if (!project.externalLink) {
    link.classList.add('hidden');
    return;
  }
  link.classList.remove('hidden');
  link.href = project.externalLink;
  link.textContent = 'View live project';
};

const renderPrevNext = (project) => {
  const container = document.querySelector('[data-prev-next]');
  if (!container) return;
  const { previous, next } = getSiblingProjects(project.slug);
  container.innerHTML = `
    ${
      previous
        ? `<a href="./project.html?slug=${previous.slug}">
            <small>Previous</small>
            <div>${previous.projectName}</div>
          </a>`
        : ''
    }
    ${
      next
        ? `<a href="./project.html?slug=${next.slug}">
            <small>Next</small>
            <div>${next.projectName}</div>
          </a>`
        : ''
    }
  `;
};

const bindShareButtons = (project) => {
  const shareButtons = document.querySelectorAll('[data-share]');
  shareButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const type = button.getAttribute('data-share');
      const url = `${window.location.origin}${window.location.pathname}?slug=${project.slug}`;
      if (type === 'native' && navigator.share) {
        await navigator.share({
          title: project.projectName,
          text: project.story?.slice(0, 120) || 'Explore this project by Ahmed Adel',
          url
        });
        return;
      }
      const encoded = encodeURIComponent(url);
      const encodedTitle = encodeURIComponent(project.projectName);
      let shareUrl = url;
      if (type === 'twitter') {
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`;
      }
      if (type === 'linkedin') {
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`;
      }
      window.open(shareUrl, '_blank', 'noopener');
    });
  });
};

const showNotFound = () => {
  const wrapper = document.querySelector('[data-project-wrapper]');
  if (wrapper) {
    wrapper.innerHTML = '<div class="empty-state">Project not found. Return to <a href="./index.html">all works</a>.</div>';
  }
};

const init = async () => {
  initNavigation('works');
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) {
    showNotFound();
    return;
  }
  await loadProjects();
  const project = getProjectBySlug(slug);
  if (!project || project.published === false) {
    showNotFound();
    return;
  }
  renderProjectHero(project);
  renderGallery(project);
  renderStory(project);
  renderExternalLink(project);
  renderPrevNext(project);
  bindShareButtons(project);
};

document.addEventListener('DOMContentLoaded', init);
