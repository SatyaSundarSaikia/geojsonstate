

// Initialize the map with OSM base layer
const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([78.9629, 20.5937]), // Centered on India
        zoom: 4
    })
});



document.getElementById('selectButton').addEventListener('click', function () {


    const selectedState = document.getElementById('state').value;
    // const selectedState = "Assam";

    const selectedDistrict = document.getElementById('district').value;
    // const selectedDistrict = "Baksa";

    console.log("Selected State:", selectedState);
    console.log("Selected District:", selectedDistrict);

    // Function to retrieve coordinates from a feature's geometry
    function getCoordinatesFromFeature(feature) {
        return feature.getGeometry().getExtent(); // Get the extent of the geometry
    }

    // Create a vector source for the district layer
    const existingDistrictLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'districtLayer');
    if (existingDistrictLayer) {
        map.removeLayer(existingDistrictLayer);
    }

    // Remove previous state layer if exists

    const existingStateLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'stateLayer');
    if (existingStateLayer) {
        map.removeLayer(existingStateLayer);
    }

    if (selectedDistrict) {

        const districtVectorSource = new ol.source.Vector({
            url: './india_Districts.geojson', // Replace with your district data URL
            format: new ol.format.GeoJSON()
        });


        // Function to create a filter based on state name (adjust property name if needed)
        function getDistrictFilter(selected) {
            return function (feature) {
                return feature.get('distname').toLowerCase() === selected.toLowerCase(); // Modify property name based on your data
            };
        }

        // Apply the filter to the source based on selected district
        districtVectorSource.once('change', function () {
            districtVectorSource.getFeatures().forEach(function (feature) {
                if (!getDistrictFilter(selectedDistrict)(feature)) {
                    districtVectorSource.removeFeature(feature);
                } else {
                    const extent = getCoordinatesFromFeature(feature);
                    map.getView().fit(extent, { duration: 1000 }); // Fit the map view to the extent of the selected district with animation
                }
            });
        });



        // Remove previous district layer if exists



        // Create a district vector layer with the filtered source
        const districtLayer = new
            ol.layer.Vector({
                source: districtVectorSource,
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#a0a',
                        lineCap: 'butt',
                        width: 1
                    }),
                })
            });
        districtLayer.set('name', 'districtLayer');

        map.addLayer(districtLayer);

        districtLayer.getSource().on('addfeature', function () {

            // Get the geometry of the districtLayer
            // var districtLayerClipGeometry = districtLayer.getSource().getFeatures()[1].getGeometry();

            var districtLayerClipGeometry = districtLayer.getSource().getFeatures().find(feature => getDistrictFilter(selectedDistrict)(feature)).getGeometry();


            // console.log(stateLayer.getSource().getFeatures())
            // Get the bounding box of the map
            // var mapExtent0 = map.getView().calculateExtent(map.getSize());

            var mapExtent = map.getView().calculateExtent(map.getSize());

            // console.log(mapExtent0)
            // console.log(mapExtent)

            var boundingBoxPolygon = ol.geom.Polygon.fromExtent(mapExtent);
            console.log(boundingBoxPolygon)

            // Convert the bounding box polygon to GeoJSON
            const format = new ol.format.GeoJSON();

            var boundingBoxGeoJSON = format.writeGeometryObject(boundingBoxPolygon);

            // Convert the districtLayerClipGeometry to GeoJSON
            var clipGeoJSON = format.writeGeometryObject(districtLayerClipGeometry);
            // console.log(clipGeoJSON())

            // Subtract the districtLayerClipGeometry from the bounding box geometry
            var outsidePolygonGeoJSON = turf.difference(boundingBoxGeoJSON, clipGeoJSON);

            // Convert the resulting GeoJSON back to an OpenLayers feature
            var outsideFeature = format.readFeature(outsidePolygonGeoJSON);

            // Create a vector layer for the outside feature
            var outsideVectorLayer = new ol.layer.Vector({
                source: new VectorSource({
                    features: [outsideFeature]
                }),
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 1)' // Semi-transparent red fill (customize as needed)
                    })
                })
            });

            // Add the outside vector layer to the map
            outsideVectorLayer.set('name', 'outsideVectorLayer');

            // Create a vector source for the district layer
            const distExistingOutsideLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'outsideVectorLayer');
            if (distExistingOutsideLayer) {
                map.removeLayer(distExistingOutsideLayer);
                console.log("Layer exists and removed");
            } else {
                console.log("Layer does not exist");
            }

            map.addLayer(outsideVectorLayer);
        });

    }



    else if (selectedState) {

        // Create a vector source for the state layer
        const stateVectorSource = new ol.source.Vector({
            url: './india_state_geo.json', // Replace with your state data URL
            format: new ol.format.GeoJSON()
        });
        // Function to create a filter based on state name (adjust property name if needed)

        function getStateFilter(selected) {
            return function (feature) {
                return feature.get('NAME_1').toLowerCase() === selected.toLowerCase(); // Modify property name based on your data

            };
        }


        // Apply the filter to the source based on selected state
        stateVectorSource.once('change', function () {
            stateVectorSource.getFeatures().forEach(function (feature) {
                if (!getStateFilter(selectedState)(feature)) {
                    stateVectorSource.removeFeature(feature);
                } else {
                    const extent = getCoordinatesFromFeature(feature);
                    // console.log(extent)


                    map.getView().fit(extent, { duration: 1000 }); // Fit the map view to the extent of the selected state with animation
                }
            });
        });

        // Create a state vector layer with the filtered source
        const stateLayer = new ol.layer.Vector({
            source: stateVectorSource,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#000',
                    lineCap: 'butt',
                    width: 1
                }),
            })
        });
        stateLayer.set('name', 'stateLayer');
        map.addLayer(stateLayer);
        // Add the new layers to the map
        //
        stateLayer.getSource().on('addfeature', function () {

            // Get the geometry of the stateLayer
            // var stateLayerClipGeometry = stateLayer.getSource().getFeatures()[1].getGeometry();

            var stateLayerClipGeometry = stateLayer.getSource().getFeatures().find(feature => getStateFilter(selectedState)(feature)).getGeometry();


            // console.log(stateLayer.getSource().getFeatures())
            // Get the bounding box of the map
            // var mapExtent0 = map.getView().calculateExtent(map.getSize());

            var mapExtent = worldview.calculateExtent(map.getSize());

            // console.log(mapExtent0)
            // console.log(mapExtent)
            var boundingBoxPolygon = ol.geom.Polygon.fromExtent(mapExtent);

            const format = new ol.format.GeoJSON();

            var boundingBoxGeoJSON = format.writeGeometryObject(boundingBoxPolygon);

            // Convert the stateLayerClipGeometry to GeoJSON
            var clipGeoJSON = format.writeGeometryObject(stateLayerClipGeometry);
            // console.log(clipGeoJSON())

            // Subtract the stateLayerClipGeometry from the bounding box geometry
            var outsidePolygonGeoJSON = turf.difference(boundingBoxGeoJSON, clipGeoJSON);

            // Convert the resulting GeoJSON back to an OpenLayers feature
            var outsideFeature = format.readFeature(outsidePolygonGeoJSON);

            var outsideVectorLayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [outsideFeature]
                }),
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 1)' // Semi-transparent red fill (customize as needed)
                    })
                })
            });

            // Add the outside vector layer to the map
            outsideVectorLayer.set('name', 'outsideVectorLayer');

            // Create a vector source for the district layer
            const stateExistingOutsideLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'outsideVectorLayer');
            if (stateExistingOutsideLayer) {
                map.removeLayer(stateExistingOutsideLayer);
                console.log("Layer exists and removed");
            } else {
                console.log("Layer does not exist");
            }

            map.addLayer(outsideVectorLayer);
        });


    }

});         