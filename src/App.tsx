import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLng } from "leaflet";

const fakeMarkersPositions = [
  // new LatLng(47.17203394248338, -1.448766607765262), // => Position en zone safe
  new LatLng(47.17835107557902, -1.446386025697808),
  new LatLng(47.169859870861515, -1.46513612682222),
];

const UserSafeArea: React.FC<{
  userPosition: LatLng;
  distanceToCheck: number;
  reportedPositions: LatLng[];
}> = ({ userPosition, distanceToCheck, reportedPositions }) => {
  const [isSafe, setIsSafe] = useState(true);

  // Si une zone signalée est dans la zone de sécurité, on affiche un cercle rouge:
  useEffect(() => {
    const isSafe = reportedPositions.every(
      (reportedPosition) =>
        userPosition.distanceTo(reportedPosition) > distanceToCheck
    );
    setIsSafe(isSafe);
  }, [userPosition, distanceToCheck, reportedPositions]);

  return (
    <Circle
      center={userPosition}
      radius={distanceToCheck}
      pathOptions={{
        color: isSafe ? "green" : "red",
        fillColor: isSafe ? "green" : "red",
      }}
    />
  );
};

const UserLocation: React.FC<{
  onUpdatePosition: (newPosition: LatLng) => void;
  sendReport: (reportedPosition: LatLng) => void;
}> = ({ onUpdatePosition, sendReport }) => {
  const [userPosition, setUserPosition] = useState<LatLng>();

  useEffect(() => {
    // Si la position n'est pas encore initialisée
    if (!userPosition) {
      // console.log("DEBUG: Pas encore de position détectée pour l'utilisateur.");
      return;
    }

    // console.log("DEBUG: position mise à jour pour l'utilisateur.");
    onUpdatePosition(userPosition);
  }, [onUpdatePosition, userPosition]);

  const map = useMapEvents({
    click(e) {
      // Déclenchement de localisation de l'utilisateur:
      map.locate();
      // TODO: juste pour tester, ajoute un marker sur la position cliqué:
      sendReport(e.latlng);
    },
    locationfound(e) {
      setUserPosition(e.latlng);
      // Centrer la map sur l'utilisateur:
      map.flyTo(e.latlng, 16); //"map.getZoom()" pour conserver le zoom actuel
    },
  });

  return !userPosition ? null : (
    <Marker
      icon={L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/3603/3603850.png",
        iconSize: [45, 45],
      })}
      position={userPosition}
    >
      <Popup>You are here</Popup>
    </Marker>
  );
};

const ReportMarker: React.FC<{ position: LatLng }> = ({ position }) => (
  <Circle
    center={position}
    radius={50}
    pathOptions={{ color: "red", fillColor: "red" }}
  />
);

const Map: React.FC = () => {
  const [userPosition, setUserPosition] = useState<LatLng>();
  const [reportedPositions, setMarkersPositions] =
    useState<LatLng[]>(fakeMarkersPositions);

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100%" }}>
      {/* Récupérer le style de la carte: */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Afficher la position de l'utilisateur: */}
      <UserLocation
        onUpdatePosition={(newPosition) => setUserPosition(newPosition)}
        sendReport={(reportedPosition) =>
          setMarkersPositions([...reportedPositions, reportedPosition])
        }
      />

      {/* Afficher la zone de sécurité uniquement si la position de l'utilisateur est définie: */}
      {userPosition && (
        <UserSafeArea
          userPosition={userPosition} // TODO: à gérer dans le Context
          distanceToCheck={150}
          reportedPositions={reportedPositions} // TODO: à gérer dans le Context
        />
      )}

      {/* Afficher tous les signalements: */}
      {reportedPositions.map((reportedPosition) => (
        <ReportMarker position={reportedPosition} />
      ))}
    </MapContainer>
  );
};

const App: React.FC = () => {
  return (
    <div>
      <p style={{ fontFamily: 'system-ui', fontSize: 20, margin:0 }}>
        I made this <b>very</b> basic (😅) project to explain some concepts to a friend 🤓🥸. You can
        check the code of this project{" "}
        <a
          href="https://github.com/Suniron/leaflet-detect-safe"
          target="_blank"
          rel="noreferrer"
        >
          on my Github
        </a>{" "}.
      </p>
      <div style={{ height: "90vh" }}>
        <Map />
      </div>
    </div>
  );
};

export default App;
