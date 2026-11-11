import { IMAGE_GALLERIES, GALLERY_PRESETS, isGalleryPreset } from "./mcp-os-galleries.js";

const THEME_STORAGE_KEY = "sendportal_theme";
const BG_STORAGE_KEY = "sendportal_bg";
const ECO_STORAGE_KEY = "sendportal_eco_mode";

export const BACKGROUND_PRESETS = [
  { id: "strands", name: "Strands Luminosos", category: "Energia & Luz", description: "Ondas volumétricas e gradientes dinâmicos de luz", badge: "Energia" },
  { id: "siderays", name: "Side Rays", category: "Luz & Brilho", description: "Feixes de luz laterais cinemáticos com dispersão", badge: "Cinemático" },
  { id: "plasmawave", name: "Plasma Wave", category: "Fluido & Eletricidade", description: "Ondas orgânicas fluidas de plasma cósmico", badge: "Fluido" },
  { id: "ferrofluid", name: "Ferrofluid", category: "Interativo & Física", description: "Fluido magnético responsivo ao movimento do cursor", badge: "Interativo" },
  { id: "softaurora", name: "Soft Aurora", category: "Atmosférico", description: "Aurora boreal difusa em camadas etéreas", badge: "Nébula" },
  { id: "particles", name: "Particles 3D", category: "3D & Cósmico", description: "Nuvem volumétrica tridimensional com partículas interativas e rotação orbital", badge: "3D" },
  { id: "ghostfibers", name: "Ghost Fibers", category: "Energia & Luz", description: "Camadas de ondas em espiral e refração óptica estilo fibra de alta frequência", badge: "Fibras" },
  { id: "dither", name: "Dither Waves", category: "Retro-Tech", description: "Ondas retro-futuristas com gradiente pontilhado dithered", badge: "Retro" },
  { id: "darkveil", name: "Dark Veil", category: "Cyberpunk", description: "Véu escuro e scanlines estilo Cyberpunk e CRT", badge: "Dark Cyber" },
  { id: "webthreads", name: "Web Threads", category: "Rede Neural", description: "Filamentos digitais entrelaçados de alta densidade", badge: "Rede" },
  { id: "topography", name: "Topography", category: "Cartografia", description: "Linhas topográficas cartográficas de alta precisão", badge: "Cartografia" },
  { id: "balatro", name: "Balatro Hypno", category: "Hipnótico", description: "Hipnose animada estilo carta espiral Balatro", badge: "Hipnótico" },
  { id: "faultyterminal", name: "Faulty Terminal", category: "Retro-Tech", description: "Distorção de tubo de raios catódicos com aberração cromática e flickering", badge: "Glitch" },
  { id: "morphslider", name: "Morph Slider", category: "Cinemático", description: "Efeito derretido com aberração óptica e fluxo líquido para fundos cinemáticos", badge: "Melt" },
  { id: "antigravity", name: "Antigravity", category: "3D & Cósmico", description: "Centenas de partículas magnéticas orbitando um anel de atração e ondulação gravítica", badge: "Gravidade" },
  { id: "aurora", name: "Aurora Boreal", category: "Atmosférico", description: "Cortinas boreais de alta saturação e mistura contínua entre violeta, verde e ciano", badge: "Boreal" },
  { id: "letterglitch", name: "Letter Glitch", category: "Retro-Tech", description: "Matriz cyberpunk de glifos em mutação aleatória com vinheta periférica suave", badge: "Matrix" },
  { id: "plasma", name: "Plasma Incandescente", category: "Fluido & Eletricidade", description: "Funções trigonométricas iterativas gerando ondas incandescentes de plasma", badge: "Plasma" },
  { id: "liquidether", name: "Liquid Ether", category: "Fluido & Eletricidade", description: "Simulação fluida de Navier-Stokes com dispersão de cor e perturbação por cursor", badge: "Fluido 3D" },
  { id: "orb", name: "Orb 3D", category: "3D & Cósmico", description: "Esfera plasmática tridimensional pulsante com turbulência na casca volumétrica", badge: "Orbe 3D" },
  { id: "prism", name: "Prism", category: "Luz & Brilho", description: "Geometria piramidal rotativa decompondo a luz ambiente em feixes espectrais", badge: "Prisma" },
  { id: "prismaticburst", name: "Prismatic Burst", category: "3D & Cósmico", description: "Raios volumétricos estelares com distorção rotacional e reflexos prismáticos", badge: "Burst 3D" },
  { id: "lightning", name: "Lightning", category: "Fluido & Eletricidade", description: "Descargas eletrostáticas ramificadas e estocásticas de alta voltagem com pós-brilho", badge: "Raio" },
  { id: "evileye", name: "Evil Eye 3D", category: "3D & Cósmico", description: "Íris viva gerada por ruído fractal com chamas periféricas e rastreamento de foco", badge: "Olho 3D" },
  { id: "beams", name: "Beams 3D", category: "Luz & Brilho", description: "Colunas de laser volumétrico tridimensional com ruído de iluminação em tempo real", badge: "Laser 3D" },
  { id: "floatinglines", name: "Floating Lines", category: "Energia & Luz", description: "Camadas de curvas harmônicas oscilantes com paralaxe e curvatura dinâmica", badge: "Curvas" },
  { id: "silk", name: "Silk", category: "Fluido & Eletricidade", description: "Tecido etéreo de seda líquida ondulando suavemente no espaço tridimensional", badge: "Seda" },
  { id: "radar", name: "Radar Tático", category: "Cyberpunk", description: "Display tático radial com anéis concêntricos e varredura rotativa de alta precisão", badge: "Radar" },
  { id: "ripplegrid", name: "Ripple Grid", category: "Cyberpunk", description: "Grade poligonal de perspectiva com ondas concêntricas disparadas pelo cursor", badge: "Grid" },
  { id: "pixelblast", name: "Pixel Blast", category: "Retro-Tech", description: "Matriz reticulada de micro-pixels responsiva a toques e pulsos de energia", badge: "Pixels" },
  { id: "magicrings", name: "Magic Rings", category: "3D & Cósmico", description: "Série de anéis ressonantes concêntricos com rotação diferencial e efeito de impacto", badge: "Anéis 3D" },
  { id: "gridscan", name: "Grid Scan", category: "Cyberpunk", description: "Feixe de laser de alta velocidade escaneando uma grade ortogonal cibernética", badge: "Scanner" },
  { id: "liquidchrome", name: "Liquid Chrome", category: "Fluido & Eletricidade", description: "Reflexos metálicos hipnóticos de mercúrio líquido fluindo sob distorção contínua", badge: "Cromo" },
  { id: "linewaves", name: "Line Waves", category: "Energia & Luz", description: "Linhas de contorno harmônico sobrepostas criando padrões moiré e interferência de fase", badge: "Moiré" },
  { id: "acidsquares", name: "Acid Squares", category: "Geometria Cósmica", description: "Grid geométrico psicodélico em túnel infinito", badge: "Geométrico" },
  { id: "moltenmetal", name: "Molten Metal", category: "Fusão Térmica", description: "Metal líquido incandescente em fusão térmica", badge: "Fusão" },
  { id: "lighttunnel", name: "Light Tunnel", category: "Hipervelocidade", description: "Túnel de cabos de fibra e pulsos de velocidade", badge: "Hipervelocidade" }
];

