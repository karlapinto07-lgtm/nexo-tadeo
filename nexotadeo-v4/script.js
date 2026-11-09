/* =========================================================
   NEXOTADEO · v4 — Red de gestión de conocimiento
   Vanilla JS, sin compilación. Pensado para GitHub Pages.
   Estructura: datos → red (panal) → vistas (proyectos, equipos,
   board, perfil) → registro/sesión → Cabito (ayuda y proyectos).
   Todo lo que crea el usuario se guarda en localStorage
   (prototipo sin servidor).
   ========================================================= */
(() => {
  'use strict';

  const SQRT3 = Math.sqrt(3);
  const HEX_R = 84;               // radio de layout de cada celda (px)
  const HEX_GAP = 18;             // espacio entre celdas: por ahí corren las líneas de conexión
  const CLUSTER_D = 4;            // distancia (en celdas) entre panales de nichos vecinos
  const WORD_LIMIT = 300;         // límite de palabras del asistente de proyectos
  const AUTO_OPEN_S = 15;         // segundos antes de abrir el proyecto armado con Cabito
  const MAX_AREAS = 3;
  const STORE_KEY = 'nexotadeo.v4';
  const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  const MIN_S = 0.18, MAX_S = 2.6;
  const JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  const AVATARS = Array.from({ length: 28 }, (_, i) => `av${String(i + 1).padStart(2, '0')}`);
  const avatarSrc = id => `assets/avatars/${id}.png`;
  // Colores sugeridos para el fondo del avatar: suaves (legibles) + colores de nicho
  const AV_COLORS = ['#FFD6E8', '#FFE0E0', '#FFF1C7', '#D8F3E3', '#DCEBFB', '#F1DDF7', '#E5383B', '#F7B500', '#23A55A', '#3466C2', '#F06424', '#5FA8F0', '#B62BD4'];
  const PART_ROLES = ['Líder del proyecto', 'Diseño', 'Investigación', 'Prototipado', 'Producción', 'Gestión', 'Comunicación', 'Ilustración', 'Otro'];

  const FALLBACK_DATA = {"meta":{"nombre":"NexoTadeo","subtitulo":"Red de gestión de conocimiento","version":"4.0.0","claveDemo":"nexo2026","dominio":"utadeo.edu.co","correoUniversidad":"","correoComentarios":""},"nichos":[{"id":"producto","nombre":"Producto, Objetos y Mobiliario","corto":"Producto y Mobiliario","color":"#E5383B","texto":"#FFFFFF","descripcion":"Diseño de objetos tangibles que habitan la vida cotidiana: mobiliario, empaques, componentes y productos industriales pensados para fabricarse, usarse y durar.","keywords":["producto","objeto","fisico","fabricacion","taller de madera"],"areas":[{"id":"producto-objetos","nombre":"Diseño de Objetos","keywords":["objeto","utensilio","accesorio","lampara","juguete","joyeria","artesan"]},{"id":"producto-empaques","nombre":"Diseño de Empaques, Envases y Moldes","keywords":["empaq","envas","molde","packaging","etiqueta","botella","caja","embalaje"]},{"id":"producto-mobiliario","nombre":"Diseño de Mobiliario","keywords":["mueble","mobiliar","silla","mesa","estanteria","exhibidor","banca","madera"]},{"id":"producto-industriales","nombre":"Diseño de Productos Industriales","keywords":["industrial","manufactur","prototip","electrodomest","maquina","produccion","serie"]},{"id":"producto-componentes","nombre":"Diseño de Componentes de Productos","keywords":["componente","pieza","ensambl","mecanism","cad","impresion 3d","repuesto"]}]},{"id":"servicios","nombre":"Servicios, Interacción y Experiencias","corto":"Servicios y Experiencias","color":"#F7B500","texto":"#2B2100","descripcion":"Diseño de lo intangible: servicios, puntos de contacto y experiencias memorables que conectan a las personas con marcas, lugares y comunidades.","keywords":["interaccion","cliente","publico","asistentes","visitantes"],"areas":[{"id":"servicios-servicios","nombre":"Diseño de Servicios","keywords":["servicio","atencion","customer","journey","blueprint","turismo","restaurante"]},{"id":"servicios-prodserv","nombre":"Diseño de Productos y Servicios","keywords":["producto-servicio","plataforma","suscrip","ecosistema de marca","omnicanal"]},{"id":"servicios-experiencias","nombre":"Diseño de Experiencias","keywords":["experiencia","evento","activacion","inmersiv","festival","encuentro","feria","lanzamiento"]}]},{"id":"sostenibilidad","nombre":"Sostenibilidad y Ecodiseño","corto":"Sostenibilidad","color":"#23A55A","texto":"#FFFFFF","descripcion":"Diseño responsable con el planeta: materiales de bajo impacto, procesos limpios y productos que se reparan, se reutilizan y vuelven al ciclo.","keywords":["eco","verde","planeta","ambiental","medio ambiente"],"areas":[{"id":"sostenibilidad-manufactura","nombre":"Manufactura Sostenible","keywords":["sosten","reciclad","residuo","biomaterial","compost","ecologic","material"]},{"id":"sostenibilidad-tecnologia","nombre":"Diseño, Sostenibilidad y Tecnología","keywords":["energia","solar","tecnolog","agua","clima","huella","emision"]},{"id":"sostenibilidad-circulares","nombre":"Diseño de Productos Circulares","keywords":["circular","reutiliz","reparar","upcycl","ciclo de vida","segunda vida","desecho","reciclaje"]}]},{"id":"habitat","nombre":"Hábitat y Bienestar","corto":"Hábitat y Bienestar","color":"#3466C2","texto":"#FFFFFF","descripcion":"Diseño de espacios y entornos que cuidan a las personas: interiores, salud, ergonomía y estímulos sensoriales para habitar mejor.","keywords":["habitat","habitar","entorno","lugar"],"areas":[{"id":"habitat-interiores","nombre":"Diseño de Interiores","keywords":["interior","espacio","vivienda","oficina","local","tienda","iluminacion","habitacion","casa"]},{"id":"habitat-salud","nombre":"Salud y Bienestar Humano","keywords":["salud","bienestar","hospital","ergonom","adulto mayor","discapacid","terapia","inclusi","accesib"]},{"id":"habitat-sensorial","nombre":"Diseño Sensorial y Perceptivo","keywords":["sensorial","sentido","tacto","sonido","olfat","percep","textura","aroma"]}]},{"id":"gestion","nombre":"Gestión, Innovación y Estrategia","corto":"Gestión y Estrategia","color":"#F06424","texto":"#FFFFFF","descripcion":"El diseño como motor de decisiones: conceptos, sistemas y estrategias que convierten ideas en organizaciones, marcas y negocios viables.","keywords":["gestion","innovacion","empresa","proyecto"],"areas":[{"id":"gestion-concepto","nombre":"Diseño de Concepto","keywords":["concepto","ideacion","naming","propuesta","creativ","storytelling"]},{"id":"gestion-sistemas","nombre":"Diseño de Sistemas","keywords":["sistema","proceso","logistic","organizac","operacion","flujo","cadena"]},{"id":"gestion-estrategias","nombre":"Diseño de Estrategias","keywords":["estrateg","negocio","emprend","mercado","marca","startup","branding","financ","vender"]}]},{"id":"social","nombre":"Innovación Social y Pedagogía","corto":"Innovación Social","color":"#5FA8F0","texto":"#06213D","descripcion":"Diseño con y para las comunidades: educación, cultura, investigación y trabajo en territorio para transformar realidades desde lo colectivo.","keywords":["social","pedagog","cultura","colectivo","ciudadan"],"areas":[{"id":"social-educacion","nombre":"Educación y Gestión Cultural","keywords":["educa","taller","cultural","aprendiz","colegio","escuela","curso","niños","ninos","jovenes"]},{"id":"social-museografico","nombre":"Diseño Museográfico","keywords":["museo","museograf","exposicion","exhibicion","curadur","patrimonio","galeria","memoria"]},{"id":"social-investigacion","nombre":"Investigación","keywords":["investiga","articulo","publicacion","paper","revista","academ","ponencia","tesis","congreso"]},{"id":"social-territorio","nombre":"Trabajo en Territorio","keywords":["territori","comunidad","rural","barrio","campesin","cocrea","co-crea","vereda","region"]}]},{"id":"uxui","nombre":"UX/UI","corto":"UX/UI","color":"#B62BD4","texto":"#FFFFFF","descripcion":"Diseño de experiencias digitales: interfaces, investigación con usuarios, realidades extendidas y productos conectados que se sienten naturales.","keywords":["digital","ux","tecnologia digital","software"],"areas":[{"id":"uxui-xr","nombre":"Realidad Virtual, Aumentada y Mixta","keywords":["realidad","virtual","aumentad","vr","ar","xr","metaverso","mixta","unity"]},{"id":"uxui-research","nombre":"Investigación de Usuario","keywords":["usuario","entrevist","usabilid","test","insight","encuesta","research"]},{"id":"uxui-iot","nombre":"Ecosistemas IoT y Productos Conectados","keywords":["iot","conectad","sensor","arduino","smart","inteligente","domotic","wearable"]},{"id":"uxui-interfaz","nombre":"Interfaz","keywords":["interfaz","app","aplicacion","web","pagina","ui","dashboard","figma","movil","sitio"]}]}],"perfiles":[{"id":"p01","nombre":"Luisa Hernández","genero":"F","rol":"estudiante","semestre":8,"foto":"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&h=240&fit=crop&crop=faces","ciudad":"Bogotá","correo":"luisa.hernandez@utadeo.edu.co","bio":"Diseñadora industrial en formación. Me apasiona el mobiliario modular y optimizar piezas para producción en serie sin perder calidez.","nicho":"producto","areas":["producto-mobiliario","producto-componentes"],"habilidades":["Desarrollo en serie","Optimización","Rhino 3D"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=mobiliario","instagram":"https://www.instagram.com/explore/tags/mobiliario/"},"tagline":"Mobiliario modular que se arma sin herramientas.","abierto":true,"productos":[{"id":"p01-pr1","titulo":"Banco Pliegue","descripcion":"Banco modular de contrachapado que se arma por encaje.","anio":"2025","forma":"mueble","imagenes":[],"enlace":""},{"id":"p01-pr2","titulo":"Repisa Nodo","descripcion":"Sistema de repisas con un solo tipo de unión impresa en 3D.","anio":"2024","forma":"repisa","imagenes":[],"enlace":""}],"trayectoria":[{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"8.º semestre"}]},{"id":"p02","nombre":"Franco Díaz","genero":"M","rol":"egresado","semestre":null,"foto":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop&crop=faces","ciudad":"Medellín","correo":"franco.diaz@utadeo.edu.co","bio":"Diseñador de empaques con 6 años en la industria de alimentos. Desarrollo envases, moldes y prototipos listos para línea de producción.","nicho":"producto","areas":["producto-empaques","producto-industriales"],"habilidades":["Packaging","SolidWorks","Moldes"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=packaging","instagram":"https://www.instagram.com/explore/tags/packagingdesign/"},"tagline":"Empaques que llegan a la línea de producción listos.","abierto":false,"productos":[{"id":"p02-pr1","titulo":"Envase Grano","descripcion":"Empaque compostable para café de origen.","anio":"2025","forma":"envase","imagenes":[],"enlace":""}],"trayectoria":[{"cargo":"Diseñador de empaques","lugar":"Alimentos del Valle","periodo":"2020 – hoy"},{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"Egresado 2019"}]},{"id":"p03","nombre":"María Camila Rojas","genero":"F","rol":"egresado","semestre":null,"foto":"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=faces","ciudad":"Bogotá","correo":"maria.rojas@utadeo.edu.co","bio":"Service designer. Mapeo customer journeys y diseño blueprints para que los servicios funcionen tan bien por dentro como se ven por fuera.","nicho":"servicios","areas":["servicios-servicios","servicios-experiencias"],"habilidades":["Customer journeys","Service blueprint","Facilitación"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=service%20design","instagram":"https://www.instagram.com/explore/tags/servicedesign/"},"tagline":"Servicios que funcionan por dentro y se sienten por fuera.","abierto":true,"productos":[],"trayectoria":[{"cargo":"Service designer","lugar":"Estudio Trama","periodo":"2023 – hoy"},{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"Egresada 2022"}]},{"id":"p04","nombre":"Mario Guerrero","genero":"M","rol":"estudiante","semestre":6,"foto":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=faces","ciudad":"Cali","correo":"mario.guerrero@utadeo.edu.co","bio":"Me encanta diseñar experiencias: activaciones de marca, ferias y encuentros donde la gente participa en lugar de solo mirar.","nicho":"servicios","areas":["servicios-experiencias","servicios-prodserv"],"habilidades":["Eventos","Activaciones","Escenografía"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=experience%20design","instagram":"https://www.instagram.com/explore/tags/experiencedesign/"},"tagline":"Experiencias donde la gente participa.","abierto":false,"productos":[],"trayectoria":[{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"6.º semestre"}]},{"id":"p05","nombre":"Valentina Ospina","genero":"F","rol":"egresado","semestre":null,"foto":"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=240&h=240&fit=crop&crop=faces","ciudad":"Bogotá","correo":"valentina.ospina@utadeo.edu.co","bio":"Investigo biomateriales a partir de residuos agrícolas y los convierto en productos circulares de baja huella.","nicho":"sostenibilidad","areas":["sostenibilidad-circulares","sostenibilidad-manufactura"],"habilidades":["Biomateriales","Análisis de ciclo de vida","Upcycling"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=biomaterials","instagram":"https://www.instagram.com/explore/tags/biomaterials/"},"tagline":"Diseño con lo que otros botan: biomateriales y objetos circulares.","abierto":true,"productos":[{"id":"p05-pr1","titulo":"Banco Raíz","descripcion":"Banco de plástico postconsumo recuperado en Bogotá.","anio":"2025","forma":"mueble","imagenes":[],"enlace":""},{"id":"p05-pr2","titulo":"Matera Cáscara","descripcion":"Matera de biomaterial a partir de cáscara de café.","anio":"2024","forma":"matera","imagenes":[],"enlace":""},{"id":"p05-pr3","titulo":"Lámpara Bagazo","descripcion":"Pantalla de fibra de caña prensada.","anio":"2024","forma":"lampara","imagenes":[],"enlace":""}],"trayectoria":[{"cargo":"Fundadora","lugar":"Raíz Material","periodo":"2025 – hoy"},{"cargo":"Investigadora","lugar":"Laboratorio de Materiales Utadeo","periodo":"2023 – 2024"},{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"Egresada 2024"}]},{"id":"p06","nombre":"Samuel Restrepo","genero":"M","rol":"estudiante","semestre":9,"foto":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&crop=faces","ciudad":"Bucaramanga","correo":"samuel.restrepo@utadeo.edu.co","bio":"Cruzo diseño y tecnología limpia: prototipos con energía solar y sistemas de captación de agua para zonas rurales.","nicho":"sostenibilidad","areas":["sostenibilidad-tecnologia","sostenibilidad-manufactura"],"habilidades":["Energía solar","Prototipado","Arduino"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=solar%20design","instagram":"https://www.instagram.com/explore/tags/ecodesign/"},"tagline":"Prototipos con energía limpia para zonas rurales.","abierto":true,"productos":[{"id":"p06-pr1","titulo":"Cargador Sol","descripcion":"Cargador solar plegable para veredas sin red eléctrica.","anio":"2025","forma":"solar","imagenes":[],"enlace":""}],"trayectoria":[{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"9.º semestre"}]},{"id":"p07","nombre":"Daniela Cárdenas","genero":"F","rol":"egresado","semestre":null,"foto":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop&crop=faces","ciudad":"Bogotá","correo":"daniela.cardenas@utadeo.edu.co","bio":"Diseñadora de interiores enfocada en iluminación y en espacios comerciales que se sienten, se escuchan y se recuerdan.","nicho":"habitat","areas":["habitat-interiores","habitat-sensorial"],"habilidades":["Iluminación","SketchUp","Retail"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=interior%20design","instagram":"https://www.instagram.com/explore/tags/interiordesign/"},"tagline":"Espacios que se sienten, se escuchan y se recuerdan.","abierto":false,"productos":[{"id":"p07-pr1","titulo":"Lámpara Curití","descripcion":"Lámpara de fique tejida con artesanas de Curití.","anio":"2025","forma":"lampara","imagenes":[],"enlace":""}],"trayectoria":[{"cargo":"Diseñadora de interiores","lugar":"Luz & Forma","periodo":"2021 – hoy"},{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"Egresada 2020"}]},{"id":"p08","nombre":"Andrés Molina","genero":"M","rol":"estudiante","semestre":7,"foto":"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop&crop=faces","ciudad":"Tunja","correo":"andres.molina@utadeo.edu.co","bio":"Diseño para la salud: ayudas técnicas, ergonomía y entornos accesibles para adultos mayores y personas con discapacidad.","nicho":"habitat","areas":["habitat-salud","habitat-interiores"],"habilidades":["Ergonomía","Diseño inclusivo","Accesibilidad"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=inclusive%20design","instagram":"https://www.instagram.com/explore/tags/inclusivedesign/"},"tagline":"Diseño para la salud y la autonomía.","abierto":true,"productos":[{"id":"p08-pr1","titulo":"Agarre+","descripcion":"Adaptador de cubiertos para personas con artritis.","anio":"2024","forma":"agarre","imagenes":[],"enlace":""}],"trayectoria":[{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"7.º semestre"}]},{"id":"p09","nombre":"Laura Beltrán","genero":"F","rol":"egresado","semestre":null,"foto":"https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&h=240&fit=crop&crop=faces","ciudad":"Bogotá","correo":"laura.beltran@utadeo.edu.co","bio":"Estratega de marca y design thinking. Acompaño emprendimientos desde el concepto hasta el modelo de negocio.","nicho":"gestion","areas":["gestion-estrategias","gestion-concepto"],"habilidades":["Branding estratégico","Design thinking","Naming"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=branding%20strategy","instagram":"https://www.instagram.com/explore/tags/branding/"},"tagline":"De la idea al modelo de negocio.","abierto":false,"productos":[],"trayectoria":[{"cargo":"Estratega de marca","lugar":"Independiente","periodo":"2022 – hoy"},{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"Egresada 2021"}]},{"id":"p10","nombre":"Julián Pardo","genero":"M","rol":"estudiante","semestre":10,"foto":"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&h=240&fit=crop&crop=faces","ciudad":"Bogotá","correo":"julian.pardo@utadeo.edu.co","bio":"Me interesa cómo funcionan las organizaciones por dentro: procesos, logística y sistemas que hacen escalar a una startup.","nicho":"gestion","areas":["gestion-sistemas","gestion-estrategias"],"habilidades":["Modelos de negocio","Lean","Mapas de sistema"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=system%20design","instagram":"https://www.instagram.com/explore/tags/designmanagement/"},"tagline":"Sistemas que hacen escalar a los equipos.","abierto":false,"productos":[],"trayectoria":[{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"10.º semestre"}]},{"id":"p11","nombre":"Sofía Martínez","genero":"F","rol":"estudiante","semestre":5,"foto":"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&h=240&fit=crop&crop=faces","ciudad":"Villavicencio","correo":"sofia.martinez@utadeo.edu.co","bio":"Co-creo con comunidades rurales. Diseño talleres y herramientas pedagógicas para que el conocimiento local se quede en el territorio.","nicho":"social","areas":["social-territorio","social-educacion"],"habilidades":["Co-creación","Talleres","Cartografía social"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=social%20design","instagram":"https://www.instagram.com/explore/tags/socialdesign/"},"tagline":"Herramientas pedagógicas con comunidades.","abierto":true,"productos":[],"trayectoria":[{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"5.º semestre"}]},{"id":"p12","nombre":"Camilo Vargas","genero":"M","rol":"egresado","semestre":null,"foto":"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&h=240&fit=crop&crop=faces","ciudad":"Bogotá","correo":"camilo.vargas@utadeo.edu.co","bio":"Museógrafo e investigador. Diseño exposiciones sobre memoria y patrimonio, y publico artículos sobre diseño y cultura.","nicho":"social","areas":["social-museografico","social-investigacion"],"habilidades":["Curaduría","Escritura académica","Montaje expositivo"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=exhibition%20design","instagram":"https://www.instagram.com/explore/tags/exhibitiondesign/"},"tagline":"Exposiciones sobre memoria y patrimonio.","abierto":false,"productos":[],"trayectoria":[{"cargo":"Museógrafo","lugar":"Museo de Bogotá","periodo":"2019 – hoy"},{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"Egresado 2018"}]},{"id":"p13","nombre":"Isabella Torres","genero":"F","rol":"egresado","semestre":null,"foto":"https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=240&h=240&fit=crop&crop=faces","ciudad":"Bogotá","correo":"isabella.torres@utadeo.edu.co","bio":"Product designer UX/UI. Investigo con usuarios, prototipo en Figma y construyo design systems para apps y plataformas web.","nicho":"uxui","areas":["uxui-interfaz","uxui-research"],"habilidades":["Figma","Design systems","Usabilidad"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=ui%20ux","instagram":"https://www.instagram.com/explore/tags/uxdesign/"},"tagline":"Productos digitales claros y accesibles.","abierto":true,"productos":[{"id":"p13-pr1","titulo":"Kit UI Salud","descripcion":"Sistema de componentes de alto contraste para apps de salud.","anio":"2025","forma":"ui","imagenes":[],"enlace":""}],"trayectoria":[{"cargo":"Product designer","lugar":"Fintech Andina","periodo":"2023 – hoy"},{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"Egresada 2022"}]},{"id":"p14","nombre":"Nicolás Herrera","genero":"M","rol":"estudiante","semestre":8,"foto":"https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=240&h=240&fit=crop&crop=faces","ciudad":"Pereira","correo":"nicolas.herrera@utadeo.edu.co","bio":"Experiencias en realidad virtual y aumentada, y objetos conectados con sensores. Unity y Arduino son mi taller.","nicho":"uxui","areas":["uxui-xr","uxui-iot"],"habilidades":["Unity","Arduino","Realidad aumentada"],"portafolio":{"linkedin":"https://www.linkedin.com/","behance":"https://www.behance.net/search/projects?search=augmented%20reality","instagram":"https://www.instagram.com/explore/tags/augmentedreality/"},"tagline":"Realidad aumentada y objetos conectados.","abierto":true,"productos":[{"id":"p14-pr1","titulo":"Guía AR Museo","descripcion":"Recorrido en realidad aumentada para el museo del campus.","anio":"2025","forma":"ar","imagenes":[],"enlace":""}],"trayectoria":[{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"8.º semestre"}]},{"id":"p15","nombre":"Paula Rincón","genero":"F","rol":"estudiante","semestre":7,"foto":"","avatar":{"img":"av12","bg":"#FFE0E0"},"avatarHistoria":"Me gusta mi pelo esponjado: así llego al taller de cerámica todos los días.","ciudad":"Bogotá","correo":"paula.rincon@utadeo.edu.co","bio":"Diseño objetos pequeños con cerámica y metal. Me interesa la joyería contemporánea hecha en Bogotá.","nicho":"producto","areas":["producto-objetos"],"habilidades":["Cerámica","Joyería","Torno"],"portafolio":{},"tagline":"","abierto":true,"productos":[],"trayectoria":[{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"7.º semestre"}]},{"id":"p16","nombre":"Tomás Acosta","genero":"M","rol":"egresado","semestre":null,"foto":"","avatar":{"img":"av27","bg":"#FFF1C7"},"avatarHistoria":"Escogí la barba porque soy el que siempre lleva el café a las sesiones.","ciudad":"Bogotá","correo":"tomas.acosta@utadeo.edu.co","bio":"Investigo con usuarios y prototipo servicios públicos más humanos.","nicho":"servicios","areas":["servicios-servicios"],"habilidades":["Investigación etnográfica","Prototipos de servicio","Miro"],"portafolio":{},"tagline":"","abierto":true,"productos":[],"trayectoria":[{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"Egresado 2025"}]},{"id":"p17","nombre":"Diego Peña","genero":"M","rol":"estudiante","semestre":9,"foto":"","avatar":{"img":"av01","bg":"#D8F3E3"},"avatarHistoria":"El turbante es por mi abuelo: me enseñó a reparar todo antes de botarlo.","ciudad":"Bogotá","correo":"diego.peña@utadeo.edu.co","bio":"Recupero madera y piezas desechadas para darles una segunda vida como mobiliario.","nicho":"sostenibilidad","areas":["sostenibilidad-circulares"],"habilidades":["Upcycling","Madera recuperada","Fusion 360"],"portafolio":{},"tagline":"","abierto":true,"productos":[],"trayectoria":[{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"9.º semestre"}]},{"id":"p18","nombre":"Mariana López","genero":"F","rol":"estudiante","semestre":8,"foto":"","avatar":{"img":"av22","bg":"#F1DDF7"},"avatarHistoria":"Mi avatar sonríe porque me encanta cuando un usuario dice \"ah, era fácil\".","ciudad":"Bogotá","correo":"mariana.lopez@utadeo.edu.co","bio":"Diseño interfaces accesibles y me encanta probarlas con personas reales.","nicho":"uxui","areas":["uxui-interfaz"],"habilidades":["Figma","Prototipado rápido","Accesibilidad web"],"portafolio":{},"tagline":"","abierto":true,"productos":[],"trayectoria":[{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"8.º semestre"}]},{"id":"p19","nombre":"Juliana Ríos","genero":"F","rol":"egresado","semestre":null,"foto":"","avatar":{"img":"av08","bg":"#DCEBFB"},"avatarHistoria":"Las gafas son de tanto leer cuentos a los niños de los talleres.","ciudad":"Bogotá","correo":"juliana.rios@utadeo.edu.co","bio":"Diseño material didáctico y talleres para colegios públicos.","nicho":"social","areas":["social-educacion"],"habilidades":["Talleres","Ilustración","Material didáctico"],"portafolio":{},"tagline":"","abierto":true,"productos":[],"trayectoria":[{"cargo":"Diseño Industrial","lugar":"Utadeo","periodo":"Egresada 2025"}]}],"sectores":[{"id":"gestion-publica","nombre":"Gestión Pública","keywords":["publica","gestion publica","alcaldia","entidad","institucion"]},{"id":"gobierno","nombre":"Gobierno","keywords":["gobierno","politica","ciudadan","participacion","gobernanza"]},{"id":"desarrollo-economico","nombre":"Desarrollo Económico","keywords":["emprend","negocio","economic","empleo","mercado","startup","feria"]},{"id":"industria-turismo","nombre":"Industria y Turismo","keywords":["industria","turis","manufactur","fabrica","hotel","ruta"]},{"id":"educacion","nombre":"Educación","keywords":["educa","colegio","escuela","pedagog","aprendiz","taller","curso"]},{"id":"salud","nombre":"Salud","keywords":["salud","hospital","medic","bienestar","paciente","adulto mayor"]},{"id":"integracion-social","nombre":"Integración Social","keywords":["comunidad","social","vulnerab","inclusi","barrio","migrante"]},{"id":"cultura","nombre":"Cultura, Recreación y Deporte","keywords":["cultura","museo","arte","deporte","recrea","patrimonio","exposicion"]},{"id":"ambiente","nombre":"Ambiente","keywords":["ambient","sosten","recicl","residuo","clima","ecolog","agua"]},{"id":"movilidad","nombre":"Movilidad","keywords":["movilidad","transporte","bicicleta","estacion","vial","peaton"]},{"id":"mujeres","nombre":"Mujeres","keywords":["mujer","genero","femenin","madres"]},{"id":"juridico","nombre":"Jurídico","keywords":["juridic","legal","norma","derecho","propiedad intelectual"]}],"proyectos":[{"id":"pr01","titulo":"Mobiliario urbano con plástico reciclado","sector":"ambiente","estado":"ejecucion","autor":"p05","participantes":["p01","p06"],"areas":["sostenibilidad-circulares","producto-mobiliario"],"descripcion":"Diseñamos bancas y bolardos modulares fabricados con plástico postconsumo recuperado en barrios de Bogotá. El proyecto mide la huella del material y prueba prototipos en dos parques piloto.","creado":"2026-08-14","imagenes":[],"enlaces":[],"borrador":false,"enviado":null,"tipo":"producto","roles":{"p05":"Lideró la investigación del material","p01":"Diseñó las piezas modulares","p06":"Prototipado y pruebas en parque"},"abierto":true,"busca":[{"rol":"Gestión","nicho":"gestion","cupos":1},{"rol":"Producto","nicho":"producto","cupos":1}],"cierra":"2026-11-14"},{"id":"pr02","titulo":"App de citas médicas para adultos mayores","sector":"salud","estado":"ejecucion","autor":"p13","participantes":["p08","p03"],"areas":["uxui-interfaz","uxui-research","habitat-salud"],"descripcion":"Una aplicación con interfaz de alto contraste y lectura en voz alta para que adultos mayores agenden y recuerden sus citas sin depender de terceros. Estamos en pruebas de usabilidad con tres centros de salud.","creado":"2026-09-02","imagenes":[],"enlaces":[],"borrador":false,"enviado":null,"tipo":"producto-digital","roles":{"p13":"Lideró el diseño de interfaz","p08":"Pruebas de accesibilidad","p03":"Mapa del servicio de citas"},"abierto":true,"busca":[{"rol":"UX/UI","nicho":"uxui","cupos":2},{"rol":"Servicios","nicho":"servicios","cupos":1}],"cierra":"2026-11-17"},{"id":"pr03","titulo":"Museo itinerante de memoria campesina","sector":"cultura","estado":"finalizado","autor":"p12","participantes":["p11","p07"],"areas":["social-museografico","social-territorio"],"descripcion":"Exposición móvil co-creada con familias campesinas de Sumapaz. Objetos, relatos y cartografías recorrieron cinco veredas y terminaron en una muestra en el campus.","creado":"2025-11-20","imagenes":[],"enlaces":[],"borrador":false,"enviado":null,"tipo":"exposicion","roles":{"p12":"Curaduría y museografía","p11":"Talleres con las familias","p07":"Iluminación del montaje"},"abierto":false,"busca":[]},{"id":"pr04","titulo":"Feria de emprendimiento de diseño local","sector":"desarrollo-economico","estado":"finalizado","autor":"p09","participantes":["p04","p10"],"areas":["gestion-estrategias","servicios-experiencias"],"descripcion":"Feria de dos días con 40 marcas de egresados y estudiantes. Diseñamos la experiencia del visitante, la señalética y un modelo de sostenibilidad para repetirla cada semestre.","creado":"2026-03-05","imagenes":[],"enlaces":[],"borrador":false,"enviado":null,"tipo":"evento","roles":{"p09":"Estrategia y modelo de sostenibilidad","p04":"Experiencia del visitante","p10":"Logística y operación"},"abierto":false,"busca":[]},{"id":"pr05","titulo":"Kit pedagógico de reciclaje para colegios","sector":"educacion","estado":"ejecucion","autor":"p11","participantes":["p05","p02"],"areas":["social-educacion","producto-empaques"],"descripcion":"Un kit de juegos y empaques didácticos para enseñar separación en la fuente a niños de primaria. Se está validando en cuatro colegios distritales.","creado":"2026-07-22","imagenes":[],"enlaces":[],"borrador":false,"enviado":null,"tipo":"producto","roles":{"p11":"Diseño pedagógico","p05":"Materiales del kit","p02":"Empaques didácticos"},"abierto":true,"busca":[{"rol":"Producto","nicho":"producto","cupos":1},{"rol":"Ilustración","nicho":"social","cupos":1}],"cierra":"2026-11-20"},{"id":"pr06","titulo":"Señalética accesible para estaciones de transporte","sector":"movilidad","estado":"ejecucion","autor":"p08","participantes":["p14","p13"],"areas":["habitat-salud","uxui-iot"],"descripcion":"Sistema de señalética táctil y sonora con balizas conectadas para personas con discapacidad visual en estaciones de transporte público.","creado":"2026-09-30","imagenes":[],"enlaces":[],"borrador":false,"enviado":null,"tipo":"producto","roles":{"p08":"Diseño inclusivo","p14":"Balizas conectadas","p13":"Señales y pictogramas"},"abierto":true,"busca":[{"rol":"Hábitat","nicho":"habitat","cupos":1},{"rol":"Prototipado","nicho":"producto","cupos":1}],"cierra":"2026-11-23"},{"id":"pr07","titulo":"Ruta de diseño en La Candelaria","sector":"industria-turismo","estado":"finalizado","autor":"p03","participantes":["p07","p04"],"areas":["servicios-servicios","habitat-interiores"],"descripcion":"Ruta turística por talleres y tiendas de diseño del centro histórico, con mapa, experiencias guiadas y un sistema de reservas para los artesanos.","creado":"2026-02-11","imagenes":[],"enlaces":[],"borrador":false,"enviado":null,"tipo":"evento","roles":{"p03":"Diseño del servicio","p07":"Puntos de la ruta","p04":"Experiencias guiadas"},"abierto":false,"busca":[]},{"id":"pr08","titulo":"Lámpara de fibra de fique","sector":"industria-turismo","estado":"ejecucion","autor":"p07","participantes":["p15"],"roles":{"p07":"Diseño de la colección","p15":"Prototipos cerámicos"},"areas":["producto-objetos","habitat-interiores"],"descripcion":"Colección de lámparas tejidas con artesanas de Curití. Buscamos llevarla a producción en serie sin perder el oficio.","creado":"2026-11-06","imagenes":[],"enlaces":[],"borrador":false,"enviado":null,"tipo":"producto","abierto":true,"busca":[{"rol":"Producto","nicho":"producto","cupos":1},{"rol":"Sostenibilidad","nicho":"sostenibilidad","cupos":1}],"cierra":"2026-12-06"},{"id":"pr09","titulo":"Taller de juguetes con material recuperado","sector":"educacion","estado":"ejecucion","autor":"p19","participantes":["p17"],"roles":{"p19":"Diseño del taller","p17":"Piezas en madera recuperada"},"areas":["social-educacion","sostenibilidad-circulares"],"descripcion":"Talleres en colegios donde niños y niñas diseñan juguetes con madera y plástico recuperados.","creado":"2026-10-28","imagenes":[],"enlaces":[],"borrador":false,"enviado":null,"tipo":"taller","abierto":false,"busca":[]}],"equipos":[{"id":"eq01","nombre":"Circular Lab","descripcion":"Mobiliario y objetos con materiales recuperados de barrios de Bogotá.","lider":"p05","miembros":["p05","p01","p06"],"publico":true,"busca":["Gestión"],"creado":"2026-09-10"},{"id":"eq02","nombre":"Ruta Candelaria","descripcion":"Experiencias y recorridos de diseño para el centro histórico.","lider":"p03","miembros":["p03","p04","p16"],"publico":true,"busca":["UX/UI"],"creado":"2026-08-02"},{"id":"eq03","nombre":"Accesible+","descripcion":"Señalética y espacios pensados para personas con discapacidad.","lider":"p08","miembros":["p08","p07","p13","p14"],"publico":true,"busca":[],"creado":"2026-07-15"},{"id":"eq04","nombre":"Mesa Campesina","descripcion":"Pedagogía y memoria con comunidades rurales de Cundinamarca.","lider":"p11","miembros":["p11","p12","p19"],"publico":true,"busca":["Producto"],"creado":"2026-06-20"},{"id":"eq05","nombre":"Pixel & Fique","descripcion":"Interfaces para que artesanos vendan en línea.","lider":"p18","miembros":["p18","p15"],"publico":true,"busca":["Servicios","Gestión"],"creado":"2026-10-12"}]};
  // Ícono de Cabito (perro) — trazo blanco sobre el azul principal
  const DOG_SVG = `<svg class="cabito-dog" viewBox="0 0 64 64" aria-hidden="true"><g transform="translate(32.4 33) scale(.86) translate(-32.4 -33)"><path d="M28 20.8C24.5 19.8 19.5 18.7 15.8 19.3 11.6 20 9.4 23.8 9.4 28.6V37.2C9.4 41.6 11 44 13.3 44 15.6 44 17.6 42.4 18.8 40.4"/><path d="M36.8 20.8C40.3 19.8 45.3 18.7 49 19.3 53.2 20 55.4 23.8 55.4 28.6V37.2C55.4 41.6 53.8 44 51.5 44 49.2 44 47.2 42.4 46 40.4"/><path d="M21.4 26.2C20.6 30.5 19.9 35.5 19 40.2M43.4 26.2C44.2 30.5 44.9 35.5 45.8 40.2"/><path d="M19.8 39.6C21 47 26 51.6 32.4 51.6S43.8 47 45 39.6"/><path d="M28 20.8C27 18.5 26.3 15.6 27.6 14.6 29 13.6 30.6 15.4 31.6 20.6M32.6 20.6C33.4 16.4 34.4 13.8 36 14.3 37.6 14.8 37.4 18 36.8 20.8"/><circle cx="28.1" cy="28.9" r="1.7" class="f"/><circle cx="36.7" cy="28.9" r="1.7" class="f"/><path class="f" d="M29.4 36.2H35.4C36.4 36.2 36.8 37.3 36.1 38L33.2 40.5C32.7 40.9 32.1 40.9 31.6 40.5L28.7 38C28 37.3 28.4 36.2 29.4 36.2Z"/><path d="M32.4 40.6V42.4M27.6 43.4C28.6 45 30.8 45.6 32.4 42.4 34 45.6 36.2 45 37.2 43.4"/></g></svg>`;

  /* ---------- Íconos ---------- */
  const ICONS = {
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    arrow: '<path d="M7 17L17 7M9 7h8v8"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    cam: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    team: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.8.3 5 2.6 5 5.8"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    hex: '<path d="M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z"/>',
    folder: '<path d="M3 7h6l2 2h10v10H3z"/>',
    board: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 9h4M8 13h8"/>',
    logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    note: '<path d="M5 4h14v11l-5 5H5z"/><path d="M14 20v-5h5"/>',
    text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    sticker: '<path d="M4 4h16v9l-7 7H4z"/><path d="M13 20v-5a2 2 0 0 1 2-2h5"/>'
  };
  const icon = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
  const HEX_PATH = '<path d="M50 0l43.3 25v50L50 100 6.7 75V25z"/>';

  /* ---------- Estado ---------- */
  const state = {
    meta: {}, nichos: [], sectores: [], nicheById: new Map(), areaById: new Map(), sectorById: new Map(),
    perfiles: [], proyectos: [], equipos: [],
    cells: [], edges: [], cellByKey: new Map(), profileCell: new Map(), areaCell: new Map(), nicheCell: new Map(), projectCell: new Map(),
    view: { x: 0, y: 0, s: 1 }, focus: null, me: null, guest: false, dragMoved: false,
    page: 'red', filter: { sector: '', estado: '', abiertos: false },
    pm: null, cab: null, newProjectId: null,
    team: { ids: [], q: '', skills: new Set(), nichos: new Set(), tipos: new Set(), rol: '', abiertos: true }
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
  const tint = (c, a = 14) => `color-mix(in srgb, ${c} ${a}%, #fff)`;
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

  // Foto real → avatar ilustrado (con su color de fondo) → iniciales
  function avatarHTML(p, cls = '') {
    if (!p) return '';
    const n = state.nicheById.get(p.nicho);
    const ini = esc(initials(p.nombre));
    const style = `--c:${n ? n.color : '#5A81FA'}`;
    if (p.foto) return `<span class="avatar ${cls}" style="${style}"><img src="${esc(p.foto)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.textContent='${ini}'"></span>`;
    if (p.avatar?.img) return `<span class="avatar avatar--ill ${cls}" style="${style};--avbg:${esc(p.avatar.bg || '#F2F5FF')}"><img src="${avatarSrc(p.avatar.img)}" alt="" loading="lazy"></span>`;
    return `<span class="avatar ${cls}" style="${style}">${ini}</span>`;
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
      productos: [], trayectoria: [], habilidades: [], ...p, ...(overrides[p.id] || {}),
      areas: (p.areas || []).filter(id => state.areaById.has(id)),
      links: links[p.id] || p.links || []
    }));
    const ids = new Set(state.perfiles.map(p => p.id));
    const delProjects = new Set(saved.deletedProjects || []);
    const mine = saved.proyectos || [];
    const mineIds = new Set(mine.map(p => p.id));
    state.proyectos = [...(data.proyectos || []).filter(p => !mineIds.has(p.id)), ...mine]
      .filter(p => !delProjects.has(p.id) && ids.has(p.autor))
      .map(p => ({ roles: {}, busca: [], ...p, participantes: (p.participantes || []).filter(id => ids.has(id)) }));
    // Equipos: semilla + creados en este navegador (los creados reemplazan a la semilla si comparten id)
    const myTeams = saved.equipos || [];
    const myTeamIds = new Set(myTeams.map(t => t.id));
    state.equipos = [...(data.equipos || []).filter(t => !myTeamIds.has(t.id)), ...myTeams]
      .map(t => ({ ...t, miembros: (t.miembros || []).filter(id => ids.has(id)), invitados: (t.invitados || []).filter(id => ids.has(id)) }))
      .filter(t => ids.has(t.lider));
    state.me = saved.meId ? person(saved.meId) || null : null;
    try { state.guest = sessionStorage.getItem('nexotadeo.guest') === '1'; } catch { state.guest = false; }
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
    // Busca la celda libre más cercana al ancla, dentro del territorio de su nicho
    const placeNear = (anchorCell, ni, minD) => {
      const own = centers[ni];
      const anchor = { q: anchorCell.q, r: anchorCell.r };
      let strict = true;
      const owned = h => !strict || centers.every((c, k) => k === ni || hdist(h, own) <= hdist(h, c));
      const seen = new Set([hkey(anchor.q, anchor.r)]);
      let layer = [anchor];
      for (let depth = 0; depth < 16; depth++) {
        if (depth === 10) strict = false;
        const next = [];
        for (const h of layer) for (const [dq, dr] of DIRS) {
          const nb = { q: h.q + dq, r: h.r + dr }, k = hkey(nb.q, nb.r);
          if (!seen.has(k)) { seen.add(k); next.push(nb); }
        }
        const cand = next.filter(h => !occ.has(hkey(h.q, h.r)) && hdist(h, own) >= minD && owned(h));
        if (cand.length) {
          cand.sort((a, b) => hdist(a, own) - hdist(b, own) || (Math.atan2(a.r, a.q) - Math.atan2(b.r, b.q)));
          return cand[0];
        }
        layer = next;
      }
      return null;
    };
    state.perfiles.forEach(p => {
      const ni = state.nichos.findIndex(n => n.id === p.nicho);
      if (ni < 0) return;
      const anchorCell = state.areaCell.get(p.areas[0]) || state.nicheCell.get(p.nicho);
      const found = placeNear(anchorCell, ni, 2);
      if (found) state.profileCell.set(p.id, put({ type: 'perfil', id: p.id, nicho: p.nicho, q: found.q, r: found.r }));
    });
    // Proyectos publicados: entran al panal de su nicho; si llega uno nuevo, el panal crece
    state.projectCell.clear();
    published().slice().sort((a, b) => (a.creado || '').localeCompare(b.creado || '')).forEach(p => {
      const n = projectNiche(p), ni = state.nichos.indexOf(n);
      if (ni < 0) return;
      const anchorCell = state.areaCell.get((p.areas || []).find(a => state.areaById.get(a)?.nicho === n.id)) || state.nicheCell.get(n.id);
      const found = placeNear(anchorCell, ni, 1);
      if (found) state.projectCell.set(p.id, put({ type: 'proyecto', id: p.id, nicho: n.id, q: found.q, r: found.r }));
    });
    // Un hexágono «+» por nicho, en el borde exterior de su panal
    state.nichos.forEach((n, ni) => {
      const own = centers[ni];
      const mine = cells.filter(c => c.nicho === n.id);
      let best = null, bs = -Infinity;
      mine.forEach(c => DIRS.forEach(([dq, dr]) => {
        const h = { q: c.q + dq, r: c.r + dr };
        if (occ.has(hkey(h.q, h.r))) return;
        if (!centers.every((cc, k) => k === ni || hdist(h, cc) > hdist(h, own))) return;
        const sc = hdist(h, { q: 0, r: 0 }) * 10 - hdist(h, own);
        if (sc > bs) { bs = sc; best = h; }
      }));
      if (best) put({ type: 'add', id: 'add-' + n.id, nicho: n.id, q: best.q, r: best.r });
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
      if (t === 'nicho-proyecto') return true;
      if (t === 'area-proyecto') { const pc = a.type === 'proyecto' ? a : b, ac = a.type === 'area' ? a : b; return !!projectById(pc.id)?.areas?.includes(ac.id); }
      if (t === 'perfil-proyecto') { const pc = a.type === 'proyecto' ? a : b, uc = a.type === 'perfil' ? a : b; const pj = projectById(pc.id); return !!pj && (pj.autor === uc.id || pj.participantes.includes(uc.id)); }
      return false;
    };
    state.cells.forEach(c => neighbors(c).forEach(n => { if (related(c, n)) add(c, n); }));
    // Toda persona queda conectada al menos a una celda de su campo
    state.cells.filter(c => c.type === 'perfil' || c.type === 'proyecto').forEach(c => {
      if (edges.some(([a, b]) => a === c || b === c)) return;
      const n = neighbors(c).filter(x => x.nicho === c.nicho && x.type !== 'add').sort((a, b) => (a.type === 'perfil') - (b.type === 'perfil'))[0];
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
  const shortArea = a => (a?.nombre || '').replace(/^Diseño (de |del )?/i, '').replace(/^Diseño, /, '').split(',')[0];

  function cellHTML(cell) {
    if (cell.type === 'nicho') {
      const n = state.nicheById.get(cell.id), total = peopleInNiche(n.id).length;
      return `<button class="hex" type="button" aria-label="${esc(n.nombre)}, ${plural(total, 'persona', 'personas')}. Ver áreas"><span class="hex__in"><span class="name">${esc(n.nombre)}</span><span class="count">${plural(total, 'persona', 'personas')}</span></span></button>`;
    }
    if (cell.type === 'area') {
      const a = state.areaById.get(cell.id), total = peopleInArea(a.id).length;
      return `<button class="hex" type="button" aria-label="Área ${esc(a.nombre)}, ${plural(total, 'persona', 'personas')}"><span class="hex__in"><span class="name">${esc(a.nombre)}</span><span class="count">${plural(total, 'persona', 'personas')}</span></span></button>`;
    }
    if (cell.type === 'proyecto') {
      const p = projectById(cell.id), isNew = state.newProjectId === p.id;
      return `<button class="hex" type="button" aria-label="Proyecto ${esc(p.titulo)}"><span class="hex__in"><span class="kicker">${isNew ? 'Nuevo' : 'Proyecto'}</span><span class="name">${esc(p.titulo)}</span><span class="count">${p.abierto ? 'Busca talento' : estadoName(p.estado)}</span></span></button>`;
    }
    if (cell.type === 'add') {
      const n = state.nicheById.get(cell.nicho);
      return `<button class="hex" type="button" aria-label="Agregar algo nuevo a ${esc(n.nombre)}" aria-haspopup="true"><span class="hex__in"><span class="plus" aria-hidden="true">+</span></span></button>`;
    }
    const p = person(cell.id), area = state.areaById.get(p.areas[0]);
    return `<button class="hex" type="button" aria-label="Ver perfil de ${esc(p.nombre)}"><span class="hex__in">${avatarHTML(p)}<span class="name">${esc(p.nombre)}</span>${area ? `<span class="mini-chip">${esc(shortArea(area))}</span>` : ''}</span></button>`;
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
      if (cell.type === 'proyecto' && cell.id === state.newProjectId) el.classList.add('is-new', 'is-fresh');
      el.dataset.type = cell.type; el.dataset.id = cell.id; el.dataset.key = cell.key;
      el.style.cssText = `left:${cell.x - W / 2}px;top:${cell.y - H / 2}px;--c:${n.color};--t:${n.texto};--i:${i}`;
      if (cell.type === 'nicho') el.dataset.tip = tipHTML(n.nombre, peopleInNiche(n.id));
      if (cell.type === 'area') el.dataset.tip = tipHTML(state.areaById.get(cell.id).nombre, peopleInArea(cell.id));
      if (cell.type === 'proyecto') { const p = projectById(cell.id); el.dataset.tip = `<strong>${esc(p.titulo)}</strong><span>${plural(teamOf(p).length, 'persona', 'personas')} · ${esc(sectorName(p.sector))}</span>`; }
      if (cell.type === 'add') el.dataset.tip = `<strong>Agregar a la red</strong><span>Publica un proyecto o arma un equipo</span>`;
      el.innerHTML = cellHTML(cell);
      cell.el = el;
      frag.appendChild(el);
    });
    $('#cells').replaceChildren(frag);
    // Conexiones: línea muy fina (no escala con el zoom) y puntos pequeños en los vértices
    $('#links').innerHTML = linkSegments(state.edges, HEX_R, HEX_GAP, 2.2);
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
    $('#legend').innerHTML = state.nichos.map(n => `<button type="button" data-nicho="${n.id}" style="--c:${n.color}" title="${esc(n.nombre)}" aria-pressed="false"><i aria-hidden="true"></i><span>${esc(n.corto)}</span></button>`).join('');
  }
  function renderStats() {
    const pill = $('#statPill');
    pill.textContent = `${plural(state.perfiles.length, 'persona', 'personas')} · ${plural(published().length, 'proyecto', 'proyectos')}`;
    pill.dataset.tip = tipHTML('Toda la red', state.perfiles);
  }
  function renderNav() {
    const me = state.me;
    $('#greetingHi').textContent = me ? `¡Hola, ${firstName(me.nombre)}!` : '¡Hola!';
    $('#loginBtn').hidden = !!me;
    $('#meBtn').hidden = !me;
    $('#bellBtn').hidden = !me;
    if (me) $('#meBtn').innerHTML = avatarHTML(me);
    renderBell();
    $('#teamsTabCount').textContent = publicTeams().length;
  }
  function refreshAll() {
    computeLayout();
    world().classList.remove('intro-anim');
    renderWorld(); renderStats(); renderNav();
    if (state.focus) renderNicheCard(state.nicheById.get(state.focus));
    if (state.page === 'proyectos') renderProjects();
    if (state.page === 'equipos') renderEquipos();
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
    const lnk = linkSegments(edges.map(([a, b]) => [cells[a], cells[b]]), R, gap, 2.2)
      .replace(/<line /g, '<line stroke="#5A81FA" stroke-width=".8" stroke-linecap="round" ').replace(/<circle /g, '<circle fill="#5A81FA" ');
    return `<svg class="hive" viewBox="${x0} ${y0} ${w} ${h}" preserveAspectRatio="${aspect}" font-family="Poppins, sans-serif"><style>.h{animation:hexIn .7s cubic-bezier(.16,1,.3,1) backwards;transform-box:fill-box;transform-origin:center}</style>${lnk}${body}</svg>`;
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
    const top = vw <= 680 ? 110 : 170;
    let left = 28, right = vw <= 680 ? 16 : 70, bottom = vw <= 680 ? 90 : 84;
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
      if (type === 'nicho') focusNiche(id);
      else if (type === 'area') onAreaClick(id);
      else if (type === 'proyecto') openProjectDetail(id);
      else if (type === 'add') openAddPop(cellEl);
      else openProfile(id);
    });
    $('#zoomIn').addEventListener('click', () => zoomAt(1.25, undefined, undefined, true));
    $('#zoomOut').addEventListener('click', () => zoomAt(0.8, undefined, undefined, true));
    $('#zoomFit').addEventListener('click', () => state.focus ? closeFocus() : fitAll());
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (state.page === 'red') state.focus ? fitTo(focusCells(state.focus), true, 1.5) : fitAll(true); }, 150); });
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
    $$('#legend button').forEach(b => { b.classList.toggle('is-active', b.dataset.nicho === id); b.setAttribute('aria-pressed', b.dataset.nicho === id); });
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
      <div class="face-row">${members.map(p => `<button type="button" data-profile="${p.id}" title="${esc(p.nombre)}" aria-label="${esc(p.nombre)}">${avatarHTML(p)}</button>`).join('') || '<p class="desc">Aún no hay personas aquí.</p>'}</div>
      ${(() => { const pj = published().filter(x => projectNiche(x).id === n.id); return pj.length ? `<h3><span>Proyectos · ${pj.length}</span></h3><div class="mini-list" style="margin:0">${pj.map(x => `<button type="button" class="mini-pj" data-project="${x.id}" style="--c:${n.color}"><i></i><span><strong>${esc(x.titulo)}</strong><small>${x.abierto ? 'Busca talento' : estadoName(x.estado)}</small></span></button>`).join('')}</div>` : ''; })()}`;
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
  const projectById = id => state.proyectos.find(p => p.id === id);
  const openProjects = () => published().filter(p => p.abierto && p.estado !== 'finalizado');
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
    const open = openProjects();
    $('#openCount').textContent = open.length;
    $('#joinProjectBtn').setAttribute('aria-pressed', f.abiertos);
    $('#joinProjectBtn').classList.toggle('is-on', f.abiertos);
    $('#pjTitle').textContent = f.abiertos ? 'Unirme a un proyecto' : 'Proyectos';
    $('#pjSub').textContent = f.abiertos ? 'Proyectos abiertos a recibir nuevo talento. Postúlate al rol que buscan.' : 'Mira lo que se está haciendo en la red y súmate a lo que te mueve.';
    const pool = f.abiertos ? open : all;
    $('#sectorFilter').innerHTML = [`<button type="button" data-sector="" class="${!f.sector ? 'is-active' : ''}" aria-pressed="${!f.sector}">Todos los sectores<span class="n">${pool.length}</span></button>`,
      ...state.sectores.map(s => { const n = pool.filter(p => p.sector === s.id).length; return n || f.sector === s.id ? `<button type="button" data-sector="${s.id}" class="${f.sector === s.id ? 'is-active' : ''}" aria-pressed="${f.sector === s.id}">${esc(s.nombre)}<span class="n">${n}</span></button>` : ''; })].join('');
    $$('#statusFilter button').forEach(b => { const on = b.dataset.estado === f.estado; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on); });
    $('#statusFilter').hidden = f.abiertos;
    const list = pool.filter(p => (!f.sector || p.sector === f.sector) && (f.abiertos || !f.estado || p.estado === f.estado))
      .sort((a, b) => f.abiertos ? (a.cierra || '9').localeCompare(b.cierra || '9') : (b.creado || '').localeCompare(a.creado || ''));
    $('#openBanner').hidden = !f.abiertos;
    $('#openBanner').innerHTML = `<span aria-hidden="true">✦</span><p><strong>${plural(open.length, 'proyecto está abierto', 'proyectos están abiertos')} a nuevo talento.</strong> Postúlate al rol que buscan y su creador recibe tu postulación en la red.</p>`;
    $('#projectStack').hidden = f.abiertos;
    $('#openGrid').hidden = !f.abiertos;
    if (f.abiertos) {
      $('#openGrid').innerHTML = list.length ? list.map(openCardHTML).join('') : `<div class="empty">No hay proyectos abiertos ${f.sector ? `en ${esc(sectorName(f.sector))}` : ''} en este momento.</div>`;
      return;
    }
    $('#projectStack').innerHTML = list.length ? list.map((p, i) => {
      const n = projectNiche(p), team = teamOf(p), lead = team[0];
      return `<div class="pcard-wrap" style="--k:${Math.min(i, 6)}">
        <article class="pcard" style="--c:${n.color};--t:${n.texto}" data-project="${p.id}" tabindex="0" role="button" aria-label="Ver proyecto ${esc(p.titulo)}">
          <span class="pcard__idx">(${String(i + 1).padStart(2, '0')})</span>
          <div class="pcard__left">
            <h3 class="pcard__title">${esc(p.titulo)}</h3>
            <div class="pcard__meta"><span class="pchip pchip--solid">${esc(sectorName(p.sector))}</span><span class="pchip">${estadoName(p.estado)}</span>${p.abierto ? '<span class="pchip">Busca talento</span>' : ''}${p.enviado ? '<span class="pchip">Propuesta enviada</span>' : ''}</div>
            <p class="pcard__desc">${esc(p.descripcion)}</p>
            <div class="pcard__team"><span class="faces">${team.slice(0, 5).map(t => avatarHTML(t)).join('')}</span><span>${esc(lead?.nombre || '')}${team.length > 1 ? ` y ${plural(team.length - 1, 'persona más', 'personas más')}` : ''}</span></div>
          </div>
          <div class="pcard__right">
            <div class="thumbs">${thumbsHTML(p)}</div>
            <span class="btn btn--sm pcard__cta">Ver proyecto</span>
          </div>
        </article></div>`;
    }).join('') : `<div class="empty">No hay proyectos ${f.sector ? `en ${esc(sectorName(f.sector))}` : ''} ${f.estado ? `(${estadoName(f.estado).toLowerCase()})` : ''} todavía.<br><br><button class="btn btn--primary btn--sm" type="button" data-new-project>Publicar el primero</button></div>`;
    stackEffect();
  }

  const daysLeft = iso => { if (!iso) return null; const d = Math.ceil((new Date(iso + 'T23:59:59') - new Date()) / 864e5); return d; };
  function closesLabel(p) {
    const d = daysLeft(p.cierra);
    if (d === null) return 'Sin fecha de cierre';
    if (d < 0) return 'Convocatoria cerrada';
    if (d === 0) return 'Cierra hoy';
    return d === 1 ? 'Cierra mañana' : d < 30 ? `Cierra en ${d} días` : `Cierra el ${fmtDate(p.cierra)}`;
  }
  const appliedTo = p => !!state.me && (p.postulaciones || []).some(x => x.id === state.me.id);
  // Portada generativa (patrón de hexágonos del color del nicho) cuando el proyecto no tiene imágenes
  function hexCover(color, seed = 0, r = 26) {
    let h = '';
    for (let y = -1; y < 6; y++) for (let x = -1; x < 12; x++) {
      const cx = x * r * SQRT3 + (y % 2 ? r * SQRT3 / 2 : 0), cy = y * r * 1.5;
      const o = ((x * 7 + y * 3 + seed) % 5 === 0) ? .55 : ((x + y + seed) % 3 === 0 ? .24 : .1);
      h += `<polygon points="${hexPoly(cx, cy, r - 3)}" fill="${color}" opacity="${o}"/>`;
    }
    return `<svg class="cover-art" viewBox="0 0 520 170" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${h}</svg>`;
  }
  function openCardHTML(p, i) {
    const n = projectNiche(p), lead = person(p.autor), applied = appliedTo(p), mine = state.me && (p.autor === state.me.id || p.participantes.includes(state.me.id));
    return `<article class="ocard panel" style="--c:${n.color}">
      <div class="ocard__cov" style="background:${tint(n.color, 12)}">${(p.imagenes || [])[0] ? `<img src="${esc(p.imagenes[0])}" alt="">` : hexCover(n.color, i)}<span class="ocard__st"><i></i>Abierto a nuevo talento</span><span class="ocard__ty">${esc(tipoById(tipoOf(p))?.label || 'Proyecto')}</span></div>
      <div class="ocard__bd">
        <h3><button type="button" class="link-plain" data-project="${p.id}">${esc(p.titulo)}</button></h3>
        <div class="ocard__au">${avatarHTML(lead)}<span>${esc(lead?.nombre || '')} · ${esc(n.corto)}</span></div>
        <p>${esc(p.descripcion)}</p>
        <h4>Buscan</h4>
        <div class="roles">${(p.busca || []).map(b => { const bn = state.nicheById.get(b.nicho); return `<span style="--c:${bn ? bn.color : '#5A81FA'}">${esc(b.rol)} <em>· ${plural(+b.cupos || 1, 'cupo', 'cupos')}</em></span>`; }).join('') || '<span style="--c:#5A81FA">Abierto a propuestas</span>'}</div>
        <div class="ocard__ft"><span>${closesLabel(p)}</span>${mine ? '<span class="tag">Tu proyecto</span>' : `<button class="btn btn--primary btn--sm" type="button" data-apply="${p.id}" ${applied ? 'disabled' : ''}>${applied ? 'Postulación enviada' : 'Postularme'}</button>`}</div>
      </div></article>`;
  }

  // Postularse: le llega una notificación al creador del proyecto
  function applyTo(id, rol) {
    const p = projectById(id);
    if (!p || !requireLoginFor('postularte a un proyecto')) return;
    if (appliedTo(p)) return;
    p.postulaciones = [...(p.postulaciones || []), { id: state.me.id, rol: rol || '', fecha: new Date().toISOString() }];
    saveProject(JSON.parse(JSON.stringify(p)));
    notify(p.autor, { tipo: 'postulacion', de: state.me.id, proyecto: p.id, texto: `${state.me.nombre} quiere unirse a «${p.titulo}»${rol ? ` como ${rol}` : ''}` });
    toast(`Postulación enviada a ${person(p.autor)?.nombre || 'el equipo'}`);
    renderProjects();
    if ($('#pdModal').classList.contains('is-open')) openProjectDetail(id);
  }
  function openApply(id) {
    const p = projectById(id);
    if (!p || !requireLoginFor('postularte a un proyecto')) return;
    if ((p.busca || []).length <= 1) return applyTo(id, p.busca?.[0]?.rol);
    openForm({
      eyebrow: 'Postularme', title: p.titulo,
      body: `<p class="muted" style="margin:0 0 14px">¿A qué rol te postulas?</p><div class="radio-list">${p.busca.map((b, i) => `<label class="check"><input type="radio" name="applyRol" value="${esc(b.rol)}" ${i === 0 ? 'checked' : ''}><span>${esc(b.rol)}<small>${plural(+b.cupos || 1, 'cupo', 'cupos')}</small></span></label>`).join('')}</div>`,
      submit: 'Enviar postulación',
      onSubmit: () => { applyTo(id, $('input[name="applyRol"]:checked')?.value); return true; }
    });
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
    const p = projectById(id);
    if (!p) return;
    const n = projectNiche(p), team = teamOf(p), mine = state.me && p.autor === state.me.id;
    const areas = (p.areas || []).map(a => state.areaById.get(a)).filter(Boolean);
    const inTeam = state.me && team.some(t => t.id === state.me.id);
    $('#pdBody').innerHTML = `
      <div class="pd__hero" style="--c:${n.color};--t:${n.texto}">
        <div class="pcard__meta" style="margin:0"><span class="pchip pchip--solid">${esc(sectorName(p.sector))}</span><span class="pchip">${estadoName(p.estado)}</span>${p.abierto ? '<span class="pchip">Abierto a nuevo talento</span>' : ''}</div>
        <h2>${esc(p.titulo)}</h2>
      </div>
      <div class="pd__body">
        <p>${esc(p.descripcion)}</p>
        ${(p.imagenes || []).length ? `<div class="pd__gallery" style="--c:${n.color};--t:${n.texto}">${p.imagenes.map(s => `<div class="thumb"><img src="${esc(s)}" alt=""></div>`).join('')}</div>` : ''}
        ${p.abierto && (p.busca || []).length ? `<div class="pf-section"><h4>Buscan · ${closesLabel(p)}</h4><div class="roles">${p.busca.map(b => { const bn = state.nicheById.get(b.nicho); return `<span style="--c:${bn ? bn.color : '#5A81FA'}">${esc(b.rol)} <em>· ${plural(+b.cupos || 1, 'cupo', 'cupos')}</em></span>`; }).join('')}</div></div>` : ''}
        ${areas.length ? `<div class="pf-section"><h4>Áreas de diseño</h4><div class="chips">${areas.map(a => `<span class="chip chip--soft" style="--c:${state.nicheById.get(a.nicho).color}"><i></i>${esc(a.nombre)}</span>`).join('')}</div></div>` : ''}
        <div class="pf-section"><h4>Equipo · ${team.length}</h4><div class="pd__team">${team.map((t, i) => `<button class="pd__person" type="button" data-open="${t.id}">${avatarHTML(t)}<span><strong>${esc(t.nombre)}${i === 0 ? ' · líder' : ''}</strong><small>${esc((p.roles || {})[t.id] || roleLabel(t))}</small></span></button>`).join('')}</div></div>
        ${mine && (p.postulaciones || []).length ? `<div class="pf-section"><h4>Postulaciones · ${p.postulaciones.length}</h4><div class="pd__team">${p.postulaciones.map(x => { const t = person(x.id); return t ? `<div class="pd__person">${avatarHTML(t)}<span><strong>${esc(t.nombre)}</strong><small>${esc(x.rol || 'Sin rol')} · ${fmtDate(x.fecha)}</small></span><button class="btn btn--light btn--xs" type="button" data-accept="${p.id}:${t.id}">Sumar al equipo</button></div>` : ''; }).join('')}</div></div>` : ''}
        ${(p.enlaces || []).length ? `<div class="pf-section"><h4>Enlaces</h4><div class="plinks">${p.enlaces.map(u => linkCard(u, false)).join('')}</div></div>` : ''}
        ${p.enviado ? `<p class="badge-sent" style="margin-top:18px">${icon('check')} Propuesta enviada a la universidad el ${fmtDate(p.enviado)}</p>` : ''}
        <div class="pd__actions">
          ${mine ? `<button class="btn btn--primary" type="button" data-edit="${p.id}">Gestionar proyecto</button>` : p.abierto && !inTeam ? `<button class="btn btn--primary" type="button" data-apply="${p.id}" ${appliedTo(p) ? 'disabled' : ''}>${appliedTo(p) ? 'Postulación enviada' : 'Postularme'}</button>` : `<a class="btn btn--primary" href="mailto:${team.map(t => t.correo).filter(Boolean).join(',')}?subject=${encodeURIComponent('Sobre tu proyecto en NexoTadeo: ' + p.titulo)}">Contactar al equipo</a>`}
          <button class="btn btn--outline" type="button" data-pin="proyecto:${p.id}">${icon('bookmark')} Guardar en mi board</button>
          <button class="btn btn--outline" type="button" data-locate-project="${p.id}">Ver en la red</button>
          <button class="btn btn--ghost" type="button" data-pdf="${p.id}">Descargar brief (PDF)</button>
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

  /* =========================================================
     MODALES — foco atrapado y devuelto al cerrar (accesibilidad)
     ========================================================= */
  const modalReturn = new Map();
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
  function openModal(id) {
    const m = $(id);
    if (!m.classList.contains('is-open')) modalReturn.set(id, document.activeElement);
    m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false');
    setTimeout(() => { if (!m.contains(document.activeElement)) $$(FOCUSABLE, m).find(el => el.offsetParent && !el.closest('[data-close].modal__backdrop'))?.focus(); }, 60);
  }
  function closeModal(id) {
    const m = $(id);
    if (!m || !m.classList.contains('is-open')) return;
    m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true');
    if (id === '#pmModal') onPMClose();
    modalReturn.get(id)?.focus?.({ preventScroll: true });
  }
  const topModal = () => $$('.modal.is-open').sort((a, b) => (+getComputedStyle(b).zIndex) - (+getComputedStyle(a).zIndex)).map(m => '#' + m.id)[0];
  let confirmCb = null;
  function confirmBox({ title, text, ok = 'Eliminar', onOk }) {
    $('#confirmTitle').textContent = title; $('#confirmText').textContent = text; $('#confirmOk').textContent = ok;
    confirmCb = onOk; openModal('#confirmModal');
  }
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const id = topModal(); if (!id) return;
    const items = $$(FOCUSABLE, $(id)).filter(el => el.offsetParent);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* =========================================================
     SESIÓN — la primera pantalla es Iniciar sesión
     ========================================================= */
  function showAuth(tab = 'login', msg = '') {
    closeAllLayers();
    $('#auth').hidden = false; $('#join').hidden = true;
    setAppVisible(false);
    setAuthTab(tab);
    $('#loginErr').textContent = msg;
    renderAuthHive();
    setTimeout(() => (tab === 'login' ? $('#loginName') : $('#tabJoin')).focus(), 60);
  }
  function setAuthTab(tab) {
    const login = tab === 'login';
    $('#tabLogin').classList.toggle('is-active', login); $('#tabLogin').setAttribute('aria-selected', login);
    $('#tabJoin').classList.toggle('is-active', !login); $('#tabJoin').setAttribute('aria-selected', !login);
    $('#paneLogin').hidden = !login; $('#paneLogin').classList.toggle('is-active', login);
    $('#paneJoin').hidden = login; $('#paneJoin').classList.toggle('is-active', !login);
  }
  function hideAuth() { $('#auth').hidden = true; $('#join').hidden = true; setAppVisible(true); }
  function setAppVisible(on) {
    $('#topbar').hidden = !on; $('#main').hidden = !on; $('#bottomNav').hidden = !on; $('#helpFab').hidden = !on;
    document.body.classList.toggle('is-app', on);
  }
  function openLogin(msg) { showAuth('login', msg || ''); }

  async function doLogin(e) {
    e.preventDefault();
    const name = $('#loginName').value.trim(), pass = $('#loginPass').value, err = $('#loginErr');
    if (!name || !pass) { err.textContent = 'Escribe tu correo o nombre completo y tu contraseña.'; return; }
    const q = norm(name);
    const p = state.perfiles.find(x => norm(x.nombre) === q || (x.correo || '').toLowerCase() === name.toLowerCase());
    if (!p) { err.textContent = 'No encontramos una cuenta con ese correo o nombre. Revisa la escritura o únete a la red.'; return; }
    const ok = p.passHash ? (await hashPass(pass)) === p.passHash : pass === state.meta.claveDemo;
    if (!ok) { err.textContent = 'La contraseña no coincide.'; $('#loginPass').select(); return; }
    signIn(p, $('#loginRemember').checked);
    $('#paneLogin').reset();
    hideAuth();
    go(state.pendingRoute || '#red');
    state.pendingRoute = null;
    toast(`Hola, ${firstName(p.nombre)}. Sesión iniciada.`);
  }
  function signIn(p, remember = true) {
    state.me = p; state.guest = false;
    try { sessionStorage.removeItem('nexotadeo.guest'); } catch { /* */ }
    store.patch(d => { d.meId = p.id; d.remember = remember; });
    if (state.pm && !state.pm.p.autor) state.pm.p.autor = p.id;
    refreshAll();
  }
  function enterAsGuest() {
    state.guest = true;
    try { sessionStorage.setItem('nexotadeo.guest', '1'); } catch { /* */ }
    hideAuth(); go('#red');
    toast('Estás explorando sin cuenta. Únete para crear equipos y proyectos.');
  }
  function logout() {
    state.me = null; state.guest = false;
    store.patch(d => { d.meId = null; });
    try { sessionStorage.removeItem('nexotadeo.guest'); } catch { /* */ }
    refreshAll(); showAuth('login'); toast('Sesión cerrada');
  }
  function deleteMe() {
    const me = state.me;
    if (!me) return;
    store.patch(d => {
      d.usuarios = (d.usuarios || []).filter(u => u.id !== me.id);
      if (!me.passHash) d.deleted = [...new Set([...(d.deleted || []), me.id])];
      if (d.links) delete d.links[me.id];
      if (d.overrides) delete d.overrides[me.id];
      if (d.boards) delete d.boards[me.id];
      if (d.notifs) delete d.notifs[me.id];
      const authored = state.proyectos.filter(p => p.autor === me.id).map(p => p.id);
      d.proyectos = (d.proyectos || []).filter(p => p.autor !== me.id).map(p => ({ ...p, participantes: p.participantes.filter(x => x !== me.id) }));
      d.deletedProjects = [...new Set([...(d.deletedProjects || []), ...authored])];
      d.equipos = (d.equipos || []).filter(t => t.lider !== me.id).map(t => ({ ...t, miembros: t.miembros.filter(x => x !== me.id) }));
      d.meId = null;
    });
    state.proyectos = state.proyectos.filter(p => p.autor !== me.id).map(p => ({ ...p, participantes: p.participantes.filter(x => x !== me.id) }));
    state.perfiles = state.perfiles.filter(p => p.id !== me.id);
    state.equipos = state.equipos.filter(t => t.lider !== me.id).map(t => ({ ...t, miembros: t.miembros.filter(x => x !== me.id) }));
    state.me = null;
    refreshAll(); showAuth('login');
    toast('Tu perfil fue eliminado de la red');
  }
  function requireLoginFor(action) {
    if (state.me) return true;
    state.pendingRoute = location.hash || '#red';
    openLogin(`Inicia sesión o únete a la red para ${action}.`);
    return false;
  }
  // Ilustración del panal de la pantalla de acceso (reutiliza el dibujo de la v3)
  function renderAuthHive() {
    const host = $('#authHive');
    if (host.dataset.done) return;
    host.dataset.done = '1';
    const a = state.perfiles[0], b = state.perfiles.find(p => p.rol === 'egresado') || state.perfiles[1];
    const chip = p => shortArea(state.areaById.get(p.areas?.[0])).slice(0, 16);
    const spec = [
      { q: 0, r: 0, kind: 'me', label: a.nombre, sub: roleLabel(a), chip: chip(a) },
      { q: 1, r: 0, kind: 'empty' }, { q: -1, r: 1, kind: 'area', label: 'Mobiliario' },
      { q: 0, r: 1, kind: 'person', label: b.nombre, sub: roleLabel(b), chip: chip(b) },
      { q: -1, r: 2, kind: 'area', label: 'Diseño de Experiencias' }, { q: 0, r: 2, kind: 'area', label: 'Manufactura Sostenible' },
      { q: 1, r: 1, kind: 'area', label: 'Empaques' }, { q: -1, r: 0, kind: 'empty' }, { q: 1, r: -1, kind: 'empty' },
      { q: 2, r: -1, kind: 'area', label: 'Diseño de Servicios', fill: '#fff' }, { q: 1, r: 2, kind: 'empty' }, { q: -2, r: 2, kind: 'empty' }
    ];
    const edges = [[0, 3], [0, 2], [3, 5], [3, 6], [2, 4], [4, 5], [0, 1], [1, 9], [5, 10], [4, 11], [0, 8]];
    host.innerHTML = hiveSVG(spec, edges, { R: 92, gap: 18, aspect: 'xMidYMid meet', pad: 40 });
  }

  /* =========================================================
     EDITOR DE AVATAR (registro y perfil)
     UX: vista previa grande y en vivo; el selector de color
     solo aparece al pulsar «+» y es claro (no oscuro).
     ========================================================= */
  function hexToRgb(h) { const m = h.replace('#', '').match(/.{2}/g) || ['00', '00', '00']; return m.map(x => parseInt(x, 16)); }
  function rgbToHex(r, g, b) { return '#' + [r, g, b].map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase(); }
  function hsvToRgb(h, s, v) { const f = n => { const k = (n + h / 60) % 6; return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0); }; return [f(5) * 255, f(3) * 255, f(1) * 255]; }
  function rgbToHsv(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0; if (d) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; } return [h, mx ? d / mx : 0, mx]; }

  function mountAvatarEditor(host, init = {}, onChange = () => {}) {
    const st = { mode: init.foto ? 'foto' : 'avatar', img: init.img || AVATARS[2], bg: init.bg || AV_COLORS[0], foto: init.foto || '' };
    const uid_ = uid('av');
    host.innerHTML = `
      <div class="avedit__prev">
        <div class="avedit__hex" id="${uid_}prev"></div>
        <small>Así te verán en la red</small>
      </div>
      <div class="avedit__opts">
        <div class="seg" role="tablist" aria-label="Tipo de imagen">
          <button type="button" role="tab" data-avmode="avatar">Avatar</button>
          <button type="button" role="tab" data-avmode="foto">Mi foto</button>
        </div>
        <div data-avpane="avatar">
          <div class="avgal" role="radiogroup" aria-label="Personajes">${AVATARS.map((a, i) => `<button type="button" role="radio" class="avgal__t" data-av="${a}" aria-label="Personaje ${i + 1}"><img src="${avatarSrc(a)}" alt="" loading="lazy"></button>`).join('')}</div>
          <p class="lab" id="${uid_}cl">Color del hexágono</p>
          <div class="swatches" role="radiogroup" aria-labelledby="${uid_}cl">${AV_COLORS.map(c => `<button type="button" role="radio" class="sw" data-color="${c}" style="--sw:${c}" aria-label="Color ${c}"></button>`).join('')}<button type="button" class="sw sw--custom" data-custom aria-haspopup="dialog" aria-expanded="false" aria-label="Elegir otro color"><b aria-hidden="true">+</b></button>
            <div class="picker" role="dialog" aria-label="Elegir un color" hidden>
              <div class="picker__top"><span>Elige un color</span><button type="button" class="picker__x" data-pk-close aria-label="Cerrar">×</button></div>
              <div class="picker__body"><div class="picker__sv" tabindex="0" aria-label="Saturación y brillo"><i></i></div><div class="picker__hue" tabindex="0" aria-label="Tono"><i></i></div></div>
              <div class="picker__foot"><span class="picker__prev"></span><input class="picker__hex" maxlength="7" aria-label="Código hexadecimal" spellcheck="false"><button type="button" class="btn btn--primary btn--xs" data-pk-ok>Usar color</button></div>
            </div>
          </div>
        </div>
        <div data-avpane="foto" hidden>
          <label class="photo-drop"><input type="file" accept="image/*" hidden data-photo><span class="photo-drop__img"></span><span><strong>Sube una foto</strong><small>JPG o PNG. La recortamos en el hexágono.</small></span></label>
          <button type="button" class="btn btn--ghost btn--sm" data-photo-rm hidden>Quitar foto</button>
        </div>
      </div>`;
    const prev = $(`#${CSS.escape(uid_)}prev`);
    const pk = $('.picker', host), sv = $('.picker__sv', host), hue = $('.picker__hue', host);
    let hsv = rgbToHsv(...hexToRgb(st.bg));
    const paint = () => {
      prev.style.setProperty('--avbg', st.bg);
      prev.innerHTML = st.mode === 'foto' && st.foto ? `<img class="is-photo" src="${st.foto}" alt="Tu foto">` : `<img src="${avatarSrc(st.img)}" alt="Tu avatar">`;
      $$('[data-avmode]', host).forEach(b => { const on = b.dataset.avmode === st.mode; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
      $$('[data-avpane]', host).forEach(p => { p.hidden = p.dataset.avpane !== st.mode; });
      $$('.avgal__t', host).forEach(b => { const on = b.dataset.av === st.img; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', on); b.style.setProperty('--avbg', on ? st.bg : ''); });
      const preset = AV_COLORS.includes(st.bg.toUpperCase());
      $$('.sw[data-color]', host).forEach(b => { const on = b.dataset.color.toUpperCase() === st.bg.toUpperCase(); b.classList.toggle('is-on', on); b.setAttribute('aria-checked', on); });
      $('.sw--custom', host).classList.toggle('is-on', !preset);
      $('.sw--custom', host).style.setProperty('--sw', preset ? '' : st.bg);
      $('.photo-drop__img', host).innerHTML = st.foto ? `<img src="${st.foto}" alt="">` : icon('cam');
      $('[data-photo-rm]', host).hidden = !st.foto;
      onChange({ ...st });
    };
    const paintPicker = () => {
      const [h, s, v] = hsv, hex = rgbToHex(...hsvToRgb(h, s, v));
      sv.style.background = `linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(${h},100%,50%))`;
      $('i', sv).style.cssText = `left:${s * 100}%;top:${(1 - v) * 100}%`;
      $('i', hue).style.top = `${h / 360 * 100}%`;
      $('.picker__prev', host).style.background = hex;
      if (document.activeElement !== $('.picker__hex', host)) $('.picker__hex', host).value = hex;
      return hex;
    };
    const openPicker = open => {
      pk.hidden = !open; $('.sw--custom', host).setAttribute('aria-expanded', open);
      if (open) { hsv = rgbToHsv(...hexToRgb(st.bg)); paintPicker(); setTimeout(() => sv.focus(), 30); }
    };
    const drag = (el, fn) => el.addEventListener('pointerdown', e => {
      e.preventDefault(); el.setPointerCapture(e.pointerId);
      const move = ev => { const r = el.getBoundingClientRect(); fn(clamp((ev.clientX - r.left) / r.width, 0, 1), clamp((ev.clientY - r.top) / r.height, 0, 1)); st.bg = paintPicker(); paint(); };
      move(e);
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', () => el.removeEventListener('pointermove', move), { once: true });
    });
    drag(sv, (x, y) => { hsv[1] = x; hsv[2] = 1 - y; });
    drag(hue, (x, y) => { hsv[0] = y * 359.9; });
    sv.addEventListener('keydown', e => { const k = { ArrowRight: [.04, 0], ArrowLeft: [-.04, 0], ArrowUp: [0, .04], ArrowDown: [0, -.04] }[e.key]; if (!k) return; e.preventDefault(); hsv[1] = clamp(hsv[1] + k[0], 0, 1); hsv[2] = clamp(hsv[2] + k[1], 0, 1); st.bg = paintPicker(); paint(); });
    hue.addEventListener('keydown', e => { const k = { ArrowUp: -6, ArrowDown: 6 }[e.key]; if (!k) return; e.preventDefault(); hsv[0] = (hsv[0] + k + 360) % 360; st.bg = paintPicker(); paint(); });
    $('.picker__hex', host).addEventListener('input', e => { const v = e.target.value.trim(); if (/^#?[0-9a-f]{6}$/i.test(v)) { st.bg = ('#' + v.replace('#', '')).toUpperCase(); hsv = rgbToHsv(...hexToRgb(st.bg)); paintPicker(); paint(); } });
    host.addEventListener('click', e => {
      const q = s => e.target.closest(s);
      if (q('[data-avmode]')) { st.mode = q('[data-avmode]').dataset.avmode; if (st.mode === 'foto' && !st.foto) $('[data-photo]', host).click(); paint(); return; }
      if (q('[data-av]')) { st.img = q('[data-av]').dataset.av; st.mode = 'avatar'; paint(); return; }
      if (q('.sw[data-color]')) { st.bg = q('.sw[data-color]').dataset.color; openPicker(false); paint(); return; }
      if (q('[data-custom]')) { openPicker(pk.hidden); return; }
      if (q('[data-pk-ok]') || q('[data-pk-close]')) { openPicker(false); $('.sw--custom', host).focus(); return; }
      if (q('[data-photo-rm]')) { st.foto = ''; st.mode = 'avatar'; paint(); }
    });
    host.addEventListener('keydown', e => { if (e.key === 'Escape' && !pk.hidden) { e.stopPropagation(); openPicker(false); $('.sw--custom', host).focus(); } });
    document.addEventListener('pointerdown', e => { if (!pk.hidden && !pk.contains(e.target) && !e.target.closest('[data-custom]')) openPicker(false); });
    $('[data-photo]', host).addEventListener('change', async e => {
      try { st.foto = await resizeImage(e.target.files[0], 320, 320); st.mode = 'foto'; paint(); } catch { toast('No se pudo leer esa imagen'); }
      e.target.value = '';
    });
    paint();
    return st;
  }

  /* =========================================================
     UNIRME A LA RED — registro completo en una página
     ========================================================= */
  const ob = { nicho: null, areas: new Set(), skills: [], av: null, projects: [] };
  const allSkills = () => [...new Set(state.perfiles.flatMap(p => p.habilidades || []))].sort((a, b) => a.localeCompare(b, 'es'));

  function openJoin() {
    closeAllLayers();
    $('#auth').hidden = true; $('#join').hidden = false; setAppVisible(false);
    if (!ob.av) setupJoinOnce();
    restoreJoinDraft();
    $('#join').scrollTop = 0;
    setTimeout(() => $('#obName').focus(), 60);
  }
  function setupJoinOnce() {
    $('#obSemester').innerHTML = Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">${i + 1}.º semestre</option>`).join('');
    $$('input[name="rol"]').forEach(r => r.addEventListener('change', () => {
      if (!r.checked) return;
      const est = r.value === 'estudiante';
      $('#semesterField label').textContent = est ? 'Semestre' : 'Año de grado';
      $('#obSemester').innerHTML = est ? Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">${i + 1}.º semestre</option>`).join('') : Array.from({ length: 30 }, (_, i) => { const y = new Date().getFullYear() - i; return `<option value="${y}">${y}</option>`; }).join('');
    }));
    $('#nichePicker').innerHTML = state.nichos.map(n => `<button type="button" class="np" role="radio" aria-checked="false" data-nicho="${n.id}" style="--c:${n.color}"><span class="np__swatch" aria-hidden="true"></span><span><strong>${esc(n.nombre)}</strong><small>${plural(n.areas.length, 'área', 'áreas')}</small></span></button>`).join('');
    $('#nichePicker').addEventListener('click', e => {
      const b = e.target.closest('.np'); if (!b) return;
      if (ob.nicho !== b.dataset.nicho) ob.areas.clear();
      ob.nicho = b.dataset.nicho; renderNichePick(); $('#nicheErr').textContent = '';
    });
    $('#areaPicker').addEventListener('click', e => {
      const b = e.target.closest('button[data-area]'); if (!b) return;
      const id = b.dataset.area;
      if (ob.areas.has(id)) ob.areas.delete(id);
      else if (ob.areas.size >= MAX_AREAS) { toast(`Puedes elegir hasta ${MAX_AREAS} áreas`); return; }
      else ob.areas.add(id);
      b.setAttribute('aria-pressed', ob.areas.has(id)); $('#areaErr').textContent = '';
    });
    // Aptitudes: chips con Enter/coma, sugerencias de la red
    const addSkill = raw => { const v = String(raw || '').trim().replace(/,$/, ''); if (!v) return; if (ob.skills.some(s => norm(s) === norm(v))) return; if (ob.skills.length >= 8) { toast('Máximo 8 aptitudes'); return; } ob.skills.push(v); renderSkills(); };
    $('#skillInput').addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(e.target.value); e.target.value = ''; renderSkillSug(''); }
      if (e.key === 'Backspace' && !e.target.value && ob.skills.length) { ob.skills.pop(); renderSkills(); }
    });
    $('#skillInput').addEventListener('input', e => renderSkillSug(e.target.value));
    $('#skillSug').addEventListener('click', e => { const b = e.target.closest('[data-skill]'); if (b) { addSkill(b.dataset.skill); $('#skillInput').value = ''; renderSkillSug(''); $('#skillInput').focus(); } });
    $('#skillList').addEventListener('click', e => { const b = e.target.closest('[data-rm-skill]'); if (b) { ob.skills.splice(+b.dataset.rmSkill, 1); renderSkills(); } });
    ob.av = mountAvatarEditor($('#joinAvatar'), {}, st => { ob.avState = st; });
    $('#obAvStory').addEventListener('input', e => { $('#avStoryCount').textContent = `${e.target.value.length} / 200`; });
    $('#addJoinProject').addEventListener('click', () => { ob.projects.push({ id: uid('jp'), titulo: '', tipo: '', anio: String(new Date().getFullYear()), descripcion: '', gente: [] }); renderJoinProjects(); setTimeout(() => $$('#joinProjects .jp')?.slice(-1)[0]?.querySelector('input')?.focus(), 30); });
    const jp = $('#joinProjects');
    jp.addEventListener('input', e => {
      const t = e.target, card = t.closest('.jp'); if (!card) return;
      const pr = ob.projects.find(x => x.id === card.dataset.jp);
      if (t.dataset.f) pr[t.dataset.f] = t.value;
      if (t.dataset.gf) { const g = pr.gente[+t.closest('[data-g]').dataset.g]; g[t.dataset.gf] = t.value; }
      if (t.matches('[data-gq]')) showJoinSug(t, pr);
    });
    jp.addEventListener('change', e => { const t = e.target, card = t.closest('.jp'); if (!card) return; const pr = ob.projects.find(x => x.id === card.dataset.jp); if (t.dataset.f) pr[t.dataset.f] = t.value; if (t.dataset.gf) pr.gente[+t.closest('[data-g]').dataset.g][t.dataset.gf] = t.value; });
    jp.addEventListener('click', e => {
      const q = s => e.target.closest(s), card = e.target.closest('.jp'); if (!card) return;
      const pr = ob.projects.find(x => x.id === card.dataset.jp);
      if (q('[data-jp-rm]')) { ob.projects = ob.projects.filter(x => x !== pr); renderJoinProjects(); return; }
      if (q('[data-g-rm]')) { pr.gente.splice(+q('[data-g-rm]').dataset.gRm, 1); renderJoinProjects(); return; }
      if (q('[data-g-add]')) { const id = q('[data-g-add]').dataset.gAdd; if (!pr.gente.some(g => g.id === id)) pr.gente.push({ id, rol: PART_ROLES[1], como: '' }); renderJoinProjects(); setTimeout(() => card.querySelector('[data-gq]')?.focus(), 20); }
    });
    $('#obForm').addEventListener('submit', e => { e.preventDefault(); submitJoin(); });
    $('#joinSaveLater').addEventListener('click', saveJoinDraft);
    $$('#obForm .field input, #obForm .field select').forEach(i => i.addEventListener('input', () => setErr(i, '')));
    $$('[data-auth-back]').forEach(b => b.addEventListener('click', () => showAuth('login')));
  }
  function renderNichePick() {
    $$('#nichePicker .np').forEach(x => { const on = x.dataset.nicho === ob.nicho; x.classList.toggle('is-selected', on); x.setAttribute('aria-checked', on); });
    const n = state.nicheById.get(ob.nicho);
    $('#areaPicker').innerHTML = n ? `<p class="field__hint" style="width:100%">Áreas de ${esc(n.nombre)} <span class="muted">(máx. ${MAX_AREAS})</span></p>` + n.areas.map(a => `<button type="button" data-area="${a.id}" aria-pressed="${ob.areas.has(a.id)}" style="--c:${n.color}"><i></i>${esc(a.nombre)}</button>`).join('') : '';
  }
  function renderSkills() {
    $('#skillList').innerHTML = ob.skills.map((s, i) => `<span class="tagchip">${esc(s)}<button type="button" data-rm-skill="${i}" aria-label="Quitar ${esc(s)}">×</button></span>`).join('');
    renderSkillSug($('#skillInput').value);
  }
  function renderSkillSug(q) {
    const qn = norm(q), have = new Set(ob.skills.map(norm));
    const list = allSkills().filter(s => !have.has(norm(s)) && (!qn || norm(s).includes(qn))).slice(0, 12);
    $('#skillSug').innerHTML = list.map(s => `<button type="button" data-skill="${esc(s)}">+ ${esc(s)}</button>`).join('');
  }
  function renderJoinProjects() {
    $('#joinProjects').innerHTML = ob.projects.length ? ob.projects.map((pr, k) => `
      <article class="jp" data-jp="${pr.id}">
        <div class="jp__top"><span class="jp__n">Proyecto ${k + 1}</span><button type="button" class="link link--danger" data-jp-rm>Quitar</button></div>
        <div class="grid-3">
          <div class="field span-2"><label for="t-${pr.id}">Nombre del proyecto</label><input id="t-${pr.id}" data-f="titulo" value="${esc(pr.titulo)}" maxlength="90" placeholder="Ej: Silla plegable para espacios pequeños"></div>
          <div class="field"><label for="a-${pr.id}">Año</label><input id="a-${pr.id}" data-f="anio" value="${esc(pr.anio)}" inputmode="numeric" maxlength="4"></div>
          <div class="field"><label for="y-${pr.id}">Tipo</label><select id="y-${pr.id}" data-f="tipo"><option value="">Selecciona…</option>${PROJECT_TYPES.map(t => `<option value="${t.id}" ${pr.tipo === t.id ? 'selected' : ''}>${t.label}</option>`).join('')}</select></div>
          <div class="field span-2"><label for="d-${pr.id}">¿De qué se trató?</label><input id="d-${pr.id}" data-f="descripcion" value="${esc(pr.descripcion)}" maxlength="240" placeholder="Una o dos frases"></div>
        </div>
        <p class="lab">Personas de la red que participaron</p>
        <div class="jp__people">${pr.gente.map((g, i) => { const t = person(g.id); return t ? `<div class="jp__person" data-g="${i}">${avatarHTML(t)}<span class="jp__who"><strong>${esc(t.nombre)}</strong><small>${esc(roleLabel(t))}</small></span>
          <select data-gf="rol" aria-label="Rol de ${esc(t.nombre)}">${PART_ROLES.map(r => `<option ${g.rol === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
          <input data-gf="como" value="${esc(g.como)}" maxlength="80" placeholder="¿Cómo participó?" aria-label="Cómo participó ${esc(t.nombre)}">
          <button type="button" class="rm" data-g-rm="${i}" aria-label="Quitar a ${esc(t.nombre)}">${icon('x')}</button></div>` : ''; }).join('')}</div>
        <div class="field team-search"><input data-gq placeholder="+ Agregar persona de la red: escribe un nombre o habilidad" aria-label="Agregar persona de la red" autocomplete="off"><div class="suggest-list" hidden></div></div>
      </article>`).join('') : '<p class="mini-empty">¿Ya hiciste proyectos con gente de la carrera? Súmalos y quedarán conectados en la red.</p>';
  }
  function showJoinSug(input, pr) {
    const box = input.parentNode.querySelector('.suggest-list'), qn = norm(input.value);
    if (!qn) { box.hidden = true; return; }
    const inside = new Set(pr.gente.map(g => g.id));
    const list = state.perfiles.filter(x => !inside.has(x.id) && norm([x.nombre, ...(x.habilidades || [])].join(' ')).includes(qn)).slice(0, 6);
    box.innerHTML = list.length ? list.map(x => `<button type="button" data-g-add="${x.id}">${avatarHTML(x)}<span>${esc(x.nombre)}<small>${esc(roleLabel(x))} · ${esc(state.nicheById.get(x.nicho).corto)}</small></span></button>`).join('') : '<p class="mini-empty" style="margin:0">Sin coincidencias en la red</p>';
    box.hidden = false;
  }
  function setErr(input, msg) {
    const f = input.closest('.field'); if (!f) return;
    f.classList.toggle('has-error', !!msg);
    input.setAttribute('aria-invalid', !!msg);
    const p = f.querySelector('.field__err'); if (p) p.textContent = msg;
  }
  function validateJoin() {
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
    if (!ob.nicho) { $('#nicheErr').textContent = 'Elige un campo'; ok = false; }
    else if (!ob.areas.size) { $('#areaErr').textContent = 'Selecciona al menos un área'; ok = false; }
    const bad = ob.projects.find(p => !p.titulo.trim());
    if (bad) { toast('Ponle nombre a cada proyecto o quítalo'); ok = false; }
    if (!ok) {
      const first = $('#obForm .has-error input, #obForm .has-error select') || (!ob.nicho || !ob.areas.size ? $('#jsCampo') : null);
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => first?.focus?.({ preventScroll: true }), 300);
      $('#joinErr').textContent = 'Revisa los campos marcados.';
    } else $('#joinErr').textContent = '';
    return ok;
  }
  async function submitJoin() {
    if (!validateJoin()) return;
    const rol = $('input[name="rol"]:checked').value, nombre = $('#obName').value.trim().replace(/\s+/g, ' ');
    const portafolio = {};
    [['linkedin', '#obLinkedin'], ['behance', '#obBehance'], ['instagram', '#obInstagram']].forEach(([k, sel]) => { const u = normalizeUrl($(sel).value); if (u) portafolio[k] = u; });
    const av = ob.avState || {};
    const anio = +$('#obSemester').value;
    const user = {
      id: uid('u'), nombre, passHash: await hashPass($('#obPass').value), genero: $('#obGender').value, rol,
      semestre: rol === 'estudiante' ? anio : null, egreso: rol === 'egresado' ? anio : null,
      foto: av.mode === 'foto' ? av.foto || '' : '', avatar: { img: av.img || AVATARS[2], bg: av.bg || AV_COLORS[0] }, avatarHistoria: $('#obAvStory').value.trim(),
      banner: '', ciudad: $('#obCity').value.trim(), correo: $('#obEmail').value.trim().toLowerCase(), bio: $('#obBio').value.trim(), tagline: '',
      nicho: ob.nicho, areas: [...ob.areas], habilidades: ob.skills.slice(0, 8), abierto: true,
      portafolio, links: [], productos: [], trayectoria: [{ cargo: 'Diseño Industrial', lugar: 'Utadeo', periodo: rol === 'estudiante' ? `${anio}.º semestre` : `Egreso ${anio}` }], creado: new Date().toISOString()
    };
    if (!store.patch(d => { d.usuarios = [...(d.usuarios || []), user]; delete d.joinDraft; })) return;
    state.perfiles.push(user);
    // Proyectos del registro: quedan publicados y conectados con su gente
    ob.projects.forEach(pr => {
      const p = newProject({ titulo: pr.titulo.trim(), tipo: pr.tipo, descripcion: pr.descripcion.trim() || pr.titulo.trim(), estado: 'finalizado', borrador: false, autor: user.id, origen: 'registro',
        participantes: pr.gente.map(g => g.id), roles: Object.fromEntries([[user.id, 'Autor/a'], ...pr.gente.map(g => [g.id, [g.rol, g.como].filter(Boolean).join(' · ')])]),
        areas: [...ob.areas].slice(0, 2), creado: `${pr.anio || new Date().getFullYear()}-01-01`, sector: '' });
      saveProject(p);
      pr.gente.forEach(g => notify(g.id, { tipo: 'mencion', de: user.id, proyecto: p.id, texto: `${nombre} te mencionó en su proyecto «${p.titulo}»` }));
    });
    notify(user.id, { tipo: 'bienvenida', texto: '¡Bienvenido/a a NexoTadeo! Completa tu marca personal sumando productos a tu perfil.' });
    signIn(user);
    resetJoin();
    hideAuth();
    go('#red');
    setTimeout(() => { const cell = state.profileCell.get(user.id); if (cell) { cell.el.classList.add('is-new'); centerOn(cell, 1.2); } }, 120);
    toast(`Bienvenid${user.genero === 'F' ? 'a' : user.genero === 'M' ? 'o' : 'e'} a la red, ${firstName(nombre)}`);
  }
  // «Guardar y terminar después»: guarda lo escrito (sin contraseñas) en este navegador
  function saveJoinDraft() {
    const draft = { nombre: $('#obName').value, correo: $('#obEmail').value, genero: $('#obGender').value, ciudad: $('#obCity').value, bio: $('#obBio').value,
      rol: $('input[name="rol"]:checked').value, nicho: ob.nicho, areas: [...ob.areas], skills: ob.skills, av: ob.avState, historia: $('#obAvStory').value, projects: ob.projects };
    if (store.patch(d => { d.joinDraft = draft; })) toast('Guardamos tu avance en este navegador. Vuelve a «Unirme a la red» para terminar.');
  }
  function restoreJoinDraft() {
    const d = store.read().joinDraft;
    if (!d || ob.restored) { renderNichePick(); renderSkills(); renderJoinProjects(); return; }
    ob.restored = true;
    $('#obName').value = d.nombre || ''; $('#obEmail').value = d.correo || ''; $('#obGender').value = d.genero || ''; $('#obCity').value = d.ciudad || ''; $('#obBio').value = d.bio || '';
    ob.nicho = d.nicho; ob.areas = new Set(d.areas || []); ob.skills = d.skills || []; ob.projects = d.projects || [];
    $('#obAvStory').value = d.historia || '';
    if (d.av) ob.av = mountAvatarEditor($('#joinAvatar'), d.av, st => { ob.avState = st; });
    renderNichePick(); renderSkills(); renderJoinProjects();
    toast('Recuperamos el registro que dejaste a medias');
  }
  function resetJoin() {
    $('#obForm').reset();
    ob.nicho = null; ob.areas.clear(); ob.skills = []; ob.projects = [];
    ob.av = mountAvatarEditor($('#joinAvatar'), {}, st => { ob.avState = st; });
    renderNichePick(); renderSkills(); renderJoinProjects();
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
      participantes: [], roles: {}, areas: [], imagenes: [], enlaces: [], borrador: true, enviado: null, abierto: false, busca: [], cierra: '',
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
    closeModal('#pdModal'); closeModal('#viewerModal');
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
            <div class="field open-box"><label class="switch"><input type="checkbox" id="pmOpen" ${p.abierto ? 'checked' : ''}><span class="switch__ui" aria-hidden="true"></span><span><strong>Abierto a nuevo talento</strong><small>Aparecerá en «Unirme a un proyecto»</small></span></label>
              <div class="open-box__body" ${p.abierto ? '' : 'hidden'}>
                <span class="label">¿A quién buscan?</span>
                <div class="chips chips--pick" id="pmBusca">${state.nichos.map(n => { const b = (p.busca || []).find(x => x.nicho === n.id); return `<button type="button" data-busca="${n.id}" aria-pressed="${!!b}" style="--c:${n.color}"><i></i>${esc(n.corto)}</button>`; }).join('')}</div>
                <div class="field" style="margin:0"><label for="pmCierra">Cierre de la convocatoria</label><input id="pmCierra" type="date" value="${esc(p.cierra || '')}"></div>
              </div>
            </div>
          </div>
        </div>`,
      equipo: `<p class="ob-help">Menciona a las personas que están participando o participaron en el proyecto.</p>
        <div class="field team-search"><label for="pmQ">Agregar persona</label><input id="pmQ" placeholder="Escribe un nombre, área o habilidad" autocomplete="off"><div class="suggest-list" id="pmSug" hidden></div></div>
        <div class="member-list">${team.length ? team.map((t, i) => { const tn = state.nicheById.get(t.nicho); return `<div class="member">${avatarHTML(t)}<div><strong>${esc(t.nombre)}</strong>${i === 0 ? '<span class="lead">Líder</span>' : ''}<input class="member__role" data-role="${t.id}" value="${esc((p.roles || {})[t.id] || '')}" placeholder="¿Cómo participa?" aria-label="Rol de ${esc(t.nombre)}" maxlength="80"><p>${esc(roleLabel(t))} · ${esc(tn.nombre)}<br>${t.areas.map(a => esc(state.areaById.get(a).nombre)).join(', ')}${(t.habilidades || []).length ? ` · ${esc(t.habilidades.join(', '))}` : ''}<br>${esc(t.correo || '')}</p></div>${i === 0 ? '' : `<button class="rm" type="button" data-rm-member="${t.id}" aria-label="Quitar a ${esc(t.nombre)}">${icon('x')}</button>`}</div>`; }).join('') : '<p class="mini-empty">Inicia sesión para quedar como líder del proyecto y agrega a tu equipo.</p>'}</div>`,
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
      if (t.dataset.role) { pm.p.roles = { ...(pm.p.roles || {}), [t.dataset.role]: t.value }; }
      if (t.id === 'pmCierra') pm.p.cierra = t.value;
    });
    body.addEventListener('change', async e => {
      const pm = state.pm, t = e.target;
      if (t.dataset.k === 'sector') { pm.p.sector = t.value; pm.dirty = true; }
      if (t.dataset.k === 'tipo') { pm.p.tipo = t.value; pm.dirty = true; }
      if (t.id === 'pmOpen') { pm.p.abierto = t.checked; pm.dirty = true; $('.open-box__body').hidden = !t.checked; }
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
      const bu = e.target.closest('#pmBusca [data-busca]');
      if (bu) { const id = bu.dataset.busca, n = state.nicheById.get(id); const has = (pm.p.busca || []).some(x => x.nicho === id); pm.p.busca = has ? pm.p.busca.filter(x => x.nicho !== id) : [...(pm.p.busca || []), { rol: n.corto, nicho: id, cupos: 1 }]; bu.setAttribute('aria-pressed', !has); pm.dirty = true; return; }
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
    // publicar: el proyecto entra al panal de su nicho y la red se expande
    const wasPublished = state.proyectos.some(x => x.id === p.id && !x.borrador);
    p.borrador = false;
    if (!saveProject(JSON.parse(JSON.stringify(p)))) return;
    pm.dirty = false;
    closeModal('#pmModal');
    (p.participantes || []).forEach(id => notify(id, { tipo: 'mencion', de: state.me.id, proyecto: p.id, texto: `${state.me.nombre} te sumó al proyecto «${p.titulo}»` }));
    if (wasPublished) { toast('Cambios guardados'); refreshAll(); return; }
    state.newProjectId = p.id;
    refreshAll();
    go('#red');
    setTimeout(() => { const c = state.projectCell.get(p.id); if (c) { if (state.focus) closeFocus(false); centerOn(c, 1.1); } }, 80);
    toast(`Se publicó «${p.titulo}» · la red se expandió`);
    setTimeout(() => { state.newProjectId = null; $$('.cell.is-fresh').forEach(el => el.classList.remove('is-fresh')); }, 9000);
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
    toggleCabito(false);
    openPM(p, 'brief');
    state.pm.dirty = true;
    // Si hay sesión, queda guardado en Borradores desde ya
    if (state.me) { p.autor = state.me.id; state.pm.p.autor = state.me.id; if (!existing) { saveProject({ ...JSON.parse(JSON.stringify(state.pm.p)), borrador: true }); updatePMStatus(); } }
  }
  function showTeam(ids) {
    const set = new Set(ids);
    if (state.page !== 'red') go('#red');
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
    $('#createProjectBtn').setAttribute('aria-expanded', String(open));
    if (open) toggleHelp(false);
    if (open && !state.cab) cabitoWelcome();
    if (!open && state.cab) stopAutoOpen();
  }
  function setupCabito() {
    $('#cabitoClose').addEventListener('click', () => toggleCabito(false));
    $('#cabitoReset').addEventListener('click', () => { stopAutoOpen(); cabitoWelcome(); clearMatch(); });
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
     NOTIFICACIONES (por persona, en este navegador)
     ========================================================= */
  function notifsOf(id) { return (store.read().notifs || {})[id] || []; }
  function notify(to, n) {
    if (!to) return;
    store.patch(d => { d.notifs = d.notifs || {}; d.notifs[to] = [{ id: uid('n'), fecha: new Date().toISOString(), leida: false, ...n }, ...(d.notifs[to] || [])].slice(0, 60); });
    if (state.me && to === state.me.id) renderBell();
  }
  function updateNotif(id, fn) { store.patch(d => { const l = (d.notifs || {})[state.me.id] || []; const n = l.find(x => x.id === id); if (n) fn(n); }); }
  function renderBell() {
    if (!state.me) return;
    const unread = notifsOf(state.me.id).filter(n => !n.leida).length;
    $('#bellCount').hidden = !unread; $('#bellCount').textContent = unread > 9 ? '9+' : unread;
    $('#bellBtn').setAttribute('aria-label', unread ? `Notificaciones: ${unread} sin leer` : 'Notificaciones');
  }
  const ago = iso => { const m = Math.round((Date.now() - new Date(iso)) / 6e4); return m < 1 ? 'ahora' : m < 60 ? `hace ${m} min` : m < 1440 ? `hace ${Math.round(m / 60)} h` : fmtDate(iso); };
  function renderNotifs() {
    const list = notifsOf(state.me.id);
    $('#notifPanel').innerHTML = `<div class="pop__head"><strong>Notificaciones</strong>${list.length ? '<button type="button" class="link" data-n-clear>Marcar todo como leído</button>' : ''}</div>
      <div class="notif__list">${list.length ? list.map(n => {
        const from = person(n.de), team = state.equipos.find(t => t.id === n.equipo), pj = projectById(n.proyecto);
        let acts = '';
        if (n.tipo === 'invitacion' && team && !n.resuelta) acts = `<button class="btn btn--primary btn--xs" type="button" data-n-join="${n.id}">Unirme</button><button class="btn btn--outline btn--xs" type="button" data-n-team="${team.id}">Ver equipo</button><button class="btn btn--ghost btn--xs" type="button" data-n-no="${n.id}">Rechazar</button>`;
        if (n.tipo === 'solicitud' && team && !n.resuelta) acts = `<button class="btn btn--primary btn--xs" type="button" data-n-accept="${n.id}">Aceptar</button><button class="btn btn--outline btn--xs" type="button" data-open="${n.de}">Ver perfil</button>`;
        if ((n.tipo === 'postulacion' || n.tipo === 'mencion') && pj) acts = `<button class="btn btn--outline btn--xs" type="button" data-project="${pj.id}">Ver proyecto</button>`;
        if (n.resuelta) acts = `<span class="muted">${esc(n.resuelta)}</span>`;
        return `<div class="notif__it ${n.leida ? '' : 'is-new'}">${from ? avatarHTML(from) : `<span class="avatar avatar--brand">${icon('hex')}</span>`}<div><p>${esc(n.texto)}</p><small>${ago(n.fecha)}</small>${acts ? `<div class="notif__acts">${acts}</div>` : ''}</div></div>`;
      }).join('') : '<p class="mini-empty" style="margin:12px">No tienes notificaciones todavía.</p>'}</div>`;
  }
  function togglePop(id, btn, force) {
    const pop = $(id), open = force ?? pop.hidden;
    $$('.pop').forEach(p => { if (p !== pop) p.hidden = true; });
    $$('[aria-controls="notifPanel"],[aria-controls="meMenu"]').forEach(b => b.setAttribute('aria-expanded', 'false'));
    pop.hidden = !open; btn?.setAttribute('aria-expanded', open);
    return open;
  }
  function openBell() {
    if (!state.me) return;
    if (!togglePop('#notifPanel', $('#bellBtn'))) return;
    renderNotifs();
    setTimeout(() => store.patch(d => { ((d.notifs || {})[state.me.id] || []).forEach(n => { n.leida = true; }); }) && renderBell(), 1500);
  }
  function renderMeMenu() {
    const me = state.me;
    $('#meMenu').innerHTML = `<div class="menu__me">${avatarHTML(me)}<div><strong>${esc(me.nombre)}</strong><small>${esc(me.correo || '')}</small></div></div>
      <a role="menuitem" href="#perfil-${me.id}">${icon('hex')}Mi perfil</a><a role="menuitem" href="#board">${icon('board')}Mi board</a><a role="menuitem" href="#mis-equipos">${icon('team')}Mis equipos</a>
      <button role="menuitem" type="button" data-logout>${icon('logout')}Cerrar sesión</button>`;
  }

  /* =========================================================
     EQUIPOS
     ========================================================= */
  const publicTeams = () => state.equipos.filter(t => t.publico);
  const teamById = id => state.equipos.find(t => t.id === id);
  const myTeams = () => state.me ? state.equipos.filter(t => t.lider === state.me.id || t.miembros.includes(state.me.id) || (t.invitados || []).includes(state.me.id)) : [];
  function saveTeam(t) {
    const i = state.equipos.findIndex(x => x.id === t.id);
    if (i >= 0) state.equipos[i] = t; else state.equipos.push(t);
    return store.patch(d => { d.equipos = d.equipos || []; const j = d.equipos.findIndex(x => x.id === t.id); if (j >= 0) d.equipos[j] = t; else d.equipos.push(t); });
  }
  function teamCardHTML(t, compact = false) {
    const lead = person(t.lider), members = t.miembros.map(person).filter(Boolean), me = state.me?.id;
    const isMember = me && t.miembros.includes(me), invited = me && (t.invitados || []).includes(me), asked = me && (t.solicitudes || []).includes(me);
    const busca = (t.busca || []);
    return `<article class="tcard ${compact ? 'tcard--compact' : 'panel'}">
      <div class="tcard__a"><h3>${esc(t.nombre)}</h3>${t.lider === me ? '<span class="tag tag--blue">Tu equipo</span>' : isMember ? '<span class="tag tag--blue">Eres parte</span>' : invited ? '<span class="tag tag--warn">Te invitaron</span>' : ''}${!t.publico ? '<span class="tag">Privado</span>' : ''}</div>
      <p>${esc(t.descripcion || 'Sin descripción')}</p>
      <div class="stk">${members.slice(0, 6).map(m => `<button type="button" data-open="${m.id}" title="${esc(m.nombre)}">${avatarHTML(m)}</button>`).join('')}<em>${plural(members.length, 'integrante', 'integrantes')}${(t.invitados || []).length ? ` · ${(t.invitados || []).length} invitados` : ''}</em></div>
      <div class="tcard__b">${busca.length ? `<span class="need">Buscan: ${esc(busca.join(', '))}</span>` : '<span class="tag">Equipo completo</span>'}
        ${invited ? `<button class="btn btn--primary btn--sm" type="button" data-team-join="${t.id}">Unirme</button>` : isMember || t.lider === me ? `<button class="btn btn--outline btn--sm" type="button" data-team-view="${t.id}">Ver equipo</button>` : busca.length ? `<button class="btn btn--primary btn--sm" type="button" data-team-ask="${t.id}" ${asked ? 'disabled' : ''}>${asked ? 'Solicitud enviada' : 'Pedir unirme'}</button>` : `<button class="btn btn--outline btn--sm" type="button" data-team-view="${t.id}">Ver equipo</button>`}</div>
      <small class="tcard__lead">Lidera ${esc(lead?.nombre || '')}</small>
    </article>`;
  }
  function teamAction(e) {
    const q = s => e.target.closest(s);
    if (q('[data-team-join]')) { joinTeam(q('[data-team-join]').dataset.teamJoin); return true; }
    if (q('[data-team-ask]')) { askTeam(q('[data-team-ask]').dataset.teamAsk); return true; }
    if (q('[data-team-view]')) { viewTeam(q('[data-team-view]').dataset.teamView); return true; }
    return false;
  }
  function joinTeam(id, notifId) {
    const t = teamById(id); if (!t || !requireLoginFor('unirte a un equipo')) return;
    t.invitados = (t.invitados || []).filter(x => x !== state.me.id);
    if (!t.miembros.includes(state.me.id)) t.miembros.push(state.me.id);
    saveTeam(t);
    if (notifId) updateNotif(notifId, n => { n.resuelta = 'Te uniste al equipo'; });
    notify(t.lider, { tipo: 'respuesta', de: state.me.id, equipo: t.id, texto: `${state.me.nombre} aceptó unirse a «${t.nombre}»` });
    toast(`Ahora eres parte de «${t.nombre}»`); refreshTeamsUI();
  }
  function askTeam(id) {
    const t = teamById(id); if (!t || !requireLoginFor('pedir unirte a un equipo')) return;
    t.solicitudes = [...new Set([...(t.solicitudes || []), state.me.id])];
    saveTeam(t);
    notify(t.lider, { tipo: 'solicitud', de: state.me.id, equipo: t.id, texto: `${state.me.nombre} quiere unirse a tu equipo «${t.nombre}»` });
    toast(`Le avisamos a ${person(t.lider)?.nombre || 'quien lidera el equipo'}`); refreshTeamsUI();
  }
  function viewTeam(id) {
    const t = teamById(id); if (!t) return;
    const members = t.miembros.map(person).filter(Boolean), inv = (t.invitados || []).map(person).filter(Boolean);
    const c = commonOf(members);
    $('#viewerBody').innerHTML = `<div class="vt"><p class="eyebrow">Equipo ${t.publico ? 'público' : 'privado'}</p><h2>${esc(t.nombre)}</h2><p class="muted">${esc(t.descripcion || '')}</p>
      <h4>Integrantes · ${members.length}</h4><div class="pd__team">${members.map(m => `<button class="pd__person" type="button" data-open="${m.id}">${avatarHTML(m)}<span><strong>${esc(m.nombre)}${m.id === t.lider ? ' · líder' : ''}</strong><small>${esc(roleLabel(m))} · ${esc(state.nicheById.get(m.nicho).corto)}</small></span></button>`).join('')}</div>
      ${inv.length ? `<h4>Invitaciones pendientes</h4><div class="chips">${inv.map(m => `<span class="chip">${esc(m.nombre)}</span>`).join('')}</div>` : ''}
      ${c.common.length ? `<h4>Lo que tienen en común</h4><div class="chips">${c.common.map(x => `<span class="tag tag--ok">${esc(x)}</span>`).join('')}</div>` : ''}
      <div class="pd__actions">${t.lider === state.me?.id ? `<button class="btn btn--outline" type="button" data-team-toggle="${t.id}">${t.publico ? 'Hacer privado' : 'Hacer público'}</button><button class="btn btn--danger-ghost" type="button" data-team-del="${t.id}">Eliminar equipo</button>` : ''}<a class="btn btn--primary" href="mailto:${members.map(m => m.correo).filter(Boolean).join(',')}">${icon('mail')} Escribir al equipo</a></div></div>`;
    openModal('#viewerModal');
  }

  // Lo que tienen en común y en qué se complementan (base del board del equipo)
  function commonOf(list) {
    if (list.length < 2) return { common: [], complement: [], insight: '' };
    const count = (arr) => { const m = new Map(); arr.forEach(x => m.set(x, (m.get(x) || 0) + 1)); return m; };
    const half = Math.max(2, Math.ceil(list.length / 2));
    const pick = (m, fmt = x => x) => [...m].filter(([, n]) => n >= half).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${fmt(k)}${n === list.length ? '' : ` · ${n}/${list.length}`}`);
    const nich = pick(count(list.map(p => p.nicho)), id => state.nicheById.get(id).corto);
    const areas = pick(count(list.flatMap(p => p.areas)), id => state.areaById.get(id).nombre);
    const skills = pick(count(list.flatMap(p => (p.habilidades || []).map(norm))), k => list.flatMap(p => p.habilidades || []).find(h => norm(h) === k));
    const sectors = pick(count(list.flatMap(p => [...new Set(projectsOf(p.id).map(x => x.sector).filter(Boolean))])), id => `Sector ${sectorName(id)}`);
    const city = pick(count(list.map(p => p.ciudad).filter(Boolean)));
    const roles = pick(count(list.map(p => p.rol)), r => r === 'egresado' ? 'Egresados' : 'Estudiantes');
    const common = [...nich, ...areas, ...skills, ...sectors, ...city, ...roles].slice(0, 8);
    const complement = list.map(p => { const own = (p.habilidades || []).find(h => list.every(o => o === p || !(o.habilidades || []).some(x => norm(x) === norm(h)))); return own ? `${own} · ${firstName(p.nombre)}` : null; }).filter(Boolean);
    const ids = new Set(list.map(p => p.id));
    const together = published().find(pj => teamOf(pj).filter(t => ids.has(t.id)).length >= 2);
    const have = new Set(list.map(p => p.nicho));
    const missing = ['gestion', 'uxui', 'producto', 'servicios', 'sostenibilidad', 'habitat', 'social'].filter(id => !have.has(id)).slice(0, 1).map(id => state.nicheById.get(id).corto);
    const insight = [together ? `Ya trabajaron juntos en <b>${esc(together.titulo)}</b>.` : '', missing.length ? `Les faltaría alguien de <b>${esc(missing[0])}</b>.` : ''].filter(Boolean).join(' ');
    return { common, complement, insight };
  }

  /* ---------- Vista «Crear un equipo» ---------- */
  state.eqTab = 'crear';
  function renderEquipos() {
    $$('#eqTabs [data-eqtab]').forEach(b => { const on = b.dataset.eqtab === state.eqTab; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    $$('[data-eqpane]').forEach(p => { p.hidden = p.dataset.eqpane !== state.eqTab; });
    $('#eqTitle').textContent = { crear: 'Crear un equipo', publicos: 'Equipos públicos', mios: 'Mis equipos' }[state.eqTab];
    if (state.eqTab === 'crear') { renderEqFilters(); renderEqResults(); renderEqBoard(); }
    if (state.eqTab === 'publicos') $('#publicTeams').innerHTML = publicTeams().map(t => teamCardHTML(t)).join('') || '<div class="empty">Aún no hay equipos públicos.</div>';
    if (state.eqTab === 'mios') $('#myTeams').innerHTML = !state.me ? '<div class="empty">Inicia sesión para ver tus equipos.</div>' : myTeams().map(t => teamCardHTML(t)).join('') || '<div class="empty">Aún no tienes equipos. Arma el primero en «Crear un equipo».</div>';
  }
  function topSkills() { const m = new Map(); state.perfiles.forEach(p => (p.habilidades || []).forEach(h => m.set(h, (m.get(h) || 0) + 1))); return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(x => x[0]); }
  function renderEqFilters() {
    const T = state.team, sk = topSkills();
    const shown = T.allSkills ? sk : sk.slice(0, 14);
    const tipos = PROJECT_TYPES.filter(t => published().some(p => tipoOf(p) === t.id));
    $('#eqFilters').innerHTML = `
      <div class="field"><label for="eqQ">Buscar</label><input id="eqQ" type="search" value="${esc(T.q)}" placeholder="Nombre, bio o ciudad"></div>
      <h4 id="fSk">Habilidades</h4><div class="chips chips--filter" role="group" aria-labelledby="fSk">${shown.map(h => `<button type="button" data-f-skill="${esc(h)}" aria-pressed="${T.skills.has(h)}">${esc(h)}</button>`).join('')}<button type="button" class="link" data-f-more>${T.allSkills ? 'Ver menos' : `+ ${sk.length - 14} más`}</button></div>
      <h4 id="fNi">Rubro / nicho</h4><div class="checks" role="group" aria-labelledby="fNi">${state.nichos.map(n => `<label class="check"><input type="checkbox" data-f-nicho="${n.id}" ${T.nichos.has(n.id) ? 'checked' : ''}><span><i class="dot" style="--c:${n.color}"></i>${esc(n.nombre)}</span></label>`).join('')}</div>
      <h4 id="fTi">Lo que han hecho</h4><div class="chips chips--filter" role="group" aria-labelledby="fTi">${tipos.map(t => `<button type="button" data-f-tipo="${t.id}" aria-pressed="${T.tipos.has(t.id)}">${t.label}</button>`).join('')}</div>
      <h4 id="fRo">Rol</h4><div class="seg seg--full seg--3" role="group" aria-labelledby="fRo">${[['', 'Todos'], ['estudiante', 'Estudiantes'], ['egresado', 'Egresados']].map(([v, l]) => `<button type="button" data-f-rol="${v}" class="${T.rol === v ? 'is-active' : ''}" aria-pressed="${T.rol === v}">${l}</button>`).join('')}</div>
      <label class="check" style="margin-top:14px"><input type="checkbox" data-f-open ${T.abiertos ? 'checked' : ''}><span>Abiertos a nuevos equipos</span></label>
      ${T.skills.size || T.nichos.size || T.tipos.size || T.rol || T.q ? '<button type="button" class="btn btn--ghost btn--sm btn--block" data-f-clear>Limpiar filtros</button>' : ''}`;
  }
  function eqCandidates() {
    const T = state.team, me = state.me?.id, qn = norm(T.q);
    return state.perfiles.filter(p => p.id !== me)
      .filter(p => !qn || norm([p.nombre, p.bio, p.ciudad, p.tagline].join(' ')).includes(qn))
      .filter(p => !T.nichos.size || T.nichos.has(p.nicho))
      .filter(p => !T.rol || p.rol === T.rol)
      .filter(p => !T.abiertos || p.abierto !== false)
      .filter(p => !T.tipos.size || projectsOf(p.id).some(x => T.tipos.has(tipoOf(x))))
      .map(p => ({ p, score: (p.habilidades || []).filter(h => T.skills.has(h)).length * 3 + projectsOf(p.id).length * .2 + (T.ids.includes(p.id) ? 100 : 0) }))
      .filter(r => !T.skills.size || r.score >= 3 || T.ids.includes(r.p.id))
      .sort((a, b) => b.score - a.score).map(r => r.p);
  }
  function personCardHTML(p) {
    const n = state.nicheById.get(p.nicho), pjs = projectsOf(p.id), inB = state.team.ids.includes(p.id);
    return `<article class="pc panel ${inB ? 'is-in' : ''}" draggable="true" data-drag="${p.id}" aria-label="${esc(p.nombre)}">
      ${inB ? '<span class="pc__in">✓ En el board</span>' : ''}
      <div class="pc__t">${avatarHTML(p, 'avatar--hex')}<div><h3>${esc(p.nombre)}</h3><small><i class="dot" style="--c:${n.color}"></i>${esc(roleLabel(p))} · ${esc(n.corto)}</small></div></div>
      <div class="pc__sk">${(p.habilidades || []).slice(0, 3).map(h => `<span class="tag ${state.team.skills.has(h) ? 'tag--blue' : ''}">${esc(h)}</span>`).join('')}</div>
      <p class="pc__pr">${pjs[0] ? `Último proyecto: <b>${esc(pjs[0].titulo)}</b> · ${plural(pjs.length, 'proyecto', 'proyectos')}` : 'Aún sin proyectos publicados'}</p>
      <div class="pc__ac"><button class="btn btn--outline btn--sm" type="button" data-open="${p.id}">${icon('eye')}Ver perfil</button>${inB ? `<button class="btn btn--ghost btn--sm" type="button" data-unboard="${p.id}">Quitar</button>` : `<button class="btn btn--primary btn--sm" type="button" data-toboard="${p.id}">+ Al board</button>`}</div>
    </article>`;
  }
  function renderEqResults() {
    const list = eqCandidates();
    $('#eqResults').innerHTML = `<div class="eq-res__h" aria-live="polite"><span><b>${plural(list.length, 'persona coincide', 'personas coinciden')}</b> con tu búsqueda</span><span class="muted">Arrastra las tarjetas al board</span></div>` + (list.map(personCardHTML).join('') || '<div class="empty">Nadie coincide con esos filtros. Prueba quitando alguno.</div>');
  }
  function renderEqBoard() {
    const T = state.team, ppl = T.ids.map(person).filter(Boolean), c = commonOf(ppl);
    $('#eqBoard').innerHTML = `
      <div class="eb__h"><h2 id="ebTitle">Board del equipo</h2><span class="tag">${plural(ppl.length, 'persona', 'personas')}</span></div>
      <div class="eb__canvas ${ppl.length ? '' : 'is-empty'}" id="ebDrop" aria-label="Zona para soltar perfiles">${ppl.map((p, i) => `<div class="eb__m" style="--r:${[-2, 1.5, -1, 2, -1.5, 1][i % 6]}deg">${avatarHTML(p, 'avatar--hex')}<b>${esc(p.nombre)}</b><span>${esc(state.nicheById.get(p.nicho).corto)}</span><button type="button" class="eb__x" data-unboard="${p.id}" aria-label="Quitar a ${esc(p.nombre)}">×</button></div>`).join('')}<span class="eb__ghost">${ppl.length ? 'Arrastra más perfiles aquí' : 'Arrastra perfiles aquí o usa «+ Al board»'}</span></div>
      ${ppl.length >= 2 ? `<div class="eb__sec"><h4>✦ Lo que tienen en común</h4><div class="chips">${c.common.map(x => `<span class="tag tag--ok">${esc(x)}</span>`).join('') || '<span class="muted">Aún nada en común: ¡se complementan!</span>'}</div></div>
        ${c.complement.length ? `<div class="eb__sec"><h4>Se complementan en</h4><div class="chips">${c.complement.map(x => `<span class="tag tag--warn">${esc(x)}</span>`).join('')}</div></div>` : ''}
        ${c.insight ? `<p class="eb__ins">${c.insight}</p>` : ''}` : `<p class="eb__ins">Junta al menos dos personas y te muestro qué tienen en común.</p>`}
      <form class="eb__form" id="teamForm" novalidate>
        <div class="field"><label for="teamName">Nombre del equipo</label><input id="teamName" maxlength="40" placeholder="Ej: Circular Lab" value="${esc(T.nombre || '')}"></div>
        <div class="field"><label for="teamDesc">¿Para qué se juntan? <span class="muted">(opcional)</span></label><input id="teamDesc" maxlength="120" placeholder="Ej: Mobiliario con materiales recuperados" value="${esc(T.desc || '')}"></div>
        <label class="switch"><input type="checkbox" id="teamPublic" ${T.publico !== false ? 'checked' : ''}><span class="switch__ui" aria-hidden="true"></span><span><strong>Equipo público</strong><small>Aparecerá en la pestaña «Equipos públicos»</small></span></label>
        <button class="btn btn--primary btn--block btn--lg" type="submit" ${ppl.length ? '' : 'disabled'}>Formar equipo e invitar</button>
        <p class="field__hint" style="text-align:center">Se guardará en tu perfil y cada persona recibirá: «${esc(state.me ? firstName(state.me.nombre) : 'Tú')} quiere que te unas a su equipo».</p>
      </form>`;
  }
  function addToBoard(id) { if (!state.team.ids.includes(id)) state.team.ids.push(id); renderEqResults(); renderEqBoard(); }
  function removeFromBoard(id) { state.team.ids = state.team.ids.filter(x => x !== id); renderEqResults(); renderEqBoard(); }
  function formTeam() {
    if (!requireLoginFor('formar un equipo')) return;
    const T = state.team, nombre = $('#teamName').value.trim();
    if (!nombre) { setErr($('#teamName'), 'Ponle un nombre al equipo'); $('#teamName').focus(); return; }
    if (!T.ids.length) { toast('Agrega al menos una persona al board'); return; }
    const t = { id: uid('eq'), nombre, descripcion: $('#teamDesc').value.trim(), lider: state.me.id, miembros: [state.me.id], invitados: T.ids.filter(x => x !== state.me.id), publico: $('#teamPublic').checked, busca: [], creado: new Date().toISOString() };
    if (!saveTeam(t)) return;
    t.invitados.forEach(id => notify(id, { tipo: 'invitacion', de: state.me.id, equipo: t.id, texto: `${state.me.nombre} quiere que te unas a su equipo «${t.nombre}»` }));
    state.team = { ...state.team, ids: [], nombre: '', desc: '' };
    toast(`Equipo «${t.nombre}» creado · ${plural(t.invitados.length, 'invitación enviada', 'invitaciones enviadas')}`);
    state.eqTab = 'mios'; renderEquipos(); renderNav();
  }
  function refreshTeamsUI() { if (state.page === 'equipos') renderEquipos(); renderTeamsDrawer(); renderNav(); if (!$('#notifPanel').hidden) renderNotifs(); if (state.page === 'perfil') renderProfile(state.profileId); }

  function setupTeams() {
    $('#eqTabs').addEventListener('click', e => { const b = e.target.closest('[data-eqtab]'); if (b) go(b.dataset.eqtab === 'crear' ? '#equipos' : b.dataset.eqtab === 'publicos' ? '#equipos-publicos' : '#mis-equipos'); });
    const v = $('#viewEquipos');
    v.addEventListener('click', e => {
      const q = s => e.target.closest(s), T = state.team;
      if (teamAction(e)) return;
      if (q('[data-f-skill]')) { const h = q('[data-f-skill]').dataset.fSkill; T.skills.has(h) ? T.skills.delete(h) : T.skills.add(h); renderEqFilters(); renderEqResults(); return; }
      if (q('[data-f-more]')) { T.allSkills = !T.allSkills; renderEqFilters(); return; }
      if (q('[data-f-tipo]')) { const h = q('[data-f-tipo]').dataset.fTipo; T.tipos.has(h) ? T.tipos.delete(h) : T.tipos.add(h); renderEqFilters(); renderEqResults(); return; }
      if (q('[data-f-rol]')) { T.rol = q('[data-f-rol]').dataset.fRol; renderEqFilters(); renderEqResults(); return; }
      if (q('[data-f-clear]')) { Object.assign(T, { q: '', skills: new Set(), nichos: new Set(), tipos: new Set(), rol: '' }); renderEqFilters(); renderEqResults(); return; }
      if (q('[data-toboard]')) return addToBoard(q('[data-toboard]').dataset.toboard);
      if (q('[data-unboard]')) return removeFromBoard(q('[data-unboard]').dataset.unboard);
    });
    v.addEventListener('change', e => {
      const t = e.target, T = state.team;
      if (t.dataset.fNicho) { t.checked ? T.nichos.add(t.dataset.fNicho) : T.nichos.delete(t.dataset.fNicho); renderEqResults(); }
      if (t.hasAttribute('data-f-open')) { T.abiertos = t.checked; renderEqResults(); }
    });
    let qt; v.addEventListener('input', e => {
      if (e.target.id === 'eqQ') { clearTimeout(qt); qt = setTimeout(() => { state.team.q = e.target.value; renderEqResults(); }, 180); }
      if (e.target.id === 'teamName') { state.team.nombre = e.target.value; setErr(e.target, ''); }
      if (e.target.id === 'teamDesc') state.team.desc = e.target.value;
      if (e.target.id === 'teamPublic') state.team.publico = e.target.checked;
    });
    v.addEventListener('submit', e => { if (e.target.id === 'teamForm') { e.preventDefault(); formTeam(); } });
    // Arrastrar y soltar al board
    v.addEventListener('dragstart', e => { const c = e.target.closest('[data-drag]'); if (!c) return; e.dataTransfer.setData('text/plain', c.dataset.drag); e.dataTransfer.effectAllowed = 'copy'; c.classList.add('is-dragging'); });
    v.addEventListener('dragend', e => e.target.closest?.('[data-drag]')?.classList.remove('is-dragging'));
    v.addEventListener('dragover', e => { const d = e.target.closest('#ebDrop'); if (!d) return; e.preventDefault(); d.classList.add('is-over'); });
    v.addEventListener('dragleave', e => e.target.closest('#ebDrop')?.classList.remove('is-over'));
    v.addEventListener('drop', e => { const d = e.target.closest('#ebDrop'); if (!d) return; e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (person(id)) addToBoard(id); });
  }

  /* ---------- Pestaña lateral de equipos públicos (desde la red) ---------- */
  state.tdTab = 'todos';
  function renderTeamsDrawer() {
    $$('#tdTabs [data-tdtab]').forEach(b => b.classList.toggle('is-active', b.dataset.tdtab === state.tdTab));
    const list = state.tdTab === 'mios' ? myTeams() : state.tdTab === 'buscan' ? publicTeams().filter(t => (t.busca || []).length) : publicTeams();
    $('#teamsDrawerBody').innerHTML = list.map(t => teamCardHTML(t, true)).join('') || `<p class="mini-empty">${state.tdTab === 'mios' ? 'Aún no tienes equipos.' : 'No hay equipos aquí todavía.'}</p>`;
    $('#teamsDrawerBody').insertAdjacentHTML('beforeend', '<a class="btn btn--outline btn--block" href="#equipos">Crear un equipo</a>');
  }
  function toggleTeamsDrawer(open) {
    const d = $('#teamsDrawer');
    open = open ?? !d.classList.contains('is-open');
    if (open) renderTeamsDrawer();
    d.classList.toggle('is-open', open); d.setAttribute('aria-hidden', !open);
    $('#drawerScrim').classList.toggle('is-open', open);
    $('#teamsTab').setAttribute('aria-expanded', open);
    if (open) setTimeout(() => $('[data-close-drawer]', d).focus(), 250); else $('#teamsTab').focus({ preventScroll: true });
  }

  /* =========================================================
     PERFIL = MARCA PERSONAL
     UX: el perfil se lee como un portafolio: primero quién es
     (héroe), luego lo que ha hecho (productos y proyectos) y
     al costado lo que la hace única (aptitudes, avatar, recorrido).
     ========================================================= */
  const ART = {
    mueble: '<ellipse cx="85" cy="58" rx="52" ry="16" fill="#fff"/><path d="M42 66l-12 74M128 66l12 74M85 74v66M52 112h66"/>',
    repisa: '<path d="M40 50h90M40 90h90M40 130h90M50 40v100M120 40v100" /><rect x="60" y="66" width="18" height="24" fill="#fff"/><circle cx="104" cy="118" r="10" fill="#fff"/>',
    envase: '<path d="M68 44h34v14l10 14v70H58V72l10-14z" fill="#fff"/><path d="M58 96h54"/><path d="M70 36h30"/>',
    matera: '<path d="M48 92h74l-10 56H58z" fill="#fff"/><path d="M85 92V56M85 70c-14-2-24-12-26-26 14 1 24 10 26 26zM85 62c4-16 16-24 30-24-2 14-14 24-30 24z"/>',
    lampara: '<path d="M60 30h50l18 50H42z" fill="#fff"/><path d="M85 80v56M60 140h50"/><path d="M54 52h62" stroke-dasharray="3 7"/>',
    solar: '<path d="M40 70l90-20v50l-90 20z" fill="#fff"/><path d="M70 64v50M100 57v50M40 95l90-20"/><circle cx="130" cy="34" r="10"/><path d="M85 120v24M65 144h40"/>',
    agarre: '<path d="M60 40c0-8 16-8 16 0v100c0 8-16 8-16 0z" fill="#fff"/><path d="M68 140v-50"/><path d="M90 60h30c8 0 8 30 0 30H90z" fill="#fff"/>',
    ui: '<rect x="56" y="28" width="58" height="114" rx="10" fill="#fff"/><path d="M68 52h34M68 66h22"/><rect x="68" y="82" width="34" height="18" rx="4"/><rect x="68" y="108" width="34" height="18" rx="4"/>',
    ar: '<rect x="44" y="50" width="82" height="60" rx="10" fill="#fff"/><path d="M85 110v20M60 132h50"/><path d="M70 70l15-8 15 8v18l-15 8-15-8z"/>',
    def: '<path d="M85 32l40 23v46l-40 23-40-23V55z" fill="#fff"/><path d="M85 78l40-23M85 78l-40-23M85 78v46"/>'
  };
  const productArt = (forma, color) => `<svg class="art" viewBox="0 0 170 170" fill="none" style="stroke:${color}" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ART[forma] || ART.def}</svg>`;
  const likesOf = id => (store.read().likes || {})[id] || [];
  const seedLikes = id => [...id].reduce((a, c) => a + c.charCodeAt(0), 0) % 90 + 12;
  const productById = id => { for (const p of state.perfiles) { const x = (p.productos || []).find(y => y.id === id); if (x) return { owner: p, prod: x }; } return null; };
  const isPinned = ref => !!state.me && (boardOf(state.me.id).items || []).some(i => i.ref === ref);

  function openProfile(id) { go(`#perfil-${id}`); }
  function renderProfile(id) {
    const p = person(id);
    const host = $('#profileBody');
    if (!p) { host.innerHTML = '<div class="empty" style="margin:40px auto;max-width:520px">Este perfil ya no está en la red.<br><br><a class="btn btn--primary btn--sm" href="#red">Volver a la red</a></div>'; return; }
    state.profileId = id;
    const n = state.nicheById.get(p.nicho), mine = isMe(p);
    const pjs = projectsOf(p.id), drafts = mine ? draftsOf(p.id) : [];
    const teams = state.equipos.filter(t => t.miembros.includes(p.id));
    const collab = [...new Set(pjs.flatMap(x => teamOf(x).map(t => t.id)))].filter(x => x !== p.id).map(person).filter(Boolean);
    const socials = Object.entries(p.portafolio || {}).filter(([, v]) => v);
    const tab = state.pfTab || 'productos';
    const egreso = p.rol === 'egresado' ? `${p.genero === 'F' ? 'Egresada' : 'Egresado'}${p.egreso ? ' ' + p.egreso : ''}` : roleLabel(p);
    host.innerHTML = `
      <section class="pfh panel" style="--c:${n.color}">
        <div class="pfh__ban" style="${p.banner ? `background-image:url('${esc(p.banner)}')` : `background:linear-gradient(120deg, ${n.color}, ${tint(n.color, 60)})`}">${p.banner ? '' : hexCover('#fff', 3, 30)}${mine ? `<button class="btn btn--light btn--xs pfh__banbtn" type="button" data-change="banner">${icon('cam')} Cambiar portada</button>` : ''}</div>
        <div class="pfh__row">
          <div class="pfh__av">${avatarHTML(p, 'avatar--xl avatar--hex')}${mine ? `<button class="pfh__avbtn" type="button" data-edit-avatar aria-label="Cambiar avatar o foto">${icon('edit')}</button>` : ''}</div>
          <div class="pfh__who">
            <div class="pfh__name"><h1>${esc(p.nombre)}</h1>${p.abierto !== false ? `<span class="tag tag--ok">${p.genero === 'F' ? 'Abierta' : p.genero === 'M' ? 'Abierto' : 'Abierte'} a proyectos</span>` : ''}${mine ? '<span class="tag">Tú</span>' : ''}</div>
            <p class="pfh__meta">${esc(egreso)} · ${esc(n.nombre)}${p.ciudad ? ` · ${esc(p.ciudad)}` : ''}</p>
            ${p.tagline || p.bio ? `<p class="pfh__tag">${esc(p.tagline || p.bio.split('.')[0] + '.')}</p>` : ''}
          </div>
          <div class="pfh__acts">${mine
            ? `<button class="btn btn--outline" type="button" data-edit-profile>${icon('edit')} Editar perfil</button><button class="btn btn--primary" type="button" data-add-product>${icon('plus')} Agregar producto</button>`
            : `<button class="btn btn--outline" type="button" data-pin="perfil:${p.id}" aria-pressed="${isPinned('perfil:' + p.id)}">${icon('bookmark')} ${isPinned('perfil:' + p.id) ? 'En tu board' : 'Guardar en mi board'}</button>${p.correo ? `<a class="btn btn--outline" href="mailto:${esc(p.correo)}?subject=${encodeURIComponent('Hola desde NexoTadeo')}">${icon('mail')} Contactar</a>` : ''}<button class="btn btn--primary" type="button" data-invite="${p.id}">${icon('team')} Invitar a un equipo</button>`}</div>
        </div>
        <div class="pfh__stats">
          <div><b>${pjs.length}</b>Proyectos</div><div><b>${(p.productos || []).length}</b>Productos</div><div><b>${teams.length}</b>Equipos</div><div><b>${collab.length}</b>Colaboraciones</div>
          <div class="pfh__links">${socials.map(([k, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer"><span class="sbadge sbadge--${k}" aria-hidden="true">${SOCIAL[k]?.badge || ''}</span>${SOCIAL[k]?.label || 'Enlace'}</a>`).join('')}${!mine && p.correo ? `<span class="pfh__mail">${esc(p.correo)}</span>` : ''}</div>
        </div>
      </section>
      <div class="pf-grid">
        <div class="pf-content">
          <div class="tabs-line" role="tablist" aria-label="Contenido del perfil">${[['productos', `Productos · ${(p.productos || []).length}`], ['proyectos', `Proyectos · ${pjs.length}`], ['portafolio', 'Portafolio'], ...(mine ? [['borradores', `Borradores · ${drafts.length}`]] : [])].map(([k, l]) => `<button type="button" role="tab" data-pftab="${k}" aria-selected="${tab === k}" class="${tab === k ? 'is-active' : ''}">${l}</button>`).join('')}</div>
          <div class="pf-tabpane" ${tab === 'productos' ? '' : 'hidden'}>${(p.productos || []).length ? `<div class="prods">${p.productos.map(x => productCardHTML(p, x)).join('')}</div>` : `<p class="mini-empty">${mine ? 'Tu marca personal se construye con lo que has hecho. Agrega tu primer producto con fotos y una breve descripción.' : 'Aún no ha publicado productos.'}</p>${mine ? `<button class="btn btn--primary" type="button" data-add-product style="margin-top:12px">${icon('plus')} Agregar producto</button>` : ''}`}</div>
          <div class="pf-tabpane" ${tab === 'proyectos' ? '' : 'hidden'}>${mine ? `<button class="btn btn--light" type="button" data-new-project style="margin-bottom:12px">${icon('plus')} Publicar proyecto</button>` : ''}${pjs.length ? `<div class="pjrows">${pjs.map(x => projectRowHTML(x, p.id)).join('')}</div>` : `<p class="mini-empty">${mine ? 'Publica proyectos que estés ejecutando o que ya terminaste y menciona a tu equipo.' : 'Aún no participa en proyectos publicados.'}</p>`}</div>
          <div class="pf-tabpane" ${tab === 'portafolio' ? '' : 'hidden'}><div class="plinks" id="pfLinks">${socials.map(([, u]) => linkCard(u, false)).join('')}${(p.links || []).map(u => linkCard(u, mine)).join('')}${!socials.length && !(p.links || []).length ? '<p class="mini-empty">Aún no hay enlaces de portafolio.</p>' : ''}</div>
            ${mine ? `<div class="dropzone" id="dropzone"><p>Arrastra aquí el enlace de un proyecto o publicación de Instagram, Behance o LinkedIn, o pégalo abajo.</p><form id="linkForm"><input id="linkInput" type="url" placeholder="https://www.behance.net/gallery/…" aria-label="Enlace de portafolio"><button class="btn btn--primary btn--sm" type="submit">Añadir</button></form></div>` : ''}</div>
          ${mine ? `<div class="pf-tabpane" ${tab === 'borradores' ? '' : 'hidden'}>${drafts.length ? `<div class="mini-list">${drafts.map(x => miniProjectHTML(x, true)).join('')}</div>` : '<p class="mini-empty">No tienes borradores. Lo que guardes sin publicar aparecerá aquí.</p>'}</div>` : ''}
        </div>
        <aside class="pf-side">
          ${p.bio ? `<div class="panel"><h4>Sobre ${mine ? 'mí' : esc(firstName(p.nombre))}</h4><p class="pf-bio">${esc(p.bio)}</p></div>` : ''}
          <div class="panel"><h4>Aptitudes únicas</h4><div class="chips">${(p.habilidades || []).map((h, i) => `<span class="tag ${i < 2 ? 'tag--navy' : ''}">${esc(h)}</span>`).join('') || '<span class="muted">Sin aptitudes todavía</span>'}</div>
            <h4 style="margin-top:16px">Áreas</h4><div class="chips">${p.areas.map(a => `<span class="chip chip--soft" style="--c:${n.color}"><i></i>${esc(state.areaById.get(a).nombre)}</span>`).join('')}</div></div>
          ${!p.foto && p.avatar ? `<div class="panel"><h4>Sobre mi avatar</h4><div class="avstory">${avatarHTML(p, 'avatar--hex')}<q>${esc(p.avatarHistoria || (mine ? 'Cuéntale a la red por qué elegiste tu avatar.' : 'Sin historia todavía.'))}</q></div></div>` : ''}
          <div class="panel"><h4>Trayectoria</h4>${(p.trayectoria || []).length ? `<ol class="tl">${p.trayectoria.map(t => `<li><b>${esc(t.cargo)}${t.lugar ? ` · ${esc(t.lugar)}` : ''}</b><span>${esc(t.periodo || '')}</span></li>`).join('')}</ol>` : '<p class="muted">Sin trayectoria registrada.</p>'}${mine ? '<button type="button" class="link" data-add-tray>+ Agregar experiencia</button>' : ''}</div>
          ${teams.length ? `<div class="panel"><h4>Equipos</h4><div class="mini-teams">${teams.map(t => `<button type="button" data-team-view="${t.id}">${icon('team')}<span>${esc(t.nombre)}</span></button>`).join('')}</div></div>` : ''}
          ${collab.length ? `<div class="panel"><h4>Ha trabajado con</h4><div class="with">${collab.map(c => `<button type="button" data-open="${c.id}" title="${esc(c.nombre)}" aria-label="${esc(c.nombre)}">${avatarHTML(c, 'avatar--hex')}</button>`).join('')}</div></div>` : ''}
          ${mine ? `<div class="panel pf-account"><h4>Cuenta</h4><label class="switch"><input type="checkbox" data-toggle-open ${p.abierto !== false ? 'checked' : ''}><span class="switch__ui" aria-hidden="true"></span><span><strong>Abierto/a a proyectos</strong><small>Te mostramos en «Crear un equipo»</small></span></label><div class="row"><button class="btn btn--outline btn--sm" type="button" data-logout>Cerrar sesión</button><button class="btn btn--danger-ghost btn--sm" type="button" data-delete-me>Eliminar mi perfil</button></div></div>` : ''}
          <button class="btn btn--ghost btn--block" type="button" data-locate="${p.id}">${icon('hex')} Ver en la red</button>
        </aside>
      </div>`;
    if (mine && tab === 'portafolio') bindDropzone(p);
  }
  function productCardHTML(owner, x) {
    const n = state.nicheById.get(owner.nicho), likes = likesOf(x.id), liked = state.me && likes.includes(state.me.id);
    return `<article class="prod panel">
      <button class="prod__img" type="button" data-product="${x.id}" aria-label="Ver ${esc(x.titulo)}" style="background:${tint(n.color, 10)}">${x.imagenes?.[0] ? `<img src="${esc(x.imagenes[0])}" alt="">` : productArt(x.forma, n.color)}<span class="prod__ov">${icon('eye')} Ver producto</span>${(x.imagenes || []).length > 1 ? `<span class="prod__n">${x.imagenes.length} fotos</span>` : ''}</button>
      <div class="prod__bd"><h3>${esc(x.titulo)}</h3><p>${esc(x.descripcion)}${x.anio ? ` · ${esc(x.anio)}` : ''}</p>
        <div class="prod__re"><button type="button" class="react ${liked ? 'is-on' : ''}" data-like="${x.id}" aria-pressed="${!!liked}" aria-label="Me gusta">${icon('heart')}<span>${seedLikes(x.id) + likes.length}</span></button><button type="button" class="react" data-product="${x.id}" aria-label="Ver detalles">${icon('eye')}<span>Ver</span></button><button type="button" class="react react--save ${isPinned('producto:' + x.id) ? 'is-on' : ''}" data-pin="producto:${x.id}">${icon('bookmark')}<span>${isPinned('producto:' + x.id) ? 'Guardado' : 'Guardar'}</span></button></div>
      </div></article>`;
  }
  function projectRowHTML(x, pid) {
    const n = projectNiche(x), team = teamOf(x);
    return `<article class="pjrow panel"><button type="button" class="pjrow__th" data-project="${x.id}" style="background:${tint(n.color, 14)}" aria-label="Ver ${esc(x.titulo)}">${hexCover(n.color, x.titulo.length, 16)}</button>
      <div class="pjrow__bd"><h3><button type="button" class="link-plain" data-project="${x.id}">${esc(x.titulo)}</button></h3><p>${estadoName(x.estado)} · ${esc(sectorName(x.sector))}</p>${(x.roles || {})[pid] || x.autor === pid ? `<span class="rol">Su rol: ${esc((x.roles || {})[pid] || 'Líder del proyecto')}</span>` : ''}</div>
      <div class="stk">${team.filter(t => t.id !== pid).slice(0, 4).map(t => `<button type="button" data-open="${t.id}" title="${esc(t.nombre)}">${avatarHTML(t)}</button>`).join('')}</div></article>`;
  }
  function viewProduct(id) {
    const r = productById(id); if (!r) return;
    const { owner, prod } = r, n = state.nicheById.get(owner.nicho), mine = isMe(owner);
    const imgs = prod.imagenes || [];
    $('#viewerBody').innerHTML = `<div class="pv">
      <div class="pv__media" style="background:${tint(n.color, 10)}">${imgs.length ? `<div class="pv__gal">${imgs.map(s => `<img src="${esc(s)}" alt="">`).join('')}</div>` : productArt(prod.forma, n.color)}</div>
      <div class="pv__bd"><p class="eyebrow">Producto · ${esc(prod.anio || '')}</p><h2>${esc(prod.titulo)}</h2><p>${esc(prod.descripcion)}</p>
        <button class="pv__by" type="button" data-open="${owner.id}">${avatarHTML(owner)}<span><strong>${esc(owner.nombre)}</strong><small>${esc(roleLabel(owner))}</small></span></button>
        ${prod.enlace ? `<a class="btn btn--outline btn--sm" href="${esc(prod.enlace)}" target="_blank" rel="noopener noreferrer">${icon('link')} Ver más</a>` : ''}
        <div class="pd__actions">${mine ? `<button class="btn btn--outline" type="button" data-edit-product="${prod.id}">${icon('edit')} Editar</button><button class="btn btn--danger-ghost" type="button" data-del-product="${prod.id}">Eliminar</button>` : `<button class="btn btn--primary" type="button" data-like="${prod.id}">${icon('heart')} Me gusta · ${seedLikes(prod.id) + likesOf(prod.id).length}</button><button class="btn btn--outline" type="button" data-pin="producto:${prod.id}">${icon('bookmark')} Guardar en mi board</button>`}</div>
      </div></div>`;
    openModal('#viewerModal');
  }
  function toggleLike(id) {
    if (!requireLoginFor('reaccionar a un producto')) return;
    store.patch(d => { d.likes = d.likes || {}; const l = d.likes[id] || []; d.likes[id] = l.includes(state.me.id) ? l.filter(x => x !== state.me.id) : [...l, state.me.id]; });
    if (state.page === 'perfil') renderProfile(state.profileId);
    if ($('#viewerModal').classList.contains('is-open') && $('#viewerBody .pv')) viewProduct(id);
  }

  /* ---------- Guardar cambios del perfil propio ---------- */
  function saveMe(patch) {
    const me = state.me; if (!me) return false;
    Object.assign(me, patch);
    const ok = store.patch(d => {
      const u = (d.usuarios || []).find(x => x.id === me.id);
      if (u) Object.assign(u, patch);
      else { d.overrides = d.overrides || {}; d.overrides[me.id] = { ...(d.overrides[me.id] || {}), ...patch }; }
    });
    if (ok) { refreshAll(); if (state.page === 'perfil') renderProfile(me.id); }
    return ok;
  }
  // Formulario genérico en ventana modal
  let formCb = null;
  function openForm({ eyebrow = '', title, body, submit = 'Guardar', onSubmit, onMount, wide = false, extra = '' }) {
    $('#formEyebrow').textContent = eyebrow; $('#formTitle').textContent = title;
    $('#formBody').innerHTML = body;
    $('#formFoot').innerHTML = `${extra}<button class="btn btn--outline" type="button" data-close>Cancelar</button><button class="btn btn--primary" type="submit">${esc(submit)}</button>`;
    $('#formPanel').classList.toggle('modal__panel--lg', wide);
    formCb = onSubmit;
    openModal('#formModal');
    onMount?.($('#formBody'));
    setTimeout(() => $('#formBody input, #formBody textarea, #formBody select, #formBody button')?.focus(), 200);
  }
  function editProfile() {
    const me = state.me;
    openForm({ eyebrow: 'Tu marca personal', title: 'Editar perfil', body: `
      <div class="field"><label for="epTag">Frase de tu marca</label><input id="epTag" maxlength="90" value="${esc(me.tagline || '')}" placeholder="Ej: Diseño con lo que otros botan."></div>
      <div class="field"><label for="epBio">Biografía</label><textarea id="epBio" rows="3" maxlength="300">${esc(me.bio || '')}</textarea></div>
      <div class="grid-2"><div class="field"><label for="epCity">Ciudad</label><input id="epCity" maxlength="40" value="${esc(me.ciudad || '')}"></div>
      <div class="field"><label for="epSk">Aptitudes <span class="muted">(separadas por coma)</span></label><input id="epSk" maxlength="200" value="${esc((me.habilidades || []).join(', '))}"></div></div>
      <div class="field"><span class="label">Redes</span><div class="social-inputs">${['linkedin', 'behance', 'instagram'].map(k => `<label class="social-input"><span class="sbadge sbadge--${k}" aria-hidden="true">${SOCIAL[k].badge}</span><span class="sr">${SOCIAL[k].label}</span><input data-soc="${k}" type="url" value="${esc((me.portafolio || {})[k] || '')}" placeholder="${SOCIAL[k].label}"></label>`).join('')}</div></div>`,
      onSubmit: () => {
        const portafolio = {}; $$('#formBody [data-soc]').forEach(i => { const u = normalizeUrl(i.value); if (u) portafolio[i.dataset.soc] = u; });
        saveMe({ tagline: $('#epTag').value.trim(), bio: $('#epBio').value.trim(), ciudad: $('#epCity').value.trim(), habilidades: $('#epSk').value.split(',').map(s => s.trim()).filter(Boolean).slice(0, 8), portafolio });
        toast('Perfil actualizado'); return true;
      } });
  }
  function editAvatar() {
    const me = state.me; let st = null;
    openForm({ eyebrow: 'Tu imagen en la red', title: 'Avatar o foto', wide: true, body: `<div class="avedit" id="epAv"></div><div class="field"><label for="epAvH">Cuéntanos sobre tu avatar</label><textarea id="epAvH" rows="2" maxlength="200">${esc(me.avatarHistoria || '')}</textarea></div>`,
      onMount: () => { st = mountAvatarEditor($('#epAv'), { img: me.avatar?.img, bg: me.avatar?.bg, foto: me.foto }, s => { st = s; }); },
      onSubmit: () => { saveMe({ foto: st.mode === 'foto' ? st.foto : '', avatar: { img: st.img, bg: st.bg }, avatarHistoria: $('#epAvH').value.trim() }); toast('Tu imagen se actualizó en toda la red'); return true; } });
  }
  function editProduct(id) {
    const me = state.me, prod = id ? (me.productos || []).find(x => x.id === id) : null;
    const draft = { imagenes: [...(prod?.imagenes || [])] };
    const imgs = () => `${draft.imagenes.map((s, i) => `<div class="img-slot"><img src="${s}" alt=""><button class="rm" type="button" data-rmi="${i}" aria-label="Quitar imagen">${icon('x')}</button></div>`).join('')}${draft.imagenes.length < 4 ? '<label class="img-add">+ Foto<input type="file" accept="image/*" id="ppImg" hidden></label>' : ''}`;
    openForm({ eyebrow: 'Tu marca personal', title: prod ? 'Editar producto' : 'Agregar producto', body: `
      <div class="field"><label for="ppT">Nombre</label><input id="ppT" maxlength="60" value="${esc(prod?.titulo || '')}" placeholder="Ej: Banco Raíz" required><p class="field__err"></p></div>
      <div class="field"><label for="ppD">Descripción</label><textarea id="ppD" rows="3" maxlength="240" placeholder="Material, proceso, para quién es">${esc(prod?.descripcion || '')}</textarea></div>
      <div class="grid-2"><div class="field"><label for="ppA">Año</label><input id="ppA" inputmode="numeric" maxlength="4" value="${esc(prod?.anio || String(new Date().getFullYear()))}"></div>
      <div class="field"><label for="ppL">Enlace <span class="muted">(opcional)</span></label><input id="ppL" type="url" value="${esc(prod?.enlace || '')}" placeholder="Behance, web…"></div></div>
      <div class="field"><span class="label">Fotos <span class="muted">(hasta 4)</span></span><div class="img-row" id="ppImgs">${imgs()}</div></div>`,
      onMount: body => {
        body.addEventListener('change', async e => { if (e.target.id !== 'ppImg' || !e.target.files[0]) return; try { draft.imagenes.push(await resizeImage(e.target.files[0], 900, 700)); $('#ppImgs').innerHTML = imgs(); } catch { toast('No se pudo leer esa imagen'); } });
        body.addEventListener('click', e => { const b = e.target.closest('[data-rmi]'); if (b) { draft.imagenes.splice(+b.dataset.rmi, 1); $('#ppImgs').innerHTML = imgs(); } });
      },
      onSubmit: () => {
        const titulo = $('#ppT').value.trim();
        if (!titulo) { setErr($('#ppT'), 'Ponle un nombre'); return false; }
        const x = { id: prod?.id || uid('prd'), titulo, descripcion: $('#ppD').value.trim(), anio: $('#ppA').value.trim(), enlace: normalizeUrl($('#ppL').value), imagenes: draft.imagenes, forma: prod?.forma || 'def' };
        const list = (me.productos || []).filter(y => y.id !== x.id);
        if (!saveMe({ productos: prod ? (me.productos || []).map(y => y.id === x.id ? x : y) : [x, ...list] })) return false;
        state.pfTab = 'productos'; renderProfile(me.id);
        toast(prod ? 'Producto actualizado' : 'Producto agregado a tu marca personal'); return true;
      } });
  }
  function addTrayectoria() {
    openForm({ eyebrow: 'Trayectoria', title: 'Agregar experiencia', body: `<div class="field"><label for="trC">Cargo o estudio</label><input id="trC" maxlength="60" placeholder="Ej: Diseñadora de producto"></div><div class="grid-2"><div class="field"><label for="trL">Lugar</label><input id="trL" maxlength="60" placeholder="Empresa o institución"></div><div class="field"><label for="trP">Periodo</label><input id="trP" maxlength="30" placeholder="2024 – hoy"></div></div>`,
      onSubmit: () => { const cargo = $('#trC').value.trim(); if (!cargo) return false; saveMe({ trayectoria: [{ cargo, lugar: $('#trL').value.trim(), periodo: $('#trP').value.trim() }, ...(state.me.trayectoria || [])] }); return true; } });
  }
  async function changeBanner(file) {
    try { const data = await resizeImage(file, 1400, 360); saveMe({ banner: data }); toast('Portada actualizada'); } catch { toast('No se pudo leer esa imagen'); }
  }
  function bindDropzone(p) {
    const dz = $('#dropzone'); if (!dz) return;
    const add = raw => {
      const url = normalizeUrl(raw);
      if (!url) { toast('Ese enlace no parece válido'); return; }
      if ((p.links || []).includes(url) || Object.values(p.portafolio || {}).includes(url)) { toast('Ese enlace ya está en tu portafolio'); return; }
      p.links = [...(p.links || []), url];
      store.patch(d => { d.links = d.links || {}; d.links[p.id] = p.links; });
      renderProfile(p.id);
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
      renderProfile(p.id);
    }));
  }
  function miniProjectHTML(p, draft = false) {
    const n = projectNiche(p);
    return `<div class="mini-pj" style="--c:${n.color}"><i></i>
      <button type="button" data-${draft ? 'edit' : 'project'}="${p.id}" class="mini-pj__b"><strong>${esc(p.titulo || 'Proyecto sin título')}</strong><small>${esc(sectorName(p.sector))} · ${draft ? `Editado ${fmtDate(p.actualizado || p.creado)}` : estadoName(p.estado)}</small></button>
      <span class="act">${draft ? `<button class="btn btn--light btn--xs" type="button" data-edit="${p.id}">Continuar</button><button class="rm" type="button" data-del-draft="${p.id}" aria-label="Eliminar borrador">${icon('x')}</button>` : ''}</span></div>`;
  }
  function locateProfile(id) {
    const cell = state.profileCell.get(id) || state.projectCell.get(id);
    if (!cell) return;
    closeModal('#pdModal'); closeModal('#viewerModal');
    go('#red');
    if (state.focus && state.focus !== cell.nicho) closeFocus(false);
    setTimeout(() => { centerOn(cell, 1.25); highlight(c => c === cell); setTimeout(clearMatch, 2400); }, 80);
  }

  /* =========================================================
     MI BOARD — espacio propio: post-its, stickers, textos,
     imágenes, enlaces y cosas guardadas de la red.
     UX: manipulación directa (arrastrar) + alternativa de
     teclado (flechas mueven, Suprimir borra).
     ========================================================= */
  const POSTIT = { amarillo: '#FFE48A', rosa: '#FFC9DE', verde: '#C8F0D5', azul: '#CFE0FF' };
  const STICKERS = [['idea', '¡IDEA!', '#F7B500'], ['wow', 'WOW', '#E5383B'], ['top', 'TOP', '#23A55A'], ['ok', 'OK', '#5A81FA'], ['q', '?', '#B62BD4'], ['star', '', '#F7B500'], ['heart', '', '#E5383B'], ['dog', '', '#5A81FA']];
  function stickerSVG(kind, s = 80) {
    const st = STICKERS.find(x => x[0] === kind) || STICKERS[0], [, label, c] = st;
    const sh = 'filter:drop-shadow(0 6px 8px rgba(0,0,0,.18))';
    if (kind === 'star') return `<svg width="${s}" height="${s}" viewBox="0 0 100 100" style="${sh};width:${s}px;height:${s}px" aria-hidden="true"><path d="M50 4l13 30 32 3-24 21 7 32-28-17-28 17 7-32L5 37l32-3z" fill="#fff"/><path d="M50 14l10 23 25 2-19 17 6 25-22-13-22 13 6-25-19-17 25-2z" fill="${c}"/></svg>`;
    if (kind === 'heart') return `<svg width="${s}" height="${s}" viewBox="0 0 100 100" style="${sh};width:${s}px;height:${s}px" aria-hidden="true"><path d="M50 92S6 64 6 34a22 22 0 0 1 44-6 22 22 0 0 1 44 6c0 30-44 58-44 58z" fill="#fff"/><path d="M50 82S14 58 14 35a15 15 0 0 1 36-6 15 15 0 0 1 36 6c0 23-36 47-36 47z" fill="${c}"/></svg>`;
    if (kind === 'dog') return `<span class="stk-dog" style="width:${s}px;height:${s}px">${DOG_SVG}</span>`;
    return `<svg width="${s}" height="${s * 1.1}" viewBox="0 0 100 110" style="${sh};width:${s}px;height:${s * 1.1}px" aria-hidden="true"><polygon points="50,3 96,29 96,81 50,107 4,81 4,29" fill="#fff"/><polygon points="50,10 90,33 90,77 50,100 10,77 10,33" fill="${c}"/><text x="50" y="62" font-family="Poppins, sans-serif" font-size="${label.length > 3 ? 16 : 22}" font-weight="600" fill="#fff" text-anchor="middle">${label}</text></svg>`;
  }
  function boardOf(id) {
    const b = (store.read().boards || {})[id];
    if (b) return b;
    return { nombre: 'Ideas para mi próximo proyecto', items: [
      { id: uid('bi'), type: 'postit', x: 150, y: 60, color: 'amarillo', rot: -3, text: 'Este es tu board. Guarda aquí perfiles, proyectos y productos que te inspiren 💡' },
      { id: uid('bi'), type: 'sticker', x: 380, y: 40, sticker: 'idea', rot: 8 },
      { id: uid('bi'), type: 'postit', x: 470, y: 150, color: 'azul', rot: 2, text: 'Arrastra los elementos para ordenarlos. Doble clic para escribir.' }
    ] };
  }
  function saveBoard(b) { return store.patch(d => { d.boards = d.boards || {}; d.boards[state.me.id] = b; }); }
  let BD = null;            // board en edición
  let bdSel = null;         // id del elemento seleccionado
  function refLabel(ref) {
    const [kind, id] = ref.split(':');
    if (kind === 'perfil') { const p = person(id); return p && { kind, title: p.nombre, sub: `${roleLabel(p)} · ${state.nicheById.get(p.nicho).corto}`, p }; }
    if (kind === 'proyecto') { const p = projectById(id); return p && { kind, title: p.titulo, sub: `${person(p.autor)?.nombre || ''} · ${estadoName(p.estado)}`, pj: p }; }
    if (kind === 'producto') { const r = productById(id); return r && { kind, title: r.prod.titulo, sub: r.owner.nombre, r }; }
    if (kind === 'equipo') { const t = teamById(id); return t && { kind, title: t.nombre, sub: plural(t.miembros.length, 'integrante', 'integrantes') }; }
    return null;
  }
  function itemHTML(it) {
    const base = `class="bi bi--${it.type} ${bdSel === it.id ? 'is-sel' : ''}" data-bi="${it.id}" style="left:${it.x}px;top:${it.y}px;--rot:${it.rot || 0}deg" tabindex="0"`;
    const del = `<button type="button" class="bi__x" data-bi-del="${it.id}" aria-label="Quitar del board">×</button>`;
    if (it.type === 'postit') return `<div ${base} role="note" aria-label="Post-it"><div class="bi__post" style="background:${POSTIT[it.color] || POSTIT.amarillo}"><p class="bi__txt" data-editable>${esc(it.text || '')}</p><small>${fmtDate(it.fecha || new Date().toISOString())}</small></div>${del}</div>`;
    if (it.type === 'text') return `<div ${base} aria-label="Texto"><p class="bi__big" data-editable>${esc(it.text || 'Escribe aquí')}</p>${del}</div>`;
    if (it.type === 'sticker') return `<div ${base} aria-label="Sticker">${stickerSVG(it.sticker, 84)}${del}</div>`;
    if (it.type === 'image') return `<div ${base} aria-label="Imagen"><img class="bi__photo" src="${it.src}" alt="">${del}</div>`;
    if (it.type === 'link') { let host = it.url; try { host = new URL(it.url).hostname.replace(/^www\./, ''); } catch { /* */ } return `<div ${base} aria-label="Enlace"><div class="bi__card"><div class="bi__in"><span class="bi__k">ENLACE · ${esc(host)}</span><a href="${esc(it.url)}" target="_blank" rel="noopener noreferrer"><h4>${esc(it.text || host)}</h4></a></div></div>${del}</div>`; }
    const r = refLabel(it.ref);
    if (!r) return '';
    const color = r.p ? state.nicheById.get(r.p.nicho).color : r.pj ? projectNiche(r.pj).color : r.r ? state.nicheById.get(r.r.owner.nicho).color : '#5A81FA';
    if (r.kind === 'perfil') return `<div ${base} aria-label="Perfil guardado"><div class="bi__card bi__card--pf">${avatarHTML(r.p, 'avatar--hex')}<div><h4>${esc(r.title)}</h4><p>${esc(r.sub)}</p></div><button type="button" class="bi__open" data-open="${r.p.id}" aria-label="Abrir perfil de ${esc(r.title)}">${icon('arrow')}</button></div>${del}</div>`;
    const cov = r.r ? `<div class="bi__cv" style="background:${tint(color, 14)}">${r.r.prod.imagenes?.[0] ? `<img src="${esc(r.r.prod.imagenes[0])}" alt="">` : productArt(r.r.prod.forma, color)}</div>` : `<div class="bi__cv" style="background:${tint(color, 16)}">${hexCover(color, r.title.length, 18)}</div>`;
    const open = r.kind === 'proyecto' ? `data-project="${r.pj.id}"` : r.kind === 'producto' ? `data-product="${it.ref.split(':')[1]}"` : `data-team-view="${it.ref.split(':')[1]}"`;
    return `<div ${base} aria-label="${r.kind} guardado"><div class="bi__card">${cov}<div class="bi__in"><span class="bi__k">${r.kind.toUpperCase()}</span><h4>${esc(r.title)}</h4><p>${esc(r.sub)}</p><button type="button" class="link" ${open}>Abrir</button></div></div>${del}</div>`;
  }
  function renderBoard() {
    if (!state.me) {
      $('#boardInner').innerHTML = `<div class="empty bd-empty">Tu board es un espacio personal para guardar ideas, perfiles y proyectos.<br><br><button class="btn btn--primary btn--sm" type="button" data-need-login>Inicia sesión para usarlo</button></div>`;
      $('#boardTools').innerHTML = ''; $('#boardName').value = 'Mi board'; $('#boardInfo').textContent = ''; return;
    }
    BD = boardOf(state.me.id);
    $('#boardName').value = BD.nombre;
    $('#boardInfo').textContent = `· ${plural(BD.items.length, 'elemento', 'elementos')} · privado`;
    $('#boardTools').innerHTML = [['postit', 'note', 'Post-it'], ['sticker', 'sticker', 'Sticker'], ['text', 'text', 'Texto'], ['red', 'hex', 'De la red'], ['image', 'image', 'Imagen'], ['link', 'link', 'Enlace']].map(([k, i, l]) => `<button type="button" data-tool="${k}" aria-label="Agregar ${l}">${icon(i)}<span>${l}</span></button>`).join('');
    $('#boardInner').innerHTML = BD.items.map(itemHTML).join('');
  }
  function freeSpot() {
    const c = $('#boardCanvas');
    const x = c.scrollLeft + 140 + Math.random() * Math.max(100, c.clientWidth - 420), y = c.scrollTop + 60 + Math.random() * Math.max(80, c.clientHeight - 300);
    return { x: Math.round(x), y: Math.round(y), rot: Math.round((Math.random() * 6 - 3) * 10) / 10 };
  }
  function addItem(it) { BD.items.push({ id: uid('bi'), fecha: new Date().toISOString(), ...freeSpot(), ...it }); bdSel = BD.items[BD.items.length - 1].id; saveBoard(BD); renderBoard(); $(`[data-bi="${bdSel}"]`)?.focus(); }
  function pinToBoard(ref) {
    if (!requireLoginFor('guardar en tu board')) return;
    const b = boardOf(state.me.id);
    if (b.items.some(i => i.ref === ref)) { toast('Ya está en tu board'); return; }
    b.items.push({ id: uid('bi'), type: 'ref', ref, x: 150 + (b.items.length % 5) * 250, y: 260 + Math.floor(b.items.length / 5) * 200, rot: 0, fecha: new Date().toISOString() });
    saveBoard(b);
    toast('Guardado en tu board');
    if (state.page === 'perfil') renderProfile(state.profileId);
  }
  function setupBoard() {
    const canvas = $('#boardCanvas'), inner = $('#boardInner');
    $('#boardName').addEventListener('change', e => { if (!BD) return; BD.nombre = e.target.value.trim() || 'Mi board'; saveBoard(BD); });
    $('#boardTools').addEventListener('click', e => {
      const t = e.target.closest('[data-tool]')?.dataset.tool; if (!t || !BD) return;
      const tray = $('#boardTray');
      if (t === 'postit' || t === 'sticker') {
        const open = tray.hidden || tray.dataset.kind !== t;
        tray.hidden = !open; tray.dataset.kind = t;
        tray.innerHTML = t === 'postit' ? `<b>Post-it</b>${Object.entries(POSTIT).map(([k, c]) => `<button type="button" data-add-post="${k}" style="--pc:${c}" aria-label="Post-it ${k}"></button>`).join('')}` : `<b>Stickers</b>${STICKERS.map(([k]) => `<button type="button" data-add-stk="${k}" aria-label="Sticker ${k}">${stickerSVG(k, 34)}</button>`).join('')}`;
        return;
      }
      tray.hidden = true;
      if (t === 'text') return addItem({ type: 'text', text: 'Escribe aquí' });
      if (t === 'image') { const f = $('#fileInput'); f.onchange = async () => { try { addItem({ type: 'image', src: await resizeImage(f.files[0], 520, 380) }); } catch { toast('No se pudo leer esa imagen'); } f.value = ''; }; f.click(); return; }
      if (t === 'link') return openForm({ eyebrow: 'Mi board', title: 'Agregar enlace', body: '<div class="field"><label for="blU">Enlace</label><input id="blU" type="url" placeholder="https://…"></div><div class="field"><label for="blT">Título <span class="muted">(opcional)</span></label><input id="blT" maxlength="60"></div>', submit: 'Agregar', onSubmit: () => { const url = normalizeUrl($('#blU').value); if (!url) { toast('Ese enlace no parece válido'); return false; } addItem({ type: 'link', url, text: $('#blT').value.trim() }); return true; } });
      if (t === 'red') {
        const pool = [...state.perfiles.filter(p => !isMe(p)).map(p => [`perfil:${p.id}`, p.nombre, 'Perfil']), ...published().map(p => [`proyecto:${p.id}`, p.titulo, 'Proyecto']), ...state.perfiles.flatMap(p => (p.productos || []).map(x => [`producto:${x.id}`, x.titulo, `Producto · ${p.nombre}`])), ...publicTeams().map(t => [`equipo:${t.id}`, t.nombre, 'Equipo'])];
        return openForm({ eyebrow: 'Mi board', title: 'Traer algo de la red', submit: 'Listo', body: `<div class="field"><label for="brQ">Buscar</label><input id="brQ" type="search" placeholder="Persona, proyecto, producto o equipo"></div><div class="pick-list" id="brList"></div>`,
          onMount: () => { const draw = q => { const qn = norm(q); $('#brList').innerHTML = pool.filter(x => !qn || norm(x[1] + ' ' + x[2]).includes(qn)).slice(0, 30).map(([ref, t, k]) => { const has = BD.items.some(i => i.ref === ref); return `<button type="button" data-pick="${ref}" ${has ? 'disabled' : ''}><strong>${esc(t)}</strong><small>${esc(k)}${has ? ' · ya está' : ''}</small><span>${has ? '' : '+'}</span></button>`; }).join(''); }; draw(''); $('#brQ').addEventListener('input', e => draw(e.target.value)); $('#brList').addEventListener('click', e => { const b = e.target.closest('[data-pick]'); if (b) { addItem({ type: 'ref', ref: b.dataset.pick }); b.disabled = true; b.querySelector('span').textContent = '✓'; } }); },
          onSubmit: () => true });
      }
    });
    $('#boardTray').addEventListener('click', e => {
      const p = e.target.closest('[data-add-post]'), s = e.target.closest('[data-add-stk]');
      if (p) addItem({ type: 'postit', color: p.dataset.addPost, text: 'Nueva idea' });
      if (s) addItem({ type: 'sticker', sticker: s.dataset.addStk });
    });
    // Arrastrar elementos
    let drag = null;
    inner.addEventListener('pointerdown', e => {
      const el = e.target.closest('[data-bi]'); if (!el || e.target.closest('button, a, [contenteditable="true"]')) return;
      const it = BD.items.find(i => i.id === el.dataset.bi); if (!it) return;
      bdSel = it.id; $$('.bi.is-sel', inner).forEach(x => x.classList.remove('is-sel')); el.classList.add('is-sel');
      drag = { el, it, sx: e.clientX, sy: e.clientY, ox: it.x, oy: it.y, moved: false };
      el.setPointerCapture(e.pointerId);
    });
    inner.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return;
      drag.moved = true; drag.el.classList.add('is-drag');
      drag.it.x = Math.max(0, Math.round(drag.ox + dx)); drag.it.y = Math.max(0, Math.round(drag.oy + dy));
      drag.el.style.left = drag.it.x + 'px'; drag.el.style.top = drag.it.y + 'px';
    });
    const end = () => { if (!drag) return; drag.el.classList.remove('is-drag'); if (drag.moved) { BD.items = [...BD.items.filter(i => i !== drag.it), drag.it]; saveBoard(BD); } drag = null; };
    inner.addEventListener('pointerup', end); inner.addEventListener('pointercancel', end);
    // Editar textos con doble clic (o Enter con teclado)
    const editEl = el => { const p = $('[data-editable]', el); if (!p) return; p.contentEditable = 'true'; p.focus(); document.getSelection().selectAllChildren(p); };
    inner.addEventListener('dblclick', e => { const el = e.target.closest('[data-bi]'); if (el) editEl(el); });
    inner.addEventListener('focusout', e => {
      const p = e.target.closest('[data-editable]'); if (!p || p.contentEditable !== 'true') return;
      p.contentEditable = 'false';
      const it = BD.items.find(i => i.id === p.closest('[data-bi]').dataset.bi); if (it) { it.text = p.textContent.trim().slice(0, 400); saveBoard(BD); }
    });
    inner.addEventListener('click', e => { const d = e.target.closest('[data-bi-del]'); if (d) { BD.items = BD.items.filter(i => i.id !== d.dataset.biDel); saveBoard(BD); renderBoard(); toast('Quitado del board'); } });
    canvas.addEventListener('keydown', e => {
      if (e.target.closest('[contenteditable="true"]')) { if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) { e.preventDefault(); e.target.blur(); } return; }
      const el = e.target.closest('[data-bi]'); if (!el || !BD) return;
      const it = BD.items.find(i => i.id === el.dataset.bi); if (!it) return;
      const mv = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[e.key];
      if (mv) { e.preventDefault(); it.x = Math.max(0, it.x + mv[0]); it.y = Math.max(0, it.y + mv[1]); el.style.left = it.x + 'px'; el.style.top = it.y + 'px'; saveBoard(BD); }
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); BD.items = BD.items.filter(i => i !== it); saveBoard(BD); renderBoard(); canvas.focus(); }
      if (e.key === 'Enter') { e.preventDefault(); editEl(el); }
    });
  }

  /* =========================================================
     CABITO · AYUDA — conoce la red, pregúntale y comentarios
     UX: tres pestañas = tres intenciones distintas (aprender,
     resolver una duda, opinar). Las respuestas incluyen un botón
     que lleva directo a la acción.
     ========================================================= */
  const FAQ = [
    { k: ['que es', 'nexotadeo', 'para que sirve', 'de que va', 'red'], q: '¿Qué es NexoTadeo?', a: 'Es la red de Diseño Industrial de la Utadeo: conecta a estudiantes y egresados según su campo, sus áreas y lo que saben hacer, para que formen equipos y creen proyectos juntos.', go: ['#red', 'Ver la red'] },
    { k: ['equipo', 'armar', 'formar', 'crear un equipo', 'invitar'], q: '¿Cómo armo un equipo?', a: 'Pulsa <b>Crear un equipo</b> arriba. Filtra por habilidades, rubro o lo que han hecho, revisa los perfiles y arrastra al board a quienes te sirvan. Te muestro qué tienen en común y, al pulsar <b>Formar equipo</b>, cada persona recibe tu invitación.', go: ['#equipos', 'Ir a Crear un equipo'] },
    { k: ['crear proyecto', 'publicar', 'nuevo proyecto', 'brief', 'apoyo'], q: '¿Cómo publico un proyecto?', a: 'Pulsa <b>Crear un proyecto</b>: describe tu idea y Cabito te sugiere equipo, apoyos de la universidad y arma el brief en PDF. Al publicarlo, entra como hexágono al panal de su nicho y la red se expande.', act: 'project' },
    { k: ['unirme', 'postular', 'convocatoria', 'abierto', 'talento', 'sumarme'], q: '¿Cómo me uno a un proyecto?', a: 'En <b>Proyectos</b> pulsa <b>Unirme a un proyecto</b>. Verás los que buscan nuevo talento, el rol que necesitan y cuándo cierran. Pulsa <b>Postularme</b> y su creador recibe tu postulación.', go: ['#abiertos', 'Ver proyectos abiertos'] },
    { k: ['board', 'guardar', 'post', 'sticker', 'inspiracion'], q: '¿Qué es mi board?', a: 'Es tu espacio propio: guarda perfiles, proyectos y productos de la red y súmales post-its, stickers, textos, imágenes y enlaces. Solo tú lo ves.', go: ['#board', 'Abrir mi board'] },
    { k: ['avatar', 'foto', 'imagen', 'cambiar foto', 'color'], q: '¿Cómo cambio mi avatar o mi foto?', a: 'Entra a tu perfil y pulsa el lápiz sobre tu imagen. Puedes elegir un personaje y el color de su hexágono, o subir tu foto.', me: 'Ir a mi perfil' },
    { k: ['perfil', 'marca personal', 'producto', 'portafolio', 'behance'], q: '¿Cómo hago crecer mi marca personal?', a: 'Tu perfil funciona como portafolio: agrega <b>productos</b> con fotos, publica tus <b>proyectos</b> mencionando a tu equipo, suma enlaces de Behance o Instagram y tu trayectoria.', me: 'Ir a mi perfil' },
    { k: ['equipos publicos', 'publico', 'pestaña', 'ver equipos'], q: '¿Dónde veo los equipos públicos?', a: 'En la red, abre la pestaña <b>Equipos públicos</b> del costado derecho, o entra a <b>Equipos → Equipos públicos</b>. Si un equipo busca talento, pulsa <b>Pedir unirme</b>.', go: ['#equipos-publicos', 'Ver equipos públicos'] },
    { k: ['notificacion', 'invitacion', 'campana', 'aviso'], q: '¿Dónde veo mis invitaciones?', a: 'En la campana de la barra superior. Ahí puedes aceptar invitaciones a equipos y ver quién se postuló a tus proyectos.' },
    { k: ['nicho', 'area', 'hexagono', 'panal', 'colores', 'campo'], q: '¿Qué significan los hexágonos?', a: 'Cada color es un nicho (campo de diseño). El hexágono de color es el nicho, los suaves son sus áreas, los blancos con foto o avatar son personas, los de borde de color son proyectos publicados y el <b>+</b> sirve para agregar algo nuevo.', go: ['#red', 'Ver la red'] },
    { k: ['buscar', 'encontrar', 'persona', 'habilidad', 'quien sabe'], q: '¿Cómo busco a alguien?', a: 'Usa el buscador de la barra superior: escribe un nombre, una habilidad o un área. En la red se resaltan las coincidencias.' },
    { k: ['privacidad', 'quien ve', 'datos', 'correo'], q: '¿Quién ve mi información?', a: 'Tu perfil, tus productos y proyectos publicados los ve la red. Tu board y tus borradores son privados. Este prototipo guarda todo en tu navegador.' },
    { k: ['contraseña', 'clave', 'olvide', 'acceso'], q: 'Olvidé mi contraseña', a: 'Por ahora el prototipo no envía correos de recuperación. Escribe a los desarrolladores desde la pestaña <b>Comentarios</b> y te ayudamos.', tab: 'comentarios' },
    { k: ['eliminar', 'borrar cuenta', 'darme de baja'], q: '¿Cómo elimino mi perfil?', a: 'En tu perfil, al final del costado, en <b>Cuenta</b> → <b>Eliminar mi perfil</b>. Se borran tu perfil, tus enlaces y los proyectos que lideras.', me: 'Ir a mi perfil' },
    { k: ['egresado', 'graduado', 'beneficio', 'universidad'], q: 'Soy egresado/a, ¿qué gano?', a: 'Mantienes contacto con la carrera, encuentras con quién emprender, te postulas a proyectos y puedes pedir apoyo de la universidad (espacios, acompañamiento y financiación) desde el brief de tus proyectos.' }
  ];
  function toggleHelp(force) {
    const panel = $('#help'), open = force ?? !panel.classList.contains('is-open');
    panel.classList.toggle('is-open', open); panel.setAttribute('aria-hidden', String(!open));
    $('#helpFab').setAttribute('aria-expanded', String(open));
    $('#helpFab').classList.toggle('is-open', open);
    if (open) { toggleCabito(false); if (!$('#helpLog').children.length) helpWelcome(); setTimeout(() => (state.htab === 'pregunta' ? $('#helpInput') : $('[data-htab].is-active'))?.focus(), 200); }
  }
  state.htab = 'pregunta';
  function setHelpTab(t) {
    state.htab = t;
    $$('[data-htab]').forEach(b => { const on = b.dataset.htab === t; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    $$('[data-hpane]').forEach(p => { p.hidden = p.dataset.hpane !== t; });
    if (t === 'conoce') renderHelpKnow();
    if (t === 'comentarios') renderFeedback();
  }
  function helpMsg(html, who = 'bot') { const d = document.createElement('div'); d.className = `msg msg--${who}`; d.innerHTML = html; $('#helpLog').appendChild(d); $('#helpLog').scrollTo({ top: 1e5, behavior: 'smooth' }); return d; }
  function helpWelcome() {
    helpMsg(`<p>¡Hola${state.me ? ', ' + esc(firstName(state.me.nombre)) : ''}! Soy Cabito 🐾 Te ayudo a moverte por la red. ¿Qué quieres hacer?</p>`);
    helpMsg(`<div class="hcards">${[['#red', 'hex', 'Explorar la red', 'Nichos, personas y proyectos'], ['#equipos', 'team', 'Crear un equipo', 'Busca por habilidades'], ['#abiertos', 'folder', 'Unirme a un proyecto', 'Los que buscan talento'], ['#board', 'board', 'Mi board', 'Guarda ideas y stickers']].map(([h, i, t, s]) => `<a href="${h}" data-hgo>${icon(i)}<b>${t}</b><small>${s}</small></a>`).join('')}</div><div class="suggest">${FAQ.slice(1, 5).map(f => `<button type="button" data-faq="${FAQ.indexOf(f)}">${esc(f.q)}</button>`).join('')}</div>`, 'bot msg--wide');
  }
  function answer(text) {
    const tn = norm(text);
    const scored = FAQ.map(f => ({ f, s: f.k.reduce((a, k) => a + (tn.includes(norm(k)) ? k.length : 0), 0) })).sort((a, b) => b.s - a.s);
    const best = scored[0];
    if (!best.s) return helpMsg(`<p>No estoy seguro de haber entendido. Prueba con alguna de estas preguntas o escríbeles a los desarrolladores en <button type="button" class="link" data-htab-go="comentarios">Comentarios</button>.</p><div class="suggest">${FAQ.slice(0, 6).map((f, i) => `<button type="button" data-faq="${i}">${esc(f.q)}</button>`).join('')}</div>`);
    const f = best.f;
    const btn = f.go ? `<a class="btn btn--primary btn--sm" href="${f.go[0]}" data-hgo>${esc(f.go[1])} →</a>` : f.act === 'project' ? '<button class="btn btn--primary btn--sm" type="button" data-hproject>Crear un proyecto →</button>' : f.me ? `<button class="btn btn--primary btn--sm" type="button" data-hme>${esc(f.me)} →</button>` : f.tab ? `<button class="btn btn--primary btn--sm" type="button" data-htab-go="${f.tab}">Ir a Comentarios →</button>` : '';
    const more = scored.slice(1, 4).filter(x => x.s).map(x => `<button type="button" data-faq="${FAQ.indexOf(x.f)}">${esc(x.f.q)}</button>`).join('');
    helpMsg(`<p>${f.a}</p>${btn ? `<div class="rec-actions">${btn}</div>` : ''}${more ? `<div class="suggest">${more}</div>` : ''}`);
  }
  function ask(text) { text = text.trim(); if (!text) return; helpMsg(esc(text), 'user'); const t = helpMsg('<span class="typing"><i></i><i></i><i></i></span>'); setTimeout(() => { t.remove(); answer(text); }, 550); }
  function renderHelpKnow() {
    $('[data-hpane="conoce"]').innerHTML = `<div class="know">
      <p class="know__lead">NexoTadeo es la <b>red de gestión de conocimiento</b> de Diseño Industrial de la Utadeo.</p>
      <ol class="know__steps">
        <li><b>Unión</b><span>Personas, saberes y experiencias se encuentran en el panal.</span></li>
        <li><b>Conexión</b><span>Las afinidades entre perfiles abren oportunidades de colaborar.</span></li>
        <li><b>Expansión</b><span>Cada proyecto publicado hace crecer la red y tu marca personal.</span></li>
      </ol>
      <h4>Lo que puedes hacer</h4>
      <div class="know__grid">${[['#red', 'hex', 'Explorar la red', 'Toca un nicho para ver sus áreas y su gente.'], ['#equipos', 'team', 'Crear un equipo', 'Junta perfiles y mira qué tienen en común.'], ['#abiertos', 'folder', 'Unirme a un proyecto', 'Postúlate a los que buscan talento.'], ['#board', 'board', 'Mi board', 'Tu espacio para guardar inspiración.']].map(([h, i, t, s]) => `<a href="${h}" data-hgo>${icon(i)}<b>${t}</b><small>${s}</small></a>`).join('')}</div>
      <h4>Cómo leer el panal</h4>
      <ul class="know__legend"><li><i style="background:var(--primary)"></i>Nicho (campo de diseño)</li><li><i style="background:#E8EEFF"></i>Área del nicho</li><li><i class="o"></i>Persona (foto o avatar)</li><li><i class="p"></i>Proyecto publicado</li><li><i class="a">+</i>Agregar algo nuevo</li></ul>
    </div>`;
  }
  const fb = { tipo: 'idea', animo: 4, img: '' };
  function renderFeedback(sent = false) {
    const pane = $('[data-hpane="comentarios"]');
    if (sent) { pane.innerHTML = `<div class="fb-ok"><span class="fb-ok__ico">${icon('check')}</span><h3>¡Gracias por tu comentario!</h3><p>Lo recibimos y nos ayuda a mejorar NexoTadeo.</p><button class="btn btn--outline btn--sm" type="button" data-fb-new>Enviar otro comentario</button></div>`; return; }
    pane.innerHTML = `<form class="fb" id="fbForm" novalidate>
      <p class="fb__intro">Tus comentarios llegan al equipo que desarrolla NexoTadeo. 💙</p>
      <fieldset><legend>¿Qué nos quieres contar?</legend><div class="fb__types">${[['error', '🐞', 'Un error'], ['idea', '💡', 'Una idea'], ['gusta', '💙', 'Me gusta'], ['otro', '💬', 'Otro']].map(([k, e, l]) => `<label><input type="radio" name="fbTipo" value="${k}" ${fb.tipo === k ? 'checked' : ''}><span><b aria-hidden="true">${e}</b>${l}</span></label>`).join('')}</div></fieldset>
      <fieldset><legend>¿Cómo te sientes usando la red?</legend><div class="fb__faces">${['😣', '😕', '😐', '🙂', '😍'].map((e, i) => `<label><input type="radio" name="fbAnimo" value="${i + 1}" ${fb.animo === i + 1 ? 'checked' : ''}><span aria-label="${['Muy mal', 'Mal', 'Normal', 'Bien', 'Muy bien'][i]}">${e}</span></label>`).join('')}</div></fieldset>
      <div class="field"><label for="fbText">Tu comentario</label><textarea id="fbText" rows="4" maxlength="800" placeholder="Cuéntanos qué pasó o qué te gustaría ver"></textarea><p class="field__err"></p></div>
      <label class="fb__att"><input type="file" accept="image/*" id="fbImg" hidden><span class="fb__thumb">${fb.img ? `<img src="${fb.img}" alt="">` : 'captura'}</span><span>${fb.img ? 'Cambiar captura' : '+ Adjuntar captura de pantalla'}</span></label>
      <label class="check"><input type="checkbox" id="fbContact" ${state.me ? 'checked' : 'disabled'}><span>Pueden escribirme ${state.me ? `a <b>${esc(state.me.correo || '')}</b>` : '(inicia sesión para dejar tu correo)'}</span></label>
      <button class="btn btn--primary btn--block" type="submit">Enviar a los desarrolladores</button>
    </form>`;
  }
  function sendFeedback() {
    const text = $('#fbText').value.trim();
    if (text.length < 5) { setErr($('#fbText'), 'Escribe tu comentario (mínimo 5 caracteres)'); $('#fbText').focus(); return; }
    const item = { id: uid('fb'), fecha: new Date().toISOString(), tipo: $('input[name="fbTipo"]:checked')?.value, animo: +($('input[name="fbAnimo"]:checked')?.value || 0), texto: text, captura: fb.img ? 'sí' : 'no', de: state.me && $('#fbContact').checked ? `${state.me.nombre} <${state.me.correo}>` : 'anónimo', pagina: location.hash || '#red' };
    store.patch(d => { d.comentarios = [...(d.comentarios || []), item]; });
    const to = state.meta.correoComentarios;
    if (to) location.href = `mailto:${to}?subject=${encodeURIComponent(`Comentario NexoTadeo (${item.tipo})`)}&body=${encodeURIComponent(`${item.texto}\n\nÁnimo: ${item.animo}/5 · Página: ${item.pagina}\nDe: ${item.de}\nFecha: ${item.fecha}`)}`;
    fb.img = ''; renderFeedback(true);
  }
  function setupHelp() {
    $$('[data-dog]').forEach(el => { el.innerHTML = DOG_SVG; });
    $('#helpFab').addEventListener('click', () => toggleHelp());
    $('#helpClose').addEventListener('click', () => { toggleHelp(false); $('#helpFab').focus(); });
    $$('[data-htab]').forEach(b => b.addEventListener('click', () => setHelpTab(b.dataset.htab)));
    $('#helpForm').addEventListener('submit', e => { e.preventDefault(); ask($('#helpInput').value); $('#helpInput').value = ''; });
    $('#help').addEventListener('click', e => {
      const q = s => e.target.closest(s);
      if (q('[data-faq]')) { const f = FAQ[+q('[data-faq]').dataset.faq]; helpMsg(esc(f.q), 'user'); answer(f.k.join(' ')); return; }
      if (q('[data-hgo]')) { if (innerWidth <= 680) toggleHelp(false); return; }
      if (q('[data-hproject]')) { toggleHelp(false); openProjectAssistant(); return; }
      if (q('[data-hme]')) { if (state.me) { toggleHelp(false); openProfile(state.me.id); } else requireLoginFor('ver tu perfil'); return; }
      if (q('[data-htab-go]')) { setHelpTab(q('[data-htab-go]').dataset.htabGo); return; }
      if (q('[data-fb-new]')) { renderFeedback(); return; }
    });
    $('#help').addEventListener('change', async e => {
      if (e.target.name === 'fbTipo') fb.tipo = e.target.value;
      if (e.target.name === 'fbAnimo') fb.animo = +e.target.value;
      if (e.target.id === 'fbImg' && e.target.files[0]) { try { fb.img = await resizeImage(e.target.files[0], 800, 500); const t = $('#fbText').value; renderFeedback(); $('#fbText').value = t; } catch { toast('No se pudo leer esa imagen'); } }
    });
    $('#help').addEventListener('submit', e => { if (e.target.id === 'fbForm') { e.preventDefault(); sendFeedback(); } });
  }

  /* =========================================================
     RUTAS (hash) — cada vista tiene su dirección y el botón
     «atrás» del navegador funciona como se espera
     ========================================================= */
  const VIEWS = { red: '#viewPanal', proyectos: '#viewProyectos', equipos: '#viewEquipos', board: '#viewBoard', perfil: '#viewPerfil' };
  function go(hash) { if (location.hash === hash) onRoute(); else location.hash = hash; }
  function parseRoute() {
    const h = (location.hash || '#red').slice(1);
    if (h.startsWith('perfil-')) return { page: 'perfil', id: h.slice(7) };
    if (h === 'abiertos') return { page: 'proyectos', abiertos: true };
    if (h === 'equipos-publicos') return { page: 'equipos', tab: 'publicos' };
    if (h === 'mis-equipos') return { page: 'equipos', tab: 'mios' };
    if (VIEWS[h]) return { page: h };
    return { page: 'red' };
  }
  function onRoute() {
    if (!state.me && !state.guest) { state.pendingRoute = location.hash; showAuth('login'); return; }
    if (!$('#auth').hidden || !$('#join').hidden) hideAuth();
    closeAllLayers(true);
    const r = parseRoute();
    const prev = state.page;
    state.page = r.page;
    Object.entries(VIEWS).forEach(([k, sel]) => { $(sel).hidden = k !== r.page; });
    $$('[data-nav]').forEach(a => { const on = a.dataset.nav === r.page; a.classList.toggle('is-active', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $('#teamBtn').classList.toggle('is-active', r.page === 'equipos');
    if (r.page === 'red') requestAnimationFrame(() => { if (prev !== 'red' || !state.fitted) { state.focus ? fitTo(focusCells(state.focus), false, 1.5) : fitAll(false); state.fitted = true; } });
    if (r.page === 'proyectos') { state.filter.abiertos = !!r.abiertos; renderProjects(); $('#viewProyectos').scrollTop = 0; }
    if (r.page === 'equipos') { state.eqTab = r.tab || 'crear'; renderEquipos(); }
    if (r.page === 'board') renderBoard();
    if (r.page === 'perfil') { if (state.profileId !== r.id) state.pfTab = 'productos'; renderProfile(r.id); $('#viewPerfil').scrollTop = 0; }
    const titles = { red: 'Red', proyectos: r.abiertos ? 'Unirme a un proyecto' : 'Proyectos', equipos: 'Equipos', board: 'Mi board', perfil: person(r.id)?.nombre || 'Perfil' };
    document.title = `${titles[r.page]} · NexoTadeo`;
  }
  function closeAllLayers(keepPanels = false) {
    ['#pdModal', '#viewerModal', '#formModal', '#confirmModal'].forEach(id => closeModal(id));
    $$('.pop').forEach(p => { p.hidden = true; });
    $$('[aria-controls="notifPanel"],[aria-controls="meMenu"]').forEach(b => b.setAttribute('aria-expanded', 'false'));
    if ($('#teamsDrawer').classList.contains('is-open')) toggleTeamsDrawer(false);
    hideSearch();
    if (!keepPanels) { toggleHelp(false); toggleCabito(false); }
  }

  /* ---------- Buscador global (barra superior) ---------- */
  function hideSearch() { $('#searchResults').hidden = true; $('#searchInput').setAttribute('aria-expanded', 'false'); }
  function runSearch(q) {
    const qn = norm(q), box = $('#searchResults');
    if (qn.length < 2) { hideSearch(); if (state.page === 'red') clearMatch(); return; }
    const ppl = state.perfiles.filter(p => norm([p.nombre, p.ciudad, ...(p.habilidades || []), ...p.areas.map(a => state.areaById.get(a).nombre), state.nicheById.get(p.nicho).nombre].join(' ')).includes(qn)).slice(0, 6);
    const pjs = published().filter(p => norm([p.titulo, p.descripcion, sectorName(p.sector)].join(' ')).includes(qn)).slice(0, 4);
    const tms = publicTeams().filter(t => norm(t.nombre + ' ' + t.descripcion).includes(qn)).slice(0, 3);
    box.innerHTML = (ppl.length ? `<p class="gs__h">Personas</p>${ppl.map(p => `<a role="option" href="#perfil-${p.id}">${avatarHTML(p)}<span><b>${esc(p.nombre)}</b><small>${esc(roleLabel(p))} · ${esc((p.habilidades || []).slice(0, 2).join(', '))}</small></span></a>`).join('')}` : '')
      + (pjs.length ? `<p class="gs__h">Proyectos</p>${pjs.map(p => `<button type="button" role="option" data-project="${p.id}"><span class="gs__hex" style="--c:${projectNiche(p).color}"></span><span><b>${esc(p.titulo)}</b><small>${esc(sectorName(p.sector))}</small></span></button>`).join('')}` : '')
      + (tms.length ? `<p class="gs__h">Equipos</p>${tms.map(t => `<button type="button" role="option" data-team-view="${t.id}">${icon('team')}<span><b>${esc(t.nombre)}</b><small>${plural(t.miembros.length, 'integrante', 'integrantes')}</small></span></button>`).join('')}` : '')
      || '<p class="gs__none">Sin coincidencias. Prueba con una habilidad, como «Figma» o «Biomateriales».</p>';
    box.hidden = false; $('#searchInput').setAttribute('aria-expanded', 'true');
    if (state.page === 'red') {
      const ids = new Set(ppl.map(p => p.id)), pids = new Set(pjs.map(p => p.id));
      const areaIds = new Set([...state.areaById.values()].filter(a => norm(a.nombre).includes(qn)).map(a => a.id));
      highlight(c => (c.type === 'perfil' && ids.has(c.id)) || (c.type === 'proyecto' && pids.has(c.id)) || (c.type === 'area' && areaIds.has(c.id)));
    }
  }

  /* ---------- Hexágono «+» de cada nicho ---------- */
  function openAddPop(cellEl) {
    const pop = $('#addPop'), nicho = cellEl.dataset.id.replace('add-', ''), n = state.nicheById.get(nicho);
    const r = cellEl.getBoundingClientRect();
    pop.innerHTML = `<p class="pop__h"><i class="dot" style="--c:${n.color}"></i>Agregar a ${esc(n.corto)}</p>
      <button type="button" role="menuitem" data-add-project="${nicho}">${icon('folder')}<span><b>Publicar un proyecto</b><small>Entra como hexágono a este panal</small></span></button>
      <button type="button" role="menuitem" data-add-assist>${icon('plus')}<span><b>Crear un proyecto con Cabito</b><small>Te sugiere equipo y apoyos</small></span></button>
      <a role="menuitem" href="#equipos" data-add-team="${nicho}">${icon('team')}<span><b>Crear un equipo</b><small>Con personas de ${esc(n.corto)}</small></span></a>`;
    pop.hidden = false;
    pop.style.left = `${clamp(r.left + r.width / 2 - 145, 12, innerWidth - 302)}px`;
    pop.style.top = `${clamp(r.bottom + 6, 80, innerHeight - 250)}px`;
    setTimeout(() => $('button', pop).focus(), 30);
  }
  function openProjectAssistant() {
    toggleHelp(false);
    toggleCabito(true);
  }

  /* =========================================================
     EVENTOS GLOBALES
     ========================================================= */
  function setupGlobal() {
    // Acceso
    $('#paneLogin').addEventListener('submit', doLogin);
    $('#tabLogin').addEventListener('click', () => setAuthTab('login'));
    $('#tabJoin').addEventListener('click', () => setAuthTab('join'));
    $('#auth').addEventListener('keydown', e => { if (e.target.matches('[role="tab"]') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { const join = e.target.id === 'tabLogin'; setAuthTab(join ? 'join' : 'login'); $(join ? '#tabJoin' : '#tabLogin').focus(); } });
    $$('[data-join]').forEach(b => b.addEventListener('click', openJoin));
    $('#guestBtn').addEventListener('click', enterAsGuest);
    $('#forgotBtn').addEventListener('click', () => toast('Escríbenos desde Ayuda → Comentarios y te ayudamos a recuperar tu acceso.'));
    $('#loginBtn').addEventListener('click', () => openLogin());
    $('#demoHint').innerHTML = state.meta.claveDemo ? `Prototipo: entra con <b>luisa.hernandez@utadeo.edu.co</b> y la clave <b>${esc(state.meta.claveDemo)}</b>.` : '';
    $$('[data-toggle-pass]').forEach(b => b.addEventListener('click', () => { const i = $('#' + b.dataset.togglePass), show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.textContent = show ? 'Ocultar' : 'Mostrar'; b.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña'); }));

    // Barra superior
    $('#bellBtn').addEventListener('click', e => { e.stopPropagation(); openBell(); });
    $('#meBtn').addEventListener('click', e => { e.stopPropagation(); if (togglePop('#meMenu', $('#meBtn'))) { renderMeMenu(); setTimeout(() => $('#meMenu a').focus(), 20); } });
    $('#createProjectBtn').addEventListener('click', () => { const open = !$('#cabito').classList.contains('is-open'); open ? openProjectAssistant() : toggleCabito(false); });
    $('#mobileCreate').addEventListener('click', openProjectAssistant);
    let st; $('#searchInput').addEventListener('input', e => { clearTimeout(st); st = setTimeout(() => runSearch(e.target.value), 160); });
    $('#searchInput').addEventListener('focus', e => { if (e.target.value.trim().length > 1) runSearch(e.target.value); });
    $('#searchInput').addEventListener('keydown', e => {
      const items = $$('#searchResults [role="option"]');
      if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); items[0].focus(); }
      if (e.key === 'Enter' && state.page === 'red') { const hits = state.cells.filter(c => c.el.classList.contains('is-match')); if (hits.length) { fitTo(hits, true, 1.3); hideSearch(); } }
      if (e.key === 'Escape') { e.target.value = ''; hideSearch(); clearMatch(); }
    });
    $('#searchResults').addEventListener('keydown', e => { const items = $$('#searchResults [role="option"]'), i = items.indexOf(document.activeElement); if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(i + 1, items.length - 1)]?.focus(); } if (e.key === 'ArrowUp') { e.preventDefault(); i <= 0 ? $('#searchInput').focus() : items[i - 1].focus(); } });
    $('#searchResults').addEventListener('click', () => setTimeout(hideSearch, 0));
    document.addEventListener('click', e => {
      if (!e.target.closest('.gsearch')) hideSearch();
      if (!e.target.closest('.pop') && !e.target.closest('#bellBtn, #meBtn') && !e.target.closest('.cell--add')) { $$('.pop').forEach(p => { p.hidden = true; }); $$('[aria-controls="notifPanel"],[aria-controls="meMenu"]').forEach(b => b.setAttribute('aria-expanded', 'false')); }
    });

    // Acciones delegadas (sirven en cualquier vista o ventana)
    document.addEventListener('click', e => {
      const q = s => e.target.closest(s);
      if (q('#help') && !q('[data-open],[data-project]')) return;
      if (q('[data-logout]')) { e.preventDefault(); return logout(); }
      if (q('[data-need-login]')) return requireLoginFor('usar tu board');
      if (q('[data-open]')) { e.preventDefault(); closeModal('#viewerModal'); closeModal('#pdModal'); closeModal('#pmModal'); return openProfile(q('[data-open]').dataset.open); }
      if (q('[data-project]')) { e.preventDefault(); closeModal('#viewerModal'); return openProjectDetail(q('[data-project]').dataset.project); }
      if (q('[data-product]')) { e.preventDefault(); return viewProduct(q('[data-product]').dataset.product); }
      if (q('[data-like]')) return toggleLike(q('[data-like]').dataset.like);
      if (q('[data-pin]')) return pinToBoard(q('[data-pin]').dataset.pin);
      if (q('[data-apply]')) return openApply(q('[data-apply]').dataset.apply);
      if (q('[data-accept]')) { const [pid, uidv] = q('[data-accept]').dataset.accept.split(':'); const p = projectById(pid); if (p) { p.participantes = [...new Set([...p.participantes, uidv])]; p.postulaciones = (p.postulaciones || []).filter(x => x.id !== uidv); saveProject(JSON.parse(JSON.stringify(p))); notify(uidv, { tipo: 'mencion', de: state.me.id, proyecto: p.id, texto: `¡${state.me.nombre} te sumó al proyecto «${p.titulo}»!` }); refreshAll(); openProjectDetail(pid); toast('Sumado al equipo del proyecto'); } return; }
      if (q('[data-team-view]') || q('[data-team-join]') || q('[data-team-ask]')) { if (!q('#viewEquipos')) teamAction(e); return; }
      if (q('[data-team-toggle]')) { const t = teamById(q('[data-team-toggle]').dataset.teamToggle); t.publico = !t.publico; saveTeam(t); viewTeam(t.id); refreshTeamsUI(); return; }
      if (q('[data-team-del]')) { const id = q('[data-team-del]').dataset.teamDel; return confirmBox({ title: '¿Eliminar este equipo?', text: 'El equipo dejará de existir para todos sus integrantes.', onOk: () => { state.equipos = state.equipos.filter(t => t.id !== id); store.patch(d => { d.equipos = (d.equipos || []).filter(t => t.id !== id); }); closeModal('#viewerModal'); refreshTeamsUI(); toast('Equipo eliminado'); } }); }
      if (q('[data-invite]')) { if (!requireLoginFor('armar un equipo')) return; const id = q('[data-invite]').dataset.invite; if (!state.team.ids.includes(id)) state.team.ids.push(id); go('#equipos'); toast('Lo agregamos al board de tu nuevo equipo'); return; }
      if (q('[data-locate]')) return locateProfile(q('[data-locate]').dataset.locate);
      if (q('[data-locate-project]')) return locateProfile(q('[data-locate-project]').dataset.locateProject);
      if (q('[data-new-project]')) { if (requireLoginFor('publicar un proyecto')) openPM(newProject()); return; }
      if (q('[data-edit]')) { const p = projectById(q('[data-edit]').dataset.edit); if (p) openPM(p); return; }
      if (q('[data-pdf]')) { const p = projectById(q('[data-pdf]').dataset.pdf); if (p) downloadPDF(JSON.parse(JSON.stringify(p))); return; }
      if (q('[data-del-project]')) { const id = q('[data-del-project]').dataset.delProject; return confirmBox({ title: '¿Eliminar este proyecto?', text: 'Dejará de aparecer en Proyectos, en la red y en los perfiles del equipo.', onOk: () => { deleteProject(id); closeModal('#pdModal'); refreshAll(); toast('Proyecto eliminado'); } }); }
      if (q('[data-del-draft]')) { const id = q('[data-del-draft]').dataset.delDraft; return confirmBox({ title: '¿Eliminar este borrador?', text: 'El borrador se borrará y no se puede recuperar.', onOk: () => { deleteProject(id); renderProfile(state.me.id); } }); }
      if (q('[data-delete-me]')) return confirmBox({ title: '¿Eliminar tu perfil?', text: 'Se borrarán tu perfil, tus áreas, tus enlaces, tu board y los proyectos que lideras. Esta acción no se puede deshacer.', ok: 'Eliminar mi perfil', onOk: deleteMe });
      if (q('[data-edit-profile]')) return editProfile();
      if (q('[data-edit-avatar]')) return editAvatar();
      if (q('[data-add-product]')) return editProduct();
      if (q('[data-edit-product]')) { closeModal('#viewerModal'); return editProduct(q('[data-edit-product]').dataset.editProduct); }
      if (q('[data-del-product]')) { const id = q('[data-del-product]').dataset.delProduct; return confirmBox({ title: '¿Eliminar este producto?', text: 'Dejará de aparecer en tu perfil.', onOk: () => { closeModal('#viewerModal'); saveMe({ productos: state.me.productos.filter(x => x.id !== id) }); toast('Producto eliminado'); } }); }
      if (q('[data-add-tray]')) return addTrayectoria();
      if (q('[data-change="banner"]')) { const f = $('#fileInput'); f.onchange = () => { if (f.files[0]) changeBanner(f.files[0]); f.value = ''; }; return f.click(); }
      if (q('[data-pftab]')) { state.pfTab = q('[data-pftab]').dataset.pftab; renderProfile(state.profileId); $(`[data-pftab="${state.pfTab}"]`)?.focus(); return; }
      // Notificaciones
      if (q('[data-n-join]')) { const n = notifsOf(state.me.id).find(x => x.id === q('[data-n-join]').dataset.nJoin); if (n) joinTeam(n.equipo, n.id); return; }
      if (q('[data-n-no]')) { const n = notifsOf(state.me.id).find(x => x.id === q('[data-n-no]').dataset.nNo); if (n) { const t = teamById(n.equipo); if (t) { t.invitados = (t.invitados || []).filter(x => x !== state.me.id); saveTeam(t); } updateNotif(n.id, x => { x.resuelta = 'Rechazaste la invitación'; }); renderNotifs(); } return; }
      if (q('[data-n-team]')) return viewTeam(q('[data-n-team]').dataset.nTeam);
      if (q('[data-n-accept]')) { const n = notifsOf(state.me.id).find(x => x.id === q('[data-n-accept]').dataset.nAccept); const t = n && teamById(n.equipo); if (t) { t.miembros = [...new Set([...t.miembros, n.de])]; t.solicitudes = (t.solicitudes || []).filter(x => x !== n.de); saveTeam(t); notify(n.de, { tipo: 'respuesta', de: state.me.id, equipo: t.id, texto: `${state.me.nombre} te aceptó en «${t.nombre}»` }); updateNotif(n.id, x => { x.resuelta = 'Aceptado en el equipo'; }); refreshTeamsUI(); } return; }
      if (q('[data-n-clear]')) { store.patch(d => { ((d.notifs || {})[state.me.id] || []).forEach(n => { n.leida = true; }); }); renderNotifs(); renderBell(); return; }
      // «+» de la red
      if (q('[data-add-project]')) { $('#addPop').hidden = true; if (!requireLoginFor('publicar un proyecto')) return; const n = state.nicheById.get(q('[data-add-project]').dataset.addProject); return openPM(newProject({ areas: [n.areas[0].id] })); }
      if (q('[data-add-assist]')) { $('#addPop').hidden = true; return openProjectAssistant(); }
      if (q('[data-add-team]')) { state.team.nichos = new Set([q('[data-add-team]').dataset.addTeam]); $('#addPop').hidden = true; return; }
    });
    $('#formPanel').addEventListener('submit', e => { e.preventDefault(); if (formCb && formCb() !== false) closeModal('#formModal'); });
    $('#confirmOk').addEventListener('click', () => { const cb = confirmCb; confirmCb = null; closeModal('#confirmModal'); cb && cb(); });
    $$('.modal [data-close]').forEach(b => b.addEventListener('click', () => closeModal('#' + b.closest('.modal').id)));
    document.addEventListener('click', e => { const c = e.target.closest('#formModal [data-close]'); if (c) closeModal('#formModal'); });

    // Red
    $('#legend').addEventListener('click', e => { const b = e.target.closest('[data-nicho]'); if (!b) return; state.focus === b.dataset.nicho ? closeFocus() : focusNiche(b.dataset.nicho); $$('#legend button').forEach(x => x.setAttribute('aria-pressed', x.classList.contains('is-active'))); });
    $('#nicheCard').addEventListener('click', e => {
      if (e.target.closest('[data-back]')) return closeFocus();
      const a = e.target.closest('[data-area]'); if (a) return onAreaClick(a.dataset.area);
      const p = e.target.closest('[data-profile]'); if (p) openProfile(p.dataset.profile);
    });
    $('#teamsTab').addEventListener('click', () => toggleTeamsDrawer());
    $('#drawerScrim').addEventListener('click', () => toggleTeamsDrawer(false));
    $('[data-close-drawer]').addEventListener('click', () => toggleTeamsDrawer(false));
    $('#tdTabs').addEventListener('click', e => { const b = e.target.closest('[data-tdtab]'); if (b) { state.tdTab = b.dataset.tdtab; renderTeamsDrawer(); } });
    $('#teamsDrawer').addEventListener('click', e => { if (teamAction(e)) return; if (e.target.closest('a[href]')) toggleTeamsDrawer(false); });

    // Proyectos
    $('#newProjectBtn').addEventListener('click', () => { if (requireLoginFor('publicar un proyecto')) openPM(newProject()); });
    $('#joinProjectBtn').addEventListener('click', () => go(state.filter.abiertos ? '#proyectos' : '#abiertos'));
    $('#statusFilter').addEventListener('click', e => { const b = e.target.closest('[data-estado]'); if (!b) return; state.filter.estado = b.dataset.estado; renderProjects(); });
    $('#sectorFilter').addEventListener('click', e => { const b = e.target.closest('[data-sector]'); if (!b) return; state.filter.sector = b.dataset.sector; renderProjects(); });
    $('#projectStack').addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-project]')) { e.preventDefault(); openProjectDetail(e.target.dataset.project); } });
    let raf; $('#viewProyectos').addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(stackEffect); }, { passive: true });
    $('#pdBody').addEventListener('click', e => { if (e.target.closest('[data-locate-project]')) closeModal('#pdModal'); });

    window.addEventListener('hashchange', onRoute);
    document.addEventListener('keydown', e => {
      trapFocus(e);
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
      if (e.key === 'Escape') {
        if (!$('#searchResults').hidden) { hideSearch(); return; }
        const pop = $$('.pop').find(p => !p.hidden); if (pop) { pop.hidden = true; return; }
        const m = topModal(); if (m) return closeModal(m);
        if ($('#teamsDrawer').classList.contains('is-open')) return toggleTeamsDrawer(false);
        if ($('#help').classList.contains('is-open')) { toggleHelp(false); return $('#helpFab').focus(); }
        if ($('#cabito').classList.contains('is-open')) return toggleCabito(false);
        if (state.focus) return closeFocus();
        clearMatch();
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey || topModal() || state.page !== 'red' || !$('#auth').hidden) return;
      if (e.key === '+' || e.key === '=') zoomAt(1.25, undefined, undefined, true);
      if (e.key === '-' || e.key === '_') zoomAt(0.8, undefined, undefined, true);
      if (e.key === '0') state.focus ? closeFocus() : fitAll();
      const st2 = 80;
      if (e.key === 'ArrowLeft') { state.view.x += st2; applyView(true); }
      if (e.key === 'ArrowRight') { state.view.x -= st2; applyView(true); }
      if (e.key === 'ArrowUp') { state.view.y += st2; applyView(true); }
      if (e.key === 'ArrowDown') { state.view.y -= st2; applyView(true); }
    });
  }

  /* =========================================================
     INICIO
     ========================================================= */
  async function init() {
    let data;
    try { data = await loadData(); }
    catch (err) {
      document.body.insertAdjacentHTML('afterbegin', '<p class="fatal">No se pudo cargar data.json. Publica el sitio en GitHub Pages o ábrelo con un servidor local.</p>');
      console.error(err); return;
    }
    indexData(data);
    renderLegend(); computeLayout(); renderWorld(); renderStats(); renderNav();
    $('#loader').classList.add('is-hidden');
    setupCamera(); setupTooltip(); bindPM(); setupCabito(); setupTeams(); setupBoard(); setupHelp(); setupGlobal();
    // Sesión «recordarme» desactivada: se cierra al abrir de nuevo el navegador
    try { const s = store.read(); if (state.me && s.remember === false && !sessionStorage.getItem('nexotadeo.alive')) { state.me = null; store.patch(d => { d.meId = null; }); } sessionStorage.setItem('nexotadeo.alive', '1'); } catch { /* */ }
    if (state.me || state.guest) { hideAuth(); onRoute(); } else { state.pendingRoute = location.hash && location.hash !== '#red' ? location.hash : null; showAuth('login'); }
    setTimeout(() => world().classList.remove('intro-anim'), 2200);
  }
  document.addEventListener('DOMContentLoaded', init);
})();
