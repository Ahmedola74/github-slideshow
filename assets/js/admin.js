import { initNavigation } from './nav.js';
import { loadProjects, upsertProject, deleteProject, importProjects, resetProjectsToSeed } from './projects.js';
import { downloadJSON, sections, showToast, slugify } from './utils.js';

const PASSWORD = 'blue-nebula-9090';

let projects = [];
let editingProject = null;
let mediaItems = [];
let tagItems = [];

const authWrapper = () => document.querySelector('[data-auth]');
const dashboardWrapper = () => document.querySelector('[data-dashboard]');
const projectsTable = () => document.querySelector('[data-projects-table] tbody');
const projectForm = () => document.querySelector('[data-project-form]');
const mediaListEl = () => document.querySelector('[data-media-list]');
const tagListEl = () => document.querySelector('[data-tag-list]');

const toggleAuth = (authed) => {
  authWrapper()?.classList.toggle('hidden', authed);
  dashboardWrapper()?.classList.toggle('hidden', !authed);
};

const resetForm = () => {
  editingProject = null;
  projectForm().reset();
  tagItems = [];
  mediaItems = [];
  renderTags();
  renderMediaItems();
  projectForm().querySelector('[name="published"]').checked = true;
  projectForm().querySelector('[name="featured"]').checked = false;
  projectForm().querySelector('[name="order"]').value = '0';
  projectForm().querySelector('[data-form-title]').textContent = 'Create new project';
};

const populateForm = (project) => {
  editingProject = project;
  projectForm().querySelector('[data-form-title]').textContent = `Editing: ${project.projectName}`;
  projectForm().projectName.value = project.projectName || '';
  projectForm().client.value = project.client || '';
  projectForm().section.value = project.section || sections[0];
  projectForm().slug.value = project.slug || '';
  projectForm().year.value = project.year || '';
  projectForm().order.value = project.order || 0;
  projectForm().story.value = project.story || '';
  projectForm().externalLink.value = project.externalLink || '';
  projectForm().featured.checked = Boolean(project.featured);
  projectForm().published.checked = project.published !== false;
  tagItems = [...(project.tags || [])];
  mediaItems = [...(project.media || [])];
  renderTags();
  renderMediaItems();
};

const createRow = (project) => `<tr>
    <td>${project.projectName}</td>
    <td>${project.section}</td>
    <td>${project.client || ''}</td>
    <td>${project.year || ''}</td>
    <td>${project.featured ? '⭐️' : ''}</td>
    <td>${project.published === false ? 'Draft' : 'Live'}</td>
    <td>
      <div class="media-item-controls">
        <button type="button" data-action="edit" data-id="${project.id}">Edit</button>
        <button type="button" data-action="preview" data-slug="${project.slug}">Preview</button>
        <button type="button" data-action="delete" data-id="${project.id}">Delete</button>
      </div>
    </td>
  </tr>`;

const renderTable = () => {
  const body = projectsTable();
  if (!projects.length) {
    body.innerHTML = '<tr><td colspan="7"><div class="empty-state">No projects yet. Create one using the form below.</div></td></tr>';
    return;
  }
  body.innerHTML = projects.map((project) => createRow(project)).join('');
};

const renderTags = () => {
  const container = tagListEl();
  if (!container) return;
  container.innerHTML = tagItems
    .map((tag, index) => `<span class="chip">${tag}<button type="button" data-remove-tag="${index}">×</button></span>`)
    .join('');
};

const renderMediaItems = () => {
  const container = mediaListEl();
  if (!container) return;
  if (!mediaItems.length) {
    container.innerHTML = '<div class="empty-state">No media items yet. Use “Add media” to include images or videos.</div>';
    return;
  }
  container.innerHTML = mediaItems
    .map(
      (item, index) => `
        <div class="media-item" data-index="${index}">
          <label>Type
            <select data-field="type">
              <option value="image" ${item.type !== 'video' ? 'selected' : ''}>Image</option>
              <option value="video" ${item.type === 'video' ? 'selected' : ''}>Video</option>
            </select>
          </label>
          <label>Source URL
            <input type="text" data-field="src" value="${item.src || ''}" placeholder="/uploads/your-file.jpg">
          </label>
          <label class="${item.type === 'video' ? '' : 'hidden'}">Poster
            <input type="text" data-field="poster" value="${item.poster || ''}" placeholder="Optional preview image">
          </label>
          <label>Alt / Caption
            <input type="text" data-field="alt" value="${item.alt || ''}" placeholder="Describe the media for accessibility">
          </label>
          <label class="toggle">
            <input type="radio" name="cover" data-cover value="${index}" ${item.isCover ? 'checked' : ''}>
            Mark as cover
          </label>
          <div class="media-item-controls">
            <button type="button" data-action="move-up" data-index="${index}">Move up</button>
            <button type="button" data-action="move-down" data-index="${index}">Move down</button>
            <button type="button" data-action="remove" data-index="${index}">Remove</button>
          </div>
        </div>
      `
    )
    .join('');

  container.querySelectorAll('select, input').forEach((input) => {
    input.addEventListener('input', () => {
      const parent = input.closest('.media-item');
      const index = Number(parent.dataset.index);
      const field = input.dataset.field;
      if (field) {
        mediaItems[index] = { ...mediaItems[index], [field]: input.value };
      }
      if (input.dataset.cover !== undefined) {
        mediaItems = mediaItems.map((item, idx) => ({ ...item, isCover: idx === index }));
        renderMediaItems();
      }
      if (field === 'type') {
        mediaItems[index].type = input.value;
        renderMediaItems();
      }
    });
  });

  container.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.index);
      const action = button.dataset.action;
      if (action === 'remove') {
        mediaItems.splice(index, 1);
        renderMediaItems();
      }
      if (action === 'move-up' && index > 0) {
        const [item] = mediaItems.splice(index, 1);
        mediaItems.splice(index - 1, 0, item);
        renderMediaItems();
      }
      if (action === 'move-down' && index < mediaItems.length - 1) {
        const [item] = mediaItems.splice(index, 1);
        mediaItems.splice(index + 1, 0, item);
        renderMediaItems();
      }
    });
  });
};

