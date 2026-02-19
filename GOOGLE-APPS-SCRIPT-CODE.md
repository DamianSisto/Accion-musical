# Google Apps Script - Formulario de Contacto

## Reemplaza el código actual en Apps Script con lo siguiente:

## CÓDIGO DEL APPS SCRIPT (Cópialo en Apps Script)

```javascript
const SPREADSHEET_ID = "1sso9mOypR9tRpst366GOCnvB99fMZ8fFP-744zGWoQE";
const SHEET_NAME = "Contactos Acción";
const HISTORY_SHEET_NAME = "Historial"; // Nombre de la nueva hoja

const LOGO_URL = "https://i.postimg.cc/MTqg45n4/4844563.png";

/**
 * Recibe los datos del formulario y los guarda en la hoja principal.
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    const ahora = new Date();
    const nombre = e.parameter.nombre || "";
    const email = e.parameter.email || "";
    const celular = e.parameter.celular || "";
    const nivel = e.parameter.nivel || "";
    const interes = e.parameter.interes || "";
    const mensaje = e.parameter.mensaje || "";

    sheet.appendRow([ahora, nombre, email, celular, nivel, interes, mensaje]);

    enviarNotificacionAlumno(nombre, email, celular, nivel, interes, mensaje);

    return ContentService.createTextOutput("success").setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    Logger.log("Error: " + error.toString());
    return ContentService.createTextOutput("error: " + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Función que debés programar para que corra cada 24hs.
 * Mueve filas de la hoja principal a Historial si pasaron más de 24hs.
 */
function moverAHistorial() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const origen = ss.getSheetByName(SHEET_NAME);
  let historial = ss.getSheetByName(HISTORY_SHEET_NAME);

  if (!historial) {
    historial = ss.insertSheet(HISTORY_SHEET_NAME);
    historial.appendRow(["Timestamp", "Nombre", "Email", "Celular", "Nivel", "Interés", "Mensaje"]);
  }

  const datos = origen.getDataRange().getValues();
  const ahora = new Date().getTime();
  const unDiaEnMs = 24 * 60 * 60 * 1000;

  for (let i = datos.length - 1; i >= 1; i--) {
    const filaFecha = new Date(datos[i][0]).getTime();

    if (ahora - filaFecha > unDiaEnMs) {
      historial.appendRow(datos[i]);
      origen.deleteRow(i + 1);
    }
  }

  const historialLastRow = historial.getLastRow();
  if (historialLastRow > 1) {
    historial.getRange(2, 1, historialLastRow - 1, historial.getLastColumn())
      .sort({ column: 1, ascending: false });
  }
}

/**
 * Envía la notificación al alumno.
 */
function enviarNotificacionAlumno(nombre, email, celular, nivel, interes, mensaje) {
  if (!email) {
    return;
  }

  try {
    const interesLabel = (interes || "").replace(/-/g, " ");
    const uniqueID = Math.random().toString(36).substring(7);
    const subjectAlumno = `¡Hola ${nombre}! Gracias por tu interés en Acción Musical 🎸`;
    const bodyAlumno = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-top: 6px solid #ffcc00;"><div style="padding: 20px; text-align: center; background-color: #1a1a1a;"><img src="${LOGO_URL}" alt="Acción Musical" style="max-width: 200px; display: block; margin: 0 auto;"></div><div style="padding: 30px; line-height: 1.6; color: #333;"><h2 style="color: #1a1a1a;">¡Hola ${nombre}!</h2><p>Recibimos tu consulta sobre <strong>${interesLabel}</strong> y estamos muy contentos de que quieras sumarte.</p><p>En breve, uno de nuestros profes se pondrá en contacto con vos.</p><div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;"><p style="margin: 0; font-style: italic;">"La música no solo se toca, se vive."</p></div><div style="text-align: center; margin-top: 30px;"><a href="https://wa.me/5491123403363" style="background-color: #25d366; color: white; padding: 15px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">Contactar por WhatsApp</a></div></div><div style="padding: 20px; text-align: center; font-size: 11px; color: #999; background-color: #f9f9f9;"><p>© ${new Date().getFullYear()} Acción Musical. Todos los derechos reservados.</p><small style="color: #eee;">Ref: ${uniqueID}</small></div></div>`;

    MailApp.sendEmail(email, subjectAlumno, "", { htmlBody: bodyAlumno });
  } catch (e) {
    Logger.log("Error mail: " + e);
  }
}

function testEmail() {
  enviarNotificacionAlumno(
    "Test Alumno",
    "damian.y.more.y.atun@gmail.com",
    "11 1234 5678",
    "Inicial",
    "comedia-musical",
    "Prueba historial."
  );
}
```

---

**Recuerda programar la función `moverAHistorial()` para que se ejecute cada 24 horas en Apps Script (Triggers).**
