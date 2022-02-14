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
        dialog {
          padding: 2px;
        }
        form {
          padding: 10px;
          color: var(--color, #3e3e3e);
          background-color: var(--bg-active, #fff);
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
          color: var(--color, #3e3e3e);
          background-color: var(--bg-light, #eee);
          border: none;
          min-width: 80px;
          padding: 5px;
          outline: none;
        }
        input::selection {
          background-color: var(--selection, #8a8c8d);
        }
        input[type=text] {
          margin: 10px 0;
        }
        input[type=submit] {
          margin-left: 5px;
          background-color: var(--bg-light, #dadada);
        }
        input[type=button],
        input[type=submit] {
          cursor: pointer;
        }
        span {
          white-space: pre-wrap;
        }
      </style>
      <dialog>
        <form>
          <span>This is a prompt message</span>
          <input type="text" name="user" autofocus list="list">
          <datalist id="list"></datalist>
          <div>
            <input type="button" value="Cancel">
            <input type="submit" value="OK">
          </div>
        </form>
      </dialog>
    `;
    this.events = {};
  }
  connectedCallback() {
    this.shadowRoot.querySelector('input[type=button]').addEventListener('click', () => {
      this.shadowRoot.querySelector('dialog').close();
    });
    this.addEventListener('keypress', e => e.stopPropagation());
    this.addEventListener('keyup', e => e.stopPropagation());
    this.addEventListener('keydown', e => e.stopPropagation());
  }
  ask(message, value = '', history = []) {
    const dialog = this.shadowRoot.querySelector('dialog');
    const form = this.shadowRoot.querySelector('form');
    const input = this.shadowRoot.querySelector('input[type=text]');
    const span = this.shadowRoot.querySelector('span');
    const list = this.shadowRoot.getElementById('list');
    span.textContent = message;

    input.value = value;
    list.textContent = '';

    for (const s of history) {
      const option = document.createElement('option');
      option.value = s;
      option.textContent = s;
      list.appendChild(option);
    }

    return new Promise(resolve => {
      const next = value => {
        dialog.close();
        for (const c of this.events.blur || []) {
          c();
        }
        setTimeout(() => resolve(value), 100);
      };
      form.onsubmit = e => {
        e.preventDefault();
        next(input.value);
      };
      dialog.onclose = () => next('');
      dialog.showModal();

      window.setTimeout(() => {
        input.focus();
        input.select();
      });
    });
  }
  on(method, callback) {
    this.events[method] = this.events[method] || [];
    this.events[method].push(callback);
  }
}
window.customElements.define('prompt-view', PromptView);
