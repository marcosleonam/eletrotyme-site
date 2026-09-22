# Eletrotyme — site + design system

Site institucional da Eletrotyme construído sobre o design de referência `pulsedesk-saas.aura.build.zip` (mesmas classes Tailwind, animações, WebGL e layout), recolorido para a marca (laranja `#f26522` + verde) e preenchido com o conteúdo dos projetos da pasta.

## Arquivos

- `index.html` — o site (herói, plataforma, por que agora, como funciona, benefícios, projetos, campanhas, modelos, FAQ, CTA, rodapé).
- `simulador.html` + `assets/js/simulador.js` — aba de simulação de investimento (parceria, posto pronto, investidor) com as premissas da proposta Posto Natureza.
- `assets/brand/estacoes/` — imagens da seção "Nossos eletropostos". **Placeholders**: frames do Reels e recortes das artes. Trocar pelas fotos reais e ajustar nomes/endereços dos cards em `index.html` (seção `id="eletropostos"`).
- `design-system.html` — pattern library: herói clonado, tipografia, cores e superfícies, componentes, layout, motion, ícones e marca.
- `assets/brand/` — símbolo do logo (recortado das artes, PNG transparente), 7 criativos da Semana do Cliente e o Reels do Posto Natureza.
- `assets/js/webgl-background.js` — fundo Three.js do herói; cores das trilhas em `config.color1..4`.
- `assets/css/animations.css` — keyframes `animationIn` e `progress-shimmer`.

## Publicação

GitHub Pages: https://marcosleonam.github.io/eletrotyme-site/ (branch `main`, raiz do repositório).

## Como abrir

Precisa de um servidor HTTP (o `file://` bloqueia o módulo ES do Three.js e o Tailwind runtime):

```bash
python -m http.server 8765 --directory eletrotyme-site
```

Depois abra `http://localhost:8765/index.html`. Fontes (Google Fonts), Three.js (unpkg) e ícones (Iconify API) carregam da internet.

## Stack

- Tailwind CSS 3.4.17 (runtime no navegador, `orange-500` sobrescrito para `#f26522`)
- Three.js r160 + postprocessing (bloom, SMAA, blur) via importmap
- Iconify (`iconify-icon` 2.1.0, conjunto Solar)
- Geist (corpo) e Plus Jakarta Sans (títulos)
- IntersectionObserver para scroll-reveal

## Fontes de conteúdo

- `posto-natureza-maiobao.pdf` — proposta (60 kW, ponto de equilíbrio, cenários, R$ 150 mil).
- `ELETROTYME_-_preto institucional.pdf` — deck (90 dias, modelo de investimento, ESG).
- `relatorio_eletrotyme.pdf` — resultados Meta Ads de agosto/2026.
- Artes `ChatGPT Image 15 de set. de 2026*.png` — logo e campanhas.
