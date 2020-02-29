import React, { Component } from 'react';
import {Dimensions,TextInput,StyleSheet, Text, View,FlatList,Image,TouchableOpacity,StatusBar } from 'react-native';
import moment from 'moment';
import Video from "react-native-video";
import ResizeImage from '../components/ResizeImage';

const { height, width} = Dimensions.get('window');
const posBtn = (height/2) - 30;
import { getStatusBarHeight } from 'react-native-status-bar-height';
statusBarHeight = getStatusBarHeight();
import cameraCoApi from "../api/CameraCoApi";

export default class Viewer extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      item:{},
      user:'',
      type:'',
      url:'',
      note:'',
      volume:1,
      showOptions:true,
      paused:true,
    }
    this.metadata = null;
    this._bc = 'black';
  }

  componentWillMount(){
    const {state} = this.props.navigation;
    let item = state.params.item;
    this.setState({
        "item": item,
        "user": state.params.user,
        'note':item.message,
    })
    if(item.hasOwnProperty('media')){
      this.setState({
          url:item.media[0].url,
      });

      if(item.media[0].hasOwnProperty('mimetype')){
        this.setState({
            'type':item.media[0].mimetype,
        });
      }
      if(item.media[0].hasOwnProperty('metadata')){
        this.metadata = item.media[0].metadata;
      }
    }
  }

  _activateVolume = () => {
    if(this.state.volume == 1){
      this.setState({volume:0});
    }else{
      this.setState({volume:1});
    }
  };

  renderMediaContent(){
    if(this.state.type == "video/quicktime"){
      return (
        <TouchableOpacity style={{flex:1}} onPress={() =>  this.showOptions()}>
          <Video
            source={{uri: this.state.url}}
            style={{ flex: 1, backgroundColor:'#e9ecef'}}
            repeat={true}
            ignoreSilentSwitch={"ignore"}
            volume={this.state.volume}            // 0 is muted, 1 is normal.
            resizeMode="cover"
            playInBackground={false}        // Audio continues to play when app entering background.
            playWhenInactive={false}
            paused={this.state.paused}
          />
          {this.renderVideoBtn()}
        </TouchableOpacity>
      )
    }else{
      if(this.state.url == ''){
        return(
          <TouchableOpacity onPress={() =>  this.showOptions()}
            style={{flex: 1,backgroundColor:'#e9ecef'}}>
          </TouchableOpacity>
        )
      }else{
        if(this.metadata != null){
          if(this.metadata.height <= this.metadata.width){
            if(this.metadata.hasOwnProperty('predominant_color')){
              this._bc = this.metadata.predominant_color;
            }
            return(
              <TouchableOpacity onPress={() =>  this.showOptions()}
                style={{flex:1,justifyContent:'center',backgroundColor:this._bc}}>
                <ResizeImage
                  source={this.state.url}
                  originalHeight={this.metadata.height}
                  originalWidth={this.metadata.width}
                />
              </TouchableOpacity>
            )
          }else{
            return (
              <TouchableOpacity onPress={() =>  this.showOptions()}
                style={{flex:1,justifyContent:'center'}}>
                <Image
                  style={{ flex: 1, width:undefined, height:undefined, resizeMode:'cover',backgroundColor:'#e9ecef'}}
                  source={{uri: this.state.url}}
                />
              </TouchableOpacity>
            )
          }
        }else{
          return (
            <TouchableOpacity onPress={() =>  this.showOptions()}
              style={{flex:1,justifyContent:'center'}}>
              <Image
                style={{ flex: 1, width:undefined, height:undefined, resizeMode:'cover',backgroundColor:'#e9ecef'}}
                source={{uri: this.state.url}}
              />
            </TouchableOpacity>
          )
        }

      }
    }
  }

  calculateTime(date){
    d = new Date(date);
    m = moment(d);
    return m.fromNow();
  }


  renderImageUser(){
    if(this.state.user.photo != ''){
      return(
        <Image style={styles.userImage}
          source={{uri:this.state.user.photo}}
        />
      )
    }else{
      let image = require('../assets/img/icons/profile24.png');
      return(
        <Image style={styles.userImage}
          resizeMode={'center'}
          source={image}
        />
      )
    }
  }

  renderTopBar(){
    if(this.state.showOptions){
      return(
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => this._goBack()}>
            <Image style={[styles.iconInteraction,{tintColor:'white'}]}
              source={require('../assets/img/icons/closeBlack.png')}
            />
          </TouchableOpacity>
        </View>
      )
    }else{
      return null
    }
  }

  _goBack(){
     const {goBack} = this.props.navigation;
     goBack()
  }

  renderNote(){
    if(this.state.showOptions){
      let alphaBC = true;
      if(this.state.type == 'type' ){
        alphaBC = false;
      }
      return(
        <View style={[styles.main_comment_area]}>
          <View style={styles.mainCommentAreaWrapper}>
              {this.renderImageUser(this.state.user)}
              <View style={styles.commentTitle}>
                <Text style={styles.username}>
                  {this.state.user.username + ' '}
                </Text>
                {this.getNote()}
                <View style={{flexDirection:'row',paddingTop:2}}>
                  <Text style={styles.date}>
                    {this.calculateTime(this.state.item.creation_date)}
                  </Text>
                </View>
              </View>
          </View>
          <View style={styles.wrapperIcons}>
              <View style={styles.iconArea}>
                <TouchableOpacity onPress={() => this._onDownloadPressed()}>
                  <Image style={[styles.iconSmall,{tintColor:'white'}]}
                    source={require('../assets/img/icons/download.png')}
                  />
                </TouchableOpacity>
              </View>
          </View>
        </View>
      )
    }else{
      return null
    }
  }


  _onDownloadPressed(){
    cameraCoApi.downloadFile(this.state.url)
  }


  getNote(){
    if((this.state.note != '') && (this.state.type != 'type')){
      return(
        <Text style={styles.comment}>
          {this.state.note}
        </Text>
      )
    }else{
      return null
    }
  }


  renderAnnotations(){
    return (null)
  }

  showOptions(){
    this.setState({showOptions:!this.state.showOptions})
  }

  renderVideoBtn(){
    if(this.state.showOptions){
      if(this.state.paused){
        return(
          <View style={styles.btnVideo}>
            <TouchableOpacity onPress={() => this.pausedVideo()}>
              <Image style={styles.iconVideo}
                source={require('../assets/img/icons/play.png')}
              />
            </TouchableOpacity>
          </View>
        )
      }else{
        return(
          <View style={styles.btnVideo}>
            <TouchableOpacity onPress={() => this.pausedVideo()}>
              <Image style={styles.iconVideo}
                source={require('../assets/img/icons/pause.png')}
              />
            </TouchableOpacity>
          </View>
        )
      }
    }else{
      return null
    }
  }

  pausedVideo(){
    this.setState({paused:!this.state.paused});
  }

  render() {
    return(
      <View style={styles.container}>
        <StatusBar hidden={true}/>
        <View style={styles.feed}>
          {this.renderTopBar()}
          <View style={styles.feedMedia}>
            {this.renderMediaContent()}
          </View>
          {this.renderNote()}
        </View>
      </View>
    )
  }

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  topBar:{
    paddingTop:statusBarHeight,
    backgroundColor:'transparent',
    paddingLeft:20,
    paddingRight:20,
    position:'absolute',
    alignItems:'flex-end',
    left:0,
    right:0,
    top:0,
    zIndex:1,
    // backgroundColor:'pink'
  },
  feed:{
    flex:1,
    flexDirection:'column',
  },
  feedMedia:{
    flex:1,
  },
  userImage:{
    height:40,
    width:40,
    borderRadius:20,
    backgroundColor:'#e9ecef'
  },
  username:{
    fontSize:18,
    color:'white',
  },
  placeName:{
    paddingLeft:10,
    fontSize:12,
    color:'#f7f7f7'
  },
  date:{
    fontSize:12,
    color:'#f7f7f7',
  },
  iconInteraction:{
    height:40,
    width:40,
    shadowColor: 'gray',
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  iconSmall:{
    height:28,
    width:28,
  },
  main_comment_area:{
    minHeight:100,
    paddingLeft:20,
    paddingRight:20,
    paddingBottom:15,
    position:'absolute',
    left:0,
    right:0,
    bottom:0,
    // backgroundColor:'pink',
    justifyContent:'flex-end'
  },
  mainCommentAreaWrapper:{
    flexDirection:'row',
    // backgroundColor:'red'
  },
  commentTitle:{
    flex:1,
    flexDirection:'column',
    paddingLeft:15,
  },
  comment:{
    flex:1,
    paddingTop:2,
    fontSize:14,
    color:'white',
  },
  annotationContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
  },
  annotationFill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ef6185',
    transform: [{ scale: 0.6 }],
  },
  btnVideo:{
    backgroundColor:'transparent',
    height:60,
    position:'absolute',
    left:0,
    right:0,
    top:posBtn,
    alignItems:'center',
    justifyContent:'center'
  },
  iconVideo:{
    tintColor:'white',
    height:60,
    width:60
  },
  wrapperIcons:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'flex-end',
    marginTop:15
  },
  iconArea:{
    flexDirection:'row',
    alignItems:'center',
    // backgroundColor:'cyan'
  },
  iconTxt:{
    color:'white',
    paddingLeft:10,
    fontSize:16,
  }
});
