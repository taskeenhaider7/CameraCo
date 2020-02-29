import React, { Component } from 'react';
import {
  StatusBar,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default class ActivitySelector extends Component {
  constructor(props){
    super(props);
    this.state = {
      isSelectedEvent:false,
      isSelectedTrip:false,
    }
  }

  startActivity(){
    if(!this.state.isSelectedEvent){
      this.setState({isSelectedEvent:true,isSelectedTrip:false});
      this.props.activitySelected('event');
    }else{
      this.setState({isSelectedEvent:false});
      this.props.activitySelected('none');
    }
  }

  startTripActivity(){
    if(!this.state.isSelectedTrip){
      this.setState({isSelectedTrip:true,isSelectedEvent:false});
      this.props.activitySelected('trip');
    }else{
      this.setState({isSelectedTrip:false});
      this.props.activitySelected('none');
    }
  }
  componentWillMount(){
    global.ACTIVITY_SELECTOR = this;

  }
  _goBack(){
      const {goBack} = this.props.navigation;
      goBack();
  }
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => this.startActivity()}
          style={[styles.card,this.state.isSelectedEvent ? {backgroundColor:'#5cb4dc'}:{backgroundColor:'#f7f7f7'}]}>
          <TouchableOpacity style={styles.touchableOpacity}
            onPress={() => this.startActivity()}>
            <View
              style={[styles.btnOn,this.state.isSelectedEvent ? {backgroundColor:'#5cb4dc'}:{backgroundColor:'white'}]}>
            </View>
          </TouchableOpacity>
          <Text style={styles.cardText}>Event</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this.startTripActivity()}
          style={[styles.card,this.state.isSelectedTrip ? {backgroundColor:'#5cb4dc'}:{backgroundColor:'#f7f7f7'}]}>
          <TouchableOpacity style={styles.touchableOpacity}
            onPress={() => this.startTripActivity()}>
            <View
              style={[styles.btnOn,this.state.isSelectedTrip ? {backgroundColor:'#5cb4dc'}:{backgroundColor:'white'}]}>
            </View>
          </TouchableOpacity>
          <Text style={styles.cardText}>Trip</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    backgroundColor:"#f7f7f7",
  },
  card:{
    flexDirection:'row',
    height:50,
    paddingLeft:25,
    paddingRight:25,
    alignItems:"center",
    borderTopWidth:1,
    borderTopColor:'#f0f0f0',
  },
  cardText:{
    paddingLeft:20,
    color:"#747474",
    fontSize:16,
    fontFamily:"Lato-Bold",
  },
  touchableOpacity:{
    height:30,
    width:30,
    borderRadius:15,
    borderWidth:1,
    borderColor:'#f0f0f0',
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:'white'
  },
  btnOn:{
    height:15,
    width:15,
    borderRadius:7.5,
  }
});
