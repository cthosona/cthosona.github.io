import { createIcons, Handshake, TrendingDown, HeartHandshake, Mail, Phone, MapPin, Coffee, Search, Home, Tags, Key, ChevronRight, UserCheck, Building2, Euro, Briefcase, FileText, Menu, X, ArrowLeft, ChevronLeft, Filter, Map as MapIcon, List, Calendar, Layers } from 'lucide';
import L from 'leaflet';
import properties from "./properties.json";
import './index.css';

// State Management
let state = {
  activeSection: 'compradors',
  viewMode: 'list',
  selectedPropertyId: null,
  currentImageIndex: 0,
  isMobileMenuOpen: false,
  filterCategory: 'Totes',
  searchQuery: '',
  showSuggestions: false,
  minPrice: '',
  maxPrice: '',
  minSqm: '',
  minBedrooms: '',
  minBathrooms: '',
  isFiltersVisible: false
};

// Map Instance
let map = null;

function setState(newState) {
  state = { ...state, ...newState };
  render();
}

function render() {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div class="min-h-screen bg-white font-sans text-[#2a2a33]">
      ${renderNav()}
      <main class="pt-20">
        ${renderActiveSection()}
      </main>
      ${renderFooter()}
    </div>
  `;

  // Post-render lifecycle
  createIcons({
    icons: { Handshake, TrendingDown, HeartHandshake, Mail, Phone, MapPin, Coffee, Search, Home, Tags, Key, ChevronRight, UserCheck, Building2, Euro, Briefcase, FileText, Menu, X, ArrowLeft, ChevronLeft, Filter, MapIcon, List, Calendar, Layers }
  });

  const detailContainer = document.getElementById('detail-map-container');
  const catalogContainer = document.getElementById('catalog-map-container');

  if (state.activeSection === 'cataleg' && state.viewMode === 'map' && catalogContainer) {
    if (map) { map.remove(); map = null; }
    initCatalogMap();
  } else if (state.activeSection === 'detail' && detailContainer) {
    if (map) { map.remove(); map = null; }
    initDetailMap();
  } else {
    if (map) { map.remove(); map = null; }
  }

  attachEventListeners();
}

function renderNav() {
  const navItems = [
    { id: 'compradors', label: 'Comprar' },
    { id: 'venedors', label: 'Vendre' },
    { id: 'advocats', label: 'Professionals' }
  ];

  return `
    <nav class="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <button id="logo-btn" class="flex items-center gap-2 hover:opacity-80 transition-opacity text-left cursor-pointer">
          <i data-lucide="home" class="w-8 h-8 text-[#006aff]"></i>
          <div class="flex flex-col leading-none">
            <span class="font-bold text-xl tracking-tight text-[#006aff]">CTH Osona</span>
            <span class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Immobiliària</span>
          </div>
        </button>
        
        <div class="flex items-center gap-4 md:gap-8">
          <div class="hidden md:flex items-center gap-6">
            ${navItems.map(item => `
              <button
                data-section="${item.id}"
                class="nav-link text-sm font-semibold transition-colors relative py-1 cursor-pointer ${
                  state.activeSection === item.id ? 'text-[#006aff]' : 'text-gray-600 hover:text-[#006aff]'
                }"
              >
                ${item.label}
                ${state.activeSection === item.id ? '<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#006aff]"></div>' : ''}
              </button>
            `).join('')}
          </div>

          <div class="flex items-center gap-3">
            <button id="mobile-menu-toggle" class="md:hidden p-2 text-gray-600 hover:text-[#006aff] cursor-pointer">
              <i data-lucide="${state.isMobileMenuOpen ? 'x' : 'menu'}" class="w-6 h-6"></i>
            </button>
          </div>
        </div>
      </div>

      <div id="mobile-menu" class="md:hidden bg-white border-t border-gray-100 overflow-hidden ${state.isMobileMenuOpen ? 'block' : 'hidden'}">
        <div class="flex flex-col p-4 gap-4">
          ${navItems.map(item => `
            <button
              data-section="${item.id}"
              class="mobile-nav-link text-left text-lg font-semibold py-2 ${
                state.activeSection === item.id ? 'text-[#006aff]' : 'text-gray-600'
              }"
            >
              ${item.label}
            </button>
          `).join('')}
        </div>
      </div>
    </nav>
  `;
}

function renderActiveSection() {
  let content = '';
  switch (state.activeSection) {
    case 'compradors': content = renderCompradors(); break;
    case 'venedors': content = renderVenedors(); break;
    case 'advocats': content = renderAdvocats(); break;
    case 'cataleg': content = renderCataleg(); break;
    case 'detail': content = renderDetail(); break;
    default: content = renderCompradors(); break;
  }
  return `<div class="animate-fade-in-up">${content}</div>`;
}

function renderCompradors() {
  const featured = properties.find(p => p.featured) || properties[0];
  return `
    <section class="relative pt-12 pb-12 px-6 bg-gradient-to-b from-[#006aff]/5 to-white">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 drop-shadow-sm">
          Troba la teva nova llar <br /> a la comarca d'Osona
        </h1>
        <p class="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12">
          Som el teu portal de referència per a habitatges a Vic i la resta d'osona. Transparència, seguretat i acompanyament local al comprador.
        </p>
        <div class="max-w-2xl mx-auto relative">
          <div class="bg-white p-2 rounded-lg shadow-2xl border border-gray-100 flex items-center gap-2">
            <div class="flex-1 flex items-center px-4 gap-3 relative">
              <i data-lucide="search" class="w-5 h-5 text-gray-400"></i>
              <input 
                id="search-input"
                type="text" 
                placeholder="Busca per poble o codi postal..." 
                value="${state.searchQuery}"
                class="w-full py-3 outline-none text-gray-700 placeholder-gray-400 font-medium"
              />
            </div>
            <button id="search-submit" class="bg-[#006aff] text-white px-8 py-3 rounded-md font-bold hover:bg-[#0055cc] transition-colors cursor-pointer">
              Cercar
            </button>
          </div>
          ${renderSuggestions()}
        </div>
      </div>
    </section>

    <section class="pt-12 pb-16 px-6 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="mb-10">
          <h2 class="text-3xl md:text-4xl font-bold mb-8">Propietats destacades</h2>
          <div class="grid md:grid-cols-3 gap-8 mb-4">
            ${renderPropertyCard(featured)}
          </div>
          <div class="flex justify-between items-end mb-8">
            <p class="text-gray-600">Oportunitats exclusives a la comarca d'Osona.</p>
            <button id="view-all-btn" class="text-[#006aff] font-bold flex items-center gap-1 hover:underline cursor-pointer">
              Veure-les totes <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${['Masies', 'Pisos', 'Cases', 'Terrenys'].map(cat => `
            <div data-category="${cat}" class="category-btn bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center cursor-pointer group">
              <i data-lucide="building-2" class="w-6 h-6 mx-auto mb-3 text-[#006aff] group-hover:scale-110 transition-transform"></i>
              <span class="font-semibold text-sm">${cat}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="py-16 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-10">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Per què comprar amb CTH Osona?</h2>
          <div class="w-16 h-1 bg-[#006aff] mx-auto"></div>
        </div>
        <div class="grid md:grid-cols-3 gap-12">
          ${[
            { icon: 'search', title: "Cerca Personalitzada", desc: "No només ens fixem en el catàleg; busquem per tu fins a trobar l'espai ideal." },
            { icon: 'user-check', title: "Especialització Local", desc: "Vivim i treballem a Osona. Coneixem cada racó i les oportunitats reals." },
            { icon: 'key', title: "Seguretat Jurídica", desc: "Compra amb tranquil·litat. Els nostres advocats estan al teu costat durant tot el procés." }
          ].map(item => `
            <div class="bg-white p-8 rounded-2xl border border-gray-200 hover:border-[#006aff]/30 transition-colors">
              <div class="text-[#006aff] mb-6"><i data-lucide="${item.icon}"></i></div>
              <h3 class="text-xl font-bold mb-4">${item.title}</h3>
              <p class="text-gray-600 font-light">${item.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    ${renderCafeCTA()}
  `;
}

function renderSuggestions() {
  if (!state.showSuggestions || state.searchQuery.trim() === '') return '';
  
  const locations = Array.from(new Set(properties.map(p => p.location)));
  const filtered = locations.filter(loc => loc.toLowerCase().includes(state.searchQuery.toLowerCase()));
  
  if (filtered.length === 0) return '';

  return `
    <div class="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 py-2">
      ${filtered.map(loc => `
        <button data-location="${loc}" class="suggestion-btn w-full px-6 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer">
          <i data-lucide="map-pin" class="w-4 h-4 text-[#006aff]"></i>
          <span class="text-gray-700 font-medium">${loc}</span>
        </button>
      `).join('')}
    </div>
  `;
}

function getCertColor(p) {
  const cert = p.energyCertificate;
  if (cert === 'A') return 'text-green-600';
  if (cert === 'B') return 'text-green-500';
  if (cert === 'C') return 'text-yellow-500';
  if (cert === 'D') return 'text-yellow-600';
  if (cert === 'E') return 'text-orange-500';
  if (cert === 'F') return 'text-orange-600';
  if (cert === 'G') return 'text-red-600';
  return 'text-gray-400';
}

function getCertBg(p) {
  const cert = p.energyCertificate;
  if (cert === 'A') return 'bg-green-600';
  if (cert === 'B') return 'bg-green-500';
  if (cert === 'C') return 'bg-yellow-500';
  if (cert === 'D') return 'bg-yellow-600';
  if (cert === 'E') return 'bg-orange-500';
  if (cert === 'F') return 'bg-orange-600';
  if (cert === 'G') return 'bg-red-600';
  return 'bg-gray-400';
}

function renderPropertyCard(p) {
  return `
    <div data-id="${p.id}" class="property-card group bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden cursor-pointer">
      <div class="relative aspect-[4/3] overflow-hidden">
        <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
        ${p.tag ? `<div class="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-[#006aff]">${p.tag}</div>` : ''}
        <div class="absolute top-4 right-4 bg-white/90 backdrop-blur w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold shadow-sm">
          <span class="${getCertColor(p)}">${p.energyCertificate}</span>
        </div>
      </div>
      <div class="p-6">
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-2xl font-bold">${p.price.toLocaleString('de-DE')} €</h3>
          <i data-lucide="home" class="w-5 h-5 text-gray-300"></i>
        </div>
        <p class="text-gray-500 text-sm font-medium mb-4 flex items-center gap-1">
          <i data-lucide="map-pin" class="w-4 h-4"></i> ${p.location}
        </p>
        <div class="flex items-center gap-4 text-xs font-semibold text-gray-700 border-t border-gray-50 pt-4">
          ${p.bedrooms > 0 ? `<span>${p.bedrooms} hab.</span> <span class="text-gray-300">|</span>` : ''}
          ${p.bathrooms > 0 ? `<span>${p.bathrooms} banys</span> <span class="text-gray-300">|</span>` : ''}
          <span>${p.sqm} m²</span>
        </div>
      </div>
    </div>
  `;
}

function renderVenedors() {
  return `
    <section class="py-16 px-6 min-h-[70vh] flex items-center">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row gap-16 items-center">
          <div class="md:w-3/5">
            <h1 class="text-4xl md:text-6xl font-bold mb-8 leading-tight">Vengui la seva propietat amb <span class="text-green-600">garanties</span></h1>
            <p class="text-xl text-gray-600 mb-10 leading-relaxed">
              A CTH Osona t'oferim un servei professional i discret per assegurar que la teva venda sigui ràpida i satisfactòria.
            </p>
            <div class="grid sm:grid-cols-2 gap-8">
              ${[
                { icon: 'tags', title: "Valoració Real", desc: "Estudiem el mercat per donar-te un preu competitiu i atraure compradors reals." },
                { icon: 'building-2', title: "Màrqueting Prèmium", desc: "Publiquem en els millors portals amb fotografia i contingut d'alta qualitat." },
                { icon: 'file-text', title: "Visites i burocràcia", desc: "Ens encarreguem de certificats, cèdules i tota la gestió operativa." }
              ].map(item => `
                <div class="flex gap-4">
                  <div class="shrink-0 w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                    <i data-lucide="${item.icon}"></i>
                  </div>
                  <div>
                    <h4 class="font-bold text-lg">${item.title}</h4>
                    <p class="text-gray-600 text-sm">${item.desc}</p>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="mt-12 flex flex-wrap gap-4">
              <a href="mailto:cthosona@gmail.com" class="bg-green-600 text-white px-10 py-4 rounded-md font-bold hover:bg-green-700 transition-all shadow-lg active:scale-95 cursor-pointer">
                Demani valoració gratuïta
              </a>
              <a href="https://wa.me/34657241010" target="_blank" class="bg-white text-green-700 border border-green-200 px-10 py-4 rounded-md font-bold hover:bg-green-50 transition-colors shadow-sm flex items-center gap-2">
                Envia un WhatsApp
              </a>
            </div>
          </div>
          <div class="md:w-2/5 md:pl-12 border-l border-gray-100 hidden md:block">
            <div class="bg-green-50/50 p-10 rounded-3xl border border-green-100/50">
              <div class="mb-8">
                <p class="text-6xl font-bold text-green-600 mb-2">98%</p>
                <p class="text-sm font-bold text-gray-500 uppercase tracking-widest leading-none">Èxit de venda</p>
              </div>
              <p class="text-gray-600 italic leading-relaxed">
                "La nostra metodologia es basa en la transparència i l'eficàcia, eliminant el pes de la gestió per al venedor."
              </p>
              <div class="mt-8 flex items-center gap-3">
                <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold tracking-tighter italic">CTH</div>
                <span class="font-bold text-sm text-gray-900 tracking-tight">Compromís CTH Osona</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderAdvocats() {
  return `
    <section class="py-16 px-6 bg-slate-900 text-white min-h-[80vh] flex items-center">
      <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <div>
          <div class="inline-block bg-[#006aff] text-white px-4 py-1 rounded-full text-xs font-bold mb-6 uppercase tracking-widest leading-none">Aliança Estratègica</div>
          <h1 class="text-4xl md:text-7xl font-bold mb-8 leading-tight">
            Solucions per a <span class="text-[#006aff]">professionals</span>
          </h1>
          <p class="text-xl text-gray-400 mb-12 leading-relaxed">
            Establim acords de col·laboració amb advocats, gestors financers, promotors i arquitectes. Donem valor a la vostra gestió amb el nostre suport immobiliari local.
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div class="border-l-2 border-[#006aff] pl-6">
              <i data-lucide="euro" class="w-8 h-8 text-[#006aff] mb-4"></i>
              <h4 class="font-bold text-xl mb-2">Comissions</h4>
              <p class="text-gray-400 text-sm leading-relaxed">Models retributius clars per cada operació referida o col·laboració conjunta.</p>
            </div>
            <div class="border-l-2 border-[#006aff] pl-6">
              <i data-lucide="briefcase" class="w-8 h-8 text-[#006aff] mb-4"></i>
              <h4 class="font-bold text-xl mb-2">Sinergia</h4>
              <p class="text-gray-400 text-sm leading-relaxed">Sumem la nostra experiència comercial a la vostra visió tècnica o jurídica.</p>
            </div>
          </div>
          <div class="mt-16 flex flex-wrap gap-4">
            <a href="mailto:cthosona@gmail.com" class="bg-[#006aff] text-white px-12 py-4 rounded-md font-bold hover:bg-[#0055cc] transition-all shadow-xl cursor-pointer">
              Parli amb nosaltres
            </a>
            <a href="https://wa.me/34657241010" target="_blank" class="bg-slate-800 text-white border border-white/10 px-12 py-4 rounded-md font-bold hover:bg-slate-700 transition-all shadow-xl cursor-pointer">
              Envia un WhatsApp
            </a>
          </div>
        </div>
        <div class="relative group hidden md:block">
          <img src="https://picsum.photos/seed/osona-office/800/800" class="rounded-3xl border border-white/10 opacity-60 transition-opacity duration-500" referrerPolicy="no-referrer" />
        </div>
      </div>
    </section>
  `;
}

function renderCataleg() {
  const filtered = properties.filter(p => {
    if (state.filterCategory !== 'Totes' && p.category !== state.filterCategory) return false;
    if (state.searchQuery && !p.title.toLowerCase().includes(state.searchQuery.toLowerCase()) && !p.location.toLowerCase().includes(state.searchQuery.toLowerCase())) return false;
    if (state.maxPrice && p.price > parseInt(state.maxPrice)) return false;
    if (state.minSqm && p.sqm < parseInt(state.minSqm)) return false;
    if (state.minBedrooms && p.bedrooms < parseInt(state.minBedrooms)) return false;
    if (state.minBathrooms && p.bathrooms < parseInt(state.minBathrooms)) return false;
    return true;
  });

  return `
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <button id="back-home" class="flex items-center gap-2 text-[#006aff] font-bold mb-4 hover:underline cursor-pointer">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Tornar a l'inici
          </button>
          <h1 class="text-4xl md:text-5xl font-bold mb-2">Catàleg de Propietats</h1>
          <p class="text-gray-500">Explora les millors oportunitats a Osona</p>
        </div>
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex flex-wrap gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
            ${['Totes', 'Masies', 'Pisos', 'Cases', 'Terrenys'].map(cat => `
              <button data-cat-filter="${cat}" class="px-4 py-2 rounded-md text-sm font-semibold transition-all cursor-pointer ${state.filterCategory === cat ? 'bg-[#006aff] text-white shadow-md' : 'text-gray-600 hover:bg-white'}">
                ${cat}
              </button>
            `).join('')}
          </div>
          <div class="flex gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
            <button id="view-list" class="p-2 rounded-md ${state.viewMode === 'list' ? 'bg-[#006aff] text-white shadow-md' : 'text-gray-600 hover:bg-white'}"><i data-lucide="list" class="w-4 h-4"></i></button>
            <button id="view-map" class="p-2 rounded-md ${state.viewMode === 'map' ? 'bg-[#006aff] text-white shadow-md' : 'text-gray-600 hover:bg-white'}"><i data-lucide="map-icon" class="w-4 h-4"></i></button>
          </div>
        </div>
      </div>

      <div class="mb-8 relative">
        <div class="bg-white p-2 rounded-xl border border-gray-100 shadow-xl flex items-center gap-2">
          <div class="flex-1 flex items-center px-4 gap-3 relative">
            <i data-lucide="search" class="w-5 h-5 text-gray-400"></i>
            <input id="catalog-search" type="text" placeholder="Busca per poble o paraula clau..." value="${state.searchQuery}" class="w-full py-3 outline-none text-gray-700 placeholder-gray-400 font-medium text-lg" />
          </div>
          <button id="toggle-filters" class="flex items-center gap-2 px-6 py-3 rounded-lg font-bold border transition-all cursor-pointer ${state.isFiltersVisible ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}">
            <i data-lucide="filter" class="w-4 h-4"></i> Filtres
          </button>
        </div>
        ${renderSuggestions()}
      </div>

      <div id="advanced-filters" class="${state.isFiltersVisible ? 'block' : 'hidden'} mb-12">
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Preu Màxim</label>
            <input id="filter-max-price" type="number" placeholder="Ex: 500000" value="${state.maxPrice}" class="w-full bg-gray-50 border rounded-lg px-4 py-2.5 outline-none text-sm font-medium" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Habitacions Mín.</label>
            <select id="filter-min-beds" class="w-full bg-gray-50 border rounded-lg px-4 py-2.5 outline-none text-sm font-medium">
              <option value="">Qualsevol</option>
              ${[1,2,3,4,5].map(n => `<option value="${n}" ${parseInt(state.minBedrooms) === n ? 'selected' : ''}>${n}+</option>`).join('')}
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Banys Mín.</label>
            <select id="filter-min-baths" class="w-full bg-gray-50 border rounded-lg px-4 py-2.5 outline-none text-sm font-medium">
              <option value="">Qualsevol</option>
              ${[1,2,3,4].map(n => `<option value="${n}" ${parseInt(state.minBathrooms) === n ? 'selected' : ''}>${n}+</option>`).join('')}
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-400">M² Mínims</label>
            <input id="filter-min-sqm" type="number" placeholder="Ex: 100" value="${state.minSqm}" class="w-full bg-gray-50 border rounded-lg px-4 py-2.5 outline-none text-sm font-medium" />
          </div>
          <div class="flex items-end">
            <button id="reset-filters" class="w-full h-[46px] bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md">
              Eliminar Filtres
            </button>
          </div>
        </div>
      </div>

      ${state.viewMode === 'list' ? `
        <div class="grid md:grid-cols-3 gap-8">
          ${filtered.length > 0 ? filtered.map(p => renderPropertyCard(p)).join('') : '<div class="col-span-3 text-center py-20 bg-gray-50 border-2 border-dashed rounded-2xl text-gray-400">No s\'han trobat resultats.</div>'}
        </div>
      ` : `
        <div id="catalog-map-container" class="h-[700px] w-full bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 shadow-2xl relative z-0"></div>
      `}
    </div>
  `;
}

function renderDetail() {
  const p = properties.find(p => p.id === state.selectedPropertyId);
  if (!p) return 'Propietat no trobada';

  return `
    <div class="max-w-7xl mx-auto px-6 py-12">
      <button id="back-catalog" class="flex items-center gap-2 text-[#006aff] font-bold mb-8 hover:underline cursor-pointer group">
        <i data-lucide="arrow-left"></i> Tornar al catàleg
      </button>

      <div class="grid lg:grid-cols-3 gap-12">
        <div class="lg:col-span-2 space-y-8">
          <div class="relative aspect-[16/9] bg-gray-200 rounded-3xl overflow-hidden group shadow-2xl">
            <img src="${p.images?.[state.currentImageIndex] || p.image}" class="w-full h-full object-cover transition-opacity duration-300" referrerPolicy="no-referrer" />
            <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              ${(p.images || [p.image]).map((_, i) => `<div class="w-2 h-2 rounded-full ${i === state.currentImageIndex ? 'bg-white w-6' : 'bg-white/50'}"></div>`).join('')}
            </div>
            <button id="prev-img" class="absolute left-4 top-1/2 bg-white/90 p-3 rounded-full shadow-lg"><i data-lucide="chevron-left"></i></button>
            <button id="next-img" class="absolute right-4 top-1/2 bg-white/90 p-3 rounded-full shadow-lg"><i data-lucide="chevron-right"></i></button>
          </div>

          <div class="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm space-y-8">
            <div>
              <h1 class="text-4xl md:text-5xl font-bold mb-4">${p.title}</h1>
              <p class="flex items-center gap-2 text-gray-500 text-lg"><i data-lucide="map-pin"></i> ${p.location}</p>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-6 py-8 border-y border-gray-50">
              <div><p class="text-xs font-bold text-gray-400">Preu</p><p class="text-2xl font-bold text-[#006aff]">${p.price.toLocaleString('de-DE')} €</p></div>
              <div><p class="text-xs font-bold text-gray-400">Hab.</p><p class="text-2xl font-bold">${p.bedrooms}</p></div>
              <div><p class="text-xs font-bold text-gray-400">Banys</p><p class="text-2xl font-bold">${p.bathrooms}</p></div>
              <div><p class="text-xs font-bold text-gray-400">Sup.</p><p class="text-2xl font-bold">${p.sqm} m²</p></div>
              <div><p class="text-xs font-bold text-gray-400">C. Energ.</p><span class="w-8 h-8 rounded flex items-center justify-center text-white shadow-sm font-bold ${getCertBg(p)}">${p.energyCertificate}</span></div>
            </div>
            <div>
              <h3 class="text-2xl font-bold mb-6">Descripció</h3>
              <p class="text-gray-600 leading-relaxed text-lg whitespace-pre-line">${p.description}</p>
            </div>
            <div id="detail-map-container" class="h-[400px] rounded-2xl overflow-hidden border z-0 relative"></div>
          </div>
        </div>
        <div class="lg:col-span-1">
          <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl sticky top-32 space-y-8">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-[#006aff] rounded-full flex items-center justify-center text-white font-bold italic shadow-lg">CTH</div>
              <p class="font-bold text-lg">CTH Osona</p>
            </div>
            <div class="space-y-4">
              <a href="https://wa.me/34657241010" class="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg"><i data-lucide="phone"></i> WhatsApp Directe</a>
              <a href="mailto:cthosona@gmail.com" class="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg"><i data-lucide="mail"></i> Enviar email</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCafeCTA() {
  return `
    <section class="py-16 px-6 bg-[#f9f9fb] border-y border-gray-100">
      <div class="max-w-4xl mx-auto text-center">
        <i data-lucide="coffee" class="w-16 h-16 mx-auto mb-6 text-[#006aff]"></i>
        <h2 class="text-3xl md:text-5xl font-bold mb-6 italic serif">fem un cafè?</h2>
        <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Siguis promotor, gestor, advocat, venedor o estiguis buscant la teva nova llar, volem escoltar-te personalment per oferir-te la millor solució a Osona.
        </p>
        <a href="https://wa.me/34657241010" target="_blank" class="bg-white text-gray-700 border border-gray-200 px-10 py-4 rounded-md font-bold hover:bg-gray-50 transition-colors inline-block">
          Envia un WhatsApp
        </a>
      </div>
    </section>
  `;
}

function renderFooter() {
  return `
    <footer class="py-20 px-6 bg-white border-t border-gray-50">
      <div class="max-w-7xl mx-auto grid md:grid-cols-3 gap-16">
        <div>
          <div class="flex items-center gap-2 mb-6">
            <i data-lucide="home" class="text-[#006aff] w-8 h-8"></i>
            <span class="font-bold text-xl text-[#006aff]">CTH Osona</span>
          </div>
          <p class="text-gray-500 text-sm">Especialistes en el mercat d'Osona, centrats en el tracte humà i l'eficàcia operativa.</p>
        </div>
        <div>
          <h4 class="font-bold mb-6 text-xs uppercase tracking-widest">Contacte</h4>
          <p class="text-sm text-gray-600 mb-2">Rambla de l'Hospital, 6, Vic</p>
          <p class="text-sm text-gray-600 mb-2">+34 657 241 010</p>
          <p class="text-sm text-gray-600">cthosona@gmail.com</p>
        </div>
        <div>
          <h4 class="font-bold mb-6 text-xs uppercase tracking-widest">Informació</h4>
          <ul class="text-sm text-gray-600 space-y-2">
            <li><button class="nav-link" data-section="cataleg">Cataleg de propietas</button></li>
            <li><button class="nav-link" data-section="venedors">Vendre casa</button></li>
          </ul>
        </div>
      </div>
    </footer>
  `;
}

function attachEventListeners() {
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(btn => {
    btn.onclick = () => setState({ activeSection: btn.dataset.section, isMobileMenuOpen: false });
  });

  const logoBtn = document.getElementById('logo-btn');
  if (logoBtn) logoBtn.onclick = () => setState({ activeSection: 'compradors' });

  const mobileToggle = document.getElementById('mobile-menu-toggle');
  if (mobileToggle) mobileToggle.onclick = () => setState({ isMobileMenuOpen: !state.isMobileMenuOpen });

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.oninput = (e) => setState({ searchQuery: e.target.value, showSuggestions: true });
    searchInput.onfocus = () => setState({ showSuggestions: true });
  }

  const searchSubmit = document.getElementById('search-submit');
  if (searchSubmit) searchSubmit.onclick = () => setState({ activeSection: 'cataleg' });

  document.querySelectorAll('.suggestion-btn').forEach(btn => {
    btn.onclick = () => {
      setState({ searchQuery: btn.dataset.location, showSuggestions: false, activeSection: 'cataleg' });
    };
  });

  const viewAllBtn = document.getElementById('view-all-btn');
  if (viewAllBtn) viewAllBtn.onclick = () => setState({ activeSection: 'cataleg' });

  document.querySelectorAll('.property-card').forEach(card => {
    card.onclick = () => {
      setState({ activeSection: 'detail', selectedPropertyId: parseInt(card.dataset.id), currentImageIndex: 0 });
      window.scrollTo(0,0);
    };
  });

  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.onclick = () => setState({ activeSection: 'cataleg', filterCategory: btn.dataset.category });
  });

  const backHome = document.getElementById('back-home');
  if (backHome) backHome.onclick = () => setState({ activeSection: 'compradors' });

  const backCatalog = document.getElementById('back-catalog');
  if (backCatalog) backCatalog.onclick = () => setState({ activeSection: 'cataleg' });

  document.querySelectorAll('[data-cat-filter]').forEach(btn => {
    btn.onclick = () => setState({ filterCategory: btn.dataset.catFilter });
  });

  const viewList = document.getElementById('view-list');
  if (viewList) viewList.onclick = () => setState({ viewMode: 'list' });
  const viewMap = document.getElementById('view-map');
  if (viewMap) viewMap.onclick = () => setState({ viewMode: 'map' });

  const toggleFilters = document.getElementById('toggle-filters');
  if (toggleFilters) toggleFilters.onclick = () => setState({ isFiltersVisible: !state.isFiltersVisible });

  const filterMaxPrice = document.getElementById('filter-max-price');
  if (filterMaxPrice) filterMaxPrice.onchange = (e) => setState({ maxPrice: e.target.value });
  const filterMinBeds = document.getElementById('filter-min-beds');
  if (filterMinBeds) filterMinBeds.onchange = (e) => setState({ minBedrooms: e.target.value });
  const filterMinBaths = document.getElementById('filter-min-baths');
  if (filterMinBaths) filterMinBaths.onchange = (e) => setState({ minBathrooms: e.target.value });
  const filterMinSqm = document.getElementById('filter-min-sqm');
  if (filterMinSqm) filterMinSqm.onchange = (e) => setState({ minSqm: e.target.value });

  const resetFilters = document.getElementById('reset-filters');
  if (resetFilters) resetFilters.onclick = () => setState({ maxPrice: '', minBedrooms: '', minBathrooms: '', minSqm: '', filterCategory: 'Totes', searchQuery: '' });

  const prevImg = document.getElementById('prev-img');
  if (prevImg) {
    prevImg.onclick = () => {
      const p = properties.find(p => p.id === state.selectedPropertyId);
      const len = p.images ? p.images.length : 1;
      setState({ currentImageIndex: (state.currentImageIndex - 1 + len) % len });
    };
  }
  const nextImg = document.getElementById('next-img');
  if (nextImg) {
    nextImg.onclick = () => {
      const p = properties.find(p => p.id === state.selectedPropertyId);
      const len = p.images ? p.images.length : 1;
      setState({ currentImageIndex: (state.currentImageIndex + 1) % len });
    };
  }
}

function initDetailMap() {
  const p = properties.find(p => p.id === state.selectedPropertyId);
  const container = document.getElementById('detail-map-container');
  if (container && !map) {
    map = L.map('detail-map-container').setView([p.lat, p.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([p.lat, p.lng]).addTo(map).bindPopup(p.title);
  }
}

function initCatalogMap() {
  const container = document.getElementById('catalog-map-container');
  if (container && !map) {
    map = L.map('catalog-map-container').setView([41.9301, 2.2547], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    properties.forEach(p => {
      if (state.filterCategory !== 'Totes' && p.category !== state.filterCategory) return;
      L.marker([p.lat, p.lng]).addTo(map).bindPopup(`
        <div class="w-48">
          <img src="${p.image}" class="w-full h-24 object-cover rounded mb-2" />
          <p class="font-bold">${p.price.toLocaleString()} €</p>
          <p class="text-xs">${p.title}</p>
        </div>
      `);
    });
  }
}

// Initial Render
render();
