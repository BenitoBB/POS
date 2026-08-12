# Especificación de Requerimientos — Sistema POS para Puesto de Comida

## 0. Resumen ejecutivo

Sistema web de punto de venta (POS) para un puesto de comida, construido con **Next.js**, desplegado en **Vercel**, con **Supabase** (Postgres + Realtime) como backend. El catálogo de productos es creado y editado libremente por el operador (nombre y precio). El flujo operativo gira en torno a **cuentas** tipo "Cuenta 1", "Cuenta 2", "Cuenta 3..." (con botón **+** para agregar más), donde se agregan productos con cantidad mientras se calcula el total en tiempo real. Al saldar o cancelar una cuenta, se guarda en el **historial** (con estado *pagada* o *cancelada*) y el slot queda listo de inmediato para una nueva orden. No hay login ni pasarela de pago (todo es efectivo); varias personas pueden operar el sistema a la vez desde distintos dispositivos con el mismo link de Vercel, por lo que se sincroniza en tiempo real. Incluye reportes básicos de ventas y un panel de apariencia (esquema de color + tipografía) accesible desde un ícono de engranaje.

---

## 1. Requerimientos Funcionales (RF)

### 1.1 Gestión de productos
- **RF01** — Crear un producto nuevo indicando nombre y precio.
- **RF02** — Editar nombre y/o precio de un producto existente.
- **RF03** — Eliminar o desactivar un producto.
- **RF04** — Listar todos los productos disponibles para agregarlos a una cuenta.
- **RF05** — Lista plana, sin categorías por ahora (ver sección 5, "fuera de alcance").

### 1.2 Gestión de cuentas (vista operativa)
- **RF06** — El sistema inicia con 3 cuentas por defecto, etiquetadas "Cuenta 1", "Cuenta 2", "Cuenta 3".
- **RF07** — Botón **+** para agregar una cuenta nueva (ej. "Cuenta 4").
- **RF08** — Permitir eliminar/reducir cuentas existentes.
- **RF09** — El nombre de la cuenta es editable, aunque por defecto se usa "Cuenta N".
- **RF10** — Agregar un producto a una cuenta indicando cantidad.
- **RF11** — Modificar la cantidad o quitar un producto ya agregado a la cuenta.
- **RF12** — Calcular y mostrar el subtotal por producto y el total acumulado en tiempo real.
- **RF13** — **Saldar cuenta**: guarda productos y total en el historial con estado `pagada`; el slot se reinicia de inmediato (vacío, en $0), sin conservar identidad de cliente o turno.
- **RF14** — **Cancelar cuenta**: cierra la cuenta sin cobro; se guarda en el historial con estado `cancelada`; el slot también se reinicia.

### 1.3 Historial y reportes
- **RF15** — Listado histórico de cuentas cerradas (pagadas y canceladas).
- **RF16** — Detalle de cada cuenta cerrada: productos, cantidades, total y fecha/hora.
- **RF17** — Filtro de historial por fecha.
- **RF18** — Reportes básicos (solo sobre cuentas `pagada`, salvo que se indique lo contrario):
  - Producto más vendido y producto menos vendido (por cantidad).
  - Franja horaria más concurrente (mayor número de cuentas registradas).
  - Ganancia total del periodo consultado.

### 1.4 Configuración y apariencia
- **RF19** — Ícono de engranaje accesible desde cualquier vista.
- **RF20** — Selector de esquema de color con paletas predefinidas: modo claro, modo oscuro y modos para daltonismo (protanopia, deuteranopia, tritanopia).
- **RF21** — Controles de tipografía: tamaño y peso de fuente ajustables.
- **RF22** — Las preferencias de apariencia se guardan por dispositivo (localStorage), ya que no hay login que las asocie a una persona.

### 1.5 Persistencia, sincronización y resiliencia
- **RF23** — Conexión a Supabase para productos, cuentas e historial.
- **RF24** — Sincronización en tiempo real entre dispositivos (Supabase Realtime), para que varias personas operen las cuentas simultáneamente desde el mismo link de Vercel.
- **RF25** — Mientras una cuenta está abierta, su estado (productos y cantidades) se guarda también en el localStorage del dispositivo, para poder recuperarla si el dispositivo se apaga antes de sincronizar con Supabase.

---

## 2. Requerimientos No Funcionales (RNF)

| # | Categoría | Descripción |
|---|---|---|
| RNF01 | Usabilidad | Interfaz táctil, botones grandes, mínimo de pasos para agregar un producto. |
| RNF02 | Rendimiento | Actualización de totales y listas prácticamente instantánea. |
| RNF03 | Resiliencia local | Se asume internet disponible en general; localStorage actúa como respaldo del estado en curso de cada dispositivo (no es un modo offline completo). |
| RNF04 | Seguridad | Sin autenticación: acceso directo mediante el link de Vercel, sin distinción de roles. RLS en Supabase configurado para permitir las operaciones esperadas sobre estas tablas. Nota: cualquiera con el link puede editar datos; si esto preocupa más adelante, se podría añadir un código de acceso simple, pero queda fuera del alcance actual. |
| RNF05 | Integridad de datos | Saldar o cancelar una cuenta debe ser una operación atómica (no perder ítems ni duplicar totales). |
| RNF06 | Mantenibilidad | Código tipado (TypeScript), estructura modular por capas (UI / lógica / acceso a datos). |
| RNF07 | Stack abierto | Next.js, Supabase (open source, autohospedable), sin dependencias de pago obligatorias. |
| RNF08 | Concurrencia | Varias personas pueden editar la misma cuenta desde distintos dispositivos; con el volumen esperado (un puesto), basta una estrategia simple tipo "última escritura gana" + refresco vía Realtime. |
| RNF09 | Accesibilidad visual | Paletas con buen contraste, incluidos los modos para daltonismo; tipografía con tamaño/peso ajustable. |
| RNF10 | Compatibilidad | Responsive; uso principal en celular/tablet, funcional también en escritorio. |
| RNF11 | Despliegue | Despliegue continuo en Vercel desde el repositorio Git. |
| RNF12 | Respaldo | Backups automáticos de Supabase; el localStorage es solo un resguardo temporal del estado en curso, no un reemplazo del historial. |

