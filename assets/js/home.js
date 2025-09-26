import { initNavigation, initSmoothAnchors, resolveAssetPath } from './nav.js';
import {
  loadProjects,
  getFeaturedProjects,
  getProjectsBySection,
  getPublishedProjects
} from './projects.js';
import { randomItem, sections } from './utils.js';

const createMediaElement = (media) => {
  if (!media) return '';
  const source = resolveAssetPath(media.src);
  if (media.type === 'video') {
    return `<video src="${source}" poster="${media.poster ? resolveAssetPath(media.poster) : ''}" muted loop playsinline></video>`;
  }
  return `<img src="${source}" alt="${media.alt || ''}">`;
};

const renderFeaturedCarousel = (projects) => {
  const container = document.querySelector('[data-home-carousel] .carousel-track');
  if (!container) return;
  if (!projects.length) {
    container.innerHTML = '<div class="empty-state">Add featured projects in the dashboard to see them here.</div>';
    return;
  }
  container.innerHTML = projects
    .map((project) => {
      const cover = project.media?.find((item) => item.isCover) || project.media?.[0];
      const mediaMarkup = createMediaElement(cover);
      return `<div class="carousel-slide" data-slug="${project.slug}">
          ${mediaMarkup}
          <div class="carousel-caption">
            <div class="badge">${project.section}</div>
            <h3>${project.projectName}</h3>
            <p class="text-muted">${project.client || ''}</p>
          </div>
        </div>`;
    })
    .join('');
};

const bindCarouselControls = () => {
  const container = document.querySelector('[data-home-carousel]');
  if (!container) return;
  const track = container.querySelector('.carousel-track');
  const slides = () => Array.from(container.querySelectorAll('.carousel-slide'));
  let index = 0;

  const update = () => {
    const slideCount = slides().length;
    if (!slideCount) return;
    index = (index + slideCount) % slideCount;
    track.style.transform = `translateX(-${index * 100}%)`;
  };

  container.querySelector('.carousel-control.prev')?.addEventListener('click', () => {
    index -= 1;
    update();
  });

  container.querySelector('.carousel-control.next')?.addEventListener('click', () => {
    index += 1;
    update();
  });

  let autoplay = setInterval(() => {
    index += 1;
    update();
  }, 6000);

  container.addEventListener('mouseenter', () => {
    clearInterval(autoplay);
  });

  container.addEventListener('mouseleave', () => {
    clearInterval(autoplay);
    autoplay = setInterval(() => {
      index += 1;
      update();
    }, 6000);
  });
};

const renderBentoGrid = (projects) => {
  const grid = document.querySelector('[data-bento-grid]');
  if (!grid) return;
  grid.innerHTML = sections
    .map((section) => {
      const sectionSlug = section.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const items = projects.filter((project) => project.section === section && project.published !== false);
      const pick = randomItem(items);
      const cover = pick?.media?.find((item) => item.isCover) || pick?.media?.[0];
      const mediaMarkup = cover ? `<img src="${resolveAssetPath(cover.src)}" alt="${cover.alt || section}">` : '';
      return `<a class="bento-card" href="./works/${sectionSlug}/" aria-label="View ${section} projects">
        ${mediaMarkup}
        <div class="bento-overlay">
          <span class="badge">${section}</span>
          <h3>${section}</h3>
          <p class="text-muted">${items.length} project${items.length === 1 ? '' : 's'}</p>
        </div>
      </a>`;
    })
    .join('');
};

const renderRecentWorks = (projects) => {
  const grid = document.querySelector('[data-home-works]');
  if (!grid) return;
  if (!projects.length) {
    grid.innerHTML = '<div class="empty-state">No published projects yet. Add them in the dashboard.</div>';
    return;
  }
  const recent = projects.slice(0, 6);
  grid.innerHTML = recent
    .map((project) => {
      const cover = project.media?.find((item) => item.isCover) || project.media?.[0];
      const mediaMarkup = createMediaElement(cover);
      return `<a class="project-card" href="./works/project.html?slug=${project.slug}">
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
    })
    .join('');
};

const initParticles = () => {
  const wrapper = document.querySelector('[data-particles]');
  if (!wrapper) return;
  for (let i = 0; i < 2; i += 1) {
    const particle = document.createElement('span');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 80}%`;
    particle.style.top = `${Math.random() * 80}%`;
    wrapper.appendChild(particle);
  }
};

const init = async () => {
  initNavigation('home');
  initSmoothAnchors();
  initParticles();
  const projects = await loadProjects();
  renderFeaturedCarousel(getFeaturedProjects());
  bindCarouselControls();
  renderBentoGrid(projects);
  renderRecentWorks(getPublishedProjects());
};

document.addEventListener('DOMContentLoaded', init);
