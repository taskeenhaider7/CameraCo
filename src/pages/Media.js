import React, { Component } from 'react';
import { AsyncStorage,Alert,Platform, Dimensions,TextInput,StyleSheet, Text, View,FlatList,Image,TouchableOpacity,StatusBar } from 'react-native';
import Feed from "./Feed";
import { isIphoneX } from 'react-native-iphone-x-helper'
import { ifIphoneX } from 'react-native-iphone-x-helper'
import { getStatusBarHeight } from 'react-native-status-bar-height';
statusBarHeight = getStatusBarHeight();
import cameraCoApi from "../api/CameraCoApi";
const { height, width} = Dimensions.get('window');
import TopBar from '../components/TopBar';
import Notifications from '../components/Notifications';

export default class Media extends Component {

  constructor(params){
    super(params);
    this.state = {
      mode:"list",
      numColumns:1,
      me:{},
      show_notifications:false,
      new_notification:false
    }
  }

  componentDidMount(){
    cameraCoApi.getMe().then((res) => {
      if(res.hasOwnProperty('uid')){
        this.setState({me:res});
      }
    });
  }
  onNewMessageReceived(msg){
    this.topbar.onNewMessageReceived(msg)
  }
  onNewNotificationUpdateReceived(msg){
    if(this.hasOwnProperty("notifications")){
      try{
        this.notifications.onNewMessage(msg)
      }catch(ex){ //TODO: what to do when notifications is null?

      }
    }
    this.setState({new_notification:true});
  }
  renderContent(){
    if(this.state.show_notifications){
      return(
        <Notifications
                ref={ref => {
                  this.notifications = ref;
                }}
                navigation={this.props.navigation}
                onGridItemPressed={this.props.onGridItemPressed} //Go to fote view
                >
              </Notifications>
      )
    }else{
      return(
        <Feed onSignUpPressed={ this.props.onSignUpPressed}
              onCommentsPressed={this.props.onCommentsPressed}
              onGoChat={this.props.onGoChat}
              onPlacePressed={this.props.onPlacePressed}
              mode={this.state.mode}
              extraData={this.state}
              numColumns={this.state.numColumns}
              onGridItemPressed={this.props.onGridItemPressed} //Go to fote view
              onUserPressed ={this.props.onUserPressed}
              currentPage={this.props.currentPage}
              reloadFeed={this.props.reloadFeed}
              >
        </Feed>
      )
    }

  }

  onGridPressed(){
    this.setState({
      mode:"grid",
      numColumns:3,
      show_notifications:false
    })
  }

  onListPressed(){
    this.setState({
      mode:"list",
      numColumns:1,
      show_notifications:false
    })
  }

  goCreateConversations(){
    this.props.onCreateConversationPressed();
  }

  openProfile(){
    this.setState({show_notifications:false});
    this.props.navigation.navigate({
      key:'FeedProfile',
      routeName:'FeedProfile',
      params:{user:this.state.me,showSettings:true,isBlocked:false}
    });
  }

  openNotifications(){
    this.setState({new_notification:false,show_notifications:true});
  }
  goToSearchView(){
    this.props.navigation.navigate({
      key:'SearchView',
      routeName:'SearchView',
    });
  }
  renderTopBar(){
      v = ""
      this.state.new_notification ? thirdImage = "notification_ring" : thirdImage ="notification";
      if((this.state.show_notifications) || (this.state.mode == 'grid')){
        return(
          <TopBar
            profileImage={true}
            firstBtnImage={this.state.me.photo}
            firstBtn={() => this.openProfile()}
            secondBtnImage={'list'}
            secondBtn={() => this.onListPressed()}
            thirdBtn={() => this.openNotifications()}
            thirdBtnImage={(thirdImage)}
            thirdBtnColor={'#5cb4dc'}
            fourthBtnImage={'chat'}
            fourthBtn={() => this.goCreateConversations()}
            mainTitle={'Notifications'}
          >
          </TopBar>
        )
      }else{
          return(
            <TopBar
              profileImage={true}
              firstBtnImage={this.state.me.photo}
              firstBtn={() => this.openProfile()}
              secondBtnImage={'grid'}
              secondBtn={() => this.onGridPressed()}
              thirdBtn={() => this.openNotifications()}
              thirdBtnImage={(thirdImage)}
              fourthBtnImage={'chat'}
              fourthBtn={() => this.goCreateConversations()}
              mainTitle={'Lyrc'}
              onMiddleButton={()=>this.goToSearchView()}
              isFeed={true}
              ref={ref => {
                this.topbar = ref;
              }}
            >
            </TopBar>
          )
      }
  }

  goToCamera(){
    this.props.onCameraPressed();
  }

  render() {
    return (

      <View style={styles.container} >
        <StatusBar backgroundColor={'white'} hidden={false} />
        {this.renderTopBar()}
        {this.renderContent()}
        <TouchableOpacity style={styles.actionButton}
          onPress={() => this.goToCamera()}>
          <Image
            style={styles.addButton}
            source={require('../assets/img/icons/audio.png')}
          />
        </TouchableOpacity>
      </View>


    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    ...ifIphoneX({
            paddingTop:25
        }, {
            paddingTop: statusBarHeight
        })
  },
  actionButton:{
    height:50,
    width:50,
    borderRadius:25,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:'#ef6185',
    position:'absolute',
    bottom:50,
    right:20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  addButton:{
    height:30,
    width:30,
    tintColor:'white'
  },
});
