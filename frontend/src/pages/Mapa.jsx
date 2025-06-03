// src/pages/MapaEventos.jsx
import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '80vh',
  marginTop: '60px'
};

const center = {
  lat: -23.5505, // São Paulo (default)
  lng: -46.6333
};

function Mapa() {
  const [eventos, setEventos] = useState([]);
  const [selecionado, setSelecionado] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyB3ReVHeyypA3KX7cdjPhf3P3lpqv6a-78'
  });

  useEffect(() => {
    fetch('http://localhost:3001/api/eventos-externos')
      .then(res => res.json())
      .then(data => setEventos(data))
      .catch(err => console.error('Erro ao carregar eventos:', err));
  }, []);

  if (!isLoaded) return <div>Carregando mapa...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={5}>
      {eventos
        .filter(ev => ev.latitude && ev.longitude)
        .map(evento => (
          <Marker
            key={evento.id}
            position={{
              lat: parseFloat(evento.latitude),
              lng: parseFloat(evento.longitude)
            }}
            onClick={() => setSelecionado(evento)}
          />
        ))}

      {selecionado && (
        <InfoWindow
          position={{
            lat: parseFloat(selecionado.latitude),
            lng: parseFloat(selecionado.longitude)
          }}
          onCloseClick={() => setSelecionado(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '10px',
              borderRadius: '8px',
              maxWidth: '220px',
              textAlign: 'center',
              color: 'black',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            <h3 style={{ fontSize: '16px', margin: '5px 0', color: 'black' }}>
              {selecionado.nome}
            </h3>
            {selecionado.imagem && (
              <img
                src={selecionado.imagem}
                alt={selecionado.nome}
                style={{
                  width: '100%',
                  borderRadius: '6px',
                  marginBottom: '8px'
                }}
              />
            )}
            <p style={{ margin: 0 }}>{selecionado.data}</p>
            <p style={{ margin: 0 }}>{selecionado.cidade}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export default Mapa;
