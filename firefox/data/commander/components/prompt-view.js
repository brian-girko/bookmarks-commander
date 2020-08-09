class PromptView extends HTMLElement {
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
        }
        form {
          padding: 10px;
          background-color: #fff;
          display: flex;
          flex-direction: column;
          width: 400px;
          max-width: calc(100vw - 60px);
        }
        form > div {
          display: flex;
          justify-content: flex-end;
        }
        input {
          background-color: #eee  ;
          border: none;
          min-width: 80px;
          padding: 5px;
          outline: none;
        }
        input[type=text] {
          margin: 10px 0;
        }
        input[type=submit] {
          margin-left: 5px;
          background-color: #dadada;
        }
        input[type=button],
        input[type=submit] {
          cursor: pointer;
        }
        span {
          white-space: pre-wrap;
        }
      </style>
      <form>
        <span>This is a prompt message</span>
        <input type="text" name="user">
        <div>
          <input type="button" value="Cancel">
          <input type="submit" value="OK">
        </div>
      </form>
    `;
    this.events = {};
  }
  connectedCallback() {
    const input = this.shadowRoot.querySelector('input[type=text]');
    const next = value => {
      this.classList.add('hidden');
      for (const c of this.events.blur || []) {
        c();
      }
      this.resolve(value);
    };

    this.shadowRoot.addEventListener('submit', e => {
      e.preventDefault();
      next(input.value);
    });
    this.addEventListener('keyup', e => {
      if (e.code === 'Escape') {
        next('');
      }
    });
    this.shadowRoot.querySelector('input[type=button]').addEventListener('click', () => {
      next('');
    });
    this.addEventListener('click', () => {
      input.focus();
    });

    this.addEventListener('keypress', e => e.stopPropagation());
    this.addEventListener('keyup', e => e.stopPropagation());
    this.addEventListener('keydown', e => e.stopPropagation());
  }
  ask(message, value = '') {
    const input = this.shadowRoot.querySelector('input[type=text]');
    const span = this.shadowRoot.querySelector('span');
    span.textContent = message;

    this.classList.remove('hidden');
    input.value = value;
    input.focus();
    input.select();

    return new Promise(resolve => this.resolve = resolve);
  }
  on(method, callback) {
    this.events[method] = this.events[method] || [];
    this.events[method].push(callback);
  }
}
window.customElements.define('prompt-view', PromptView);
