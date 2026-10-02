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
  playing chess 
  watching movies
  discovering new music
  reading
  photography
  travelling
  cafe-hopping :o
  I love cats :D`,
};

const WORDS = [
  'about','above','actor','acute','admit','adopt','adult','after','again','agent',
  'agree','ahead','alarm','album','alert','alien','alike','alive','alley','allow',
  'alone','along','alpha','alter','angel','anger','angle','ankle','apart','apple',
  'arise','armor','aroma','array','arrow','aside','attic','audio','avoid','awake',
  'award','aware','awful','badge','baker','basic','basin','batch','beach','began',
  'begin','below','bench','birth','black','blade','blame','blank','blast','blaze',
  'blend','bless','blind','block','blood','bloom','board','bonus','boost','brave',
  'bread','break','brick','bride','brief','bring','broad','broke','brook','brown',
  'brush','build','built','burst','cable','candy','carry','catch','cause','chain',
  'chair','chalk','chaos','charm','chart','chase','cheap','cheat','check','chess',
  'chest','chief','child','chill','claim','clash','class','clean','clear','climb',
  'clock','clone','close','cloud','coach','coast','comet','coral','could','count',
  'court','cover','crack','craft','crane','crash','cream','crest','crime','crisp',
  'cross','crowd','crown','cruel','crush','curve','cycle','daily','dance','death',
  'delay','delta','dense','depth','dirty','dodge','doubt','dough','draft','drama',
  'drawn','dream','dress','drift','drink','drive','drone','drunk','dwarf','eagle',
  'early','earth','elder','elite','ember','empty','enemy','enjoy','enter','equal',
  'error','essay','event','every','exact','extra','faint','fairy','faith','false',
  'fancy','fatal','feast','fence','fever','fiber','field','fiery','fifth','fifty',
  'fight','final','first','fixed','flare','flash','fleet','flesh','float','flood',
  'floor','flour','fluid','flute','focus','force','forge','forum','found','frame',
  'fresh','front','frost','fruit','ghost','giant','given','glass','glide','gloom',
  'glory','gloss','glove','grace','grade','grain','grand','grant','grape','grasp',
  'grass','grave','great','greed','green','greet','grief','grill','grind','groan',
  'group','grove','grown','guard','guide','guild','guilt','happy','harsh','haste',
  'haunt','haven','heart','heavy','hence','heron','honey','honor','horse','hotel',
  'hover','human','humor','image','index','indie','inner','input','intro','irony',
  'issue','ivory','joker','judge','juice','jumbo','knife','knock','known','label',
  'lance','large','laser','later','laugh','layer','learn','lease','ledge','legal',
  'level','lever','light','limit','local','lodge','logic','loose','lunar','lyric',
  'magic','major','maker','manor','maple','match','mayor','media','merit','metal',
  'micro','might','model','money','month','moral','motif','motor','mount','mouse',
  'mouth','movie','music','named','naval','nerve','night','ninja','noble','noise',
  'north','novel','nurse','ocean','offer','often','olive','omega','orbit','order',
  'organ','outer','ozone','paint','panic','panel','paper','party','pasta','patch',
  'pause','peace','peach','pearl','phase','phone','photo','piano','pilot','pinch',
  'pixel','pizza','place','plain','plane','plant','plate','plaza','point','polar',
  'power','press','price','pride','prime','print','prior','prize','probe','prone',
  'proof','prose','proud','prove','proxy','pulse','punch','pupil','purge','queen',
  'query','quest','quick','quiet','quota','quote','radar','radio','raise','rally',
  'range','rapid','ratio','reach','react','realm','rebel','relay','reply','reset',
  'risky','river','robot','rocky','rogue','rough','round','route','royal','ruler',
  'rusty','saint','salad','salon','salty','sauce','scale','scare','scene','scope',
  'score','sense','seven','shade','shake','shame','shape','share','sharp','sheep',
  'shelf','shell','shift','shine','shirt','shock','shoot','shore','short','shout',
  'sight','since','sixth','sixty','skill','skull','slate','sleep','slice','slide',
  'slope','small','smart','smell','smile','smoke','snake','solar','solid','solve',
  'sorry','sound','south','space','spark','speak','speed','spend','spice','spike',
  'spine','spire','split','spoke','spoon','spray','squad','stack','staff','stage',
  'stain','stair','stand','stark','start','state','steam','steel','steep','steer',
  'stern','stick','still','stock','stone','stood','storm','story','stove','strap',
  'straw','strip','stuck','study','stuff','style','sugar','suite','sunny','super',
  'swear','sweep','sweet','swift','swipe','sword','table','taste','teach','teeth',
  'tempo','tense','theft','theme','there','thick','thing','think','third','thorn',
  'those','three','threw','throw','thumb','tiger','tight','timer','tired','title',
  'today','token','tonic','torch','total','touch','tough','towel','tower','toxic',
  'trace','track','trade','train','trait','trash','trend','trial','tried','troop',
  'trove','truck','truly','trunk','trust','truth','tulip','twist','ultra','under',
  'unify','union','unity','upper','upset','urban','usage','utter','valid','value',
  'valve','vapor','vault','video','vigil','viral','virus','visit','vital','vivid',
  'vocal','voice','voter','wagon','waste','watch','water','weary','weave','whale',
  'wheat','wheel','where','which','white','whole','wield','witch','women','world',
  'worry','worse','worst','would','wound','wrath','write','wrong','yacht','yield',
  'young','youth','zebra',
];


const CAT_FRAMES = [
  '  /\\_/\\ \n ( o.o )\n  > ^ < ',
  '  /\\_/\\ \n ( -.- )\n  > ^ < ',
  '  /\\_/\\ \n ( o.o )/\n  > ^ < ',
  '  /\\_/\\ \n ( ^w^ )\n  > ^ < \n  meow~ ',
  '  /\\_/\\ \n ( o.o )\n  > ^ < ',
];
const CAT_DELAYS = [500, 200, 400, 700, 0];


const NYAN_COLORS    = ['#ff6b6b','#ffa94d','#ffd43b','#69db7c','#74c0fc','#b197fc'];
const NYAN_TRAIL     = ['▓','▒','░'];
const NYAN_TRAIL_LEN = 28;
const NYAN_FPS       = 17;
const NYAN_TOTAL_S   = 5.5;


const NYAN_FRAMES = [
  [
    '  +---------+              ',
    '  | ~ ~ ~ ~ |    /\\_/\\   ',
    '  | * ~ * ~ |   ( ^o^ )~  ',
    '  | ~ * ~ * |    |   |    ',
    '  +---------+    v   v    ',
    '                            ',
  ],
  [
    '  +---------+              ',
    '  | ~ ~ ~ ~ |    /\\_/\\   ',
    '  | * ~ * ~ |   ( ^.^ )~  ',
    '  | ~ * ~ * |    v   |    ',
    '  +---------+        v    ',
    '                            ',
  ],
  [
    '  +---------+              ',
    '  | ~ ~ ~ ~ |    /\\_/\\   ',
    '  | * ~ * ~ |   ( ^o^ )~  ',
    '  | ~ * ~ * |    |   v    ',
    '  +---------+    v        ',
    '                            ',
  ],
  [
    '  +---------+              ',
    '  | ~ ~ ~ ~ |    /\\_/\\   ',
    '  | * ~ * ~ |   ( -.- )~  ',
    '  | ~ * ~ * |    |   |    ',
    '  +---------+    v   v    ',
    '                            ',
  ],
  [
    '  +---------+              ',
    '  | ~ ~ ~ ~ |    /\\_/\\   ',
    '  | * ~ * ~ |   ( ^.^ )~  ',
    '  | ~ * ~ * |    v   |    ',
    '  +---------+        v    ',
    '                            ',
  ],
  [
    '  +---------+              ',
    '  | ~ ~ ~ ~ |    /\\_/\\   ',
    '  | * ~ * ~ |   ( ^o^ )~~ ',
    '  | ~ * ~ * |    |   v    ',
    '  +---------+    v        ',
    '                            ',
  ],
  [
    '  +---------+              ',
    '  | ~ ~ ~ ~ |    /\\_/\\   ',
    '  | * ~ * ~ |   ( ^.^ )~  ',
    '  | ~ * ~ * |    |   |    ',
    '  +---------+    v   v    ',
    '                            ',
  ],
  [
    '  +---------+              ',
    '  | ~ ~ ~ ~ |    /\\_/\\   ',
    '  | * ~ * ~ |   ( ^o^ )~~ ',
    '  | ~ * ~ * |    v   |    ',
    '  +---------+        v    ',
    '                            ',
  ],
];


const NYAN_STAR_GLYPHS = ['·','⋆','✦','⋆','·','✧','·'];
const NYAN_STARS = [
  { row: 0, col: 32 }, { row: 0, col: 41 }, { row: 1, col: 36 },
  { row: 2, col: 44 }, { row: 3, col: 30 }, { row: 4, col: 38 },
  { row: 4, col: 47 }, { row: 5, col: 33 },
];

function animateMeow(out: HTMLElement, scroll: () => void) {
  let f = 0;
  function show() {
    out.innerHTML = `<span class="tc-body" style="white-space:pre">${esc(CAT_FRAMES[f])}</span>`;
    scroll();
    if (f < CAT_FRAMES.length - 1 && CAT_DELAYS[f] > 0) {
      setTimeout(() => { f++; show(); }, CAT_DELAYS[f]);
    }
  }
  show();
}

function animateNyan(out: HTMLElement, scroll: () => void) {
  const frameMs   = Math.round(1000 / NYAN_FPS);
  const totalTicks = Math.round(NYAN_FPS * NYAN_TOTAL_S);
  let len   = 0;
  let ticks = 0;

  function buildFrame() {
    const frame = NYAN_FRAMES[ticks % NYAN_FRAMES.length];

    
    const lines = NYAN_COLORS.map((color, i) => {
      const trail = Array.from(
        { length: len },
        (_, j) => NYAN_TRAIL[(i + j + ticks) % NYAN_TRAIL.length],
      ).join('');
      const cat = frame[i] ?? '';
      return `<span style="color:${color};white-space:pre">${esc(trail)}${esc(cat)}</span>`;
    });

   
    const grid = lines.map(l => l);
    for (let s = 0; s < NYAN_STARS.length; s++) {
      const { row, col } = NYAN_STARS[s];
      if (row >= grid.length) continue;
      const glyph = NYAN_STAR_GLYPHS[(ticks + s * 3) % NYAN_STAR_GLYPHS.length];
      
      grid[row] = grid[row].replace(
        '</span>',
        `</span><span style="color:#cdd6f4;white-space:pre;position:relative;left:${col * 0.6}ch;margin-left:-1ch">${glyph}</span>`,
      );
    }

    return `<div style="white-space:pre;line-height:1.5">${grid.join('\n')}</div>`;
  }

  const iv = setInterval(() => {
    ticks++;
    if (len < NYAN_TRAIL_LEN) len++;

    out.innerHTML = buildFrame();
    scroll();

    if (ticks >= totalTicks) {
      clearInterval(iv);
      setTimeout(() => {
        out.innerHTML += `\n<span style="color:#b197fc;white-space:pre">  ✦ nyaaaan~ ✦</span>`;
        scroll();
      }, 200);
    }
  }, frameMs);
}



function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function row(lhs: string, rhs: string): string {
  return `<div class="tc-help-row"><span class="tc-help-lhs">${lhs}</span><span class="tc-help-rhs">${rhs}</span></div>`;
}

function cmdHelp(): string {
  return `<div class="tc-help">
