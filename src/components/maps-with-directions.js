/*global google*/
import React from 'react'
import { compose, withProps, lifecycle } from 'recompose'
import { withScriptjs, withGoogleMap, GoogleMap, DirectionsRenderer } from 'react-google-maps'
import Autocomplete from 'react-google-autocomplete';
import PlacesAutocomplete from 'react-places-autocomplete';
import Geocode from "react-geocode";
import '../App.css';

Geocode.setApiKey("AIzaSyCRaMzAqIbam4PJ0x6qnziL8be8ZTCJg6c");
Geocode.enableDebug();

class MyMapComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      originLat: '12.922915',
      originLng: '80.127457',
      destinationLat: '12.922915',
      destinationLng: '80.127457',
      directions: {},
      waypoints: [],
      waypointsArray: [],
      waypointsLocationNames: [],
      formatted_address_source: '',
      formatted_address_destination: '',
      travel: 'DRIVING'
    }
  }
  onSourcePlaceSelected = (place) => {
    if (this.state.formatted_address_source != this.state.formatted_address_destination) {
      this.setState({
        originLat: place.geometry.location.lat(),
        originLng: place.geometry.location.lng(),
        formatted_address_source: place.formatted_address
      });
    }
    else if (this.state.formatted_address_source === this.state.formatted_address_destination) {
      this.setState({
        originLat: place.geometry.location.lat(),
        originLng: place.geometry.location.lng(),
        destinationLat: place.geometry.location.lat(),
        destinationLng: place.geometry.location.lng(),
        formatted_address_source: place.formatted_address
      });
    }
  }

  onDestinationPlaceSelected = (place) => {
    if (this.state.formatted_address_source != this.state.formatted_address_destination) {
      this.setState({
        destinationLat: place.geometry.location.lat(),
        destinationLng: place.geometry.location.lng(),
        formatted_address_destination: place.formatted_address
      });
    }
    else if (this.state.formatted_address_source === this.state.formatted_address_destination) {
      this.setState({
        originLat: place.geometry.location.lat(),
        originLng: place.geometry.location.lng(),
        destinationLat: place.geometry.location.lat(),
        destinationLng: place.geometry.location.lng(),
        formatted_address_destination: place.formatted_address
      });
    }
  }

  updateWaypoints = (place) => {
    let waypoints = [...this.state.waypoints];
    waypoints.push(place.geometry.location);
    let waypointsLocationNames = [...this.state.waypointsLocationNames];
    waypointsLocationNames.push(place.name)
    let waypointsArray = [...this.state.waypointsArray];
    waypointsArray.push({ location: place.geometry.location, stopover: true })
    this.setState({
      waypoints: waypoints,
      waypointsLocationNames: waypointsLocationNames,
      waypointsArray: waypointsArray
    })
  }

  removeWaypoint = (place) => {
    debugger;
    let waypointIndex = this.state.waypointsLocationNames.indexOf(place);
    let waypoints = [...this.state.waypoints];
    let waypointsLocationNames = [...this.state.waypointsLocationNames];
    let waypointsArray = [...this.state.waypointsArray]
    waypoints.splice(waypointIndex, 1);
    waypointsLocationNames.splice(waypointIndex, 1);
    waypointsArray.splice(waypointIndex, 1);
    this.setState({
      waypoints: waypoints,
      waypointsLocationNames: waypointsLocationNames,
      waypointsArray: waypointsArray
    });
  }

  transitChange = (event) => {
    debugger;
    this.setState({
      travel: event
    })
    var a = document.getElementById("walk");
    a.classList.remove("selected");
    document.getElementById("drive").classList.remove("selected");
    document.getElementById("transit").classList.remove("selected");
    if (event === 'WALKING') {
      var element = document.getElementById('walk')
    }
    else if (event === 'DRIVING') {
      var element = document.getElementById('drive')
    }
    else {
      var element = document.getElementById('transit')
    }
    element.classList.add("selected");
  }

  render() {
    let steps = [];
    let distance = ''
    let duration = ''
    let stepCard;
    let arrival_time = '';
    let departure_time = '';
    const DirectionsComponent = compose(
      withProps({
        googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyCRaMzAqIbam4PJ0x6qnziL8be8ZTCJg6c&libraries=geometry,drawing,places",
        loadingElement: <div style={{ height: `400px` }} />,
        containerElement: <div className='gridLayout' />,
        mapElement: <div style={{ height: `600px` }} />,
        originLat: this.state.originLat,
        originLng: this.state.originLng,
        destinationLat: this.state.destinationLat,
        destinationLng: this.state.destinationLng,
        waypoints: this.state.waypoints,
        waypointsArray: this.state.waypointsArray,
        waypointsLocationNames: this.state.waypointsLocationNames,
        formatted_address_source: this.state.formatted_address_source,
        formatted_address_destination: this.state.formatted_address_destination,
        travel: this.state.travel
      }),
      withScriptjs,
      withGoogleMap,
      lifecycle({
        componentDidMount() {
          const DirectionsService = new google.maps.DirectionsService();
          DirectionsService.route({
            origin: new google.maps.LatLng(this.props.originLat, this.props.originLng),
            destination: new google.maps.LatLng(this.props.destinationLat, this.props.destinationLng),
            travelMode: google.maps.TravelMode[this.props.travel],
            waypoints: this.props.waypointsArray
          }, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              steps = result.routes[0].legs[0].steps;
              if (result.routes[0].legs[0].distance.value > 0) {
                if (this.props.travel === 'TRANSIT') {
                  arrival_time = result.routes[0].legs[0].arrival_time.text;
                  departure_time = result.routes[0].legs[0].departure_time.text;
                }
                distance = result.routes[0].legs[0].distance.text;
                duration = result.routes[0].legs[0].duration.text;
              }
              stepCard = steps.map((step) =>
                // step.instructions = step.instructions.replace(/,/g, '<br>')
                `<div style="margin: 1em;">${step.instructions}</div>`
              );
              if (stepCard.length == 1) {
                stepCard = ''
              }
              else {
                let stepString = ''
                for (let ele of stepCard) {
                  stepString += ele + ' ';
                }
                stepCard = stepString;
              }
              this.setState({
                directions: { ...result },
                markers: true,
              })
            } else {
              console.error(`error fetching directions ${result}`);
            }
          });
        }
      })
    )(props =>
      <div>
        <GoogleMap
          defaultZoom={3}
        >
          {props.directions && <DirectionsRenderer directions={props.directions} suppressMarkers={props.markers} />}
        </GoogleMap>
        <p className="title">Enter Source</p>
        <Autocomplete
          style={{
            width: '100%',
            height: '30px',
          }}
          placeholder={props.formatted_address_source}
          onPlaceSelected={this.onSourcePlaceSelected}
          types={['establishment','geocode']}
        />
        <p className="title">Enter Destination</p>
        <Autocomplete
          style={{
            width: '100%',
            height: '30px',
          }}
          placeholder={props.formatted_address_destination}
          onPlaceSelected={this.onDestinationPlaceSelected}
          types={['establishment','geocode']}
        />
        {props.originLat != props.destinationLat ?
          <div>
            <span className="transportGrid">
              <span id="drive" className="transportSpan" onClick={() => this.transitChange('DRIVING')}>
                <i className="fa fa-car"></i>Drive</span>
              <span id="transit" className="transportSpan" onClick={() => this.transitChange('TRANSIT')}>
                <i className="fa fa-train" ></i>Transit</span>
              <span id="walk" className="transportSpan" onClick={() => this.transitChange('WALKING')}>
                <i className="fa fa-male"></i>Walk</span>
            </span>
            <p className="title">Do you have any waypoints?</p>
            <Autocomplete
              style={{
                width: '100%',
                height: '30px',
              }}
              onPlaceSelected={this.updateWaypoints}
              types={['(regions)']}
            />
            {props.waypointsArray.length > 0 ?
              <div className="waypointDisplayGrid">
                {props.waypointsLocationNames.map(txt =>
                  <span className="waypointBox">{txt}<font className="deleteWaypoint" onClick={() => this.removeWaypoint(txt)}>X</font></span>)}
              </div> : <div></div>
            }
          </div> : <div></div>}
        {props.originLat != props.destinationLat ? <div><div className="bold title">{props.travel} INSTRUCTIONS: </div>
          <span className="distanceDurationGrid">
            <font>DISTANCE: {distance}</font>
            <font>DURATION: {duration}</font>
          </span>
          <div className="stepsClass" dangerouslySetInnerHTML={{ __html: stepCard }} >
          </div></div> : <div></div>}
      </div>
    );
    return (
      <div>
        <DirectionsComponent />
      </div>
    )
  }
}
export default MyMapComponent