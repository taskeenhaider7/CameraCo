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
export default class SignupEmail extends Component {

  constructor(props){
    super(props);
    this.state = {
      email: "",
      statusMessage:"",
      isvalid_form:false
    }
  }
  onPressNext(){
    if(this.state.isvalid_form){
      this.props.navigation.navigate({key:'SignupName',routeName:'SignupName',
        params:{email:this.state.email}});
    }

  }
  checkEmail(email){
    cameraCoApi.check_email(email.toLowerCase()).then((res) => {

      this.setState({
        statusMessage: res.reason,
        isvalid_form:  res.success
      })
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.message}>
          <Text style={styles.title}> Are you new?</Text>
          <Text style={styles.subtitle}>Cool! Tell us abour yourself</Text>
        </View>
        <TextInput
          style={styles.input}
          autoCapitalize={false}
          onChangeText={(email) => {this.setState({email});this.checkEmail(email)}}
          value={this.state.email}
          placeholder="Enter your email address"
          returnKeyType={"done"}
          onSubmitEditing={() => this.onPressNext()}

          >
         </TextInput>
         <Text style={[this.state.isvalid_form ? {color:"green",marginTop:20}:{color:"red",marginTop:20}]}>{this.state.statusMessage}</Text>
         <View style={{flex:.1}}>
         </View>
         <TouchableOpacity onPress={() => this.onPressNext()}  activeOpacity={0.6} disabled={!this.state.isvalid_form} title="next" style={[styles.button,this.state.isvalid_form ? {}:{backgroundColor:"#8bb6d4"}]}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
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
    paddingRight:5

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
