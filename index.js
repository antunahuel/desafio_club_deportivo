import express from "express";
import { create } from "express-handlebars";
import fs from "node:fs/promises";
import path from "path";

import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

const hbs = create({
    partialsDir: [
        path.resolve(__dirname, "./views/partials/"),
    ],
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "./views"));

app.listen(3000, () => {
    console.log("Server listen port http://localhost:3000");
});

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("home")
})

// funciton
const leerArchivo = (ruta) => {
    return new Promise(async (resolve, reject) => {
        try {
            let rutaArchivo = path.resolve(__dirname, ruta);
            let deportesJson = await fs.readFile(rutaArchivo, "utf-8");
            resolve(JSON.parse(deportesJson));
        } catch (error) {
            reject("Error al intentar leer archivo");
        }
    })
};

const escribirArchivo = (ruta, datos) => {
    return new Promise(async (resolve, reject) => {
        try {
            let rutaArchivo = path.resolve(__dirname, ruta);
            await fs.writeFile(rutaArchivo, JSON.stringify(datos, null, 4), "utf-8");
            resolve("El archivo fue escrito correctamente");
        } catch (error) {
            reject("Error al escribir de archivo");
        }
    })
};



//ENDPOINT CREATE

app.post("/api/deportes", async (req, res) => {
    try {
        let { deporte, precio } = req.body;

        if (!deporte || !precio) {
            return res.status(400).send("Debe ingresar los datos solicitados");
        }

        let nuevoDeporte = { deporte, precio };

        let datos = await leerArchivo("./file/deportes.json");

        let findDeportes = datos.deportes.find(sport => sport.deporte == nuevoDeporte.deporte);

        if (findDeportes) {
            return res.status(400).json({
                error: `El deporte ${findDeportes.deporte} ya existe! no se puede agregar nuevamente `
            });
        }

        datos.deportes.push(nuevoDeporte);

        await escribirArchivo("./file/deportes.json", datos)

        res.status(200).json({
            msg: "Datos registrados correctamente",
            datos: datos.deportes

        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "al procesar datos ingresados"
        })
    }
});

//endpoint read

app.get("/api/deportes", async (req, res) => {
    try {
        res.sendFile(path.resolve(__dirname, "./file/deportes.json"));
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Error al consultar datos"
        })
    }

});

//endpoint delete

app.delete("/api/deportes/:deporte", async (req, res) => {
    try {
        let { deporte } = req.params;
        if (!deporte) {
            return res.status(404).json({
                error:`Debe escoger el deporte a eliminar`
            });
        }

        let datos = await leerArchivo("./file/deportes.json");
        

        let index = datos.deportes.findIndex(sport => sport.deporte == deporte);

        datos.deportes.splice(index,1);
        
        await escribirArchivo("./file/deportes.json", datos)
        
        res.status(200).json({
            msg:`El deporte ${deporte} es eliminado con éxito`
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error:`Error al intentar eliminar ${deporte}`
        })
    }
})

// endpoint update

app.put("/api/deportes", async(req,res)=>{
    try {

        let { deporte, precio } = req.body;

        if (!deporte || !precio){
            return res.status(400).json({
                error: "Debe ingresar nuevo dato a actualizar"
            })
        }

        // 1.- leer documento
        let datos = await leerArchivo("./file/deportes.json");
       
        let buscarDeporte = datos.deportes.find(sport => sport.deporte == deporte);
        console.log(buscarDeporte);

        if(!buscarDeporte){
            return res.status(400).json({
                error: `El deporte: ${deporte} no aparece en registros`
            })
        }
        buscarDeporte.precio = precio;

        await escribirArchivo("./file/deportes.json", datos);

        res.status(200).json({
            msg:"Cambios efectuados con éxito"
        })
    } catch (error) {
        res.status(500).json({
            error:"Error al intentar ingresar el cambio solicitado"
        })
    }
})