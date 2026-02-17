# Google Apps Script para Formulario de Contacto

## Instrucciones paso a paso:

### 1. Crear una Google Sheet
- Ve a [Google Sheets](https://sheets.google.com)
- Haz clic en "Crear" → "Hoja de cálculo"
- Nómbrala "Acción Musical - Contactos"
- En la primera fila, agrega estos encabezados:
  - Columna A: `timestamp`
  - Columna B: `nombre`
  - Columna C: `email`
  - Columna D: `celular`
  - Columna E: `nivel`
  - Columna F: `interes`
  - Columna G: `mensaje`

### 2. Crear el Apps Script
- Ve a [Google Apps Script](https://script.google.com)
- Crea un nuevo proyecto
- Borra todo el código que hay allí
- Copia y pega el código de abajo exactamente como está

### 3. Obtener tu Script ID
- En Apps Script, ve a Proyecto → Configuración del proyecto (izquierda)
- Copia el "ID de script"
- Guárdalo en algún lado (lo necesitarás después)

### 4. Desplegar como Web App
- En Apps Script, ve a Implementar → Nueva implementación
- Tipo: **Web app**
- Ejecutar como: **Tu cuenta de Google**
- Quién tiene acceso: **Cualquiera que tenga el enlace**
- Haz clic en "Desplegar"
- Copia la URL que aparece (algo como `https://script.google.com/macros/d/XXXXX/usercache`)

### 5. Actualizar el formulario HTML
- Abre `assets/js/script.js`
- Busca esta línea (está cerca del final):
  ```javascript
  const SCRIPT_URL = 'https://script.google.com/macros/d/YOUR-SCRIPT-ID/usercache';
  ```
- Reemplaza `YOUR-SCRIPT-ID` con el ID que copiaste en el paso 3

---

## CÓDIGO DEL APPS SCRIPT (Cópialo en Apps Script)

```javascript
// ID de la hoja de cálculo (cámbialo por el ID de tu hoja)
const SPREADSHEET_ID = "YOUR-SPREADSHEET-ID";
const SHEET_NAME = "Hoja 1"; // O el nombre de tu hoja

// Email para notificaciones
const NOTIFICATION_EMAIL = "damian.y.more.y.atun@gmail.com";

/**
 * Función principal que recibe los datos del formulario
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    // Extraer datos del formulario
    const timestamp = new Date().toLocaleString("es-AR");
    const nombre = e.parameter.nombre || "";
    const email = e.parameter.email || "";
    const celular = e.parameter.celular || "";
    const nivel = e.parameter.nivel || "";
    const interes = e.parameter.interes || "";
    const mensaje = e.parameter.mensaje || "";

    // Agregar fila a la hoja
    sheet.appendRow([timestamp, nombre, email, celular, nivel, interes, mensaje]);

    // Enviar email de notificación
    enviarNotificacion(nombre, email, celular, nivel, interes, mensaje);

    // Retornar respuesta exitosa
    return ContentService.createTextOutput("success")
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    Logger.log("Error: " + error.toString());
    return ContentService.createTextOutput("error: " + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Enviar email de notificación
 */
function enviarNotificacion(nombre, email, celular, nivel, interes, mensaje) {
  try {
    const subject = `Nueva consulta de ${nombre} - Acción Musical`;
    const body = `
<h2>Nuevo contacto desde el formulario</h2>
<p><strong>Nombre:</strong> ${nombre}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Celular:</strong> ${celular}</p>
<p><strong>Nivel:</strong> ${nivel}</p>
<p><strong>Interés:</strong> ${interes}</p>
<p><strong>Mensaje:</strong></p>
<p>${mensaje.replace(/\n/g, "<br>")}</p>
<hr>
<p>Responde directamente a ${email}</p>
    `;

    MailApp.sendEmail(
      NOTIFICATION_EMAIL,
      subject,
      "",
      { htmlBody: body }
    );
  } catch (error) {
    Logger.log("Error enviando email: " + error.toString());
  }
}

/**
 * Función de prueba (ejecuta en Apps Script para verificar)
 */
function testEmail() {
  enviarNotificacion(
    "Test Usuario",
    "test@example.com",
    "11 5555 5555",
    "inicial",
    "curso",
    "Este es un mensaje de prueba"
  );
  Logger.log("Email de prueba enviado");
}
```

---

## Pasos finales:

1. **En tu Google Sheet**, ve a Archivo → Información de la hoja → copia el ID de la URL
   - URL: `https://docs.google.com/spreadsheets/d/**XXXXX**/`
   - El ID es la parte en negrita

2. **En Apps Script**, en la variable `SPREADSHEET_ID` al inicio, cambia:
   ```javascript
   const SPREADSHEET_ID = "YOUR-SPREADSHEET-ID";
   ```
   por tu ID real

3. **Si quieres cambiar el email de notificación**, modifica:
   ```javascript
   const NOTIFICATION_EMAIL = "damian.y.more.y.atun@gmail.com";
   ```

4. **En `assets/js/script.js`**, cambia:
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/macros/d/YOUR-SCRIPT-ID/usercache';
   ```
   por tu URL real de despliegue

---

## Listo! 
El formulario ahora enviará datos a Google Sheets y te notificará por email cada vez que alguien se contacte.
