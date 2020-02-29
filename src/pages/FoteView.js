import React, { Component } from 'react';
import {Dimensions,StyleSheet, Text, View,Image,TouchableOpacity,StatusBar, FlatList } from 'react-native';
import moment from 'moment';
import Video from "react-native-video";

const { height, width} = Dimensions.get('window');
const posBtn = (height/2) - 30;
import { getStatusBarHeight } from 'react-native-status-bar-height';
statusBarHeight = getStatusBarHeight();
import { ifIphoneX } from 'react-native-iphone-x-helper'
import cameraCoApi from "../api/CameraCoApi";
import ResizeImage from '../components/ResizeImage';
import AudioVisualization from '../components/AudioVisualization';
import {CachedImage} from 'react-native-cached-image';
import AnimationAudio from '../audio/AnimationAudio';

const likeImage = 'https://s3.amazonaws.com/fotesapp/app/like.png';
const dontlikeImage = 'https://s3.amazonaws.com/fotesapp/app/like_red.png';

class FoteView extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      item:{},
      user:{},
      id:'',
      type:'',
      url:'',
      place:'',
      location:'',
      note:'',
      isLiked:'',
      volume:1,
      showOptions:true,
      paused:true,
      numLikes:0,
      numComments:0,
      me:{}
    }
    this.index=0;
    this.metrics = [];
  }

  componentWillMount(){
    const {state} = this.props.navigation;
    let item = state.params.item;
    this.setState({
        "id": item._id,
        "item": item,
        'location': item.location,
        'note':item.note,
        'url':state.params.url,
        'isLiked':state.params.isLiked,
        'numLikes':state.params.numLikes
    })
    if(item.place !== undefined){
      this.setState({
          'place':item.place,
      })
    }
    if(item.type !== undefined){
      this.setState({
          'type':item.type,
      })
    }
    if(item.user !== undefined){
      this.setState({"user": item.user[0]});
    }else{
      cameraCoApi.getMe().then((res) => {
        if(res.hasOwnProperty("name")){
          this.setState({user:res,me:res});
        }
      });
    }
    if(item.hasOwnProperty('metrics')){
      if(item.metrics.length > 0){
        this.metrics = item.metrics;
      }
    }
    cameraCoApi.getMe().then((res) => {
      if(res.hasOwnProperty("name")){
        this.setState({me:res});
      }
    });
  }

  _activateVolume = () => {
    if(this.state.volume == 1){
      this.setState({volume:0});
    }else{
      this.setState({volume:1});
    }
  };

  playAnimation(p){
    if(this.metrics != []){
      if( (this.index) < (this.metrics.length) ){
        this.AudioVisualization.receiveMetrics(this.metrics[this.index]);
        this.index = this.index + 1;
      }
    }
  }
  onBuffer1(data){
    console.log("DATA1"+ JSON.stringify(data));
  }
  onBuffer2(data){
    console.log("DATA2"+ JSON.stringify(data));
  }
  renderPlayAudioCaption(){
    if(this.state.item.audio_caption[0] == null || this.state.item.audio_caption[0] == undefined){
      return (null);
    }
    if(!this.state.item.metrics){
      return this.renderVideoBtn();
    }
    let icon = this.state.paused ? require('../assets/img/icons/play.png') : require('../assets/img/icons/pause.png');
    return (
      <View style={styles.btnVideo}>
        <TouchableOpacity onPress={() => this.pausedVideo()}>
          <Image style={styles.iconVideo}
            source={icon}
          />
        </TouchableOpacity>
        {
          this.state.paused ?
            <View style={{flex: 1}}/>
          :
              <AnimationAudio
                height={180}
                metrics={this.state.item.metrics}
                isPlaying={!this.state.paused}
              />
        }
      </View>
    );
  }
  renderVideoAudioCaption(){
    if(this.state.item.audio_caption){
      if(this.state.item.audio_caption[0] == null || this.state.item.audio_caption[0] == undefined){
        return (null);
      }
      return(
        <Video
          ref={(ref) => {this.player = ref}}
          source={{uri: this.state.item.audio_caption[0].url}}
          style={{ width: 1, height: 1, position: 'absolute',backgroundColor:'transparent',zIndex:0}}
          repeat={false}
          audioOnly={true}
          volume={10}
          paused={this.state.paused}
          playInBackground={false}        // Audio continues to play when app entering background.
          playWhenInactive={false}
          onEnd={() => {this.onFinishedPlay()}}
        />
      );
    }else{
      return (null);
    }
  }
  renderMediaContent(){
    if(this.state.type == "video"){
      return (
        <TouchableOpacity style={{flex:1,justifyContent:'center'}} onPress={() =>  this.showOptions()}>
          <Video
            source={{uri: this.state.url}}
            style={{flex: 1, backgroundColor:'#e9ecef'}}
            repeat={true}
            ignoreSilentSwitch={"ignore"}
            volume={this.state.volume}            // 0 is muted, 1 is normal.
            resizeMode="cover"
            playInBackground={false}        // Audio continues to play when app entering background.
            playWhenInactive={false}
            paused={this.state.paused}
            onBuffer={this.onBuffer1}
          />
          {this.renderVideoBtn()}
        </TouchableOpacity>
      )
    } else if(this.state.type == "type"){
      let font = 'system font';
      if(this.state.item.hasOwnProperty('font')){
        if(this.state.item.font != ''){
          font = this.state.item.font;
        }
      }
      if(this.state.url != ''){
        let darkMode = false;
        if(this.state.item.backgroundColor == '#000000'){
          darkMode = true;
        }
        return (
          <TouchableOpacity onPress={() =>  this.showOptions()}
            style={{flex: 1,backgroundColor:this.state.item.backgroundColor,justifyContent:'center'}}>
            <Video
              ref={(ref) => {this.player = ref}}
              audioOnly={true}
              source={{uri: this.state.url}}
              style={{ flex: 1, backgroundColor:this.state.item.backgroundColor}}
              repeat={false}
              volume={10}
              ignoreSilentSwitch={"ignore"}
              playInBackground={false}        // Audio continues to play when app entering background.
              playWhenInactive={false}
              paused={this.state.paused}
              onEnd={() => {this.onFinishedPlay()}}
              onProgress={(p) => {this.playAnimation(p)}}
              onBuffer={this.onBuffer2}

            />
            <AudioVisualization
              ref={(ref) => this.AudioVisualization = ref}
              darkMode={darkMode}
              >
            </AudioVisualization>
            {this.renderVideoBtn()}
          </TouchableOpacity>
        )
      }else{
        return (
          <TouchableOpacity onPress={() =>  this.showOptions()}
            style={{flex: 1,backgroundColor:this.state.item.backgroundColor,justifyContent:'center'}}>
            <Text style={{fontSize:32, color:'white',textAlign:'center',fontFamily:font}}>
              {this.state.note}
            </Text>
          </TouchableOpacity>
        )
      }
    } else if(this.state.type == "audio_caption"){
        let metadata = this.state.item.media[0].metadata;
        let _bc = 'black';
        if(metadata.height < metadata.width){
          if(metadata.hasOwnProperty('predominant_color')){
            _bc = metadata.predominant_color;
          }
          return(
            <TouchableOpacity onPress={() =>  this.showOptions()}
              style={{flex:1,justifyContent:'center',backgroundColor:_bc}}>
              {this.renderPlayAudioCaption()}
              {this.renderVideoAudioCaption()}
              <ResizeImage
                source={this.state.url}
                originalHeight={metadata.height}
                originalWidth={metadata.width}
              />
            </TouchableOpacity>
          )
        }else{
          _bc = metadata.predominant_color;
          return(
            <TouchableOpacity onPress={() =>  this.showOptions()}
              style={{flex:1}}>
              {this.renderPlayAudioCaption()}
              {this.renderVideoAudioCaption()}
              <CachedImage
                style={{width:undefined,height:undefined,flex:1,backgroundColor:_bc}}
                source={{uri: this.state.url}}
              />
            </TouchableOpacity>
          )
        }
    }else{
        if(this.state.item.media[0].hasOwnProperty('metadata')){
          let metadata = this.state.item.media[0].metadata;
          let _bc = 'black';
          if(metadata.height < metadata.width){
            if(metadata.hasOwnProperty('predominant_color')){
              _bc = metadata.predominant_color;
            }
            return(
              <TouchableOpacity onPress={() =>  this.showOptions()}
                style={{flex:1,justifyContent:'center',backgroundColor:_bc}}>
                <ResizeImage
                  source={this.state.url}
                  originalHeight={metadata.height}
                  originalWidth={metadata.width}
                />
              </TouchableOpacity>
            )
          }else{
            _bc = metadata.predominant_color;
            // ratio = height/(metadata.height);
            // newWidth = (metadata.width) * ratio;
            // newHeigth = (metadata.height) * ratio;

            return(
              <TouchableOpacity onPress={() =>  this.showOptions()}
                style={{flex:1}}>
                <CachedImage
                  style={{width:undefined,height:undefined,flex:1,resizeMode:"contain",backgroundColor:_bc}}
                  source={{uri: this.state.url}}
                />
              </TouchableOpacity>
            )
          }
        }else{
          return (
            <TouchableOpacity onPress={() =>  this.showOptions()}
              style={{flex:1,justifyContent:'center'}}>
              <CachedImage
                style={{flex:1,width:undefined,height:undefined,backgroundColor:'#e9ecef '}}
                source={{uri: this.state.url}}

              />
            </TouchableOpacity>
          )
        }
    }
  }

  onFinishedPlay(){
    this.setState(
      {paused: true },
      () => {
        this.player.seek(0);
        this.index=0;
      }
    )
  }

  calculateTime(date){
    d = new Date(date);
    m = moment(d);
    return m.fromNow();
  }

  _pressHeart = () => {
      this.pressLike();
  }

  addLike(){
    cameraCoApi.addLike(this.state.id).then((res) => {
      if(res.success){
        console.log('like added');
      }
    })
  }

  removeLike(){
    cameraCoApi.removeLike(this.state.id).then((res) => {
      if(res.success){
        console.log('like removed');
      }
    })
  }

  /*_onCommentsPressed(){
      this.props.navigation.navigate({key:'Comments',routeName:'Comments',params:{item:this.state.item}});
  }*/

  renderImageUser(){
    if(this.state.user.photo){
      return(
        <TouchableOpacity onPress={() => this._onProfilePressed()}>
          <Image style={styles.userImage}
            source={{uri:this.state.user.photo}}
          />
        </TouchableOpacity>
      )
    }else{
      let image = require('../assets/img/icons/profile24.png');
      return(
        <TouchableOpacity onPress={() => this._onProfilePressed()}>
          <Image style={styles.userImage}
            resizeMode={'center'}
            source={image}
          />
        </TouchableOpacity>

      )
    }
  }

  _onProfilePressed(){
    let _user = this.state.user;
    let _showSet = false;
    if( _user.uid == this.state.me.uid ){
      _showSet = true;
    }
    this.props.navigation.navigate({
      key:'FeedProfile',
      routeName:'FeedProfile',
      params:{user:_user,showSettings:_showSet,isBlocked:false}
    });
  }

  pressLike(){
    if(this.state.isLiked){
      //remove like from the client and server
      //add and remove num,ber of like text
      if(this.state.numLikes <= 1){
        this.setState({numLikes:0});
      }else{
        this.setState({numLikes:this.state.numLikes - 1});
      }
      this.setState({isLiked:false});
      this.removeLike();
    }else{
      //add like to the client and server
      //add and remove num,ber of like text
      this.setState({numLikes:this.state.numLikes + 1});
      this.setState({isLiked:true});
      this.addLike();
    }
  }

  navigatePlace = () => {
    let place = this.state.place;
    this.props.navigation.navigate({key:'PlaceInfo',routeName:'PlaceInfo',
      params:{place:place, photo_reference:place.photos[0].photo_reference}});
  }

  renderLikeImage(){
    if(this.state.isLiked){
      return(
        <Image style={[styles.iconSmall,{tintColor:'red'}]}
          source={{uri:likeImage}}
        />
      )
    }else{
      return(
        <Image style={[styles.iconSmall,{tintColor:'white'}]}
          source={{uri:dontlikeImage}}
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
     this.index=0;
     const {goBack} = this.props.navigation;
     goBack()
  }
  onGoChat(){
    if(this.state.me.uid != this.state.item.uid){
      cameraCoApi.createConversation(this.state.item.uid)
      .then((res)=>{
        let title = "";
        let photo = "";
        let user = this.state.item.user;
        if(user){
          if(user.length > 0){
            title = user[0].username;
            photo = user[0].photo;
          }
        }
        if(res.success){
          let conversation = {
            id_conversation: res.response.dmId,
            title: title,
            photo: photo
          }
          //this.props.onGoChat(this.props.item,conversation);
          this.props.navigation.navigate({key:'Conversation',routeName:'Conversation',
            params:{conversationId:conversation.id_conversation, title:conversation.title, photo:conversation.photo, item: this.state.item}});
        }
      })
      .catch((err)=>{
        console.log("err on create conversation");
        console.log(err);
      });
    }
    /*cameraCoApi.createConversation(this.props.item.uid)
      .then((res)=>{
        let title = "";
        let photo = "";
        let user = this.props.item.user;
        if(user){
          if(user.length > 0){
            title = user[0].username;
            photo = user[0].photo;
          }
        }
        if(res.success){
          let conversation = {
            id_conversation: res.response.dmId,
            title: title,
            photo: photo
          }
          this.props.onGoChat(this.props.item,conversation);
        }
      })
      .catch((err)=>{
        console.log("err on create conversation");
        console.log(err);
      });*/
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
                  {this.renderPlace(this.state.place)}
                </View>
              </View>
          </View>
          <View style={styles.wrapperIcons}>
              <View style={styles.iconArea}>
                <TouchableOpacity onPress={this._pressHeart}>
                  {this.renderLikeImage()}
                </TouchableOpacity>
                {this.renderLikes()}
              </View>
              <View style={styles.iconArea}>
                <TouchableOpacity onPress={() => this.onGoChat()}>
                  <Image style={[styles.iconSmall,{tintColor:'white'}]}
                    source={require('../assets/img/icons/chat.png')}
                  />
                </TouchableOpacity>
              </View>
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
  renderLikes(){
    if(this.state.numLikes != 0){
      return(
        <Text style={styles.iconTxt}>{this.state.numLikes}</Text>
      )
    }else{
      return null
    }
  }

  /*renderComments(){
    if(this.state.numComments != 0 ){
      return(
        <Text style={styles.iconTxt}>{this.state.numComments}</Text>
      )
    }else{
      return null
    }
  }*/
  renderHashtag(item){
    return (
      <View style={styles.container_hashtag}>
        <Text style={styles.txt_hashtag}>{item}</Text>
      </View>
    );
  }
  getNote(){
    let font = 'system font';
    if(this.state.type == "audio_caption"){
      if(this.state.item.hashtags){
        return(
          <FlatList
            horizontal={true}
            contentContainerStyle= {{ alignItems: 'center' }}
            data={this.state.item.hashtags}
            keyExtractor={ (item, index) => index.toString()}
            renderItem={({item})=>this.renderHashtag(item)}
          />
        );
      }else{
        return null;
      }
    }
    if((this.state.note != '') && (this.state.type != 'type')){
      return(
        <Text style={styles.comment}>
          {this.state.note}
        </Text>
      )
    }else if((this.state.type == 'type') && (this.state.url != '')){
      if(this.state.item.hasOwnProperty('font')){
        if(this.state.item.font != ''){
            font = this.state.item.font;
        }
      }
      return(
        <Text style={[styles.comment,{fontFamily:font}]}>
          {this.state.note}
        </Text>
      )
    } else{
      return null
    }
  }

  renderPlace(){
    let place = this.props.place;
    _placeName = "";
    if(place != null){
      if(place.hasOwnProperty("name")){
        _placeName = place.name;
      }
    }

    if(place !== undefined){
      return(
        <TouchableOpacity onPress={()=> this.navigatePlace()}>
          <Text style={styles.placeName} numberOfLines={1} ellipsizeMode='tail'>
            @{_placeName}
          </Text>
        </TouchableOpacity>
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
    fontSize:14,
    fontWeight: 'bold',
    color:'white',
    marginBottom: 5,
    // backgroundColor:'rgba(255,255,255,0.25)'
  },
  placeName:{
    paddingLeft:10,
    fontSize:12,
    color:'#f7f7f7'
  },
  date:{
    fontSize:10,
    color:'#f7f7f7',
  },
  container_hashtag:{
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 2,
    paddingBottom: 2,
    borderColor: "#ffffff",
    borderWidth: 1,
    borderRadius: 15,
    marginRight: 4,
    marginBottom: 5,
  },
  txt_hashtag:{
    fontSize: 15,
    color: '#ffffff'
  },
  iconInteraction:{
    height:40,
    width:40,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  iconSmall:{
    height:28,
    width:28,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  main_comment_area:{
    minHeight:100,
    paddingLeft:20,
    paddingRight:20,
    ...ifIphoneX({
            paddingBottom:34
        }, {
            paddingTop: 15
        },{bottom:0}),
    position:'absolute',
    left:0,
    right:0,
    bottom:10,
    // backgroundColor:'pink',
    justifyContent:'flex-end'
  },
  mainCommentAreaWrapper:{
    flexDirection:'row',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 1,
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
    zIndex: 10,
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
    justifyContent:'space-around',
    marginTop:15,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1,
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

export default FoteView;
