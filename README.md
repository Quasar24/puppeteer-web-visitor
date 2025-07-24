# Puppeteer Web Visitor

Un automatizador de visitas web que simula comportamiento humano usando Puppeteer con plugin Stealth.

## Descripción

Este proyecto utiliza Puppeteer para simular visitas humanas a una página web específica. Incluye:

- Comportamiento de navegación realista
- Scroll automático
- Tiempos de espera aleatorios
- Plugin Stealth para evitar detección
- Ventanas del navegador visibles en monitor secundario

## Características

- ✅ Simula comportamiento humano real
- ✅ Scroll automático por la página
- ✅ Tiempos de espera aleatorios
- ✅ User-Agent real
- ✅ Plugin Stealth anti-detección
- ✅ Posicionamiento en monitor secundario

## Instalación

```bash
npm install
```

## Uso

```bash
npm start
```

## Configuración

Puedes modificar las siguientes variables en `index.js`:

- `URL`: La URL objetivo a visitar
- `VISITS`: Número total de visitas a realizar
- `MONITOR1_WIDTH`: Ancho del monitor principal
- `MONITOR2_POSITION_X`: Posición X de la ventana en el segundo monitor
- `MONITOR2_POSITION_Y`: Posición Y de la ventana en el segundo monitor

## Dependencias

- **puppeteer**: Biblioteca principal para automatización del navegador
- **puppeteer-extra**: Extensiones adicionales para Puppeteer
- **puppeteer-extra-plugin-stealth**: Plugin para evitar detección como bot
- **axios**: Cliente HTTP (si se requiere en el futuro)

## Nota

Este proyecto está diseñado para fines educativos y de testing. Asegúrate de cumplir con los términos de servicio de los sitios web que visites.
