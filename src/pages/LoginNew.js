import React, { Component } from 'react';
import { StatusBar,Alert,Platform,Keyboard, Dimensions,TextInput,StyleSheet, Text, View,Image,TouchableOpacity,AsyncStorage} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import {  NavigationActions } from 'react-navigation';
statusBarHeight = getStatusBarHeight();
import cameraCoApi from "../api/CameraCoApi";
import DialogInput from 'react-native-dialog-input';

export default class LoginNew extends React.Component {

  constructor(params){
    super(params);
    this.state = {
      email:'',
      password:'',
      keyboardVisible:false,
      validateEmail:null,
      validatePassword:null,
      isDisabled:true,
      isDialogVisible: false
    }
  }


  componentDidMount(){
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
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
    const {goBack} = this.props.navigation;
    goBack();
  }


  signUp(){
    this.props.navigation.navigate({key:'SignUpOne',routeName:'SignUpOne'});
  }

  login(){
    let email = this.state.email;
    let password = this.state.password;
    if((email.trim() !== '') && (password.trim !== '') ){
      cameraCoApi.login(email,password).then((res) => {
        console.log("login response", res);
        if(!res){
          alert("There was an error while trying to log you in.");
        }else{
            console.log("login response success boolean", res.success);
          if(res.success){
              this.saveUser();
              const resetAction = NavigationActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({key:'Fotes', routeName: 'Fotes', params: { page: 1,showLoader:true}})],
                      });
              this.props.navigation.dispatch(resetAction);

          }else{
              console.log("login response success boolean", res.success);
            alert(res.reason);
          }
        }
      });
    }else{

    }

  }



  validateEmail(email){
    if(email.trim() != ''){
      this.setState({email:email});
    }else{
      this.setState({validateEmail:false,isDisabled:true});
    }
  }

  validatePassword(password){
    if(password.trim() != ''){
      this.setState({password:password});
    }else{
      this.setState({validatePassword:false,isDisabled:true});
    }
  }


  saveUser(){
    cameraCoApi.getMe().then((response) => {
      if(response.hasOwnProperty('name')){
        let user = JSON.stringify(response);
        AsyncStorage.setItem('user',user);
      }
    }).catch(error=>{
      console.log(error);
    })
  }
  goToResetPassword(){
    this.setState({isDialogVisible: true});
  }
  sendRequestReset(email){
    this.setState({isDialogVisible: false});
    let em = email.toLowerCase();
    cameraCoApi.requestRestPassword(em, (err, res)=>{
      if(err){
        alert("There was an error while trying to make the request");
      }else if(res.status){
        alert("Great, we sent you an email with instructions to reset your password account");
      }else{
        alert("There was an error while trying to make the request");
      }
    });
  }
  renderCheckEmail(){
    if(this.state.validateEmail == null){
      return null
    }else if(this.state.validateEmail){
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
    if(this.state.validatePassword == null){
      return null
    }else if(this.state.validatePassword){
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

  checkEmail(){
    if(this.state.email.trim() != ''){
      this.setState({validateEmail:true});
      if(this.state.password.trim() != ''){
        this.setState({isDisabled:false});
      }
    }else{
      this.setState({validateEmail:false,isDisabled:true});

    }
  }

  checkPassword(){
    if(this.state.password.trim() != ''){
      this.setState({validatePassword:true});
      if(this.state.email.trim() != ''){
        this.setState({isDisabled:false});
      }
    }else{
      this.setState({validatePassword:false,isDisabled:true});
    }
  }

  render(){
    return(
      <View style={styles.container}>
        <DialogInput isDialogVisible={this.state.isDialogVisible}
            title={"Reset password"}
            message={"Write your email"}
            hintInput ={"email"}
            submitInput={ (inputText) => {this.sendRequestReset(inputText)} }
            closeDialog={ () => {this.setState({isDialogVisible:false})}}>
        </DialogInput>
        <StatusBar barStyle={'light-content'}/>

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
              onPress={() => this.signUp()}>
              <Text style={styles.topBarTxt}>
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.paddingArea}>
         <Text style={styles.appName}>Here we go!</Text>
         <View style={styles.form}>
           <View style={styles.inputArea}>
            <TextInput
              style={styles.inputText}
              autoCapitalize='none'
              placeholder={'Email'}
              placeholderTextColor={'#ef5d82'}
              textContentType={'emailAddress'}
              returnKeyType={"done"}
              onChangeText={(email) => this.validateEmail(email)}
              onEndEditing={(email) => this.checkEmail()}>
            </TextInput>
            {this.renderCheckEmail()}
           </View>
             <View style={styles.inputArea}>
              <TextInput
                returnKeyType={"go"}
                onChangeText={(password) => {this.validatePassword(password);this.checkPassword()}}
                style={styles.inputText} secureTextEntry={true} autoCapitalize='none'
                textContentType={'password'}
                placeholderTextColor={'#ef5d82'}
                placeholder={'Password'}
                onEndEditing={() => this.checkPassword()}>
              </TextInput>
              {this.renderCheckPassword()}
           </View>
           <TouchableOpacity onPress={()=> this.goToResetPassword()}>
            <Text style={styles.pwd_text}>Forgot password?</Text>
           </TouchableOpacity>
         </View>
         <TouchableOpacity onPress={() => this.login()}
          style={[styles.wrapper_btn_pink, !this.state.isDisabled ? styles.enabledBtn : styles.disabledBtn]}
          disabled={this.state.isDisabled}>
          <Text style={[styles.txt_btn,!this.state.isDisabled ? styles.enabledTxt : styles.disabledTxt]}>
            LOG IN
          </Text>
         </TouchableOpacity>
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
    alignItems:'center',
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
  inputTitle:{
    color:"white",
    fontSize:16,
    alignSelf: 'stretch',
  },
  inputText:{
    flex:1,
    paddingRight:5,
    backgroundColor:'white',
    color:'gray',
    fontSize:16,
  },
  wrapper_btn_pink:{
    height: 50,
    width:250,
    borderWidth: 1,
    borderRadius:10,
    justifyContent:'center',
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
  pwd_text:{
    color:"white",
    paddingLeft:10,
    paddingRight:10,
  },
  header:{
    flexDirection:'row',
    alignItems:'center'
  },
  header_txt:{
    color:'white',
    textAlign:'center',
    fontSize:16,
  },
  txt_btn:{
    textAlign:'center',
    fontSize:16,
    fontWeight:'bold',
  },
  icon:{
    flex:1,
    paddingTop:statusBarHeight,
    paddingLeft:15,
    paddingRight:15
  },
  topBarTxt:{
    color:'white',
    fontSize:18
  },
  iconSmall:{
    height:30,
    width:30,
    alignSelf:'center',
  }
});
