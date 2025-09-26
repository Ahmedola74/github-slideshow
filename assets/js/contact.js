import { initNavigation } from './nav.js';

const handleContactForm = () => {
  const form = document.querySelector('[data-contact-form]');
  const status = document.querySelector('[data-form-status]');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    const subject = encodeURIComponent(`New inquiry from ${name || 'Portfolio'}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:Ahmedadel7717@gmail.com?subject=${subject}&body=${body}`;
    status.textContent = 'Your email app should open shortly. If not, reach me directly at Ahmedadel7717@gmail.com';
    form.reset();
  });
};

const init = () => {
  initNavigation('contact');
  handleContactForm();
};

document.addEventListener('DOMContentLoaded', init);
