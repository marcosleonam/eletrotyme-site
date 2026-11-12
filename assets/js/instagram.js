/* Seção #campanhas: troca os cards fixos pelas últimas publicações do Instagram @eletrotyme.
   O servidor grava ig/feed.json + as capas a cada 2 h (o token da Meta nunca vem para o navegador).
   Se o feed não carregar, os cards fixos do HTML continuam no lugar. */
(function () {
  var grade = document.getElementById('ig-grade');
  if (!grade) return;
  var esc = function (t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var dia = function (iso) { var p = String(iso).split('-'); return p.length === 3 ? Number(p[2]) + ' ' + MESES[Number(p[1]) - 1] + ' ' + p[0] : ''; };
  fetch('ig/feed.json?h=' + Math.floor(Date.now() / 3600000)).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (d) {
    var posts = (d.posts || []).filter(function (p) { return /^ig\/[\w-]+\.jpg$/.test(p.img) && /^https:\/\/www\.instagram\.com\//.test(p.link); }).slice(0, 8);
    if (posts.length < 4) return;
    grade.innerHTML = posts.map(function (p) {
      return '<a class="group relative flex flex-col rounded-[2rem] bg-gradient-to-b from-white/[0.05] to-transparent p-3 transition duration-300 ease-out hover:-translate-y-1" href="' + esc(p.link) + '" target="_blank" rel="noopener">'
        + '<div class="absolute inset-0 rounded-[2rem] border border-white/10 pointer-events-none group-hover:border-white/20 transition-colors"></div>'
        + '<div class="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent"></div>'
        + '<div class="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#08111f]/95 aspect-[4/5]">'
        + '<img alt="' + esc(p.titulo) + '" class="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]" loading="lazy" src="' + esc(p.img) + '"/>'
        + '<span class="absolute left-3 top-3 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm font-geist">' + esc(p.tipo) + '</span>'
        + '</div>'
        + '<p class="mt-4 px-3 text-xs font-medium text-white font-geist" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + esc(p.titulo) + '</p>'
        + '<p class="mt-1 mb-2 px-3 text-xs text-slate-500 font-geist">' + esc(p.tipo) + ' · ' + esc(dia(p.data)) + '</p>'
        + '</a>';
    }).join('');
    var r = document.getElementById('ig-rotulo'), t = document.getElementById('ig-texto');
    if (r) r.textContent = 'Instagram · @eletrotyme';
    if (t) t.textContent = 'As publicações mais recentes do perfil @eletrotyme, atualizadas automaticamente. Toque para abrir no Instagram.';
  }).catch(function () { /* fica com os cards fixos */ });
})();
