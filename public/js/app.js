import { OpenStreetMapProvider } from 'leaflet-geosearch';
import asistencia from './asistencia';
import eliminarComenario from './eliminarComentario';



const lat = document.querySelector('#lat').value ||  9.9346917;
const lng = document.querySelector('#lng').value || -84.085769;
const direccion = document.querySelector('#direccion').value || '';
const map = L.map('mapa').setView([lat,lng], 15);
let markers = new L.FeatureGroup().addTo(map);
let marker;
const geocodeService = L.esri.Geocoding.geocodeService();

if(lat && lng) {
    marker = new L.marker([lat,lng], {
        draggable: true,
        autoPan: true
    }).addTo(map)
    .bindPopup(direccion)
    .openPopup();

    markers.addLayer(marker);
    marker.on('moveend', function(e) {
        marker = e.target;
        const position = marker.getLatLng();
        map.panTo(new L.LatLng(position.lat, position.lng))

        geocodeService.reverse().latlng(position, 16).run(function(error, result) {
            marker.bindPopup(result.address.LongLabel);                                
            llenarInputs(result);
        });

    });
}

document.addEventListener('DOMContentLoaded', () => {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
});

const buscador = document.querySelector('#formbuscador');

buscador.addEventListener('input', buscarDireccion);

function buscarDireccion(e) {
    if (e.target.value.length > 8) {

        markers.clearLayers();

        
        const provider = new OpenStreetMapProvider();

        provider.search({ query: e.target.value })
            .then(resultado => {
                geocodeService.reverse()
                    .latlng(resultado[0].bounds[0], 16)
                    .run(function(error, result) {
                        llenarInputs(result);
                        map.setView(resultado[0].bounds[0], 15);
                        marker = new L.marker(resultado[0].bounds[0], {
                            draggable: true,
                            autoPan: true
                        }).addTo(map)
                        .bindPopup(resultado[0].label)
                        .openPopup();

                        markers.addLayer(marker);

                        marker.on('moveend', function(e) {
                            marker = e.target;
                            const position = marker.getLatLng();
                            map.panTo(new L.LatLng(position.lat, position.lng))

                            geocodeService.reverse().latlng(position, 16).run(function(error, result) {
                                marker.bindPopup(result.address.LongLabel);                                
                                llenarInputs(result);
                            });

                        });
                    });
            });
    }
}

function llenarInputs(result) {
    document.querySelector('#direccion').value = result.address.LongLabel || '';
    document.querySelector('#ciudad').value = result.address.City || '';
    document.querySelector('#estado').value = result.address.Region || '';
    document.querySelector('#pais').value = result.address.CntryName || '';
    document.querySelector('#lat').value = result.latlng.lat || '';
    document.querySelector('#lng').value = result.latlng.lng || '';
}