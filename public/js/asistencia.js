import axios from "axios";

document.addEventListener("DOMContentLoaded", () => {
    const asistencia = document.querySelector("#confirmar-asistencia");
    if (asistencia) {
        asistencia.addEventListener("submit", confirmarAsistencia);
    }
});

function confirmarAsistencia(e) {
    e.preventDefault();

    const btnAsistencia = document.querySelector('#confirmar-asistencia input[type="submit"]');
    const accion = document.querySelector('#accion').value;
    const mensaje = document.querySelector('#mensaje');

    while (mensaje.firstChild) {
        mensaje.removeChild(mensaje.firstChild);
    }

    const datos = {
        accion
    }

    
    axios.post(this.action, datos)
        .then((respuesta) => {
            if (accion === "confirmar") {
                btnAsistencia.classList.remove("btn-azul");
                btnAsistencia.classList.add("btn-rojo");
                btnAsistencia.value = "Cancelar Asistencia";
                document.querySelector('#accion').value = "cancelar";
            } else {
                btnAsistencia.classList.remove("btn-rojo");
                btnAsistencia.classList.add("btn-azul");
                btnAsistencia.value = "Si, asistiré";
                document.querySelector('#accion').value = "confirmar";
            }

            mensaje.appendChild(document.createTextNode(respuesta.data));
        })
}