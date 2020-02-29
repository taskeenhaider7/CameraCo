import React, { Component } from 'react';
import { Share,Switch,Linking,Alert,Platform,StatusBar,Button,Keyboard,ScrollView, Dimensions,TextInput,StyleSheet, Text, View,Image,TouchableOpacity,AsyncStorage } from 'react-native';

import TopBar from "../components/TopBar";
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import {  NavigationActions } from 'react-navigation';
import { LoginManager } from 'react-native-fbsdk';
import cameraCoApi from "../api/CameraCoApi";


statusBarHeight = getStatusBarHeight();

export default class Account extends React.Component {

  constructor(params){
    super(params);
    this.state = {
      name:'',
      email:'',
      username:'',
      pwd:'',
      error:null,
      lastPlace:'',
      user:'',
      notificationValue:true
    }
  }

  componentDidMount(){
    cameraCoApi.getMe().then((res) => {
      if(res.hasOwnProperty("name")){
        this.setState({user:res,name:res.name,email:res.email,username:"@"+res.username,pwd:"*******",lastPlace:res.latest_place});
      }
    });
    global.ACCOUNT = this;
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


  logout(){
    this.removeUser();
    LoginManager.logOut()
    cameraCoApi.logout().then((res) => {
      if(res){
        const resetAction = NavigationActions.reset({
                  index: 0,
                  actions: [NavigationActions.navigate({key:'Welcome', routeName: 'Welcome'})],
                });
        this.props.navigation.dispatch(resetAction);
      }else{
        alert("There was an error while trying to log you out.");
      }

    });

  }


  _goBlocked(){
     this.props.navigation.navigate({key:'Blocked',routeName:'Blocked'});
  }


  removeUser = async () => {
    try{
      await AsyncStorage.removeItem('user');
    }
    catch(error){
      alert(error);
    }
  }

  setNotifications(value){
    //enable and disable notification
    this.setState({notificationValue:!value})
  }

  shareLink = () => {
     Share.share({
       message: 'Take a look at the app Lyrc',
       url:'https://itunes.apple.com/us/app/fotes/id1375814319?ls=1&mt=8',
       title:'Lyrc'
     }).then(result => console.log(result)).catch(errorMsg => console.log(errorMsg));
  }
  requestVerifyEmail(){
    if(!this.state.is_requesting_verification){
      this.setState({ is_requesting_verification: true});
      cameraCoApi.sendRequestVerifyEmail()
        .then(res=>{
          this.setState({ is_requesting_verification: false});
          if(res.status){
            alert("Great, please review your email to confirm the request");
          }else{
            alert("Sorry, something wrong has happened");
          }
        })
        .catch(err=>{
          this.setState({ is_requesting_verification: false});
          alert("Sorry, something wrong has happened");
        });
    }
  }
  renderAccountVerified(){
    if(!this.state.user.is_account_verified){
      return(
        <View style={styles.container_verify_account}>
          <Text style={styles.txt_message_verify_account}>Please verify your email address. This helps secure your account!</Text>
          <TouchableOpacity
            onPress={()=>this.requestVerifyEmail()}>
            <Text style={styles.txt_btn_verify_account}>VERIFY EMAIL</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }
  render(){
    return(
      <View style={styles.container}>
        <StatusBar hidden={false} />
        <TopBar
          firstBtnImage={'back'}
          firstBtn={() => this._goBack()}
          mainTitle={"Settings"}
          fourthBtnTxt={'Log out'}
          fourthBtnTxtColor={'#ef5e84'}
          fourthBtnTxtNormal={true}
          fourthBtn={() => this.logout()}
        >
        </TopBar>
        <ScrollView>
          {this.renderAccountVerified()}
          <View style={styles.section}>
            <Text style={styles.section_name}> GENERAL </Text>
          </View>

          <TouchableOpacity style={styles.setting} onPress={() => this._goBack()} >
            <View style={styles.wrapperSettings}>
              <View style={[styles.wrapperIcon,{backgroundColor:'#87e3e3'}]}>
                <Image style={styles.icon}
                  source={require('../assets/img/icons/edit.png')}
                />
              </View>
              <Text style={styles.setting_name}> Edit profile </Text>
            </View>
            <Text style={styles.section_txt}> > </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.setting} onPress={this.shareLink}>
            <View style={styles.wrapperSettings}>
              <View style={[styles.wrapperIcon,{backgroundColor:'#5CB4DC'}]}>
                <Image style={styles.icon}
                  source={require('../assets/img/icons/invite.png')}
                />
              </View>
              <Text style={styles.setting_name}> Invite friends </Text>
            </View>
            <Text style={styles.section_txt}> > </Text>
          </TouchableOpacity>

          <View style={styles.setting}>
            <View style={styles.wrapperSettings}>
              <View style={[styles.wrapperIcon,{backgroundColor:'#617FF5'}]}>
                <Image style={styles.icon}
                  source={require('../assets/img/icons/username.png')}
                />
              </View>
              <Text style={styles.setting_name}> Username </Text>
            </View>
            <Text style={styles.section_txt_value}> {this.state.username + '   '} <Text style={styles.section_txt}>></Text> </Text>
          </View>
          <View style={styles.settingLast}>
            <View style={styles.wrapperSettings}>
              <View style={[styles.wrapperIcon,{backgroundColor:'#828BFF'}]}>
                <Image style={styles.icon}
                  source={require('../assets/img/icons/email.png')}
                />
              </View>
              <Text style={styles.setting_name}> Email </Text>
            </View>
            <Text style={styles.section_txt_value}> {this.state.email + '   '} <Text style={styles.section_txt}>></Text> </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.section_name}> PRIVACY</Text>
          </View>
          <TouchableOpacity style={styles.setting}>
            <View style={styles.wrapperSettings}>
              <View style={[styles.wrapperIcon,{backgroundColor:'#7C6AD8'}]}>
                <Image style={styles.icon}
                  source={require('../assets/img/icons/notifications.png')}
                />
              </View>
              <Text style={styles.setting_name}> Notifications </Text>
            </View>
            <Switch
              onValueChange={() => {this.setNotifications(this.state.notificationValue)}}
              value = {this.state.notificationValue}
              />
          </TouchableOpacity>
          <TouchableOpacity style={styles.setting} onPress={() => this._goBlocked()}>
            <View style={styles.wrapperSettings}>
              <View style={[styles.wrapperIcon,{backgroundColor:'#C470D4'}]}>
                <Image style={styles.icon}
                  source={require('../assets/img/icons/block.png')}
                />
              </View>
              <Text style={styles.setting_name}> Blocked users </Text>
            </View>
            <Text style={styles.section_txt}> > </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.setting} onPress={() => Linking.openURL('https://www.lyrcapp.com/privacy')}>
            <View style={styles.wrapperSettings}>
              <View style={[styles.wrapperIcon,{backgroundColor:'#EF5DB0'}]}>
                <Image style={styles.icon}
                  source={require('../assets/img/icons/privacy.png')}
                />
              </View>
              <Text style={styles.setting_name}> Privacy policy </Text>
            </View>
            <Text style={styles.section_txt}> > </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.setting} onPress={() => Linking.openURL('https://www.lyrcapp.com/tos')}>
            <View style={styles.wrapperSettings}>
              <View style={[styles.wrapperIcon,{backgroundColor:'#FF4081'}]}>
                <Image style={styles.icon}
                  source={require('../assets/img/icons/policy.png')}
                />
              </View>
              <Text style={styles.setting_name}> Terms of service </Text>
            </View>
            <Text style={styles.section_txt}> > </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.setting} >
            <View style={styles.wrapperSettings}>
              <View style={[styles.wrapperIcon,{backgroundColor:'#FC5353'}]}>
                <Image style={styles.icon}
                  source={require('../assets/img/icons/permission.png')}
                />
              </View>
              <Text style={styles.setting_name}> Permissions </Text>
            </View>
            <Text style={styles.section_txt}> > </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'white',
    ...ifIphoneX({
            paddingTop:25
        }, {
            paddingTop: statusBarHeight
        })
  },
  header:{
    height:100,
    backgroundColor:'#3a4e6d',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  container_verify_account:{
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderTopColor: '#eaeaea',
    borderTopWidth: 1
  },
  txt_message_verify_account:{
    textAlign: 'center',
    fontSize: 12,
    color: '#808080'
  },
  txt_btn_verify_account:{
    marginTop: 4,
    textAlign: 'center',
    fontSize: 10,
    color: '#ef5e84'
  },
  lastPlace:{
    color:"white",
    fontFamily:"Lato-Light"
  },
  userImage:{
    height:100,
    width:100,
    borderRadius:50,
    backgroundColor:'#e9ecef',
  },
  userName:{
    fontSize:20,
    color:'white',
    fontWeight:'bold',
  },
  section:{
    justifyContent:'center',
    height:46,
    paddingLeft:20,
    paddingRight:20,
    backgroundColor:'#fafafa',
    borderBottomColor:"#eaeaea",
    borderTopColor:"#eaeaea",
    borderBottomWidth: 1,
    borderTopWidth:1,
  },
  setting:{
    height:60,
    borderBottomColor:"#eaeaea",
    borderBottomWidth: 1,
    marginLeft:20,
    marginRight:20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  settingLast:{
    height:60,
    marginLeft:20,
    marginRight:20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  setting_name:{
    color:"#383838",
    fontSize: 15
  },
  section_name:{
    fontSize:15,
    color:"#a4a4a4",
    fontFamily:"Lato-Hairline",
    fontWeight:"bold",
  },
  section_txt:{
    color:"#A4A4A4",
    fontSize:17,
  },
  section_txt_value:{
    color: '#C4C4C4',
    fontSize: 14,
  },
  wrapperIcon:{
    width:30,
    height:30,
    borderRadius:10,
    justifyContent:'center',
    alignItems:'center',
    marginRight:12,
  },
  icon:{
    width:24,
    height:24,
    tintColor:'white'
  },
  wrapperSettings:{
    flexDirection:'row',
    alignItems:'center'
  }

});