<span class="tc-label">commands</span>
${row('<span class="tc-cmd">help</span>',   'show this message')}
${row('<span class="tc-cmd">ls</span>',     'list files')}
${row('<span class="tc-cmd">cat</span> <span class="tc-arg">&lt;file&gt;</span>', 'print file contents')}
${row('<span class="tc-cmd">clear</span>',  'clear the terminal')}
${row('<span class="tc-cmd">deorbit</span>','exit and return to space')}
${row('<span class="tc-cmd">cowsay</span> <span class="tc-arg">[text]</span>', 'make a cow say something')}
${row('<span class="tc-cmd">whoami</span>', 'show current user')}
${row('<span class="tc-cmd">wordle</span>', 'play wordle')}
${row('<span class="tc-cmd">meow</span>',   'meow')}
${row('<span class="tc-cmd">nyan</span>',   'nyaaaan~')}
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
  const w    = text.length;
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

function colorGuess(guess: string, target: string): ('correct' | 'present' | 'absent')[] {
  const result: ('correct' | 'present' | 'absent')[] = Array(5).fill('absent');
  const targetArr = target.split('');
  const guessArr  = guess.split('');
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i] = 'correct'; targetArr[i] = '#'; guessArr[i] = '*';
    }
  }
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === '*') continue;
    const idx = targetArr.indexOf(guessArr[i]);
    if (idx !== -1) { result[i] = 'present'; targetArr[idx] = '#'; }
  }
  return result;
}

