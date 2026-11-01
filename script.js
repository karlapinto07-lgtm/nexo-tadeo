/* =========================================================
   NEXOTADEO · La red para conectar — v3
   script.js — panal con conexiones, perfiles editables, proyectos
   apilados, gestor de proyecto (brief + PDF) y asistente Cabito.
   Sin dependencias (jsPDF se carga solo al descargar un PDF).
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Configuración ---------- */
  const HEX_R = 84;               // radio de layout de cada celda (px)
  const HEX_GAP = 18;             // espacio entre celdas: por ahí corren las líneas de conexión
  const CLUSTER_D = 4;            // distancia (en celdas) entre campos vecinos
  const WORD_LIMIT = 300;         // límite de palabras para Cabito
  const AUTO_OPEN_S = 15;         // segundos antes de abrir el proyecto armado con Cabito
  const MAX_AREAS = 3;
  const STORE_KEY = 'nexotadeo.v3';
  const SQRT3 = Math.sqrt(3);
  const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  const MIN_S = 0.18, MAX_S = 2.6;
  const JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

  // Copia de respaldo de data.json (solo si fetch falla, p. ej. al abrir el archivo con doble clic)
  const FALLBACK_DATA = {"meta":{"nombre":"NexoTadeo","subtitulo":"Red de gestión de conocimiento","version":"3.0.0","claveDemo":"nexo2026","dominio":"utadeo.edu.co","correoUniversidad":""},"nichos":[{"id":"producto","nombre":"Producto, Objetos y Mobiliario","corto":"Producto y Mobiliario","color":"#E5383B","texto":"#FFFFFF","descripcion":"Diseño de objetos tangibles que habitan la vida cotidiana: mobiliario, empaques, componentes y productos industriales pensados para fabricarse, usarse y durar.","keywords":["producto","objeto","fisico","fabricacion","taller de madera"],"areas":[{"id":"producto-objetos","nombre":"Diseño de Objetos","keywords":["objeto","utensilio","accesorio","lampara","juguete","joyeria","artesan"]},{"id":"producto-empaques","nombre":"Diseño de Empaques, Envases y Moldes","keywords":["empaq","envas","molde","packaging","etiqueta","botella","caja","embalaje"]},{"id":"producto-mobiliario","nombre":"Diseño de Mobiliario","keywords":["mueble","mobiliar","silla","mesa","estanteria","exhibidor","banca","madera"]},{"id":"producto-industriales","nombre":"Diseño de Productos Industriales","keywords":["industrial","manufactur","prototip","electrodomest","maquina","produccion","serie"]},{"id":"producto-componentes","nombre":"Diseño de Componentes de Productos","keywords":["componente","pieza","ensambl","mecanism","cad","impresion 3d","repuesto"]}]},{"id":"servicios","nombre":"Servicios, Interacción y Experiencias","corto":"Servicios y Experiencias","color":"#F7B500","texto":"#2B2100","descripcion":"Diseño de lo intangible: servicios, puntos de contacto y experiencias memorables que conectan a las personas con marcas, lugares y comunidades.","keywords":["interaccion","cliente","publico","asistentes","visitantes"],"areas":[{"id":"servicios-servicios","nombre":"Diseño de Servicios","keywords":["servicio","atencion","customer","journey","blueprint","turismo","restaurante"]},{"id":"servicios-prodserv","nombre":"Diseño de Productos y Servicios","keywords":["producto-servicio","plataforma","suscrip","ecosistema de marca","omnicanal"]},{"id":"servicios-experiencias","nombre":"Diseño de Experiencias","keywords":["experiencia","evento","activacion","inmersiv","festival","encuentro","feria","lanzamiento"]}]},{"id":"sostenibilidad","nombre":"Sostenibilidad y Ecodiseño","corto":"Sostenibilidad","color":"#23A55A","texto":"#FFFFFF","descripcion":"Diseño responsable con el planeta: materiales de bajo impacto, procesos limpios y productos que se reparan, se reutilizan y vuelven al ciclo.","keywords":["eco","verde","planeta","ambiental","medio ambiente"],"areas":[{"id":"sostenibilidad-manufactura","nombre":"Manufactura Sostenible","keywords":["sosten","reciclad","residuo","biomaterial","compost","ecologic","material"]},{"id":"sostenibilidad-tecnologia","nombre":"Diseño, Sostenibilidad y Tecnología","keywords":["energia","solar","tecnolog","agua","clima","huella","emision"]},{"id":"sostenibilidad-circulares","nombre":"Diseño de Productos Circulares","keywords":["circular","reutiliz","reparar","upcycl","ciclo de vida","segunda vida","desecho","reciclaje"]}]},{"id":"habitat","nombre":"Hábitat y Bienestar","corto":"Hábitat y Bienestar","color":"#3466C2","texto":"#FFFFFF","descripcion":"Diseño de espacios y entornos que cuidan a las personas: interiores, salud, ergonomía y estímulos sensoriales para habitar mejor.","keywords":["habitat","habitar","entorno","lugar"],"areas":[{"id":"habitat-interiores","nombre":"Diseño de Interiores","keywords":["interior","espacio","vivienda","oficina","local","tienda","iluminacion","habitacion","casa"]},{"id":"habitat-salud","nombre":"Salud y Bienestar Humano","keywords":["salud","bienestar","hospital","ergonom","adulto mayor","discapacid","terapia","inclusi","accesib"]},{"id":"habitat-sensorial","nombre":"Diseño Sensorial y Perceptivo","keywords":["sensorial","sentido","tacto","sonido","olfat","percep","textura","aroma"]}]},{"id":"gestion","nombre":"Gestión, Innovación y Estrategia","corto":"Gestión y Estrategia","color":"#F06424","texto":"#FFFFFF","descripcion":"El diseño como motor de decisiones: conceptos, sistemas y estrategias que convierten ideas en organizaciones, marcas y negocios viables.","keywords":["gestion","innovacion","empresa","proyecto"],"areas":[{"id":"gestion-concepto","nombre":"Diseño de Concepto","keywords":["concepto","ideacion","naming","propuesta","creativ","storytelling"]},{"id":"gestion-sistemas","nombre":"Diseño de Sistemas","keywords":["sistema","proceso","logistic","organizac","operacion","flujo","cadena"]},{"id":"gestion-estrategias","nombre":"Diseño de Estrategias","keywords":["estrateg","negocio","emprend","mercado","marca","startup","branding","financ","vender"]}]},{"id":"social","nombre":"Innovación Social y Pedagogía","corto":"Innovación Social","color":"#5FA8F0","texto":"#06213D","descripcion":"Diseño con y para las comunidades: educación, cultura, investigación y trabajo en territorio para transformar realidades desde lo colectivo.","keywords":["social","pedagog","cultura","colectivo","ciudadan"],"areas":[{"id":"social-educacion","nombre":"Educación y Gestión Cultural","keywords":["educa","taller","cultural","aprendiz","colegio","escuela","curso","niños","ninos","jovenes"]},{"id":"social-museografico","nombre":"Diseño Museográfico","keywords":["museo","museograf","exposicion","exhibicion","curadur","patrimonio","galeria","memoria"]},{"id":"social-investigacion","nombre":"Investigación","keywords":["investiga","articulo","publicacion","paper","revista","academ","ponencia","tesis","congreso"]},{"id":"social-territorio","nombre":"Trabajo en Territorio","keywords":["territori","comunidad","rural","barrio","campesin","cocrea","co-crea","vereda","region"]}]},{"id":"uxui","nombre":"UX/UI","corto":"UX/UI","color":"#B62BD4","texto":"#FFFFFF","descripcion":"Diseño de experiencias digitales: interfaces, investigación con usuarios, realidades extendidas y productos conectados que se sienten naturales.","keywords":["digital","ux","tecnologia digital","software"],"areas":[{"id":"uxui-xr","nombre":"Realidad Virtual, Aumentada y Mixta","keywords":["realidad","virtual","aumentad","vr","ar","xr","metaverso","mixta","unity"]},{"id":"uxui-research","nombre":"Investigación de Usuario","keywords":["usuario","entrevist","usabilid","test","insight","encuesta","research"]},{"id":"uxui-iot","nombre":"Ecosistemas IoT y Productos Conectados","keywords":["iot","conectad","sensor","arduino","smart","inteligente","domotic","wearable"]},{"id":"uxui-interfaz","nombre":"Interfaz","keywords":["interfaz","app","aplicacion","web","pagina","ui","dashboard","figma","movil","sitio"]}]}],"perfiles":[{"id":"p01","nombre":"Luisa Hernández","genero":"F","rol":"estudiante","semestre":8,"foto":"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&h=240&fit=crop&crop=faces","ciudad":"Bogotá","correo":"luisa.hernandez@utadeo.edu.co","bio":"Diseñadora industrial en formación. Me apasiona el mobiliario modular y optimizar piezas para producción en serie sin perder calidez.","nicho":"producto","areas":["producto-mobiliario","producto-componentes"],"habilidades":["Desarrollo en serie","Optimización","Rhino 3D"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=mobiliario","instagram":"https://www.instagram.com/explore/tags/mobiliario/"}},{"id":"p02","nombre":"Franco Díaz","genero":"M","rol":"egresado","semestre":null,"foto":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop&crop=faces","ciudad":"Medellín","correo":"franco.diaz@utadeo.edu.co","bio":"Diseñador de empaques con 6 años en la industria de alimentos. Desarrollo envases, moldes y prototipos listos para línea de producción.","nicho":"producto","areas":["producto-empaques","producto-industriales"],"habilidades":["Packaging","SolidWorks","Moldes"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=packaging","instagram":"https://www.instagram.com/explore/tags/packagingdesign/"}},{"id":"p03","nombre":"María Camila Rojas","genero":"F","rol":"egresado","semestre":null,"foto":"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=faces","ciudad":"Bogotá","correo":"maria.rojas@utadeo.edu.co","bio":"Service designer. Mapeo customer journeys y diseño blueprints para que los servicios funcionen tan bien por dentro como se ven por fuera.","nicho":"servicios","areas":["servicios-servicios","servicios-experiencias"],"habilidades":["Customer journeys","Service blueprint","Facilitación"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=service%20design","instagram":"https://www.instagram.com/explore/tags/servicedesign/"}},{"id":"p04","nombre":"Mario Guerrero","genero":"M","rol":"estudiante","semestre":6,"foto":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=faces","ciudad":"Cali","correo":"mario.guerrero@utadeo.edu.co","bio":"Me encanta diseñar experiencias: activaciones de marca, ferias y encuentros donde la gente participa en lugar de solo mirar.","nicho":"servicios","areas":["servicios-experiencias","servicios-prodserv"],"habilidades":["Eventos","Activaciones","Escenografía"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=experience%20design","instagram":"https://www.instagram.com/explore/tags/experiencedesign/"}},{"id":"p05","nombre":"Valentina Ospina","genero":"F","rol":"egresado","semestre":null,"foto":"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=240&h=240&fit=crop&crop=faces","ciudad":"Bogotá","correo":"valentina.ospina@utadeo.edu.co","bio":"Investigo biomateriales a partir de residuos agrícolas y los convierto en productos circulares de baja huella.","nicho":"sostenibilidad","areas":["sostenibilidad-circulares","sostenibilidad-manufactura"],"habilidades":["Biomateriales","Análisis de ciclo de vida","Upcycling"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=biomaterials","instagram":"https://www.instagram.com/explore/tags/biomaterials/"}},{"id":"p06","nombre":"Samuel Restrepo","genero":"M","rol":"estudiante","semestre":9,"foto":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&crop=faces","ciudad":"Bucaramanga","correo":"samuel.restrepo@utadeo.edu.co","bio":"Cruzo diseño y tecnología limpia: prototipos con energía solar y sistemas de captación de agua para zonas rurales.","nicho":"sostenibilidad","areas":["sostenibilidad-tecnologia","sostenibilidad-manufactura"],"habilidades":["Energía solar","Prototipado","Arduino"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=solar%20design","instagram":"https://www.instagram.com/explore/tags/ecodesign/"}},{"id":"p07","nombre":"Daniela Cárdenas","genero":"F","rol":"egresado","semestre":null,"foto":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop&crop=faces","ciudad":"Bogotá","correo":"daniela.cardenas@utadeo.edu.co","bio":"Diseñadora de interiores enfocada en iluminación y en espacios comerciales que se sienten, se escuchan y se recuerdan.","nicho":"habitat","areas":["habitat-interiores","habitat-sensorial"],"habilidades":["Iluminación","SketchUp","Retail"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=interior%20design","instagram":"https://www.instagram.com/explore/tags/interiordesign/"}},{"id":"p08","nombre":"Andrés Molina","genero":"M","rol":"estudiante","semestre":7,"foto":"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop&crop=faces","ciudad":"Tunja","correo":"andres.molina@utadeo.edu.co","bio":"Diseño para la salud: ayudas técnicas, ergonomía y entornos accesibles para adultos mayores y personas con discapacidad.","nicho":"habitat","areas":["habitat-salud","habitat-interiores"],"habilidades":["Ergonomía","Diseño inclusivo","Accesibilidad"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=inclusive%20design","instagram":"https://www.instagram.com/explore/tags/inclusivedesign/"}},{"id":"p09","nombre":"Laura Beltrán","genero":"F","rol":"egresado","semestre":null,"foto":"https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&h=240&fit=crop&crop=faces","ciudad":"Bogotá","correo":"laura.beltran@utadeo.edu.co","bio":"Estratega de marca y design thinking. Acompaño emprendimientos desde el concepto hasta el modelo de negocio.","nicho":"gestion","areas":["gestion-estrategias","gestion-concepto"],"habilidades":["Branding estratégico","Design thinking","Naming"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=branding%20strategy","instagram":"https://www.instagram.com/explore/tags/branding/"}},{"id":"p10","nombre":"Julián Pardo","genero":"M","rol":"estudiante","semestre":10,"foto":"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&h=240&fit=crop&crop=faces","ciudad":"Bogotá","correo":"julian.pardo@utadeo.edu.co","bio":"Me interesa cómo funcionan las organizaciones por dentro: procesos, logística y sistemas que hacen escalar a una startup.","nicho":"gestion","areas":["gestion-sistemas","gestion-estrategias"],"habilidades":["Modelos de negocio","Lean","Mapas de sistema"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=system%20design","instagram":"https://www.instagram.com/explore/tags/designmanagement/"}},{"id":"p11","nombre":"Sofía Martínez","genero":"F","rol":"estudiante","semestre":5,"foto":"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&h=240&fit=crop&crop=faces","ciudad":"Villavicencio","correo":"sofia.martinez@utadeo.edu.co","bio":"Co-creo con comunidades rurales. Diseño talleres y herramientas pedagógicas para que el conocimiento local se quede en el territorio.","nicho":"social","areas":["social-territorio","social-educacion"],"habilidades":["Co-creación","Talleres","Cartografía social"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=social%20design","instagram":"https://www.instagram.com/explore/tags/socialdesign/"}},{"id":"p12","nombre":"Camilo Vargas","genero":"M","rol":"egresado","semestre":null,"foto":"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&h=240&fit=crop&crop=faces","ciudad":"Bogotá","correo":"camilo.vargas@utadeo.edu.co","bio":"Museógrafo e investigador. Diseño exposiciones sobre memoria y patrimonio, y publico artículos sobre diseño y cultura.","nicho":"social","areas":["social-museografico","social-investigacion"],"habilidades":["Curaduría","Escritura académica","Montaje expositivo"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=exhibition%20design","instagram":"https://www.instagram.com/explore/tags/exhibitiondesign/"}},{"id":"p13","nombre":"Isabella Torres","genero":"F","rol":"egresado","semestre":null,"foto":"https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=240&h=240&fit=crop&crop=faces","ciudad":"Bogotá","correo":"isabella.torres@utadeo.edu.co","bio":"Product designer UX/UI. Investigo con usuarios, prototipo en Figma y construyo design systems para apps y plataformas web.","nicho":"uxui","areas":["uxui-interfaz","uxui-research"],"habilidades":["Figma","Design systems","Usabilidad"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=ui%20ux","instagram":"https://www.instagram.com/explore/tags/uxdesign/"}},{"id":"p14","nombre":"Nicolás Herrera","genero":"M","rol":"estudiante","semestre":8,"foto":"https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=240&h=240&fit=crop&crop=faces","ciudad":"Pereira","correo":"nicolas.herrera@utadeo.edu.co","bio":"Experiencias en realidad virtual y aumentada, y objetos conectados con sensores. Unity y Arduino son mi taller.","nicho":"uxui","areas":["uxui-xr","uxui-iot"],"habilidades":["Unity","Arduino","Realidad aumentada"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=augmented%20reality","instagram":"https://www.instagram.com/explore/tags/augmentedreality/"}}],"sectores":[{"id":"gestion-publica","nombre":"Gestión Pública","keywords":["publica","gestion publica","alcaldia","entidad","institucion"]},{"id":"gobierno","nombre":"Gobierno","keywords":["gobierno","politica","ciudadan","participacion","gobernanza"]},{"id":"desarrollo-economico","nombre":"Desarrollo Económico","keywords":["emprend","negocio","economic","empleo","mercado","startup","feria"]},{"id":"industria-turismo","nombre":"Industria y Turismo","keywords":["industria","turis","manufactur","fabrica","hotel","ruta"]},{"id":"educacion","nombre":"Educación","keywords":["educa","colegio","escuela","pedagog","aprendiz","taller","curso"]},{"id":"salud","nombre":"Salud","keywords":["salud","hospital","medic","bienestar","paciente","adulto mayor"]},{"id":"integracion-social","nombre":"Integración Social","keywords":["comunidad","social","vulnerab","inclusi","barrio","migrante"]},{"id":"cultura","nombre":"Cultura, Recreación y Deporte","keywords":["cultura","museo","arte","deporte","recrea","patrimonio","exposicion"]},{"id":"ambiente","nombre":"Ambiente","keywords":["ambient","sosten","recicl","residuo","clima","ecolog","agua"]},{"id":"movilidad","nombre":"Movilidad","keywords":["movilidad","transporte","bicicleta","estacion","vial","peaton"]},{"id":"mujeres","nombre":"Mujeres","keywords":["mujer","genero","femenin","madres"]},{"id":"juridico","nombre":"Jurídico","keywords":["juridic","legal","norma","derecho","propiedad intelectual"]}],"proyectos":[{"id":"pr01","titulo":"Mobiliario urbano con plástico reciclado","sector":"ambiente","estado":"ejecucion","autor":"p05","participantes":["p01","p06"],"areas":["sostenibilidad-circulares","producto-mobiliario"],"descripcion":"Diseñamos bancas y bolardos modulares fabricados con plástico postconsumo recuperado en barrios de Bogotá. El proyecto mide la huella del material y prueba prototipos en dos parques piloto.","creado":"2026-08-14","imagenes":[],"enlaces":[],"borrador":false,"enviado":null,"tipo":"producto"},{"id":"pr02","titulo":"App de citas médicas para adultos mayores","sector":"salud","estado":"ejecucion","autor":"p13","participantes":["p08","p03"],"areas":["uxui-interfaz","uxui-research","habitat-salud"],"descripcion":"Una aplicación con interfaz de alto contraste y lectura en voz alta para que adultos mayores agenden y recuerden sus citas sin depender de terceros. Estamos en pruebas de usabilidad con tres centros de salud.","creado":"2026-09-02","imagenes":[],"enlaces":[],"borrador":false,"enviado":null,"tipo":"producto-digital"},{"id":"pr03","titulo":"Museo itinerante de memoria campesina","sector":"cultura","estado":"finalizado","autor":"p12","participantes":["p11","p07"],"areas":["social-museografico","social-territorio"],"descripcion":"Exposición móvil co-creada con familias campesinas de Sumapaz. Objetos, relatos y cartografías recorrieron cinco veredas y terminaron en una muestra en el campus.","creado":"2025-11-20","imagenes":[],"enlaces":[],"borrador":false,"enviado":null,"tipo":"exposicion"},{"id":"pr04","titulo":"Feria de emprendimiento de diseño local","sector":"desarrollo-economico","estado":"finalizado","autor":"p09","participantes":["p04","p10"],"areas":["gestion-estrategias","servicios-experiencias"],"descripcion":"Feria de dos días con 40 marcas de egresados y estudiantes. Diseñamos la experiencia del visitante, la señalética y un modelo de sostenibilidad para repetirla cada semestre.","creado":"2026-03-05","imagenes":[],"enlaces":[],"borrador":false,"enviado":null,"tipo":"evento"},{"id":"pr05","titulo":"Kit pedagógico de reciclaje para colegios","sector":"educacion","estado":"ejecucion","autor":"p11","participantes":["p05","p02"],"areas":["social-educacion","producto-empaques"],"descripcion":"Un kit de juegos y empaques didácticos para enseñar separación en la fuente a niños de primaria. Se está validando en cuatro colegios distritales.","creado":"2026-07-22","imagenes":[],"enlaces":[],"borrador":false,"enviado":null,"tipo":"producto"},{"id":"pr06","titulo":"Señalética accesible para estaciones de transporte","sector":"movilidad","estado":"ejecucion","autor":"p08","participantes":["p14","p13"],"areas":["habitat-salud","uxui-iot"],"descripcion":"Sistema de señalética táctil y sonora con balizas conectadas para personas con discapacidad visual en estaciones de transporte público.","creado":"2026-09-30","imagenes":[],"enlaces":[],"borrador":false,"enviado":null,"tipo":"producto"},{"id":"pr07","titulo":"Ruta de diseño en La Candelaria","sector":"industria-turismo","estado":"finalizado","autor":"p03","participantes":["p07","p04"],"areas":["servicios-servicios","habitat-interiores"],"descripcion":"Ruta turística por talleres y tiendas de diseño del centro histórico, con mapa, experiencias guiadas y un sistema de reservas para los artesanos.","creado":"2026-02-11","imagenes":[],"enlaces":[],"borrador":false,"enviado":null,"tipo":"evento"}]};

  /* ---------- Íconos ---------- */
  const ICONS = {
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    arrow: '<path d="M7 17L17 7M9 7h8v8"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    cam: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
  };
  const icon = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
  const HEX_PATH = '<path d="M50 0l43.3 25v50L50 100 6.7 75V25z"/>';

  /* ---------- Estado ---------- */
  const state = {
    meta: {}, nichos: [], sectores: [], nicheById: new Map(), areaById: new Map(), sectorById: new Map(),
    perfiles: [], proyectos: [],
    cells: [], edges: [], cellByKey: new Map(), profileCell: new Map(), areaCell: new Map(), nicheCell: new Map(),
    view: { x: 0, y: 0, s: 1 }, focus: null, me: null, dragMoved: false,
    page: 'panal', filter: { sector: '', estado: '' },
    pm: null, cab: null
  };

  /* ---------- Utilidades ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  const initials = n => String(n).trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const firstName = n => String(n).trim().split(/\s+/)[0] || '';
  const wordsOf = t => (t.trim().match(/\S+/g) || []).length;
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const isMe = p => !!state.me && p && p.id === state.me.id;
  const uid = pre => pre + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const person = id => state.perfiles.find(p => p.id === id);
  const fmtDate = iso => { try { return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return iso; } };
  const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  const store = {
    read() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } },
    write(v) {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(v)); return true; }
      catch { toast('No se pudo guardar: el almacenamiento del navegador está lleno o no disponible'); return false; }
    },
    patch(fn) { const d = this.read(); fn(d); return this.write(d); }
  };

  async function hashPass(pass) {
    const input = 'nexotadeo:' + pass;
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      let h = 5381;
      for (const ch of input) h = ((h << 5) + h + ch.charCodeAt(0)) | 0;
      return 'x' + (h >>> 0).toString(16);
    }
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-show'), 3200);
  }

  function avatarHTML(p) {
    if (!p) return '';
    const n = state.nicheById.get(p.nicho);
    const ini = esc(initials(p.nombre));
    const style = `--c:${n ? n.color : '#5A81FA'}`;
    if (p.foto) return `<span class="avatar" style="${style}"><img src="${esc(p.foto)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.textContent='${ini}'"></span>`;
    return `<span class="avatar" style="${style}">${ini}</span>`;
  }

  function roleLabel(p) {
    if (p.rol === 'egresado') return p.genero === 'F' ? 'Egresada' : p.genero === 'M' ? 'Egresado' : 'Egresade';
    return p.semestre ? `Estudiante · ${p.semestre}° semestre` : 'Estudiante';
  }
  function breakdown(list) {
    const est = list.filter(p => p.rol === 'estudiante').length;
    return { total: list.length, est, egr: list.length - est };
  }
  function tipHTML(title, list) {
    const b = breakdown(list);
    return `<strong>${esc(title)}</strong><span>${plural(b.egr, 'egresado', 'egresados')}</span><span>${plural(b.est, 'estudiante', 'estudiantes')}</span>`;
  }

  // Redimensiona una imagen subida (recorte tipo "cover") para guardarla localmente
  function resizeImage(file, w, h) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) return reject(new Error('no-image'));
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = w; c.height = h;
          const k = Math.max(w / img.width, h / img.height);
          c.getContext('2d').drawImage(img, (w - img.width * k) / 2, (h - img.height * k) / 2, img.width * k, img.height * k);
          resolve(c.toDataURL('image/jpeg', 0.8));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* =========================================================
     DATOS
     ========================================================= */
  async function loadData() {
    try {
      const res = await fetch('data.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.status);
      return await res.json();
    } catch (err) {
      if (FALLBACK_DATA) return JSON.parse(JSON.stringify(FALLBACK_DATA));
      throw err;
    }
  }

  function indexData(data) {
    state.meta = data.meta || {};
    state.nichos = data.nichos;
    state.sectores = data.sectores || [];
    state.sectores.forEach(s => state.sectorById.set(s.id, s));
    state.nichos.forEach(n => {
      state.nicheById.set(n.id, n);
      n.areas.forEach(a => { a.nicho = n.id; state.areaById.set(a.id, a); });
    });
    const saved = store.read();
    const deleted = new Set(saved.deleted || []);
    const overrides = saved.overrides || {};
    const links = saved.links || {};
    const registered = (saved.usuarios || []).filter(u => state.nicheById.has(u.nicho));
    state.perfiles = [...data.perfiles.filter(p => !deleted.has(p.id)), ...registered].map(p => ({
      ...p, ...(overrides[p.id] || {}),
      areas: (p.areas || []).filter(id => state.areaById.has(id)),
      links: links[p.id] || p.links || []
    }));
    const ids = new Set(state.perfiles.map(p => p.id));
    const delProjects = new Set(saved.deletedProjects || []);
    const mine = saved.proyectos || [];
    const mineIds = new Set(mine.map(p => p.id));
    state.proyectos = [...(data.proyectos || []).filter(p => !mineIds.has(p.id)), ...mine]
      .filter(p => !delProjects.has(p.id) && ids.has(p.autor))
      .map(p => ({ ...p, participantes: (p.participantes || []).filter(id => ids.has(id)) }));
    state.me = saved.meId ? person(saved.meId) || null : null;
  }

  /* =========================================================
     LAYOUT HEXAGONAL + CONEXIONES
     ========================================================= */
  const hkey = (q, r) => `${q},${r}`;
  const hdist = (a, b) => (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.q + a.r - b.q - b.r)) / 2;
  const toPx = (q, r, R = HEX_R) => ({ x: R * SQRT3 * (q + r / 2), y: R * 1.5 * r });

  function computeLayout() {
    const occ = new Map();
    const cells = [];
    state.profileCell.clear(); state.areaCell.clear(); state.nicheCell.clear();
    const centers = state.nichos.map((n, i) => i === 0 ? { q: 0, r: 0 } : { q: DIRS[i - 1][0] * CLUSTER_D, r: DIRS[i - 1][1] * CLUSTER_D });
    const put = cell => {
      Object.assign(cell, toPx(cell.q, cell.r), { key: hkey(cell.q, cell.r) });
      occ.set(cell.key, cell); cells.push(cell);
      return cell;
    };
    state.nichos.forEach((n, i) => {
      const c = centers[i];
      state.nicheCell.set(n.id, put({ type: 'nicho', id: n.id, nicho: n.id, q: c.q, r: c.r }));
      const out = i === 0 ? 0 : i - 1;
      const order = [0, 1, 5, 2, 4, 3].map(k => (out + k) % 6);
      n.areas.forEach((a, j) => {
        const d = DIRS[order[j % 6]];
        state.areaCell.set(a.id, put({ type: 'area', id: a.id, nicho: n.id, q: c.q + d[0], r: c.r + d[1] }));
      });
    });
    state.perfiles.forEach(p => {
      const ni = state.nichos.findIndex(n => n.id === p.nicho);
      if (ni < 0) return;
      const own = centers[ni];
      const anchorCell = state.areaCell.get(p.areas[0]) || state.nicheCell.get(p.nicho);
      const anchor = { q: anchorCell.q, r: anchorCell.r };
      let strict = true;
      const owned = h => !strict || centers.every((c, k) => k === ni || hdist(h, own) <= hdist(h, c));
      const seen = new Set([hkey(anchor.q, anchor.r)]);
      let layer = [anchor], found = null;
      for (let depth = 0; depth < 16 && !found; depth++) {
        if (depth === 10) strict = false;
        const next = [];
        for (const h of layer) for (const [dq, dr] of DIRS) {
          const nb = { q: h.q + dq, r: h.r + dr }, k = hkey(nb.q, nb.r);
          if (!seen.has(k)) { seen.add(k); next.push(nb); }
        }
        const cand = next.filter(h => !occ.has(hkey(h.q, h.r)) && hdist(h, own) >= 2 && owned(h));
        if (cand.length) {
          cand.sort((a, b) => hdist(a, own) - hdist(b, own) || (Math.atan2(a.r, a.q) - Math.atan2(b.r, b.q)));
          found = cand[0];
        }
        layer = next;
      }
      if (found) state.profileCell.set(p.id, put({ type: 'perfil', id: p.id, nicho: p.nicho, q: found.q, r: found.r }));
    });
    state.cells = cells;
    state.cellByKey = occ;
    computeEdges();
  }

  // Conexiones: campo↔área, área↔persona, persona↔persona con áreas en común
  function computeEdges() {
    const edges = [], seen = new Set();
    const add = (a, b) => { const k = [a.key, b.key].sort().join('|'); if (!seen.has(k)) { seen.add(k); edges.push([a, b]); } };
    const neighbors = c => DIRS.map(([dq, dr]) => state.cellByKey.get(hkey(c.q + dq, c.r + dr))).filter(Boolean);
    const related = (a, b) => {
      if (a.nicho !== b.nicho) return false;
      const t = [a.type, b.type].sort().join('-');
      if (t === 'area-nicho') return true;
      if (t === 'area-perfil') { const pc = a.type === 'perfil' ? a : b, ac = a.type === 'area' ? a : b; return person(pc.id)?.areas.includes(ac.id); }
      if (t === 'perfil-perfil') { const pa = person(a.id), pb = person(b.id); return pa && pb && pa.areas.some(x => pb.areas.includes(x)); }
      return false;
    };
    state.cells.forEach(c => neighbors(c).forEach(n => { if (related(c, n)) add(c, n); }));
    // Toda persona queda conectada al menos a una celda de su campo
    state.cells.filter(c => c.type === 'perfil').forEach(c => {
      if (edges.some(([a, b]) => a === c || b === c)) return;
      const n = neighbors(c).filter(x => x.nicho === c.nicho).sort((a, b) => (a.type === 'perfil') - (b.type === 'perfil'))[0];
      if (n) add(c, n);
    });
    state.edges = edges;
  }

  // Conexión = la arista compartida entre dos hexágonos vecinos (corre por el espacio entre ellos),
  // con un punto en cada vértice, como en la referencia gráfica.
  function linkSegments(edges, R, gap, dotR) {
    return edges.map(([a, b]) => {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
      const px = -dy / L * R / 2, py = dx / L * R / 2;
      const x1 = mx + px, y1 = my + py, x2 = mx - px, y2 = my - py;
      return `<g data-a="${a.key}" data-b="${b.key}"><line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/><circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="${dotR}"/><circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="${dotR}"/></g>`;
    }).join('');
  }


  /* =========================================================
     RENDER DEL PANAL
     ========================================================= */
  const world = () => $('#world');
  const peopleInNiche = id => state.perfiles.filter(p => p.nicho === id);
  const peopleInArea = id => state.perfiles.filter(p => p.areas.includes(id));

  function cellHTML(cell) {
    if (cell.type === 'nicho') {
      const n = state.nicheById.get(cell.id), total = peopleInNiche(n.id).length;
      return `<button class="hex" type="button" aria-label="${esc(n.nombre)}, ${plural(total, 'persona', 'personas')}. Ver áreas"><span class="hex__in"><span class="name">${esc(n.nombre)}</span><span class="count">${plural(total, 'persona', 'personas')}</span></span></button>`;
    }
    if (cell.type === 'area') {
      const a = state.areaById.get(cell.id), total = peopleInArea(a.id).length;
      return `<button class="hex" type="button" aria-label="Área ${esc(a.nombre)}, ${plural(total, 'persona', 'personas')}"><span class="hex__in"><span class="name">${esc(a.nombre)}</span><span class="count">${plural(total, 'persona', 'personas')}</span></span></button>`;
    }
    const p = person(cell.id), area = state.areaById.get(p.areas[0]);
    return `<button class="hex" type="button" aria-label="Ver perfil de ${esc(p.nombre)}"><span class="hex__in">${avatarHTML(p)}<span class="name">${esc(p.nombre)}</span>${area ? `<span class="mini-chip">${esc(area.nombre.replace(/^Diseño (de |del )?/i, ''))}</span>` : ''}</span></button>`;
  }

  function renderWorld() {
    const R = HEX_R - HEX_GAP / 2, W = SQRT3 * R, H = 2 * R;
    document.documentElement.style.setProperty('--hexW', `${W}px`);
    document.documentElement.style.setProperty('--hexH', `${H}px`);
    const frag = document.createDocumentFragment();
    state.cells.forEach((cell, i) => {
      const n = state.nicheById.get(cell.nicho);
      const el = document.createElement('div');
      el.className = `cell cell--${cell.type}`;
      if (cell.type === 'perfil' && state.me && cell.id === state.me.id) el.classList.add('is-me');
      el.dataset.type = cell.type; el.dataset.id = cell.id; el.dataset.key = cell.key;
      el.style.cssText = `left:${cell.x - W / 2}px;top:${cell.y - H / 2}px;--c:${n.color};--t:${n.texto};--i:${i}`;
      if (cell.type === 'nicho') el.dataset.tip = tipHTML(n.nombre, peopleInNiche(n.id));
      if (cell.type === 'area') el.dataset.tip = tipHTML(state.areaById.get(cell.id).nombre, peopleInArea(cell.id));
      el.innerHTML = cellHTML(cell);
      cell.el = el;
      frag.appendChild(el);
    });
    $('#cells').replaceChildren(frag);
    $('#links').innerHTML = linkSegments(state.edges, HEX_R, HEX_GAP, 3.4);
    if (state.focus) state.cells.forEach(c => c.el.classList.toggle('in-focus', c.nicho === state.focus));
    updateLinkDim();
  }

  function updateLinkDim() {
    const w = world();
    const focus = w.classList.contains('has-focus'), match = w.classList.contains('has-match');
    $$('#links g').forEach(g => {
      const a = state.cellByKey.get(g.dataset.a)?.el, b = state.cellByKey.get(g.dataset.b)?.el;
      let dim = false;
      if (focus) dim = !(a?.classList.contains('in-focus') && b?.classList.contains('in-focus'));
      if (match) dim = !(a?.classList.contains('is-match') && b?.classList.contains('is-match'));
      g.classList.toggle('is-dim', dim);
    });
  }

  function renderLegend() {
    $('#legend').innerHTML = state.nichos.map(n => `<button type="button" data-nicho="${n.id}" style="--c:${n.color}" title="${esc(n.nombre)}"><i></i><span>${esc(n.corto)}</span></button>`).join('');
  }
  function renderStats() {
    const pill = $('#statPill');
    pill.textContent = `${plural(state.perfiles.length, 'persona', 'personas')} en la red`;
    pill.dataset.tip = tipHTML('Toda la red', state.perfiles);
  }
  function renderNav() {
    const me = state.me;
    $('#greetingHi').textContent = me ? `¡Hola, ${firstName(me.nombre)}!` : '¡Hola!';
    $('#loginBtn').hidden = !!me;
    $('#joinBtn').hidden = !!me;
    $('#meBtn').hidden = !me;
    if (me) $('#meBtn').innerHTML = `${avatarHTML(me)}<span>Mi perfil</span>`;
  }
  function refreshAll() {
    computeLayout();
    world().classList.remove('intro-anim');
    renderWorld(); renderStats(); renderNav();
    if (state.focus) renderNicheCard(state.nicheById.get(state.focus));
    if (state.page === 'proyectos') renderProjects();
  }

  /* =========================================================
     ILUSTRACIONES DE PANAL (introducción y ventana NexoTadeo)
     ========================================================= */
  function wrapWords(text, max) {
    const lines = []; let cur = '';
    String(text).split(' ').forEach(w => {
      if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
    });
    if (cur) lines.push(cur);
    return lines;
  }
  function hexPoly(cx, cy, r) {
    return Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 180 * (60 * k - 90); return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join(' ');
  }
  // spec: celdas {q,r,kind,label,color,text,p}; edges: pares de índices
  function hiveSVG(spec, edges, { R = 70, gap = 14, aspect = 'xMidYMid meet', pad = 30 } = {}) {
    const cells = spec.map(c => ({ ...c, ...toPx(c.q, c.r, R), key: `${c.q},${c.r}` }));
    const rr = R - gap / 2;
    const xs = cells.map(c => c.x), ys = cells.map(c => c.y);
    const x0 = Math.min(...xs) - R - pad, y0 = Math.min(...ys) - R - pad, w = Math.max(...xs) - Math.min(...xs) + 2 * (R + pad), h = Math.max(...ys) - Math.min(...ys) + 2 * (R + pad);
    const body = cells.map((c, i) => {
      const poly = hexPoly(c.x, c.y, rr);
      const d = `style="animation-delay:${(i * 60)}ms"`;
      if (c.kind === 'empty') return `<polygon class="h" points="${poly}" fill="#fff" stroke="#CDD4E8" stroke-width="1" ${d}/>`;
      if (c.kind === 'niche') {
        const lines = wrapWords(c.label, 12);
        return `<g class="h" ${d}><polygon points="${poly}" fill="${c.color}"/>${lines.map((l, k) => `<text x="${c.x}" y="${c.y + (k - (lines.length - 1) / 2) * 15 + 4}" text-anchor="middle" font-size="12" font-weight="500" fill="${c.text || '#fff'}">${esc(l)}</text>`).join('')}</g>`;
      }
      if (c.kind === 'area') {
        const lines = wrapWords(c.label, 13);
        return `<g class="h" ${d}><polygon points="${poly}" fill="${c.fill || '#F2F5FF'}" stroke="#CDD4E8" stroke-width="1"/>${lines.map((l, k) => `<text x="${c.x}" y="${c.y + (k - (lines.length - 1) / 2) * 15 - (c.arrow ? 6 : 0) + 4}" text-anchor="middle" font-size="11.5" fill="#1F1F1F">${esc(l)}</text>`).join('')}${c.arrow ? `<text x="${c.x}" y="${c.y + lines.length * 8 + 14}" text-anchor="middle" font-size="13" fill="#6A6E83">→</text>` : ''}</g>`;
      }
      // persona
      const hl = c.kind === 'me';
      const fg = hl ? '#fff' : '#1F1F1F', sub = hl ? '#D3DEFF' : '#6A6E83';
      return `<g class="h" ${d}><polygon points="${poly}" fill="${hl ? '#5A81FA' : '#fff'}" stroke="${hl ? '#5A81FA' : '#CDD4E8'}" stroke-width="1"/>
        <circle cx="${c.x}" cy="${c.y - 24}" r="17" fill="${hl ? '#fff' : '#F2F5FF'}"/>
        <text x="${c.x}" y="${c.y - 19.5}" text-anchor="middle" font-size="12" font-weight="500" fill="#2C3D8F">${esc(initials(c.label))}</text>
        <text x="${c.x}" y="${c.y + 10}" text-anchor="middle" font-size="11.5" font-weight="500" fill="${fg}">${esc(c.label)}</text>
        <text x="${c.x}" y="${c.y + 25}" text-anchor="middle" font-size="9.5" fill="${sub}">${esc(c.sub || '')}</text>
        ${c.chip ? `<rect x="${c.x - 38}" y="${c.y + 33}" width="76" height="15" rx="7.5" fill="none" stroke="${hl ? '#D3DEFF' : '#CDD4E8'}"/><text x="${c.x}" y="${c.y + 43.5}" text-anchor="middle" font-size="8" fill="${sub}">${esc(c.chip)}</text>` : ''}</g>`;
    }).join('');
    const lnk = linkSegments(edges.map(([a, b]) => [cells[a], cells[b]]), R, gap, 3.2)
      .replace(/<line /g, '<line stroke="#5A81FA" stroke-width="1.5" stroke-linecap="round" ').replace(/<circle /g, '<circle fill="#5A81FA" ');
    return `<svg class="hive" viewBox="${x0} ${y0} ${w} ${h}" preserveAspectRatio="${aspect}" font-family="Poppins, sans-serif"><style>.h{animation:hexIn .7s cubic-bezier(.16,1,.3,1) backwards;transform-box:fill-box;transform-origin:center}</style>${lnk}${body}</svg>`;
  }

  function seedPerson(i) { const p = state.perfiles[i] || { nombre: 'Luisa Hernández', rol: 'estudiante', semestre: 8 }; return p; }

  function renderIntro() {
    const a = seedPerson(0), b = state.perfiles.find(p => p.rol === 'egresado') || seedPerson(1);
    const areaChip = p => { const t = (state.areaById.get(p.areas?.[0])?.nombre || '').replace(/^Diseño (de |del )?/i, '').split(',')[0]; return t.length > 16 ? t.slice(0, 15) + '…' : t; };
    const spec = [
      { q: 0, r: 0, kind: 'me', label: a.nombre, sub: roleLabel(a), chip: areaChip(a) },          // 0
      { q: 1, r: 0, kind: 'empty' },                                                                // 1
      { q: -1, r: 1, kind: 'area', label: 'Mobiliario', arrow: true },                            // 2
      { q: 0, r: 1, kind: 'person', label: b.nombre, sub: roleLabel(b), chip: areaChip(b) },        // 3
      { q: -1, r: 2, kind: 'area', label: 'Diseño Estratégico y UX', arrow: true },              // 4
      { q: 0, r: 2, kind: 'area', label: 'Manufactura e Industria', arrow: true },                // 5
      { q: 1, r: 1, kind: 'area', label: 'Empaques', arrow: true },                               // 6
      { q: -1, r: 0, kind: 'empty' },                                                               // 7
      { q: 1, r: -1, kind: 'empty' },                                                               // 8
      { q: 2, r: -1, kind: 'area', label: 'Diseño de Servicios', fill: '#fff' },                  // 9
      { q: 1, r: 2, kind: 'empty' },                                                                // 10
      { q: -2, r: 2, kind: 'empty' },                                                               // 11
      { q: 2, r: 0, kind: 'empty' }                                                                 // 12
    ];
    const edges = [[0, 3], [0, 2], [3, 5], [3, 6], [2, 4], [4, 5], [0, 1], [1, 9], [6, 12], [5, 10], [4, 11], [0, 8]];
    $('#introHive').innerHTML = hiveSVG(spec, edges, { R: 92, gap: 18, aspect: 'xMidYMid meet', pad: 40 });
  }

  function renderAbout() {
    const nn = id => state.nicheById.get(id);
    const ppl = state.perfiles.slice(0, 6);
    const shortName = n => { const w = n.split(/\s+/); return w.length > 2 ? `${w[0]} ${w[w.length - 1]}` : n; };
    const P = (q, r, i) => { const p = ppl[i] || ppl[0]; return { q, r, kind: 'person', label: shortName(p.nombre), sub: roleLabel(p).replace(' semestre', '') }; };
    const N = (q, r, id) => { const n = nn(id); return { q, r, kind: 'niche', label: n.nombre, color: n.color, text: n.texto }; };
    const spec = [
      N(0, 0, 'producto'), N(-1, 0, 'servicios'), N(-1, 1, 'gestion'),                   // 0-2
      { q: 1, r: -1, kind: 'area', label: 'Diseño de Objetos' },                          // 3
      { q: 1, r: 0, kind: 'area', label: 'Diseño de Mobiliario' },                        // 4
      { q: 0, r: -1, kind: 'area', label: 'Diseño de Empaques' },                         // 5
      P(2, -2, 0), P(1, -2, 1), P(2, -1, 2), P(2, 0, 3), P(1, 1, 4), P(0, 1, 5),          // 6-11
      { q: -1, r: -1, kind: 'empty' }, { q: 3, r: -1, kind: 'empty' }, { q: 0, r: 2, kind: 'empty' } // 12-14
    ];
    const edges = [[0, 3], [0, 4], [0, 5], [0, 1], [1, 2], [3, 6], [3, 7], [3, 8], [4, 9], [4, 10], [0, 11], [5, 7], [8, 13], [10, 14], [1, 12]];
    $('#aboutBody').innerHTML = `
      <div class="about__text">
        <h2 id="aboutTitle">Nexo<span>Tadeo</span></h2>
        <p>La plataforma busca garantizar la continuidad y evolución de la estrategia para atraer y conectar el ecosistema de Diseñadores Industriales mediante un producto digital que funcione como una <strong>red de gestión de conocimiento</strong> fortaleciendo la articulación entre estudiantes, egresados, academia y entorno productivo.</p>
        <ul class="pillars">
          <li><strong>Unión</strong><p>Entre personas, conocimientos, habilidades y experiencias que al relacionarse, pueden dar origen a nuevas soluciones y proyectos.</p></li>
          <li><strong>Conexión</strong><p>Las conexiones permiten identificar afinidades entre las capacidades de los diseñadores y las necesidades de cada proyecto, generando oportunidades de colaboración.</p></li>
          <li><strong>Expansión</strong><p>Cada persona amplía sus posibilidades al visibilizar su talento y conectar con nuevos actores, proyectos y escenarios profesionales.</p></li>
        </ul>
      </div>
      <div class="about__hive">${hiveSVG(spec, edges, { R: 70, gap: 16, aspect: 'xMidYMid meet', pad: 24 })}</div>`;
  }

  function runIntro() {
    const intro = $('#intro');
    renderIntro();
    let done = false;
    const hide = () => {
      if (done) return; done = true;
      intro.classList.add('is-out');
      setTimeout(() => world().classList.remove('intro-anim'), 2000);
    };
    const t = setTimeout(hide, 5000);
    $('#introEnter').addEventListener('click', () => { clearTimeout(t); hide(); });
  }

  /* =========================================================
     TOOLTIP
     ========================================================= */
  function setupTooltip() {
    const tip = $('#tip');
    let current = null;
    const place = (x, y) => {
      const r = tip.getBoundingClientRect();
      tip.style.left = `${clamp(x + 14, 8, innerWidth - r.width - 8)}px`;
      tip.style.top = `${y + 18 + r.height > innerHeight ? y - r.height - 12 : y + 18}px`;
    };
    document.addEventListener('pointerover', e => {
      if (e.pointerType !== 'mouse') return;
      const t = e.target.closest('[data-tip]');
      if (t === current) return;
      current = t;
      if (!t || $('#viewport').classList.contains('is-dragging')) { tip.classList.remove('is-show'); return; }
      tip.innerHTML = t.dataset.tip; tip.classList.add('is-show'); place(e.clientX, e.clientY);
    });
    document.addEventListener('pointermove', e => {
      if (!current) return;
      if ($('#viewport').classList.contains('is-dragging')) { tip.classList.remove('is-show'); return; }
      place(e.clientX, e.clientY);
    });
    const pill = $('#statPill');
    pill.addEventListener('focus', () => { const r = pill.getBoundingClientRect(); tip.innerHTML = pill.dataset.tip; tip.classList.add('is-show'); place(r.left, r.bottom - 10); });
    pill.addEventListener('blur', () => tip.classList.remove('is-show'));
  }

  /* =========================================================
     CÁMARA: ZOOM Y ARRASTRE
     ========================================================= */
  function applyView(animate = false) {
    const w = world(), { x, y, s } = state.view;
    if (animate) { w.classList.add('animating'); clearTimeout(applyView.t); applyView.t = setTimeout(() => w.classList.remove('animating'), 600); }
    w.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
    $('#zoomLevel').textContent = `${Math.round(s * 100)}%`;
  }
  function safeArea() {
    const vp = $('#viewport').getBoundingClientRect();
    const vw = vp.width || innerWidth, vh = vp.height || innerHeight - 76;
    const top = vw <= 680 ? 110 : 150;
    let left = 28, right = 28, bottom = 84;
    if (state.focus && vw > 900) left = 390;
    if (state.focus && vw <= 900) bottom = Math.min(vh * 0.46, 380) + 90;
    return { left, top, width: vw - left - right, height: vh - top - bottom };
  }
  function bboxOf(cells) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    cells.forEach(c => { x0 = Math.min(x0, c.x - HEX_R); x1 = Math.max(x1, c.x + HEX_R); y0 = Math.min(y0, c.y - HEX_R); y1 = Math.max(y1, c.y + HEX_R); });
    return { x0, y0, x1, y1 };
  }
  function fitTo(cells, animate = true, maxS = 1.4) {
    if (!cells.length) return;
    const b = bboxOf(cells), a = safeArea();
    const s = clamp(Math.min(a.width / (b.x1 - b.x0), a.height / (b.y1 - b.y0)), MIN_S, maxS);
    state.view = { s, x: a.left + a.width / 2 - (b.x0 + b.x1) / 2 * s, y: a.top + a.height / 2 - (b.y0 + b.y1) / 2 * s };
    applyView(animate);
  }
  const fitAll = (animate = true) => fitTo(state.cells, animate, 1);
  function centerOn(cell, minS = 1.2) {
    const s = Math.max(state.view.s, minS), a = safeArea();
    state.view = { s, x: a.left + a.width / 2 - cell.x * s, y: a.top + a.height / 2 - cell.y * s };
    applyView(true);
  }
  function zoomAt(factor, px, py, animate = false) {
    const vp = $('#viewport').getBoundingClientRect();
    px = (px ?? vp.left + vp.width / 2) - vp.left; py = (py ?? vp.top + vp.height / 2) - vp.top;
    const v = state.view, s = clamp(v.s * factor, MIN_S, MAX_S), k = s / v.s;
    state.view = { s, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    applyView(animate);
  }

  function setupCamera() {
    const vp = $('#viewport');
    const pointers = new Map();
    let start = null, pinch = null;
    vp.addEventListener('wheel', e => { e.preventDefault(); zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX, e.clientY); }, { passive: false });
    vp.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      state.dragMoved = false;
      if (pointers.size === 1) start = { x: e.clientX, y: e.clientY, vx: state.view.x, vy: state.view.y };
      else if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: state.view.s }; }
    });
    window.addEventListener('pointermove', e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2 && pinch) {
        const [a, b] = [...pointers.values()];
        zoomAt(clamp(pinch.s * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, MIN_S, MAX_S) / state.view.s, (a.x + b.x) / 2, (a.y + b.y) / 2);
        state.dragMoved = true; return;
      }
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!state.dragMoved && Math.hypot(dx, dy) < 5) return;
      state.dragMoved = true;
      vp.classList.add('is-dragging');
      state.view.x = start.vx + dx; state.view.y = start.vy + dy;
      applyView(false);
    });
    const end = e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 1) { const [p] = [...pointers.values()]; start = { x: p.x, y: p.y, vx: state.view.x, vy: state.view.y }; }
      if (pointers.size === 0) { start = null; vp.classList.remove('is-dragging'); setTimeout(() => { state.dragMoved = false; }, 0); }
    };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    vp.addEventListener('click', e => {
      if (state.dragMoved) return;
      const cellEl = e.target.closest('.cell');
      if (!cellEl) return;
      const { type, id } = cellEl.dataset;
      if (type === 'nicho') focusNiche(id); else if (type === 'area') onAreaClick(id); else openProfile(id);
    });
    $('#zoomIn').addEventListener('click', () => zoomAt(1.25, undefined, undefined, true));
    $('#zoomOut').addEventListener('click', () => zoomAt(0.8, undefined, undefined, true));
    $('#zoomFit').addEventListener('click', () => state.focus ? closeFocus() : fitAll());
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (state.page === 'panal') state.focus ? fitTo(focusCells(state.focus), true, 1.5) : fitAll(true); }, 150); });
  }

  /* =========================================================
     VISTA ACERCADA DE UN CAMPO
     ========================================================= */
  const focusCells = id => state.cells.filter(c => c.nicho === id);
  function focusNiche(id) {
    const n = state.nicheById.get(id);
    if (!n) return;
    clearMatch();
    state.focus = id;
    world().classList.add('has-focus');
    state.cells.forEach(c => c.el.classList.toggle('in-focus', c.nicho === id));
    $$('#legend button').forEach(b => b.classList.toggle('is-active', b.dataset.nicho === id));
    updateLinkDim();
    renderNicheCard(n);
    requestAnimationFrame(() => fitTo(focusCells(id), true, 1.5));
  }
  function closeFocus(refit = true) {
    state.focus = null;
    world().classList.remove('has-focus');
    state.cells.forEach(c => c.el.classList.remove('in-focus'));
    $$('#legend button').forEach(b => b.classList.remove('is-active'));
    const card = $('#nicheCard');
    card.classList.remove('is-open'); card.setAttribute('aria-hidden', 'true');
    clearMatch();
    if (refit) fitAll(true);
  }
  function renderNicheCard(n) {
    const card = $('#nicheCard'), members = peopleInNiche(n.id);
    card.style.cssText = `--c:${n.color};--t:${n.texto}`;
    card.innerHTML = `
      <button class="btn btn--ghost btn--sm" type="button" data-back>← Volver al mapa general</button>
      <div class="nc-head"><span class="nc-swatch"></span><h2 id="nicheTitle">${esc(n.nombre)}</h2></div>
      <p class="desc">${esc(n.descripcion)}</p>
      <h3><span>Áreas</span><span>Personas</span></h3>
      <ul class="area-list">${n.areas.map(a => { const l = peopleInArea(a.id); return `<li><button type="button" data-area="${a.id}" data-tip="${esc(tipHTML(a.nombre, l))}"><i></i>${esc(a.nombre)}<span class="n">${l.length}</span></button></li>`; }).join('')}</ul>
      <h3><span data-tip="${esc(tipHTML(n.nombre, members))}">${plural(members.length, 'persona', 'personas')}</span></h3>
      <div class="face-row">${members.map(p => `<button type="button" data-profile="${p.id}" title="${esc(p.nombre)}">${avatarHTML(p)}</button>`).join('') || '<p class="desc">Aún no hay personas aquí.</p>'}</div>`;
    card.classList.add('is-open'); card.setAttribute('aria-hidden', 'false');
  }
  function onAreaClick(areaId) {
    const a = state.areaById.get(areaId);
    if (!a) return;
    if (state.focus !== a.nicho) focusNiche(a.nicho);
    const already = $(`#nicheCard [data-area="${areaId}"]`)?.classList.contains('is-active');
    $$('#nicheCard [data-area]').forEach(b => b.classList.toggle('is-active', !already && b.dataset.area === areaId));
    if (already) { clearMatch(); return; }
    const list = peopleInArea(areaId), ids = new Set(list.map(p => p.id));
    highlight(c => (c.type === 'perfil' && ids.has(c.id)) || (c.type === 'area' && c.id === areaId) || (c.type === 'nicho' && c.id === a.nicho));
    const b = breakdown(list);
    toast(b.total ? `${a.nombre}: ${plural(b.total, 'persona', 'personas')} (${b.egr} egresados, ${b.est} estudiantes)` : `${a.nombre}: aún sin personas`);
  }
  function highlight(pred) {
    let any = false;
    state.cells.forEach(c => { const m = pred(c); c.el.classList.toggle('is-match', m); any = any || m; });
    world().classList.toggle('has-match', any);
    updateLinkDim();
    return any;
  }
  function clearMatch() {
    world().classList.remove('has-match');
    state.cells.forEach(c => c.el?.classList.remove('is-match'));
    updateLinkDim();
  }

  /* =========================================================
     PROYECTOS: utilidades
     ========================================================= */
  const published = () => state.proyectos.filter(p => !p.borrador);
  const projectsOf = id => published().filter(p => p.autor === id || p.participantes.includes(id));
  const draftsOf = id => state.proyectos.filter(p => p.borrador && p.autor === id);
  const teamOf = p => [p.autor, ...p.participantes.filter(x => x !== p.autor)].map(person).filter(Boolean);
  function projectNiche(p) {
    const a = state.areaById.get(p.areas?.[0]);
    return state.nicheById.get(a ? a.nicho : person(p.autor)?.nicho) || state.nichos[0];
  }
  const sectorName = id => state.sectorById.get(id)?.nombre || 'Sin sector';
  const estadoName = e => e === 'finalizado' ? 'Finalizado' : 'En ejecución';

  function saveProject(p) {
    p.actualizado = new Date().toISOString();
    const i = state.proyectos.findIndex(x => x.id === p.id);
    if (i >= 0) state.proyectos[i] = p; else state.proyectos.push(p);
    return store.patch(d => {
      d.proyectos = d.proyectos || [];
      const j = d.proyectos.findIndex(x => x.id === p.id);
      if (j >= 0) d.proyectos[j] = p; else d.proyectos.push(p);
    });
  }
  function deleteProject(id) {
    state.proyectos = state.proyectos.filter(p => p.id !== id);
    store.patch(d => {
      d.proyectos = (d.proyectos || []).filter(p => p.id !== id);
      d.deletedProjects = [...new Set([...(d.deletedProjects || []), id])];
    });
  }

  /* =========================================================
     VISTA PROYECTOS (tarjetas que se apilan al hacer scroll)
     ========================================================= */
  function setView(v) {
    state.page = v;
    $$('.tabs__btn').forEach(b => { const on = b.dataset.view === v; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    $('#viewPanal').hidden = v !== 'panal';
    $('#viewProyectos').hidden = v !== 'proyectos';
    if (v === 'proyectos') renderProjects();
    else requestAnimationFrame(() => { state.focus ? fitTo(focusCells(state.focus), false, 1.5) : fitAll(false); });
    const h = v === 'proyectos' ? '#proyectos' : '';
    if (location.hash !== h) history.replaceState(null, '', h || location.pathname + location.search);
  }

  function thumbsHTML(p, n = 3) {
    const imgs = (p.imagenes || []).slice(0, n);
    const tiles = imgs.map(src => `<div class="thumb"><img src="${esc(src)}" alt=""></div>`);
    const areaNames = (p.areas || []).map(a => state.areaById.get(a)?.nombre).filter(Boolean);
    let i = 0;
    while (tiles.length < n) {
      const label = areaNames[i] || [sectorName(p.sector), estadoName(p.estado), `${teamOf(p).length} personas`][i % 3];
      tiles.push(`<div class="thumb ${i % 2 ? 'thumb--soft' : ''}"><svg viewBox="0 0 100 100">${HEX_PATH}</svg><span>${esc(label)}</span></div>`);
      i++;
    }
    return tiles.join('');
  }

  function renderProjects() {
    const f = state.filter;
    const all = published();
    $('#sectorFilter').innerHTML = [`<button type="button" data-sector="" class="${!f.sector ? 'is-active' : ''}">Todos los sectores<span class="n">${all.length}</span></button>`,
      ...state.sectores.map(s => { const n = all.filter(p => p.sector === s.id).length; return `<button type="button" data-sector="${s.id}" class="${f.sector === s.id ? 'is-active' : ''}">${esc(s.nombre)}<span class="n">${n}</span></button>`; })].join('');
    $$('#statusFilter button').forEach(b => b.classList.toggle('is-active', b.dataset.estado === f.estado));
    const list = all.filter(p => (!f.sector || p.sector === f.sector) && (!f.estado || p.estado === f.estado))
      .sort((a, b) => (b.creado || '').localeCompare(a.creado || ''));
    $('#projectStack').innerHTML = list.length ? list.map((p, i) => {
      const n = projectNiche(p), team = teamOf(p), lead = team[0];
      return `<div class="pcard-wrap" style="--k:${Math.min(i, 6)}">
        <article class="pcard" style="--c:${n.color};--t:${n.texto}" data-project="${p.id}" tabindex="0" role="button" aria-label="Ver proyecto ${esc(p.titulo)}">
          <span class="pcard__idx">(${String(i + 1).padStart(2, '0')})</span>
          <div class="pcard__left">
            <h3 class="pcard__title">${esc(p.titulo)}</h3>
            <div class="pcard__meta"><span class="pchip pchip--solid">${esc(sectorName(p.sector))}</span><span class="pchip">${estadoName(p.estado)}</span>${p.enviado ? '<span class="pchip">Propuesta enviada</span>' : ''}</div>
            <p class="pcard__desc">${esc(p.descripcion)}</p>
            <div class="pcard__team"><span class="faces">${team.slice(0, 5).map(avatarHTML).join('')}</span><span>${esc(lead?.nombre || '')}${team.length > 1 ? ` y ${plural(team.length - 1, 'persona más', 'personas más')}` : ''}</span></div>
          </div>
          <div class="pcard__right">
            <div class="thumbs">${thumbsHTML(p)}</div>
            <span class="btn btn--sm pcard__cta">Ver proyecto</span>
          </div>
        </article></div>`;
    }).join('') : `<div class="empty">No hay proyectos ${f.sector ? `en ${esc(sectorName(f.sector))}` : ''} ${f.estado ? `(${estadoName(f.estado).toLowerCase()})` : ''} todavía.<br><br><button class="btn btn--primary btn--sm" type="button" data-new-project>Publicar el primero</button></div>`;
    stackEffect();
  }

  // Escala las tarjetas que quedan detrás mientras la siguiente se apila encima
  function stackEffect() {
    const wraps = $$('#projectStack .pcard-wrap');
    wraps.forEach((w, i) => {
      const card = w.firstElementChild, next = wraps[i + 1];
      if (!next) { card.style.setProperty('--sc', 1); return; }
      const top = parseFloat(getComputedStyle(w).top) || 0;
      const vpTop = $('#viewProyectos').getBoundingClientRect().top;
      const d = next.getBoundingClientRect().top - vpTop - top;
      const t = clamp(1 - d / Math.max(card.offsetHeight, 1), 0, 1);
      card.style.setProperty('--sc', (1 - 0.06 * t).toFixed(4));
    });
  }

  function openProjectDetail(id) {
    const p = state.proyectos.find(x => x.id === id);
    if (!p) return;
    const n = projectNiche(p), team = teamOf(p), mine = state.me && p.autor === state.me.id;
    const areas = (p.areas || []).map(a => state.areaById.get(a)).filter(Boolean);
    $('#pdBody').innerHTML = `
      <div class="pd__hero" style="--c:${n.color};--t:${n.texto}">
        <div class="pcard__meta" style="margin:0"><span class="pchip pchip--solid">${esc(sectorName(p.sector))}</span><span class="pchip">${estadoName(p.estado)}</span></div>
        <h2>${esc(p.titulo)}</h2>
      </div>
      <div class="pd__body">
        <p>${esc(p.descripcion)}</p>
        ${(p.imagenes || []).length ? `<div class="pd__gallery" style="--c:${n.color};--t:${n.texto}">${p.imagenes.map(s => `<div class="thumb"><img src="${esc(s)}" alt=""></div>`).join('')}</div>` : ''}
        ${areas.length ? `<div class="pf-section"><h4>Áreas de diseño</h4><div class="chips">${areas.map(a => `<span class="chip chip--soft" style="--c:${state.nicheById.get(a.nicho).color}"><i></i>${esc(a.nombre)}</span>`).join('')}</div></div>` : ''}
        <div class="pf-section"><h4>Equipo · ${team.length}</h4><div class="pd__team">${team.map((t, i) => `<button class="pd__person" type="button" data-open="${t.id}">${avatarHTML(t)}<span><strong>${esc(t.nombre)}${i === 0 ? ' · líder' : ''}</strong><small>${esc(roleLabel(t))}</small></span></button>`).join('')}</div></div>
        ${(p.enlaces || []).length ? `<div class="pf-section"><h4>Enlaces</h4><div class="plinks">${p.enlaces.map(u => linkCard(u, false)).join('')}</div></div>` : ''}
        ${p.enviado ? `<p class="badge-sent" style="margin-top:18px">${icon('check')} Propuesta enviada a la universidad el ${fmtDate(p.enviado)}</p>` : ''}
        <div class="pd__actions">
          ${mine ? `<button class="btn btn--primary" type="button" data-edit="${p.id}">Gestionar proyecto</button>` : `<a class="btn btn--primary" href="mailto:${team.map(t => t.correo).filter(Boolean).join(',')}?subject=${encodeURIComponent('Sobre tu proyecto en NexoTadeo: ' + p.titulo)}">Contactar al equipo</a>`}
          <button class="btn btn--outline" type="button" data-pdf="${p.id}">Descargar brief (PDF)</button>
          ${mine ? `<button class="btn btn--danger-ghost" type="button" data-del-project="${p.id}">Eliminar proyecto</button>` : ''}
        </div>
      </div>`;
    openModal('#pdModal');
  }

  /* =========================================================
     PERFIL DETALLADO
     ========================================================= */
  const SOCIAL = {
    linkedin: { label: 'LinkedIn', badge: 'in', test: /linkedin\.com/i },
    behance: { label: 'Behance', badge: 'Bē', test: /behance\.net/i },
    instagram: { label: 'Instagram', badge: 'IG', test: /instagram\.com/i }
  };
  const socialOf = url => Object.keys(SOCIAL).find(k => SOCIAL[k].test.test(url)) || 'web';
  function normalizeUrl(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch { return ''; }
  }
  function embedUrl(url) {
    let m;
    if ((m = url.match(/behance\.net\/gallery\/(\d+)/i))) return `https://www.behance.net/embed/project/${m[1]}?ilo0=1`;
    if ((m = url.match(/instagram\.com\/(p|reel)\/([\w-]+)/i))) return `https://www.instagram.com/${m[1]}/${m[2]}/embed`;
    if ((m = url.match(/linkedin\.com\/.*(urn:li:(?:share|ugcPost|activity):\d+)/i))) return `https://www.linkedin.com/embed/feed/update/${m[1]}`;
    if ((m = url.match(/linkedin\.com\/posts\/.*activity-(\d+)/i))) return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${m[1]}`;
    return null;
  }
  function linkCard(url, removable) {
    const kind = socialOf(url), meta = SOCIAL[kind] || { label: 'Enlace', badge: icon('link') };
    let host = url;
    try { const u = new URL(url); host = u.hostname.replace(/^www\./, '') + u.pathname.replace(/\/$/, ''); } catch { /* */ }
    const rm = removable ? `<button class="rm" type="button" data-rm="${esc(url)}" aria-label="Quitar enlace">${icon('x')}</button>` : '';
    const emb = embedUrl(url);
    if (!emb) return `<a class="plink" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><span class="sbadge sbadge--${kind}">${meta.badge}</span><span><strong>${meta.label}</strong><small>${esc(host)}</small></span>${rm || `<span class="arrow">${icon('arrow')}</span>`}</a>`;
    return `<div class="embed"><div class="embed__bar"><span class="sbadge sbadge--${kind}">${meta.badge}</span>${meta.label}<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Abrir</a>${rm}</div><iframe src="${esc(emb)}" loading="lazy" allowfullscreen title="Publicación de ${meta.label}"></iframe></div>`;
  }

  function miniProjectHTML(p, draft = false) {
    const n = projectNiche(p);
    return `<div class="mini-pj" style="--c:${n.color}"><i></i>
      <button type="button" data-${draft ? 'edit' : 'project'}="${p.id}" style="all:unset;cursor:pointer;min-width:0"><strong>${esc(p.titulo || 'Proyecto sin título')}</strong><small>${esc(sectorName(p.sector))} · ${draft ? `Editado ${fmtDate(p.actualizado || p.creado)}` : estadoName(p.estado)}</small></button>
      <span class="act">${draft ? `<button class="btn btn--light btn--xs" type="button" data-edit="${p.id}">Continuar</button><button class="rm" type="button" data-del-draft="${p.id}" aria-label="Eliminar borrador">${icon('x')}</button>` : ''}</span></div>`;
  }

  let lastFocusEl = null;
  function openProfile(id, tab = 'perfil') {
    const p = person(id);
    if (!p) return;
    const n = state.nicheById.get(p.nicho), mine = isMe(p);
    const drawer = $('#drawer');
    if (!drawer.classList.contains('is-open')) lastFocusEl = document.activeElement;
    drawer.style.cssText = `--c:${n.color};--t:${n.texto}`;
    const socials = Object.entries(p.portafolio || {}).filter(([, v]) => v);
    const pjs = projectsOf(p.id), drafts = mine ? draftsOf(p.id) : [];
    $('#drawerBody').innerHTML = `
      <div class="pf-cover" style="${p.banner ? `background-image:url('${esc(p.banner)}')` : ''}">
        ${mine ? `<button class="btn btn--light btn--xs pf-cover__btn" type="button" data-change="banner">${icon('cam')} Cambiar portada</button>` : ''}
      </div>
      <div class="pf-main">
        <div class="pf-photo">${avatarHTML(p)}${mine ? `<button class="pf-photo__btn" type="button" data-change="avatar" aria-label="Cambiar foto de perfil">${icon('cam')}</button>` : ''}</div>
        <h2 class="pf-name">${esc(p.nombre)}${mine ? ' <span class="muted" style="font-size:14px">(tú)</span>' : ''}</h2>
        <p class="pf-role">${esc(roleLabel(p))}</p>
        ${p.ciudad ? `<p class="pf-meta">${icon('pin')}${esc(p.ciudad)}</p>` : ''}
        <div class="seg pf-tabs" role="tablist">
          <button type="button" data-pf-tab="perfil">Perfil</button>
          <button type="button" data-pf-tab="proyectos">Proyectos · ${pjs.length}</button>
          ${mine ? `<button type="button" data-pf-tab="borradores">Borradores · ${drafts.length}</button>` : ''}
        </div>

        <div class="pf-pane" data-pane="perfil">
          ${p.bio ? `<p class="pf-bio">${esc(p.bio)}</p>` : ''}
          <div class="pf-section"><h4>Campo</h4><div class="chips"><span class="chip chip--soft"><i></i>${esc(n.nombre)}</span></div></div>
          ${p.areas.length ? `<div class="pf-section"><h4>Áreas</h4><div class="chips">${p.areas.map(a => `<span class="chip chip--soft">${esc(state.areaById.get(a).nombre)}</span>`).join('')}</div></div>` : ''}
          ${(p.habilidades || []).length ? `<div class="pf-section"><h4>Habilidades</h4><div class="chips">${p.habilidades.map(h => `<span class="chip">${esc(h)}</span>`).join('')}</div></div>` : ''}
          <div class="pf-section"><h4>Portafolio</h4>
            <div class="plinks" id="pfLinks">${socials.map(([, u]) => linkCard(u, false)).join('')}${p.links.map(u => linkCard(u, mine)).join('')}${!socials.length && !p.links.length ? '<p class="pf-meta">Aún no hay enlaces de portafolio.</p>' : ''}</div>
            ${mine ? `<div class="dropzone" id="dropzone"><p>Arrastra aquí el enlace de un proyecto o publicación de Instagram, Behance o LinkedIn, o pégalo abajo.</p><form id="linkForm"><input id="linkInput" type="url" placeholder="https://www.behance.net/gallery/…" aria-label="Enlace de portafolio"><button class="btn btn--primary btn--sm" type="submit">Añadir</button></form></div>` : ''}
          </div>
          <div class="pf-actions">
            ${!mine && p.correo ? `<a class="btn btn--primary" href="mailto:${esc(p.correo)}?subject=${encodeURIComponent('Hola desde NexoTadeo')}">Contactar</a>` : ''}
            <button class="btn btn--outline" type="button" data-locate="${p.id}">Ver en la red</button>
          </div>
          ${!mine && p.correo ? `<p class="pf-contact">${esc(p.correo)}</p>` : ''}
          ${mine ? `<div class="pf-account"><h4 class="eyebrow" style="margin-bottom:10px">Cuenta</h4><div class="row"><button class="btn btn--outline" type="button" data-logout>Cerrar sesión</button><button class="btn btn--danger-ghost" type="button" data-delete-me>Eliminar mi perfil</button></div></div>` : ''}
        </div>

        <div class="pf-pane" data-pane="proyectos">
          ${mine ? '<button class="btn btn--primary btn--block" type="button" data-new-project style="margin-top:16px">Publicar proyecto</button>' : ''}
          ${pjs.length ? `<div class="mini-list">${pjs.map(x => miniProjectHTML(x)).join('')}</div>` : `<p class="mini-empty">${mine ? 'Publica proyectos que estés ejecutando o que ya terminaste y menciona a tu equipo.' : 'Aún no participa en proyectos publicados.'}</p>`}
        </div>

        ${mine ? `<div class="pf-pane" data-pane="borradores">
          ${drafts.length ? `<div class="mini-list">${drafts.map(x => miniProjectHTML(x, true)).join('')}</div>` : '<p class="mini-empty">No tienes borradores. Lo que guardes sin publicar (o lo que armes con Cabito) aparecerá aquí.</p>'}
        </div>` : ''}
      </div>`;
    setProfileTab(tab);
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.dataset.person = p.id;
    $('#drawerScrim').classList.add('is-open');
    $('#drawerBody').scrollTop = 0;
    setTimeout(() => $('#drawerClose').focus({ preventScroll: true }), 300);
    if (mine) bindDropzone(p);
  }
  function setProfileTab(tab) {
    if (!$(`#drawerBody [data-pane="${tab}"]`)) tab = 'perfil';
    $$('#drawerBody [data-pf-tab]').forEach(b => b.classList.toggle('is-active', b.dataset.pfTab === tab));
    $$('#drawerBody [data-pane]').forEach(p => p.classList.toggle('is-active', p.dataset.pane === tab));
  }
  function closeProfile() {
    const drawer = $('#drawer');
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true');
    $('#drawerScrim').classList.remove('is-open');
    lastFocusEl?.focus?.({ preventScroll: true });
  }
  function bindDropzone(p) {
    const dz = $('#dropzone');
    const add = raw => {
      const url = normalizeUrl(raw);
      if (!url) { toast('Ese enlace no parece válido'); return; }
      if (p.links.includes(url) || Object.values(p.portafolio || {}).includes(url)) { toast('Ese enlace ya está en tu portafolio'); return; }
      p.links.push(url);
      store.patch(d => { d.links = d.links || {}; d.links[p.id] = p.links; });
      openProfile(p.id);
      toast(`Enlace de ${SOCIAL[socialOf(url)]?.label || 'portafolio'} añadido`);
    };
    ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, () => dz.classList.remove('is-over')));
    dz.addEventListener('drop', e => { e.preventDefault(); const t = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain'); add((t || '').split('\n').find(l => l && !l.startsWith('#'))); });
    $('#linkForm').addEventListener('submit', e => { e.preventDefault(); add($('#linkInput').value); });
    $$('#pfLinks [data-rm]').forEach(b => b.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      p.links = p.links.filter(u => u !== b.dataset.rm);
      store.patch(d => { d.links = d.links || {}; d.links[p.id] = p.links; });
      openProfile(p.id);
    }));
  }

  // Cambiar foto de perfil o portada (solo el perfil propio)
  async function changeImage(kind, file) {
    const me = state.me;
    if (!me || !file) return;
    try {
      const data = kind === 'avatar' ? await resizeImage(file, 280, 280) : await resizeImage(file, 1000, 320);
      const key = kind === 'avatar' ? 'foto' : 'banner';
      me[key] = data;
      const ok = store.patch(d => {
        const u = (d.usuarios || []).find(x => x.id === me.id);
        if (u) u[key] = data;
        else { d.overrides = d.overrides || {}; d.overrides[me.id] = { ...(d.overrides[me.id] || {}), [key]: data }; }
      });
      if (!ok) return;
      refreshAll();
      openProfile(me.id);
      toast(kind === 'avatar' ? 'Foto de perfil actualizada' : 'Portada actualizada');
    } catch { toast('No se pudo leer esa imagen'); }
  }

  function locateProfile(id) {
    const cell = state.profileCell.get(id);
    if (!cell) return;
    closeProfile(); closeModal('#pdModal');
    if (state.page !== 'panal') setView('panal');
    if (state.focus && state.focus !== cell.nicho) closeFocus(false);
    setTimeout(() => { centerOn(cell, 1.25); highlight(c => c === cell); setTimeout(clearMatch, 2400); }, 50);
  }

  /* =========================================================
     MODALES
     ========================================================= */
  function openModal(id) { const m = $(id); m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); }
  function closeModal(id) {
    const m = $(id);
    if (!m.classList.contains('is-open')) return;
    m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true');
    if (id === '#pmModal') onPMClose();
  }
  const topModal = () => $$('.modal.is-open').sort((a, b) => (+getComputedStyle(b).zIndex) - (+getComputedStyle(a).zIndex)).map(m => '#' + m.id)[0];
  let confirmCb = null;
  function confirmBox({ title, text, ok = 'Eliminar', onOk }) {
    $('#confirmTitle').textContent = title; $('#confirmText').textContent = text; $('#confirmOk').textContent = ok;
    confirmCb = onOk; openModal('#confirmModal');
  }

  /* =========================================================
     SESIÓN
     ========================================================= */
  function openLogin(msg) {
    closeProfile();
    $('#loginErr').textContent = msg || '';
    openModal('#loginModal');
    setTimeout(() => $('#loginName').focus(), 250);
  }
  async function doLogin(e) {
    e.preventDefault();
    const name = $('#loginName').value, pass = $('#loginPass').value, err = $('#loginErr');
    if (!norm(name) || !pass) { err.textContent = 'Escribe tu nombre completo y tu contraseña.'; return; }
    const p = state.perfiles.find(x => norm(x.nombre) === norm(name));
    if (!p) { err.textContent = 'No encontramos una cuenta con ese nombre. Revisa la escritura o únete a la red.'; return; }
    const ok = p.passHash ? (await hashPass(pass)) === p.passHash : pass === state.meta.claveDemo;
    if (!ok) { err.textContent = 'La contraseña no coincide.'; $('#loginPass').select(); return; }
    signIn(p);
    closeModal('#loginModal');
    $('#loginForm').reset();
    toast(`Hola, ${firstName(p.nombre)}. Sesión iniciada.`);
    if (!$('#pmModal').classList.contains('is-open') && state.page === 'panal') {
      const cell = state.profileCell.get(p.id);
      if (cell) { if (state.focus) closeFocus(false); centerOn(cell, 1.1); }
    }
  }
  function signIn(p) {
    state.me = p;
    store.patch(d => { d.meId = p.id; });
    if (state.pm && !state.pm.p.autor) state.pm.p.autor = p.id;
    refreshAll();
  }
  function logout() {
    state.me = null;
    store.patch(d => { d.meId = null; });
    closeProfile(); refreshAll(); toast('Sesión cerrada');
  }
  function deleteMe() {
    const me = state.me;
    if (!me) return;
    store.patch(d => {
      d.usuarios = (d.usuarios || []).filter(u => u.id !== me.id);
      if (!me.passHash) d.deleted = [...new Set([...(d.deleted || []), me.id])];
      if (d.links) delete d.links[me.id];
      if (d.overrides) delete d.overrides[me.id];
      const authored = state.proyectos.filter(p => p.autor === me.id).map(p => p.id);
      d.proyectos = (d.proyectos || []).filter(p => p.autor !== me.id).map(p => ({ ...p, participantes: p.participantes.filter(x => x !== me.id) }));
      d.deletedProjects = [...new Set([...(d.deletedProjects || []), ...authored])];
      d.meId = null;
    });
    state.proyectos = state.proyectos.filter(p => p.autor !== me.id).map(p => ({ ...p, participantes: p.participantes.filter(x => x !== me.id) }));
    state.perfiles = state.perfiles.filter(p => p.id !== me.id);
    state.me = null;
    closeProfile(); refreshAll();
    toast('Tu perfil fue eliminado de la red');
  }

  /* =========================================================
     REGISTRO EN 3 PASOS (solo @utadeo.edu.co)
     ========================================================= */
  const ob = { step: 1, nicho: null, areas: new Set(), foto: '' };
  function openOnboarding() { closeProfile(); closeModal('#loginModal'); openModal('#onboarding'); goStep(1); setTimeout(() => $('#obName').focus(), 300); }
  function setupOnboarding() {
    $('#obSemester').innerHTML = Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">${i + 1}° semestre</option>`).join('');
    $$('input[name="rol"]').forEach(r => r.addEventListener('change', () => { if (r.checked) $('#semesterField').style.visibility = r.value === 'estudiante' ? '' : 'hidden'; }));
    $('#obPhoto').addEventListener('change', async e => {
      try { ob.foto = await resizeImage(e.target.files[0], 280, 280); $('#obPhotoPreview').innerHTML = `<img src="${ob.foto}" alt="Tu foto">`; } catch { toast('No se pudo leer esa imagen'); }
    });
    $('#nichePicker').innerHTML = state.nichos.map(n => `<button type="button" class="np" role="radio" aria-checked="false" data-nicho="${n.id}" style="--c:${n.color}"><span class="np__swatch"></span><span><strong>${esc(n.nombre)}</strong><small>${plural(n.areas.length, 'área', 'áreas')}</small></span></button>`).join('');
    $('#nichePicker').addEventListener('click', e => {
      const b = e.target.closest('.np'); if (!b) return;
      if (ob.nicho !== b.dataset.nicho) ob.areas.clear();
      ob.nicho = b.dataset.nicho;
      $$('#nichePicker .np').forEach(x => { const on = x === b; x.classList.toggle('is-selected', on); x.setAttribute('aria-checked', on); });
      $('#nicheErr').textContent = '';
    });
    $('#areaPicker').addEventListener('click', e => {
      const b = e.target.closest('button[data-area]'); if (!b) return;
      const id = b.dataset.area;
      if (ob.areas.has(id)) ob.areas.delete(id);
      else if (ob.areas.size >= MAX_AREAS) { toast(`Puedes elegir hasta ${MAX_AREAS} áreas`); return; }
      else ob.areas.add(id);
      b.setAttribute('aria-pressed', ob.areas.has(id));
      $('#areaErr').textContent = '';
    });
    $('#obNext').addEventListener('click', async () => { if (!validateStep(ob.step)) return; if (ob.step < 3) goStep(ob.step + 1); else await submitOnboarding(); });
    $('#obBack').addEventListener('click', () => goStep(ob.step - 1, true));
    $('#obForm').addEventListener('submit', e => { e.preventDefault(); $('#obNext').click(); });
    $$('#obForm .field input, #obForm .field select').forEach(i => i.addEventListener('input', () => setErr(i, '')));
  }
  function setErr(input, msg) {
    const f = input.closest('.field'); if (!f) return;
    f.classList.toggle('has-error', !!msg);
    const p = f.querySelector('.field__err'); if (p) p.textContent = msg;
  }
  function validateStep(step) {
    if (step === 1) {
      let ok = true;
      const name = $('#obName'), email = $('#obEmail'), gender = $('#obGender'), p1 = $('#obPass'), p2 = $('#obPass2');
      const dom = (state.meta.dominio || 'utadeo.edu.co').toLowerCase();
      const mail = email.value.trim().toLowerCase();
      if (name.value.trim().split(/\s+/).length < 2) { setErr(name, 'Escribe tu nombre y apellido'); ok = false; }
      else if (state.perfiles.some(p => norm(p.nombre) === norm(name.value))) { setErr(name, 'Ya existe una cuenta con ese nombre. Inicia sesión.'); ok = false; }
      if (!/^[^\s@]+@[^\s@]+$/.test(mail)) { setErr(email, 'Revisa el formato del correo'); ok = false; }
      else if (!mail.endsWith('@' + dom)) { setErr(email, `Solo puedes unirte con tu correo institucional @${dom}`); ok = false; }
      else if (state.perfiles.some(p => (p.correo || '').toLowerCase() === mail)) { setErr(email, 'Ese correo ya tiene una cuenta. Inicia sesión.'); ok = false; }
      if (p1.value.length < 6) { setErr(p1, 'Usa al menos 6 caracteres'); ok = false; }
      if (p2.value !== p1.value) { setErr(p2, 'Las contraseñas no coinciden'); ok = false; }
      if (!gender.value) { setErr(gender, 'Selecciona una opción'); ok = false; }
      if (!ok) $('#obForm .has-error input, #obForm .has-error select')?.focus();
      return ok;
    }
    if (step === 2) { if (!ob.nicho) { $('#nicheErr').textContent = 'Elige un campo para continuar'; return false; } return true; }
    if (ob.areas.size === 0) { $('#areaErr').textContent = 'Selecciona al menos un área'; return false; }
    return true;
  }
  function goStep(step, back = false) {
    ob.step = step;
    $$('.ob-step').forEach(s => { const on = +s.dataset.step === step; s.classList.toggle('is-active', on); s.classList.toggle('back', on && back); });
    $$('.stepper li').forEach((li, i) => { li.classList.toggle('is-active', i + 1 === step); li.classList.toggle('is-done', i + 1 < step); });
    $('#obCount').textContent = `Paso ${step} de 3`;
    $('#obBack').hidden = step === 1;
    $('#obNext').textContent = step === 3 ? 'Unirme a la red' : 'Continuar';
    $('.ob-steps').scrollTop = 0;
    if (step === 3) {
      const n = state.nicheById.get(ob.nicho);
      $('#areaPicker').innerHTML = n.areas.map(a => `<button type="button" data-area="${a.id}" aria-pressed="${ob.areas.has(a.id)}" style="--c:${n.color}"><i></i>${esc(a.nombre)}</button>`).join('');
    }
  }
  async function submitOnboarding() {
    const rol = $('input[name="rol"]:checked').value, nombre = $('#obName').value.trim().replace(/\s+/g, ' ');
    const portafolio = {};
    [['linkedin', '#obLinkedin'], ['behance', '#obBehance'], ['instagram', '#obInstagram']].forEach(([k, sel]) => { const u = normalizeUrl($(sel).value); if (u) portafolio[k] = u; });
    const user = {
      id: uid('u'), nombre, passHash: await hashPass($('#obPass').value), genero: $('#obGender').value, rol,
      semestre: rol === 'estudiante' ? +$('#obSemester').value : null, foto: ob.foto || '', banner: '',
      ciudad: $('#obCity').value.trim(), correo: $('#obEmail').value.trim().toLowerCase(), bio: $('#obBio').value.trim(),
      nicho: ob.nicho, areas: [...ob.areas], habilidades: $('#obSkills').value.split(',').map(s => s.trim()).filter(Boolean).slice(0, 5),
      portafolio, links: [], creado: new Date().toISOString()
    };
    if (!store.patch(d => { d.usuarios = [...(d.usuarios || []), user]; })) return;
    state.perfiles.push(user);
    if (state.page !== 'panal') setView('panal');
    if (state.focus) closeFocus(false);
    signIn(user);
    closeModal('#onboarding');
    resetOnboardingForm();
    const cell = state.profileCell.get(user.id);
    if (cell) { cell.el.classList.add('is-new'); centerOn(cell, 1.2); }
    toast(`Bienvenid${user.genero === 'F' ? 'a' : user.genero === 'M' ? 'o' : 'e'} a la red, ${firstName(nombre)}`);
    setTimeout(() => openProfile(user.id), 1100);
  }
  function resetOnboardingForm() {
    $('#obForm').reset();
    ob.nicho = null; ob.areas.clear(); ob.foto = '';
    $('#obPhotoPreview').textContent = 'Foto';
    $$('#nichePicker .np').forEach(x => { x.classList.remove('is-selected'); x.setAttribute('aria-checked', 'false'); });
    $('#semesterField').style.visibility = '';
    $$('#obForm .field').forEach(f => { f.classList.remove('has-error'); const p = f.querySelector('.field__err'); if (p) p.textContent = ''; });
  }

  /* =========================================================
     APOYO DE LA UNIVERSIDAD (recomendaciones orientativas)
     ========================================================= */
  // Tipos de proyecto (se elige UNO). "g" agrupa el tipo para sugerir el apoyo de la universidad.
  const PROJECT_TYPES = [
    { id: 'evento', label: 'Evento', g: 'evento', k: ['evento', 'feria', 'festival', 'lanzamiento', 'activacion'] },
    { id: 'encuentro', label: 'Encuentro', g: 'evento', k: ['encuentro', 'conversatorio', 'charla', 'congreso', 'meetup'] },
    { id: 'articulo', label: 'Artículo', g: 'articulo', k: ['articulo', 'paper', 'revista', 'publicacion', 'ponencia'] },
    { id: 'investigacion', label: 'Investigación', g: 'articulo', k: ['investiga', 'estudio', 'tesis'] },
    { id: 'taller', label: 'Taller', g: 'taller', k: ['taller', 'workshop', 'curso', 'clase', 'pedagog'] },
    { id: 'exposicion', label: 'Exposición', g: 'expo', k: ['exposicion', 'exhibicion', 'muestra', 'museo', 'galeria'] },
    { id: 'producto-digital', label: 'Producto digital', g: 'digital', k: ['app', 'aplicacion', 'plataforma', 'web', 'sitio', 'interfaz', 'digital', 'realidad', 'sensor', 'iot'] },
    { id: 'producto', label: 'Producto', g: 'producto', k: ['producto', 'prototipo', 'objeto', 'mueble', 'mobiliario', 'empaque', 'envase', 'kit', 'banca', 'senaletica'] },
    { id: 'emprendimiento', label: 'Emprendimiento', g: 'emprend', k: ['emprend', 'startup', 'negocio', 'marca', 'empresa'] }
  ];
  const textTokens = t => norm(t).match(/[a-z0-9]+/g) || [];
  const tipoById = id => PROJECT_TYPES.find(t => t.id === id);
  // Sugerencia inicial: el tipo cuya palabra clave aparece primero en el texto
  function detectTipo(p) {
    const tokens = textTokens(`${p.titulo || ''} ${p.descripcion || ''}`);
    let best = null, pos = Infinity;
    PROJECT_TYPES.forEach(t => {
      const i = tokens.findIndex(tok => t.k.some(k => tok.startsWith(k)));
      if (i >= 0 && i < pos) { pos = i; best = t.id; }
    });
    if (best) return best;
    const a = p.areas || [];
    if (a.some(x => x.startsWith('uxui-'))) return 'producto-digital';
    if (a.includes('social-investigacion')) return 'investigacion';
    if (a.includes('social-museografico')) return 'exposicion';
    if (a.some(x => x.startsWith('producto-'))) return 'producto';
    return '';
  }
  const tipoOf = p => p.tipo || detectTipo(p);
  function projectTypes(p) {
    const set = new Set();
    const t = tipoById(tipoOf(p));
    if (t) set.add(t.g);
    const areas = p.areas || [];
    if (areas.some(a => a.startsWith('producto-') || a === 'sostenibilidad-circulares' || a === 'sostenibilidad-manufactura')) set.add('producto');
    if (areas.some(a => a.startsWith('uxui-'))) set.add('digital');
    if (p.sector === 'desarrollo-economico') set.add('emprend');
    return set;
  }
  function supportFor(p) {
    const T = projectTypes(p), tokens = textTokens(p.descripcion);
    const has = id => T.has(id), sec = sectorName(p.sector);
    const lead = person(p.autor) || state.me, n = projectNiche(p);
    const espacios = [], acomp = [], fin = [], rubros = [];
    if (has('producto')) { espacios.push(['Taller de modelos y prototipos', 'Para construir maquetas y prototipos funcionales.'], ['Laboratorio de fabricación digital', 'Corte láser, impresión 3D y CNC.']); rubros.push('Materiales e insumos', 'Prototipado y fabricación'); acomp.push(['Asesoría en propiedad intelectual', 'Para proteger diseños y modelos de utilidad.']); }
    if (has('digital')) { espacios.push(['Laboratorio de medios digitales', 'Equipos, software de diseño y pruebas con usuarios.']); rubros.push('Software y licencias'); }
    if (has('evento')) { espacios.push(['Auditorio o sala de eventos', 'Para charlas, lanzamientos y encuentros.'], ['Espacios abiertos del campus', 'Para ferias, activaciones o montajes temporales.']); rubros.push('Logística y montaje', 'Refrigerios'); acomp.push(['Comunicaciones institucionales', 'Difusión en canales de la universidad.']); }
    if (has('expo')) { espacios.push(['Sala de exposiciones o galería', 'Para montaje y curaduría de muestras.']); rubros.push('Montaje museográfico'); }
    if (has('taller')) espacios.push(['Aulas taller', 'Para sesiones de formación y co-creación.']);
    if (has('articulo')) { espacios.push(['Biblioteca y bases de datos académicas', 'Para el estado del arte y las referencias.']); acomp.push(['Grupo de investigación afín', 'Acompañamiento metodológico y editorial.']); rubros.push('Publicación y edición'); }
    if (has('emprend')) { acomp.push(['Unidad de emprendimiento e innovación', 'Mentorías, modelo de negocio y conexión con aliados.']); fin.push(['Capital semilla para emprendimientos', 'Convocatorias para validar y escalar la idea.']); }
    if (['integracion-social', 'mujeres', 'educacion', 'gestion-publica', 'gobierno'].includes(p.sector) || tokens.some(t => /^(comunidad|territori|rural|barrio|vereda)/.test(t))) {
      acomp.push(['Oficina de extensión y proyección social', 'Relación con comunidades y entidades públicas.']); rubros.push('Trabajo de campo y transporte');
    }
    espacios.push(['Salas de trabajo colaborativo', 'Para las sesiones de trabajo del equipo.']);
    acomp.unshift(['Docente o asesor', 'Acompañamiento académico durante el proyecto.']);
    fin.unshift(['Convocatorias de la Universidad', 'Financiación para proyectos de estudiantes, egresados y docentes.']);
    fin.push(['Alianzas con entidades del sector público', 'Financiación de entidades públicas'], ['Convocatorias públicas afines al sector', 'Fondos distritales, nacionales e internacionales']);
    rubros.push('Difusión y piezas gráficas', 'Imprevistos (10 %)');
    const uniq = arr => [...new Map(arr.map(x => [x[0], x])).values()];
    return { espacios: uniq(espacios), acompanamiento: uniq(acomp), financiacion: uniq(fin), rubros: [...new Set(rubros)], lead };
  }

  /* =========================================================
     GESTOR DE PROYECTO
     ========================================================= */
  function newProject(extra = {}) {
    return {
      id: uid('pj'), titulo: '', sector: '', tipo: '', estado: 'ejecucion', descripcion: '', autor: state.me?.id || null,
      participantes: [], areas: [], imagenes: [], enlaces: [], borrador: true, enviado: null,
      apoyo: null, presupuesto: null, creado: new Date().toISOString().slice(0, 10), origen: 'perfil', ...extra
    };
  }
  function ensureSupport(p) {
    const s = supportFor(p);
    if (!p.apoyo) p.apoyo = { espacios: s.espacios.map(x => x[0]), acompanamiento: s.acompanamiento.map(x => x[0]), financiacion: s.financiacion.map(x => x[0]) };
    if (!p.presupuesto) p.presupuesto = s.rubros.map(r => ({ rubro: r, valor: 0 }));
    return s;
  }
  function openPM(p, tab = 'info') {
    closeProfile(); closeModal('#pdModal');
    state.pm = { p: JSON.parse(JSON.stringify(p)), tab, dirty: false, isNew: !state.proyectos.some(x => x.id === p.id) };
    if (!state.pm.p.tipo) state.pm.p.tipo = detectTipo(state.pm.p);
    ensureSupport(state.pm.p);
    renderPM();
    openModal('#pmModal');
  }
  function renderPM() {
    const { p, tab } = state.pm;
    $('#pmTitle').textContent = p.titulo || 'Nuevo proyecto';
    $('#pmEyebrow').textContent = p.origen === 'cabito' ? 'Gestiona tu proyecto' : 'Proyecto';
    $$('.pm-tabs [data-pm-tab]').forEach(b => b.classList.toggle('is-active', b.dataset.pmTab === tab));
    const s = supportFor(p);
    const team = teamOf({ ...p, autor: p.autor || state.me?.id });
    const sectorOpts = `<option value="">Selecciona…</option>${state.sectores.map(x => `<option value="${x.id}" ${p.sector === x.id ? 'selected' : ''}>${esc(x.nombre)}</option>`).join('')}`;
    const panes = {
      info: `<div class="pm-grid">
          <div>
            <div class="field"><label for="pmT">Nombre del proyecto</label><input id="pmT" data-k="titulo" value="${esc(p.titulo)}" maxlength="90" placeholder="Ej: Mobiliario urbano con plástico reciclado"></div>
            <div class="field"><label for="pmD">Descripción</label><textarea id="pmD" data-k="descripcion" rows="6" placeholder="Qué van a hacer, para quién y qué necesitan">${esc(p.descripcion)}</textarea></div>
            <div class="field"><span class="label">Áreas de diseño involucradas</span><div class="chips chips--pick" id="pmAreas">${state.nichos.flatMap(n => n.areas.map(a => `<button type="button" data-area="${a.id}" aria-pressed="${p.areas.includes(a.id)}" style="--c:${n.color}"><i></i>${esc(a.nombre)}</button>`)).join('')}</div></div>
          </div>
          <div>
            <div class="field"><label for="pmS">Sector de desempeño</label><select id="pmS" data-k="sector">${sectorOpts}</select></div>
            <div class="field"><label for="pmTipo">Tipo de proyecto</label><select id="pmTipo" data-k="tipo"><option value="">Selecciona…</option>${PROJECT_TYPES.map(t => `<option value="${t.id}" ${p.tipo === t.id ? 'selected' : ''}>${t.label}</option>`).join('')}</select></div>
            <div class="field"><span class="label">Estado</span><div class="seg seg--full" role="radiogroup"><label><input type="radio" name="pmE" value="ejecucion" ${p.estado !== 'finalizado' ? 'checked' : ''}><span>En ejecución</span></label><label><input type="radio" name="pmE" value="finalizado" ${p.estado === 'finalizado' ? 'checked' : ''}><span>Finalizado</span></label></div></div>
            <div class="field"><span class="label">Imágenes del proyecto <span class="muted">(máx. 3)</span></span><div class="img-row">${(p.imagenes || []).map((src, i) => `<div class="img-slot"><img src="${esc(src)}" alt=""><button class="rm" type="button" data-rm-img="${i}" aria-label="Quitar imagen">${icon('x')}</button></div>`).join('')}${(p.imagenes || []).length < 3 ? '<label class="img-add">+ Imagen<input type="file" accept="image/*" id="pmImg" hidden></label>' : ''}</div></div>
            <div class="field"><label for="pmL">Enlaces <span class="muted">(uno por línea)</span></label><textarea id="pmL" rows="3" placeholder="https://www.behance.net/gallery/…">${esc((p.enlaces || []).join('\n'))}</textarea></div>
          </div>
        </div>`,
      equipo: `<p class="ob-help">Menciona a las personas que están participando o participaron en el proyecto.</p>
        <div class="field team-search"><label for="pmQ">Agregar persona</label><input id="pmQ" placeholder="Escribe un nombre, área o habilidad" autocomplete="off"><div class="suggest-list" id="pmSug" hidden></div></div>
        <div class="member-list">${team.length ? team.map((t, i) => { const tn = state.nicheById.get(t.nicho); return `<div class="member">${avatarHTML(t)}<div><strong>${esc(t.nombre)}</strong>${i === 0 ? '<span class="lead">Líder</span>' : ''}<p>${esc(roleLabel(t))} · ${esc(tn.nombre)}<br>${t.areas.map(a => esc(state.areaById.get(a).nombre)).join(', ')}${(t.habilidades || []).length ? ` · ${esc(t.habilidades.join(', '))}` : ''}<br>${esc(t.correo || '')}</p></div>${i === 0 ? '' : `<button class="rm" type="button" data-rm-member="${t.id}" aria-label="Quitar a ${esc(t.nombre)}">${icon('x')}</button>`}</div>`; }).join('') : '<p class="mini-empty">Inicia sesión para quedar como líder del proyecto y agrega a tu equipo.</p>'}</div>`,
      apoyo: `<p class="ob-help">Así podría apoyarte la universidad según el sector, el tipo de proyecto y las áreas involucradas. Marca lo que necesitas y estima el presupuesto.</p>
        <div class="support-grid">
          ${[['espacios', 'Espacios físicos', 'Lugares de la universidad para trabajar.'], ['acompanamiento', 'Acompañamiento', 'Personas y oficinas que pueden asesorarte.'], ['financiacion', 'Fuentes de financiación', 'Dónde buscar recursos para ejecutarlo.']].map(([k, t, d]) => `<div class="sbox"><h4>${t}</h4><p>${d}</p>${s[k].map(([name, desc]) => `<label class="check"><input type="checkbox" data-apoyo="${k}" value="${esc(name)}" ${p.apoyo[k].includes(name) ? 'checked' : ''}><span>${esc(name)}<small>${esc(desc)}</small></span></label>`).join('')}</div>`).join('')}
          <div class="sbox"><h4>Presupuesto estimado</h4><p>Valores en pesos colombianos</p>
            <table class="budget"><tbody>${p.presupuesto.map((r, i) => `<tr><td><input data-bud="${i}" data-f="rubro" value="${esc(r.rubro)}" aria-label="Rubro"></td><td><input data-bud="${i}" data-f="valor" inputmode="numeric" value="${r.valor ? r.valor.toLocaleString('es-CO') : ''}" placeholder="$ 0" aria-label="Valor"></td><td><button class="rm" type="button" data-rm-bud="${i}" aria-label="Quitar rubro">${icon('x')}</button></td></tr>`).join('')}</tbody>
            <tfoot><tr><td><button class="btn btn--ghost btn--xs" type="button" data-add-bud>+ Agregar rubro</button></td><td id="budTotal">${COP.format(p.presupuesto.reduce((a, r) => a + (+r.valor || 0), 0))}</td><td></td></tr></tfoot></table>
          </div>
        </div>
        <p class="note">Estas recomendaciones son orientativas. Es necesario confirmar con la universidad la disponibilidad de espacios, oficinas y convocatorias vigentes.</p>`,
      brief: briefHTML(p)
    };
    $('#pmBody').innerHTML = Object.entries(panes).map(([k, html]) => `<div class="pm-pane ${k === tab ? 'is-active' : ''}" data-pm-pane="${k}">${html}</div>`).join('');
    updatePMStatus();
  }
  function updatePMStatus() {
    const p = state.pm.p, saved = state.proyectos.find(x => x.id === p.id);
    const parts = [];
    if (p.enviado) parts.push(`<b>Propuesta enviada</b> el ${fmtDate(p.enviado)}`);
    if (saved && !saved.borrador) parts.push('Publicado');
    else if (saved) parts.push(`Borrador guardado · ${fmtDate(saved.actualizado || saved.creado)}`);
    else parts.push('Sin guardar');
    $('#pmStatus').innerHTML = parts.join(' · ');
    $('#pmPublish').textContent = saved && !saved.borrador ? 'Guardar cambios' : 'Publicar';
  }
  function bindPM() {
    const body = $('#pmBody');
    $$('.pm-tabs [data-pm-tab]').forEach(b => b.addEventListener('click', () => { syncPMBudget(); state.pm.tab = b.dataset.pmTab; renderPM(); }));
    body.addEventListener('input', e => {
      const pm = state.pm; if (!pm) return;
      const t = e.target; pm.dirty = true;
      if (t.dataset.k) { pm.p[t.dataset.k] = t.value; if (t.dataset.k === 'titulo') $('#pmTitle').textContent = t.value || 'Nuevo proyecto'; }
      if (t.id === 'pmL') pm.p.enlaces = t.value.split('\n').map(normalizeUrl).filter(Boolean);
      if (t.name === 'pmE') pm.p.estado = t.value;
      if (t.dataset.bud) {
        const r = pm.p.presupuesto[+t.dataset.bud];
        if (t.dataset.f === 'rubro') r.rubro = t.value;
        else { const v = +t.value.replace(/[^\d]/g, '') || 0; r.valor = v; }
        $('#budTotal').textContent = COP.format(pm.p.presupuesto.reduce((a, x) => a + (+x.valor || 0), 0));
      }
      if (t.id === 'pmQ') showSuggestions(t.value);
    });
    body.addEventListener('change', async e => {
      const pm = state.pm, t = e.target;
      if (t.dataset.k === 'sector') { pm.p.sector = t.value; pm.dirty = true; }
      if (t.dataset.k === 'tipo') { pm.p.tipo = t.value; pm.dirty = true; }
      if (t.name === 'pmE') { pm.p.estado = t.value; pm.dirty = true; }
      if (t.dataset.apoyo) { const arr = pm.p.apoyo[t.dataset.apoyo]; if (t.checked) arr.push(t.value); else pm.p.apoyo[t.dataset.apoyo] = arr.filter(x => x !== t.value); pm.dirty = true; }
      if (t.dataset.bud && t.dataset.f === 'valor') t.value = pm.p.presupuesto[+t.dataset.bud].valor ? pm.p.presupuesto[+t.dataset.bud].valor.toLocaleString('es-CO') : '';
      if (t.id === 'pmImg' && t.files[0]) {
        try { pm.p.imagenes = [...(pm.p.imagenes || []), await resizeImage(t.files[0], 900, 700)].slice(0, 3); pm.dirty = true; renderPM(); } catch { toast('No se pudo leer esa imagen'); }
      }
    });
    body.addEventListener('click', e => {
      const pm = state.pm; if (!pm) return;
      const a = e.target.closest('#pmAreas [data-area]');
      if (a) { const id = a.dataset.area; pm.p.areas = pm.p.areas.includes(id) ? pm.p.areas.filter(x => x !== id) : [...pm.p.areas, id]; a.setAttribute('aria-pressed', pm.p.areas.includes(id)); pm.dirty = true; return; }
      const ri = e.target.closest('[data-rm-img]');
      if (ri) { pm.p.imagenes.splice(+ri.dataset.rmImg, 1); pm.dirty = true; renderPM(); return; }
      const rmm = e.target.closest('[data-rm-member]');
      if (rmm) { pm.p.participantes = pm.p.participantes.filter(x => x !== rmm.dataset.rmMember); pm.dirty = true; renderPM(); return; }
      const sg = e.target.closest('[data-add-member]');
      if (sg) { pm.p.participantes = [...new Set([...pm.p.participantes, sg.dataset.addMember])]; pm.dirty = true; renderPM(); setTimeout(() => $('#pmQ')?.focus(), 0); return; }
      const rb = e.target.closest('[data-rm-bud]');
      if (rb) { syncPMBudget(); pm.p.presupuesto.splice(+rb.dataset.rmBud, 1); pm.dirty = true; renderPM(); return; }
      if (e.target.closest('[data-add-bud]')) { syncPMBudget(); pm.p.presupuesto.push({ rubro: 'Nuevo rubro', valor: 0 }); pm.dirty = true; renderPM(); }
      if (e.target.closest('[data-open]')) { const id = e.target.closest('[data-open]').dataset.open; closeModal('#pmModal'); openProfile(id); }
    });
    body.addEventListener('keydown', e => {
      if (e.target.id !== 'pmQ') return;
      const items = $$('#pmSug button');
      if (!items.length) return;
      let i = items.findIndex(b => b.classList.contains('is-hl'));
      if (e.key === 'ArrowDown') { e.preventDefault(); i = (i + 1) % items.length; }
      else if (e.key === 'ArrowUp') { e.preventDefault(); i = (i - 1 + items.length) % items.length; }
      else if (e.key === 'Enter') { e.preventDefault(); (items[i] || items[0]).click(); return; }
      else return;
      items.forEach((b, k) => b.classList.toggle('is-hl', k === i));
    });
    $('#pmDraft').addEventListener('click', () => pmSave('draft'));
    $('#pmPublish').addEventListener('click', () => pmSave('publish'));
    $('#pmSend').addEventListener('click', () => pmSave('send'));
    $('#pmPdf').addEventListener('click', () => { syncPMBudget(); downloadPDF(state.pm.p); });
  }
  function syncPMBudget() { /* los valores se sincronizan en cada 'input' */ }
  function showSuggestions(q) {
    const box = $('#pmSug'), p = state.pm.p;
    const qn = norm(q);
    if (qn.length < 1) { box.hidden = true; return; }
    const inTeam = new Set([p.autor || state.me?.id, ...p.participantes]);
    const list = state.perfiles.filter(x => !inTeam.has(x.id) && norm([x.nombre, ...(x.habilidades || []), ...x.areas.map(a => state.areaById.get(a).nombre)].join(' ')).includes(qn)).slice(0, 6);
    box.innerHTML = list.length ? list.map((x, i) => `<button type="button" data-add-member="${x.id}" class="${i === 0 ? 'is-hl' : ''}">${avatarHTML(x)}<span>${esc(x.nombre)}<small>${esc(roleLabel(x))} · ${esc(state.nicheById.get(x.nicho).corto)}</small></span></button>`).join('') : '<p class="mini-empty" style="margin:0">Sin coincidencias</p>';
    box.hidden = false;
  }
  function validateProject(p) {
    const miss = [];
    if (!p.titulo.trim()) miss.push('el nombre');
    if (!p.sector) miss.push('el sector de desempeño');
    if (!p.tipo) miss.push('el tipo de proyecto');
    if (wordsOf(p.descripcion) < 5) miss.push('una descripción');
    if (miss.length) { toast(`Para continuar agrega ${miss.join(', ')}`); state.pm.tab = 'info'; renderPM(); return false; }
    return true;
  }
  function pmSave(mode) {
    const pm = state.pm; if (!pm) return;
    const p = pm.p;
    if (!state.me) { openLogin('Inicia sesión para guardar, publicar o enviar tu proyecto. No perderás lo que llevas.'); return; }
    if (!p.autor) p.autor = state.me.id;
    if (p.autor !== state.me.id) { toast('Solo quien lidera el proyecto puede modificarlo'); return; }
    p.participantes = p.participantes.filter(x => x !== p.autor);
    if (mode === 'draft') {
      if (!p.titulo.trim()) p.titulo = 'Proyecto sin título';
      const wasPublished = state.proyectos.some(x => x.id === p.id && !x.borrador);
      if (!wasPublished) p.borrador = true;
      if (!saveProject(JSON.parse(JSON.stringify(p)))) return;
      pm.dirty = false; updatePMStatus();
      toast(wasPublished ? 'Cambios guardados' : 'Guardado en tus borradores');
      if (state.page === 'proyectos') renderProjects();
      return;
    }
    if (!validateProject(p)) return;
    if (mode === 'send') {
      p.enviado = new Date().toISOString();
      if (!saveProject(JSON.parse(JSON.stringify(p)))) return;
      pm.dirty = false; updatePMStatus(); renderPM();
      const to = state.meta.correoUniversidad;
      if (to) {
        const team = teamOf(p).map(t => `- ${t.nombre} (${roleLabel(t)}) ${t.correo || ''}`).join('\n');
        const body = `Propuesta de proyecto enviada desde NexoTadeo\n\nProyecto: ${p.titulo}\nSector: ${sectorName(p.sector)}\nEstado: ${estadoName(p.estado)}\n\n${p.descripcion}\n\nEquipo:\n${team}\n\nApoyo solicitado:\n${[...p.apoyo.espacios, ...p.apoyo.acompanamiento, ...p.apoyo.financiacion].map(x => '- ' + x).join('\n')}\n\nPresupuesto estimado: ${COP.format(p.presupuesto.reduce((a, r) => a + (+r.valor || 0), 0))}\n\n(Adjunta el brief en PDF descargado desde la plataforma.)`;
        location.href = `mailto:${to}?subject=${encodeURIComponent('Propuesta NexoTadeo: ' + p.titulo)}&body=${encodeURIComponent(body)}`;
      }
      toast('Propuesta enviada a la Universidad para que valoren los requerimientos');
      if (state.page === 'proyectos') renderProjects();
      return;
    }
    // publicar
    p.borrador = false;
    if (!saveProject(JSON.parse(JSON.stringify(p)))) return;
    pm.dirty = false;
    closeModal('#pmModal');
    state.filter = { sector: '', estado: '' };
    setView('proyectos');
    toast('Proyecto publicado');
    setTimeout(() => { const el = $(`#projectStack [data-project="${p.id}"]`); el?.closest('.pcard-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120);
  }
  function onPMClose() {
    const pm = state.pm;
    $('#pmSug') && ($('#pmSug').hidden = true);
    // Si el proyecto quedó a medias, se guarda como borrador para retomarlo después
    if (pm && pm.dirty && state.me && (!pm.p.autor || pm.p.autor === state.me.id) && (pm.p.titulo.trim() || pm.p.descripcion.trim())) {
      const saved = state.proyectos.find(x => x.id === pm.p.id);
      if (!saved || saved.borrador) {
        pm.p.autor = state.me.id; pm.p.borrador = true;
        if (!pm.p.titulo.trim()) pm.p.titulo = 'Proyecto sin título';
        if (saveProject(JSON.parse(JSON.stringify(pm.p)))) toast('Tu proyecto quedó en Borradores');
      }
    }
    state.pm = null;
  }

  /* ---------- Brief (HTML y PDF) ---------- */
  function briefData(p) {
    const team = teamOf({ ...p, autor: p.autor || state.me?.id });
    const total = (p.presupuesto || []).reduce((a, r) => a + (+r.valor || 0), 0);
    const tl = tipoById(tipoOf(p))?.label;
    const types = tl ? [tl] : [];
    return { team, total, types, areas: (p.areas || []).map(a => state.areaById.get(a)?.nombre).filter(Boolean) };
  }
  function briefHTML(p) {
    const { team, total, types, areas } = briefData(p);
    const ap = p.apoyo || { espacios: [], acompanamiento: [], financiacion: [] };
    return `<article class="brief">
      <div class="brief__top"><div><p class="eyebrow">Brief de proyecto</p><h3>${esc(p.titulo || 'Proyecto sin título')}</h3></div><span class="brief__logo"><svg viewBox="0 0 32 32"><path d="M16 2l12 7v14l-12 7-12-7V9z"/></svg>NexoTadeo</span></div>
      <dl><dt>Sector de desempeño</dt><dd>${esc(sectorName(p.sector))}</dd><dt>Estado</dt><dd>${estadoName(p.estado)}</dd>${types.length ? `<dt>Tipo de proyecto</dt><dd>${esc(types.join(', '))}</dd>` : ''}${areas.length ? `<dt>Áreas de diseño</dt><dd>${esc(areas.join(', '))}</dd>` : ''}<dt>Fecha</dt><dd>${fmtDate(new Date().toISOString())}</dd></dl>
      <h5>Descripción</h5><p>${esc(p.descripcion || '—')}</p>
      <h5>Equipo</h5>${team.length ? `<table><thead><tr><th>Nombre</th><th>Rol</th><th>Campo y áreas</th><th>Contacto</th></tr></thead><tbody>${team.map((t, i) => `<tr><td>${esc(t.nombre)}${i === 0 ? ' (líder)' : ''}</td><td>${esc(roleLabel(t))}</td><td>${esc(state.nicheById.get(t.nicho).nombre)}<br><span class="muted">${t.areas.map(a => esc(state.areaById.get(a).nombre)).join(', ')}</span></td><td>${esc(t.correo || '')}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">Aún no hay equipo.</p>'}
      <h5>Apoyo solicitado a la universidad</h5>
      <dl><dt>Espacios físicos</dt><dd>${ap.espacios.length ? `<ul>${ap.espacios.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '—'}</dd><dt>Acompañamiento</dt><dd>${ap.acompanamiento.length ? `<ul>${ap.acompanamiento.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '—'}</dd><dt>Financiación</dt><dd>${ap.financiacion.length ? `<ul>${ap.financiacion.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '—'}</dd></dl>
      <h5>Presupuesto estimado</h5><table><tbody>${(p.presupuesto || []).map(r => `<tr><td>${esc(r.rubro)}</td><td style="text-align:right">${r.valor ? COP.format(r.valor) : '—'}</td></tr>`).join('')}<tr><th>Total</th><th style="text-align:right">${COP.format(total)}</th></tr></tbody></table>
      ${p.enviado ? `<p class="badge-sent" style="margin-top:16px">${icon('check')} Propuesta enviada a la universidad el ${fmtDate(p.enviado)}</p>` : ''}
    </article>`;
  }
  function loadJsPDF() {
    if (window.jspdf) return Promise.resolve(window.jspdf);
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = JSPDF_URL; s.onload = () => window.jspdf ? res(window.jspdf) : rej(new Error('jspdf')); s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  async function downloadPDF(p) {
    ensureSupport(p);
    try {
      const { jsPDF } = await loadJsPDF();
      buildPDF(new jsPDF({ unit: 'pt', format: 'a4' }), p);
      toast('Brief descargado en PDF');
    } catch {
      printBrief(p); // respaldo: diálogo de impresión → "Guardar como PDF"
    }
  }
  function buildPDF(doc, p) {
    const { team, total, types, areas } = briefData(p);
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 48;
    let y = 0;
    const ensure = h => { if (y + h > H - 56) { doc.addPage(); y = M; } };
    const text = (t, size = 10, color = [31, 31, 31], style = 'normal', x = M, maxW = W - 2 * M, lh = 1.45) => {
      doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor(...color);
      doc.splitTextToSize(String(t), maxW).forEach(line => { ensure(size * lh); doc.text(line, x, y + size); y += size * lh; });
    };
    const section = t => { y += 14; ensure(30); doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(90, 129, 250); doc.text(t.toUpperCase(), M, y + 9); y += 16; doc.setDrawColor(228, 232, 244); doc.line(M, y, W - M, y); y += 8; };
    // Encabezado
    const tLines = (() => { doc.setFontSize(18); return doc.splitTextToSize(p.titulo || 'Proyecto sin título', W - 2 * M - 50).slice(0, 2); })();
    const band = tLines.length > 1 ? 116 : 92;
    doc.setFillColor(44, 61, 143); doc.rect(0, 0, W, band, 'F');
    doc.setFillColor(90, 129, 250);
    const hx = W - M - 14, hy = 46, r = 16;
    doc.lines([[r * 0.866, r / 2], [0, r], [-r * 0.866, r / 2], [-r * 0.866, -r / 2], [0, -r], [r * 0.866, -r / 2]], hx, hy - r, [1, 1], 'F', true);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(211, 222, 255); doc.text('NexoTadeo · Brief de proyecto', M, 38);
    doc.setFontSize(18); doc.setTextColor(255, 255, 255);
    tLines.forEach((l, i) => doc.text(l, M, 64 + i * 24));
    y = band + 20;
    const kv = [['Sector de desempeño', sectorName(p.sector)], ['Estado', estadoName(p.estado)], ...(types.length ? [['Tipo de proyecto', types.join(', ')]] : []), ...(areas.length ? [['Áreas de diseño', areas.join(', ')]] : []), ['Fecha', fmtDate(new Date().toISOString())], ...(p.enviado ? [['Propuesta enviada', fmtDate(p.enviado)]] : [])];
    kv.forEach(([k, v]) => { const y0 = y; text(k, 9, [106, 110, 131], 'normal', M, 130); const y1 = y; y = y0; text(v, 10, [31, 31, 31], 'normal', M + 140, W - 2 * M - 140); y = Math.max(y, y1) + 2; });
    section('Descripción'); text(p.descripcion || '—', 10.5);
    section('Equipo');
    if (!team.length) text('Aún no hay equipo.', 10, [106, 110, 131]);
    team.forEach((t, i) => {
      ensure(54);
      text(`${t.nombre}${i === 0 ? '  ·  Líder' : ''}`, 11, [31, 31, 31], 'bold');
      text(`${roleLabel(t)} · ${state.nicheById.get(t.nicho).nombre}`, 9.5, [106, 110, 131]);
      text(`Áreas: ${t.areas.map(a => state.areaById.get(a).nombre).join(', ')}${(t.habilidades || []).length ? '  ·  Habilidades: ' + t.habilidades.join(', ') : ''}`, 9.5);
      if (t.correo) text(t.correo, 9.5, [90, 129, 250]);
      y += 6;
    });
    section('Apoyo solicitado a la universidad');
    [['Espacios físicos', p.apoyo.espacios], ['Acompañamiento', p.apoyo.acompanamiento], ['Financiación', p.apoyo.financiacion]].forEach(([k, arr]) => {
      text(k, 10, [44, 61, 143], 'bold');
      (arr.length ? arr : ['—']).forEach(x => text('•  ' + x, 10, [31, 31, 31], 'normal', M + 8, W - 2 * M - 8));
      y += 4;
    });
    section('Presupuesto estimado');
    (p.presupuesto || []).forEach(r => { ensure(16); doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(31, 31, 31); doc.text(String(r.rubro), M, y + 10); doc.text(r.valor ? COP.format(r.valor) : '—', W - M, y + 10, { align: 'right' }); y += 18; });
    ensure(24); doc.setDrawColor(205, 212, 232); doc.line(M, y, W - M, y); y += 6;
    doc.setFont('helvetica', 'bold'); doc.text('Total', M, y + 10); doc.text(COP.format(total), W - M, y + 10, { align: 'right' }); y += 24;
    text('Recomendaciones orientativas generadas por NexoTadeo. Es necesario confirmar con la universidad la disponibilidad de espacios, oficinas y convocatorias vigentes.', 8.5, [106, 110, 131]);
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(168, 177, 206); doc.text(`NexoTadeo · Universidad Jorge Tadeo Lozano · ${i}/${pages}`, M, H - 28); }
    const slug = norm(p.titulo || 'proyecto').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'proyecto';
    doc.save(`brief-${slug}.pdf`);
  }
  function printBrief(p) {
    const css = [...document.styleSheets].map(s => { try { return [...s.cssRules].map(r => r.cssText).join('\n'); } catch { return ''; } }).join('\n');
    const f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    document.body.appendChild(f);
    f.contentDocument.write(`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Brief · ${esc(p.titulo)}</title><style>${css} body{overflow:auto;background:#fff} .brief{border:0}</style></head><body>${briefHTML(p)}</body></html>`);
    f.contentDocument.close();
    setTimeout(() => { try { f.contentWindow.focus(); f.contentWindow.print(); toast('Elige "Guardar como PDF" en el diálogo de impresión'); } catch { toast('No se pudo generar el PDF en este navegador'); } setTimeout(() => f.remove(), 4000); }, 300);
  }

  /* =========================================================
     CABITO — sector → idea → equipo → gestor del proyecto
     ========================================================= */
  const EXAMPLES = [
    'Quiero organizar una feria de mobiliario sostenible con materiales reciclados',
    'Necesito diseñar una app para que adultos mayores agenden citas de salud',
    'Queremos montar una exposición sobre memoria con comunidades rurales',
    'Busco equipo para escribir un artículo de investigación sobre empaques circulares'
  ];
  const shortEx = e => e.split(' ').slice(0, 6).join(' ') + '…';
  function kwMatch(tokens, text, kw) {
    const k = norm(kw);
    if (k.includes(' ') || k.includes('-')) return text.includes(k);
    if (k.length <= 3) return tokens.some(t => t === k || t === k + 's');
    return tokens.some(t => t.startsWith(k));
  }
  function analyze(text) {
    const nt = norm(text), tokens = nt.match(/[a-z0-9]+/g) || [];
    const areaScore = new Map(), nicheScore = new Map(), hits = [];
    state.nichos.forEach(n => {
      let ns = 0;
      (n.keywords || []).forEach(k => { if (kwMatch(tokens, nt, k)) ns += 2; });
      n.areas.forEach(a => {
        const m = (a.keywords || []).filter(k => kwMatch(tokens, nt, k));
        if (m.length) { areaScore.set(a.id, m.length * 3); ns += m.length; hits.push({ area: a, nicho: n, score: m.length }); }
      });
      if (ns) nicheScore.set(n.id, ns);
    });
    const ranked = state.perfiles.map(p => {
      let score = 0; const why = [];
      p.areas.forEach(a => { const s = areaScore.get(a) || 0; if (s) { score += s; why.push(state.areaById.get(a).nombre); } });
      score += (nicheScore.get(p.nicho) || 0) * 0.6;
      const skills = (p.habilidades || []).filter(h => (norm(h).match(/[a-z0-9]+/g) || []).some(w => w.length > 3 && tokens.some(t => t.startsWith(w.slice(0, Math.max(4, w.length - 2))))));
      if (skills.length) { score += skills.length * 2; why.push(...skills); }
      const bio = new Set((norm(p.bio).match(/[a-z]{5,}/g) || []).map(w => w.slice(0, 6)));
      score += Math.min(tokens.filter(t => t.length >= 5 && bio.has(t.slice(0, 6))).length, 3) * 0.5;
      if (isMe(p)) score -= 100;
      return { p, score, why: [...new Set(why)] };
    }).filter(r => r.score > 0.9).sort((a, b) => b.score - a.score);
    const picks = [], used = new Map();
    for (const r of ranked) {
      if (picks.length >= 4) break;
      const u = used.get(r.p.nicho) || 0;
      if (u >= 2 && ranked.length > picks.length + 1) continue;
      picks.push(r); used.set(r.p.nicho, u + 1);
    }
    hits.sort((a, b) => b.score - a.score);
    return { picks, hits, max: picks[0]?.score || 1 };
  }
  function guessSector(text) {
    const nt = norm(text), tokens = nt.match(/[a-z0-9]+/g) || [];
    let best = null, bs = 0;
    state.sectores.forEach(s => { const sc = (s.keywords || []).filter(k => kwMatch(tokens, nt, k)).length; if (sc > bs) { bs = sc; best = s.id; } });
    return best;
  }
  function suggestTitle(text) {
    let t = text.trim().split(/[.\n!?]/)[0];
    t = t.replace(/^(hola[, ]*)?(yo\s+)?(quiero|queremos|quisiera|quisieramos|quisiéramos|necesito|necesitamos|busco equipo para|buscamos equipo para|busco|buscamos|me gustaria|me gustaría|tengo la idea de|la idea es)\s+/i, '');
    t = t.replace(/^(hacer|crear|diseñar|organizar|montar|desarrollar|escribir)\s+(un|una|el|la|unos|unas)\s+/i, (m, v) => '');
    if (t.length > 70) t = t.slice(0, 70).replace(/\s+\S*$/, '');
    t = t.replace(/(\s+(para|de|del|con|el|la|los|las|y|e|en|a|un|una|que|por|sobre|al))+\s*[,;:]?$/i, '');
    return t ? t[0].toUpperCase() + t.slice(1) : 'Nuevo proyecto';
  }
  function addMsg(html, who = 'bot', extra = '') {
    const log = $('#cabitoLog'), d = document.createElement('div');
    d.className = `msg msg--${who} ${extra}`; d.innerHTML = html;
    log.appendChild(d); log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });
    return d;
  }
  function setComposer(enabled, ph) {
    const ta = $('#cabitoInput');
    ta.disabled = !enabled;
    ta.placeholder = ph || (enabled ? 'Describe tu proyecto: qué quieres hacer, para quién y qué necesitas…' : 'Primero elige un sector de desempeño');
    updateWordCount();
  }
  function cabitoWelcome() {
    state.cab = { sector: null, text: '', result: null, draft: null };
    $('#cabitoLog').innerHTML = '';
    addMsg(`<p class="lead">La Utadeo te quiere apoyar en tus proyectos.</p><p>Cuenta tus futuros proyectos. Cabito te ayudará a crear equipos y solicitar apoyo a la universidad.</p>`);
    addMsg(`<p>Para empezar, ¿en qué <strong>sector de desempeño</strong> vas a trabajar?</p><div class="suggest" data-sectors>${state.sectores.map(s => `<button type="button" data-sector="${s.id}">${esc(s.nombre)}</button>`).join('')}</div>`);
    setComposer(false);
  }
  function chooseSector(id, btn) {
    const cab = state.cab;
    const first = !cab.sector;
    cab.sector = id;
    if (btn) { const box = btn.closest('[data-sectors]'); $$('button', box).forEach(b => { b.classList.toggle('is-on', b === btn); }); }
    addMsg(esc(sectorName(id)), 'user');
    if (first) addMsg(`<p>Perfecto, tu proyecto queda ubicado en el sector <strong>${esc(sectorName(id))}</strong>.</p><p>A continuación, comparte tu propuesta detallada: Describe el proyecto, su público objetivo y los recursos que requieres.</p><div class="suggest">${EXAMPLES.map(e => `<button type="button" data-example="${esc(e)}">${esc(shortEx(e))}</button>`).join('')}</div>`);
    else addMsg(`<p>Listo, tu proyecto queda ubicado en el sector <strong>${esc(sectorName(id))}</strong>.</p>`);
    setComposer(true);
    setTimeout(() => $('#cabitoInput').focus(), 100);
  }
  function updateWordCount() {
    const n = wordsOf($('#cabitoInput').value), wc = $('#wordCount');
    wc.textContent = `${n} / ${WORD_LIMIT} palabras`;
    wc.classList.toggle('is-warn', n > WORD_LIMIT * 0.85 && n <= WORD_LIMIT);
    wc.classList.toggle('is-over', n > WORD_LIMIT);
    $('#cabitoSend').disabled = $('#cabitoInput').disabled || n === 0 || n > WORD_LIMIT;
  }
  function cabitoSubmit(text) {
    text = text.trim();
    const n = wordsOf(text);
    if (!n || !state.cab?.sector) return;
    if (n > WORD_LIMIT) { toast(`Máximo ${WORD_LIMIT} palabras (llevas ${n})`); return; }
    addMsg(esc(text), 'user');
    $('#cabitoInput').value = '';
    updateWordCount();
    state.cab.text = state.cab.text ? `${state.cab.text}\n${text}` : text;
    const typing = addMsg('<span class="typing"><i></i><i></i><i></i></span>');
    setTimeout(() => { typing.remove(); cabitoRespond(); }, 900 + Math.random() * 400);
  }
  function cabitoRespond() {
    const cab = state.cab;
    const res = analyze(cab.text);
    cab.result = res;
    if (!res.picks.length) {
      addMsg(`<p>Aún no encuentro suficientes pistas para armar tu equipo.</p><p>Cuéntame un poco más: qué vas a hacer (evento, app, empaque, exposición, artículo…) y sobre qué tema (sostenibilidad, salud, comunidad, interiores…).</p>`);
      return;
    }
    const draft = newProject({ id: cab.draft?.id || uid('pj'), origen: 'cabito', sector: cab.sector, descripcion: cab.text, titulo: suggestTitle(cab.text), areas: res.hits.slice(0, 4).map(h => h.area.id) });
    draft.tipo = detectTipo(draft);
    const sup = supportFor(draft);
    const uniq = [...new Map(res.hits.map(h => [h.area.id, h])).values()].slice(0, 6);
    addMsg(`
      <p>Identifiqué estas áreas de diseño clave en tu propuesta:</p>
      <div class="kw">${uniq.map(h => `<span style="--c:${h.nicho.color}">${esc(h.area.nombre)}</span>`).join('')}</div>
      <p>Te sugiero este equipo de trabajo.</p>
      <div class="rec-list">${res.picks.map((r, i) => {
        const n = state.nicheById.get(r.p.nicho), pct = Math.round(62 + 36 * (r.score / res.max) - i * 3);
        return `<div class="rec" style="--c:${n.color};animation-delay:${i * 80}ms">${avatarHTML(r.p)}<div class="rec__top"><strong>${esc(r.p.nombre)}</strong><span class="rec__score">${pct}%</span></div><div class="rec__why">${r.why.length ? 'Coincide en ' + esc(r.why.slice(0, 2).join(', ')) : esc(n.nombre)} · <button type="button" data-open="${r.p.id}" style="all:unset;color:var(--primary);cursor:pointer">ver perfil</button></div><label class="rec__in" title="Incluir en el equipo"><input type="checkbox" data-include="${r.p.id}" checked></label><div class="rec__bar"><i style="--w:${pct}%"></i></div></div>`;
      }).join('')}</div>`, 'bot', 'msg--wide');
    const apoyos = [sup.espacios[0], sup.espacios[1], sup.acompanamiento[0], sup.financiacion[0]].filter(Boolean).map(x => x[0]);
    addMsg(`<p>La universidad puede apoyarte con:</p><ul class="msg-list">${[...new Set(apoyos)].map(x => `<li>${esc(x)}</li>`).join('')}</ul>`);
    addMsg(`<p>Con esta información generé el brief de tu proyecto. Entra aquí para ajustar el equipo, revisar los apoyos universitarios, descargar el PDF o enviarlo como propuesta.</p>
      <div class="rec-actions"><button class="btn btn--primary btn--sm" type="button" data-manage>Gestiona tu proyecto</button><button class="btn btn--ghost btn--sm" type="button" data-team>Ver equipo en la red</button></div>
      <p class="countdown" data-countdown>Se abrirá automáticamente en <b>${AUTO_OPEN_S}</b> s · <button type="button" data-stay>Quedarme en el chat</button></p>`);
    cab.draft = draft;
    startAutoOpen();
  }
  // Tiempo antes de abrir el proyecto: largo y cancelable (cualquier interacción con el chat lo detiene)
  function stopAutoOpen(hide = true) {
    const cab = state.cab; if (!cab) return;
    clearInterval(cab.autoOpen); cab.autoOpen = null;
    if (hide) $$('#cabitoLog [data-countdown]').forEach(el => el.remove());
  }
  function startAutoOpen() {
    const cab = state.cab;
    stopAutoOpen(false);
    $$('#cabitoLog [data-countdown]').slice(0, -1).forEach(el => el.remove());
    let left = AUTO_OPEN_S;
    cab.autoOpen = setInterval(() => {
      left--;
      const b = $('#cabitoLog [data-countdown] b');
      if (b) b.textContent = left;
      if (left <= 0) {
        stopAutoOpen();
        if ($('#cabito').classList.contains('is-open') && !$('#pmModal').classList.contains('is-open')) openCabitoProject();
      }
    }, 1000);
  }
  function openCabitoProject() {
    const cab = state.cab;
    if (!cab?.draft) return;
    stopAutoOpen();
    const lists = $$('#cabitoLog .rec-list');
    const lastSet = lists.length ? $$('[data-include]', lists[lists.length - 1]).filter(i => i.checked).map(i => i.dataset.include) : [];
    const existing = state.proyectos.find(p => p.id === cab.draft.id);
    const p = existing ? { ...existing, descripcion: cab.draft.descripcion, sector: cab.draft.sector, areas: cab.draft.areas, tipo: existing.tipo || cab.draft.tipo } : { ...cab.draft };
    p.participantes = lastSet.filter(id => id !== state.me?.id);
    p.autor = p.autor || state.me?.id || null;
    if (innerWidth <= 680) toggleCabito(false);
    openPM(p, 'brief');
    state.pm.dirty = true;
    // Si hay sesión, queda guardado en Borradores desde ya
    if (state.me) { p.autor = state.me.id; state.pm.p.autor = state.me.id; if (!existing) { saveProject({ ...JSON.parse(JSON.stringify(state.pm.p)), borrador: true }); updatePMStatus(); } }
  }
  function showTeam(ids) {
    const set = new Set(ids);
    if (state.page !== 'panal') setView('panal');
    if (state.focus) closeFocus(false);
    const cells = state.cells.filter(c => c.type === 'perfil' && set.has(c.id));
    highlight(c => cells.includes(c));
    fitTo(cells, true, 1.1);
    if (innerWidth <= 680) toggleCabito(false);
    toast('Tu equipo sugerido está resaltado en la red');
  }
  function toggleCabito(force) {
    const panel = $('#cabito'), open = force ?? !panel.classList.contains('is-open');
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    $('#cabitoFab').setAttribute('aria-expanded', String(open));
    if (open && !state.cab) cabitoWelcome();
    if (!open && state.cab) stopAutoOpen();
  }
  function setupCabito() {
    $('#cabitoFab').addEventListener('click', () => toggleCabito());
    $('#cabitoClose').addEventListener('click', () => toggleCabito(false));
    $('#cabitoReset').addEventListener('click', () => { stopAutoOpen(); cabitoWelcome(); clearMatch(); });
    $('#teamBtn').addEventListener('click', () => toggleCabito(true));
    $('#cabitoInput').addEventListener('input', () => { updateWordCount(); if (state.cab?.autoOpen) stopAutoOpen(); });
    $('#cabitoInput').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); cabitoSubmit($('#cabitoInput').value); } });
    $('#cabitoForm').addEventListener('submit', e => { e.preventDefault(); cabitoSubmit($('#cabitoInput').value); });
    $('#cabitoLog').addEventListener('click', e => {
      const sec = e.target.closest('[data-sectors] [data-sector]');
      if (sec) { if (sec.dataset.sector !== state.cab.sector) chooseSector(sec.dataset.sector, sec); return; }
      const ex = e.target.closest('[data-example]');
      if (ex) { $('#cabitoInput').value = ex.dataset.example; updateWordCount(); $('#cabitoInput').focus(); return; }
      const op = e.target.closest('[data-open]');
      if (op) { e.preventDefault(); openProfile(op.dataset.open); return; }
      if (e.target.closest('[data-stay]')) { stopAutoOpen(); return; }
      if (e.target.closest('[data-include]')) { stopAutoOpen(); return; }
      if (e.target.closest('[data-manage]')) { openCabitoProject(); return; }
      if (e.target.closest('[data-team]')) { const l = $$('#cabitoLog .rec-list'); showTeam(l.length ? $$('[data-include]', l[l.length - 1]).filter(i => i.checked).map(i => i.dataset.include) : []); }
    });
    updateWordCount();
  }

  /* =========================================================
     BÚSQUEDA
     ========================================================= */
  function setupSearch() {
    const input = $('#searchInput');
    let t;
    input.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const q = norm(input.value);
        if (q.length < 2) { clearMatch(); return; }
        const ids = new Set(state.perfiles.filter(p => norm([p.nombre, p.ciudad, ...(p.habilidades || []), ...p.areas.map(a => state.areaById.get(a).nombre), state.nicheById.get(p.nicho).nombre].join(' ')).includes(q)).map(p => p.id));
        const areaIds = new Set([...state.areaById.values()].filter(a => norm(a.nombre).includes(q)).map(a => a.id));
        if (!highlight(c => (c.type === 'perfil' && ids.has(c.id)) || (c.type === 'area' && areaIds.has(c.id)))) toast('Sin coincidencias en la red');
      }, 200);
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { const hits = state.cells.filter(c => c.el.classList.contains('is-match')); if (hits.length) fitTo(hits, true, 1.3); }
      if (e.key === 'Escape') { input.value = ''; clearMatch(); input.blur(); }
    });
  }

  /* =========================================================
     EVENTOS GLOBALES
     ========================================================= */
  function requireLoginFor(action) {
    if (state.me) return true;
    openLogin(`Inicia sesión para ${action}.`);
    return false;
  }
  function setupGlobal() {
    $('#joinBtn').addEventListener('click', openOnboarding);
    $('#loginBtn').addEventListener('click', () => openLogin());
    $('#meBtn').addEventListener('click', () => state.me && openProfile(state.me.id));
    $('#toJoin').addEventListener('click', openOnboarding);
    $('#loginForm').addEventListener('submit', doLogin);
    $('#brandBtn').addEventListener('click', () => { renderAbout(); openModal('#aboutModal'); });
    $('#confirmOk').addEventListener('click', () => { const cb = confirmCb; confirmCb = null; closeModal('#confirmModal'); cb && cb(); });
    $$('.modal [data-close]').forEach(b => b.addEventListener('click', () => closeModal('#' + b.closest('.modal').id)));
    $$('[data-toggle-pass]').forEach(b => b.addEventListener('click', () => { const i = $('#' + b.dataset.togglePass), show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.textContent = show ? 'Ocultar' : 'Mostrar'; }));
    $$('.tabs__btn').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
    window.addEventListener('hashchange', () => setView(location.hash === '#proyectos' ? 'proyectos' : 'panal'));

    $('#drawerClose').addEventListener('click', closeProfile);
    $('#drawerScrim').addEventListener('click', closeProfile);
    $('#drawer').addEventListener('click', e => {
      const q = s => e.target.closest(s);
      if (q('[data-pf-tab]')) return setProfileTab(q('[data-pf-tab]').dataset.pfTab);
      if (q('[data-locate]')) return locateProfile(q('[data-locate]').dataset.locate);
      if (q('[data-logout]')) return logout();
      if (q('[data-delete-me]')) return confirmBox({ title: '¿Eliminar tu perfil?', text: 'Se borrarán tu perfil, tus áreas, tus enlaces y los proyectos que lideras. Dejarás de aparecer en la red y esta acción no se puede deshacer.', ok: 'Eliminar mi perfil', onOk: deleteMe });
      if (q('[data-change]')) return $(q('[data-change]').dataset.change === 'avatar' ? '#avatarFile' : '#bannerFile').click();
      if (q('[data-new-project]')) return openPM(newProject());
      if (q('[data-del-draft]')) { const id = q('[data-del-draft]').dataset.delDraft; return confirmBox({ title: '¿Eliminar este borrador?', text: 'El borrador se borrará y no se puede recuperar.', onOk: () => { deleteProject(id); openProfile(state.me.id, 'borradores'); } }); }
      if (q('[data-edit]')) { const p = state.proyectos.find(x => x.id === q('[data-edit]').dataset.edit); if (p) openPM(p); return; }
      if (q('[data-project]')) return openProjectDetail(q('[data-project]').dataset.project);
    });
    $('#avatarFile').addEventListener('change', e => { changeImage('avatar', e.target.files[0]); e.target.value = ''; });
    $('#bannerFile').addEventListener('change', e => { changeImage('banner', e.target.files[0]); e.target.value = ''; });

    $('#legend').addEventListener('click', e => { const b = e.target.closest('[data-nicho]'); if (!b) return; state.focus === b.dataset.nicho ? closeFocus() : focusNiche(b.dataset.nicho); });
    $('#nicheCard').addEventListener('click', e => {
      if (e.target.closest('[data-back]')) return closeFocus();
      const a = e.target.closest('[data-area]'); if (a) return onAreaClick(a.dataset.area);
      const p = e.target.closest('[data-profile]'); if (p) openProfile(p.dataset.profile);
    });

    // Proyectos
    $('#newProjectBtn').addEventListener('click', () => { if (requireLoginFor('publicar un proyecto')) openPM(newProject()); });
    $('#statusFilter').addEventListener('click', e => { const b = e.target.closest('[data-estado]'); if (!b) return; state.filter.estado = b.dataset.estado; renderProjects(); $('#viewProyectos').scrollTop = 0; });
    $('#sectorFilter').addEventListener('click', e => { const b = e.target.closest('[data-sector]'); if (!b) return; state.filter.sector = b.dataset.sector; renderProjects(); $('#viewProyectos').scrollTop = 0; });
    $('#projectStack').addEventListener('click', e => {
      if (e.target.closest('[data-new-project]')) { if (requireLoginFor('publicar un proyecto')) openPM(newProject()); return; }
      const c = e.target.closest('[data-project]'); if (c) openProjectDetail(c.dataset.project);
    });
    $('#projectStack').addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-project]')) { e.preventDefault(); openProjectDetail(e.target.dataset.project); } });
    let raf;
    $('#viewProyectos').addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(stackEffect); }, { passive: true });
    $('#pdBody').addEventListener('click', e => {
      const q = s => e.target.closest(s);
      if (q('[data-open]')) { closeModal('#pdModal'); return openProfile(q('[data-open]').dataset.open); }
      if (q('[data-edit]')) { const p = state.proyectos.find(x => x.id === q('[data-edit]').dataset.edit); if (p) openPM(p); return; }
      if (q('[data-pdf]')) { const p = state.proyectos.find(x => x.id === q('[data-pdf]').dataset.pdf); if (p) downloadPDF(JSON.parse(JSON.stringify(p))); return; }
      if (q('[data-del-project]')) { const id = q('[data-del-project]').dataset.delProject; confirmBox({ title: '¿Eliminar este proyecto?', text: 'Dejará de aparecer en Proyectos y en los perfiles del equipo.', onOk: () => { deleteProject(id); closeModal('#pdModal'); renderProjects(); toast('Proyecto eliminado'); } }); }
    });

    document.addEventListener('keydown', e => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
      if (e.key === 'Escape') {
        if (!$('#pmSug')?.hidden && $('#pmSug')) { $('#pmSug').hidden = true; return; }
        const m = topModal(); if (m) return closeModal(m);
        if ($('#drawer').classList.contains('is-open')) return closeProfile();
        if ($('#cabito').classList.contains('is-open')) return toggleCabito(false);
        if (state.focus) return closeFocus();
        clearMatch();
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey || topModal() || state.page !== 'panal') return;
      if (e.key === '+' || e.key === '=') zoomAt(1.25, undefined, undefined, true);
      if (e.key === '-' || e.key === '_') zoomAt(0.8, undefined, undefined, true);
      if (e.key === '0') state.focus ? closeFocus() : fitAll();
      const st = 80;
      if (e.key === 'ArrowLeft') { state.view.x += st; applyView(true); }
      if (e.key === 'ArrowRight') { state.view.x -= st; applyView(true); }
      if (e.key === 'ArrowUp') { state.view.y += st; applyView(true); }
      if (e.key === 'ArrowDown') { state.view.y -= st; applyView(true); }
    });
  }

  /* =========================================================
     INICIO
     ========================================================= */
  async function init() {
    let data;
    try { data = await loadData(); }
    catch (err) {
      $('#loader').textContent = 'No se pudo cargar data.json. Publica el sitio en GitHub Pages o ábrelo con un servidor local.';
      $('#intro').classList.add('is-out'); console.error(err); return;
    }
    indexData(data);
    renderLegend(); computeLayout(); renderWorld(); renderStats(); renderNav();
    $('#loader').classList.add('is-hidden');
    fitAll(false);
    setupCamera(); setupTooltip(); setupOnboarding(); bindPM(); setupCabito(); setupSearch(); setupGlobal();
    if (location.hash === '#proyectos') setView('proyectos');
    runIntro();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
