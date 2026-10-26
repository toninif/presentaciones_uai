(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const stage = document.getElementById('stage');
  const presentation = document.getElementById('presentation');
  const controls = document.getElementById('controls');
  const select = document.getElementById('slide-select');
  const previous = document.getElementById('previous');
  const next = document.getElementById('next');
  const counter = document.getElementById('counter');
  const progress = document.getElementById('progress');
  const fullscreen = document.getElementById('fullscreen');
  const status = document.getElementById('status');
  const mobile = window.matchMedia('(max-width: 650px)');
  let current = 0;

  slides.forEach((slide, index) => {
    const title = slide.querySelector('h1, h2').textContent.replace(/\s+/g, ' ').trim();
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${index + 1}. ${slide.dataset.area} — ${title}`;
    select.append(option);
    slide.querySelector('.page-number').textContent = `${String(index + 1).padStart(2, '0')} / ${slides.length}`;
    slide.setAttribute('aria-roledescription', 'diapositiva');
  });
  progress.max = slides.length;

  function resize() {
    if (mobile.matches) {
      presentation.style.width = '';
      presentation.style.height = '';
      stage.style.transform = '';
      return;
    }
    const scale = Math.min((window.innerWidth - 40) / 1600, (window.innerHeight - 106) / 900);
    const safeScale = Math.max(0.1, scale);
    presentation.style.width = `${1600 * safeScale}px`;
    presentation.style.height = `${900 * safeScale}px`;
    stage.style.transform = `scale(${safeScale})`;
  }

  function show(index, updateHash = true) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    const focusedSlide = document.activeElement.closest('.slide');
    if (focusedSlide && focusedSlide !== slides[current]) document.activeElement.blur();
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    select.value = String(current);
    counter.textContent = `${current + 1} / ${slides.length}`;
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    progress.value = current + 1;
    const accent = getComputedStyle(slides[current]).getPropertyValue('--accent');
    controls.style.setProperty('--accent', accent);
    document.title = `${current + 1}/${slides.length} · ${slides[current].dataset.area} · Clase 12`;
    if (updateHash) window.location.hash = String(current + 1);
    if (mobile.matches) window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function readHash() {
    const match = /^#(\d+)$/.exec(window.location.hash);
    show(match ? Number(match[1]) - 1 : 0, false);
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else status.textContent = 'Este navegador no permite activar pantalla completa desde la presentación.';
    } catch {
      status.textContent = 'No se pudo activar pantalla completa. Podés usar la opción de pantalla completa del navegador.';
    }
  }

  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  select.addEventListener('change', () => show(Number(select.value)));
  fullscreen.addEventListener('click', toggleFullscreen);
  window.addEventListener('hashchange', readHash);
  window.addEventListener('resize', resize);
  document.addEventListener('fullscreenchange', () => {
    fullscreen.innerHTML = document.fullscreenElement ? 'Salir de pantalla completa <span aria-hidden="true">⛶</span>' : 'Pantalla completa <span aria-hidden="true">⛶</span>';
    resize();
  });
  document.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, select, textarea, button, a, [contenteditable]')) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); show(current + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); show(current - 1); }
    else if (event.key === 'Home') { event.preventDefault(); show(0); }
    else if (event.key === 'End') { event.preventDefault(); show(slides.length - 1); }
    else if (event.key.toLowerCase() === 'f') { event.preventDefault(); toggleFullscreen(); }
  });

  document.body.classList.add('presenting');
  controls.hidden = false;
  readHash();
  resize();
})();
