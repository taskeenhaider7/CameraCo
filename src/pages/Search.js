import React, { Component } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  StatusBar
} from 'react-native';
import cameraCoApi from "../api/CameraCoApi";
import { isIphoneX } from 'react-native-iphone-x-helper'
import { ifIphoneX } from 'react-native-iphone-x-helper'
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { NavigationActions,StackNavigator} from 'react-navigation';

const statusBarHeight = getStatusBarHeight();


export default class Search extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      conversations: [],
      searchResults:false,
      me:{},
    }
  }

  componentDidMount(){
    cameraCoApi.getMe().then((res) => {
      if(res.hasOwnProperty("uid")){
        this.setState({me:res});
      }
    });
  }

  _keyExtractor = (item, index) => index;

  onUserSelected(id,title,photo,item){

    if(this.state.searchResults){
      cameraCoApi.createConversation(id).then((res) => {
        if(res.success){
          this.props.navigation.navigate({key:'Conversation',routeName:'Conversation',
            params:{conversationId:res.response.dmId, title:title, photo:photo}});
        }
      })
    }else{
      // alert('else')

      this.props.navigation.navigate({key:'Conversation',routeName:'Conversation',
        params:{conversationId:id, title:title, photo:photo}});
    }
  }

  _goBack(){
     const {goBack} = this.props.navigation;
     goBack()
  }

  renderUser(user){
    let item;
    let _title;
    let lastMessage = null;
    if(this.state.searchResults){
      item = user;
      _title = user.username;
      if(!user.hasOwnProperty('photo')){
        item.photo='';
      }
    }else{
      item = {  uid:user._id, photo:''};
      if(user.conversation_image != null){
        item.photo = user.conversation_image;
      }
      _title = user.title;
      if(user.hasOwnProperty('messages')){
        let msgs = user.messages;
        if(msgs.length > 0){
          let msg = msgs[msgs.length - 1];
          // alert(JSON.stringify(msg));
          lastMessage = msg;
        }
      }
    }
    return(
      <View style={styles.resultsWrapper}>
        {this.renderImageUser(item,item.photo)}
        <View style={{flex:1,marginLeft:15}}>
          <TouchableOpacity onPress={() => this._onProfilePressed(item)}>
            <Text style={{fontSize:16,fontWeight:"bold"}}>{_title}</Text>
          </TouchableOpacity>
          {this.renderLastMessage(lastMessage)}
        </View>
        <TouchableOpacity style={styles.btnMain} onPress={() => this.onUserSelected(item.uid,_title,item.photo,user)}>
          <Text style={styles.btnTxt}>Message</Text>
        </TouchableOpacity>
      </View>
    )
  }



  renderSeparator(){
    return (
      <View style={styles.wrapperSeparator}>
        <View style={styles.separator}></View>
      </View>
    );
  }

  renderResult(){
    return(
      <FlatList
        data={this.state.conversations}
        keyExtractor={this._keyExtractor}
        renderItem={({item}) => this.renderUser(item)}
        ItemSeparatorComponent={this.renderSeparator}
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
    }else{
      this.setState({'conversations':[]});
    }
  }

  renderImageUser(_user,photo){
    if(photo != ''){
      return(
        <TouchableOpacity onPress={() => this._onProfilePressed(_user)}>
          <Image style={styles.userImage}
            source={{uri:photo}}
          />
        </TouchableOpacity>
      )
    }else{
      let image = require('../assets/img/icons/profile40.png');
      return(
        <TouchableOpacity onPress={() => this._onProfilePressed(_user)}>
          <Image style={styles.userImage}
            resizeMode={'center'}
            source={image}
          />
        </TouchableOpacity>

      )
    }
  }

  _onProfilePressed(_user){
    this.props.navigation.navigate({
      key:'FeedProfile',
      routeName:'FeedProfile',
      params:{user:_user,showSettings:false,isBlocked:false}
    });
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
              <Text style={{fontSize:14,color:'#848484',paddingLeft:5}}>{txt}</Text>
            </View>
          )
        }else{
          return(
            <Text style={{fontSize:14,color:'#848484', paddingTop:5}}>{msg.message}</Text>
          )
        }
      }else{
        return(
          <Text style={{fontSize:14,color:'#848484', paddingTop:5}}>{msg.message}</Text>
        )
      }
    }else{
      return null
    }
  }

  render() {
      return (
        <View style={styles.container}>
          <StatusBar hidden={false} />

          <View style={styles.header}>
            <View style={styles.wrapperInput}>
              <Image style={styles.searchIcon}
                source={require('../assets/img/icons/search.png')}
              />
              <TextInput
                ref={input => { this.textInput = input }}
                style={styles.input}
                placeholder = 'Search...'
                underlineColorAndroid='transparent'
                onChangeText = {(name) => this.searchUser(name)}
                clearButtonMode={"always"}
                autoFocus={true}
              />
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => this._goBack()}>
              <Text style={{color:'black',fontSize:17}}>
                Cancel
              </Text>
            </TouchableOpacity>

          </View>

          <View style={styles.containerFlatlist}>
            {this.renderResult()}
          </View>
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
    // backgroundColor:'pink'
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
    paddingTop:15,
    paddingLeft:20,
    paddingRight:20
  },
  userImage:{
    height:55,
    width:55,
    borderRadius:27.5,
    backgroundColor:'#e9ecef'
  },
  wrapperInput:{
    flexDirection:'row',
    flex:1,
    height:36,
    backgroundColor:'#f7f7f7',
    borderRadius:12,
    paddingLeft:12,
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
    borderTopRightRadius:12,
    borderBottomRightRadius:12,
    backgroundColor:'#f7f7f7',
    paddingLeft:10,
    fontSize:16
  },
  msg:{
    fontSize:16,
    color:'gray',
    textAlign:'center'
  },
  txt:{
    textAlign:'center',
    fontSize:16,
  },
  header:{
    flexDirection:'row',
    height:60,
    backgroundColor:'white',
    paddingLeft:20,
    paddingRight:20,
    alignItems:'center',
  },
  cancelBtn:{
    height:36,
    alignItems:'center',
    justifyContent:'center',
    marginLeft:15,
  },
  btnMain:{
    paddingTop:10,
    paddingBottom:10,
    paddingLeft:20,
    paddingRight:20,
    backgroundColor: '#f1f1f1',
    borderRadius:20,
  },
  btnTxt:{
    color:'#5b5b5b',
    fontSize:16,
    textAlign:'center',
  }

});
