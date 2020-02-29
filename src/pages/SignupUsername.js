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
export default class SignupUsername extends Component {

  constructor(props){
    super(props);
    const {state} = this.props.navigation;

    this.state = {
      email:state.params.email,
      name:state.params.name,
      username: "",
      statusMessage:"",
      isvalid_form:false
    }
  }
  onPressNext(){
    if(this.state.isvalid_form){
      this.props.navigation.navigate({key:'SignupPassword',routeName:'SignupPassword',
        params:{email:this.state.email,name:this.state.name,username:this.state.username}});
    }
  }
  checkUsername(email){
    cameraCoApi.check_username(email.toLowerCase()).then((res) => {

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
          <Text style={styles.title}>Choose a username</Text>
          <Text style={styles.subtitle}>This is how you people will find you.</Text>
        </View>
        <TextInput
          style={styles.input}
          autoCapitalize={false}
          onChangeText={(username) => {
                      this.setState({username:username.toLowerCase()});
                      this.checkUsername(username.toLowerCase());
                      }}
          value={this.state.username}
          placeholder="Type your username"
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