---

## 3. Decisiones confirmadas (resumen)

| Tema | Decisión |
|---|---|
| Identidad de cuentas | "Cuenta 1/2/3…", botón + para agregar, nombre editable |
| Al saldar | Slot se reinicia; el historial guarda productos y total |
| Autenticación | Ninguna, dashboard directo |
| Pagos | Solo efectivo por ahora, sin pasarela |
| Cancelaciones | Permitidas, quedan en historial como `cancelada` |
| Categorías | Lista plana por ahora |
| Multi-dispositivo | Sí, requiere Supabase Realtime |
| Conectividad | Internet disponible; localStorage como respaldo del estado en curso |
| Reportes | Más/menos vendido, franja horaria pico, ganancia total |
| Impuestos | Sin IVA |
| Comprobante | Sin ticket por ahora |
| Apariencia | Paletas claro/oscuro/daltonismo + tipografía ajustable |

---

## 4. Notas de implementación / supuestos

Estas son decisiones menores que tomé para poder dejar el modelo de datos completo; son razonables pero conviene que las revises:

- **Franja horaria pico**: se calcula con base en la hora de apertura de la cuenta (`opened_at`), por representar mejor la afluencia de clientes; la ganancia total usa la hora de cierre (`closed_at`).
- **Modelo de "reinicio" de cuenta**: en vez de reutilizar literalmente la misma fila, cada ciclo de una cuenta (abrir → agregar productos → saldar/cancelar) genera una fila nueva en la tabla `accounts` que hereda el mismo nombre de slot (ej. "Cuenta 2"). Así el historial queda como filas cerradas normales y no se necesita una tabla aparte.
- **Extensibilidad de pagos/categorías**: se dejan columnas opcionales (`category`, `payment_method`) en el modelo para no bloquear el futuro, sin construir UI para ellas todavía.
- **Tabla `settings`**: no es necesaria para este alcance — el número de cuentas activas se deriva de la propia tabla `accounts`, y la apariencia vive en localStorage por dispositivo.

---

## 5. Fuera de alcance (explícito)

- Pasarela de pago / múltiples métodos de pago.
- Cálculo de impuestos (IVA) o cargos por servicio.
- Generación e impresión de tickets/recibos.
- Autenticación, login y roles diferenciados.
- Categorías de producto con interfaz dedicada.

*(Todos estos puntos quedaron con espacio para agregarse después sin rediseñar el sistema desde cero — ver sección 4.)*

---

## 6. Propuesta de stack tecnológico (open source)

- **Next.js** (App Router) + TypeScript
- **Supabase**: Postgres, Realtime (necesario por el uso multi-dispositivo), Row Level Security
- **Tailwind CSS** + **shadcn/ui** — para el panel de apariencia (paletas + tipografía)
- **TanStack Query** para sincronizar el estado del cliente con Supabase
- **Zod** para validar los formularios de productos y cuentas
- **Web Storage API (localStorage)** — respaldo del estado en curso de cada cuenta abierta
- Despliegue en **Vercel** conectado al repositorio Git

---

## 7. Modelo de datos sugerido

**products**
`id, name, price, category (nullable), is_active, created_at, updated_at`

**accounts**
`id, label ("Cuenta 1", "Cuenta 2"...), status (abierta | pagada | cancelada), opened_at, closed_at, total, payment_method (nullable, default 'efectivo')`

**account_items**
`id, account_id, product_id, product_name_snapshot, unit_price_snapshot, quantity, subtotal`

> El snapshot de nombre/precio evita que un cambio posterior en `products` altere el historial ya cerrado.

---

## 8. Flujos principales

1. **Crear/editar producto** → vista de productos → formulario nombre + precio → `products`.
2. **Operar una cuenta** → vista de cuentas → seleccionar slot ("Cuenta 2") → agregar producto + cantidad → se escribe en Supabase y en localStorage del dispositivo → total se recalcula en tiempo real → otros dispositivos ven el cambio vía Realtime.
3. **Saldar cuenta** → confirmar → fila actual pasa a `status = pagada`, se fija `total` y `closed_at` → aparece en historial → el slot ("Cuenta 2") queda disponible para una nueva fila/orden.
4. **Cancelar cuenta** → confirmar → fila actual pasa a `status = cancelada` → aparece en historial → el slot queda disponible igual que al saldar.
5. **Consultar historial/reportes** → vista de historial → filtrar por fecha → ver métricas (producto más/menos vendido, franja pico, ganancia total).
6. **Cambiar apariencia** → ícono de engranaje → elegir paleta (claro/oscuro/daltonismo) y ajustar tipografía → se guarda en localStorage.

---

*Documento pensado como insumo para generación de código (Codex/Antigravity). La sección 4 son los únicos supuestos que quedaron abiertos por mi parte; si alguno no te convence, dímelo y ajusto el documento antes de pasarlo a generación.*
