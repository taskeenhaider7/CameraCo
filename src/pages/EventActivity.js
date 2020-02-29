import React, { Component } from 'react';
import {
  StyleSheet,
  StatusBar,
  Image,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import TopBar from '../components/TopBar';
import Moment from 'moment';
import { Dimensions } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

statusBarHeight = getStatusBarHeight();

export default class EventActivity extends Component {
  constructor(params){
    super(params);
    this.state = {
      description:'',
      name:"",
      date:null,
      dateLabel:null,
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
  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });
  _handleDatePicked = (date) => {
    this.setState({"date":date,"dateLabel":date});

    console.log('A date has been picked: ', date);
    this._hideDateTimePicker();
  };
  renderBanner(){
    if(this.state.keyboardVisible){
      return (null)
    }else{
      return (<Image style={{height:150,width: Dimensions.get('window').width,}} source = {require('../assets/img/assets/banner_trip.png')} resizeMethod={"resize"}>
              </Image>)
    }
  }
  _saveEvent(){
    _e = {
      "activity":{
          "description": this.state.description,
          "name": this.state.name,
          "date": this.state.date,
          "type":"event",
          "going": [],
          "not_going": [],
          "interested": []
        }
      }
    const {state} = this.props.navigation;
    const {goBack} = this.props.navigation;
    state.params.onEventCreated(_e);
    goBack();
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
    return ((this.state.description != "") && (this.state.date != null));
  }
  render() {
    return (
      <View style={[styles.container,{paddingTop:getStatusBarHeight()}]}>
        <StatusBar  hidden={false}/>
        <TopBar
          firstBtnImage={'back'}
          firstBtn={() => this._goBack()}
          mainTitle={"New Event"}
        >
        </TopBar>
        {this.renderBanner()}
        <ScrollView style={styles.settings}>
          <View style={styles.setting}>
            <Text style={styles.setting_name}>When </Text>
            <TouchableOpacity  onPress={this._showDateTimePicker}>
              <Text style={styles.section_txt}>
                {this.renderDate()}
              </Text>
            </TouchableOpacity>

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
