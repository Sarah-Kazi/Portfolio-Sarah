const FILES: Record<string, string> = {
  'about.txt': `name     : Sarah Kazi
location : Bengaluru, India
studying : Computer Science and Engineering at PES University
CGPA     : 9.42/10
Interested in exploring anything and everything tech! 
currently working on: spacefolio (you are here)`,

  'interests.txt': `tech:
  systems programming
  networks, os
  neural networks and deep learning
  compilers and programming languages

outside the editor:
  painting
  singing
  discovering new music
  photography
  travelling
  I love cats :D`,
};

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function row(lhs: string, rhs: string): string {
  return `<div class="tc-help-row"><span class="tc-help-lhs">${lhs}</span><span class="tc-help-rhs">${rhs}</span></div>`;
}

function cmdHelp(): string {
  return `<div class="tc-help">
<span class="tc-label">commands</span>
${row('<span class="tc-cmd">help</span>', 'show this message')}
${row('<span class="tc-cmd">ls</span>', 'list files')}
${row('<span class="tc-cmd">cat</span> <span class="tc-arg">&lt;file&gt;</span>', 'print file contents')}
${row('<span class="tc-cmd">clear</span>', 'clear the terminal')}
${row('<span class="tc-cmd">deorbit</span>', 'exit and return to space')}
${row('<span class="tc-cmd">cowsay</span> <span class="tc-arg">[text]</span>', 'make a cow say something')}
${row('<span class="tc-cmd">whoami</span>', 'show current user')}
</div>`;
}

function cmdLs(): string {
  return Object.keys(FILES).map(f => `<span class="tc-file">${f}</span>`).join('    ');
}

function cmdCat(args: string[]): string {
  if (!args[0]) return '<span class="tc-err">cat: missing operand</span>';
  const content = FILES[args[0]];
  if (!content) return `<span class="tc-err">cat: ${esc(args[0])}: no such file or directory</span>`;
  return `<span class="tc-body">${esc(content)}</span>`;
}

function cmdCowsay(args: string[]): string {
  const text = args.join(' ') || 'MOO!';
  const w = text.length;
  const lines = [
    ' ' + '_'.repeat(w + 2),
    '< ' + text + ' >',
    ' ' + '-'.repeat(w + 2),
    '        \\   ^__^',
    '         \\  (oo)\\_______',
    '            (__)\\       )\\/\\',
    '                ||----w |',
    '                ||     ||',
  ];
  return `<span class="tc-body">${esc(lines.join('\n'))}</span>`;
}

function cmdWhoami(): string {
  return '<span class="tc-prompt">Sarah</span>';
}

function run(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const [cmd, ...args] = trimmed.split(/\s+/);
  switch (cmd.toLowerCase()) {
    case 'help':   return cmdHelp();
    case 'ls':     return cmdLs();
    case 'cat':    return cmdCat(args);
    case 'cowsay': return cmdCowsay(args);
    case 'whoami': return cmdWhoami();
    default:
      return `<span class="tc-err">${esc(cmd)}: command not found</span>  (try <span class="tc-cmd">help</span>)`;
  }
}

export function initializeTerminal() {
  const body    = document.getElementById('term-body');
  const history = document.getElementById('term-history');
  const input   = document.getElementById('term-input') as HTMLInputElement | null;
  const termEl  = document.querySelector('.term') as HTMLElement | null;

  if (!body || !history || !input || !termEl) return;

  const log: string[] = [];
  let histIdx      = -1;
  let isMaximized  = false;
  let termParent: Element | null  = null;
  let termSibling: Element | null = null;

  function mkSpan(cls: string, text: string): HTMLSpanElement {
    const s = document.createElement('span');
    s.className = cls;
    s.textContent = text;
    return s;
  }

  function promptRow(): HTMLDivElement {
    const row = document.createElement('div');
    row.className = 'term-entry-cmd';
    row.append(
      mkSpan('tc-prompt', 'sarah@portfolio'),
      mkSpan('tc-sep', ':'),
      mkSpan('tc-path', '~'),
      mkSpan('tc-sep', '$ '),
    );
    return row;
  }

  function push(raw: string, html: string | null) {
    const entry = document.createElement('div');
    entry.className = 'term-entry';

    const cmdRow = promptRow();
    cmdRow.appendChild(mkSpan('tc-echo', raw));
    entry.appendChild(cmdRow);

    if (html !== null) {
      const out = document.createElement('div');
      out.className = 'term-entry-out';
      out.innerHTML = html;
      entry.appendChild(out);
    }

    history!.appendChild(entry);
    body!.scrollTop = body!.scrollHeight;
  }

  function restoreSize() {
    if (!isMaximized) return;
    termEl!.classList.remove('term-fullscreen');
    if (termParent) termParent.insertBefore(termEl!, termSibling);
    isMaximized = false;
  }

  function doDeorbit() {
    restoreSize();
    document.getElementById('go-back-button')?.click();
  }

  function submit() {
    const raw = input!.value.trimEnd();
    input!.value = '';
    histIdx = -1;
    if (!raw.trim()) return;
    log.unshift(raw);

    const cmd = raw.trim().toLowerCase().split(/\s+/)[0];

    if (cmd === 'clear') {
      history!.innerHTML = '';
      return;
    }
    if (cmd === 'deorbit') {
      push(raw, null);
      doDeorbit();
      return;
    }

    push(raw, run(raw));
  }

  // Red dot: deorbit
  document.querySelector('.term-dot.close')?.addEventListener('click', doDeorbit);

  // Yellow dot: toggle fullscreen
  document.querySelector('.term-dot.min')?.addEventListener('click', () => {
    if (!isMaximized) {
      termParent  = termEl.parentElement;
      termSibling = termEl.nextElementSibling;
      document.body.appendChild(termEl);
      termEl.classList.add('term-fullscreen');
      isMaximized = true;
    } else {
      restoreSize();
    }
    body!.scrollTop = body!.scrollHeight;
    input.focus();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < log.length - 1) input.value = log[++histIdx];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      histIdx > 0 ? (input.value = log[--histIdx]) : ((histIdx = -1), (input.value = ''));
    }
  });

  body.addEventListener('click', () => input.focus());

  const section = document.getElementById('about-me');
  if (section) {
    new MutationObserver(() => {
      if (section.style.display === 'block') setTimeout(() => input.focus(), 100);
    }).observe(section, { attributes: true, attributeFilter: ['style'] });
  }
}
