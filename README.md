# LogiCore - Portal de Trabajadores Logísticos

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=Leaflet&logoColor=white)
![Chart.js](https://img.shields.io/badge/chart.js-F5788D.svg?style=for-the-badge&logo=chart.js&logoColor=white)

**LogiCore** es una aplicación web moderna diseñada como demostración de un portal logístico. Desarrollada por **vamp9**, simula un entorno seguro donde los trabajadores (conductores, operarios, coordinadores) pueden registrarse, seleccionar su base de operaciones en un mapa interactivo y acceder a un panel de control con métricas en tiempo real.

**Demo:** [Inserta tu link de Netlify aquí]

---

## 🌟 Características Principales

*   🗺️ **Mapa Interactivo (Leaflet):** Selección visual de los centros de distribución y trazado de rutas de entrega en vivo.
*   🆔 **Validación Estricta:** Implementación del algoritmo Módulo 11 para la validación automática del RUT chileno.
*   🔒 **Seguridad de Contraseñas:** Medidor dinámico de fuerza de contraseña en tiempo real.
*   📊 **Dashboard de Métricas:** Gráficos estadísticos semanales (Chart.js), seguimiento de eficiencia, estado de entregas y un manifiesto logístico detallado.
*   ⚡ **Single Page Application (SPA):** Navegación fluida y rápida gracias a React Router.
*   🎨 **Diseño Moderno:** Interfaz limpia, responsiva y orientada a la usabilidad.

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** React 18, React Router DOM
*   **Herramientas de Construcción:** Vite
*   **Estilos:** Vanilla CSS (Diseño a medida "LogiCore")
*   **Mapas y Gráficos:** React Leaflet, React Chart.js 2
*   **Alertas:** SweetAlert2

## 🚀 Instalación y Uso Local

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/lordvamp9/Logistics-Worker-CL.git
    cd Logistics-Worker-CL
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

4.  **Generar el build de producción:**
    *(Si deseas hacer el despliegue manual)*
    ```bash
    npm run build
    ```
    Esto creará una carpeta `dist/` lista para ser subida a Netlify, Vercel o tu hosting preferido.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---
*Desarrollado con pasión por [vamp9](https://github.com/lordvamp9).*
