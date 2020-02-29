import React, { Component } from 'react';
import { StatusBar,ActivityIndicator,Alert,Platform,Keyboard,ScrollView, Dimensions,TextInput,StyleSheet, Text, View,Image,TouchableOpacity } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
statusBarHeight = getStatusBarHeight();
import cameraCoApi from "../api/CameraCoApi";
const { height, width} = Dimensions.get('window');
var RNFS = require('react-native-fs');
export default class SignUpOne extends React.Component {

  constructor(params){
    super(params);
    this.state = {
      name:'',
      email:'',
      keyboardVisible:false,
      isValidName:false,
      isDisabled:true,
      isvalid_email:false
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

  next(){
    let name = this.state.name;
    let email = this.state.email;
    if(email != '' && name != ''){
      this.props.navigation.navigate({key:'SignUpTwo',routeName:'SignUpTwo',params:{name:name,email:email}});
    }else{
      this.setState({error:'Name and email can not be empty'});
    }
  }
  checkEmail(email){
    cameraCoApi.check_email(email.toLowerCase()).then((res) => {
      this.setState({
        statusMessage: res.reason,
        isvalid_email:  res.success
      })
    });
  }
  isValidForm(){
    if(this.state.name.trim() != ""){
      if(this.state.isvalid_email){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }
  errorMessage(){
    if(this.state.error != null){
      return(
        <View style={{height:50,justifyContent:'flex-end',paddingBottom:5}}>
          <Text style={{color:"red"}}>{this.state.error}</Text>
        </View>
      )
    }else{
      return (
        <View style={{height:50}}>
        </View>
      )
    }
  }

  clearError(){
    if(this.state.error != null){
      this.setState({error:null});
    }
  }

  renderNextBtn(){
    return (
      <TouchableOpacity onPress={() => this.next()}
        style={[styles.wrapper_btn_pink, this.isValidForm() ? styles.enabledBtn : styles.disabledBtn]}
        disabled={!this.isValidForm()}>
        <Text style={[styles.txt_btn,this.isValidForm() ? styles.enabledTxt : styles.disabledTxt]}>
          NEXT
        </Text>
      </TouchableOpacity>
    )
  }

  renderHeader(){
      return (
        <Text style={styles.appName}>Great start!</Text>
      )
  }

  renderBackBar(){
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
    this.props.navigation.navigate({key:'LoginNew',routeName: 'LoginNew'});
  }

  renderCheckName(){
    if(this.state.name.length == 0){
      return (null);
    }
    else if(this.state.name.trim() != ""){
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

  renderCheckEmail(){
    if(this.state.email.length == 0){
      return (null);
    }
    else if(this.state.isvalid_email){
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
           {this.renderBackBar()}
           <View style={styles.paddingArea}>
            {this.renderHeader()}
             <View style={styles.form}>
               <View style={styles.inputArea}>
                <TextInput
                  style={styles.inputText} autoCapitalize = 'none'
                  placeholder={'Name'}
                  placeholderTextColor={'#ef5d82'}
                  value={this.state.name}
                  returnKeyType={"done"}
                  onChangeText={(name) => {this.setState({name:name})}}
                  >
                </TextInput>
                {this.renderCheckName()}
               </View>
               <View style={styles.inputArea}>
                <TextInput
                  style={styles.inputText} autoCapitalize = 'none'
                  value={this.state.email}
                  placeholder={'Email'}
                  returnKeyType={"done"}
                  placeholderTextColor={'#ef5d82'}
                  onChangeText={(email) => {this.setState({email:email});this.checkEmail(email)}}
                  >
                </TextInput>
                {this.renderCheckEmail()}

               </View>


               {this.renderNextBtn()}

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
