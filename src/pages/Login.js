import React, { Component } from 'react';
import { Alert,Platform,Keyboard,ScrollView, Dimensions,TextInput,StyleSheet, Text, View,Image,TouchableOpacity } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import {  NavigationActions } from 'react-navigation';

import cameraCoApi from "../api/CameraCoApi";
const { height, width} = Dimensions.get('window');

statusBarHeight = getStatusBarHeight();

export default class Login extends React.Component {

  constructor(params){
    super(params);
    this.state = {
      email:'',
      password:'',
      error:null
    }
  }

  componentDidMount(){

  }

  _keyboardDidShow(e) {
    _extra = Platform.OS === 'ios' ? 0 : 0,
    _paddingGif = 0 + _extra;
    _paddingMsg = 30 + _extra;
    shortNoteSection = Dimensions.get('window').height - e.endCoordinates.height - _paddingGif - statusBarHeight;
    this.setState({
      keyboardHeight:e.endCoordinates.height,
      keyboardVisible:true,
      shortNoteSection: shortNoteSection
    })
  }
  _keyboardDidHide(e) {
    this.setState({
      keyboardVisible:false
    })
  }

  _goBack(){
    if(!global.NOTE_COMPONENT.NOTE_INTENT){
      const resetAction = NavigationActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({key:'App', routeName: 'App', params: { page: 1}})],
              });
      this.props.navigation.dispatch(resetAction);
    }else{
      const {goBack} = this.props.navigation;
      goBack();
    }


  }

  componentWillMount(){

  }

  login(){
    let email = this.state.email;
    let password = this.state.password;
    cameraCoApi.login(email,password).then((res) => {
      if(!res){
        alert("There was an error while trying to log you in.");
      }else{
        if(res.success){

          if(!global.NOTE_COMPONENT.NOTE_INTENT){
            const resetAction = NavigationActions.reset({
                      index: 0,
                      actions: [NavigationActions.navigate({key:'App', routeName: 'App', params: { page: 1}})],
                    });
            this.props.navigation.dispatch(resetAction);
          }else{
            global.NOTE_COMPONENT.setState({"isLogged":true});
            const {goBack} = this.props.navigation;
            goBack();
          }



        }else{
          alert(res.reason);
        }


      }


    });

  }

  errorMessage(){
    if(this.state.error != null){
      return(
        <View style={{height:50,justifyContent:'flex-end',paddingBottom:5}}>
          <Text>{this.state.error}</Text>
        </View>
      )
    }else{
      return (
        <View style={{height:50}}>
        </View>
      )
    }
  }

  validateEmail(email){
    if(email.trim() != ''){
      this.setState({email:email});
      this.clearError();
    }else{
      this.setState({error:'Username can not be empty'});
    }
  }

  validatePassword(password){
    if(password.trim() != ''){
      this.setState({password:password});
      this.clearError();
    }else{
      this.setState({error:'Email can not be empty'});
    }
  }

  clearError(){
    if(this.state.error != null){
      this.setState({error:null});
    }
  }

  render(){
    return(
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{flex:1}}>
          </View>
          <View style={{flex:1}}>
            <Text style={styles.header_txt}>
              MY ACCOUNT
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => this._goBack()}
            style={{flex:1,alignItems:'flex-end'}}>
            <Image
                style={{height:30,width:30}}
                source={require('../assets/img/icons/close.png')}
            />
          </TouchableOpacity>
        </View>
        {this.errorMessage()}
        <View style={styles.content_form}>
          <TextInput style={styles.input}
            placeholder={'Email'}
            placeholderTextColor={'white'}
            underlineColorAndroid='transparent'
            autoCapitalize = 'none'
            onChangeText={(email) => this.validateEmail(email)}/>
          <View style={styles.hr}></View>
          <TextInput style={styles.input}
            placeholder={'Password'}
            placeholderTextColor={'white'}
            underlineColorAndroid='transparent'
            secureTextEntry={true}
            autoCapitalize = 'none'
            onChangeText={(password) => this.validatePassword(password)}/>
        </View>

        <TouchableOpacity onPress={() => this.login()}
          style={styles.wrapper_btn}>
          <Text style={styles.txt_btn}>
            Log in
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a5005c',
    padding:20,
  },
  header:{
    height:40,
    flexDirection:'row',
    alignItems:'center'
  },
  header_txt:{
    color:'white',
    textAlign:'center',
    fontSize:16,
  },
  content_form:{
    borderWidth: 1.5,
    borderColor:'white',
    borderRadius:14,
  },
  wrapper_btn:{
    marginTop:30,
    width:100,
    height: 35,
    borderWidth: 1.5,
    borderColor:'white',
    borderRadius:14,
    justifyContent:'center',
    alignSelf:'center'
  },
  txt_btn:{
    color:'white',
    textAlign:'center',
    fontSize:16,
  },
  input:{
    marginLeft: 14,
    height:35,
    color:'white',
    backgroundColor:'pink'
  },
  hr:{
    height:1.5,
    backgroundColor:'white'
  }
});
