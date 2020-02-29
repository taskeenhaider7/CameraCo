import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  View
} from 'react-native';
import cameraCoApi from "../api/CameraCoApi";

export default class Notifications extends Component {
  constructor(params){
    super(params);
    this.goToFote = this.goToFote.bind(this);

    this.state = {
      notifications:[],
      refreshingList:false,
      me:{},

    }
    cameraCoApi.getMe().then((res) => {
      if(res.hasOwnProperty("name")){
        this.setState({me:res});
      }
    });
  }
  componentDidMount(){
    cameraCoApi.getNotifications().then((res) => {
        if(res == "error"){

        }else{
          this.setState({"notifications":res.reverse()})
        }
    });

  }
  _isLiked(item){
    let isLiked = false;
    // alert(JSON.stringify(item))
    if(item.hasOwnProperty('likes_by') ){
      let array = item.likes_by;
      for(i = 0; i < array.length; i++){
        if(this.state.me.uid == array[i]){
          isLiked = true;
          break;
        }
      }
    }
    return isLiked
  }
  _likes = (item) => {
    let likes = null;
    if(item.hasOwnProperty('likes_by')){
      if (item.likes_by.length != 0){
        likes = item.likes_by.length
      }
    }
    return likes;
  }
  goToProfile(user){
    this.props.navigation.navigate({
      key:'FeedProfile',
      routeName:'FeedProfile',
      params:{user:user,showSettings:false,isBlocked:false}
    });
  }
  goToFote(fote){
    let like = this._isLiked(fote);
    let numLikes = this._likes(fote);
    let numComments = null;
    let _url = "";
    if( fote.hasOwnProperty("media")){
      if(fote.media.length > 0 ){
        _url =fote.media[0].url
      }
    }
    this.props.onGridItemPressed(fote,_url,like,numLikes,null,null,numComments);
  }
  _renderNotification = ({item,index}) => {
    if(item.fote.length > 0){

      if(item.type == "COMMENT"){
        return (
           <TouchableOpacity activeOpacity={.4} onPress={() => this.goToFote(item.fote[0])}>
             <View style={styles.notificationWrapper}>
                {this.renderImageUser(item.sender_user[0].uid)}
                <Text
                  numberOfLines={3}
                  style={styles.notificationMessage}>
                  <Text style={{fontWeight:"bold",fontSize:16}}>{"@"+item.sender_user[0].username + " "}</Text>
                  <Text> commented: </Text>
                  <Text> {'"'+item.notification.comment+'."'}</Text>
                </Text>
                {this.renderImagePreview(item)}
              </View>
           </TouchableOpacity>
        )
      }else if(item.type == "LIKE"){
        return (
          <TouchableOpacity activeOpacity={.4} onPress={() => this.goToFote(item.fote[0])}>
           <View style={styles.notificationWrapper}>
              {this.renderImageUser(item.sender_user[0].uid)}
              <Text
                numberOfLines={3}
                style={styles.notificationMessage}>
                <Text style={{fontWeight:"bold",fontSize:16}}>{"@"+item.sender_user[0].username + " "}</Text>
                <Text> liked your post.</Text>
                <Text></Text>
              </Text>
              {this.renderImagePreview(item)}
            </View>
          </TouchableOpacity>

        )
      }else if(item.type == "FOLLOW"){
        return (
          <TouchableOpacity activeOpacity={.4} onPress={() => this.goToProfile(item.sender_user[0])}>
           <View style={styles.notificationWrapper}>
              {this.renderImageUser(item.sender_user[0].uid)}
              <Text
                numberOfLines={3}
                style={styles.notificationMessage}>
                <Text style={{fontWeight:"bold",fontSize:16}}>{"@"+item.sender_user[0].username + " "}</Text>
                <Text> started to follow you.</Text>
                <Text></Text>
              </Text>
              {this.renderImagePreview(item)}
            </View>
          </TouchableOpacity>

        )
      }
    }else{
      return null
    }
  }
  _keyExtractor = (item, index) => index;
  _renderSeparator = () => {
    return(
      <View style={styles.separator}></View>
    )
  }
  refreshList(){
    cameraCoApi.getNotifications().then((res) => {
        if(res == "error"){
          this.setState({refreshingList:false})
        }else{
          this.setState({"notifications":res.reverse(),refreshingList:false})
        }
    });
  }
  _handleRefresh = () => {
    this.setState(
      {refreshingList:true},() => {
        this.refreshList();
      }
    )
  }
  onNewMessage(){
    this.refreshList();
  }
  renderImageUser(photo){
    if(photo != ''){
      photo = 'https://s3.amazonaws.com/fotesapp/profiles/' + photo + '.png'
      return(
        <Image style={styles.userImage}
          source={{uri:photo}}
        />
      )
    }else{
      let image = require('../assets/img/icons/profile40.png');
      return(
        <Image style={styles.userImage}
          resizeMode={'center'}
          source={image}
        />
      )
    }
  }
  renderImagePreview(item){
    if(item.hasOwnProperty("fote")){
      if(item.fote.length > 0){
        if(item.fote[0].hasOwnProperty("thumbnails")){
          if(item.fote[0].thumbnails.length > 0){
            photo = item.fote[0].thumbnails[0].url;
            return(
              <Image style={styles.imagePreview}
                source={{uri:photo}}
                resizeMode={"cover"}
              />
            )
          }
        }
      }
    }else{
      return(null)
    }
  }
  render() {
    return (
      <View style={styles.container}>
      <FlatList
          style={{paddingLeft:20,paddingTop:10,paddingRight:20}}
          contentContainerStyle={{paddingBottom:25}}
          ref={ref => this.flatList = ref}
          refreshing={this.state.refreshingList}
          onRefresh={this._handleRefresh}
          data={this.state.notifications}
          extraData={this.state}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderNotification}
          ItemSeparatorComponent={this._renderSeparator}
      />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  separator:{
    height:15,
  },
  notificationWrapper:{
     flex:1,
     flexDirection:"row",
     minHeight:30,
     justifyContent: 'center',
     alignItems:'center'
  },
  userImage:{
    height:50,
    width:50,
    borderRadius:25,
    backgroundColor:'#e9ecef',
    marginRight:10,
  },
  notificationMessage:{
    flex:1,
    paddingRight:15,
  },
  imagePreview:{
    height:50,
    width:50,

  },
});
