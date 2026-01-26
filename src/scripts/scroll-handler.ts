/**
 * Full-Page Scroll Handler
 * Manages scroll-snap navigation, keyboard support, URL hash updates, and nav dots
 */

// Type definitions
interface Section {
  id: string;
  element: HTMLElement;
  navDot?: HTMLButtonElement;
  navLink?: HTMLAnchorElement;
}

interface ScrollHandlerOptions {
  containerSelector?: string;
  sectionSelector?: string;
  updateHash?: boolean;
  keyboardNav?: boolean;
}

const DEFAULT_OPTIONS: Required<ScrollHandlerOptions> = {
  containerSelector: '#main-content',
  sectionSelector: 'section[id]',
  updateHash: true,
  keyboardNav: true,
};

class ScrollHandler {
  private container: HTMLElement | null = null;
  private sections: Section[] = [];
  private currentIndex = 0;
  private options: Required<ScrollHandlerOptions>;
  private observer: IntersectionObserver | null = null;
  private scrollTimeout: number | null = null;
  private boundHandleKeyDown: (e: KeyboardEvent) => void;
  private boundHandleScroll: () => void;

  constructor(options: ScrollHandlerOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleScroll = this.handleScroll.bind(this);
    this.init();
  }

  private init(): void {
    const container = document.querySelector(this.options.containerSelector);
    if (!container) {
      console.warn('ScrollHandler: Container not found');
      return;
    }

    this.container = container as HTMLElement;

    this.collectSections();
    this.createNavDots();
    this.setupIntersectionObserver();
    this.setupEventListeners();
    this.handleInitialHash();
  }

  private collectSections(): void {
    if (!this.container) return;

    const sectionElements = this.container.querySelectorAll(
      this.options.sectionSelector
    );

    sectionElements.forEach((el) => {
      const element = el as HTMLElement;
      const id = element.id;

      if (id) {
        this.sections.push({
          id,
          element,
          navLink: document.querySelector(
            `nav a[href="#${id}"]`
          ) as HTMLAnchorElement | undefined,
        });
      }
    });
  }

  private createNavDots(): void {
    // Create nav dots container
    const navDots = document.createElement('nav');
    navDots.className = 'nav-dots';
    navDots.setAttribute('aria-label', 'Page sections');

    this.sections.forEach((section, index) => {
      const button = document.createElement('button');
      button.className = 'nav-dots__item';
      button.setAttribute(
        'aria-label',
        `Go to ${this.formatSectionName(section.id)}`
      );
      button.setAttribute('data-section', section.id);

      // Tooltip span
      const label = document.createElement('span');
      label.className = 'nav-dots__label';
      label.textContent = this.formatSectionName(section.id);
      button.appendChild(label);

      button.addEventListener('click', () => this.scrollToSection(index));

      navDots.appendChild(button);
      section.navDot = button;
    });

    document.body.appendChild(navDots);
  }

  private formatSectionName(id: string): string {
    // Convert "about" to "About", "skills" to "Skills", etc.
    return id
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private setupIntersectionObserver(): void {
    if (!this.container) return;

    const options: IntersectionObserverInit = {
      root: this.container,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = this.sections.findIndex(
            (s) => s.element === entry.target
          );
          if (index !== -1) {
            this.setActiveSection(index);
          }
        }
      });
    }, options);

    this.sections.forEach((section) => {
      this.observer?.observe(section.element);
    });
  }

  private setupEventListeners(): void {
    // Keyboard navigation
    if (this.options.keyboardNav) {
      document.addEventListener('keydown', this.boundHandleKeyDown);
    }

    // Scroll event for hash updates
    this.container?.addEventListener('scroll', this.boundHandleScroll, {
      passive: true,
    });

    // Handle nav link clicks for smooth scrolling
    document.querySelectorAll('nav a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = (e.currentTarget as HTMLAnchorElement).getAttribute(
          'href'
        );
        if (href) {
          const targetId = href.substring(1);
          const index = this.sections.findIndex((s) => s.id === targetId);
          if (index !== -1) {
            e.preventDefault();
            this.scrollToSection(index);
          }
        }
      });
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Ignore if user is typing in an input
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        e.preventDefault();
        this.scrollToSection(
          Math.min(this.currentIndex + 1, this.sections.length - 1)
        );
        break;
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        this.scrollToSection(Math.max(this.currentIndex - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        this.scrollToSection(0);
        break;
      case 'End':
        e.preventDefault();
        this.scrollToSection(this.sections.length - 1);
        break;
    }
  }

  private handleScroll(): void {
    if (this.scrollTimeout) {
      window.clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = window.setTimeout(() => {
      // Update hash after scroll settles
      if (this.options.updateHash) {
        this.updateUrlHash();
      }
    }, 150);
  }

  private handleInitialHash(): void {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const index = this.sections.findIndex((s) => s.id === hash);
      if (index !== -1) {
        // Delay to ensure DOM is ready
        requestAnimationFrame(() => {
          this.scrollToSection(index, false);
          this.setActiveSection(index);
        });
      }
    } else {
      // Set first section as active by default
      this.setActiveSection(0);
    }
  }

  private scrollToSection(index: number, smooth = true): void {
    const section = this.sections[index];
    if (!section) return;

    section.element.scrollIntoView({
      behavior: smooth && !this.prefersReducedMotion() ? 'smooth' : 'auto',
      block: 'start',
    });
  }

  private setActiveSection(index: number): void {
    if (this.currentIndex === index) return;

    this.currentIndex = index;

    // Update nav dots and nav links
    this.sections.forEach((section, i) => {
      const isActive = i === index;

      section.navDot?.setAttribute('aria-current', isActive.toString());
      section.navDot?.classList.toggle('is-active', isActive);

      section.navLink?.setAttribute(
        'aria-current',
        isActive ? 'page' : 'false'
      );
      section.navLink?.classList.toggle('is-active', isActive);
    });

    // Announce section change for screen readers
    this.announceSection(this.formatSectionName(this.sections[index].id));
  }

  private updateUrlHash(): void {
    const section = this.sections[this.currentIndex];
    if (section && window.location.hash !== `#${section.id}`) {
      history.replaceState(null, '', `#${section.id}`);
    }
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private announceSection(sectionName: string): void {
    // Create or reuse live region for screen reader announcements
    let announcer = document.getElementById('scroll-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'scroll-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'visually-hidden';
      document.body.appendChild(announcer);
    }

    announcer.textContent = `Now viewing: ${sectionName}`;
  }

  // Public API
  public goToSection(sectionId: string): void {
    const index = this.sections.findIndex((s) => s.id === sectionId);
    if (index !== -1) {
      this.scrollToSection(index);
    }
  }

  public getCurrentSection(): string {
    return this.sections[this.currentIndex]?.id ?? '';
  }

  public destroy(): void {
    this.observer?.disconnect();
    document.removeEventListener('keydown', this.boundHandleKeyDown);
    this.container?.removeEventListener('scroll', this.boundHandleScroll);

    // Remove nav dots
    document.querySelector('.nav-dots')?.remove();

    // Remove announcer
    document.getElementById('scroll-announcer')?.remove();
  }
}

// Export initialization function
export function initScrollHandler(
  options?: ScrollHandlerOptions
): ScrollHandler {
  return new ScrollHandler(options);
}

export { ScrollHandler };
export type { ScrollHandlerOptions };
