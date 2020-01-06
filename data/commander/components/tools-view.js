class ToolsView extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({
      mode: 'open'
    });
    this.shadow = shadow;
    shadow.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-wrap: wrap;
          margin-top: -5px;
        }
        button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: #f3f3f3;
          border: solid 1px #afafaf;
          outline: none;
          font-size: 13px;
          font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
          margin: 2px 2px 0 0;
        }
        button span {
          background-color: rgba(0, 0, 0, 0.10);
          padding: 0 5px;
          cursor: pointer;
        }
        button span:hover {
          background-color: rgba(0, 0, 0, 0.15);
        }
        span[data-enabled=false] {
          color: #a0a0a0;
          text-shadow: 1px 1px #fcffff;
          pointer-events: none;
        }
      </style>
      <button>
        <svg width="14" height="14" version="1.1" viewBox="0 0 512 512">
          <g transform="translate(0,-540.3622)">
            <path d="m 255.71875,588.75 c -5.14903,0.0739 -10.2385,2.22892 -13.875,5.875 L 58.5625,777.90625 c -3.701032,3.70256 -5.855526,8.90549 -5.855526,14.14062 0,5.23514 2.154494,10.43807 5.855526,14.14063 l 54.9375,54.96875 0,122.8125 c 5.1e-4,5.23585 2.15613,10.43927 5.85843,14.14158 3.7023,3.70227 8.90572,5.85797 14.14157,5.85847 l 65,0 c 5.23585,-5e-4 10.43927,-2.1562 14.14157,-5.85847 3.7023,-3.70231 5.85792,-8.90573 5.85843,-14.14158 l 0,-145 75,0 0,145 c 5.1e-4,5.23585 2.15613,10.43927 5.85843,14.14158 3.7023,3.70227 8.90572,5.85797 14.14157,5.85847 l 65,0 c 5.23585,-5e-4 10.43927,-2.1562 14.14157,-5.85847 3.7023,-3.70231 5.85792,-8.90573 5.85843,-14.14158 l 0,-122.84375 54.9375,-54.9375 c 3.70103,-3.70256 5.85553,-8.90549 5.85553,-14.14063 0,-5.23513 -2.1545,-10.43806 -5.85553,-14.14062 L 270.15625,594.625 c -3.76894,-3.77878 -9.10096,-5.94852 -14.4375,-5.875 z"/>
          </g>
        </svg>
        <span title="Ctrl + O or Command + O" data-command="root">R<u>o</u>ot</span>
      </button>
      <button>
        <svg width="14" height="14" viewBox="0 0 30 30">
          <path d="M11,24c-2.206,0-4-1.794-4-4V7H6C4.895,7,4,7.895,4,9v16c0,1.105,0.895,2,2,2h13c1.105,0,2-0.895,2-2v-1H11z"/>
          <path d="M25.707,7.793l-5.5-5.5C20.019,2.105,19.765,2,19.5,2H11C9.895,2,9,2.895,9,4v16c0,1.105,0.895,2,2,2h13  c1.105,0,2-0.895,2-2V8.5C26,8.235,25.895,7.981,25.707,7.793z M20,9c-0.552,0-1-0.448-1-1V3.904L24.096,9H20z"/>
        </svg>
        Copy&nbsp;<span title="Ctrl + X or Command + X" data-command="copy-title">Title (X)</span>&nbsp;|&nbsp;
                  <span title="Ctrl + C or Command + C" data-command="copy-link">Link (C)</span>&nbsp;|&nbsp;
                  <span title="Ctrl + I or Command + I" data-command="copy-id"><u>I</u>D</span>
      </button>

      <button>
        <svg width="16" height="16" viewBox="0 0 6.3499998 6.3499998">
          <defs id="defs2"/>
          <path fill="red" d="M 4.5135398,1.4550781 2.9354148,3.0351563 A 0.26460978,0.26460978 0 0 0 2.8592429,3.1972657 L 2.7791649,4.0664063 A 0.26460978,0.26460978 0 0 0 3.0662742,4.3535157 L 3.9354149,4.2753906 A 0.26460978,0.26460978 0 0 0 4.0994775,4.1992187 L 5.6776024,2.6191405 c 0.1878881,-0.1878871 0.1878873,-0.5015659 0,-0.6894532 L 5.2029929,1.4550781 c -0.187887,-0.1878881 -0.5015659,-0.1878873 -0.6894531,0 z M 4.8592428,1.859375 5.2733054,2.2753906 3.7928368,3.7558595 3.3358053,3.7968751 3.376821,3.3398439 Z"/>
          <path d="m 0.76744594,4.498047 a 0.26495279,0.26495279 0 0 0 0.0253906,0.5292968 H 3.4393209 a 0.26464844,0.26464844 0 1 0 0,-0.5292968 H 0.79283657 a 0.26460978,0.26460978 0 0 0 -0.0253906,0 z"/>
        </svg>
        Edit&nbsp;<span title="Ctrl + E or Command + E" data-command="edit-title">Titl<u>e</u></span>&nbsp;|&nbsp;
                  <span title="Ctrl + L or Command + L" data-command="edit-link"><u>L</u>ink</span>
      </button>
      <button>
        <svg width="16" height="16" viewBox="0 0 70 70">
          <polygon points="53,32.5 37.5,32.5 37.5,17 32.5,17 32.5,32.5 17,32.5 17,37.5 32.5,37.5 32.5,53 37.5,53 37.5,37.5 53,37.5 "/>
        </svg>
        New&nbsp;<span title="Ctrl + B or Command + B" data-command="new-file"><u>B</u>ookmark</span>&nbsp;|&nbsp;
                 <span title="Ctrl + D or Command + D" data-command="new-directory"><u>D</u>irectory</span>
      </button>
      <button>
        <svg width="12" height="12" viewBox="0 0 48 48">
          <path d="M0 0h48v48H0z" fill="none"/>
          <circle cx="12" cy="36" fill="none" r="4"/>
          <circle cx="24" cy="24" fill="none" r="1"/>
          <circle cx="12" cy="12" fill="none" r="4"/>
          <path d="M19.28 15.28c.45-1 .72-2.11.72-3.28 0-4.42-3.58-8-8-8s-8 3.58-8 8 3.58 8 8 8c1.17 0 2.28-.27 3.28-.72L20 24l-4.72 4.72c-1-.45-2.11-.72-3.28-.72-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8c0-1.17-.27-2.28-.72-3.28L24 28l14 14h6v-2L19.28 15.28zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0 24c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12-15c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM38 6L26 18l4 4L44 8V6z"/>
        </svg>
        Move&nbsp;<span title="Ctrl + ArrowLeft or Command + ArrowLeft" data-command="move-left">Left (&#x2190;)</span>&nbsp;|&nbsp;
                  <span title="Ctrl + ArrowRight or Command + ArrowRight" data-command="move-right">Right (&#x2192;)</span>
      </button>
      <button>
        <svg width="16" height="16" viewBox="0 0 48 48">
          <path d="M12 38c0 2.21 1.79 4 4 4h16c2.21 0 4-1.79 4-4v-24h-24v24zm26-30h-7l-2-2h-10l-2 2h-7v4h28v-4z"/>
          <path d="M0 0h48v48h-48z" fill="none"/>
        </svg>
        <span title="Ctrl + Delete or Command + D" data-command="trash">Delete</span>
      </button>
    `;
    this.shadow.addEventListener('click', e => {
      const command = e.target.dataset.command;
      if (command) {
        this.emit('tools-view:command', command);
      }
    });
  }
  emit(name, detail) {
    return this.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      detail
    }));
  }
  validate(name) {
    const d = this.shadow.querySelector(`[data-command="${name}"]`);
    if (d && d.dataset.enabled !== 'false') {
      return true;
    }
    return false;
  }
  command(e, callback) {
    const meta = e.ctrlKey || e.metaKey;
    let command = '';
    if (e.code === 'KeyC' && meta) {
      command = 'copy-link';
    }
    else if (e.code === 'KeyX' && meta) {
      command = 'copy-title';
    }
    else if (e.code === 'KeyI' && meta) {
      command = 'copy-id';
    }
    else if (e.code === 'KeyE' && meta) {
      command = 'edit-title';
    }
    else if (e.code === 'KeyL' && meta) {
      command = 'edit-link';
    }
    else if (e.code === 'KeyB' && meta) {
      command = 'new-file';
    }
    else if (e.code === 'KeyD' && meta) {
      command = 'new-directory';
    }
    else if (e.code === 'ArrowLeft' && meta) {
      command = 'move-left';
    }
    else if (e.code === 'ArrowRight' && meta) {
      command = 'move-right';
    }
    else if (e.code === 'Delete' && meta) {
      command = 'trash';
    }
    else if (e.code === 'KeyO' && meta) {
      command = 'root';
    }

    if (command) {
      if (this.validate(command)) {
        e.preventDefault();
        callback(command);
      }
    }
  }
  state(command, enabled) {
    const e = this.shadow.querySelector(`[data-command="${command}"]`);
    if (e) {
      e.dataset.enabled = enabled;
    }
  }
}
window.customElements.define('tools-view', ToolsView);