function run(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const [cmd, ...args] = trimmed.split(/\s+/);
  switch (cmd.toLowerCase()) {
    case 'help':    return cmdHelp();
    case 'ls':      return cmdLs();
    case 'cat':     return cmdCat(args);
    case 'cowsay':  return cmdCowsay(args);
    case 'whoami':  return cmdWhoami();
    case 'wordle':
    case 'meow':
    case 'nyan':    return null;
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
  let histIdx     = -1;
  let isMaximized = false;
  let termParent:  Element | null = null;
  let termSibling: Element | null = null;

  // Wordle state
  let wordleActive    = false;
  let wordleTarget    = '';
  let wordleGuesses:  string[] = [];
  let wordleContainer: HTMLDivElement | null = null;

  function scroll() { body!.scrollTop = body!.scrollHeight; }

  function mkSpan(cls: string, text: string): HTMLSpanElement {
    const s = document.createElement('span');
    s.className  = cls;
    s.textContent = text;
    return s;
  }

  function promptRow(): HTMLDivElement {
    const r = document.createElement('div');
    r.className = 'term-entry-cmd';
    r.append(
      mkSpan('tc-prompt', 'sarah@portfolio'),
      mkSpan('tc-sep', ':'),
      mkSpan('tc-path', '~'),
      mkSpan('tc-sep', '$ '),
    );
    return r;
  }

  function push(raw: string, html: string | null): HTMLDivElement | null {
    const entry = document.createElement('div');
    entry.className = 'term-entry';

    const cmdRow = promptRow();
    cmdRow.appendChild(mkSpan('tc-echo', raw));
    entry.appendChild(cmdRow);

    let out: HTMLDivElement | null = null;
    if (html !== null) {
      out = document.createElement('div');
      out.className = 'term-entry-out';
      out.innerHTML  = html;
      entry.appendChild(out);
    } else {
      out = document.createElement('div');
      out.className = 'term-entry-out';
      entry.appendChild(out);
    }

    history!.appendChild(entry);
    scroll();
    return out;
  }


  function renderWordle(message?: string) {
    if (!wordleContainer) return;
    const won  = wordleGuesses.length > 0 && wordleGuesses[wordleGuesses.length - 1] === wordleTarget;
    const lost = !won && wordleGuesses.length >= 6;
    let html = '<div class="wordle-grid">';
    for (let r = 0; r < 6; r++) {
      html += '<div class="wordle-row">';
      const guess  = wordleGuesses[r] ?? '';
      const colors = guess ? colorGuess(guess, wordleTarget) : null;
      for (let c = 0; c < 5; c++) {
        const letter = guess[c] ?? '';
        const cls    = colors ? colors[c] : (r === wordleGuesses.length ? 'active' : '');
        html += `<span class="wordle-cell ${cls}">${letter.toUpperCase()}</span>`;
      }
      html += '</div>';
    }
    html += '</div>';
    if (message) {
      html += `<div class="wordle-msg">${message}</div>`;
    } else if (won) {
      html += `<div class="wordle-msg wordle-win">you got it in ${wordleGuesses.length}!</div>`;
    } else if (lost) {
      html += `<div class="wordle-msg wordle-lose">the word was <span class="tc-cmd">${wordleTarget}</span></div>`;
    } else {
      html += `<div class="wordle-msg">guess ${wordleGuesses.length + 1} of 6 &nbsp;·&nbsp; <span class="tc-cmd">q</span> to quit</div>`;
    }
    wordleContainer.innerHTML = html;
    scroll();
  }

  function startWordle() {
    wordleActive  = true;
    wordleTarget  = WORDS[Math.floor(Math.random() * WORDS.length)];
    wordleGuesses = [];
    wordleContainer = document.createElement('div');
    wordleContainer.className = 'term-entry-out';
    history!.appendChild(wordleContainer);
    renderWordle();
  }

  function handleWordleInput(raw: string) {
    const word = raw.trim().toLowerCase();
    if (word === 'q' || word === 'quit') {
      wordleActive = false; wordleContainer = null;
      push(raw, '<span class="tc-body">exited wordle.</span>');
      return;
    }
    if (word.length !== 5 || !/^[a-z]+$/.test(word)) {
      renderWordle('<span class="tc-err">must be a 5-letter word</span>');
      return;
    }
    wordleGuesses.push(word);
    renderWordle();
    const won  = word === wordleTarget;
    const lost = !won && wordleGuesses.length >= 6;
    if (won || lost) { wordleActive = false; wordleContainer = null; }
  }

  // Core

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

    if (wordleActive) { handleWordleInput(raw); return; }

    log.unshift(raw);
    const cmd = raw.trim().toLowerCase().split(/\s+/)[0];

    if (cmd === 'clear')   { history!.innerHTML = ''; return; }
    if (cmd === 'deorbit') { push(raw, null); doDeorbit(); return; }

    if (cmd === 'wordle') {
      const out = push(raw, null);
      if (out) { out.remove(); }
      startWordle();
      return;
    }

    if (cmd === 'meow') {
      const out = push(raw, '');
      if (out) animateMeow(out, scroll);
      return;
    }

    if (cmd === 'nyan') {
      const out = push(raw, '');
      if (out) animateNyan(out, scroll);
      return;
    }

    push(raw, run(raw));
  }

  document.querySelector('.term-dot.close')?.addEventListener('click', doDeorbit);

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
    scroll();
    input.focus();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submit();
    } else if (!wordleActive && e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < log.length - 1) input.value = log[++histIdx];
    } else if (!wordleActive && e.key === 'ArrowDown') {
      e.preventDefault();
      histIdx > 0 ? (input.value = log[--histIdx]) : ((histIdx = -1), (input.value = ''));
    }
  });

  body.addEventListener('click', () => input.focus());

  // Skip the autofocus on touch devices: it would pop the on-screen keyboard
  // over the terminal the moment the section opens. Tapping it still focuses.
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const section = document.getElementById('about-me');
  if (section && !isTouch) {
    new MutationObserver(() => {
      if (section.style.display === 'block') setTimeout(() => input.focus(), 100);
    }).observe(section, { attributes: true, attributeFilter: ['style'] });
  }
}
