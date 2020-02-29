import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';
const {width, height} = Dimensions.get('window');
import Svg,{
  Path,Polygon
} from 'react-native-svg';
import PropTypes from 'prop-types';

export default class AudioVisualization extends Component {
  constructor(props){
    super(props);
    this.state = {
      polygon:"0,0",
      fillColor:"white",
      fillColorDarkMode:"black"
    }
  }
  receiveMetrics(metrics){
    _db = Math.abs(metrics.currentMetering);
    _time = metrics.currentTime;
    _pr = 60 -  ( ( 30 * _db) / 180 ) ;
    console.log("metrics");
    console.log(_db,_pr);
    _a = this.getRandomArbitrary(10,40);
    //0 quiet
    //40 loud
    _idb = 40 - _db;
    // console.log(_a);
    if(_db < 100){
      this.draw(_idb * 2);
    }



  }

  clear(){
    this.setState({polygon:"0,0"})
  }


    getRandomArbitrary(min,max){
      return Math.random() * ( max - min ) + min;
    }
    draw(a){
      values = []
      k =  360;
      // const {width, height} = Dimensions.get('window');
      if(this.props.height){
        heightV = this.props.height;
        k = 180;
      }else {
        heightV = height;
      }

      var counter = 0, x = 0, y = 180;
      var increase = 90 / 180 * Math.PI / 9;
      // ctx.beginPath();
      // ctx.moveTo(0,height);
      values.push("0,"+heightV)
      for( i = 0 ; i <= width  ; i+=2){
        // ctx.lineTo(x,y);
        x = i;
        y = k - Math.cos(counter/ 4 ) * a + Math.cos(counter / 20) * a;
        counter += increase;
        values.push(x+","+y)
        // ctx.lineTo(x,y);
        // ctx.stroke();

      }
      values.push(width+","+heightV);
      polygons = values.join(" ");
      this.setState({polygon:polygons})

      // ctx.lineTo(canvas.width,canvas.height);
      // ctx.lineTo(0,canvas.height);

      // ctx.stroke();
      // ctx.fillStyle = "#00000080";
      // ctx.fill();
    }

  renderPath(){
    if(this.props.darkMode){
      return (
        <Polygon points={this.state.polygon}
          fill={"#FFFFFF4D"}
          strokeWidth="1"
        >
        </Polygon>
      )
    }else{
      return (
        <Polygon points={this.state.polygon}
          fill={"#0000004D"}
          strokeWidth="1"
        >
        </Polygon>
      )
    }

  }
  render(){

    return (
      <View pointerEvents="none"
        style={[{position:"absolute",bottom:0,top:0,left:0,right:0,zIndex:1,},
          this.props.height ? {height:this.props.height} : {flex:1}]}>
        <Svg style={{flex:1}}
          >
          {this.renderPath()}

          </Svg>
      </View>
    )
  }


}
AudioVisualization.propTypes = {
  darkMode: PropTypes.boolean,
  height: PropTypes.number
}
AudioVisualization.defaultProps = {
  darkMode:false,
}
