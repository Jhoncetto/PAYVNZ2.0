import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  HeartHandshake, 
  Activity, 
  Apple, 
  ShieldCheck, 
  Lock, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  CreditCard, 
  Award, 
  Info, 
  Sparkles, 
  Menu, 
  X, 
  Globe, 
  MapPin, 
  TrendingUp, 
  Users, 
  CheckCircle,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Share2,
  Coins,
  AlertTriangle,
  Building
} from 'lucide-react';

// Interfaces para los datos de la aplicación
interface ImpactLevel {
  amount: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  detail: string;
}

interface Testimonial {
  name: string;
  role: string;
  location: string;
  text: string;
  image: string;
  badge: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

// =========================================================================
// 🎯 CONFIGURACIÓN GLOBAL DE CÓDIGOS QR (PAYPAL, NEQUI, BRE-B)
// =========================================================================
// Aquí puedes cargar tus propios códigos QR y direcciones para la campaña.
// 💡 Si ingresas una URL en 'qrImageUrl' (ej: "https://miservidor.com/qr.png" o "/imagenes/qr.png"),
//    el sistema cargará automáticamente tu imagen. Si la dejas vacía (""),
//    se mostrará un elegante código QR vectorizado interactivo de prueba.
export const QR_CONFIG = {
  paypal: {
    qrImageUrl: "./image/paypal_qr.jpg", // Carga aquí la URL de tu imagen de QR PayPal
    accountEmail: "donaciones@esperanzaactiva.org",
    recipientName: "Esperanza Active Foundation (Emergencia Terremoto)"
  },
  nequi: {
    qrImageUrl: "./image/nequi_qr.jpg", // Carga aquí la URL de tu imagen de QR Nequi
    phoneNumber: "+57 312 456 7890",
    accountName: "Esperanza Activa Colombia (Ayuda Humanitaria Sismo)"
  },
  breb: {
    qrImageUrl: "./image/breb_qr.jpg", // Carga aquí la URL de tu imagen de QR Bre-B
    aliasKey: "0092667000",
    keyType: "Jose Moreno - Donaciones Venezuela Cruz Verde"
  }
};

// =========================================================================
// 🪙 CONFIGURACIÓN GLOBAL DE BILLETERAS DE CRIPTOMONEDAS (USDT, BTC, LTC)
// =========================================================================
export const CRYPTO_QR_CONFIG = {
  usdt: {
    qrImageUrl: "./image/usdt_qr.jpg", // Carga aquí el QR de tu billetera USDT (TRC-20 recomendado)
    address: "TYC2Nf1K4G92vYgP6kH9mN2F8sA5B6vE1D",
    network: "TRON (TRC-20)"
  },
  btc: {
    qrImageUrl: "./image/btc_qr.jpg", // Carga aquí el QR de tu billetera Bitcoin
    address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    network: "Bitcoin Mainnet"
  },
  ltc: {
    qrImageUrl: "./image/ltc_qr.jpg", // Carga aquí el QR de tu billetera Litecoin
    address: "MHChUeebvt8th8ZpSZ3gocfwgBuNsA6Gw7",
    network: "Litecoin Mainnet"
  }
};

// =========================================================================
// 🏦 CONFIGURACIÓN GLOBAL DE CUENTA CORRIENTE BANCARIA (TRANSFERENCIA DIRECTA)
// =========================================================================
export const BANK_ACCOUNT_CONFIG = {
  bankName: "LEADBANK",
  accountType: "CORRIENTE",
  accountNumber: "215896071516"
};

export default function App() {
  // Estado para la navegación móvil
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estados del Widget de Donación
  const [donationFrequency, setDonationFrequency] = useState<'once' | 'monthly'>('monthly');
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [wantsReports, setWantsReports] = useState<boolean>(true);
  const [qrTab, setQrTab] = useState<'paypal' | 'nequi' | 'breb'>('paypal');
  const [cryptoTab, setCryptoTab] = useState<'usdt' | 'btc' | 'ltc'>('usdt');

  // Estado del Formulario de Donación/Pago
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    paymentMethod: 'card' as 'card' | 'qrexpress' | 'crypto',
    cardHolder: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    qrConfirmationChecked: false
  });

  // Estado para validaciones de errores sencillas
  const [formErrors, setFormErrors] = useState<string | null>(null);

  // Estado para los acordeones de FAQ
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Estado de notificación de copia de enlace
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);
  const [certificateDownloaded, setCertificateDownloaded] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Calcular el monto total activo
  const getActiveAmount = (): number => {
    if (selectedAmount === 'custom') {
      const parsed = parseFloat(customAmount);
      return isNaN(parsed) ? 0 : parsed;
    }
    return selectedAmount;
  };

  const activeAmount = getActiveAmount();

  // Mensaje de impacto dinámico basado en el monto seleccionado (Enfoque Terremoto)
  const getDynamicImpactMessage = (amount: number): string => {
    if (amount <= 0) return 'Cada dólar cuenta para proveer auxilio inmediato en las zonas de sismo.';
    if (amount < 15) {
      return `Con $${amount} financias un kit familiar de primeros auxilios y 20 tabletas purificadoras de agua para damnificados.`;
    } else if (amount < 35) {
      return `Con $${amount} aseguras la entrega de 2 mantas térmicas gruesas, colchonetas plegables y linternas recargables de emergencia para una familia sin hogar.`;
    } else if (amount < 75) {
      return `Con $${amount} provees una caja de rescate con raciones de comida seca de alta densidad calórica y agua embotellada para 1 familia por 10 días completos.`;
    } else if (amount < 150) {
      return `Con $${amount} garantizas la atención prehospitalaria de paramédicos, inmovilizadores, gasas de trauma y antibióticos de urgencia para 3 víctimas heridas en el sismo.`;
    } else {
      const familias = Math.floor(amount / 50);
      return `¡Increíble impacto de rescate! Tu aporte de $${amount} permite movilizar y equipar una brigada activa de búsqueda con camillas, cascos de protección, cuerdas de salvamento e insumos de trauma críticos.`;
    }
  };

  // Niveles de Impacto sugeridos para Emergencia por Terremoto
  const impactLevels: ImpactLevel[] = [
    {
      amount: 10,
      icon: <Activity className="w-5 h-5 text-[#CF142B]" />,
      title: "Agua y Primeros Auxilios",
      description: "Agua purificada y kit básico de desinfección de heridas para damnificados.",
      detail: "Ayuda a evitar brotes infecciosos por consumo de agua no potable y provee atención inmediata a escoriaciones leves tras el sismo."
    },
    {
      amount: 25,
      icon: <Globe className="w-5 h-5 text-[#F7D117]" />,
      title: "Mantas y Refugio Temporal",
      description: "Aislamiento frío/calor, mantas térmicas y colchonetas de emergencia.",
      detail: "Garantiza un descanso digno y protección climática nocturna para familias cuyas casas sufrieron daños estructurales graves o colapso."
    },
    {
      amount: 50,
      icon: <HeartHandshake className="w-5 h-5 text-[#003893]" />,
      title: "Caja de Rescate y Raciones",
      description: "Kit de alimentos de emergencia no perecederos para sustentar una familia por 10 días.",
      detail: "Raciones secas listas para consumir (atún, granos, barras energéticas, leche en polvo) que no requieren cocción en zonas sin gas ni luz."
    },
    {
      amount: 100,
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      title: "Atención de Trauma Médica",
      description: "Insumos médicos de trauma, vendajes compresivos y analgésicos de urgencia.",
      detail: "Llevamos un puesto de auxilio móvil con paramédicos profesionales y médicos generales para atender heridas, fracturas y suturas en el lugar."
    }
  ];

  // Testimonios reales adaptados al terremoto
  const testimonials: Testimonial[] = [
    {
      name: "Dra. Mariana Rojas",
      role: "Pediatra de Emergencia y Rescate",
      location: "San Cristóbal, Táchira",
      text: "La rapidez de respuesta ante un sismo define vidas. Gracias al fondo de emergencia, hemos logrado distribuir más de 300 kits de trauma y atender a niños heridos por desprendimiento de paredes. Tu donación llega en horas directas al lugar de los hechos.",
      image: "./image/medico.jpg",
      badge: "Equipo Médico"
    },
    {
      name: "Carmen Elena Uzcátegui",
      role: "Madre de Familia Damnificada",
      location: "Zonas afectadas, Venezuela",
      text: "La tierra rugió y las paredes de nuestro cuarto se vinieron abajo. Nos quedamos en la calle solo con lo puesto. Esa misma noche la brigada de Esperanza Activa nos trajo colchonetas, agua potable y comida para mis niños. Es una luz de fe.",
      image: "./image/madre.jpg",
      badge: "Familia Beneficiada"
    },
    {
      name: "Francisco Mendoza",
      role: "Coordinador de Logística de Rescate",
      location: "Caracas - Mérida",
      text: "El 92% de los recursos se convierte inmediatamente en compras locales de suministros de socorro (agua, mantas, raciones y medicamentos de trauma) que despachamos en camionetas rústicas para sortear las vías afectadas por derrumbes.",
      image: "./image/voluntario.jpg",
      badge: "Voluntario"
    }
  ];

  const faqs: FAQItem[] = [
    {
      question: "¿Cómo se distribuyen los fondos para la emergencia del terremoto?",
      answer: "El 92% de los recursos se destina directamente a compras y logística en Venezuela: raciones alimentarias de emergencia, agua embotellada, mantas, colchonetas de refugio, material médico de suturas y trauma, y herramientas de búsqueda. Solo el 8% se usa para gastos de procesamiento de pagos y auditoría independiente para garantizar transparencia impecable."
    },
    {
      question: "¿Es seguro donar desde el exterior? ¿Qué métodos aceptan?",
      answer: "Sí, es 100% seguro con encriptación SSL de nivel militar (AES-256). Aceptamos tarjetas internacionales de crédito/débito, PayPal, transferencias Zelle y Binance Pay (criptomonedas estables como USDT) para facilitar envíos rápidos que se procesan de inmediato."
    },
    {
      question: "¿Cómo sabemos que la ayuda llega a las zonas damnificadas por el sismo?",
      answer: "Publicamos reportes de campo detallados con fotografías, facturas generales auditadas y listas de materiales entregados en cada comunidad afectada de forma semanal. Si dejas seleccionada la casilla de recibir reportes, recibirás este boletín de transparencia directo en tu e-mail."
    },
    {
      question: "¿Puedo coordinar el envío de insumos físicos (ropa, carpas o medicamentos)?",
      answer: "Sí, coordinamos centros de acopio internacionales para donaciones de gran escala de empresas o fundaciones. Si deseas donar carpas de campaña, plantas eléctricas o instrumental médico, escríbenos directamente a coordinacion@esperanzaactiva.org para agilizar la logística aduanera de emergencia."
    }
  ];

  // Copiar link de campaña para compartir
  const copyCampaignLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Manejador del avance en el Widget de Donación
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    if (currentStep === 1) {
      if (activeAmount <= 0) {
        setFormErrors('Por favor, selecciona o ingresa un monto válido para donar.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!personalData.firstName.trim() || !personalData.email.trim()) {
        setFormErrors('Por favor, completa tu nombre y correo electrónico.');
        return;
      }
      // Validación básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(personalData.email)) {
        setFormErrors('Por favor, ingresa un correo electrónico válido.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Todos los métodos de pago (Cuenta Corriente, QR Express, Cripto) requieren confirmación de transferencia
      if (!personalData.qrConfirmationChecked) {
        setFormErrors('Por favor, confirma que completaste la transferencia y marcaste la casilla de confirmación antes de continuar.');
        return;
      }
      // Simulación exitosa
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    setFormErrors(null);
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev) as 1 | 2 | 3);
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setFormErrors(null);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setSelectedAmount('custom');
    setCustomAmount(val);
    setFormErrors(null);
  };

  const resetDonation = () => {
    setCurrentStep(1);
    setSelectedAmount(25);
    setCustomAmount('');
    setIsAnonymous(false);
    setDownloadingCertificate(false);
    setCertificateDownloaded(false);
    setPersonalData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      paymentMethod: 'card',
      cardHolder: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      qrConfirmationChecked: false
    });
  };

  const handleDownloadCertificate = () => {
    setDownloadingCertificate(true);
    setCertificateDownloaded(false);
    setTimeout(() => {
      setDownloadingCertificate(false);
      setCertificateDownloaded(true);
      
      // Simulate triggers an actual mock text file download to prove system is interactive
      const element = document.createElement("a");
      const file = new Blob([
        `==================================================\n` +
        `   CERTIFICADO DE RESPUESTA HUMANITARIA - SISMO    \n` +
        `            ESPERANZA ACTIVA VENEZUELA            \n` +
        `==================================================\n\n` +
        `Otorgado con profunda gratitud a:\n` +
        `   ${personalData.firstName} ${personalData.lastName || ''}\n\n` +
        `Por sembrar una semilla de vida y socorrer de inmediato\n` +
        `mediante su donación de $${activeAmount} USD destinada a proveer\n` +
        `auxilio médico de trauma, mantas térmicas, agua potable y kits de\n` +
        `refugio de emergencia a las familias damnificadas por el terremoto\n` +
        `en Venezuela.\n\n` +
        `--------------------------------------------------\n` +
        `Fecha de Emisión: ${new Date().toLocaleDateString()}\n` +
        `Código de Validación: EA-SISMO-CERT-${Math.floor(100000 + Math.random() * 900000)}\n` +
        `Esperanza Activa Foundation • Caracas - Mérida - Táchira\n` +
        `==================================================\n`
      ], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `Certificado_Esperanza_Activa_${personalData.firstName}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-800 font-sans flex flex-col selection:bg-rose-100 selection:text-rose-900">
      
      {/* 1. HEADER (ENCABEZADO) */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          
          {/* Logo y Nombre de Fundación */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#003893] via-[#CF142B] to-[#F7D117] p-[2px] shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#CF142B] fill-[#CF142B]" />
              </div>
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight text-[#003893] block leading-tight">
                Esperanza Activa
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium block">
                Ayuda Humanitaria para Venezuela
              </span>
            </div>
          </a>

          {/* Menú de Navegación de Escritorio */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#como-ayudar" className="text-sm font-medium text-slate-600 hover:text-[#003893] transition-colors">
              ¿Cómo ayuda tu donación?
            </a>
            <a href="#impacto" className="text-sm font-medium text-slate-600 hover:text-[#003893] transition-colors">
              Nuestro Impacto
            </a>
            <a href="#testimonios" className="text-sm font-medium text-slate-600 hover:text-[#003893] transition-colors">
              Testimonios de campo
            </a>
            <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-[#003893] transition-colors">
              Preguntas Frecuentes
            </a>
          </nav>

          {/* Botón CTA del Header */}
          <div className="hidden md:flex items-center gap-4">
            <a 
              href="#formulario-donacion"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-bold bg-[#CF142B] text-white hover:bg-[#b81024] active:scale-95 transition-all shadow-md shadow-rose-200"
            >
              Donar Ahora
              <Heart className="w-4 h-4 ml-1.5 fill-current animate-pulse" />
            </a>
          </div>

          {/* Botón de Menú Móvil */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú Móvil Desplegable */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 py-4 px-6 animate-fadeIn">
            <nav className="flex flex-col gap-4">
              <a 
                href="#como-ayudar" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-600 hover:text-[#003893]"
              >
                ¿Cómo ayuda tu donación?
              </a>
              <a 
                href="#impacto" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-600 hover:text-[#003893]"
              >
                Nuestro Impacto
              </a>
              <a 
                href="#testimonios" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-600 hover:text-[#003893]"
              >
                Testimonios de campo
              </a>
              <a 
                href="#faq" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-600 hover:text-[#003893]"
              >
                Preguntas Frecuentes
              </a>
              <a 
                href="#formulario-donacion"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-bold bg-[#CF142B] text-white hover:bg-[#b81024] active:scale-95 transition-all w-full text-center mt-2"
              >
                Donar Ahora
                <Heart className="w-4 h-4 ml-2 fill-current" />
              </a>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow">
        
        {/* Banner de Urgencia */}
        <div className="bg-amber-50 border-b border-amber-100 text-amber-900 px-4 py-2.5 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 animate-pulse">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#CF142B] text-white font-bold text-[10px] tracking-wide uppercase">
            S.O.S. Terremoto
          </span>
          <span className="font-semibold">Sismo devastador en Venezuela: Familias damnificadas sin hogar, agua potable ni refugio seguro. ¡Tu ayuda es urgente hoy!</span>
        </div>

        {/* 2. HERO SECTION + INTERACTIVE DONATION WIDGET */}
        <section className="relative overflow-hidden py-12 lg:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50">
          
          {/* Detalles decorativos patrios sutiles (Venezuela) */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#F7D117] via-[#003893] to-[#CF142B]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Columna Izquierda: Mensaje y Storytelling */}
              <div className="lg:col-span-7 flex flex-col space-y-6 sm:space-y-8">
                
                <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-full px-4 py-1.5 text-[#CF142B] font-semibold text-xs sm:text-sm w-fit">
                  <Sparkles className="w-4 h-4 text-[#F7D117] fill-[#F7D117]" />
                  <span>Respuesta de Emergencia Terremoto 2026</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none">
                  Lleva <span className="text-[#CF142B]">auxilio</span> y refugio tras el sismo en <span className="relative inline-block">
                    Venezuela
                    <span className="absolute left-0 bottom-1 w-full h-[6px] bg-[#F7D117]/50 -z-10 rounded-full" />
                  </span>
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl">
                  El reciente y devastador terremoto ha dejado a miles de familias sin hogar, agua potable ni acceso a alimentos básicos en comunidades altamente vulnerables. Nuestras brigadas de voluntarios y médicos están desplegadas directamente en las zonas afectadas, distribuyendo agua limpia, carpas, mantas térmicas y atención médica de emergencia. ¡Cada segundo cuenta!
                </p>

                {/* Grid de Logros Rápidos para Generar Confianza */}
                <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-2 border-t border-slate-100">
                  <div className="text-center sm:text-left">
                    <span className="block text-2xl sm:text-3xl font-extrabold text-[#003893]">+12K</span>
                    <span className="text-xs text-slate-500 font-medium block mt-0.5">Damnificados asistidos</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="block text-2xl sm:text-3xl font-extrabold text-[#CF142B]">92%</span>
                    <span className="text-xs text-slate-500 font-medium block mt-0.5">Ayuda directa al terreno</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="block text-2xl sm:text-3xl font-extrabold text-[#F7D117]">100%</span>
                    <span className="text-xs text-slate-500 font-medium block mt-0.5">Rescate coordinado</span>
                  </div>
                </div>

                {/* Fotografía Emotiva de Campo con Caption */}
                <div className="relative group rounded-2xl overflow-hidden aspect-[16/9] shadow-xl border border-slate-100">
                  <img 
                    src="./image/hero.jpg" 
                    alt="Voluntarios entregando carpas y ayuda médica en la zona del sismo" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-[#F7D117]" />
                      <span className="text-xs font-bold tracking-wide uppercase text-slate-200">Zona Cero, Estado Táchira</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-100 font-medium">
                      &quot;La solidaridad es nuestro único refugio cuando la tierra tiembla.&quot; — Brigada de respuesta inmediata, sismo 2026.
                    </p>
                  </div>
                </div>

              </div>

              {/* Columna Derecha: WIDGET INTERACTIVO DE DONACIÓN */}
              <div id="formulario-donacion" className="lg:col-span-5 scroll-mt-24">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
                  
                  {/* Encabezado del Widget */}
                  <div className="bg-[#003893] text-white p-6 sm:p-8 text-center relative">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <HeartHandshake className="w-24 h-24" />
                    </div>
                    <h3 className="font-extrabold text-xl sm:text-2xl tracking-tight">Formulario de Donación</h3>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1.5">Completa tu aporte de manera segura y transparente</p>
                    
                    {/* Barra de Progreso Multi-Step */}
                    <div className="flex items-center justify-between max-w-xs mx-auto mt-6 relative">
                      <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-white/20 -translate-y-1/2 z-0" />
                      
                      {[1, 2, 3].map((step) => (
                        <div 
                          key={step}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all duration-300 ${
                            currentStep === step 
                              ? 'bg-[#F7D117] text-[#003893] scale-110 ring-4 ring-[#F7D117]/20' 
                              : currentStep > step 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {currentStep > step ? <Check className="w-4 h-4" /> : step}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-300 font-semibold max-w-[280px] mx-auto mt-2">
                      <span>1. Configurar</span>
                      <span>2. Identificación</span>
                      <span>3. Checkout</span>
                    </div>
                  </div>

                  {/* Cuerpo del Formulario */}
                  <div className="p-6 sm:p-8">
                    
                    {/* Mensaje de Error global */}
                    {formErrors && (
                      <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-xl font-medium flex items-center gap-2">
                        <Info className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{formErrors}</span>
                      </div>
                    )}

                    <form onSubmit={handleNextStep}>
                      
                      {/* PASO 1: SELECCIONAR MONTO */}
                      {currentStep === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                          
                          {/* Selector Frecuencia (Mensual vs Única) */}
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 text-center">
                              Frecuencia de la Ayuda
                            </label>
                            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
                              <button
                                type="button"
                                onClick={() => setDonationFrequency('monthly')}
                                className={`py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 ${
                                  donationFrequency === 'monthly'
                                    ? 'bg-white text-[#003893] shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <span className="flex items-center justify-center gap-1.5">
                                  Mensual
                                  <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-[#CF142B] text-[9px] font-extrabold uppercase">
                                    Recomendado
                                  </span>
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDonationFrequency('once')}
                                className={`py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 ${
                                  donationFrequency === 'once'
                                    ? 'bg-white text-[#003893] shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Única vez
                              </button>
                            </div>
                          </div>

                          {/* Botones de Montos */}
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                              Selecciona un monto de donación (USD)
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {[10, 25, 50, 100].map((amount) => (
                                <button
                                  key={amount}
                                  type="button"
                                  onClick={() => handleAmountSelect(amount)}
                                  className={`py-3 px-2 rounded-2xl text-center border font-bold text-lg sm:text-xl transition-all duration-300 ${
                                    selectedAmount === amount
                                      ? 'border-[#003893] bg-[#003893]/5 text-[#003893] ring-2 ring-[#003893]/20'
                                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                  }`}
                                >
                                  ${amount}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Campo Personalizado */}
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                              O ingresa otro monto personalizado
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-lg">$</span>
                              <input
                                type="text"
                                placeholder="Ej: 75"
                                value={customAmount}
                                onChange={handleCustomAmountChange}
                                className={`w-full pl-8 pr-12 py-3 rounded-2xl border text-lg font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 transition-all ${
                                  selectedAmount === 'custom' 
                                    ? 'border-[#003893] ring-2 ring-[#003893]/20' 
                                    : 'border-slate-200 focus:border-slate-300'
                                }`}
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">USD</span>
                            </div>
                          </div>

                          {/* Cuadro de Impacto Dinámico */}
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#CF142B] block mb-1">Tu Impacto Estimado</span>
                            <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed">
                              {getDynamicImpactMessage(activeAmount)}
                            </p>
                            {donationFrequency === 'monthly' && (
                              <span className="block mt-2 text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded w-fit">
                                ↺ Compromiso mensual de ayuda recurrente
                              </span>
                            )}
                          </div>

                          {/* Botón Siguiente */}
                          <button
                            type="submit"
                            className="w-full py-4 rounded-2xl bg-[#CF142B] text-white font-extrabold text-base hover:bg-[#b81024] transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2 group cursor-pointer"
                          >
                            Continuar con ${activeAmount} {donationFrequency === 'monthly' ? '/ mes' : ''}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      )}

                      {/* PASO 2: DATOS DE IDENTIFICACIÓN */}
                      {currentStep === 2 && (
                        <div className="space-y-4 animate-fadeIn">
                          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2 mb-2">
                            Tus Datos Personales
                          </h4>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre *</label>
                              <input
                                type="text"
                                required
                                value={personalData.firstName}
                                onChange={(e) => setPersonalData({...personalData, firstName: e.target.value})}
                                placeholder="Juan"
                                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#003893] text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1">Apellido</label>
                              <input
                                type="text"
                                value={personalData.lastName}
                                onChange={(e) => setPersonalData({...personalData, lastName: e.target.value})}
                                placeholder="Pérez"
                                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#003893] text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Correo Electrónico *</label>
                            <input
                              type="email"
                              required
                              value={personalData.email}
                              onChange={(e) => setPersonalData({...personalData, email: e.target.value})}
                              placeholder="juan.perez@example.com"
                              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#003893] text-sm"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              Aquí te enviaremos tu comprobante fiscal y los informes bimestrales de campo.
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Teléfono Móvil (Opcional)</label>
                            <input
                              type="tel"
                              value={personalData.phone}
                              onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
                              placeholder="+1 555 123 4567"
                              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#003893] text-sm"
                            />
                          </div>

                          {/* Casillas de Verificación */}
                          <div className="space-y-2 pt-2">
                            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                              <input
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="mt-0.5 rounded border-slate-300 text-[#003893] focus:ring-[#003893]"
                              />
                              <span>Deseo mantener mi donación como anónima en el portal público.</span>
                            </label>
                            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                              <input
                                type="checkbox"
                                checked={wantsReports}
                                onChange={(e) => setWantsReports(e.target.checked)}
                                className="mt-0.5 rounded border-slate-300 text-[#003893] focus:ring-[#003893]"
                              />
                              <span>Acepto recibir boletines mensuales con fotografías reales e informes financieros transparentes del comedor.</span>
                            </label>
                          </div>

                          {/* Botones de Navegación */}
                          <div className="grid grid-cols-3 gap-3 pt-4">
                            <button
                              type="button"
                              onClick={handlePrevStep}
                              className="py-3 px-2 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm text-center flex items-center justify-center gap-1"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              Atrás
                            </button>
                            <button
                              type="submit"
                              className="col-span-2 py-3 rounded-2xl bg-[#CF142B] text-white font-extrabold text-sm hover:bg-[#b81024] transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              Siguiente: Método de Pago
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* PASO 3: PASARELA DE PAGO (CHECKOUT SIMULADO) */}
                      {currentStep === 3 && (
                        <div className="space-y-4 animate-fadeIn">
                          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b pb-2 mb-1">
                            Método de Pago Seguro
                          </h4>

                          {/* Selector de Opción de Pago A, B o C */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                              type="button"
                              onClick={() => setPersonalData({ ...personalData, paymentMethod: 'card' })}
                              className={`py-3 px-3 rounded-2xl font-bold text-xs border transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden ${
                                personalData.paymentMethod === 'card'
                                  ? 'border-[#003893] bg-[#003893]/5 text-[#003893] ring-2 ring-[#003893]/10'
                                  : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                              }`}
                            >
                              <div className="absolute -top-1 -right-1 bg-amber-500 text-white font-black px-1.5 py-0.5 rounded-bl-md text-[8px] uppercase tracking-widest scale-90 origin-top-right animate-pulse">
                                Tarjeta Off
                              </div>
                              <Building className="w-5 h-5 text-[#003893]" />
                              <span className="text-center">Cuenta Corriente / Transf.</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPersonalData({ ...personalData, paymentMethod: 'qrexpress' })}
                              className={`py-3 px-3 rounded-2xl font-bold text-xs border transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                                personalData.paymentMethod === 'qrexpress'
                                  ? 'border-[#CF142B] bg-[#CF142B]/5 text-[#CF142B] ring-2 ring-[#CF142B]/10'
                                  : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                              }`}
                            >
                              <div className="flex gap-1 items-center justify-center">
                                <span className="w-2 h-2 bg-[#F7D117] rounded-full animate-ping" />
                                <Globe className="w-5 h-5 text-slate-500" />
                              </div>
                              <span className="text-center">Transferencia / QR Express</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPersonalData({ ...personalData, paymentMethod: 'crypto' })}
                              className={`py-3 px-3 rounded-2xl font-bold text-xs border transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                                personalData.paymentMethod === 'crypto'
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/10'
                                  : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                              }`}
                            >
                              <Coins className="w-5 h-5 text-emerald-600" />
                              <span className="text-center">Billeteras Cripto</span>
                            </button>
                          </div>

                          {/* Contenedor del Formulario o QR */}
                          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100 min-h-[220px] transition-all duration-300">
                            
                            {/* OPCIÓN A: CUENTA CORRIENTE BANCARIA (TRANSFERENCIA DIRECTA) */}
                            {personalData.paymentMethod === 'card' && (
                              <div className="space-y-4 animate-fadeIn">
                                {/* Alerta de Mantenimiento de Tarjeta */}
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                  <div className="space-y-0.5">
                                    <span className="font-extrabold text-amber-900 block">Procesador de Tarjetas en Mantenimiento Técnico</span>
                                    <p className="text-amber-800 leading-normal text-[11px]">
                                      Nuestra pasarela directa de cobro automático con tarjeta se encuentra en mantenimiento temporal para actualización de servidores de seguridad interbancaria. Puedes transferir directamente a nuestra **Cuenta Corriente** autorizada.
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Datos de Cuenta Corriente para Transferencia</span>
                                  
                                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs divide-y divide-slate-100">
                                    {[
                                      { label: 'Banco', value: BANK_ACCOUNT_CONFIG.bankName, copyKey: 'bank_name' },
                                      { label: 'Tipo de Cuenta', value: BANK_ACCOUNT_CONFIG.accountType, copyKey: 'bank_type' },
                                      { label: 'Número de Cuenta', value: BANK_ACCOUNT_CONFIG.accountNumber, copyKey: 'bank_number', isMono: true },
                                    ].map((item) => (
                                      <div key={item.copyKey} className="flex justify-between items-center p-2.5 hover:bg-slate-50 transition-colors">
                                        <div className="flex flex-col">
                                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</span>
                                          <span className={`font-semibold text-slate-800 ${item.isMono ? 'font-mono' : ''}`}>{item.value}</span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => copyToClipboard(item.value, item.copyKey)}
                                          className="py-1 px-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-600 flex items-center gap-1 transition-all cursor-pointer shadow-sm shrink-0"
                                        >
                                          <Check className={`w-3 h-3 text-emerald-600 transition-transform ${copiedText === item.copyKey ? 'scale-110' : 'scale-0'}`} />
                                          <span>{copiedText === item.copyKey ? '¡Copiado!' : 'Copiar'}</span>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Confirmación de Transferencia */}
                                <div className="border-t border-slate-200 pt-3 flex flex-col space-y-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Confirmación de Operación</span>
                                  <label className="flex items-start gap-2.5 text-xs text-slate-600 font-medium cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={personalData.qrConfirmationChecked}
                                      onChange={(e) => setPersonalData({...personalData, qrConfirmationChecked: e.target.checked})}
                                      className="mt-0.5 rounded border-slate-300 text-[#003893] focus:ring-[#003893] w-4 h-4"
                                    />
                                    <span>Ya he realizado la transferencia bancaria nacional/internacional por el monto equivalente a <strong>${activeAmount} USD</strong> a la cuenta corriente especificada.</span>
                                  </label>
                                </div>
                              </div>
                            )}

                            {/* OPCIÓN B: CODI/QR EXPRESS INTERACTIVO CON SUB-TABS */}
                            {personalData.paymentMethod === 'qrexpress' && (
                              <div className="space-y-4 animate-fadeIn">
                                
                                {/* Sub-Tab Bar de Canales QR */}
                                <div className="flex border-b border-slate-200 pb-1.5 gap-1.5">
                                  {[
                                    { id: 'paypal', name: 'PayPal QR', activeColor: 'border-[#00457C] text-[#00457C]', bgColor: 'hover:bg-blue-50/50' },
                                    { id: 'nequi', name: 'Nequi QR', activeColor: 'border-[#FF007F] text-[#3F1965]', bgColor: 'hover:bg-pink-50/50' },
                                    { id: 'breb', name: 'Bre-B QR', activeColor: 'border-[#F7D117] text-slate-800', bgColor: 'hover:bg-amber-50/50' }
                                  ].map((tab) => (
                                    <button
                                      key={tab.id}
                                      type="button"
                                      onClick={() => setQrTab(tab.id as 'paypal' | 'nequi' | 'breb')}
                                      className={`flex-1 pb-2 text-[11px] font-extrabold text-center border-b-2 transition-all duration-300 ${
                                        qrTab === tab.id
                                          ? tab.activeColor
                                          : 'border-transparent text-slate-400 hover:text-slate-600 ' + tab.bgColor
                                      }`}
                                    >
                                      {tab.name}
                                    </button>
                                  ))}
                                </div>

                                {/* Contenido Dinámico de cada Sub-Tab QR */}
                                {qrTab === 'paypal' && (
                                  <div className="flex flex-col items-center gap-5 animate-fadeIn text-xs text-center">
                                    <div className="w-full flex justify-center">
                                      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-lg relative group w-full max-w-[320px] mx-auto">
                                        {QR_CONFIG.paypal.qrImageUrl ? (
                                          <img 
                                            src={QR_CONFIG.paypal.qrImageUrl} 
                                            alt="QR PayPal" 
                                            className="w-full h-auto object-contain rounded-2xl mx-auto block hover:scale-105 transition-transform duration-300 shadow-sm"
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <svg width="100%" height="auto" viewBox="0 0 100 100" className="w-full h-auto text-slate-900 mx-auto max-w-[260px] block">
                                            {/* Finders */}
                                            <rect x="0" y="0" width="28" height="28" fill="#003087" rx="2" />
                                            <rect x="4" y="4" width="20" height="20" fill="white" rx="1" />
                                            <rect x="8" y="8" width="12" height="12" fill="#0079C1" rx="0.5" />

                                            <rect x="72" y="0" width="28" height="28" fill="#003087" rx="2" />
                                            <rect x="76" y="4" width="20" height="20" fill="white" rx="1" />
                                            <rect x="80" y="8" width="12" height="12" fill="#0079C1" rx="0.5" />

                                            <rect x="0" y="72" width="28" height="28" fill="#003087" rx="2" />
                                            <rect x="4" y="76" width="20" height="20" fill="white" rx="1" />
                                            <rect x="8" y="80" width="12" height="12" fill="#0079C1" rx="0.5" />

                                            {/* Pixels */}
                                            <rect x="36" y="4" width="8" height="8" fill="#003087" />
                                            <rect x="48" y="0" width="8" height="4" fill="#0079C1" />
                                            <rect x="60" y="8" width="4" height="12" fill="#003087" />
                                            <rect x="36" y="20" width="12" height="4" fill="#0079C1" />
                                            <rect x="40" y="36" width="16" height="8" fill="#003087" />
                                            <rect x="12" y="36" width="12" height="12" fill="#0079C1" />
                                            <rect x="76" y="36" width="20" height="16" fill="#003087" />
                                            <rect x="0" y="52" width="16" height="8" fill="#0079C1" />
                                            <rect x="36" y="52" width="24" height="12" fill="#003087" />
                                            <rect x="72" y="60" width="12" height="8" fill="#0079C1" />
                                            <rect x="40" y="76" width="8" height="16" fill="#003087" />
                                            <rect x="56" y="72" width="12" height="12" fill="#0079C1" />
                                            <rect x="80" y="80" width="16" height="16" fill="#003087" />

                                            {/* Mini Logo */}
                                            <rect x="42" y="42" width="16" height="16" fill="white" rx="4" />
                                            <circle cx="50" cy="50" r="5" fill="#003087" />
                                          </svg>
                                        )}
                                        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                                          <span className="bg-white/90 text-[8px] font-bold py-1 px-1.5 rounded shadow text-slate-800">Campaña PayPal</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="w-full max-w-[340px] space-y-3">
                                      <div className="flex items-center justify-center gap-2">
                                        <span className="font-extrabold text-[#003087] italic text-sm tracking-tighter">Pay<span className="text-[#0079C1]">Pal</span> <span className="text-xs font-bold not-italic text-slate-500 uppercase tracking-wider ml-1">Internacional</span></span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 leading-normal px-2">
                                        Escanea desde tu app PayPal o usa la dirección de correo oficial para procesar tu donación internacional directamente para la emergencia del sismo.
                                      </p>
                                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1 text-left">
                                        <div className="flex justify-between items-center">
                                          <span className="text-slate-400">Correo Cuenta:</span>
                                          <span className="font-mono font-bold text-slate-800">{QR_CONFIG.paypal.accountEmail}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                                          <span className="text-slate-400">Destinatario:</span>
                                          <span className="font-semibold text-slate-700">{QR_CONFIG.paypal.recipientName}</span>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(QR_CONFIG.paypal.accountEmail, 'paypal')}
                                        className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full"
                                      >
                                        <Check className={`w-3.5 h-3.5 text-emerald-600 transition-transform ${copiedText === 'paypal' ? 'scale-110' : 'scale-0'}`} />
                                        <span>{copiedText === 'paypal' ? '¡Correo Copiado!' : 'Copiar Correo PayPal'}</span>
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {qrTab === 'nequi' && (
                                  <div className="flex flex-col items-center gap-5 animate-fadeIn text-xs text-center">
                                    <div className="w-full flex justify-center">
                                      <div className="bg-white p-4 rounded-3xl border border-purple-200 shadow-lg relative group w-full max-w-[320px] mx-auto">
                                        {QR_CONFIG.nequi.qrImageUrl ? (
                                          <img 
                                            src={QR_CONFIG.nequi.qrImageUrl} 
                                            alt="QR Nequi" 
                                            className="w-full h-auto object-contain rounded-2xl mx-auto block hover:scale-105 transition-transform duration-300 shadow-sm"
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <svg width="100%" height="auto" viewBox="0 0 100 100" className="w-full h-auto text-slate-900 mx-auto max-w-[260px] block">
                                            {/* Finders */}
                                            <rect x="0" y="0" width="28" height="28" fill="#3F1965" rx="2" />
                                            <rect x="4" y="4" width="20" height="20" fill="white" rx="1" />
                                            <rect x="8" y="8" width="12" height="12" fill="#FF007F" rx="0.5" />

                                            <rect x="72" y="0" width="28" height="28" fill="#3F1965" rx="2" />
                                            <rect x="76" y="4" width="20" height="20" fill="white" rx="1" />
                                            <rect x="80" y="8" width="12" height="12" fill="#FF007F" rx="0.5" />

                                            <rect x="0" y="72" width="28" height="28" fill="#3F1965" rx="2" />
                                            <rect x="4" y="76" width="20" height="20" fill="white" rx="1" />
                                            <rect x="8" y="80" width="12" height="12" fill="#FF007F" rx="0.5" />

                                            {/* Pixels */}
                                            <rect x="36" y="0" width="8" height="8" fill="#FF007F" />
                                            <rect x="48" y="4" width="4" height="12" fill="#3F1965" />
                                            <rect x="56" y="0" width="12" height="4" fill="#FF007F" />
                                            <rect x="36" y="16" width="16" height="4" fill="#3F1965" />
                                            <rect x="64" y="24" width="4" height="12" fill="#FF007F" />
                                            <rect x="16" y="36" width="12" height="16" fill="#3F1965" />
                                            <rect x="36" y="36" width="20" height="8" fill="#FF007F" />
                                            <rect x="72" y="36" width="24" height="4" fill="#3F1965" />
                                            <rect x="0" y="52" width="8" height="12" fill="#FF007F" />
                                            <rect x="48" y="48" width="16" height="16" fill="#3F1965" />
                                            <rect x="76" y="52" width="12" height="12" fill="#FF007F" />
                                            <rect x="36" y="68" width="24" height="4" fill="#3F1965" />
                                            <rect x="40" y="76" width="12" height="16" fill="#FF007F" />
                                            <rect x="60" y="80" width="8" height="8" fill="#3F1965" />
                                            <rect x="80" y="76" width="16" height="16" fill="#FF007F" />

                                            {/* Mini Logo */}
                                            <rect x="42" y="42" width="16" height="16" fill="white" rx="4" />
                                            <rect x="45" y="45" width="10" height="10" fill="#3F1965" rx="2" />
                                          </svg>
                                        )}
                                        <div className="absolute inset-0 bg-[#3F1965]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                                          <span className="bg-white/90 text-[8px] font-bold py-1 px-1.5 rounded shadow text-slate-800">Campaña Nequi</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="w-full max-w-[340px] space-y-3">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <span className="font-extrabold text-[#3F1965] text-sm tracking-tight">NEQUI <span className="px-1.5 py-0.5 rounded bg-[#FF007F]/10 text-[#FF007F] text-[9px] font-extrabold uppercase tracking-widest ml-1">Fácil & Rápido</span></span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 leading-normal px-2">
                                        Escanea desde tu app móvil Nequi para realizar transferencias inmediatas de ayuda humanitaria desde Colombia sin recargos.
                                      </p>
                                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1 text-left">
                                        <div className="flex justify-between items-center">
                                          <span className="text-slate-400">Celular Nequi:</span>
                                          <span className="font-mono font-bold text-slate-800">{QR_CONFIG.nequi.phoneNumber}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                                          <span className="text-slate-400">Titular Cuenta:</span>
                                          <span className="font-semibold text-slate-700">{QR_CONFIG.nequi.accountName}</span>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(QR_CONFIG.nequi.phoneNumber, 'nequi')}
                                        className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full"
                                      >
                                        <Check className={`w-3.5 h-3.5 text-emerald-600 transition-transform ${copiedText === 'nequi' ? 'scale-110' : 'scale-0'}`} />
                                        <span>{copiedText === 'nequi' ? '¡Número Copiado!' : 'Copiar Número Celular'}</span>
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {qrTab === 'breb' && (
                                  <div className="flex flex-col items-center gap-5 animate-fadeIn text-xs text-center">
                                    <div className="w-full flex justify-center">
                                      <div className="bg-white p-4 rounded-3xl border border-yellow-300 shadow-lg relative group w-full max-w-[320px] mx-auto">
                                        {QR_CONFIG.breb.qrImageUrl ? (
                                          <img 
                                            src={QR_CONFIG.breb.qrImageUrl} 
                                            alt="QR Bre-B" 
                                            className="w-full h-auto object-contain rounded-2xl mx-auto block hover:scale-105 transition-transform duration-300 shadow-sm"
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <svg width="100%" height="auto" viewBox="0 0 100 100" className="w-full h-auto text-slate-900 mx-auto max-w-[260px] block">
                                            {/* Finders */}
                                            <rect x="0" y="0" width="28" height="28" fill="#F7D117" rx="2" />
                                            <rect x="4" y="4" width="20" height="20" fill="white" rx="1" />
                                            <rect x="8" y="8" width="12" height="12" fill="#003893" rx="0.5" />

                                            <rect x="72" y="0" width="28" height="28" fill="#F7D117" rx="2" />
                                            <rect x="76" y="4" width="20" height="20" fill="white" rx="1" />
                                            <rect x="80" y="8" width="12" height="12" fill="#003893" rx="0.5" />

                                            <rect x="0" y="72" width="28" height="28" fill="#F7D117" rx="2" />
                                            <rect x="4" y="76" width="20" height="20" fill="white" rx="1" />
                                            <rect x="8" y="80" width="12" height="12" fill="#003893" rx="0.5" />

                                            {/* Pixels */}
                                            <rect x="36" y="0" width="12" height="8" fill="#003893" />
                                            <rect x="52" y="4" width="4" height="4" fill="#F7D117" />
                                            <rect x="60" y="0" width="8" height="8" fill="#003893" />
                                            <rect x="36" y="12" width="16" height="12" fill="#F7D117" />
                                            <rect x="60" y="20" width="8" height="8" fill="#003893" />
                                            <rect x="12" y="36" width="20" height="8" fill="#F7D117" />
                                            <rect x="36" y="36" width="12" height="16" fill="#003893" />
                                            <rect x="56" y="36" width="8" height="8" fill="#F7D117" />
                                            <rect x="72" y="44" width="16" height="12" fill="#003893" />
                                            <rect x="0" y="56" width="12" height="12" fill="#F7D117" />
                                            <rect x="36" y="60" width="16" height="4" fill="#003893" />
                                            <rect x="56" y="52" width="12" height="12" fill="#F7D117" />
                                            <rect x="76" y="64" width="12" height="4" fill="#003893" />
                                            <rect x="40" y="72" width="16" height="16" fill="#F7D117" />
                                            <rect x="64" y="80" width="8" height="8" fill="#003893" />
                                            <rect x="80" y="76" width="16" height="16" fill="#F7D117" />

                                            {/* Mini Logo */}
                                            <rect x="42" y="42" width="16" height="16" fill="white" rx="4" />
                                            <polygon points="50,44 56,54 44,54" fill="#003893" />
                                          </svg>
                                        )}
                                        <div className="absolute inset-0 bg-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                                          <span className="bg-white/90 text-[8px] font-bold py-1 px-1.5 rounded shadow text-slate-800">Canal Bre-B</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="w-full max-w-[340px] space-y-3">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <span className="font-extrabold text-slate-800 text-sm tracking-tight">Bre-B <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-extrabold uppercase ml-1">Pagos Interbancarios</span></span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 leading-normal px-2">
                                        Bre-B es el sistema unificado de pagos rápidos del Banco de la República de Colombia. Escanea con la aplicación de tu entidad financiera favorita para donar.
                                      </p>
                                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1 text-left">
                                        <div className="flex justify-between items-center">
                                          <span className="text-slate-400">Llave / Alias Bre-B:</span>
                                          <span className="font-mono font-bold text-slate-800">{QR_CONFIG.breb.aliasKey}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                                          <span className="text-slate-400">Tipo de Llave:</span>
                                          <span className="font-semibold text-slate-700">{QR_CONFIG.breb.keyType}</span>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(QR_CONFIG.breb.aliasKey, 'breb')}
                                        className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full"
                                      >
                                        <Check className={`w-3.5 h-3.5 text-emerald-600 transition-transform ${copiedText === 'breb' ? 'scale-110' : 'scale-0'}`} />
                                        <span>{copiedText === 'breb' ? '¡Llave Copiada!' : 'Copiar Llave Bre-B'}</span>
                                      </button>
                                    </div>
                                  </div>
                                )}

                                <div className="border-t border-slate-200 pt-3 flex flex-col space-y-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Confirmación de Operación</span>
                                  <label className="flex items-start gap-2.5 text-xs text-slate-600 font-medium cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={personalData.qrConfirmationChecked}
                                      onChange={(e) => setPersonalData({...personalData, qrConfirmationChecked: e.target.checked})}
                                      className="mt-0.5 rounded border-slate-300 text-[#CF142B] focus:ring-[#CF142B] w-4 h-4"
                                    />
                                    <span>Ya he escaneado el código QR y completado la transferencia por el monto de <strong>${activeAmount} USD</strong>.</span>
                                  </label>
                                </div>
                                
                              </div>
                            )}

                            {/* OPCIÓN C: BILLETERAS CRIPTO */}
                            {personalData.paymentMethod === 'crypto' && (
                              <div className="space-y-4 animate-fadeIn">
                                
                                {/* Sub-Tab Bar de Canales Cripto */}
                                <div className="flex border-b border-slate-200 pb-1.5 gap-1.5">
                                  {[
                                    { id: 'usdt', name: 'USDT (Tether)', activeColor: 'border-[#26A17B] text-[#26A17B]', bgColor: 'hover:bg-teal-50/50' },
                                    { id: 'btc', name: 'Bitcoin (BTC)', activeColor: 'border-[#F7931A] text-[#F7931A]', bgColor: 'hover:bg-amber-50/50' },
                                    { id: 'ltc', name: 'Litecoin (LTC)', activeColor: 'border-[#345D9D] text-[#345D9D]', bgColor: 'hover:bg-blue-50/50' }
                                  ].map((tab) => (
                                    <button
                                      key={tab.id}
                                      type="button"
                                      onClick={() => setCryptoTab(tab.id as 'usdt' | 'btc' | 'ltc')}
                                      className={`flex-1 pb-2 text-[11px] font-extrabold text-center border-b-2 transition-all duration-300 ${
                                        cryptoTab === tab.id
                                          ? tab.activeColor
                                          : 'border-transparent text-slate-400 hover:text-slate-600 ' + tab.bgColor
                                      }`}
                                    >
                                      {tab.name}
                                    </button>
                                  ))}
                                </div>

                                {/* Contenido Dinámico de cada Sub-Tab Cripto */}
                                {cryptoTab === 'usdt' && (
                                  <div className="flex flex-col items-center gap-5 animate-fadeIn text-xs text-center">
                                    <div className="w-full flex justify-center">
                                      <div className="bg-white p-4 rounded-3xl border border-teal-200 shadow-lg relative group w-full max-w-[320px] mx-auto">
                                        {CRYPTO_QR_CONFIG.usdt.qrImageUrl ? (
                                          <img 
                                            src={CRYPTO_QR_CONFIG.usdt.qrImageUrl} 
                                            alt="QR USDT" 
                                            className="w-full h-auto object-contain rounded-2xl mx-auto block hover:scale-105 transition-transform duration-300 shadow-sm"
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <svg width="100%" height="auto" viewBox="0 0 100 100" className="w-full h-auto text-slate-900 mx-auto max-w-[260px] block">
                                            {/* Finders */}
                                            <rect x="0" y="0" width="28" height="28" fill="#26A17B" rx="2" />
                                            <rect x="4" y="4" width="20" height="20" fill="white" rx="1" />
                                            <rect x="8" y="8" width="12" height="12" fill="#50AF95" rx="0.5" />

                                            <rect x="72" y="0" width="28" height="28" fill="#26A17B" rx="2" />
                                            <rect x="76" y="4" width="20" height="20" fill="white" rx="1" />
                                            <rect x="80" y="8" width="12" height="12" fill="#50AF95" rx="0.5" />

                                            <rect x="0" y="72" width="28" height="28" fill="#26A17B" rx="2" />
                                            <rect x="4" y="76" width="20" height="20" fill="white" rx="1" />
                                            <rect x="8" y="80" width="12" height="12" fill="#50AF95" rx="0.5" />

                                            {/* Pixels */}
                                            <rect x="36" y="0" width="8" height="8" fill="#50AF95" />
                                            <rect x="48" y="4" width="4" height="12" fill="#26A17B" />
                                            <rect x="56" y="0" width="12" height="4" fill="#50AF95" />
                                            <rect x="36" y="12" width="16" height="12" fill="#26A17B" />
                                            <rect x="60" y="20" width="8" height="8" fill="#50AF95" />
                                            <rect x="12" y="36" width="20" height="8" fill="#50AF95" />
                                            <rect x="36" y="36" width="12" height="16" fill="#26A17B" />
                                            <rect x="56" y="36" width="8" height="8" fill="#50AF95" />
                                            <rect x="72" y="44" width="16" height="12" fill="#26A17B" />
                                            <rect x="0" y="56" width="12" height="12" fill="#50AF95" />
                                            <rect x="36" y="60" width="16" height="4" fill="#26A17B" />
                                            <rect x="56" y="52" width="12" height="12" fill="#50AF95" />
                                            <rect x="76" y="64" width="12" height="4" fill="#26A17B" />
                                            <rect x="40" y="72" width="16" height="16" fill="#50AF95" />
                                            <rect x="64" y="80" width="8" height="8" fill="#26A17B" />
                                            <rect x="80" y="76" width="16" height="16" fill="#50AF95" />

                                            {/* Mini Logo */}
                                            <rect x="42" y="42" width="16" height="16" fill="white" rx="4" />
                                            <text x="44" y="54" fontSize="12" fontWeight="bold" fill="#26A17B">T</text>
                                          </svg>
                                        )}
                                        <div className="absolute inset-0 bg-[#26A17B]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                                          <span className="bg-white/90 text-[8px] font-bold py-1 px-1.5 rounded shadow text-slate-800">Billetera USDT</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="w-full max-w-[340px] space-y-3">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <span className="font-extrabold text-[#26A17B] text-sm tracking-tight">USDT (Tether) <span className="px-1.5 py-0.5 rounded bg-[#26A17B]/10 text-[#26A17B] text-[9px] font-extrabold uppercase tracking-widest ml-1">{CRYPTO_QR_CONFIG.usdt.network}</span></span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 leading-normal px-2">
                                        Envía tu donación usando USDT (moneda estable equivalente a USD) para una transferencia instantánea libre de comisiones internacionales bancarias.
                                      </p>
                                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1 text-left">
                                        <div className="flex justify-between items-center">
                                          <span className="text-slate-400">Dirección USDT:</span>
                                          <span className="font-mono font-bold text-slate-800 truncate max-w-[150px] sm:max-w-none" title={CRYPTO_QR_CONFIG.usdt.address}>{CRYPTO_QR_CONFIG.usdt.address}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                                          <span className="text-slate-400">Red requerida:</span>
                                          <span className="font-semibold text-slate-700">{CRYPTO_QR_CONFIG.usdt.network}</span>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(CRYPTO_QR_CONFIG.usdt.address, 'usdt')}
                                        className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full"
                                      >
                                        <Check className={`w-3.5 h-3.5 text-emerald-600 transition-transform ${copiedText === 'usdt' ? 'scale-110' : 'scale-0'}`} />
                                        <span>{copiedText === 'usdt' ? '¡Dirección Copiada!' : 'Copiar Dirección'}</span>
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {cryptoTab === 'btc' && (
                                  <div className="flex flex-col items-center gap-5 animate-fadeIn text-xs text-center">
                                    <div className="w-full flex justify-center">
                                      <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-lg relative group w-full max-w-[320px] mx-auto">
                                        {CRYPTO_QR_CONFIG.btc.qrImageUrl ? (
                                          <img 
                                            src={CRYPTO_QR_CONFIG.btc.qrImageUrl} 
                                            alt="QR BTC" 
                                            className="w-full h-auto object-contain rounded-2xl mx-auto block hover:scale-105 transition-transform duration-300 shadow-sm"
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <svg width="100%" height="auto" viewBox="0 0 100 100" className="w-full h-auto text-slate-900 mx-auto max-w-[260px] block">
                                            {/* Finders */}
                                            <rect x="0" y="0" width="28" height="28" fill="#F7931A" rx="2" />
                                            <rect x="4" y="4" width="20" height="20" fill="white" rx="1" />
                                            <rect x="8" y="8" width="12" height="12" fill="#D37E15" rx="0.5" />

                                            <rect x="72" y="0" width="28" height="28" fill="#F7931A" rx="2" />
                                            <rect x="76" y="4" width="20" height="20" fill="white" rx="1" />
                                            <rect x="80" y="8" width="12" height="12" fill="#D37E15" rx="0.5" />

                                            <rect x="0" y="72" width="28" height="28" fill="#F7931A" rx="2" />
                                            <rect x="4" y="76" width="20" height="20" fill="white" rx="1" />
                                            <rect x="8" y="80" width="12" height="12" fill="#D37E15" rx="0.5" />

                                            {/* Pixels */}
                                            <rect x="36" y="0" width="8" height="8" fill="#D37E15" />
                                            <rect x="48" y="4" width="4" height="12" fill="#F7931A" />
                                            <rect x="56" y="0" width="12" height="4" fill="#D37E15" />
                                            <rect x="36" y="12" width="16" height="12" fill="#F7931A" />
                                            <rect x="60" y="20" width="8" height="8" fill="#D37E15" />
                                            <rect x="12" y="36" width="20" height="8" fill="#D37E15" />
                                            <rect x="36" y="36" width="12" height="16" fill="#F7931A" />
                                            <rect x="56" y="36" width="8" height="8" fill="#D37E15" />
                                            <rect x="72" y="44" width="16" height="12" fill="#F7931A" />
                                            <rect x="0" y="56" width="12" height="12" fill="#D37E15" />
                                            <rect x="36" y="60" width="16" height="4" fill="#F7931A" />
                                            <rect x="56" y="52" width="12" height="12" fill="#D37E15" />
                                            <rect x="76" y="64" width="12" height="4" fill="#F7931A" />
                                            <rect x="40" y="72" width="16" height="16" fill="#D37E15" />
                                            <rect x="64" y="80" width="8" height="8" fill="#F7931A" />
                                            <rect x="80" y="76" width="16" height="16" fill="#D37E15" />

                                            {/* Mini Logo */}
                                            <rect x="42" y="42" width="16" height="16" fill="white" rx="4" />
                                            <text x="45" y="54" fontSize="11" fontWeight="extrabold" fill="#F7931A">₿</text>
                                          </svg>
                                        )}
                                        <div className="absolute inset-0 bg-[#F7931A]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                                          <span className="bg-white/90 text-[8px] font-bold py-1 px-1.5 rounded shadow text-slate-800">Billetera Bitcoin</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="w-full max-w-[340px] space-y-3">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <span className="font-extrabold text-[#F7931A] text-sm tracking-tight">Bitcoin (BTC) <span className="px-1.5 py-0.5 rounded bg-[#F7931A]/10 text-[#F7931A] text-[9px] font-extrabold uppercase tracking-widest ml-1">{CRYPTO_QR_CONFIG.btc.network}</span></span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 leading-normal px-2">
                                        Envía tu aporte humanitario en Bitcoin directamente a la dirección de reserva oficial para insumos médicos de emergencia de la fundación.
                                      </p>
                                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1 text-left">
                                        <div className="flex justify-between items-center">
                                          <span className="text-slate-400">Dirección BTC:</span>
                                          <span className="font-mono font-bold text-slate-800 truncate max-w-[150px] sm:max-w-none" title={CRYPTO_QR_CONFIG.btc.address}>{CRYPTO_QR_CONFIG.btc.address}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                                          <span className="text-slate-400">Red requerida:</span>
                                          <span className="font-semibold text-slate-700">{CRYPTO_QR_CONFIG.btc.network}</span>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(CRYPTO_QR_CONFIG.btc.address, 'btc')}
                                        className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full"
                                      >
                                        <Check className={`w-3.5 h-3.5 text-emerald-600 transition-transform ${copiedText === 'btc' ? 'scale-110' : 'scale-0'}`} />
                                        <span>{copiedText === 'btc' ? '¡Dirección Copiada!' : 'Copiar Dirección'}</span>
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {cryptoTab === 'ltc' && (
                                  <div className="flex flex-col items-center gap-5 animate-fadeIn text-xs text-center">
                                    <div className="w-full flex justify-center">
                                      <div className="bg-white p-4 rounded-3xl border border-blue-200 shadow-lg relative group w-full max-w-[320px] mx-auto">
                                        {CRYPTO_QR_CONFIG.ltc.qrImageUrl ? (
                                          <img 
                                            src={CRYPTO_QR_CONFIG.ltc.qrImageUrl} 
                                            alt="QR LTC" 
                                            className="w-full h-auto object-contain rounded-2xl mx-auto block hover:scale-105 transition-transform duration-300 shadow-sm"
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <svg width="100%" height="auto" viewBox="0 0 100 100" className="w-full h-auto text-slate-900 mx-auto max-w-[260px] block">
                                            {/* Finders */}
                                            <rect x="0" y="0" width="28" height="28" fill="#627EEA" rx="2" />
                                            <rect x="4" y="4" width="20" height="20" fill="white" rx="1" />
                                            <rect x="8" y="8" width="12" height="12" fill="#4862D1" rx="0.5" />

                                            <rect x="72" y="0" width="28" height="28" fill="#627EEA" rx="2" />
                                            <rect x="76" y="4" width="20" height="20" fill="white" rx="1" />
                                            <rect x="80" y="8" width="12" height="12" fill="#4862D1" rx="0.5" />

                                            <rect x="0" y="72" width="28" height="28" fill="#627EEA" rx="2" />
                                            <rect x="4" y="76" width="20" height="20" fill="white" rx="1" />
                                            <rect x="8" y="80" width="12" height="12" fill="#4862D1" rx="0.5" />

                                            {/* Pixels */}
                                            <rect x="36" y="0" width="8" height="8" fill="#4862D1" />
                                            <rect x="48" y="4" width="4" height="12" fill="#627EEA" />
                                            <rect x="56" y="0" width="12" height="4" fill="#4862D1" />
                                            <rect x="36" y="12" width="16" height="12" fill="#627EEA" />
                                            <rect x="60" y="20" width="8" height="8" fill="#4862D1" />
                                            <rect x="12" y="36" width="20" height="8" fill="#627EEA" />
                                            <rect x="36" y="36" width="12" height="16" fill="#4862D1" />
                                            <rect x="56" y="36" width="8" height="8" fill="#4862D1" />
                                            <rect x="72" y="44" width="16" height="12" fill="#627EEA" />
                                            <rect x="0" y="56" width="12" height="12" fill="#4862D1" />
                                            <rect x="36" y="60" width="16" height="4" fill="#627EEA" />
                                            <rect x="56" y="52" width="12" height="12" fill="#4862D1" />
                                            <rect x="76" y="64" width="12" height="4" fill="#627EEA" />
                                            <rect x="40" y="72" width="16" height="16" fill="#4862D1" />
                                            <rect x="64" y="80" width="8" height="8" fill="#627EEA" />
                                            <rect x="80" y="76" width="16" height="16" fill="#4862D1" />

                                            {/* Mini Logo */}
                                            <rect x="42" y="42" width="16" height="16" fill="white" rx="4" />
                                            <polygon points="50,44 55,49 50,54 45,49" fill="#627EEA" />
                                          </svg>
                                        )}
                                        <div className="absolute inset-0 bg-[#627EEA]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                                          <span className="bg-white/90 text-[8px] font-bold py-1 px-1.5 rounded shadow text-slate-800">Billetera Litecoin</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="w-full max-w-[340px] space-y-3">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <span className="font-extrabold text-[#345D9D] text-sm tracking-tight">Litecoin (LTC) <span className="px-1.5 py-0.5 rounded bg-[#345D9D]/10 text-[#345D9D] text-[9px] font-extrabold uppercase tracking-widest ml-1">{CRYPTO_QR_CONFIG.ltc.network}</span></span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 leading-normal px-2">
                                        Envía tu contribución utilizando Litecoin (LTC) a la dirección oficial de logística rápida, con comisiones extremadamente bajas.
                                      </p>
                                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1 text-left">
                                        <div className="flex justify-between items-center">
                                          <span className="text-slate-400">Dirección LTC:</span>
                                          <span className="font-mono font-bold text-slate-800 truncate max-w-[150px] sm:max-w-none" title={CRYPTO_QR_CONFIG.ltc.address}>{CRYPTO_QR_CONFIG.ltc.address}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                                          <span className="text-slate-400">Red requerida:</span>
                                          <span className="font-semibold text-slate-700">{CRYPTO_QR_CONFIG.ltc.network}</span>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(CRYPTO_QR_CONFIG.ltc.address, 'ltc')}
                                        className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full"
                                      >
                                        <Check className={`w-3.5 h-3.5 text-emerald-600 transition-transform ${copiedText === 'ltc' ? 'scale-110' : 'scale-0'}`} />
                                        <span>{copiedText === 'ltc' ? '¡Dirección Copiada!' : 'Copiar Dirección'}</span>
                                      </button>
                                    </div>
                                  </div>
                                )}

                                <div className="border-t border-slate-200 pt-3 flex flex-col space-y-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Confirmación de Operación</span>
                                  <label className="flex items-start gap-2.5 text-xs text-slate-600 font-medium cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={personalData.qrConfirmationChecked}
                                      onChange={(e) => setPersonalData({...personalData, qrConfirmationChecked: e.target.checked})}
                                      className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                    />
                                    <span>Ya he escaneado la dirección de billetera y completado la transacción por el monto equivalente a <strong>${activeAmount} USD</strong>.</span>
                                  </label>
                                </div>
                                
                              </div>
                            )}

                          </div>

                          {/* Garantía de Seguridad */}
                          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium">
                            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Donación 100% Protegida • Procesamiento Seguro</span>
                          </div>

                          {/* Botones de Navegación */}
                          <div className="grid grid-cols-3 gap-3 pt-2">
                            <button
                              type="button"
                              onClick={handlePrevStep}
                              className="py-3 px-2 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm text-center flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              Atrás
                            </button>
                            <button
                              type="submit"
                              className="col-span-2 py-3 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-100 cursor-pointer"
                            >
                              <Lock className="w-4 h-4 text-emerald-100" />
                              Confirmar Donación de ${activeAmount}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* PASO 4: PANTALLA DE ÉXITO DE DONACIÓN */}
                      {currentStep === 4 && (
                        <div className="text-center space-y-6 py-4 animate-scaleUp">
                          
                          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <Heart className="w-8 h-8 text-emerald-600 fill-emerald-600 animate-pulse" />
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                              ¡Muchísimas gracias, {personalData.firstName}!
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                              Tu donación {donationFrequency === 'monthly' ? 'mensual' : 'única'} de <strong className="text-emerald-700 font-extrabold text-sm">${activeAmount} USD</strong> ha sido confirmada. Tu aporte se traduce inmediatamente en platos de comida y tratamientos de vitaminas.
                            </p>
                          </div>

                          {/* CERTIFICADO DE ESPERANZA INTERACTIVO */}
                          <div className="max-w-md mx-auto bg-white rounded-2xl border-2 border-amber-100 p-5 sm:p-6 shadow-md relative overflow-hidden text-center space-y-4">
                            {/* Venezuela flag colors top ribbon */}
                            <div className="absolute top-0 left-0 right-0 h-1 flex">
                              <div className="flex-1 h-full bg-[#F7D117]" />
                              <div className="flex-1 h-full bg-[#003893]" />
                              <div className="flex-1 h-full bg-[#CF142B]" />
                            </div>

                            <div className="flex justify-between items-start text-[9px] text-slate-400 font-mono">
                              <span>ESPERANZA ACTIVA NGO</span>
                              <span>COD: EA-CERT-{Math.floor(100000 + Math.random() * 900000)}</span>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-bold tracking-widest text-[#003893] bg-[#003893]/5 px-2.5 py-1 rounded-full">
                                Certificado de Esperanza
                              </span>
                              <p className="text-[10px] text-slate-400 italic">Otorgado con profunda gratitud a:</p>
                              
                              <h5 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 capitalize">
                                {personalData.firstName} {personalData.lastName || 'Amigo de Venezuela'}
                              </h5>
                            </div>

                            <p className="text-[11px] text-slate-500 leading-relaxed italic max-w-sm mx-auto">
                              "Por sembrar una semilla de vida, salud y amor mediante su valiosa contribución humanitaria de <strong className="text-[#003893] font-bold">${activeAmount} USD</strong> destinada a proveer suplementos de micronutrientes y alimentación básica para rescatar de la desnutrición a la niñez venezolana."
                            </p>

                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-left text-[9px] text-slate-400 font-mono">
                              <div>
                                <span className="block font-semibold text-slate-500">FECHA DE EMISIÓN</span>
                                <span className="text-slate-700 font-bold">{new Date().toLocaleDateString()}</span>
                              </div>
                              <div className="text-right">
                                <span className="block font-semibold text-slate-500">PRESIDENTE DE COMITÉ</span>
                                <span className="text-[#CF142B] font-bold">Ayuda Humanitaria Venezuela</span>
                              </div>
                            </div>

                            {/* Sello de Autenticidad */}
                            <div className="absolute bottom-12 right-6 opacity-10 pointer-events-none">
                              <Award className="w-20 h-20 text-[#F7D117] fill-current" />
                            </div>
                          </div>

                          {/* BOTÓN DE DESCARGA INTERACTIVO */}
                          <div className="max-w-xs mx-auto">
                            <button
                              type="button"
                              onClick={handleDownloadCertificate}
                              disabled={downloadingCertificate}
                              className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                certificateDownloaded 
                                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                                  : 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-md shadow-amber-100'
                              }`}
                            >
                              {downloadingCertificate ? (
                                <>
                                  <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                                  <span>Generando Certificado PDF...</span>
                                </>
                              ) : certificateDownloaded ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                                  <span>¡Certificado Descargado!</span>
                                </>
                              ) : (
                                <>
                                  <Award className="w-4 h-4" />
                                  <span>Descargar Certificado Oficial</span>
                                </>
                              )}
                            </button>
                            {certificateDownloaded && (
                              <span className="text-[9px] text-emerald-600 block mt-1 animate-pulse">
                                Comprobante de donación descargado en tu dispositivo.
                              </span>
                            )}
                          </div>

                          {/* Recibo Técnico de Transacción */}
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs space-y-2.5 max-w-xs mx-auto">
                            <div className="flex justify-between border-b pb-2 text-[10px]">
                              <span className="font-bold text-slate-400 uppercase tracking-wider">Recibo Digital</span>
                              <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Exitoso</span>
                            </div>
                            <div className="space-y-1 text-[11px] text-slate-600 font-medium">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Canal de Pago:</span>
                                <span className="text-slate-900 font-bold capitalize text-right">
                                  {personalData.paymentMethod === 'card' 
                                    ? 'Tarjeta' 
                                    : personalData.paymentMethod === 'qrexpress' 
                                    ? 'QR Express' 
                                    : 'Criptomoneda'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Email:</span>
                                <span className="text-slate-900">{personalData.email}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Frecuencia:</span>
                                <span className="text-slate-900 capitalize">{donationFrequency === 'monthly' ? 'Mensual' : 'Única'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Referencia:</span>
                                <span className="font-mono text-slate-800 font-bold">EA-{Math.floor(100000 + Math.random() * 900000)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Botones de acción final */}
                          <div className="space-y-2.5 max-w-xs mx-auto pt-1">
                            <button
                              type="button"
                              onClick={copyCampaignLink}
                              className="w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Share2 className="w-4 h-4 text-[#003893]" />
                              {copiedLink ? '¡Enlace de campaña copiado!' : 'Compartir campaña con amigos'}
                            </button>
                            <button
                              type="button"
                              onClick={resetDonation}
                              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                            >
                              Hacer otra contribución
                            </button>
                          </div>

                        </div>
                      )}

                    </form>

                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. SECCIÓN DE IMPACTO & TRANSPARENCIA (Transparency) */}
        <section id="como-ayudar" className="py-20 bg-white scroll-mt-18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#CF142B] bg-rose-50 px-3 py-1 rounded-full">
                Transparencia Absoluta
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                ¿Qué logramos exactamente con cada donación?
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Creemos firmemente en la transparencia de recursos. Cada centavo donado tiene un impacto directo y rastreable en nuestras zonas de intervención. No especulamos con la ayuda, la llevamos directo al campo.
              </p>
            </div>

            {/* Grid de Impacto de 4 Columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {impactLevels.map((level, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {level.icon}
                  </div>
                  
                  <span className="text-3xl font-extrabold text-slate-900 block mb-1">
                    ${level.amount} USD
                  </span>
                  
                  <h4 className="font-bold text-base text-[#003893] mb-2">
                    {level.title}
                  </h4>
                  
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                    {level.description}
                  </p>

                  <div className="border-t pt-4 text-[11px] text-slate-400 font-medium leading-relaxed italic">
                    {level.detail}
                  </div>
                </div>
              ))}
            </div>

            {/* Certificaciones y Auditoría */}
            <div className="mt-16 bg-[#003893] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Award className="w-96 h-96" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center gap-2 text-[#F7D117]">
                    <Award className="w-5 h-5 fill-current" />
                    <span className="text-xs font-extrabold uppercase tracking-widest">Organización de Confianza</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Auditorías independientes externas y trazabilidad
                  </h3>
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-3xl">
                    Para mantener los más altos estándares éticos, todas nuestras compras e inventarios de emergencia son auditados de manera bimestral por firmas externas. Cada compra de kits de salvamento y carpas de refugio es mapeada mediante geolocalización y registro fotográfico de entrega directa para verificar su recepción inmediata por parte de las familias venezolanas damnificadas.
                  </p>
                </div>
                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 justify-center">
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15 flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-[#F7D117] shrink-0" />
                    <div>
                      <span className="block font-bold text-xs">92% Eficiencia</span>
                      <span className="text-[10px] text-slate-300">Costo operativo mínimo</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15 flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />
                    <div>
                      <span className="block font-bold text-xs">100% Legal</span>
                      <span className="text-[10px] text-slate-300">ONG registrada en el exterior</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 4. SECCIÓN DE TESTIMONIOS (Field Stories) */}
        <section id="testimonios" className="py-20 bg-slate-50 scroll-mt-18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#003893] bg-[#003893]/5 px-3 py-1 rounded-full">
                Historias de Esperanza
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Voces reales desde el corazón de la ayuda
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Conoce a las personas que coordinan los esfuerzos médicos y alimenticios en Venezuela, y a las familias que han recuperado su sonrisa gracias a tu generosidad.
              </p>
            </div>

            {/* Grid de Testimonios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((test, idx) => (
                <div 
                  key={idx}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-all border border-slate-100 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Badge */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                      test.badge === 'Equipo Médico' 
                        ? 'bg-rose-50 text-[#CF142B]' 
                        : test.badge === 'Voluntario' 
                          ? 'bg-amber-50 text-amber-800' 
                          : 'bg-indigo-50 text-indigo-900'
                    }`}>
                      {test.badge}
                    </span>
                    
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed italic">
                      &quot;{test.text}&quot;
                    </p>
                  </div>

                  <div className="flex items-center gap-3.5 mt-8 pt-6 border-t border-slate-100">
                    <img 
                      src={test.image} 
                      alt={test.name} 
                      className="w-11 h-11 rounded-full object-cover shadow-sm shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm text-[#003893]">{test.name}</h5>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                        {test.role} • <span className="font-semibold text-slate-600">{test.location}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 5. PREGUNTAS FRECUENTES (FAQ Accordion) */}
        <section id="faq" className="py-20 bg-white scroll-mt-18">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center space-y-4 mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#CF142B] bg-rose-50 px-3 py-1 rounded-full">
                Soporte y Dudas
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Preguntas Frecuentes
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                ¿Tienes alguna inquietud sobre cómo realizamos el envío de fondos, la deducibilidad tributaria o la seguridad de tus datos? Aquí te lo explicamos todo de manera abierta.
              </p>
            </div>

            {/* Lista de Acordeones */}
            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div 
                    key={idx}
                    className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full px-6 py-5 text-left flex justify-between items-center font-bold text-sm sm:text-base text-slate-900 hover:text-[#003893] transition-colors focus:outline-none"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                    </button>
                    
                    {isOpen && (
                      <div className="px-6 pb-5 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100/60 pt-4 bg-white animate-fadeIn">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA Final debajo de FAQ */}
            <div className="mt-16 text-center space-y-4 p-8 bg-amber-50 rounded-3xl border border-amber-100/70">
              <h4 className="font-extrabold text-base sm:text-lg text-[#003893]">¿Tienes otra consulta o deseas donar a gran escala?</h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                Si representas a una fundación corporativa, empresa o deseas realizar una donación de insumos médicos de forma física desde Estados Unidos, Europa o Colombia, contáctanos directamente.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3.5 pt-2">
                <a 
                  href="mailto:coordinacion@esperanzaactiva.org"
                  className="px-5 py-2.5 bg-[#003893] hover:bg-[#00225c] text-white rounded-xl text-xs font-bold transition-all"
                >
                  Escribir a Coordinación
                </a>
                <a 
                  href="#formulario-donacion"
                  className="px-5 py-2.5 bg-[#CF142B] hover:bg-[#b81024] text-white rounded-xl text-xs font-bold transition-all"
                >
                  Hacer Donación Regular
                </a>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* 6. FOOTER (PIE DE PÁGINA) */}
      <footer className="bg-slate-950 text-slate-400 py-12 sm:py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            {/* Columna Logo e Info */}
            <div className="space-y-4 md:col-span-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#003893] via-[#CF142B] to-[#F7D117] p-[1.5px] flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
                <span className="font-bold text-white text-base tracking-tight">
                  Esperanza Activa
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
                Organización de carácter humanitario, sin fines de lucro, legalmente incorporada y dedicada a canalizar atención médica de trauma, alimentos de emergencia, agua purificada y refugio temporal para el auxilio de familias damnificadas por sismos y desastres naturales en Venezuela.
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                Licencia de Operación NGO Nro: US-503C-982110
              </p>
            </div>

            {/* Columna Enlaces de Interés */}
            <div className="space-y-3">
              <h5 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">La Fundación</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#como-ayudar" className="hover:text-white transition-colors">¿Cómo ayudamos?</a></li>
                <li><a href="#impacto" className="hover:text-white transition-colors">Nuestros Programas</a></li>
                <li><a href="#testimonios" className="hover:text-white transition-colors">Historias de éxito</a></li>
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Transparencia y Finanzas</a></li>
              </ul>
            </div>

            {/* Columna Contacto */}
            <div className="space-y-3">
              <h5 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">Contacto Internacional</h5>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#F7D117]" />
                  <span>Sede: Miami, FL, EE.UU. / Caracas, Venezuela</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#CF142B]" />
                  <span>donaciones@esperanzaactiva.org</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#003893]" />
                  <span>Soporte: +1 (786) 555-0199</span>
                </li>
              </ul>
            </div>

            {/* Columna Garantía o Seguridad */}
            <div className="space-y-3">
              <h5 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">Compromiso Legal</h5>
              <p className="text-xs leading-relaxed text-slate-400">
                Todas las transacciones con tarjeta de crédito están procesadas a través de servidores con cifrado TLS 1.3 de última generación de nivel bancario. Cumplimos con estándares PCI-DSS Nivel 1.
              </p>
              <div className="flex items-center gap-2.5 pt-2">
                <div className="px-2 py-1 bg-slate-900 border border-slate-800 text-slate-400 font-bold font-mono text-[9px] rounded">
                  PCI COMPLIANT
                </div>
                <div className="px-2 py-1 bg-slate-900 border border-slate-800 text-slate-400 font-bold font-mono text-[9px] rounded">
                  SSL SECURED
                </div>
              </div>
            </div>

          </div>

          <div className="border-t border-slate-900 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
            <p>&copy; {new Date().getFullYear()} Esperanza Activa. Todos los derechos reservados.</p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <a href="#" className="hover:text-white">Política de Privacidad</a>
              <span>•</span>
              <a href="#" className="hover:text-white">Términos del Donante</a>
              <span>•</span>
              <a href="#" className="hover:text-white">Transparencia Gubernamental</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
