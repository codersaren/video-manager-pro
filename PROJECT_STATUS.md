# Estado del Proyecto — Video Manager

> Última actualización: 6 de junio de 2026

---

## ¿Qué hace actualmente la aplicación?

- Muestra un **calendario semanal** con los videos organizados por día de entrega
- Muestra una sección **"HOY"** al abrir la app con los videos del día actual
- Muestra **4 estadísticas rápidas**: videos de hoy, videos de la semana, en progreso, e importe por cobrar
- Permite **crear proyectos** haciendo clic en el botón "+" de cada día del calendario
- Permite **editar proyectos** haciendo clic sobre una tarjeta (panel deslizante desde la derecha)
- Permite **eliminar proyectos** desde el panel de edición (con confirmación)
- Permite **mover proyectos entre días** arrastrando y soltando las tarjetas
- Muestra los proyectos con **colores por estado**: Pendiente (amarillo), Editando (azul), Revisión (morado), Entregado (verde), Pagado (gris)
- Permite cambiar a una **vista de tabla** con todos los proyectos y ordenación por columnas
- Permite **navegar entre semanas** con flechas o volver a la semana actual
- Permite **importar proyectos desde CSV** (exportado desde Google Sheets o Excel)
- **Guarda todo automáticamente** en el navegador sin necesidad de internet ni servidor

---

## Qué está terminado ✅

- [x] Estructura base del proyecto (Next.js, TypeScript, Tailwind)
- [x] Calendario semanal como vista principal
- [x] Sección "HOY" destacada con los videos del día
- [x] Dashboard con 4 estadísticas rápidas
- [x] Tarjetas con colores por estado
- [x] Crear proyectos (modal al hacer clic en "+")
- [x] Editar proyectos (panel lateral deslizante)
- [x] Eliminar proyectos con confirmación
- [x] Drag & drop entre días del calendario
- [x] Vista de tabla con ordenación por columnas
- [x] Sincronización tabla ↔ calendario (mismos datos)
- [x] Navegación entre semanas (anterior / siguiente / hoy)
- [x] Importar proyectos desde CSV
- [x] Almacenamiento en localStorage (sin backend)
- [x] Diseño oscuro por defecto
- [x] Enlace externo al material del cliente (abre en nueva pestaña)

---

## Qué falta por implementar ⬜

- [ ] **Exportar a CSV** — poder descargar todos los proyectos en formato CSV
- [ ] **Filtros en la tabla** — filtrar por estado, cliente o rango de fechas
- [ ] **Notificaciones** — aviso si hay un proyecto con entrega hoy o mañana
- [ ] **Historial de cambios** — ver cuándo se modificó cada proyecto
- [ ] **Vista mensual** — ver el mes completo además de la semana
- [ ] **Drag & drop en tabla** — reorganizar desde la tabla también
- [ ] **Búsqueda rápida** — buscar proyectos por nombre o cliente
- [ ] **Etiquetas/tags** — agrupar proyectos por tipo (Reel, Vlog, etc.)

---

## Errores detectados 🐛

- [ ] (Ninguno detectado en este momento — reportar si encuentras alguno)

---

## Ideas futuras 💡

- [ ] Modo "Focus": ocultar todo excepto los proyectos de hoy
- [ ] Resumen semanal por email o notificación del sistema
- [ ] Plantillas de proyectos (tipos de video predefinidos)
- [ ] Registro de pagos con fecha de cobro
- [ ] Integración con Google Drive para abrir material directamente
- [ ] Modo offline completo (PWA instalable en el escritorio)
- [ ] Estadísticas mensuales: cuántos videos, cuánto cobrado

---

## Próximos pasos recomendados ✨

- [ ] **1. Usar la app durante una semana** — comprobar que el flujo de trabajo funciona bien en el día a día
- [ ] **2. Añadir exportación CSV** — para tener copia de seguridad de los proyectos
- [ ] **3. Añadir filtros en la tabla** — útil cuando haya muchos proyectos acumulados
- [ ] **4. Notificaciones de entregas** — aviso automático al abrir la app si hay entregas ese día

---

## Formato CSV para importar

Si quieres importar proyectos desde Google Sheets o Excel, la primera fila debe ser:

```
nombre,cliente,fechaEntrega,estado,precio,material,notas
```

Ejemplo de fila:
```
Reel Tomás,Tomás García,2026-06-10,pendiente,150,https://drive.google.com/xxx,Instrucciones del cliente
```

Estados válidos: `pendiente` · `editando` · `revision` · `entregado` · `pagado`

La fecha debe estar en formato: `AAAA-MM-DD` (ejemplo: `2026-06-15`)
