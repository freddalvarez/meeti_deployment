import axios from "axios";
import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", () => {
    const formsEliminar = document.querySelectorAll('.eliminar-comentario');

    if (formsEliminar.length > 0) {
        formsEliminar.forEach(form => {
            form.addEventListener("submit", eliminarComentario);
        });
    }
});

function eliminarComentario(e) {
    e.preventDefault();

    Swal.fire({
        title: "Eliminar comentario?",
        text: "Un comentario eliminado no se puede recuperar",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, eliminar!",
        cancelButtonText: "No, cancelar"
    }).then((result) => {
        if (result.value) {

            const comentarioId = this.children[0].value;

            const datos = {
                comentarioId
            }

            axios.post(this.action,datos)
            .then(respuesta => {
                Swal.fire(
                    "Eliminado!",
                    respuesta.data,
                    "success"
                );
                this.parentElement.parentElement.remove();
            }).catch(error => {
                Swal.fire(
                    "Error!",
                    error.response.data,
                    "error"
                );
            });
        }
    });
}