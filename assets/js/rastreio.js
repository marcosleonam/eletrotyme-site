/* Rastreio do site: eventos do Pixel da Meta nos cliques e UTMs levadas até a página de cadastro (/alugue).
   O pixel em si (PageView) fica no <head> de cada página, no código oficial da Meta. */
(function () {
  var PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];
  var q = new URLSearchParams(location.search), origem = {};
  PARAMS.forEach(function (k) { var v = q.get(k); if (v) origem[k] = v; });
  try {
    if (Object.keys(origem).length) sessionStorage.setItem('et_origem', JSON.stringify(origem));
    else origem = JSON.parse(sessionStorage.getItem('et_origem') || '{}');
  } catch (e) { /* navegação privada */ }
  // sem anúncio: marca que o motorista chegou ao cadastro pelo site
  if (!origem.utm_source && !origem.fbclid) origem = { utm_source: 'site', utm_medium: 'site', utm_campaign: 'site-institucional' };

  var track = function (tipo, nome, dados) { try { if (window.fbq) window.fbq(tipo, nome, dados); } catch (e) { /* pixel bloqueado */ } };

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
