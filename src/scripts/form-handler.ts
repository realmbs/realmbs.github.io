/**
 * Contact Form Handler
 * Manages form validation and submission
 */

interface FormElements {
  form: HTMLFormElement;
  name: HTMLInputElement;
  email: HTMLInputElement;
  subject: HTMLInputElement;
  message: HTMLTextAreaElement;
  status: HTMLDivElement;
  submit: HTMLButtonElement;
}

interface ValidationResult {
  valid: boolean;
  errors: Map<string, string>;
}

/**
 * Validate email format using a simple regex
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate form fields
 */
function validateForm(elements: FormElements): ValidationResult {
  const errors = new Map<string, string>();

  // Name validation
  const name = elements.name.value.trim();
  if (!name) {
    errors.set('name', 'Name is required');
  } else if (name.length < 2) {
    errors.set('name', 'Name must be at least 2 characters');
  }

  // Email validation
  const email = elements.email.value.trim();
  if (!email) {
    errors.set('email', 'Email is required');
  } else if (!isValidEmail(email)) {
    errors.set('email', 'Please enter a valid email address');
  }

  // Message validation
  const message = elements.message.value.trim();
  if (!message) {
    errors.set('message', 'Message is required');
  } else if (message.length < 10) {
    errors.set('message', 'Message must be at least 10 characters');
  }

  return {
    valid: errors.size === 0,
    errors,
  };
}

/**
 * Show field-level error
 */
function showFieldError(input: HTMLInputElement | HTMLTextAreaElement, message: string): void {
  input.classList.add('is-invalid');
  input.setAttribute('aria-invalid', 'true');

  // Create or update error message element
  let errorEl = input.parentElement?.querySelector('.form-error');
  if (!errorEl) {
    errorEl = document.createElement('span');
    errorEl.className = 'form-error text-error';
    errorEl.setAttribute('role', 'alert');
    input.parentElement?.appendChild(errorEl);
  }
  errorEl.textContent = message;
}

/**
 * Clear field-level error
 */
function clearFieldError(input: HTMLInputElement | HTMLTextAreaElement): void {
  input.classList.remove('is-invalid');
  input.removeAttribute('aria-invalid');

  const errorEl = input.parentElement?.querySelector('.form-error');
  if (errorEl) {
    errorEl.remove();
  }
}

/**
 * Clear all field errors
 */
function clearAllErrors(elements: FormElements): void {
  clearFieldError(elements.name);
  clearFieldError(elements.email);
  clearFieldError(elements.subject);
  clearFieldError(elements.message);
}

/**
 * Show form status message
 */
function showStatus(
  statusEl: HTMLDivElement,
  message: string,
  type: 'success' | 'error'
): void {
  statusEl.textContent = message;
  statusEl.className = `form-status ${type === 'success' ? 'text-success' : 'text-error'}`;
  statusEl.classList.remove('hidden');
}

/**
 * Hide form status message
 */
function hideStatus(statusEl: HTMLDivElement): void {
  statusEl.classList.add('hidden');
  statusEl.textContent = '';
}

/**
 * Handle form submission
 */
async function handleSubmit(
  e: SubmitEvent,
  elements: FormElements
): Promise<void> {
  e.preventDefault();

  // Clear previous errors
  clearAllErrors(elements);
  hideStatus(elements.status);

  // Validate form
  const validation = validateForm(elements);

  if (!validation.valid) {
    // Show field errors
    validation.errors.forEach((message, field) => {
      const input = elements[field as keyof FormElements];
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
        showFieldError(input, message);
      }
    });

    // Focus first invalid field
    const firstErrorField = Array.from(validation.errors.keys())[0];
    const firstInput = elements[firstErrorField as keyof FormElements];
    if (firstInput instanceof HTMLInputElement || firstInput instanceof HTMLTextAreaElement) {
      firstInput.focus();
    }

    return;
  }

  // Disable submit button during submission
  elements.submit.disabled = true;
  elements.submit.textContent = 'Sending...';

  try {
    // Collect form data
    const formData = {
      name: elements.name.value.trim(),
      email: elements.email.value.trim(),
      subject: elements.subject.value.trim(),
      message: elements.message.value.trim(),
    };

    // For now, simulate a successful submission
    // In production, replace this with actual form submission logic
    // e.g., Formspree, Netlify Forms, or custom API endpoint
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Log form data (for development)
    console.log('Form submitted:', formData);

    // Show success message
    showStatus(
      elements.status,
      'Thank you! Your message has been sent successfully.',
      'success'
    );

    // Reset form
    elements.form.reset();
  } catch {
    // Show error message
    showStatus(
      elements.status,
      'Sorry, there was an error sending your message. Please try again.',
      'error'
    );
  } finally {
    // Re-enable submit button
    elements.submit.disabled = false;
    elements.submit.textContent = 'Send Message';
  }
}

/**
 * Initialize form handler
 */
export function initFormHandler(): void {
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  if (!form) return;

  const elements: FormElements = {
    form,
    name: form.querySelector('#contact-name') as HTMLInputElement,
    email: form.querySelector('#contact-email') as HTMLInputElement,
    subject: form.querySelector('#contact-subject') as HTMLInputElement,
    message: form.querySelector('#contact-message') as HTMLTextAreaElement,
    status: form.querySelector('#form-status') as HTMLDivElement,
    submit: form.querySelector('button[type="submit"]') as HTMLButtonElement,
  };

  // Validate that all elements exist
  if (
    !elements.name ||
    !elements.email ||
    !elements.message ||
    !elements.status ||
    !elements.submit
  ) {
    console.warn('FormHandler: Missing required form elements');
    return;
  }

  // Handle form submission
  form.addEventListener('submit', (e) => handleSubmit(e, elements));

  // Clear errors on input
  [elements.name, elements.email, elements.subject, elements.message].forEach(
    (input) => {
      if (input) {
        input.addEventListener('input', () => clearFieldError(input));
      }
    }
  );
}