class McpOsThemeManager {
  constructor() {
    this.theme = localStorage.getItem(THEME_STORAGE_KEY) || "mcp-os-multi";
    this.activeBg = localStorage.getItem(BG_STORAGE_KEY) || "strands";
    this.ecoMode = localStorage.getItem(ECO_STORAGE_KEY) !== "false"; // default: true
    this.slideshowTimer = null;
    this.currentSlide = 1;
    this.currentImageIndex = 0;

    this.init();
  }

  async init() {
    this.applyTheme(this.theme);
    this.ensureCanvasRoot();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.setupUI();
        this.initTurboRouter();
      });
    } else {
      this.setupUI();
      this.initTurboRouter();
    }

    if (this.theme === "mcp-os-multi") {
      this.applyBackground(this.activeBg);
    }
  }

  // ==========================================================================
  // SEAMLESS SPA TURBO ROUTER (BACKGROUND PERSISTENTE E CONTÍNUO)
  // ==========================================================================
  initTurboRouter() {
    if (window.__mcpTurboInitialized) return;
    window.__mcpTurboInitialized = true;

    document.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link || !link.href) return;

      const url = new URL(link.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;
      if (url.pathname.includes("/logout")) return;
      if (link.getAttribute("data-no-turbo") !== null) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;

      // Não interceptar formulários ou botões com data-toggle
      if (link.getAttribute("data-toggle") || link.getAttribute("data-dismiss")) return;

      e.preventDefault();
      this.navigateTo(url.href);
    });

    window.addEventListener("popstate", () => {
      this.navigateTo(window.location.href, false);
    });
  }

  async navigateTo(url, pushState = true) {
    try {
      const appShell = document.getElementById("app-shell");
      if (appShell) {
        appShell.style.transition = "opacity 0.12s ease";
        appShell.style.opacity = "0.6";
      }

      const res = await fetch(url, {
        headers: { "X-Requested-With": "XMLHttpRequest" }
      });

      if (!res.ok) {
        window.location.href = url;
        return;
      }

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const newAppShell = doc.getElementById("app-shell");
      if (!newAppShell) {
        window.location.href = url;
        return;
      }

      if (doc.title) {
        document.title = doc.title;
      }

      if (appShell) {
        appShell.innerHTML = newAppShell.innerHTML;
        appShell.style.opacity = "1";
      }

      if (pushState) {
        window.history.pushState({}, "", url);
      }

      // Re-conectar botões de interface e Bootstrap
      this.bindBackgroundButton();

      if (window.$) {
        try {
          window.$('[data-toggle="tooltip"]').tooltip();
          window.$('[data-toggle="popover"]').popover();
        } catch(e) {}
      }

      window.scrollTo({ top: 0, behavior: "instant" });

      // Executar scripts embutidos na nova view
      const scripts = newAppShell.querySelectorAll("script");
      scripts.forEach(oldScript => {
        const s = document.createElement("script");
        Array.from(oldScript.attributes).forEach(a => s.setAttribute(a.name, a.value));
        s.textContent = oldScript.textContent;
        document.body.appendChild(s);
        s.remove();
      });

    } catch (err) {
      console.warn("[Turbo Router] Redirecionando para carregamento completo:", err);
      window.location.href = url;
    }
  }

  applyTheme(theme) {
    this.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    const amoledLink = document.getElementById("sendportal-amoled-css");
    const mcposLink = document.getElementById("sendportal-mcpos-css");

    if (theme === "mcp-os-multi") {
      document.documentElement.setAttribute("data-theme", "mcp-os-multi");
      document.body.classList.add("theme-mcp-os-multi");
      if (amoledLink) amoledLink.disabled = true;
      if (mcposLink) mcposLink.disabled = false;

      const root = document.getElementById("bg-container") || document.getElementById("sendportal-webgl-root");
      if (root) root.style.display = "block";
      const overlay = document.getElementById("bg-overlay");
      if (overlay) overlay.style.display = "block";
      const btn = document.getElementById("mcp-bg-toggle-btn");
      if (btn) btn.style.display = "inline-flex";
      this.applyBackground(this.activeBg);
    } else {
      document.documentElement.setAttribute("data-theme", "amoled");
      document.body.classList.remove("theme-mcp-os-multi");
      if (amoledLink) amoledLink.disabled = false;
      if (mcposLink) mcposLink.disabled = true;
      const root = document.getElementById("bg-container") || document.getElementById("sendportal-webgl-root");
      if (root) root.style.display = "none";
      const overlay = document.getElementById("bg-overlay");
      if (overlay) overlay.style.display = "none";
      const btn = document.getElementById("mcp-bg-toggle-btn");
      if (btn) btn.style.display = "none";
      if (typeof window.stopWebGLBackground === "function") {
        window.stopWebGLBackground();
      }
      this.stopSlideshow();
    }

    this.updateThemeChecks();
  }

  ensureCanvasRoot() {
    let root = document.getElementById("bg-container");
    if (!root) {
      root = document.createElement("div");
      root.id = "bg-container";
      root.innerHTML = `
        <div class="bg-slide active" id="bg-slide-1"></div>
        <div class="bg-slide" id="bg-slide-2"></div>
        <div id="bg-webgl-container"></div>
      `;
      document.body.prepend(root);
    }
    if (!document.getElementById("bg-overlay")) {
      const overlay = document.createElement("div");
      overlay.id = "bg-overlay";
      document.body.prepend(overlay);
    }
  }

  applyBackground(bgId) {
    if (!bgId) return;
    this.activeBg = bgId;
    localStorage.setItem(BG_STORAGE_KEY, bgId);
    this.updateButtonBadge();
    this.updateModalActiveStates();

    const isImage = isGalleryPreset(bgId);
    const ctnWebGL = document.getElementById("bg-webgl-container");

    if (isImage) {
      if (typeof window.stopWebGLBackground === "function") {
        try {
          window.stopWebGLBackground();
        } catch (e) {}
      }
      if (ctnWebGL) {
        ctnWebGL.style.display = "none";
      }
      this.startSlideshow(bgId);
    } else {
      this.stopSlideshow();

      if (ctnWebGL) {
        ctnWebGL.style.display = "block";
      }

      function tryRender(retries = 0) {
        if (typeof window.renderWebGLBackground === "function") {
          try {
            window.renderWebGLBackground(bgId);
          } catch (err) {
            console.warn("[WebGL] Shader render error:", err);
          }
        } else if (retries < 25) {
          setTimeout(() => tryRender(retries + 1), 60);
        }
      }
      tryRender();
    }
  }

  startSlideshow(galleryId) {
    this.stopSlideshow();

    const images = IMAGE_GALLERIES[galleryId] || IMAGE_GALLERIES["gallery-soft"] || [];
    if (!images || images.length === 0) return;

    const s1 = document.getElementById("bg-slide-1");
    const s2 = document.getElementById("bg-slide-2");
    if (!s1 || !s2) return;

    this.currentImageIndex = 0;
    this.currentSlide = 1;

    s1.style.backgroundImage = `url('${images[0]}')`;
    s1.classList.add("active");
    s2.classList.remove("active");

    this.slideshowTimer = setInterval(() => {
      // No modo eco, pausar slideshow se aba oculta
      if (document.hidden) return;

      this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
      const nextImg = images[this.currentImageIndex];

      if (this.currentSlide === 1) {
        s2.style.backgroundImage = `url('${nextImg}')`;
        s2.classList.add("active");
        s1.classList.remove("active");
        this.currentSlide = 2;
      } else {
        s1.style.backgroundImage = `url('${nextImg}')`;
        s1.classList.add("active");
        s2.classList.remove("active");
        this.currentSlide = 1;
      }
    }, 10000);
  }

  stopSlideshow() {
    if (this.slideshowTimer) {
      clearInterval(this.slideshowTimer);
      this.slideshowTimer = null;
    }
    const s1 = document.getElementById("bg-slide-1");
    const s2 = document.getElementById("bg-slide-2");
    if (s1) s1.classList.remove("active");
    if (s2) s2.classList.remove("active");
  }

  setupUI() {
    this.bindBackgroundButton();
    this.bindThemeToggleOptions();
    this.buildModal();
    this.updateButtonBadge();
  }

  bindBackgroundButton() {
    let btn = document.getElementById("mcp-bg-toggle-btn");
    if (btn) {
      btn.style.display = (this.theme === "mcp-os-multi") ? "inline-flex" : "none";
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openModal();
      };
      return;
    }

    const nav = document.querySelector(".main-header header.navbar .navbar-nav") ||
                document.querySelector(".main-header header.navbar") ||
                document.querySelector("header.navbar");

    if (nav) {
      btn = document.createElement("button");
      btn.id = "mcp-bg-toggle-btn";
      btn.className = "mcp-bg-button";
      btn.type = "button";
      btn.title = "Alterar Fundo e Galerias MCP OS";
      btn.innerHTML = `
        <span style="display:flex; align-items:center; gap:6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z"/></svg>
          <span>Backgrounds</span>
        </span>
        <span id="mcp-active-bg-badge" class="mcp-bg-badge">${this.getPresetBadge(this.activeBg)}</span>
      `;
      btn.style.display = (this.theme === "mcp-os-multi") ? "inline-flex" : "none";
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openModal();
      };

      const userDropdown = nav.querySelector(".user-dropdown");
      if (userDropdown && userDropdown.parentElement) {
        const li = document.createElement("li");
        li.className = "nav-item d-flex align-items-center mr-3";
        li.appendChild(btn);
        userDropdown.parentElement.insertBefore(li, userDropdown);
      } else {
        nav.appendChild(btn);
      }
    } else {
      // Página sem navbar (Login, Registro, 2FA) -> Botão flutuante
      btn = document.createElement("button");
      btn.id = "mcp-bg-toggle-btn";
      btn.className = "mcp-bg-button mcp-bg-button-floating";
      btn.type = "button";
      btn.title = "Alterar Fundo e Galerias MCP OS";
      btn.innerHTML = `
        <span style="display:flex; align-items:center; gap:6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z"/></svg>
          <span>Backgrounds</span>
        </span>
        <span id="mcp-active-bg-badge" class="mcp-bg-badge">${this.getPresetBadge(this.activeBg)}</span>
      `;
      btn.style.display = (this.theme === "mcp-os-multi") ? "inline-flex" : "none";
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openModal();
      };
      document.body.appendChild(btn);
    }
  }

  bindThemeToggleOptions() {
    const optMulti = document.getElementById("mcp-opt-multi");
    const optAmoled = document.getElementById("mcp-opt-amoled");

    if (optMulti) {
      optMulti.onclick = (e) => {
        e.preventDefault();
        this.applyTheme("mcp-os-multi");
      };
    }

    if (optAmoled) {
      optAmoled.onclick = (e) => {
        e.preventDefault();
        this.applyTheme("amoled");
      };
    }

    this.updateThemeChecks();
  }

  updateThemeChecks() {
    const checkMulti = document.getElementById("mcp-check-multi") || document.getElementById("mcp-check-multi-dyn");
    const checkAmoled = document.getElementById("mcp-check-amoled") || document.getElementById("mcp-check-amoled-dyn");
    if (checkMulti && checkAmoled) {
      if (this.theme === "mcp-os-multi") {
        checkMulti.style.display = "inline-block";
        checkAmoled.style.display = "none";
      } else {
        checkMulti.style.display = "none";
        checkAmoled.style.display = "inline-block";
      }
    }
  }

  getPresetBadge(id) {
    const isEco = this.ecoMode;
    const prefix = isEco ? "⚡ " : "";
    const webglPreset = BACKGROUND_PRESETS.find(p => p.id === id);
    if (webglPreset) return prefix + webglPreset.badge;

    const galleryPreset = GALLERY_PRESETS.find(p => p.id === id);
    if (galleryPreset) return prefix + galleryPreset.badge;

    return prefix + "Ativo";
  }

  updateButtonBadge() {
    const badge = document.getElementById("mcp-active-bg-badge");
    if (badge) {
      badge.textContent = this.getPresetBadge(this.activeBg);
    }
  }

  buildModal() {
    if (document.getElementById("mcp-bg-modal")) return;

    const modal = document.createElement("div");
    modal.id = "mcp-bg-modal";
    modal.className = "mcp-modal-backdrop";
    modal.style.display = "none";
    modal.innerHTML = `
      <div class="mcp-modal-window" role="dialog" aria-modal="true">
        <div class="mcp-modal-header">
          <div>
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#a855f7"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z"/></svg>
              <span>MCP OS // Central de Backgrounds</span>
            </h3>
            <p>Selecione entre os 13 Shaders WebGL em tempo real ou as 6 Galerias de Fotos com crossfade.</p>
          </div>
          <button type="button" class="mcp-modal-close" id="mcp-modal-close-btn">&times;</button>
        </div>

        <!-- BANNER DE ECONOMIA DE RAM E CPU -->
        <div class="mcp-eco-banner mx-4 mt-3">
          <div class="mcp-eco-info">
            <div class="mcp-eco-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#10b981"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span>Economia de RAM & CPU (Eco Saver)</span>
              <span class="mcp-eco-pill ${this.ecoMode ? 'active' : 'disabled'}" id="mcp-eco-status-pill">
                ${this.ecoMode ? '● ATIVADO (30 FPS · 0% 2º Plano · VRAM Opt)' : '○ DESATIVADO (60+ FPS)'}
              </span>
            </div>
            <p class="mcp-eco-desc">Limita o WebGL a 30 FPS, suspende o renderizador apenas quando a aba estiver oculta e otimiza a VRAM gráfica.</p>
          </div>
          <label class="mcp-switch">
            <input type="checkbox" id="mcp-eco-toggle" ${this.ecoMode ? 'checked' : ''}>
            <span class="mcp-slider"></span>
          </label>
        </div>

        <div class="mcp-modal-tabs">
          <button type="button" class="mcp-modal-tab-btn active" id="mcp-tab-webgl">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z"/></svg>
            <span>Shaders WebGL (13)</span>
          </button>
          <button type="button" class="mcp-modal-tab-btn" id="mcp-tab-gallery">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
            <span>Galerias de Fotos (6 Coleções · 68 Fotos)</span>
          </button>
        </div>

        <div class="mcp-modal-body">
          <!-- ABA 1: SHADERS WEBGL -->
          <div id="mcp-panel-webgl" class="mcp-tab-pane active">
            ${BACKGROUND_PRESETS.map(preset => `
              <div class="mcp-preset-card ${preset.id === this.activeBg ? 'active' : ''}" data-bg-id="${preset.id}">
                <div class="mcp-card-top">
                  <span class="mcp-card-title">${preset.name}</span>
                  <span class="mcp-card-badge">${preset.badge}</span>
                </div>
                <p class="mcp-card-desc">${preset.description}</p>
                <div class="mcp-card-footer">
                  <span>${preset.category}</span>
                  <span class="mcp-status-pill">${preset.id === this.activeBg ? '● ATIVO' : 'Ativar ➜'}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- ABA 2: GALERIAS DE FOTOS -->
          <div id="mcp-panel-gallery" class="mcp-tab-pane">
            ${GALLERY_PRESETS.map(preset => `
              <div class="mcp-gallery-card ${preset.id === this.activeBg ? 'active' : ''}" data-bg-id="${preset.id}">
                <div class="mcp-gallery-cover" style="background-image: url('${preset.coverImage}')">
                  <span class="mcp-card-badge" style="position: relative; z-index: 2;">${preset.badge}</span>
                  <span class="mcp-status-pill" style="position: relative; z-index: 2;">${preset.id === this.activeBg ? '● ATIVO' : ''}</span>
                </div>
                <div class="mcp-gallery-info">
                  <div>
                    <span class="mcp-card-title">${preset.name}</span>
                    <p class="mcp-card-desc" style="margin-top: 4px;">${preset.description}</p>
                  </div>
                  <div class="mcp-card-footer" style="padding-top: 8px; margin-top: 4px;">
                    <span>Slideshow 10s · 0% GPU</span>
                    <span class="mcp-status-pill">${preset.id === this.activeBg ? '● ATIVO' : 'Ativar ➜'}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const tabWebgl = document.getElementById("mcp-tab-webgl");
    const tabGallery = document.getElementById("mcp-tab-gallery");
    const panelWebgl = document.getElementById("mcp-panel-webgl");
    const panelGallery = document.getElementById("mcp-panel-gallery");

    tabWebgl.addEventListener("click", () => {
      tabWebgl.classList.add("active");
      tabGallery.classList.remove("active");
      panelWebgl.classList.add("active");
      panelGallery.classList.remove("active");
    });

    tabGallery.addEventListener("click", () => {
      tabGallery.classList.add("active");
      tabWebgl.classList.remove("active");
      panelGallery.classList.add("active");
      panelWebgl.classList.remove("active");
    });

    modal.querySelectorAll("[data-bg-id]").forEach(card => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = card.getAttribute("data-bg-id");
        if (id) {
          this.applyBackground(id);
        }
      });
    });

    // Listener do Toggle Eco
    const ecoToggle = document.getElementById("mcp-eco-toggle");
    const ecoPill = document.getElementById("mcp-eco-status-pill");
    if (ecoToggle) {
      ecoToggle.addEventListener("change", (e) => {
        const isChecked = e.target.checked;
        this.ecoMode = isChecked;
        if (window.mcpOsEcoEngine) {
          window.mcpOsEcoEngine.setEcoMode(isChecked);
        }
        localStorage.setItem(ECO_STORAGE_KEY, isChecked ? "true" : "false");
        if (ecoPill) {
          ecoPill.className = "mcp-eco-pill " + (isChecked ? "active" : "disabled");
          ecoPill.textContent = isChecked ? "● ATIVADO (30 FPS · 0% 2º Plano · VRAM Opt)" : "○ DESATIVADO (60+ FPS)";
        }
        this.updateButtonBadge();
      });
    }

    document.getElementById("mcp-modal-close-btn")?.addEventListener("click", () => this.closeModal());
    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeModal();
    });
  }

  updateModalActiveStates() {
    const modal = document.getElementById("mcp-bg-modal");
    if (!modal) return;

    modal.querySelectorAll("[data-bg-id]").forEach(card => {
      const id = card.getAttribute("data-bg-id");
      const isAct = (id === this.activeBg);
      card.classList.toggle("active", isAct);
      const pill = card.querySelector(".mcp-status-pill");
      if (pill) {
        pill.textContent = isAct ? "● ATIVO" : "Ativar ➜";
      }
    });
  }

  openModal() {
    this.buildModal();
    const modal = document.getElementById("mcp-bg-modal");
    if (modal) {
      modal.style.display = "flex";
      modal.offsetHeight; // trigger reflow
      modal.classList.add("show");
      this.updateModalActiveStates();
    }
  }

  closeModal() {
    const modal = document.getElementById("mcp-bg-modal");
    if (modal) {
      modal.classList.remove("show");
      setTimeout(() => {
        if (!modal.classList.contains("show")) {
          modal.style.display = "none";
        }
      }, 250);
    }
  }
}

if (typeof window !== "undefined") {
  window.mcpOsThemeManager = new McpOsThemeManager();
  window.openBackgroundsModal = function() {
    if (window.mcpOsThemeManager) {
      window.mcpOsThemeManager.openModal();
    }
  };
  window.switchMcpTheme = function(theme) {
    if (window.mcpOsThemeManager) {
      window.mcpOsThemeManager.applyTheme(theme);
    }
  };
}
