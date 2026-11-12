/* Rastreio do site: eventos do Pixel da Meta nos cliques, UTMs levadas até a página de cadastro (/alugue) e cópia de cada
   evento para o nosso servidor (/api/pixel/evento → Conversions API da Meta). O mesmo id vai ao pixel (eventID) e ao servidor:
   a Meta junta os dois e conta uma vez só. O servidor cobre quem usa bloqueador de anúncio ou iPhone.
   O pixel em si (PageView) fica no <head> de cada página, no código oficial da Meta. */
(function () {
  var PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];
  var q = new URLSearchParams(location.search), origem = {};
  PARAMS.forEach(function (k) { var v = q.get(k); if (v) origem[k] = v; });
  try {
    if (Object.keys(origem).length) sessionStorage.setItem('et_origem', JSON.stringify(origem));
    else origem = JSON.parse(sessionStorage.getItem('et_origem') || '{}');
  } catch (e) { /* navegação privada */ }
  var fbclid = origem.fbclid;
  // sem anúncio: marca que o motorista chegou ao cadastro pelo site
  if (!origem.utm_source && !origem.fbclid) origem = { utm_source: 'site', utm_medium: 'site', utm_campaign: 'site-institucional' };

  var cookie = function (n) { var m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : undefined; };
  var novoId = function () { return 'et-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10); };
  // clique de anúncio sem o cookie _fbc (pixel bloqueado): monta o fbc no formato da Meta a partir do fbclid
  var fbc = function () {
    var c = cookie('_fbc'); if (c) return c;
    if (!fbclid) return undefined;
    try { var t = sessionStorage.getItem('et_fbc_t') || String(Date.now()); sessionStorage.setItem('et_fbc_t', t); return 'fb.1.' + t + '.' + fbclid; } catch (e) { return 'fb.1.' + Date.now() + '.' + fbclid; }
  };
  var servidor = function (nome, id, dados) {
    try {
      var corpo = JSON.stringify({ n: nome, id: id, u: location.href, fbp: cookie('_fbp'), fbc: fbc(), c: dados || {} });
      if (navigator.sendBeacon && navigator.sendBeacon('/api/pixel/evento', new Blob([corpo], { type: 'text/plain' }))) return;
      fetch('/api/pixel/evento', { method: 'POST', body: corpo, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(function () {});
    } catch (e) { /* sem rede */ }
  };
  var track = function (tipo, nome, dados) {
    var id = novoId();
    try { if (window.fbq) window.fbq(tipo, nome, dados, { eventID: id }); } catch (e) { /* pixel bloqueado */ }
    servidor(nome, id, dados);
  };

  // visita: mesmo id do PageView do <head>; espera 1,5 s para o pixel gravar o cookie _fbp
  setTimeout(function () { servidor('PageView', window.etPv || novoId()); }, 1500);

  document.querySelectorAll('a[href*="app.eletrotyme.com.br/alugue"]').forEach(function (a) {
    var u = new URL(a.href);
    Object.keys(origem).forEach(function (k) { if (!u.searchParams.has(k)) u.searchParams.set(k, origem[k]); });
    a.href = u.toString();
    a.addEventListener('click', function () { track('trackCustom', 'CliqueLocacao', { content_name: 'cadastro motorista' }); });
  });

  document.querySelectorAll('a[href*="wa.me/"]').forEach(function (a) {
    var texto = new URL(a.href).searchParams.get('text') || '';
    var assunto = /hub|proposta/i.test(texto) ? 'hub de eletropostos' : /loca/i.test(texto) ? 'locacao' : /eletroposto/i.test(texto) ? 'recarga' : 'geral';
    a.addEventListener('click', function () { track('track', 'Contact', { content_name: 'whatsapp', content_category: assunto }); });
  });
})();
