# ThinkTwice with Pausito 🛡️

<img src="./project-logo.png" alt="ThinkTwice Logo" width="250" />

**Porque comprar es fácil, pero arrepentirse es más fácil**

> Una extensión de Chrome con IA que te empodera a tomar mejores decisiones de compra en el momento crítico, combatiendo el diseño manipulativo del e-commerce.

---

## 📊 El Problema

**El 84% de los chilenos ha hecho compras impulsivas que luego lamenta.**

El comercio electrónico utiliza técnicas de manipulación psicológica conocidas como "dark patterns" que explotan nuestros sesgos cognitivos:

- ⏰ **Timers falsos** que crean urgencia artificial
- 🔴 **Escasez fabricada** ("¡Solo quedan 2 unidades!")
- 🚀 **Compras sin fricción** (un click y listo, cero tiempo para reflexionar)
- 🎯 **Notificaciones persistentes** que explotan el FOMO

**Consecuencias:** Endeudamiento, estrés financiero, arrepentimiento y ciclos de consumo poco saludables que impactan a futuras generaciones.

---

## 💡 La Solución

**ThinkTwice** es una extensión de Chrome con inteligencia artificial que:

1. 🔍 **Detecta automáticamente** cuando estás a punto de completar una compra
2. ⏸️ **Te hace pausar** por 30 segundos para reflexionar
3. 🤔 **Analiza tus patrones** de compra con IA para intervenir de forma personalizada
4. ✅ **Te empodera a decidir** - no te prohíbe comprar, te ayuda a decidir conscientemente

### ¿Cómo funciona?

```
1. Navegas normalmente en MercadoLibre, Amazon, Falabella, etc.
   ↓
2. Haces click en "Comprar" o llegas al checkout
   ↓
3. ThinkTwice detecta la página de pago y te presenta un modal
   ↓
4. Pausa de 30 segundos + preguntas de reflexión
   ↓
5. IA analiza tu historial y te da contexto personalizado
   ↓
6. Tú decides: continuar o cancelar la compra
```

---

## 🏗️ Arquitectura Técnica

ThinkTwice está construido con una arquitectura moderna, serverless y altamente escalable:

### 🔌 Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                     CHROME EXTENSION                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  content.js  │  │ background.js│  │   popup.js   │      │
│  │ (Detector)   │  │ (Coordinator)│  │     (UI)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ API Gateway
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    AWS LAMBDA (SERVERLESS)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Node.js 20.x + TypeScript                           │   │
│  │  • Análisis de patrones de compra                    │   │
│  │  • Procesamiento de datos con IA                     │   │
│  │  • API REST para comunicación con extensión          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 📁 Estructura del Proyecto

```
platanus-hack-25-team-11/
├── chrome-extension/           # Extensión de Chrome (Manifest V3)
│   ├── manifest.json          # Configuración de la extensión
│   ├── content.js             # Detector de checkouts en tiempo real
│   ├── background.js          # Service Worker y coordinador
│   ├── popup.html/js          # Interfaz de usuario
│   └── icons/                 # Iconos de la extensión
│
├── think-twice/               # Backend Serverless (AWS Lambda)
│   ├── src/index.ts          # Handler Lambda en TypeScript
│   ├── template.yaml         # Infraestructura como código (SAM)
│   └── samconfig.toml        # Configuración de deployment
│
└── .github/workflows/         # CI/CD con GitHub Actions
    └── deploy.yml            # Pipeline de despliegue automático
```

---

## 🚀 Características Principales

### 🔍 Detección Inteligente de Checkouts

La extensión utiliza 4 heurísticas combinadas para detectar páginas de pago:

1. **Análisis de URL** - Busca patrones como `/checkout`, `/cart`, `/payment`, `/billing`
2. **Campos de Formulario** - Detecta inputs de tarjeta de crédito, CVV, dirección de facturación
3. **Contenido de Texto** - Identifica frases clave como "Completar Compra", "Pagar Ahora"
4. **Selectores HTML** - Encuentra elementos con atributos específicos de pago

**Precisión:** Sistema de scoring con >70% de confianza para activar intervención

### ⚡ Características Técnicas

- ✅ **Manifest V3** - Última versión del estándar de Chrome
- ✅ **Detección en Tiempo Real** - Usando MutationObserver para páginas dinámicas
- ✅ **Serverless Backend** - AWS Lambda con auto-scaling
- ✅ **Type-Safe** - Código TypeScript con strict mode
- ✅ **CI/CD Automático** - Deployment automático con GitHub Actions
- ✅ **CORS Habilitado** - API accesible desde la extensión
- ✅ **Monitoreo** - Logs en AWS CloudWatch

