// // CARGAR TABLA
let bodyTable = document.getElementById("table");

const cargarTabla = (arrayDeportes = []) => {
    let infoTabla = "";
    for (const d of arrayDeportes) {
        infoTabla += `
            <tr>
                <th scope="row"><input type="text" value="${d.deporte}" disabled></th>
                <td><input type="text" value="${d.precio}" id="precio-${d.deporte}"></td>
                <td>
                    <button class="btn btn-warning fw-bold me-5" onclick="actualizarPrecio('${d.deporte}')">Actualizar Precio</butto>
                    <button class="btn btn-danger fw-bold" onclick="eliminarDeporte('${d.deporte}')">Eliminar deporte</button>
                </td>
            </tr>
        `;
    }
    bodyTable.innerHTML = infoTabla;
};

let form = document.getElementById("formDeportes");
form.addEventListener("submit", async(event)=>{
    try {
        event.preventDefault();

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        let datosForm = new FormData(form);
       
        const raw = JSON.stringify({
            "deporte": datosForm.get("deporte"),
            "precio": datosForm.get("precio")
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        let response = await fetch("/api/deportes", requestOptions);
        let data = await response.json();
        if(response.status == 200){
            form.reset();
            alert(data.msg); 
            location.reload();
        }else{
            alert(data.error);
        }
    } catch (error) {
        console.log(error);
    } 
});

const getDeportes = async ()=>{
    try {
        let response = await fetch("/api/deportes");
        if (response.status == 200){
         
            let data = await response.json();
            cargarTabla(data.deportes);
           
        }else{
            alert(data.msg);
        }
    } catch (error) {
        alert(data.error);
    }
};
getDeportes();

// eliminar deporte

const eliminarDeporte = async(deporte)=>{
    try {
        if (deporte){
            confirm(`Esta seguro en eliminar ${deporte}`);
        }

        let response = await fetch(`/api/deportes/${deporte}`, {
            method:"DELETE"
        });
        let data = await response.json();

        if(response.status == 200){
            location.reload();
            alert(data.msg);
        }
    } catch (error) {
        console.log(error);
    }
}

const actualizarPrecio = async (deporte)=>{
    try {
        let precio = document.querySelector(`#precio-${deporte}`);
        console.log(deporte);

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "deporte": deporte,
            "precio": precio.value
        });

        const requestOptions = {
            method: "PUT",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        let response =  await fetch("/api/deportes", requestOptions);
        let data = await response.json();

        if (response.status == 200){
            alert(data.msg)
            cargarTabla(data.deportes);
            location.reload();
        }else{
            alert(data.error)
        }
        
    } catch (error) {
        console.log(error);
    }   
}