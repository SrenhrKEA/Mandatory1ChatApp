import MapView, { Marker } from 'react-native-maps';

function MapScreen({ route }) {
    const { location } = route.params;

    console.log(location.latitude, location.longitude)

    return (
        <MapView
            style={{ flex: 1 }}
            showsCompass={true}
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
