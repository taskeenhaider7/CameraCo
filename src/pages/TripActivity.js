import React, { Component } from 'react';
import {
  Button,
  StyleSheet,
  ScrollView,
  Image,
  Keyboard,
  ImageBackground,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import TopBar from '../components/TopBar';
import Moment from 'moment';
import { getStatusBarHeight } from 'react-native-status-bar-height';
statusBarHeight = getStatusBarHeight();
import { Dimensions } from 'react-native';

export default class TripActivity extends Component {
  constructor(params){
    super(params);
    this.state = {
      description:'',
      name:"",
      date:null,
      fromPlace:null,
      fromLabel:"From...",
      dateLabel:null,
      toPlace:null,
      toLabel:"To...",
      seats:"0",
      price:"0",
      isDateTimePickerVisible: false,
      keyboardVisible:false,

    }
  }
  _keyboardDidShow(e) {
    this.setState({
      keyboardVisible:true
    })
  }
  _keyboardDidHide(e) {
    this.setState({
      keyboardVisible:false
    })
  }
  componentWillMount(){
    global.TRIP_ACTIVITY = this;
  }
  componentDidMount(){
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
  }
  renderBanner(){
    if(this.state.keyboardVisible){
      return (null)
    }else{
      return (<Image style={{height:150,width: Dimensions.get('window').width,}} source = {require('../assets/img/assets/banner_trip.png')} resizeMethod={"resize"}>
              </Image>)
    }
  }
  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });
  _handleDatePicked = (date) => {
    this.setState({"date":date});
    console.log('A date has been picked: ', date);
    this._hideDateTimePicker();
  };
  onFromSelected(p){
    global.TRIP_ACTIVITY.setState({
      fromPlace:p,
      fromLabel:p.name
    })
  }
  onToSelected(p){
    global.TRIP_ACTIVITY.setState({
      toPlace:p,
      toLabel:p.name
    })
  }
  getPlacesFrom(){
    this.props.navigation.navigate({routeName:'Places',params:{latitude:null,longitude:null,onPlaceSelected:  this.onFromSelected}});
  }
  getPlacesTo(){
    this.props.navigation.navigate({routeName:'Places',params:{latitude:null,longitude:null,onPlaceSelected:  this.onToSelected}});
  }
  renderDate(){
    Moment.locale('en');
    if(this.state.date == null){
      return "Pick a date.."
    }else{
      return Moment(this.state.date).format('MMM d HH:MM YYYY')
    }
  }
  _goBack(){
      const {goBack} = this.props.navigation;
      goBack();
  }
  isformValid(){
    return ( (this.state.fromPlace != null) && (this.state.toPlace != null) &&  (this.state.description != "") && (this.state.date != null) && (parseInt(this.state.price) > 0) && (parseInt(this.state.seats) > 0));
  }
  handleInputChangePrice = (price) => {
    if (/^\d+$/.test(price)) {
      this.setState({
        price: price
      });
    }
  }
  handleInputChange = (seats) => {
    if (/^\d+$/.test(seats)) {
      this.setState({
        seats: seats
      });
    }
  }
  _saveEvent(){
    _e = {
      "activity":{
          "description": this.state.description,
          "name": this.state.name,
          "date": this.state.date,
          "type":"trip",
          "not_interested": [],
          "interested": [],
          "from_place":this.state.fromPlace,
          "to_place":this.state.toPlace,
          "price":parseInt(this.state.price),
          "seats":parseInt(this.state.seats)

        }
      }
    const {state} = this.props.navigation;
    const {goBack} = this.props.navigation;
    state.params.onEventCreated(_e);
    goBack();
  }
  render() {
    return (
      <View style={[styles.container,{paddingTop:getStatusBarHeight()}]}>
        <TopBar
          firstBtnImage={'back'}
          firstBtn={() => this._goBack()}
          mainTitle={"New Trip"}
        >
        </TopBar>
        {this.renderBanner()}
        <ScrollView style={styles.settings}>
          <View style={styles.setting}>
            <Text style={styles.setting_name}>From</Text>
            <TouchableOpacity  onPress={this.getPlacesFrom.bind(this)}>
              <Text style={styles.section_txt}>
                {this.state.fromLabel}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.setting}>
            <Text style={styles.setting_name}>To</Text>
            <TouchableOpacity  onPress={this.getPlacesTo.bind(this)}>
              <Text style={styles.section_txt}>
                {this.state.toLabel}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.setting}>
            <Text style={styles.setting_name}>When </Text>
            <TouchableOpacity  onPress={this._showDateTimePicker}>
              <Text style={styles.section_txt}>
                {this.renderDate()}
              </Text>
            </TouchableOpacity>

          </View>
          <View style={styles.setting}>
            <Text style={styles.setting_name}>Seats</Text>
              <TextInput style={[styles.section_txt]}
                 keyboardType='numeric'
                 placeholder={"Number of seats..."}
                 onChangeText={this.handleInputChange}
                 value={this.state.seats}

              />
          </View>
          <View style={styles.setting}>
            <Text style={styles.setting_name}>Price p/seat (USD)</Text>
            <TextInput style={[styles.section_txt]}
                 keyboardType='numeric'
                 placeholder={"Price p/seat..."}
                 onChangeText={this.handleInputChangePrice}
                 value={this.state.price}
              />
          </View>
          <View style={styles.setting}>
            <Text style={styles.setting_name}>Description</Text>
          </View>
            <TextInput
             style={{height: 40,  marginLeft:20,marginRight:20}}
             placeholder={"Write your description..."}
             onChangeText={(description) => this.setState({description})}
             value={this.state.text}
            />
            <DateTimePicker
            isVisible={this.state.isDateTimePickerVisible}
            onConfirm={this._handleDatePicked}
            onCancel={this._hideDateTimePicker}
            mode={"datetime"}
            />

        </ScrollView>

        <TouchableOpacity disabled={!this.isformValid()} onPress={this._saveEvent.bind(this)} style={[styles.saveView, this.isformValid()? {}:{backgroundColor:"gray"}]}>
            <Text style={styles.saveText}>SAVE</Text>
        </TouchableOpacity>
      </View>


    );
  }
}
// <View style={styles.field}>
//   <Text>Description</Text>
//   <TextInput
//      style={{height: 40, borderColor: 'gray', borderWidth: 1}}
//      onChangeText={(description) => this.setState({description})}
//      value={this.state.text}
//    />
// </View>
// <View style={styles.field}>
//   <TouchableOpacity onPress={this._showDateTimePicker}>
//     <Text>When</Text>
//
//   </TouchableOpacity>
//   <DateTimePicker
//     isVisible={this.state.isDateTimePickerVisible}
//     onConfirm={this._handleDatePicked}
//     onCancel={this._hideDateTimePicker}
//     mode={"datetime"}
//   />
// </View>
// <View style={styles.field}>
//   <TouchableOpacity onPress={this.getPlacesFrom.bind(this)}>
//     <Text>From</Text>
//   </TouchableOpacity>
// </View>
// <View style={styles.field}>
//   <TouchableOpacity onPress={this.getPlacesTo.bind(this)}>
//     <Text>To</Text>
//   </TouchableOpacity>
// </View>
// <View style={styles.field}>
//   <Text>Price</Text>
//   <TextInput
//      style={{height: 40, borderColor: 'gray', borderWidth: 1}}
//      onChangeText={(price) => this.setState({price})}
//      value={this.state.text}
//    />
// </View>
const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  field:{

  },
  saveView:{
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height:80,
    backgroundColor:"#02b4ff",
    justifyContent: 'center', alignItems: 'center'

  },
  saveText:{
    flex:1,
    color:"white",
    fontSize:20,
    fontFamily:"Lato-Hairline",
    fontWeight:"bold",
    top:28
  },
  settings:{
    backgroundColor:"white"
  },
  setting:{
    height:50,
    marginLeft:20,
    marginRight:20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  setting_name:{
    color:"#5c5c5c",
    fontSize:17
  },
  section_name:{
    fontSize:15,
    color:"#a4a4a4",
    fontFamily:"Lato-Hairline",
    fontWeight:"bold",
    marginLeft:10

  },
  section_txt:{
    color:"#f24e86",
    fontSize:17,
  },
  banner:{
    height:50,
    flex:1
  }
});
