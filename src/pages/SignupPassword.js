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
import { AsyncStorage } from 'react-native';
import {  NavigationActions } from 'react-navigation';
export default class SignupPassword extends Component {

  constructor(props){
    super(props);
    const {state} = this.props.navigation;
    this.state = {
      email:state.params.email,
      name:state.params.name,
      username:state.params.username,
      password: "",
      statusMessage:"",
      isvalid_form:false
    }
  }
  saveUser(){
    cameraCoApi.getMe().then((response) => {
      if(response.hasOwnProperty('name')){
        let user = JSON.stringify(response);
        // alert(user);
        AsyncStorage.setItem('user',user);
        const resetAction = NavigationActions.reset({
                  index: 0,
                  actions: [NavigationActions.navigate({key:'SignupPhoto', routeName: 'SignupPhoto', params: { page: 1}})],
                });
        this.props.navigation.dispatch(resetAction);
      }
    })
  }
  onPressNext(){

    if(this.state.isvalid_form){
      // alert("password: "+this.state.password)

      cameraCoApi.signUp(this.state.name,this.state.email,this.state.username,this.state.password).then((res) => {
        if(!res){
          alert("There was an error while trying to create your account.");
          // this.setState({showIndicator:false});
        }else{
          if(res.success){
            this.saveUser();
          }else{
            alert(res.reason);
          }
          // this.setState({showIndicator:false});
        }
      });
    }

  }
  checkPassword(password){
    if(password == ""){
      this.setState({
        statusMessage: "Your password can not empty.",
        isvalid_form:  false
      })
    }else if(password.includes(" ")){
      this.setState({
        statusMessage: "Your password can not contain empty spaces.",
        isvalid_form:  false
      })
    }else if(password.length <= 4){
      this.setState({
        statusMessage: "Your password can not be shorter than 5 characters.",
        isvalid_form:  false
      })
    }else{
      this.setState({
        statusMessage: "",
        isvalid_form:  true
      })
    }

  }
  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.message}>
          <Text style={styles.title}> Create a password</Text>
          <Text style={styles.subtitle}></Text>
        </View>
        <TextInput
          style={styles.input}
          onChangeText={(password) => {this.setState({password:password});this.checkPassword(password)}}
          value={this.state.password}
          placeholder="Enter your password"
          returnKeyType={"done"}
          secureTextEntry={true}
          onSubmitEditing={() => this.onPressNext()}
          >
         </TextInput>
         <Text style={[this.state.isvalid_form ? {color:"green",marginTop:20}:{color:"red",marginTop:20}]}>{this.state.statusMessage}</Text>
         <View style={{flex:.1}}>
         </View>
         <TouchableOpacity onPress={() => this.onPressNext()} activeOpacity={0.6} disabled={!this.state.isvalid_form} title="next" style={[styles.button,this.state.isvalid_form ? {}:{backgroundColor:"#8bb6d4"}]}>
            <Text style={styles.buttonText}>Create Account</Text>
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