---

## 🛠️ Instalación y Uso

### Requisitos Previos

- Node.js 20.x o superior
- Chrome/Chromium browser
- AWS CLI configurado (para desarrollo del backend)
- AWS SAM CLI instalado

### 1. Instalar la Extensión de Chrome

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/platanus-hack-25-team-11.git
cd platanus-hack-25-team-11/chrome-extension

# Abrir Chrome y navegar a:
chrome://extensions/

# Habilitar "Modo de desarrollador" (esquina superior derecha)
# Click en "Cargar extensión sin empaquetar"
# Seleccionar la carpeta chrome-extension/
```

### 2. Configurar el Backend (Opcional)

```bash
cd think-twice

# Instalar dependencias
npm install

# Desarrollo local
npm run build
npm run local

# Deployar a AWS
sam build
sam deploy --guided
```

### 3. Usar ThinkTwice

1. Navega a cualquier sitio de e-commerce (MercadoLibre, Amazon, Falabella, etc.)
2. Agrega productos al carrito
3. Procede al checkout
4. **ThinkTwice detectará la página automáticamente** y mostrará un modal de pausa
5. Reflexiona durante 30 segundos
6. Decide si realmente necesitas la compra

---

## 🎯 Impacto

### Impacto Individual

- 💰 **Ahorro estimado:** $100.000 CLP/mes por usuario
- 😌 **Reducción de estrés financiero** y arrepentimiento post-compra
- 🧘 **Mejor control de impulsos** y hábitos de consumo saludables

### Impacto Social

- 🛡️ **Combate dark patterns** y manipulación psicológica del e-commerce
- 📚 **Educación financiera pasiva** - aprendes mientras compras
- 🔄 **Rompe ciclos de endeudamiento** que afectan a futuras generaciones

### Métricas de Éxito

- 📊 % de compras canceladas después de la intervención
- 💵 Ahorro acumulado por usuarios activos
- ⭐ Satisfacción y retención de usuarios

---

## 🔮 Visión y Roadmap

### Fase 1: MVP (Actual) ✅

- Extensión Chrome funcional
- Detección automática de checkouts
- Pausa de 30 segundos
- Backend serverless

### Fase 2: IA Personalizada (Próximos 3 meses)

- Modelo de ML para análisis de patrones
- Intervenciones adaptativas según usuario
- Notificaciones vía WhatsApp
- Dashboard de ahorro y métricas

### Fase 3: Expansión (6-12 meses)

- App móvil (iOS + Android)
- Integración con bancos chilenos
- Análisis predictivo de salud financiera
- Expansión a LATAM

### Visión a Largo Plazo

- **Marketplace global** - Chile → LATAM → Global
- **Integración bancaria completa** - Alertas en tiempo real desde tu banco
- **Ecosistema de bienestar financiero** - ThinkTwice como plataforma

---

## 👥 Equipo

**Team 11 - Platanus Hack 2025**

- **Mitchel Jimenez** - [@mitcheljimenez](https://github.com/mitcheljimenez)
- **Luis Leiva** - [@lileiva](https://github.com/lileiva)
- **Andres Gonzalez** - [@AndresGonzalez5](https://github.com/AndresGonzalez5)
- **Verner Codoceo** - [@vacodoceo](https://github.com/vacodoceo)

**Track:** 🛡️ Fintech + Digital Security
**Hackathon:** Platanus Hack 2025
**Fecha de Entrega:** 23 de Noviembre, 9:00 AM (Hora Chile)

---

## 📚 Documentación Adicional

- [Chrome Extension README](./chrome-extension/README.md) - Documentación detallada de la extensión
- [Think-Twice Backend README](./think-twice/README.md) - Documentación del backend serverless
- [Icon Setup Guide](./chrome-extension/SETUP_ICONS.md) - Guía para configurar iconos

---

## 🤝 Contribuir

¿Quieres contribuir a ThinkTwice? ¡Excelente!

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 🙏 Agradecimientos

Gracias a **Platanus** por organizar este hackathon y darnos la oportunidad de construir tecnología que empodera a las personas a tomar mejores decisiones financieras.

**ThinkTwice** - Porque tu dinero merece que pienses dos veces. 💭💰

---

<p align="center">
  <strong>¿Preguntas? ¿Feedback?</strong><br>
  Abre un issue o contáctanos directamente.
</p>

<p align="center">
  Hecho con ❤️ por Team 11 en Chile 🇨🇱
</p>
