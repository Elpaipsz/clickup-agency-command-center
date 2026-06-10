# 📊 Agency Command Center — ClickUp Dashboard

Un panel ejecutivo de alto rendimiento diseñado específicamente para la visualización, gestión y control de las tareas y operaciones de la agencia, conectado en tiempo real con la API de ClickUp.

El dashboard está estructurado de manera modular y mobile-friendly, permitiendo filtrar tareas por departamentos clave (Web, Pauta Publicitaria, Diseño y Contenido, Núcleo) y clientes específicos.

---

## ✨ Características Principales

*   **Segmentación por Departamentos**: Filtros visuales para áreas operativas clave.
*   **Gestión de Clientes (Pipeline)**: Agrupamiento automatizado de tareas por cliente, permitiendo ver a detalle el estado de sus proyectos.
*   **Alertas Semáforo (Críticas)**: Detección visual inmediata de tareas vencidas, tareas sin fecha límite asignada y tareas sin responsable directo.
*   **Detalle Ampliado y Modal de Tarea**: Visualización completa de los datos de la tarea con posibilidad de actualizar su estado en tiempo real.
*   **Seguridad Descentralizada (Client-Side Token)**: Los tokens de API se guardan a nivel de cliente (`localStorage`), permitiendo un despliegue seguro y público sin almacenar credenciales en el servidor.
*   **Diseño Premium con Micro-animaciones**: Interfaz limpia basada en Material Design 3 con transiciones suaves y soporte completo para dispositivos móviles.

---

## 🔒 Seguridad de Credenciales (Repositorio Público Seguro)

Este proyecto está diseñado para ser **100% seguro de albergar en repositorios públicos**:
1.  **Sin Credenciales en Servidor**: El dashboard no almacena la API Key de ClickUp en bases de datos o archivos de configuración del servidor.
2.  **Configuración al Vuelo**: La primera vez que abras la aplicación en producción, se te presentará una interfaz para ingresar tu Token Personal de API de ClickUp.
3.  **Almacenamiento Local Seguro**: La API Key se almacena localmente en el navegador (`localStorage`) a través de encriptación básica de cliente, transmitiéndose al servidor temporalmente mediante encabezados HTTP seguros (`x-clickup-token`).
4.  **Exclusión en Git**: `.env.local` está registrado en `.gitignore` para prevenir cualquier fuga accidental de claves durante el desarrollo local.

---

## 🚀 Instalación y Desarrollo Local

Para correr este proyecto en tu computadora local:

### Requisitos Previos
*   [Node.js](https://nodejs.org/) v18.0 o superior instalado.

### Pasos

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Crear el archivo de configuración local (Opcional)**:
    Crea un archivo `.env.local` en la raíz del proyecto si quieres hardcodear un token por defecto para desarrollo local:
    ```env
    CLICKUP_API_TOKEN=tu_token_aqui
    ```

3.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```
    O haz doble clic sobre el script para Windows: [iniciar_dashboard.bat](iniciar_dashboard.bat).

4.  Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🌐 Despliegue en Vercel

Este proyecto está optimizado para desplegarse con un solo clic en **Vercel**:

1.  Sube el código a tu repositorio de GitHub (público o privado).
2.  Importa el repositorio en Vercel.
3.  Haz clic en **Deploy**. ¡No necesitas configurar ninguna variable de entorno!

---

## 🛠️ Tecnologías Utilizadas

*   **Framework**: Next.js 15+ (App Router, Server Actions y API Routes)
*   **Lenguaje**: TypeScript
*   **Estilos**: Tailwind CSS & Material Tokens
*   **Manejador de Estado & Caching**: SWR (Stale-While-Revalidate)
