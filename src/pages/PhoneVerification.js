import React, { Component } from 'react';
import { getStatusBarHeight } from 'react-native-status-bar-height';
statusBarHeight = getStatusBarHeight();
import {
  Button,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Text,
  View
} from 'react-native';
import cameraCoApi from "../api/CameraCoApi";
import {  NavigationActions } from 'react-navigation';
import CountryPicker, {
  getAllCountries
} from 'react-native-country-picker-modal'
export default class PhoneVerification extends Component {

  constructor(props){
    super(props);
    const {state} = this.props.navigation;
    this.ALL =  ["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BA","BW","BV","BR","IO","VG","BN","BG","BF","BI","KH","CM","CA","CV","KY","CF","TD","CL","CN","CX","CC","CO","KM","CK","CR","HR","CU","CW","CY","CZ","CD","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","CI","JM","JP","JE","JO","KZ","KE","KI","XK","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MK","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","KP","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","CG","RO","RU","RW","RE","BL","KN","LC","MF","PM","VC","WS","SM","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","KR","SS","ES","LK","SD","SR","SJ","SZ","SE","CH","SY","ST","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","US","UM","VI","UY","UZ","VU","VA","VE","VN","WF","EH","YE","ZM","ZW","AX"]

    this.state = {
      phone: "",
      statusMessage:"",
      isvalid_form:false,
      cca2:"US",
      callingCode:"1",
      isSmsSent:false
    }
  }
  onPressNext(){
    if(this.state.isvalid_form){
        cameraCoApi.sendSMS(this.state.callingCode,this.state.phone).then((res) => {
          // alert(res);
          if(res.success){
            this.setState({isSmsSent:true})
          }else{
            alert("There was a problem trying to send your verification code. Check the number and try again later.")
          }
        });
    }

  }
  checkPhone(phone){
    if(phone.length < 10){
      this.setState({isvalid_form:false})
    }else{
      this.setState({isvalid_form:true})

    }
  }
  gotoVerify(){
    const resetAction = NavigationActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({key:'PhoneVerificationEntry', routeName: 'PhoneVerificationEntry', params: { page: 1}})],
            });
    this.props.navigation.dispatch(resetAction);
  }
  skip(){
    const resetAction = NavigationActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({key:'Fotes', routeName: 'Fotes', params: { page: 1}})],
            });
    this.props.navigation.dispatch(resetAction);
  }
  renderNextButton(){
    if(this.state.isSmsSent){
      return(<TouchableOpacity onPress={() => this.gotoVerify()} activeOpacity={0.6}  title="next" style={[styles.button]}>
         <Text style={styles.buttonText}>Next</Text>
       </TouchableOpacity>)
    }else{
      return(<TouchableOpacity onPress={() => this.onPressNext()} activeOpacity={0.6} disabled={!this.state.isvalid_form} title="next" style={[styles.button,this.state.isvalid_form ? {}:{backgroundColor:"#8bb6d4"}]}>
         <Text style={styles.buttonText}>Send Verification code</Text>
       </TouchableOpacity>)
    }
  }
  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.message}>
          <Text style={styles.title}> Phone Verification</Text>
          <Text style={styles.subtitle}>We need to verify your phone for some of the interactions in Fotes. You can skip this step if you wish</Text>
        </View>
        <View style={{flexDirection:"row",alignItems:"center"}}>
          <CountryPicker
            countryList={this.ALL}
            onChange={value => {
              this.setState({ cca2: value.cca2, callingCode: value.callingCode })
            }}

            cca2={this.state.cca2}
            translation="eng"
          />
          <TextInput
            style={styles.input}
            keyboardType={"number-pad"}
            onChangeText={(phone) => {this.setState({phone:phone});this.checkPhone(phone)}}
            value={this.state.phone}
            placeholder="Enter your phone number"
            returnKeyType={"done"}
            onSubmitEditing={() => this.onPressNext()}
            >
           </TextInput>
         </View>
         <Text style={[this.state.isvalid_form ? {color:"green",marginTop:20}:{color:"red",marginTop:20}]}>{this.state.statusMessage}</Text>
         <View style={{flex:.1}}>
         </View>
         {this.renderNextButton()}
          <View style={{flex:.1}}>
          </View>
          <Button title="Skip" onPress={() => this.skip()}></Button>

      </View>
    );
  }
}

const styles = StyleSheet.create({


  container: {
    flex: 1,
    flexDirection:"column",
    backgroundColor: 'white',
    paddingTop:statusBarHeight,
    paddingLeft:20,
    paddingRight:20
  },
  input:{
    borderWidth:1,
    borderColor:'#d4d4d4',
    backgroundColor:"#fafafa",
    height:55,
    borderRadius:5,
    paddingLeft:5,
    paddingRight:5,
    flex:1,
    marginLeft:15

  },
  message:{
    flexDirection:"column",
    justifyContent:"center",
    textAlign:"center",
    flex:.2
  },
  title:{
    fontSize:30,
    textAlign:"center",

  },
  subtitle:{
    fontSize:15,
    textAlign:"center",

  },
  button:{
    height:50,
    backgroundColor:"#44aaf4",
    borderRadius:5,
    flexDirection:"column",
    justifyContent:"center",
    textAlign:"center",


  },
  buttonText:{
    color:"white",
    textAlign:"center",
    fontSize:20
  }

})
