import React, { Component } from 'react';
import {
  AsyncStorage,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  StatusBar,
  PushNotificationIOS,
  Alert
} from 'react-native';
import cameraCoApi from "../api/CameraCoApi";
import { ifIphoneX } from 'react-native-iphone-x-helper'
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { NavigationActions,StackNavigator} from 'react-navigation';
import TopBar from '../components/TopBar';
import ModalFollow from '../components/ModalFollow';


const statusBarHeight = getStatusBarHeight();
const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

export default class CreateConversation extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      conversations: [],
      searchResults:false,
      me:{},
      refreshingList:false,
      selectId:'',
      selectName:'',
      selectIndex:null
    }
  }

  componentDidMount(){
    cameraCoApi.getMe().then((res) => {
      if(res.hasOwnProperty("uid")){
        this.setState(
          {
            me:res
          }, () =>{
            cameraCoApi.getConversations().then((res) => {
              if(res.success){
                this.setState({'conversations':res.response}, () => {
                    this.loadNewMessages();
                });
              }
            });
          }
        )


      }
    });
    this.loadConversationsList();

  }


  _keyExtractor = (item, index) => index;

  onUserSelected(id,title,photo,item,conversation){
    if(this.state.searchResults){
      cameraCoApi.createConversation(id).then((res) => {
        if(res.success){
          this.props.navigation.navigate({key:'Conversation',routeName:'Conversation',
            params:{conversationId:res.response.dmId, title:title, photo:photo}});
        }
      })
    }else{
      this.clearConversation(id);
      // this.loadNewMessages();
      this.props.navigation.navigate({key:'Conversation',routeName:'Conversation',
        params:{conversationId:id, title:title, photo:photo}});
    }
  }
  async persistMessage(msg){
    const newMessages = await AsyncStorage.getItem('newMessagesConversationList'); //read new messages list
    if(JSON.parse(newMessages) == null){
      _newMessagesArray = [msg]; //if there are no new messages, create a new list with the msg item
    }else{
      _newMessagesArray = JSON.parse(newMessages) //append new message to list
      _newMessagesArray.push(msg)
    }
    await AsyncStorage.setItem('newMessagesConversationList', JSON.stringify(_newMessagesArray));
  }
  async clearMessages(){
    this.setState({newMessageReceived:false});
    await AsyncStorage.setItem('newMessagesConversationList', JSON.stringify([]));
  }
  async clearConversation(dm_id){
    const newMessages = await AsyncStorage.getItem('newMessagesConversationList'); //read new messages list
    if(JSON.parse(newMessages) != null){
      _newMessagesArray = JSON.parse(newMessages) //remove items from list with the current dm_id
      _newMessagesArray = _newMessagesArray.filter(conversation => conversation.dm_id != dm_id);
      PushNotificationIOS.setApplicationIconBadgeNumber(_newMessagesArray.length);
      await AsyncStorage.setItem('newMessagesConversationList', JSON.stringify(_newMessagesArray));
      _conversations = this.state.conversations;
      _conversations.forEach(function(c){
        if(c._id == dm_id){
          c.messages.forEach(function(cc){
            delete cc.is_new;
          })
        }
      });
      this.setState({conversations:_conversations})
    }
  }
  async loadNewMessages(){
    const newMessages = await AsyncStorage.getItem('newMessagesConversationList'); //read new messages list
    if(JSON.parse(newMessages) != null){ //if the list is null or not empty, set the red dot icon
      if (JSON.parse(newMessages).length > 0) { //update list when opening the view
        _conversations = this.state.conversations;
        //update all
        JSON.parse(newMessages).forEach(function(msg){ // GIVE ME THAT O(n2)
          _conversations.forEach(function(c){
            if(c._id == msg.dm_id){
              c.messages.push(msg)
            }
          });

        });
        this.setState({conversations:_conversations})
      }
    }
  }
  //conversations list
  async saveConversationsList(conversations){
    await AsyncStorage.setItem('conversationsList', JSON.stringify(conversations));
  }
  async loadConversationsList(){
    const conversationsList = await AsyncStorage.getItem('conversationsList'); //read new messages list
    if(JSON.parse(conversationsList) != null){ //if the list is null or not empty, set the red dot icon
      if (JSON.parse(conversationsList).length > 0) { //update list when opening the view
        this.setState({conversations:JSON.parse(conversationsList)})
      }
    }
  }
  onNewMessageReceived(msg){
    msg["is_new"] = true;
    _conversations = this.state.conversations;
    _conversations.forEach(function(c){
      if(c._id == msg.dm_id){
        c.messages.push(msg)
      }
    });
    this.setState({conversations:_conversations})
    this.persistMessage(msg);

  }
  getDate(date){
    let dateClient = new Date(date);
    let dateNow = new Date();
    if( dateClient.getFullYear() == dateNow.getFullYear() &&
        dateClient.getMonth() == dateNow.getMonth() &&
        dateClient.getDate() == dateNow.getDate()){
      return this.getFormatTime(dateClient);
    }
    if(dateClient.getMonth() == dateNow.getMonth()){
      let diff = dateNow.getMonth() - dateClient.getMonth();
      return diff > 1 ? this.getFormatDate(dateClient) : "Yesterday";
    }
    return this.getFormatDate(dateClient);
  }
  getFormatTime(date){
    let hours = date.getHours();
    let minutes = date.getMinutes();
    return this.addZero(hours > 12 ? hours - 12 : hours)+":"+this.addZero(minutes)+(hours>12 ? "pm" : "am");
  }
  getFormatDate(date){
    return months[date.getMonth()]+" "+date.getDate();
  }
  addZero(value){
    return value < 10 ? "0"+value : value;
  }
  renderUser(user,index){
    let item;
    let _title;
    let lastMessage = null;
    let lastMessageTime = '';
    if(this.state.searchResults){
      item = user;
      _title = user.username;
      if(!user.hasOwnProperty('photo')){
        item.photo='';
      }
    }else{
      item = {  uid:user._id, photo:'',last_seen:null};
      if(user.conversation_image != null){
        item.photo = user.conversation_image;
      }
      user.participants.forEach(function(p){
          if(user.title == p.name){
            if(p.hasOwnProperty("last_seen")){
              item.last_seen = p.last_seen;
            }
          }

      });
      _title = user.title;
      if(user.hasOwnProperty('messages')){
        let msgs = user.messages;
        if(msgs.length > 0){
          let msg = msgs[msgs.length - 1];
          // alert(JSON.stringify(msg));
          lastMessage = msg;
          lastMessageTime = this.getDate(msg.creation_date);
        }
      }
    }

    return(
      <TouchableOpacity style={styles.resultsWrapper}
        onPress={() => this.onUserSelected(item.uid,_title,item.photo,user,item)}
        delayLongPress={1000}
        onLongPress={() => this.showModal(item.uid,_title,index)}>

        {this.renderImageUser(item)}
        <View style={{flex:1,marginLeft:15}}>
          <Text style={{fontSize:16,fontWeight:"bold"}}>{_title}</Text>
          {this.renderLastMessage(lastMessage)}
        </View>
        <Text style={styles.txt_time_last_msg}>{lastMessageTime}</Text>
      </TouchableOpacity>
    )
  }

  renderResult(){
    return(
      <FlatList
        data={this.state.conversations}
        refreshing={this.state.refreshingList}
        onRefresh={this._handleRefresh}
        extraData={this.state}
        keyExtractor={this._keyExtractor}
        renderItem={({item,index}) => this.renderUser(item,index)}
      />
    )
  }

  searchUser(name){
    if(name.trim() != ''){
      cameraCoApi.search(name).then((res) => {
        if(res){
          this.setState({'conversations':res,'searchResults':true});
        }
      });
    }
  }

  renderImageUser(item){
      _color = "gray"
      if(item.hasOwnProperty("last_seen")){
        d = new Date(item.last_seen);
        ago = (Date.now () - item.last_seen) / 1000;
        if(ago / 60  < 5){
          _color = "#42b72a";
        }
      }
      return(
        <View style={styles.imageHolder}>
          <Image style={styles.userImage}
            resizeMode={'center'}
            source={{uri:item.photo}}
          />
          <View style={{backgroundColor:_color,width:15,height:15,borderColor:"white",borderWidth:2,borderRadius:7.5,position:"absolute",right:0,top:29}}>

          </View>

        </View>
      )
  }

  _onProfilePressed(){
    this.props.navigation.navigate({
      key:'FeedProfile',
      routeName:'FeedProfile',
      params:{user:this.state.me,showSettings:true,isBlocked:false}
    });
  }

  goToSearch(){
    this.textInput.blur();
    this.props.navigation.navigate({key:'Search',routeName:'Search'});
  }

  _onFeedPressed(){
    const resetAction = NavigationActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({key:'Fotes', routeName: 'Fotes', params: { page: 1,showLoader:false}})],
            });
    this.props.navigation.dispatch(resetAction);
  }

  renderLastMessage(msg){
    if(msg != null){
      _isNew = msg.hasOwnProperty('is_new') ? true : false;

      if(msg.hasOwnProperty('media')){
        let txt,image;
        if(msg.media.length > 0){
          if(msg.media[0].mimetype == 'video/quicktime'){
            txt = 'Video';
            image = require('../assets/img/icons/video.png');
          }else{
            txt = 'Photo';
            image = require('../assets/img/icons/photo.png');
          }
          if(msg.message != ''){
            txt = msg.message;
          }
          return(
            <View style={{flexDirection:'row',alignItems:'center',paddingTop:5}}>
              <Image style={{height:16,width:16,tintColor:'#848484'}}
                source={image}
              />
              <Text style={[{fontSize:14,paddingLeft:5},_isNew ? {fontWeight:"900",color:"black"}:{fontWeight:"normal",color:'#848484'}]}>{txt}</Text>
            </View>
          )
        }else{
          return(
            <Text numberOfLines={3} ellipsizeMode={'tail'}
              style={[{fontSize:14,paddingTop:5},_isNew ? {fontWeight:"900",color:"black"}:{fontWeight:"normal",color:'#848484'}]}>
              {msg.message}
            </Text>
          )
        }
      }else{
        return(
          <Text numberOfLines={3} ellipsizeMode={'tail'}
            style={[{fontSize:14,paddingTop:5},_isNew ? {fontWeight:"900",color:"black"}:{fontWeight:"normal",color:'#848484'}]}>
            {msg.message}
          </Text>
        )
      }
    }else{
      return null
    }
  }


  _handleRefresh = () => {
    this.setState(
      {refreshingList:true},() => {
        this.refreshList();
      }
    )
  }


  refreshList(){
    cameraCoApi.getConversations().then((res) => {
      if(res.success){
        this.setState({'conversations':res.response,refreshingList:false}, () => {
            this.saveConversationsList(res.response);
            this.loadNewMessages();
        });
      }else{
        this.setState({
          refreshingList:false
        });
      }
    });
  }

  showModal(id,name,index){
    if(this.state.searchResults){
      cameraCoApi.createConversation(id).then((res) => {
        if(res.success){
          this.setState({selectId:res.response.dmId});
        }
      });
    }else{
      this.setState({selectId:id});
    }
    this.setState({selectName:name,selectIndex:index});
    this.modal.setModal(true);
  }

  alertDelete(){
    //Hide menu
    this.modal.setModal(false);
    //Show alert. Added the timeout because other way the modal does not  work correctly
    setTimeout( () => {
      Alert.alert(
        'Delete',
        'You want to delete the conversation with ' + this.state.selectName + '?',
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: () => this.deleteConversation(this.state.selectId)},
        ],
        // { cancelable: false }
      )
    },500);
  }

  deleteConversation(itemId){
    cameraCoApi.deleteConversation(itemId).then((res) => {
      if(res.success){
        let {conversations} = this.state;
         conversations.splice(this.state.selectIndex,1);
        this.setState({conversations});
      }
    });
  }


  render() {
      return (
        <View style={styles.container}>
          <StatusBar hidden={false} />

          <TopBar
            profileImage={true}
            firstBtnImage={this.state.me.photo}
            firstBtn={() => this._onProfilePressed()}
            fourthBtnImage={'feed'}
            fourthBtn={() => this._onFeedPressed()}
            mainTitle={'Inbox'}
          >
          </TopBar>
          <View style={styles.inputArea}>
            <View style={styles.wrapperInput}>
              <Image style={styles.searchIcon}
                source={require('../assets/img/icons/search.png')}
              />
              <TextInput
                ref={input => { this.textInput = input }}
                style={styles.input}
                placeholder = 'Search...'
                underlineColorAndroid='transparent'
                onFocus = {() => this.goToSearch()}
              />
            </View>
          </View>

          <View style={styles.containerFlatlist}>
            {this.renderResult()}
          </View>
          <ModalFollow
            ref={ref => {
              this.modal = ref;
            }}
            firstBtnTxt={'Delete'}
            firstBtnColor={'red'}
            firstBtn={() => this.alertDelete()}
          />
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
        }),
  },
  resultsWrapper:{
    height:75,
    flexDirection:'row',
    alignItems:'center',
    paddingLeft:20,
    paddingRight:20,
  },
  separator:{
    height:1,
    backgroundColor:"#eaeaea"
  },
  wrapperSeparator:{
    height:31,
    justifyContent:'center',
  },
  containerFlatlist:{
    flex:1,
    marginTop:15,
  },
  userImage:{
    height:44,
    width:44,
    borderRadius:22,
    backgroundColor:'#e9ecef'
  },
  imageHolder:{
    height:44,
    width:44,
  },
  wrapperInput:{
    flexDirection:'row',
    height:36,
    backgroundColor:'#f7f7f7',
    borderRadius:12,
    paddingLeft:12,
    paddingRight:12,
    alignItems:'center',
    justifyContent:'flex-start'
  },
  searchIcon:{
    height:16,
    width:16,
  },
  input:{
    height:36,
    flex:1,
    backgroundColor:'#f7f7f7',
    paddingLeft:10,
    fontSize:17
  },
  msg:{
    fontSize:16,
    color:'gray',
    textAlign:'center'
  },
  btnSignIn:{
    height:30,
    width:150,
    backgroundColor:'white',
    justifyContent:'center',
    alignItems:'center',
    borderWidth:1,
    borderColor:'plum',
    borderRadius:20,
    marginTop:25
  },
  btnTxt:{
    color:'black',
    fontSize:16,
    fontWeight: 'bold'
  },
  txt:{
    textAlign:'center',
    fontSize:16,
  },
  inputArea:{
    height:60,
    backgroundColor:'white',
    paddingLeft:20,
    paddingRight:20,
    justifyContent:'center',
  },
  txt_time_last_msg:{
    fontSize: 12,
    color: '#999999'
  }
});
