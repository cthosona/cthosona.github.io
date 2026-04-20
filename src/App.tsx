/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import properties from "./properties.json";
import { 
  Handshake, 
  TrendingDown, 
  HeartHandshake, 
  Mail, 
  Phone, 
  MapPin, 
  Coffee,
  Search,
  Home,
  Tags,
  Key,
  ChevronRight,
  UserCheck,
  Building2,
  Euro,
  Briefcase,
  FileText,
  Menu,
  X,
  ArrowLeft,
  ChevronLeft,
  Filter,
  Map as MapIcon,
  List,
  Calendar,
  Layers
} from "lucide-react";

// Fix Leaflet marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type Section = 'compradors' | 'venedors' | 'advocats' | 'cataleg' | 'detail';
type ViewMode = 'list' | 'map';

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqm: number;
  energyCertificate: string;
  image: string;
  images: string[];
  lat: number;
  lng: number;
  description: string;
  category: string;
  featured: boolean;
  tag?: string;
}

// Helper to recenter map
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('compradors');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('Totes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Advanced Filters State
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minSqm, setMinSqm] = useState<string>('');
  const [minBedrooms, setMinBedrooms] = useState<string>('');
  const [minBathrooms, setMinBathrooms] = useState<string>('');
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  const resetFilters = () => {
    setFilterCategory('Totes');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setMinSqm('');
    setMinBedrooms('');
    setMinBathrooms('');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableLocations = useMemo(() => {
    return Array.from(new Set(properties.map(p => p.location)));
  }, []);

  const locationSuggestions = useMemo(() => {
    if (searchQuery.trim() === '') return [];
    const q = searchQuery.toLowerCase();
    return availableLocations.filter(loc => 
      loc.toLowerCase().includes(q)
    );
  }, [searchQuery, availableLocations]);

  const filteredProperties = useMemo(() => {
    let result = properties;
    
    if (filterCategory !== 'Totes') {
      result = result.filter(p => p.category === filterCategory);
    }
    
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.location.toLowerCase().includes(q)
      );
    }

    if (minPrice) result = result.filter(p => p.price >= parseInt(minPrice));
    if (maxPrice) result = result.filter(p => p.price <= parseInt(maxPrice));
    if (minSqm) result = result.filter(p => p.sqm >= parseInt(minSqm));
    if (minBedrooms) result = result.filter(p => p.bedrooms >= parseInt(minBedrooms));
    if (minBathrooms) result = result.filter(p => p.bathrooms >= parseInt(minBathrooms));
    
    return result;
  }, [filterCategory, searchQuery, minPrice, maxPrice, minSqm, minBedrooms, minBathrooms]);

  const selectedProperty = useMemo(() => {
    return properties.find(p => p.id === selectedPropertyId) as Property | undefined;
  }, [selectedPropertyId]);

  const handlePropertyClick = (id: number) => {
    setSelectedPropertyId(id);
    setActiveSection('detail');
    setCurrentImageIndex(0);
    window.scrollTo(0, 0);
  };

  const handleSearchSubmit = () => {
    setActiveSection('cataleg');
    window.scrollTo(0, 0);
  };

  const featuredProperty = useMemo(() => {
    return properties.find(p => p.featured) || properties[0];
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5 }
  };

  const navItems = [
    { id: 'compradors', label: 'Comprar' },
    { id: 'venedors', label: 'Vendre' },
    { id: 'advocats', label: 'Professionals' }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#2a2a33]">
      {/* Header / Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <button 
            onClick={() => setActiveSection('compradors')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left cursor-pointer"
          >
            <Home className="w-8 h-8 text-[#006aff]" />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-xl tracking-tight text-[#006aff]">CTH Osona</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Immobiliària</span>
            </div>
          </button>
          
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id as Section);
                    window.scrollTo(0, 0);
                  }}
                  className={`text-sm font-semibold transition-colors relative py-1 cursor-pointer ${
                    activeSection === item.id ? 'text-[#006aff]' : 'text-gray-600 hover:text-[#006aff]'
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <motion.div 
                      layoutId="underline" 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#006aff]" 
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 text-gray-600 hover:text-[#006aff] cursor-pointer"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="flex flex-col p-4 gap-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id as Section);
                      setIsMobileMenuOpen(false);
                      window.scrollTo(0, 0);
                    }}
                    className={`text-left text-lg font-semibold py-2 ${
                      activeSection === item.id ? 'text-[#006aff]' : 'text-gray-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content Area */}
      <main className="pt-20">
        <AnimatePresence mode="wait">
          {activeSection === 'compradors' && (
            <motion.div key="compradors" {...fadeInUp}>
              {/* Buyers Hero */}
              <section className="relative pt-12 pb-12 px-6 bg-gradient-to-b from-[#006aff]/5 to-white">
                <div className="max-w-7xl mx-auto text-center">
                  <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 drop-shadow-sm">
                    Troba la teva nova llar <br /> a la comarca d'Osona
                  </h1>
                  <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12">
                    Som el teu portal de referència per a habitatges a Vic i la resta d'osona. Transparència, seguretat i acompanyament local al comprador.
                  </p>
                                  <div className="max-w-2xl mx-auto relative" ref={searchRef}>
                    <div className="bg-white p-2 rounded-lg shadow-2xl border border-gray-100 flex items-center gap-2">
                      <div className="flex-1 flex items-center px-4 gap-3 relative">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Busca per poble o codi postal..." 
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                          className="w-full py-3 outline-none text-gray-700 placeholder-gray-400 font-medium"
                        />
                      </div>
                      <button 
                        onClick={handleSearchSubmit}
                        className="bg-[#006aff] text-white px-8 py-3 rounded-md font-bold hover:bg-[#0055cc] transition-colors cursor-pointer"
                      >
                        Cercar
                      </button>
                    </div>

                    {/* Autocomplete Suggestions */}
                    <AnimatePresence>
                      {showSuggestions && locationSuggestions.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 py-2"
                        >
                          {locationSuggestions.map((loc, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setSearchQuery(loc);
                                setShowSuggestions(false);
                                handleSearchSubmit();
                              }}
                              className="w-full px-6 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer"
                            >
                              <MapPin className="w-4 h-4 text-[#006aff]" />
                              <span className="text-gray-700 font-medium">{loc}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </section>
                
              {/* Featured Properties Header + Categories */}
              <section className="pt-12 pb-16 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8">Propietats destacades</h2>
                    
                    {/* The house offered (Card) moved here */}
                    <div className="grid md:grid-cols-3 gap-8 mb-4">
                      {/* Featured Property from JSON */}
                      <motion.div 
                        whileHover={{ y: -5 }}
                        onClick={() => handlePropertyClick(featuredProperty.id)}
                        className="group bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden cursor-pointer"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img 
                            src={featuredProperty.image} 
                            alt={featuredProperty.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          {featuredProperty.tag && (
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-[#006aff]">
                              {featuredProperty.tag}
                            </div>
                          )}
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold shadow-sm">
                            <span className={
                              featuredProperty.energyCertificate === 'A' ? 'text-green-600' :
                              featuredProperty.energyCertificate === 'B' ? 'text-green-500' :
                              featuredProperty.energyCertificate === 'C' ? 'text-yellow-500' :
                              featuredProperty.energyCertificate === 'D' ? 'text-yellow-600' :
                              featuredProperty.energyCertificate === 'E' ? 'text-orange-500' :
                              featuredProperty.energyCertificate === 'F' ? 'text-orange-600' :
                              featuredProperty.energyCertificate === 'G' ? 'text-red-600' : 'text-gray-400'
                            }>
                              {featuredProperty.energyCertificate}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-2xl font-bold">{featuredProperty.price.toLocaleString('de-DE')} €</h3>
                            <Home className="w-5 h-5 text-gray-300" />
                          </div>
                          <p className="text-gray-500 text-sm font-medium mb-4 flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> {featuredProperty.location}
                          </p>
                          <div className="flex items-center gap-4 text-xs font-semibold text-gray-700 border-t border-gray-50 pt-4">
                            {featuredProperty.bedrooms > 0 && <span>{featuredProperty.bedrooms} hab.</span>}
                            {featuredProperty.bedrooms > 0 && <span className="text-gray-300">|</span>}
                            {featuredProperty.bathrooms > 0 && <span>{featuredProperty.bathrooms} banys</span>}
                            {featuredProperty.bathrooms > 0 && <span className="text-gray-300">|</span>}
                            <span>{featuredProperty.sqm} m²</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    <div className="flex justify-between items-end mb-8">
                      <p className="text-gray-600">Oportunitats exclusives a la comarca d'Osona.</p>
                      <button 
                        onClick={() => { setActiveSection('cataleg'); window.scrollTo(0, 0); }}
                        className="text-[#006aff] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        Veure-les totes <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Masies', 'Pisos', 'Cases', 'Terrenys'].map((cat, i) => (
                      <div 
                        key={i} 
                        onClick={() => { setFilterCategory(cat); setActiveSection('cataleg'); window.scrollTo(0,0); }}
                        className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center cursor-pointer group"
                      >
                        <Building2 className="w-6 h-6 mx-auto mb-3 text-[#006aff] group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-sm">{cat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Buyers Content */}
              <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Per què comprar amb CTH Osona?</h2>
                    <div className="w-16 h-1 bg-[#006aff] mx-auto"></div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-12">
                    {[
                      { icon: <Search />, title: "Cerca Personalitzada", desc: "No només ens fixem en el catàleg; busquem per tu fins a trobar l'espai ideal." },
                      { icon: <UserCheck />, title: "Especialització Local", desc: "Vivim i treballem a Osona. Coneixem cada racó i les oportunitats reals." },
                      { icon: <Key />, title: "Seguretat Jurídica", desc: "Compra amb tranquil·litat. Els nostres advocats estan al teu costat durant tot el procés." }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-[#006aff]/30 transition-colors">
                        <div className="text-[#006aff] mb-6 outline-none">{item.icon}</div>
                        <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                        <p className="text-gray-600 font-light">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Common CTA Section (Only on landing page) */}
              <section className="py-16 px-6 bg-[#f9f9fb] border-y border-gray-100">
                <div className="max-w-4xl mx-auto text-center">
                  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
                    <Coffee className="w-16 h-16 mx-auto mb-6 text-[#006aff]" />
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 italic">fem un cafè?</h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                      Siguis promotor, gestor, advocat, venedor o estiguis buscant la teva nova llar, volem escoltar-te personalment per oferir-te la millor solució a Osona.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <a 
                        href="https://wa.me/34657241010" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-gray-700 border border-gray-200 px-10 py-4 rounded-md font-bold hover:bg-gray-50 transition-colors"
                      >
                        Envia un WhatsApp
                      </a>
                    </div>
                  </motion.div>
                </div>
              </section>
            </motion.div>
          )}

          {activeSection === 'venedors' && (
            <motion.div key="venedors" {...fadeInUp}>
              {/* Sellers Section */}
              <section className="py-16 px-6 min-h-[70vh] flex items-center">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row gap-16 items-center">
                    <div className="md:w-3/5">
                      <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">Vengui la seva propietat amb <span className="text-green-600">garanties</span></h1>
                      <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                        A CTH Osona t'oferim un servei professional i discret per assegurar que la teva venda sigui ràpida i satisfactòria.
                      </p>
                      
                      <div className="grid sm:grid-cols-2 gap-8">
                        {[
                          { icon: <Tags />, title: "Valoració Real", desc: "Estudiem el mercat per donar-te un preu competitiu i atraure compradors reals." },
                          { icon: <Building2 />, title: "Màrqueting Prèmium", desc: "Publiquem en els millors portals amb fotografia i contingut d'alta qualitat." },
                          { icon: <FileText />, title: "Visites i burocràcia", desc: "Ens encarreguem de certificats, cèdules i tota la gestió operativa." }
                        ].map((item, idx) => (
                          <div key={idx} className="flex gap-4">
                            <div className="shrink-0 w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="font-bold text-lg">{item.title}</h4>
                              <p className="text-gray-600 text-sm">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-12 flex flex-wrap gap-4">
                        <a 
                          href="mailto:cthosona@gmail.com"
                          className="bg-green-600 text-white px-10 py-4 rounded-md font-bold hover:bg-green-700 transition-all shadow-lg active:scale-95 cursor-pointer"
                        >
                          Demani valoració gratuïta
                        </a>
                        <a 
                          href="https://wa.me/34657241010" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white text-green-700 border border-green-200 px-10 py-4 rounded-md font-bold hover:bg-green-50 transition-colors shadow-sm flex items-center gap-2"
                        >
                          Envia un WhatsApp
                        </a>
                      </div>
                    </div>
                    <div className="md:w-2/5 md:pl-12 border-l border-gray-100 hidden md:block">
                      <div className="bg-green-50/50 p-10 rounded-3xl border border-green-100/50">
                        <div className="mb-8">
                          <p className="text-6xl font-bold text-green-600 mb-2">98%</p>
                          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-none">Èxit de venda</p>
                        </div>
                        <p className="text-gray-600 italic leading-relaxed">
                          "La nostra metodologia es basa en la transparència i l'eficàcia, eliminant el pes de la gestió per al venedor."
                        </p>
                        <div className="mt-8 flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold tracking-tighter italic">CTH</div>
                          <span className="font-bold text-sm text-gray-900 tracking-tight">Compromís CTH Osona</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeSection === 'advocats' && (
            <motion.div key="advocats" {...fadeInUp}>
              {/* Professionals Section */}
              <section className="py-16 px-6 bg-slate-900 text-white min-h-[80vh] flex items-center">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
                  <div>
                    <div className="inline-block bg-[#006aff] text-white px-4 py-1 rounded-full text-xs font-bold mb-6 uppercase tracking-widest leading-none">Aliança Estratègica</div>
                    <h1 className="text-4xl md:text-7xl font-bold mb-8 leading-tight">
                      Solucions per a <span className="text-[#006aff]">professionals</span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-12 leading-relaxed">
                      Establim acords de col·laboració amb advocats, gestors financers, promotors i arquitectes. Donem valor a la vostra gestió amb el nostre suport immobiliari local.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                      <div className="border-l-2 border-[#006aff] pl-6">
                        <Euro className="w-8 h-8 text-[#006aff] mb-4" />
                        <h4 className="font-bold text-xl mb-2">Comissions</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">Models retributius clars per cada operació referida o col·laboració conjunta.</p>
                      </div>
                      <div className="border-l-2 border-[#006aff] pl-6">
                        <Briefcase className="w-8 h-8 text-[#006aff] mb-4" />
                        <h4 className="font-bold text-xl mb-2">Sinergia</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">Sumem la nostra experiència comercial a la vostra visió tècnica o jurídica.</p>
                      </div>
                    </div>
                    
                    <div className="mt-16 flex flex-wrap gap-4">
                      <a 
                        href="mailto:cthosona@gmail.com"
                        className="bg-[#006aff] text-white px-12 py-4 rounded-md font-bold hover:bg-[#0055cc] transition-all shadow-xl cursor-pointer"
                      >
                        Parli amb nosaltres
                      </a>
                      <a 
                        href="https://wa.me/34657241010" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-800 text-white border border-white/10 px-12 py-4 rounded-md font-bold hover:bg-slate-700 transition-all shadow-xl cursor-pointer"
                      >
                        Envia un WhatsApp
                      </a>
                    </div>
                  </div>
                  <div className="relative group hidden md:block">
                    <img 
                      src="https://picsum.photos/seed/osona-office/800/800" 
                      alt="Col·laboració professional" 
                      className="rounded-3xl border border-white/10 opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                      referrerPolicy="no-referrer"
                        />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeSection === 'detail' && selectedProperty && (
            <motion.div key="detail" {...fadeInUp} className="pt-32 pb-20 px-6 min-h-screen bg-[#f9f9fb]">
              <div className="max-w-7xl mx-auto">
                <button 
                  onClick={() => setActiveSection('cataleg')}
                  className="flex items-center gap-2 text-[#006aff] font-bold mb-8 hover:underline cursor-pointer group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Tornar al catàleg
                </button>

                <div className="grid lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-8">
                    {/* Carousel */}
                    <div className="relative aspect-[16/9] bg-gray-200 rounded-3xl overflow-hidden group shadow-2xl">
                      <AnimatePresence mode="wait">
                        <motion.img 
                          key={currentImageIndex}
                          src={selectedProperty.images?.[currentImageIndex] || selectedProperty.image} 
                          alt={selectedProperty.title} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </AnimatePresence>
                      
                      {selectedProperty.images && selectedProperty.images.length > 1 && (
                        <>
                          <button 
                            onClick={() => setCurrentImageIndex((prev) => (prev - 1 + selectedProperty.images.length) % selectedProperty.images.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-900" />
                          </button>
                          <button 
                            onClick={() => setCurrentImageIndex((prev) => (prev + 1) % selectedProperty.images.length)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-colors cursor-pointer"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-900" />
                          </button>
                          
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                            {selectedProperty.images.map((_, i) => (
                              <button 
                                key={i}
                                onClick={() => setCurrentImageIndex(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm space-y-8">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="bg-[#006aff]/10 text-[#006aff] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none">
                            {selectedProperty.category}
                          </span>
                          {selectedProperty.tag && (
                            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none">
                              {selectedProperty.tag}
                            </span>
                          )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">{selectedProperty.title}</h1>
                        <p className="flex items-center gap-2 text-gray-500 text-lg">
                          <MapPin className="w-5 h-5 text-[#006aff]" /> {selectedProperty.location}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 py-8 border-y border-gray-50">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preu</p>
                          <p className="text-2xl font-bold text-[#006aff]">{selectedProperty.price.toLocaleString('de-DE')} €</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hab.</p>
                          <p className="text-2xl font-bold">{selectedProperty.bedrooms}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Banys</p>
                          <p className="text-2xl font-bold">{selectedProperty.bathrooms}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sup.</p>
                          <p className="text-2xl font-bold">{selectedProperty.sqm} m²</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cert. Energ.</p>
                          <div className="flex items-center gap-2">
                            <span className={`w-8 h-8 rounded flex items-center justify-center font-bold text-white shadow-sm ${
                              selectedProperty.energyCertificate === 'A' ? 'bg-green-600' :
                              selectedProperty.energyCertificate === 'B' ? 'bg-green-500' :
                              selectedProperty.energyCertificate === 'C' ? 'bg-yellow-500' :
                              selectedProperty.energyCertificate === 'D' ? 'bg-yellow-600' :
                              selectedProperty.energyCertificate === 'E' ? 'bg-orange-500' :
                              selectedProperty.energyCertificate === 'F' ? 'bg-orange-600' :
                              selectedProperty.energyCertificate === 'G' ? 'bg-red-600' : 'bg-gray-400'
                            }`}>
                              {selectedProperty.energyCertificate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold mb-6">Descripció</h3>
                        <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                          {selectedProperty.description}
                        </p>
                      </div>

                      <div className="h-[400px] rounded-2xl overflow-hidden border border-gray-100 z-0 relative">
                        <MapContainer 
                          center={[selectedProperty.lat, selectedProperty.lng]} 
                          zoom={13} 
                          style={{ height: '100%', width: '100%' }}
                          scrollWheelZoom={false}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[selectedProperty.lat, selectedProperty.lng]}>
                            <Popup>{selectedProperty.title}</Popup>
                          </Marker>
                          <RecenterMap center={[selectedProperty.lat, selectedProperty.lng]} />
                        </MapContainer>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl sticky top-32 space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#006aff] rounded-full flex items-center justify-center text-white font-bold text-xl tracking-tighter italic shadow-lg">CTH</div>
                        <div>
                          <p className="font-bold text-lg">CTH Osona</p>
                          <p className="text-sm text-gray-500">Immobiliària de confiança</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Més informació</p>
                        <a 
                          href={`https://wa.me/34657241010?text=Hola,%20m'interessa%20la%20propietat:%20${encodeURIComponent(selectedProperty.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
                        >
                          <Phone className="w-5 h-5 fill-current" /> WhatsApp Directe
                        </a>
                        <a 
                          href={`mailto:cthosona@gmail.com?subject=Interès%20propietat:%20${encodeURIComponent(selectedProperty.title)}`}
                          className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-colors cursor-pointer shadow-lg"
                        >
                          <Mail className="w-5 h-5" /> Enviar email
                        </a>
                      </div>

                      <div className="pt-8 border-t border-gray-50">
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                          <Calendar className="w-4 h-4" /> Disponible immediatament
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <Layers className="w-4 h-4" /> Referència: CTH-{selectedProperty.id.toString().padStart(4, '0')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'cataleg' && (
            <motion.div key="cataleg" {...fadeInUp} className="pt-32 pb-20 px-6 min-h-screen">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                      <button 
                        onClick={() => setActiveSection('compradors')}
                        className="flex items-center gap-2 text-[#006aff] font-bold mb-4 hover:underline cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" /> Tornar a l'inici
                      </button>
                      <h1 className="text-4xl md:text-5xl font-bold mb-2">Catàleg de Propietats</h1>
                      <p className="text-gray-500">Explora les millors oportunitats a Osona</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex flex-wrap gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                        {['Totes', 'Masies', 'Pisos', 'Cases', 'Terrenys'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                              filterCategory === cat 
                                ? 'bg-[#006aff] text-white shadow-md' 
                                : 'text-gray-600 hover:bg-white'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-md transition-all cursor-pointer ${viewMode === 'list' ? 'bg-[#006aff] text-white shadow-md' : 'text-gray-600 hover:bg-white'}`}
                          title="Llista"
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('map')}
                          className={`p-2 rounded-md transition-all cursor-pointer ${viewMode === 'map' ? 'bg-[#006aff] text-white shadow-md' : 'text-gray-600 hover:bg-white'}`}
                          title="Mapa"
                        >
                          <MapIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Catalog Search Bar */}
                  <div className="mb-8" ref={searchRef}>
                    <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-xl flex items-center gap-2 relative">
                      <div className="flex-1 flex items-center px-4 gap-3 relative">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Busca per poble o paraula clau..." 
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          className="w-full py-3 outline-none text-gray-700 placeholder-gray-400 font-medium text-lg"
                        />
                      </div>
                      <button 
                        onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all cursor-pointer border ${
                          isFiltersVisible 
                            ? 'bg-gray-100 border-gray-200 text-gray-900' 
                            : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Filter className={`w-4 h-4 transition-transform ${isFiltersVisible ? 'rotate-180' : ''}`} />
                        {isFiltersVisible ? 'Amagar Filtres' : 'Filtres'}
                      </button>
                      <button 
                        className="bg-[#006aff] text-white px-10 py-3 rounded-lg font-bold hover:bg-[#0055cc] transition-colors cursor-pointer"
                      >
                        Cercar
                      </button>

                      {/* Autocomplete Suggestions in Catalog */}
                      <AnimatePresence>
                        {showSuggestions && locationSuggestions.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 py-2"
                          >
                            {locationSuggestions.map((loc, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setSearchQuery(loc);
                                  setShowSuggestions(false);
                                }}
                                className="w-full px-6 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer"
                              >
                                <MapPin className="w-4 h-4 text-[#006aff]" />
                                <span className="text-gray-700 font-medium">{loc}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Desktop / Advanced Filters */}
                  <AnimatePresence>
                    {isFiltersVisible && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginBottom: 48 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Preu Màxim</label>
                              <div className="relative">
                                <input 
                                  type="number" 
                                  placeholder="Ex: 500000" 
                                  value={maxPrice}
                                  onChange={(e) => setMaxPrice(e.target.value)}
                                  className="w-full bg-gray-50 border border-transparent focus:border-[#006aff] focus:bg-white rounded-lg px-4 py-2.5 outline-none transition-all text-sm font-medium"
                                />
                                <Euro className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Habitacions Mín.</label>
                              <select 
                                value={minBedrooms}
                                onChange={(e) => setMinBedrooms(e.target.value)}
                                className="w-full bg-gray-50 border border-transparent focus:border-[#006aff] focus:bg-white rounded-lg px-4 py-2.5 outline-none transition-all text-sm font-medium"
                              >
                                <option value="">Qualsevol</option>
                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+</option>)}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Banys Mín.</label>
                              <select 
                                value={minBathrooms}
                                onChange={(e) => setMinBathrooms(e.target.value)}
                                className="w-full bg-gray-50 border border-transparent focus:border-[#006aff] focus:bg-white rounded-lg px-4 py-2.5 outline-none transition-all text-sm font-medium"
                              >
                                <option value="">Qualsevol</option>
                                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}+</option>)}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">M² Mínims</label>
                              <input 
                                type="number" 
                                placeholder="Ex: 100" 
                                value={minSqm}
                                onChange={(e) => setMinSqm(e.target.value)}
                                className="w-full bg-gray-50 border border-transparent focus:border-[#006aff] focus:bg-white rounded-lg px-4 py-2.5 outline-none transition-all text-sm font-medium"
                              />
                            </div>

                            <div className="flex items-end">
                              <button 
                                onClick={resetFilters}
                                className="w-full h-[46px] bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                              >
                                Eliminar Filtres
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {filteredProperties.length > 0 ? (
                    viewMode === 'list' ? (
                      <div className="grid md:grid-cols-3 gap-8">
                        {filteredProperties.map((property) => (
                          <motion.div 
                            key={property.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ y: -5 }}
                            onClick={() => handlePropertyClick(property.id)}
                            className="group bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden cursor-pointer flex flex-col"
                          >
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <img 
                                src={property.image} 
                                alt={property.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                              {property.tag && (
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-[#006aff]">
                                  {property.tag}
                                </div>
                              )}
                              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold shadow-sm">
                                <span className={
                                  property.energyCertificate === 'A' ? 'text-green-600' :
                                  property.energyCertificate === 'B' ? 'text-green-500' :
                                  property.energyCertificate === 'C' ? 'text-yellow-500' :
                                  property.energyCertificate === 'D' ? 'text-yellow-600' :
                                  property.energyCertificate === 'E' ? 'text-orange-500' :
                                  property.energyCertificate === 'F' ? 'text-orange-600' :
                                  property.energyCertificate === 'G' ? 'text-red-600' : 'text-gray-400'
                                }>
                                  {property.energyCertificate}
                                </span>
                              </div>
                              <div className="absolute bottom-4 right-4 bg-gray-900/40 backdrop-blur px-2 py-1 rounded text-[8px] text-white font-bold flex items-center gap-1">
                                <MapPin className="w-2 h-2" /> {property.location.split(',')[0]}
                              </div>
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-2xl font-bold">{property.price.toLocaleString('de-DE')} €</h3>
                                <Home className="w-5 h-5 text-gray-300" />
                              </div>
                              <h4 className="font-bold text-gray-800 mb-1 text-sm">{property.title}</h4>
                              <p className="text-gray-500 text-xs font-medium mb-4 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {property.location}
                              </p>
                              <div className="mt-auto flex items-center gap-4 text-[10px] font-bold text-gray-700 border-t border-gray-50 pt-4 uppercase tracking-widest">
                                {property.bedrooms > 0 && <span>{property.bedrooms} Hab.</span>}
                                {property.bathrooms > 0 && (
                                  <>
                                    <span className="text-gray-300">|</span>
                                    <span>{property.bathrooms} Banys</span>
                                  </>
                                )}
                                <span className="text-gray-300">|</span>
                                <span>{property.sqm} m²</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[700px] w-full bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 z-0 relative shadow-2xl">
                        <MapContainer 
                          center={[41.9301, 2.2547]} 
                          zoom={11} 
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          {filteredProperties.map((prop) => (
                            <Marker key={prop.id} position={[prop.lat, prop.lng]}>
                              <Popup className="p-0 overflow-hidden rounded-xl">
                                <div 
                                  className="w-64 cursor-pointer group"
                                  onClick={() => handlePropertyClick(prop.id)}
                                >
                                  <img src={prop.image} alt={prop.title} className="w-full h-32 object-cover" referrerPolicy="no-referrer" />
                                  <div className="p-4">
                                    <p className="font-bold text-[#006aff] text-lg">{prop.price.toLocaleString('de-DE')} €</p>
                                    <p className="font-bold text-sm text-gray-800 line-clamp-1">{prop.title}</p>
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {prop.location}</p>
                                      <span className={`text-[10px] font-bold px-1.5 rounded border ${
                                        prop.energyCertificate === 'A' ? 'text-green-600 border-green-600' :
                                        prop.energyCertificate === 'B' ? 'text-green-500 border-green-500' :
                                        prop.energyCertificate === 'C' ? 'text-yellow-500 border-yellow-500' :
                                        prop.energyCertificate === 'D' ? 'text-yellow-600 border-yellow-600' :
                                        prop.energyCertificate === 'E' ? 'text-orange-500 border-orange-500' :
                                        prop.energyCertificate === 'F' ? 'text-orange-600 border-orange-600' :
                                        prop.energyCertificate === 'G' ? 'text-red-600 border-red-600' : 'text-gray-400 border-gray-400'
                                      }`}>
                                        {prop.energyCertificate}
                                      </span>
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-600 flex gap-2 pt-2 border-t border-gray-100">
                                      <span>{prop.bedrooms}H</span>
                                      <span>{prop.bathrooms}B</span>
                                      <span>{prop.sqm}m²</span>
                                    </div>
                                    <button className="w-full mt-3 bg-gray-900 text-white py-1.5 rounded-md text-xs font-bold hover:bg-black transition-colors">
                                      Veure detalls
                                    </button>
                                  </div>
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                        </MapContainer>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-400">No s'han trobat propietats que coincideixen amb els teus criteris</h3>
                      <button 
                        onClick={resetFilters}
                        className="mt-4 text-[#006aff] font-bold hover:underline cursor-pointer"
                      >
                        Veure totes les propietats
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-16">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Home className="w-8 h-8 text-[#006aff]" />
              <div className="flex flex-col leading-none">
                <span className="font-bold text-xl tracking-tight text-[#006aff]">CTH Osona</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Immobiliària</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Som especialistes en el mercat d'Osona, centrats en el tracte humà, la discreció i l'eficàcia operativa en cada transacció.
            </p>
          </div>
          
          <div className="col-span-1">
            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-xs">Contacte Personalitzat</h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-4 text-gray-600">
                <MapPin className="w-5 h-5 text-[#006aff] shrink-0" />
                <span>Rambla de l'Hospital, 6, 3r 3a, 08500 Vic</span>
              </div>
              <div className="flex items-center gap-4 text-gray-600 group">
                <Mail className="w-5 h-5 text-[#006aff] shrink-0 group-hover:scale-110 transition-transform" />
                <a href="mailto:cthosona@gmail.com" className="hover:text-[#006aff] transition-colors">cthosona@gmail.com</a>
              </div>
              <div className="flex items-center gap-4 text-gray-600 group">
                <Phone className="w-5 h-5 text-[#006aff] shrink-0 group-hover:scale-110 transition-transform" />
                <a href="tel:+34657241010" className="hover:text-[#006aff] transition-colors">+34 657 241 010</a>
              </div>
            </div>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-xs">Informació</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><button onClick={() => { setActiveSection('compradors'); window.scrollTo(0,0); }} className="hover:text-[#006aff] cursor-pointer">Habitatges a Osona</button></li>
              <li><button onClick={() => { setActiveSection('venedors'); window.scrollTo(0,0); }} className="hover:text-[#006aff] cursor-pointer">Vendre la teva casa</button></li>
              <li><button onClick={() => { setActiveSection('advocats'); window.scrollTo(0,0); }} className="hover:text-[#006aff] cursor-pointer">Col·laboració per a Professionals</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-100 mt-16 pt-8 text-center md:text-left">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            © {new Date().getFullYear()} CTH Osona Immobiliària — Vic, Catalunya
          </p>
        </div>
      </footer>
    </div>
  );
}
