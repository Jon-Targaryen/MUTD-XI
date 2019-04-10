import React, { Component } from 'react';
import MyMapComponent from './maps-with-directions'

class Map extends Component {
    render() {
        return (
            <div>
                {/* <div className="headerGrid">
                    <span className="headerTitle">REACT MAP</span>
                    <span>About Us</span>
                    <span>Contact</span>
                </div> */}
                <MyMapComponent />
            </div>
        )
    }
}

export default Map