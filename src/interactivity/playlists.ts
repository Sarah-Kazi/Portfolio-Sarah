// Playlists, framed as a Voyager Golden Record: the engraved gold disc spins
// with a tonearm and the 9 playlists are listed as "The Program". Pick a
// track and the stylus drops, the record speeds up, and that playlist plays
// via the Spotify panel.

import './playlists.css';

interface Playlist {
  title: string;
  spotifyId: string;
  cover: string;
}

const PLAYLISTS: Playlist[] = [
  { title: "Haruki Murakami's Late Night Jazz Music", spotifyId: '20800ip0m0MCeMRUdLgiu5', cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000d72c7d3d15bb12f069bf1251d094' },
  { title: 'Marathi for da soul',                     spotifyId: '0LCTQkrMkZMaeaPJwegvlK', cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84b97dd213a5beee7baf9666c3' },
  { title: 'BB ke nagme',                             spotifyId: '5O9i8ZUAmoiuWh1cPVfUXu', cover: 'https://image-cdn-fa.spotifycdn.com/image/ab67706c0000da84e3aa4bda5db66882b6180f11' },
  { title: 'Ghazalpaglu🎀',                           spotifyId: '4ju7VB8SjueQ0BICU9A5gy', cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da849024ef86ffa6de758be62f66' },
  { title: 'Qawwali and sufi songs',                  spotifyId: '2gABnq1LHpZL5ubAMjveha', cover: 'https://image-cdn-fa.spotifycdn.com/image/ab67706c0000da8467476c5288196d84351e542c' },
  { title: 'CAR SONGS',                               spotifyId: '1PKnFZXuqKpnFYLE4wV2SF', cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84fef57a934facd060de377b69' },
  { title: 'Retro',                                   spotifyId: '0Ge5DPfMwMHAvfKoCa98fP', cover: 'https://mosaic.scdn.co/300/ab67616d00001e022c3b6d6d29e72919971c3455ab67616d00001e0267de1391aa2218965a18f476ab67616d00001e02d6cbe802662a5f32d3c0f770ab67616d00001e02ddc3bf3fed5b10fe937630fd' },
  { title: 'Rap-a-rap',                               spotifyId: '60wqU4zpSDd1Dznuj9MHw0', cover: 'https://mosaic.scdn.co/300/ab67616d00001e023a3f1fa15892595eede07dffab67616d00001e024c6edea22082734e5683c7b9ab67616d00001e02b804c34552b0baa78730111eab67616d00001e02fe80c16f92fbdd0205afbfcf' },
  { title: 'Ritvizzz',                                spotifyId: '7hhiOcPvZNPAJLbeM7IH1a', cover: 'https://mosaic.scdn.co/300/ab67616d00001e0203392ed8b60e16435d876f53ab67616d00001e0235d8a18e284344886486f44fab67616d00001e02677c4cabe500b906c4a8e207ab67616d00001e02c09f9cf708c968385ad05b26' },
];

const EMBED = (id: string) =>
  `<iframe src="https://open.spotify.com/embed/playlist/${id}?utm_source=generator"` +
  ` width="100%" height="352" frameborder="0" loading="lazy"` +
  ` allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;

const pad = (n: number) => String(n).padStart(2, '0');

export default function initializePlaylists() {
  const section = document.getElementById('playlists');
  if (!section) return;

  const goBack = document.getElementById('go-back-button');

  // Rendered inside the #playlists .planet-content section, so it sits centred
  // and rides the parallax layer with the standard deorbit, like links.
  section.innerHTML = `
    <div class="gr-root">
      <div class="gr-stage">
        <div class="gr-record-wrap">
          <img class="gr-record" src="/voyager-golden-record.png" alt="Voyager Golden Record">
          <div class="gr-arm"><span class="gr-arm-head"></span></div>
        </div>
        <div class="gr-caption">
          <div class="gr-caption-main">The Golden Record</div>
          <div class="gr-caption-sub">a message from Sarah · Earth</div>
        </div>
      </div>
      <div class="gr-panel">
        <div class="gr-program">
          <div class="gr-eyebrow">The Program</div>
          <div class="gr-track-list"></div>
        </div>
        <div class="gr-player">
          <button class="gr-back" type="button">‹ the program</button>
          <div class="gr-eyebrow">Now broadcasting</div>
          <div class="gr-player-title"></div>
          <div class="gr-embed"></div>
        </div>
      </div>
    </div>`;

  const root        = section.querySelector('.gr-root')        as HTMLElement;
  const list        = section.querySelector('.gr-track-list')  as HTMLElement;
  const embedHost   = section.querySelector('.gr-embed')       as HTMLElement;
  const playerTitle = section.querySelector('.gr-player-title') as HTMLElement;

  PLAYLISTS.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'gr-track';
    b.type = 'button';
    b.innerHTML = `<span class="gr-track-num">${pad(i + 1)}</span><span class="gr-track-name">${p.title}</span>`;
    b.addEventListener('click', () => play(i));
    list.appendChild(b);
  });

  // Hide the custom cursor while the pointer is over the Spotify iframe
  // (cross-origin → OS cursor + frozen custom cursor = two cursors). Polling
  // :hover on the embed is race-free, unlike mouseenter/move which the iframe
  // swallows. Runs only while a playlist is playing.
  let hoverRaf = 0;
  function watchEmbedHover() {
    document.body.classList.toggle('cursor-over-embed', embedHost.matches(':hover'));
    hoverRaf = requestAnimationFrame(watchEmbedHover);
  }

  function play(i: number) {
    playerTitle.textContent = `${pad(i + 1)} · ${PLAYLISTS[i].title}`;
    embedHost.innerHTML = EMBED(PLAYLISTS[i].spotifyId);
    root.classList.add('playing');
    cancelAnimationFrame(hoverRaf);
    watchEmbedHover();
  }

  function stopPlay() {
    root.classList.remove('playing');
    embedHost.innerHTML = '';   // lift the needle, stop playback
    cancelAnimationFrame(hoverRaf);
    hoverRaf = 0;
    document.body.classList.remove('cursor-over-embed');
  }

  root.querySelector('.gr-back')?.addEventListener('click', stopPlay);

  // Reset to the program list each time the section opens / closes, and push
  // the deorbit lower (it stays in the parallax layer, just a bigger offset).
  new MutationObserver(() => {
    stopPlay();
    if (goBack) goBack.classList.toggle('playlists-deorbit', section.style.display === 'block');
  }).observe(section, { attributes: true, attributeFilter: ['style'] });
}
