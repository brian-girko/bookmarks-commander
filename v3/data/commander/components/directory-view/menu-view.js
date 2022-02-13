class MenuView extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({
      mode: 'open'
    });
    shadow.innerHTML = `
      <style>
        :host {
        }
        dialog {
          display: flex;
          flex-direction: column;
        }
      </style>
      <dialog>
        <slot></slot>
      </dialog>
    `;
  }
  connectedCallback() {
    this.shadowRoot.querySelector('dialog').showModal();

    this.shadowRoot.addEventListener('click', e => {
      e.stopPropagation();
      this.shadowRoot.querySelector('slot').focus();
    }, true);

    this.shadowRoot.addEventListener('keydown', e => e.stopPropagation(), true);
    this.shadowRoot.addEventListener('blur', e => console.log(e.target));
  }
}
window.customElements.define('menu-view', MenuView);
