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
          border: solid 3px var(--border, #cacaca);
          padding: 5px 10px;
          max-width: 300px;
        }
      </style>
      <div>
        <span></span>
      </div>
    `;
  }
  notify(message, timeout = 2000) {
    this.timeout = setTimeout(() => {
      this.classList.add('hidden');
    }, timeout);
    this.shadowRoot.querySelector('span').textContent = message;
    this.classList.remove('hidden');
  }
}
window.customElements.define('notify-view', NotifyView);
