import MapView, { Marker } from 'react-native-maps';

function MapScreen({ route }) {
    const { location } = route.params;

    return (
        <MapView
            style={{ flex: 1 }}
            initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }}
        >
            <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} />
        </MapView>
    );
};

export default MapScreen;
