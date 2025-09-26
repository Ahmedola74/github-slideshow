export const slugify = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

export const formatYear = (value) => (value ? value.toString() : '');

export const createElement = (tag, options = {}) => {
  const el = document.createElement(tag);
  if (options.className) el.className = options.className;
  if (options.html) el.innerHTML = options.html;
  if (options.text) el.textContent = options.text;
  if (options.attrs) Object.entries(options.attrs).forEach(([key, val]) => el.setAttribute(key, val));
  return el;
};

export const randomItem = (arr = []) => (arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined);

export const uniqueValues = (arr, key) => {
  const map = new Map();
  arr.forEach((item) => {
    const value = item[key];
    if (value !== undefined && value !== null && value !== '') {
      map.set(value, value);
    }
  });
  return Array.from(map.values()).sort();
};

export const uniqueTagValues = (projects) => {
  const tags = new Set();
  projects.forEach((project) => {
    (project.tags || []).forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
};

export const downloadJSON = (data, filename = 'projects.json') => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const formatMediaTypeLabel = (type) => (type === 'video' ? 'Video' : 'Image');

export const showToast = (message) => {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
};

export const formatRichText = (value = '') => {
  const lines = value.split(/\n{2,}/).map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`);
  return lines.join('\n');
};

export const computeBasePath = () => {
  const attr = document.body.getAttribute('data-base-path');
  if (!attr) return '.';
  return attr;
};

export const normalizePath = (path = '') => path.replace(/\/+/, '/');

export const categoryDescriptions = {
  Branding:
    'Visual identity systems, brand guidelines, logo suites, and cohesive design languages for future-focused brands.',
  'Social Media':
    'Campaigns, storytelling, and content systems designed for social platforms with motion-ready assets.',
  'UI/UX':
    'Interfaces, design systems, and product journeys across web and mobile with a human-centric perspective.',
  Videos:
    'Narrative-driven video edits, motion graphics, and teasers with cinematic flair and sound-driven pacing.',
  Presentations:
    'Pitch decks, keynote narratives, and visual storytelling that elevate complex ideas with clarity.',
  Layouting:
    'Editorial spreads, posters, and print-ready compositions blending typography, hierarchy, and futurism.'
};

export const sections = [
  'Branding',
  'Social Media',
  'UI/UX',
  'Videos',
  'Presentations',
  'Layouting'
];
