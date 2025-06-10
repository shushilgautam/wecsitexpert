// js/script.js
import { hostApi, endpoints } from "./api.js";

// --- Toast Manager ---
export class ToastManager {
  constructor() {
    this.initContainer();
    this.addGlobalStyles();
  }

  initContainer() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  }

  addGlobalStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .toast-container {
        position: fixed;
        left: 50%;
        bottom: 30px;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        z-index: 9999;
        pointer-events: none;
        max-width: min(90%, 600px);
      }

      .toast-item {
        --success: #4caf50;
        --error: #ff4d4d;
        --warning: #ff9800;
        --info: #2196f3;
        
        position: relative;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        background: var(--bg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 1rem;
        pointer-events: auto;
      }

      .toast-item.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .toast-icon {
        width: 24px;
        height: 24px;
      }

      .toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: rgba(255,255,255,0.3);
        width: 100%;
        transform-origin: left;
      }

      .close-btn {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 0;
        margin-left: 1rem;
      }

      @keyframes progress {
        from { transform: scaleX(1); }
        to { transform: scaleX(0); }
      }
    `;
    document.head.appendChild(style);
  }

  createToastElement(type, message) {
    const icons = {
      success: '✓',
      error: '⚠',
      warning: '⚠',
      info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    toast.style.setProperty('--bg', `var(--${type})`);

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || ''}</span>
      <span class="toast-message">${message}</span>
      <button class="close-btn" aria-label="Close toast">×</button>
      <div class="toast-progress"></div>
    `;

    return toast;
  }

  show(message, type = 'info', duration = 3000) {
    const toast = this.createToastElement(type, message);
    this.container.appendChild(toast);

    // Animation frame for smooth transition
    requestAnimationFrame(() => {
      toast.classList.add('visible');
      toast.querySelector('.toast-progress').style.animation =
        `progress ${duration}ms linear forwards`;
    });

    // Close button handler
    toast.querySelector('.close-btn').addEventListener('click', () => {
      this.removeToast(toast);
    });

    // Auto-remove
    const timeout = setTimeout(() => this.removeToast(toast), duration);

    // Pause on hover
    toast.addEventListener('mouseenter', () => {
      clearTimeout(timeout);
      toast.querySelector('.toast-progress').style.animationPlayState = 'paused';
    });

    toast.addEventListener('mouseleave', () => {
      const remaining = duration * (
        1 - (parseFloat(toast.querySelector('.toast-progress').style.transform.split(',')[0].replace('scaleX(', '')) || 1)
      );

      toast.querySelector('.toast-progress').style.animationPlayState = 'running';
      setTimeout(() => this.removeToast(toast), remaining);
    });
  }

  removeToast(toast) {
    toast.classList.remove('visible');
    toast.addEventListener('transitionend', () => toast.remove());
  }
}

function checkLoginStatus(toastManager) {
  const refreshToken = localStorage.getItem("refreshToken");
  const roleID = localStorage.getItem("roleID");

  if (refreshToken && roleID) {
    if (roleID.toLowerCase() === "expert") {
      if (window.location.pathname !== "/qna.html") {
        window.location.href = "/qna.html";
      }
    } else {
      toastManager.show("Access Denied: Only Experts are allowed.");
    }
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const toastManager = new ToastManager();
  


    // run login-related code
   
  checkLoginStatus(toastManager);
  




});


