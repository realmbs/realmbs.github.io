/**
 * Resume Renderer
 * Dynamically renders resume.json data to the DOM
 */

import type { Resume } from '../types/resume';
import resumeData from '../data/resume.json';

const resume = resumeData as Resume;

/**
 * Format ISO date string to readable format
 * "2023-01" -> "Jan 2023"
 */
function formatDate(isoDate: string): string {
  const [year, month] = isoDate.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Render About section bio paragraphs
 */
function renderAbout(): void {
  const container = document.getElementById('about-content');
  if (!container) return;

  container.innerHTML = resume.personal.bio
    .map((paragraph, index, arr) =>
      `<p class="${index < arr.length - 1 ? 'mb-4' : ''}">${paragraph}</p>`
    )
    .join('');
}

/**
 * Render Skills section with category cards
 */
function renderSkills(): void {
  const container = document.getElementById('skills-container');
  if (!container) return;

  container.innerHTML = resume.skills
    .map(category => `
      <article class="card">
        <h3 class="mb-4">${category.name}</h3>
        <ul class="flex flex-wrap gap-2" role="list">
          ${category.skills.map(skill => `<li><span class="skill-badge">${skill}</span></li>`).join('')}
        </ul>
      </article>
    `)
    .join('');
}

/**
 * Render featured capstone project
 */
function renderCapstone(): void {
  const container = document.getElementById('capstone-project');
  if (!container) return;

  const capstone = resume.projects.find(p => p.featured);
  if (!capstone) return;

  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="relative">
        <img src="${capstone.image}" alt="${capstone.title} Preview" class="rounded-lg w-full" loading="lazy" />
        <span class="absolute top-4 left-4 skill-badge">Featured</span>
      </div>
      <div class="flex flex-col justify-center">
        <h3 class="mb-4">${capstone.title}</h3>
        <p class="text-muted mb-4">${capstone.description}</p>
        <ul class="flex flex-wrap gap-2 mb-6" role="list">
          ${capstone.technologies.map(tech => `<li><span class="skill-badge skill-badge--small">${tech}</span></li>`).join('')}
        </ul>
        <div class="flex gap-4">
          ${capstone.demoUrl ? `<a href="${capstone.demoUrl}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Live Demo</a>` : ''}
          ${capstone.codeUrl ? `<a href="${capstone.codeUrl}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">View Code</a>` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render non-featured projects grid
 */
function renderProjects(): void {
  const container = document.getElementById('projects-container');
  if (!container) return;

  const projects = resume.projects.filter(p => !p.featured);

  container.innerHTML = projects
    .map(project => `
      <article class="card">
        <img src="${project.image}" alt="${project.title} Preview" class="rounded-lg mb-4 w-full" loading="lazy" />
        <h3 class="mb-2">${project.title}</h3>
        <p class="text-muted mb-4 line-clamp-3">${project.description}</p>
        <ul class="flex flex-wrap gap-2 mb-4" role="list">
          ${project.technologies.map(tech => `<li><span class="skill-badge skill-badge--small">${tech}</span></li>`).join('')}
        </ul>
        <div class="flex gap-4">
          ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer">Demo</a>` : ''}
          ${project.codeUrl ? `<a href="${project.codeUrl}" target="_blank" rel="noopener noreferrer">Code</a>` : ''}
        </div>
      </article>
    `)
    .join('');
}

/**
 * Render work experience timeline
 */
function renderExperience(): void {
  const container = document.getElementById('experience-container');
  if (!container) return;

  container.innerHTML = resume.experience
    .map(exp => `
      <article class="mb-8 relative pl-8">
        <div class="timeline-marker" aria-hidden="true"></div>
        <header class="mb-2">
          <h3 class="mb-1">${exp.title}</h3>
          <p class="text-primary font-medium">${exp.company}</p>
          <p class="text-muted">
            <time datetime="${exp.startDate}">${formatDate(exp.startDate)}</time> - ${exp.endDate ? `<time datetime="${exp.endDate}">${formatDate(exp.endDate)}</time>` : 'Present'}
          </p>
        </header>
        <ul class="mb-4">
          ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
        </ul>
        <ul class="flex flex-wrap gap-2" role="list">
          ${exp.technologies.map(tech => `<li><span class="skill-badge skill-badge--small">${tech}</span></li>`).join('')}
        </ul>
      </article>
    `)
    .join('');
}

/**
 * Render education entries
 */
function renderEducation(): void {
  const container = document.getElementById('education-container');
  if (!container) return;

  container.innerHTML = resume.education
    .map(edu => `
      <article class="card mb-4">
        <h4 class="mb-1">${edu.degree}</h4>
        <p class="text-primary font-medium">${edu.institution}</p>
        <p class="text-muted">
          <time datetime="${edu.startYear}">${edu.startYear}</time> - <time datetime="${edu.endYear}">${edu.endYear}</time>
          ${edu.gpa ? ` | GPA: ${edu.gpa.toFixed(1)}` : ''}
        </p>
      </article>
    `)
    .join('');
}

/**
 * Render certifications
 */
function renderCertifications(): void {
  const container = document.getElementById('certifications-container');
  if (!container) return;

  container.innerHTML = resume.certifications
    .map(cert => `
      <article class="card mb-4">
        <h4 class="mb-1">${cert.name}</h4>
        <p class="text-muted">
          Issued <time datetime="${cert.issueDate}">${formatDate(cert.issueDate)}</time>
        </p>
        ${cert.credentialUrl ? `<a href="${cert.credentialUrl}" target="_blank" rel="noopener noreferrer">View Credential</a>` : ''}
      </article>
    `)
    .join('');
}

/**
 * Render contact information and social links
 */
function renderContact(): void {
  // Update email link
  const emailLink = document.querySelector('#contact address a[href^="mailto:"]');
  if (emailLink) {
    emailLink.setAttribute('href', `mailto:${resume.personal.email}`);
    emailLink.textContent = resume.personal.email;
  }

  // Update location
  const locationSpan = document.querySelector('#contact address li:last-child span');
  if (locationSpan) {
    locationSpan.textContent = resume.personal.location;
  }

  // Update social links
  const socialList = document.querySelector('#contact ul.flex.gap-4');
  if (socialList) {
    socialList.innerHTML = resume.personal.socialLinks
      .map(link => `
        <li>
          <a href="${link.url}" target="_blank" rel="noopener noreferrer" aria-label="${link.label} Profile" class="social-link">
            ${link.label}
          </a>
        </li>
      `)
      .join('');
  }
}

/**
 * Update footer year to current year
 */
function renderFooterYear(): void {
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }
}

/**
 * Initialize all resume rendering
 */
export function initResumeRenderer(): void {
  renderAbout();
  renderSkills();
  renderCapstone();
  renderProjects();
  renderExperience();
  renderEducation();
  renderCertifications();
  renderContact();
  renderFooterYear();
}
