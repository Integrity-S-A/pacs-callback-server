const axios = require("axios");
const express = require("express");

// Copiar el token creado desde el panel de permisos.
const REMOTE_PACS_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2NzM0ZGQzNzRiMTQ0ODJlN2NkNzdlY2IiLCJleHAiOjEwMDAwMDAwMDAwMDB9.vUVHuTkMscjfWKk7lqF1bCC81e9iHIzv0Knp-aXSU_SuyNSpfgOc8z53o_raTsIJcJ8Poi8K_TIgGyuqv7V0sA";

/* Modificar los valores a continuacion SOLO en caso de ser necesario. */

// Se considera que el PACS esta instalado localmente. Si el PACS esta en otro destino, de debe modificar el host y/o puerto.
const REMOTE_PACS_URL = "http://localhost:8080";

// Puerto en modo de escucha del servidor.
const PORT = 4000;

// URL que recibe los datos del stable study.
const LOCAL_STABLE_URL = "/stable";

// Duracion del link generado para visualizar el estudio en segundos.
const LINK_DURATION = 21600;

// URL que genera tokens para terceros.
const REMOTE_TOKEN_URL = REMOTE_PACS_URL + "/api/v1/dicom/token";
// URL del visualizador.
const VIEWER_URL =
  REMOTE_PACS_URL + "/view?mode=session&ids=<IDS>&auth=<TOKEN>";

const app = express();
app.use(express.json());

// Ruta que acepta solicitudes POST.
app.post(LOCAL_STABLE_URL, (req, res) => {
  const datos = req.body;

  if (datos.accessionNo === "ACCESSION_NUMBER") {
    // Si el valor de Accession Number es ACCESSION_NUMBER, considero que recibi
    // un mensaje de prueba desde los botones de configuracion de los disparadores.
    console.log("Prueba recibida:", datos);
  } else {
    axios
      .post(
        REMOTE_TOKEN_URL,
        {
          studyIuids: [datos.studyIuid],
          duration: LINK_DURATION,
          save: false,
          delete: false,
        },
        {
          headers: {
            Authorization: `Bearer ${REMOTE_PACS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((cliRes) => {
        if (cliRes.data.status === "done") {
          const link = VIEWER_URL.replace("<IDS>", datos.studyIuid).replace(
            "<TOKEN>",
            cliRes.data.token
          );

          console.log("Estudio recibido:", {
            ...datos,
            link,
          });
        } else {
        }
      });
  }

  res.json({});
});

// Inicia el servidor.
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}.`);
});
