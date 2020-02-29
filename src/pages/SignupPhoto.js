import React, { Component } from 'react';
import { getStatusBarHeight } from 'react-native-status-bar-height';
statusBarHeight = getStatusBarHeight();
import {
  Button,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Text,
  View
} from 'react-native';
import cameraCoApi from "../api/CameraCoApi";
import {  NavigationActions } from 'react-navigation';
import ImageResizer from 'react-native-image-resizer';
export default class SignupPhoto extends Component {

  constructor(props){
    super(props);
    const {state} = this.props.navigation;
    this.foteTakenCallback     = this.foteTakenCallback.bind(this);
    this.finishedUpdatingPhoto = this.finishedUpdatingPhoto.bind(this);
    this.state = {
      me:null,
      photo:"",
    }
  }
  componentDidMount(){
    cameraCoApi.getMe().then((res) => {
      if(res.hasOwnProperty("name")){
        this.setState({me:res,photo:res.photo})
      }
    });
  }
  onPressNext(){
    this.props.navigation.navigate({key:'PhoneVerification',routeName:'PhoneVerification',});

  }
  finishedUpdatingPhoto(){
    cameraCoApi.getMe().then((res) => {
      if(res.hasOwnProperty("name")){
        this.setState({photo:res.photo+ "?date="+Date.now(),
                      name:res.name,
                      email:res.email,
                      username:res.username,
                      });
      }
    });
  }
  renderImageUser(){
    if(this.state.me != null){
      return(
        <View styles={styles.areaCamera}>
          <Image style={styles.userImage}
            source={{uri:this.state.photo+"?date="+Date.now()}}
          />
          {this.renderCameraIcon(this.state.myProfile)}
        </View>
      )
    }else{
      let image = require('../assets/img/icons/profile24.png');
      return(
        <View styles={styles.areaCamera}>
          <Image style={styles.userImage}
            resizeMode={'center'}
            source={image}
          />
          {this.renderCameraIcon()}
        </View>
      )
    }
  }
  launchCamera(){
    const resetAction = NavigationActions.reset({
              actions: [NavigationActions.navigate(
                            {key:'FotesCamera', routeName: 'FotesCamera'})]}
                          );
    params = {
      callback: this.foteTakenCallback.bind(this),
      mainBtnTxt: 'Save',
      disableVideo:true
    }
    this.props.navigation.navigate({key:'FotesCamera',routeName:'FotesCamera',params});
  }
  foteTakenCallback(p){
    // alert(p.uri);
    this.setState({photo:"https://i.pinimg.com/originals/b0/0a/15/b00a153720557ea5f440d5e02517bc9a.gif"});

    ImageResizer.createResizedImage(p.uri, 200, 200, "PNG", 85, 0, "profile").then((response) => {
      cameraCoApi.uploadProfilePhoto(response.uri,this.finishedUpdatingPhoto);
    }).catch((err) => {
      alert("Sorry, we couldn't update your profile picture");
      // Oops, something went wrong. Check that the filename is correct and
      // inspect err to get more details.
    });

  }
  renderCameraIcon(){
      return(
        <TouchableOpacity onPress={ () => this.launchCamera()}
          style={styles.cameraIcon}>
          <Image style={{height:26,width:26,tintColor:'white'}}
            source={require('../assets/img/icons/camera.png')}
          />
        </TouchableOpacity>
      )

  }
  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.message}>
          <Text style={styles.title}>Add a Profile Photo</Text>
          <Text style={styles.subtitle}>Smile!</Text>
        </View>
          <View style={{alignItems:"center"}}>
          {this.renderImageUser(this.state.photo)}
          </View>
         <Text style={[this.state.isvalid_form ? {color:"green",marginTop:20}:{color:"red",marginTop:20}]}>{this.state.statusMessage}</Text>
         <View style={{flex:.1}}>
         </View>
         <TouchableOpacity onPress={() => this.onPressNext()} activeOpacity={0.6}   title="next" style={[styles.button]}>
            <Text style={styles.buttonText}>Finish</Text>
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
  },
  cameraIcon:{
      backgroundColor:'#ef5d82',
      height:40,
      width:40,
      marginTop:-30,
      marginLeft:70,
      borderRadius:20,
      justifyContent:'center',
      alignItems:'center',
      shadowColor: 'gray',
      shadowOffset: { width: 0, height: 0.5 },
      shadowOpacity: 0.2,
      shadowRadius: 0.5,
      elevation: 0.5
  },
  areaCamera:{
    backgroundColor:"red",
    alignItems:"center"

  },
  userImage:{
    height:100,
    width:100,
    borderRadius:50,
    backgroundColor:'#e9ecef',
  },

})
