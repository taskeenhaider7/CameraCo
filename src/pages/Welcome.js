import React from 'react';
import { StatusBar,Alert,ImageBackground,Platform,Keyboard,ScrollView, Dimensions,TextInput,StyleSheet, Text, View,Image,TouchableOpacity,AsyncStorage} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import {  NavigationActions } from 'react-navigation';
statusBarHeight = getStatusBarHeight();
import cameraCoApi from "../api/CameraCoApi";
import { LoginButton,AccessToken,LoginManager } from 'react-native-fbsdk';
import FotesLoader from "../components/FotesLoader";
import CloudsVisualization from "../components/CloudsVisualization";
export default class Welcome extends React.Component {

  constructor(params){
    super(params);
    this.state = {
      email:'',
      password:'',
      error:null,
      keyboardVisible:false,
      appReady: false,
      rootKey: Math.random(),
    }
    this._image = require('../assets/img/assets/fotes.png');
    this.loginFb    = this.loginFb.bind(this);
  }

  componentDidMount(){
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    this.resetAnimation();

  }

  resetAnimation() {
    this.setState({
      appReady: false,
      rootKey: Math.random()
    });

    setTimeout(() => {
      this.setState({
        appReady: true,
      });
    }, 1000);
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

  signUp(){
    this.props.navigation.navigate({key:'SignUpOne',routeName:'SignUpOne'});
  }

  login(){
    this.props.navigation.navigate({key:'LoginNew',routeName:'LoginNew'});
  }

  errorMessage(){
    if(this.state.error != null){
      return(
        <View style={{height:50,justifyContent:'flex-end',paddingBottom:5}}>
          <Text style={{color:'red'}}>{this.state.error}</Text>
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
      this.setState({error:'Email can not be empty'});
    }
  }

  validatePassword(password){
    if(password.trim() != ''){
      this.setState({password:password});
      this.clearError();
    }else{
      this.setState({error:'Password can not be empty'});
    }
  }

  clearError(){
    if(this.state.error != null){
      this.setState({error:null});
    }
  }

  saveUser(){
    cameraCoApi.getMe().then((response) => {
      if(response.hasOwnProperty('name')){
        let user = JSON.stringify(response);
        // alert(user);
        AsyncStorage.setItem('user',user);
      }
    })
  }
  loginFb(fbToken){
    cameraCoApi.loginFb(fbToken).then((res) => {
      if(!res){
        alert("There was an error while trying to log you in.");
      }else{
          alert("Success");
        if(res.success){
            this.saveUser();
            const resetAction = NavigationActions.reset({
                      index: 0,
                      actions: [NavigationActions.navigate({key:'Fotes', routeName: 'Fotes', params: { page: 1,showLoader:true}})],
                    });
            this.props.navigation.dispatch(resetAction);

        }else{
          console.log("res login fb");
          console.log(res);
          LoginManager.logOut()

          alert(res.reason);
        }


      }


    });

  }
  renderLoader(){//if necesary
    if(true){
      return (<FotesLoader
                isLoaded={this.state.appReady}
                >
              </FotesLoader>)
    }else{
      return (null);

    }
  }

  handleFacebookLogin () {
    welcome = this;
   LoginManager.logInWithPermissions(['public_profile', 'email',]).then(
     function (result) {
       if (result.isCancelled) {
         console.log('Login cancelled')
       } else {
         console.log('Login success with permissions: ' + result.grantedPermissions.toString());
         AccessToken.getCurrentAccessToken().then(
          (data) => {
            console.log(data);
            welcome.loginFb(data.accessToken.toString());
          }
        )
       }
     },
     function (error) {
       console.log('Login fail with error: ' + error)
     }
   )
  }
  render(){
    return(
      <View key={this.state.rootKey} style={styles.root}>
        <CloudsVisualization></CloudsVisualization>
        {this.renderLoader()}
        <View style={styles.container}>
          <StatusBar barStyle="light-content"/>

          <View style={styles.topBar}>
            <View style={{flex:1}}>
              <Image style={{height:26}}
              />
            </View>
            <View style={{flex:1,alignItems:'center'}}>
              <Text style={styles.topBarMain}>
                Lyrc
              </Text>
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

          <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <Image style={{height:80,width:120,resizeMode:'contain'}}
              source={require('../assets/img/assets/logoWhite.png')}/>
            <Text style={styles.appSlogan}>Your Voice, Your World</Text>
          </View>

          <View style={{alignItems:'center',paddingBottom:50}}>

              <TouchableOpacity style={styles.facebookBtn} onPress={() => this.handleFacebookLogin()} >
                <Image style={styles.facebookImage}
                  source={require('../assets/img/icons/facebook.png')}/>
                <Text style={styles.facebookTxt}>
                  Sign up with Facebook
                </Text>
              </TouchableOpacity>


              <TouchableOpacity onPress={() => this.signUp()} style={styles.wrapper_btn_pink}>
                <Text style={styles.topBarTxt}>
                  Sign up with email
                </Text>
              </TouchableOpacity>
          </View>
          <Text style={styles.txtBottom}>
            By continuing you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  root:{
    flex:1
  },
  container: {
    flex: 1,
    backgroundColor: '#ef5d82'
  },
  topBar:{
    height:50,
    flexDirection:'row',
    alignItems:'center',
    marginTop:statusBarHeight,
    backgroundColor:'transparent',
  },
  topBarTxt:{
    color:'white',
    fontSize:18
  },
  topBarMain:{
    color:'white',
    fontSize:34,
    fontWeight:'bold',
    fontFamily:"Typo Round Bold Demo"
  },
  topBarIcon:{
    height:26,
    width:26
  },
  wrapper_btn:{
    marginTop:20,
    height: 50,
    width:300,
    borderWidth: 1,
    borderColor:'#3a4e6d',
    backgroundColor:'#3a4e6d',
    borderRadius:8,
    justifyContent:'center',
  },
  wrapper_btn_pink:{
    height: 40,
    marginTop:20,
    paddingLeft:15,
    paddingRight:15,
    backgroundColor:'transparent',
    justifyContent:'center',
  },
  wrapperBtnWhite:{
    marginTop:10,
    height: 50,
    backgroundColor:'white',
    borderRadius:8,
    justifyContent:'center',
    alignSelf:'flex-end'
  },
  txtBtnWhite:{
    color:'#8157d1',
    textAlign:'center',
    fontSize:16,
  },
  txt_btn:{
    color:'white',
    textAlign:'center',
    fontSize:16,
    fontWeight:'bold',
  },
  input:{
    height:50,
    color:'#8157d1',
    borderColor:'#c8aee8',
    borderWidth:1,
    borderRadius:8,
    paddingLeft:10,
    paddingRight:10
  },
  hr:{
    height:1.5,
    backgroundColor:'white'
  },
  background:{
    flex:1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  appName:{
    color: "white",
    fontSize:80,
    fontWeight:"bold",
    fontFamily:"Lato-Bold"
  },
  appSlogan:{
    color:"white",
    fontSize:16,
    fontFamily:"Lato-Light",
    marginTop:20
  },
  shadow:{
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 2
  },
  loadingBackgroundStyle: {
    backgroundColor: '#ef5d82',
  },
  txtBottom:{
    textAlign:'center',
    fontSize:11.5,
    color:'white',
    paddingBottom:20
  },
  facebookBtn:{
    height:50,
    width:250,
    borderRadius:25,
    alignItems:'center',
    justifyContent:'space-between',
    paddingLeft:30,
    paddingRight:30,
    flexDirection:'row',
    backgroundColor:'#f5f5f5'
  },
  facebookTxt:{
    color:'#3a4e6d',
    fontSize:15
  },
  facebookImage:{
    height:26,
    width:26,
    tintColor:'#3b5998'
  }

});
