import React, { Component } from 'react';
import { StatusBar,ActivityIndicator,Alert,Platform,Keyboard,ScrollView, Dimensions,TextInput,StyleSheet, Text, View,Image,TouchableOpacity } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import {  NavigationActions } from 'react-navigation';
statusBarHeight = getStatusBarHeight();
import cameraCoApi from "../api/CameraCoApi";
const { height, width} = Dimensions.get('window');
export default class SignUpTwo extends React.Component {

  constructor(params){
    super(params);
    const {state} = this.props.navigation;
    this.state = {
      name:state.params.name,
      email:state.params.email,
      username:"",
      pwd:'',
      keyboardVisible:false,
      showIndicator:false,
      isvalidUsername:false,
      isvalidPassword:false,
      validatePassword:null,
      isDisabled:true,
    }
  }

  componentDidMount(){
      this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
      this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
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

  _goBack(){
      const {goBack} = this.props.navigation;
      goBack();
  }

  signUp(){
    this.setState({showIndicator:true});
    let name = this.state.name;
    let email = this.state.email;
    let username = this.state.username;
    let pwd = this.state.pwd;

    if((username != '') && (pwd!='')){
      cameraCoApi.signUp(name,email,username,pwd).then((res) => {
        if(!res){
          alert("There was an error while trying to create your account.");
          this.setState({showIndicator:false});
        }else{
          if(res.success){
              const resetAction = NavigationActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({key:'Fotes', routeName: 'Fotes', params: { page: 1,showLoader:false}})],
                      });
              this.props.navigation.dispatch(resetAction);
          }else{
            alert(res.reason);
          }
          this.setState({showIndicator:false});
        }
      });
    }else{
      this.setState({error:'Username and password can not be empty'});
    }
  }
  checkUsername(username){
    cameraCoApi.check_username(username.toLowerCase()).then((res) => {
      this.setState({
        statusMessage: res.reason,
        isvalidUsername:  res.success
      })
    });
  }

  validatePwd(pwd){
    if(pwd.trim() != ''){
      this.setState({pwd:pwd});
    }else{
      this.setState({validatePassword:false,isDisabled:true});
    }
  }


  renderHeader(){
      return (
        <Text style={styles.appName}>Great start!</Text>
      )
  }
  isValidForm(){
    return (this.state.isvalidUsername && this.state.isValidPassword);
  }
  renderSignButton(){
    if(!this.state.showIndicator){
      return (
        <TouchableOpacity onPress={() => this.signUp()}
          style={[styles.wrapper_btn_pink, this.isValidForm() ? styles.enabledBtn : styles.disabledBtn]}
          disabled={!this.isValidForm()}>
         <Text style={[styles.txt_btn,this.isValidForm() ? styles.enabledTxt : styles.disabledTxt]}>SIGN UP</Text>
        </TouchableOpacity>
      )
    }else{
      return(
        <View style={styles.wrapper_btn_pink}>
          <ActivityIndicator size="small" color="white" />
        </View>
      )
    }
  }

  renderBack(){
    return(
      <View style={styles.backBar}>
        <View style={{flex:1}}>
          <TouchableOpacity style={{height:50,justifyContent:'center',paddingLeft:15}}
            onPress={() => this._goBack()}>
            <Image style = {styles.iconBack}
               source = {require('../assets/img/icons/left-arrow.png')}>
            </Image>
          </TouchableOpacity>
        </View>
        <View style={{flex:1,alignItems:'flex-end'}}>
          <TouchableOpacity style={{height:50,justifyContent:'center',paddingLeft:20,paddingRight:20}}
            onPress={() => this.login()}>
            <Text style={styles.topBarTxt}>
              Log in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  login(){
    this.props.navigation.navigate({key:'LoginNew',routeName:'LoginNew'});
  }

  checkPassword(password){
    if(password == ""){
      this.setState({
        statusMessage: "Your password can not empty.",
        isValidPassword:  false
      })
    }else if(password.includes(" ")){
      this.setState({
        statusMessage: "Your password can not contain empty spaces.",
        isValidPassword:  false
      })
    }else if(password.length <= 4){
      this.setState({
        statusMessage: "Your password can not be shorter than 5 characters.",
        isValidPassword:  false
      })
    }else{
      this.setState({
        statusMessage: "",
        isValidPassword:  true
      })
    }

  }
  renderCheckUsername(){
    if(this.state.username.length == 0){
      return (null);
    }else if(this.state.isvalidUsername){
      return(
        <Image style = {[styles.iconSmall,{tintColor:'#ef5d82'}]}
           source = {require('../assets/img/icons/check.png')}
        />
      )
    }else{
      return(
        <Image style = {[styles.iconSmall,{tintColor:'red'}]}
           source = {require('../assets/img/icons/closeBlackThin.png')}
        />
      )
    }
  }

  renderCheckPassword(){
    if(this.state.pwd.length == 0){
      return null
    }else if(this.state.isValidPassword){
      return(
        <Image style = {[styles.iconSmall,{tintColor:'#ef5d82'}]}
           source = {require('../assets/img/icons/check.png')}
        />
      )
    }else{
      return(
        <Image style = {[styles.iconSmall,{tintColor:'red'}]}
           source = {require('../assets/img/icons/closeBlackThin.png')}
        />
      )
    }
  }

  render(){
    return(
      <View style={styles.container}>
        <StatusBar barStyle="light-content"/>

           {this.renderBack()}
           <View style={styles.paddingArea}>

            {this.renderHeader()}

             <View style={styles.form}>
               <View style={styles.inputArea}>
                <TextInput
                  style={styles.inputText} autoCapitalize = 'none'
                  placeholder={'Username'}
                  onChangeText={(username) => {this.setState({username:username});this.checkUsername(username)}}
                  value={this.state.username}
                  returnKeyType={"done"}
                  placeholderTextColor={'#ef5d82'}
                  >
                </TextInput>
                {this.renderCheckUsername()}

               </View>
               <View style={styles.inputArea}>
                <TextInput
                    style={styles.inputText} secureTextEntry={true} autoCapitalize = 'none'
                    placeholder={'Password'}
                    placeholderTextColor={'#ef5d82'}
                    value={this.state.pwd}
                    returnKeyType={"done"}
                    onChangeText={(pwd) => {this.setState({pwd:pwd});this.checkPassword(pwd)}}

                    >

                </TextInput>
                {this.renderCheckPassword()}
               </View>

              {this.renderSignButton()}

             </View>
           </View>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#ef5d82'
  },
  appName:{
    color: "white",
    fontSize:36,
    textAlign:'center',
    fontFamily:"Typo Round Bold Demo"
  },
  backBar:{
    height:50,
    marginTop:statusBarHeight,
    backgroundColor:'transparent',
    flexDirection: 'row',
    alignItems:'center'
  },
  iconBack:{
    height: 26,
    width: 26,
  },
  paddingArea:{
    padding:50,
  },
  form:{
    marginTop:30,
    marginBottom:30,
    alignItems: 'center'
  },
  inputArea:{
    height:50,
    flexDirection:'row',
    backgroundColor:"white",
    paddingLeft:25,
    paddingRight:25,
    borderRadius:25,
    marginBottom:20,
  },
  inputText:{
    flex:1,
    paddingRight:10,
    backgroundColor:'white',
    color:'gray',
    fontSize:16,
  },
  wrapper_btn_pink:{
    height: 50,
    width:250,
    borderWidth: 1,
    borderColor:'#f7a4ba',
    backgroundColor:'transparent',
    borderRadius:10,
    justifyContent:'center',
    marginTop:40
  },
  txt_btn:{
    color:'#f7a4ba',
    textAlign:'center',
    fontSize:16,
    fontWeight:'bold',
  },
  topBarTxt:{
    color:'white',
    fontSize:18
  },
  iconSmall:{
    height:30,
    width:30,
    alignSelf:'center',
  },
  disabledBtn:{
    borderColor:'#f7a4ba',
    backgroundColor:'transparent',
  },
  enabledBtn:{
    borderColor:'#ffecf1',
    backgroundColor:'#ffecf1'
  },
  disabledTxt:{
    color:'#f7a4ba',
  },
  enabledTxt:{
    color:'#ef5d82',
  },
});