const gatherFormData = () => {
  const form = projectForm();
  const formData = new FormData(form);
  const project = editingProject ? { ...editingProject } : {};
  project.projectName = formData.get('projectName');
  project.client = formData.get('client');
  project.section = formData.get('section');
  project.slug = formData.get('slug') || slugify(project.projectName);
  project.year = Number(formData.get('year')) || '';
  project.order = Number(formData.get('order')) || 0;
  project.tags = [...tagItems];
  project.story = formData.get('story');
  project.externalLink = formData.get('externalLink');
  project.featured = formData.get('featured') === 'on';
  project.published = formData.get('published') === 'on';
  project.media = mediaItems.map((item, index) => ({
    ...item,
    type: item.type === 'video' ? 'video' : 'image',
    isCover: item.isCover || index === 0
  }));
  const timestamp = new Date().toISOString();
  project.updatedAt = timestamp;
  if (!project.createdAt) project.createdAt = timestamp;
  return project;
};

const handleFormSubmit = (event) => {
  event.preventDefault();
  const project = gatherFormData();
  upsertProject(project);
  showToast('Project saved successfully');
  loadProjects().then((items) => {
    projects = items;
    renderTable();
  });
};

const handleTableActions = (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (action === 'edit') {
    const project = projects.find((item) => item.id === id);
    if (project) populateForm(project);
  }
  if (action === 'delete') {
    if (confirm('Delete this project? This cannot be undone.')) {
      deleteProject(id);
      loadProjects().then((items) => {
        projects = items;
        renderTable();
        resetForm();
      });
    }
  }
  if (action === 'preview') {
    const slug = button.dataset.slug;
    window.open(`../works/project.html?slug=${slug}`, '_blank');
  }
};

const attachTagInput = () => {
  const input = document.querySelector('[data-tag-input]');
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const value = input.value.trim();
      if (value && !tagItems.includes(value)) {
        tagItems.push(value);
        renderTags();
        input.value = '';
      }
    }
    if (event.key === 'Backspace' && !input.value && tagItems.length) {
      tagItems.pop();
      renderTags();
    }
  });

  tagListEl().addEventListener('click', (event) => {
    const button = event.target.closest('button[data-remove-tag]');
    if (!button) return;
    const index = Number(button.dataset.removeTag);
    tagItems.splice(index, 1);
    renderTags();
  });
};

const attachMediaButton = () => {
  document.querySelector('[data-add-media]').addEventListener('click', () => {
    mediaItems.push({ type: 'image', src: '', alt: '' });
    renderMediaItems();
  });
};

const attachSlugAutomation = () => {
  projectForm().projectName.addEventListener('blur', () => {
    if (!projectForm().slug.value) {
      projectForm().slug.value = slugify(projectForm().projectName.value);
    }
  });
};

const attachImportExport = () => {
  document.querySelector('[data-export]').addEventListener('click', () => {
    downloadJSON({ projects });
  });

  document.querySelector('[data-import]').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    const imported = data.projects || data;
    importProjects(imported);
    projects = await loadProjects();
    renderTable();
    resetForm();
    event.target.value = '';
    showToast('Projects imported');
  });

  document.querySelector('[data-reset]').addEventListener('click', async () => {
    if (!confirm('Reset to starter projects? Your local changes will be lost.')) return;
    await resetProjectsToSeed();
    projects = await loadProjects();
    renderTable();
    resetForm();
    showToast('Projects restored');
  });
};

const attachNewButton = () => {
  document.querySelector('[data-new-project]').addEventListener('click', () => {
    resetForm();
  });
};

const handleAuth = () => {
  const form = document.querySelector('[data-auth-form]');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = form.password.value.trim();
    if (value === PASSWORD) {
      toggleAuth(true);
      initializeDashboard();
      showToast('Welcome back, Ahmed');
    } else {
      showToast('Incorrect password');
    }
    form.reset();
  });
};

const initializeDashboard = async () => {
  projects = await loadProjects();
  renderTable();
  resetForm();
};

const init = () => {
  initNavigation();
  toggleAuth(false);
  handleAuth();
  attachTagInput();
  attachMediaButton();
  attachSlugAutomation();
  attachImportExport();
  attachNewButton();
  projectsTable().addEventListener('click', handleTableActions);
  projectForm().addEventListener('submit', handleFormSubmit);
};

document.addEventListener('DOMContentLoaded', init);
