/* FAQ Bot — Cliente (sin servidor)
   - Carga `assets/data/faqs.json`
   - Inserta un widget flotante, búsqueda y vistas de respuesta
*/
(function(){
  const script = document.currentScript || (function(){
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length-1];
  })();

  const scriptSrc = (script && script.src) || '';
  let dataUrl = scriptSrc.replace(/\/assets\/js\/faq-bot\.js$/, '/assets/data/faqs.json');
  if (dataUrl === scriptSrc) dataUrl = scriptSrc.replace(/faq-bot\.js$/, '../data/faqs.json');

  // Crear elementos del widget
  const floatBtn = document.createElement('button');
  floatBtn.className = 'faq-float';
  floatBtn.setAttribute('aria-label','Abrir ayuda — Preguntas frecuentes');
  floatBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="17" font-size="20" font-weight="bold" text-anchor="middle" fill="currentColor" font-family="system-ui, -apple-system, sans-serif">?</text></svg>';

  const panel = document.createElement('aside');
  panel.className = 'faq-panel';
  panel.setAttribute('aria-hidden','true');
  panel.innerHTML = `
    <div class="faq-header">
      <strong>Preguntas frecuentes</strong>
      <button class="faq-close" aria-label="Cerrar">✕</button>
    </div>
    <div class="faq-body">
      <input class="faq-search" type="search" placeholder="Escribí tu pregunta..." aria-label="Buscar preguntas" />
      <ul class="faq-list" role="list"></ul>
      <div class="faq-empty" hidden>No se encontraron resultados.</div>
      <div style="margin-top:8px; display:flex; justify-content:center;">
        <button class="faq-more" hidden>Más consultas</button>
      </div>
    </div>
    <div class="faq-answer" hidden></div>
  `;

  document.body.appendChild(panel);
  document.body.appendChild(floatBtn);

  // Abrir / cerrar
  function openPanel(){ panel.classList.add('is-open'); panel.setAttribute('aria-hidden','false'); panel.querySelector('.faq-search')?.focus(); }
  function closePanel(){ panel.classList.remove('is-open'); panel.setAttribute('aria-hidden','true'); panel.querySelector('.faq-answer')?.setAttribute('hidden','true'); }

  floatBtn.addEventListener('click', ()=>{
    const open = panel.classList.toggle('is-open');
    panel.setAttribute('aria-hidden', String(!open));
    if(open){
      panel.querySelector('.faq-search')?.focus();
      // trigger spin animation and keep scaled state
      floatBtn.classList.add('is-open-btn','is-spinning');
      const onAnimEnd = ()=>{ floatBtn.classList.remove('is-spinning'); floatBtn.removeEventListener('animationend', onAnimEnd); };
      floatBtn.addEventListener('animationend', onAnimEnd);
    } else {
      floatBtn.classList.remove('is-open-btn','is-spinning');
    }
  });

  panel.querySelector('.faq-close')?.addEventListener('click', ()=>{ closePanel(); floatBtn.classList.remove('is-open-btn','is-spinning'); });

  // Cargar preguntas
  let faqs = [];
  let displayLimit = 6;
  let showingAll = false;
  fetch(dataUrl).then(r=>r.json()).then(data=>{ faqs = Array.isArray(data)?data:[]; renderList(faqs.slice(0,displayLimit)); updateMoreButton(); }).catch(()=>{ faqs = []; });

  const searchInput = panel.querySelector('.faq-search');
  const listEl = panel.querySelector('.faq-list');
  const emptyEl = panel.querySelector('.faq-empty');
  const answerEl = panel.querySelector('.faq-answer');
  const moreBtn = panel.querySelector('.faq-more');

  function scoreMatch(item, q){
    if(!q) return 1;
    const text = (item.q + ' ' + item.a).toLowerCase();
    const qs = q.toLowerCase().trim();
    if(text.includes(qs)) return 10;
    const words = qs.split(/\s+/).filter(Boolean);
    let score = 0;
    words.forEach(w=>{ if(text.includes(w)) score += 2; });
    return score;
  }

  function renderList(items){
    listEl.innerHTML = '';
    if(!items || items.length === 0){ emptyEl.hidden = false; listEl.hidden = true; return; }
    emptyEl.hidden = true; listEl.hidden = false;
    items.forEach((it, idx)=>{
      const li = document.createElement('li');
      li.className = 'faq-item';
      li.tabIndex = 0;
      li.innerHTML = `<button class="faq-q">${escapeHtml(it.q)}</button>`;
      li.querySelector('button').addEventListener('click', ()=> showAnswer(it));
      li.addEventListener('keypress', (e)=>{ if(e.key==='Enter') showAnswer(it); });
      listEl.appendChild(li);
    });
    updateMoreButton();
  }

  function showAnswer(it){
    answerEl.hidden = false;
    answerEl.innerHTML = `<div class="faq-answer-inner"><h4>${escapeHtml(it.q)}</h4><p>${escapeHtml(it.a)}</p><div class="faq-answer-footer"><span class="faq-footer-text">¿Necesitás más ayuda?</span><a href="https://wa.me/541156313633" target="_blank" rel="noopener noreferrer" class="faq-wa-btn" aria-label="Contactar por WhatsApp"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M19.11 17.38c-.26-.13-1.55-.76-1.79-.85-.24-.09-.42-.13-.6.13-.18.26-.69.85-.85 1.03-.16.18-.31.2-.57.07-.26-.13-1.1-.41-2.1-1.3-.78-.69-1.31-1.54-1.46-1.8-.15-.26-.02-.4.11-.53.12-.12.26-.31.39-.46.13-.15.18-.26.26-.44.09-.18.04-.33-.02-.46-.06-.13-.6-1.44-.83-1.97-.22-.53-.45-.46-.6-.46l-.51-.01c-.18 0-.46.07-.7.33-.24.26-.92.9-.92 2.19 0 1.29.95 2.54 1.08 2.72.13.18 1.87 2.86 4.53 4.01.63.27 1.12.44 1.51.56.64.2 1.22.17 1.68.1.51-.08 1.55-.63 1.77-1.24.22-.61.22-1.13.15-1.24-.07-.11-.24-.18-.5-.31zM16.02 3C9.39 3 4 8.35 4 14.94c0 2.32.67 4.49 1.83 6.33L4.6 27.9l6.82-1.78a12 12 0 0 0 4.6.9c6.63 0 12.02-5.35 12.02-11.94C28.04 8.35 22.65 3 16.02 3zm0 21.7c-1.54 0-3.03-.37-4.36-1.07l-.31-.16-4.05 1.05 1.08-3.95-.2-.4a9.6 9.6 0 0 1-1.25-4.72c0-5.29 4.34-9.6 9.7-9.6 5.35 0 9.7 4.31 9.7 9.6s-4.35 9.6-9.7 9.6z"/></svg></a></div><button class="faq-back">Volver</button></div>`;
    panel.querySelector('.faq-body').setAttribute('hidden','true');
    const back = answerEl.querySelector('.faq-back');
    back?.addEventListener('click', ()=>{ answerEl.hidden = true; panel.querySelector('.faq-body').removeAttribute('hidden'); searchInput.focus(); });
  }

  function updateMoreButton(){
    if(!moreBtn) return;
    if(searchInput.value && searchInput.value.trim().length){ moreBtn.hidden = true; return; }
    if(faqs.length > displayLimit){
      moreBtn.hidden = false;
      moreBtn.textContent = showingAll ? 'Mostrar menos' : 'Más consultas';
    } else {
      moreBtn.hidden = true;
    }
  }

  function search(q){
    if(!q){
      renderList(showingAll ? faqs : faqs.slice(0,displayLimit));
      return;
    }
    const scored = faqs.map(it=>({it,score:scoreMatch(it,q)})).filter(s=>s.score>0).sort((a,b)=>b.score-a.score).map(s=>s.it);
    renderList(scored);
  }

  searchInput.addEventListener('input',(e)=>{ search(e.target.value); });

  moreBtn?.addEventListener('click', ()=>{
    showingAll = !showingAll;
    renderList(showingAll ? faqs : faqs.slice(0,displayLimit));
  });

  function escapeHtml(s){ return String(s).replace(/[&<>\"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]; }); }

})();
