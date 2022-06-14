class NotifyView extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({
      mode: 'open'
    });
    shadow.innerHTML = `
      <style>
        :host {
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          inset: auto 1rem 3rem auto;
          max-width: 300px;
        }
        div {
          padding: 5px 10px;
          color: var(--color-notify, #919073);
          border: solid 1px var(--border-notify, #d7d7ae);
          background-color: var(--bg-notify, #f9f8d4);
        }
      </style>
      <div>
        <span></span>
      </div>
    `;
  }
  notify(message, timeout = 5000) {
    this.timeout = setTimeout(() => {
      this.classList.add('hidden');
    }, timeout);
    this.shadowRoot.querySelector('span').textContent = message;
    this.classList.remove('hidden');
  }
}
window.customElements.define('notify-view', NotifyView);
