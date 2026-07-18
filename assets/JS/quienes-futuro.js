import { projectTimelineData } from './project-timeline-data.js';

const timeline = document.querySelector('#project-timeline');
let initialProjectOpened = false;

const statusLabels = {
  finalized: 'Finalizado',
  development: 'En desarrollo',
  current: 'Actual',
  future: 'Futuro'
};

const createElement = (tagName, className, text) => {
  const element = document.createElement(tagName);

  if (className) element.className = className;
  if (text) element.textContent = text;

  return element;
};

const normalizeId = (value, index) => {
  const safeId = String(value || `proyecto-${index + 1}`)
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return safeId || `proyecto-${index + 1}`;
};

const setExpanded = (button, panel, expanded) => {
  button.setAttribute('aria-expanded', String(expanded));
  panel.hidden = !expanded;
  button.closest('.project-timeline-card')?.classList.toggle('is-open', expanded);
};

const closeOtherProjects = (activeButton) => {
  timeline.querySelectorAll('.project-timeline-toggle[aria-expanded="true"]').forEach((button) => {
    if (button === activeButton) return;

    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (panel) setExpanded(button, panel, false);
  });
};

const toggleProject = (button) => {
  const panel = document.getElementById(button.getAttribute('aria-controls'));
  if (!panel) return;

  const shouldExpand = button.getAttribute('aria-expanded') !== 'true';
  if (shouldExpand) closeOtherProjects(button);
  setExpanded(button, panel, shouldExpand);
};

const createProjectItem = (project, index) => {
  const safeId = normalizeId(project.id, index);
  const titleId = `project-title-${safeId}`;
  const buttonId = `project-toggle-${safeId}`;
  const panelId = `project-panel-${safeId}`;
  const statusLabel = statusLabels[project.status] || 'Sin definir';
  const item = createElement('li', `project-timeline-item project-status-${project.status || 'undefined'}`);
  const node = createElement('span', 'project-timeline-node');
  const article = createElement('article', 'project-timeline-card');
  const heading = createElement('h2', 'project-timeline-heading');
  const button = createElement('button', 'project-timeline-toggle');
  const headingContent = createElement('span', 'project-timeline-heading-content');
  const title = createElement('span', 'project-timeline-project-title', project.title);
  const meta = createElement('span', 'project-timeline-meta');
  const time = createElement('time', 'project-timeline-date', project.period);
  const status = createElement('span', 'project-timeline-status', `Estado: ${statusLabel}`);
  const summary = createElement('span', 'project-timeline-summary', project.summary || '');
  const chevron = createElement('span', 'project-timeline-chevron', '+');
  const panel = createElement('div', 'project-timeline-panel');
  const details = createElement('div', 'project-timeline-details');
  const expanded = Boolean(project.openByDefault && !initialProjectOpened);

  if (expanded) initialProjectOpened = true;

  node.setAttribute('aria-hidden', 'true');
  item.dataset.status = project.status || 'undefined';
  article.setAttribute('aria-labelledby', titleId);
  title.id = titleId;
  time.dateTime = project.dateTime || '';
  button.type = 'button';
  button.id = buttonId;
  button.setAttribute('aria-expanded', String(expanded));
  button.setAttribute('aria-controls', panelId);
  button.setAttribute('aria-label', `${project.title}. ${project.period}. Estado: ${statusLabel}`);
  chevron.setAttribute('aria-hidden', 'true');
  panel.id = panelId;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', buttonId);
  panel.hidden = !expanded;

  meta.append(time, status);
  headingContent.append(title, meta);
  if (project.summary) headingContent.append(summary);
  button.append(headingContent, chevron);
  heading.append(button);

  (project.content?.paragraphs || []).forEach((paragraph) => {
    details.append(createElement('p', '', paragraph));
  });

  if (project.content?.highlights?.length) {
    const listTitle = createElement('h3', 'project-timeline-details-title', 'Aspectos destacados');
    const list = createElement('ul', 'project-timeline-details-list');

    project.content.highlights.forEach((highlight) => {
      list.append(createElement('li', '', highlight));
    });

    details.append(listTitle, list);
  }

  panel.append(details);
  article.append(heading, panel);
  if (expanded) article.classList.add('is-open');
  item.append(node, article);

  button.addEventListener('click', () => toggleProject(button));

  return item;
};

const moveFocus = (event) => {
  const buttons = [...timeline.querySelectorAll('.project-timeline-toggle')];
  const currentIndex = buttons.indexOf(event.target);
  if (currentIndex < 0) return;

  const destinations = {
    ArrowDown: Math.min(currentIndex + 1, buttons.length - 1),
    ArrowUp: Math.max(currentIndex - 1, 0),
    Home: 0,
    End: buttons.length - 1
  };

  if (!(event.key in destinations)) return;

  event.preventDefault();
  buttons[destinations[event.key]]?.focus();
};

if (timeline) {
  projectTimelineData.forEach((project, index) => {
    timeline.append(createProjectItem(project, index));
  });

  timeline.addEventListener('keydown', moveFocus);
}
