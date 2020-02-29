import React, { Component } from 'react';
import {Alert,Linking,Share,Dimensions,TextInput,StyleSheet, Text, View,FlatList,Image,TouchableOpacity } from 'react-native';
import moment from 'moment';
import utils from "../utils/utils";
import Video from "react-native-video";
import {CachedImage} from 'react-native-cached-image';
import ResizeImage from './ResizeImage';
import AnimationAudio from '../audio/AnimationAudio';

const { height, width} = Dimensions.get('window');
const ITEM_HEIGHT = height * .70;
const MEDIA_HEIGHT = height * .50;
const ITEM_WIDTH = width/3;

import { getStatusBarHeight } from 'react-native-status-bar-height';
statusBarHeight = getStatusBarHeight();
import cameraCoApi from "../api/CameraCoApi";
import AudioVisualization from './AudioVisualization';

class MyListItem extends React.PureComponent {
  constructor(props){
    super(props);
    this.place = '';
    this.volume = 0;
    this.numberLikes = this.props.likes;
    this.actNumbers = this.props.activityNumbers;
    this.activity = this.props.activity;
    this.state ={
      isPaused: true
    }
    this.isPaused = true;
    this.index=0;
    this.indexMedia = null;
  }


  componentDidMount(){
    this.likeImage = this.props.likeImage;
    this.like = this.props.like;
  }


  componentDidUpdate(prevProps, prevState) {
    if (prevProps.likeImage !== this.likeImage){
          this.likeImage = prevProps.likeImage;
    }
    if (prevProps.like !== this.like){
          this.like = prevProps.like;
    }
  }


  _activateVolume = () => {
    if(this.volume == 1){
      this.volume = 0;
      this.forceUpdate();
    }else{
      this.volume = 1;
      this.indexMedia = this.props.index;
      this.forceUpdate();
    }
  };

  _playPause(){
    console.log("onplay");
    if(this.state.isPaused){
      this.indexMedia = this.props.index;
      //this.isPaused = false;
      this.setState({isPaused: false})
      //this.forceUpdate();
    }else{
      //this.isPaused = true;
      //this.forceUpdate();
      this.setState({isPaused: true})
      //this.setState({algo: true})
    }
  }


  _renderVolume(){
    if(this.volume == 1){
      return(
        <TouchableOpacity style={styles.volumeBtn}
          onPress={this._activateVolume}>
          <Image style={[styles.iconInteraction,{tintColor:'white'}]}
            source={require('../assets/img/icons/mute.png')}
          />
        </TouchableOpacity>
      )
    }else{
      return(
        <TouchableOpacity style={styles.volumeBtn}
          onPress={this._activateVolume}>
          <Image style={[styles.iconInteraction,{tintColor:'white'}]}
            source={require('../assets/img/icons/volume.png')}
          />
        </TouchableOpacity>
      )
    }
  }

  _renderPlayPause(){
    console.log("press play pause........");
    if(this.state.isPaused){
      return(
        <TouchableOpacity style={styles.volumeBtn}
          onPress={()=>this._playPause()}>
          <Image style={[styles.iconInteraction,{tintColor:'white'}]}
            source={require('../assets/img/icons/play.png')}
          />
        </TouchableOpacity>
      )
    }else{
      return(
        <TouchableOpacity style={styles.volumeBtn}
          onPress={()=>this._playPause()}>
          <Image style={[styles.iconInteraction,{tintColor:'white'}]}
            source={require('../assets/img/icons/pause.png')}
          />
        </TouchableOpacity>
      )
    }
  }

  _onFinishedPlay(){
    this.isPaused = true;
    this.setState({isPaused: true}, ()=>{
      this.player.seek(0);
        this.index = 0;
    });
    /*this.forceUpdate(
      () => {
        this.player.seek(0);
        this.index = 0;
      }
    )*/
  }

  _playAnimation(){
    if(this.props.metrics.length > 0){
      if( (this.index) < (this.props.metrics.length) ){
        this.AudioVisualizationFeed.receiveMetrics(this.props.metrics[this.index]);
        this.index = this.index + 1;
        //this.forceUpdate();
        this.setState({algo: true})
      }else{
        this.index = 0;
        //this.forceUpdate();
        this.setState({algo: true})
      }
    }
  }


  _getLocation = () => {
    let location = this.props.location;
    utils.reverseGC(location.latitude,location.longitude).then((res) => {
      _place = "{city}"
      try{
        if(res.address.hasOwnProperty("city")){
          _place = _place.replace("{city}",res.address.city);
          _place = _place.replace("{country}",res.address.country);
        }else if(res.address.hasOwnProperty("state")){
          _place = _place.replace("{city}",res.address.state);
          _place = _place.replace("{country}",res.address.country);
        }else{
          _place = "";
        }
      }catch(ex){
        _place = "";
      }
      this.place = _place;
      this.forceUpdate();
    });
  }

  renderLine(){
    if(this.props.item.activity.to_place != null){
      route =
        {
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "properties": {},
              "geometry": {
                "style":{
                    "fill":"red",
                    "stroke-width":"10",
                    "lineDasharray":[4],
                    "fill-opacity":1
                },
                "type": "LineString",
                "coordinates": [
                  [
                    this.props.item.activity.from_place.geometry.location.lng,this.props.item.activity.from_place.geometry.location.lat,
                  ],
                  [
                    this.props.item.activity.to_place.geometry.location.lng,this.props.item.activity.to_place.geometry.location.lat,
                  ]
                ]
              }
            }
          ]

        }
      return (null)
    }else{
      return (null);
    }
  }

  _isAudioPaused(){
    if((this.props.currentPage != 1) || (this.state.isPaused) || (this.props.indexViewable != this.indexMedia)){
      if(!this.state.isPaused){
        this._playPause();
      }
      console.log('STOP audio : ' +  this.props.indexViewable +' '+ this.props.index + ' '+ this.indexMedia);
      return true
    }else{
      console.log('Should play audio : ' +  this.props.indexViewable +' '+ this.props.index + ' '+ this.indexMedia);
      return false
    }
  }



  renderMedia(){
    if(this.volume == 1){
      if(this.props.indexViewable != this.indexMedia){
        this.volume = 0;
        console.log('STOP  : ' +  this.props.indexViewable +' '+ this.props.index + ' '+ this.indexMedia);
      }else{
        console.log('Should play  : ' +  this.props.indexViewable +' '+ this.props.index + ' '+ this.indexMedia);
      }
    }


    if(this.props.type == "video"){
      return (
        <View style={styles.mediaHeight}>
          {this._renderVolume()}

          <Video
            ref={(ref) => {this.playerVideo = ref}}
            source={{uri: this.props.url}}
            style={{ flex: 1, backgroundColor:'#e9ecef'}}
            repeat={true}
            volume={this.volume}            // 0 is muted, 1 is normal.
            paused={this.props.currentPage != 1}
            resizeMode={"cover"}
            playInBackground={false}        // Audio continues to play when app entering background.
            playWhenInactive={false}
          />
          {this.renderBottomArea()}
        </View>
      )
    } else if(this.props.type == "type"){
      if(this.props.url != ''){
        //console.log("------------ AUDIO --------------");
        //console.log(this.props.item);

        return (
          <View style={[styles.mediaHeight,{backgroundColor:this.props.item.backgroundColor,justifyContent:'center'}]}>
            {this._renderPlayPause()}
            {this.renderAudioIcon()}
            <Video
              ref={(ref) => {this.player = ref}}
              source={{uri: this.props.url}}
              style={{ width: 1, height: 1, position: 'absolute',backgroundColor:'transparent',zIndex:0}}
              repeat={false}
              audioOnly={true}
              volume={10}
              paused={this.state.isPaused}
              playInBackground={false}        // Audio continues to play when app entering background.
              playWhenInactive={false}
              onEnd={()=>this._onFinishedPlay()}
              onProgress={()=>this._playAnimation()}
            />
            {this.renderAudioVisualization()}


            <View style={[styles.bottomArea,{justifyContent:'space-between'}]}>

              <View style={styles.feedText}>
                {this.renderLikes()}
              </View>
              <View style={[styles.feedInteraction]}>
                <TouchableOpacity onPress={()=> this.onChatSelected()}>
                  <Image style={[styles.iconInteraction,{tintColor:'white'}]}
                    source={require('../assets/img/icons/chat.png')}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={this._pressLike}>
                  <Image style={styles.iconInteraction}
                    source={{uri:this.likeImage}}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )
      }else{
        return (
          <View style={[styles.mediaHeight,{backgroundColor:this.props.item.backgroundColor,justifyContent:'center'}]}>
            <Text style={{fontFamily:this.props.font,fontSize:32, color:'white',textAlign:'center',paddingLeft:10,paddingRight:10}}
              numberOfLines={7} ellipsizeMode='tail'>
              {this.props.note.trim()}
            </Text>
            <View style={[styles.bottomArea,{justifyContent:'space-between'}]}>
              <View style={styles.feedText}>
                {this.renderLikes()}
              </View>
              <View style={[styles.feedInteraction]}>
                <TouchableOpacity onPress={()=> this.onChatSelected()}>
                  <Image style={[styles.iconInteraction,{tintColor:'white'}]}
                    source={require('../assets/img/icons/chat.png')}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={this._pressLike}>
                  <Image style={styles.iconInteraction}
                    source={{uri:this.likeImage}}
                  />
                </TouchableOpacity>
              </View>
            </View>

          </View>
        )
      }
    } else if(this.props.type == "audio_caption"){
        //console.log("------------ AUDIO CAPTION --------------");
        //console.log(this.props.item);
        //aaaaaaa
        let metadata = this.props.item.media[0].metadata;
        //console.log(this.props.item);
        return (
          <View>
            {this.renderPlayAudioCaption()}
            {this.renderVideoAudioCaption()}
            <ResizeImage
                  source={this.props.url}
                  originalHeight={metadata.height}
                  originalWidth={metadata.width}
                />
            {this.renderBottomArea()}
          </View>
        );
    }else{
      if(this.props.url == ''){
        return (
          <View style={[styles.mediaHeight,{backgroundColor:'#e9ecef'}]}>
          </View>
        )
      }else{
        if(this.props.item.media[0].hasOwnProperty('metadata')){
          let metadata = this.props.item.media[0].metadata;
          if(metadata.height > metadata.width){
            // <CachedImage style={{flex:1,width:undefined,height:undefined,backgroundColor:'#e9ecef'}}
            return (
              <View style={styles.verticalHeight}>
                <CachedImage style={{flex:1,height:undefined,width:undefined,backgroundColor:'#e9ecef'}}
                      source={{uri: this.props.url}}
                      />
                {this.renderBottomArea()}
              </View>
            )
          }else{
            return (
              <View>
                <ResizeImage
                  source={this.props.url}
                  originalHeight={metadata.height}
                  originalWidth={metadata.width}
                />
                {this.renderBottomArea()}
              </View>
            )
          }
        }else{
          //Support the old images, if the database is delated remove this
          return (
            <View style={styles.mediaHeight}>
              <CachedImage style={{flex:1,width: undefined,height:undefined,resizeMode:'cover',backgroundColor:'#e9ecef'}}
                    source={{uri: this.props.url}}/>
              {this.renderBottomArea()}
            </View>
          )
        }
      }
    }
  }
  renderPlayAudioCaption(){
    if(this.props.item.audio_caption[0] == null || this.props.item.audio_caption[0] == undefined){
      return (null);
    }
    if(!this.props.item.metrics){
      return this._renderPlayPause();
    }
    let icon = this.state.isPaused ? require('../assets/img/icons/play.png') : require('../assets/img/icons/pause.png');
    return (
      <View style={{flexDirection: 'row', position: 'absolute', top: 8, zIndex: 10}}>
        {
          this.state.isPaused ?
            <View style={{flex: 1}}/>
          :
            <View style={{flex: 1}}>
              <AnimationAudio
                height={80}
                metrics={this.props.item.metrics}
                isPlaying={!this.state.isPaused}
              />
            </View>
        }
        <TouchableOpacity
          style={{marginRight: 12}}
          onPress={()=>this._playPause()}>
          <Image style={[styles.iconInteraction,{tintColor:'white'}]}
            source={icon}
          />
        </TouchableOpacity>
      </View>
    );
  }
  renderVideoAudioCaption(){
    if(this.props.item.audio_caption){
      if(this.props.item.audio_caption[0] == null || this.props.item.audio_caption[0] == undefined){
        return (null);
      }
      return(
        <Video
          ref={(ref) => {this.player = ref}}
          source={{uri: this.props.item.audio_caption[0].url}}
          style={{ width: 1, height: 1, position: 'absolute',backgroundColor:'transparent',zIndex:0}}
          repeat={false}
          audioOnly={true}
          volume={10}
          paused={this.state.isPaused}
          playInBackground={false}        // Audio continues to play when app entering background.
          playWhenInactive={false}
          onEnd={()=>this._onFinishedPlay()}
        />
      );
    }else{
      return (null);
    }
  }
  renderAudioVisualization(){
    if(this.props.metrics.length > 0){
      let darkMode = false;
      if(this.props.item.backgroundColor == '#000000'){
        darkMode = true;
      }
      return(
        <View pointerEvents="none" style={{position:'absolute',bottom:0,left:0,right:0,top:0}}>
          <AudioVisualization
            ref={(ref) => this.AudioVisualizationFeed = ref}
            darkMode={darkMode}
            height={MEDIA_HEIGHT}>
          </AudioVisualization>
        </View>

      )
    }
  }

  renderHashtag(item){
    return (
      <View style={styles.container_hashtag}>
        <Text style={styles.txt_hashtag}>{item}</Text>
      </View>
    );
  }
  renderFeedNote(){
    if(this.props.type == "audio_caption"){
      if(this.props.item.hashtags){
        return(
          <FlatList
            horizontal={true}
            contentContainerStyle= {{ alignItems: 'center' }}
            data={this.props.item.hashtags}
            keyExtractor={ (item, index) => index.toString()}
            renderItem={({item})=>this.renderHashtag(item)}
          />
        );
      }else{
        return null;
      }
    }else if(this.props.note.trim() != ''){
      return(
        <View style={[styles.wrapperFeedNote,{alignItems:'flex-start'}]}>
          <Text style={styles.feedNote} numberOfLines={1} ellipsizeMode='tail'>
            {this.props.note.trim()}
          </Text>
        </View>
      )
    }else{
      return null;
    }
  }

  renderAudioIcon(){
    if(this.props.note != ''){
      return(
        <Text style={[styles.txtType,{fontSize:32,fontFamily:this.props.font}]}
          numberOfLines={7} ellipsizeMode='tail'>
          {this.props.note.trim()}
        </Text>
      )
    }else{
      return(
        <View style={styles.audioWrapper}>
          <Image style={{height:50,width:50,tintColor:'white'}}
            source={require('../assets/img/icons/audio.png')}
          />
        </View>
      )
    }
  }

  renderAudioIconSmall(){
    if(this.props.url != ''){
      return(
        <View style={styles.audioWrapperGrid}>
          <Image style={{height:20,width:20,tintColor:'white'}}
            source={require('../assets/img/icons/audio.png')}
          />
        </View>
      )
    }else{
      return null
    }
  }


  renderBottomArea(){
      return(
        <View style={styles.bottomArea}>
          <View style={{flex:1,justifyContent:'center',}}>
            {this.renderFeedNote()}
            <View style={styles.feedText}>
              {this.renderLikes()}
            </View>
          </View>

          <View style={styles.feedInteraction}>

            <TouchableOpacity onPress={()=> this.onChatSelected()}>
              <Image style={[styles.iconInteraction,{tintColor:'white'}]}
                source={require('../assets/img/icons/chat.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={this._pressLike}>
              <Image style={styles.iconInteraction}
                source={{uri:this.likeImage}}
              />
            </TouchableOpacity>
          </View>
        </View>
      )
  }

  renderMediaGrid(){
    if(this.props.type == "video"){
      return (
        <View style={{flex:1}} >
          <Video
            source={{uri: this.props.url}}
            style={{ flex: 1, backgroundColor:'#e9ecef'}}
            repeat={true}
            volume={this.volume}            // 0 is muted, 1 is normal.
            resizeMode="cover"
            playInBackground={false}        // Audio continues to play when app entering background.
            playWhenInactive={false}
          />
        </View>
      )
    } else if(this.props.type == "type"){
      return (
        <View style={{flex: 1,backgroundColor:this.props.item.backgroundColor,justifyContent:'center'}}>
          {this.renderAudioIconSmall()}
          <Text style={[styles.txtType,{fontFamily:this.props.font}]}
            numberOfLines={3} ellipsizeMode='tail'>
            {this.props.note.trim()}
          </Text>
        </View>
      )
    } else if(this.props.type == "audio_caption"){
      return(
        <View style={{flex: 1}}>
        {this.renderAudioIconSmall()}
          <CachedImage style={{ flex: 1, resizeMode: 'cover', backgroundColor:'#e9ecef'}}
                source={{uri: this.props.url}} />
        </View>
      );
    }else{
      return (
        <View style={{flex: 1}}>
          <CachedImage style={{ flex: 1, resizeMode: 'cover', backgroundColor:'#e9ecef'}}
                source={{uri: this.props.url}} />
        </View>
      )
    }
  }

  renderCity(){
    this._getLocation();

    if(this.props.place === undefined){
      return (
        <Text style={styles.place}>
          {this.place}
        </Text>
      )
    }else{
      let place = this.props.place;
      _placeName = "";
      if(place != null){
        if(place.hasOwnProperty("name")){
          _placeName = place.name;
        }
      }

      return (
        <Text style={styles.place}>
          {_placeName}
        </Text>
      )
    }
  }

  calculateTime(date){
    d = new Date(date);
    m = moment(d);
    if(moment().isSame(m,'day')){
      return m.format('LT');
    }else if(moment().subtract(1, 'days').isSame(m,'day')){
      return 'Yesterday';
    }else{
      return m.format('MMMM Do');
    }
  }

  _pressHeart = () => {
      this._pressLike();
  }

  addLike(){
    cameraCoApi.addLike(this.props.id).then((res) => {
      if(res.sucess){
        this.props.handleSaveKey();
      }
    })
  }

  removeLike(){
    cameraCoApi.removeLike(this.props.id).then((res) => {
      if(res.sucess){
        this.props.handleSaveKey();
      }
    })
  }

  renderLikes(){
    if(this.numberLikes){
      let txt = 'likes';
      if (this.numberLikes == 1){
        txt='like';
      }
      return (
        <Text style={styles.likeNumbers}>
          { this.numberLikes + ' ' + txt}
        </Text>
      )
    }else{
      return null
    }
  }

  onChatSelected(){
    cameraCoApi.createConversation(this.props.item.uid)
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
      });
    //this.props.onCommentsPressed(this.props.item);
  }

  renderImageUser(){
    if(this.props.photo){
      return(
        <TouchableOpacity onPress={this._onUserPress}>
          <Image style={styles.userImage}
            source={{uri:this.props.photo+ "?date=" + Date.now()}}
          />
        </TouchableOpacity>
      )
    }else{
      let image = require('../assets/img/icons/profile24.png');
      return(
        <TouchableOpacity onPress={this._onUserPress}>
          <Image style={styles.userImage}
            resizeMode={'center'}
            source={image}
          />
        </TouchableOpacity>
      )
    }
  }

  _pressLike = () => {
    // this.props.handleSaveKey();
   if(this.like){
      //remove like from the client and server
      this.like = false;
      this.forceUpdate();
      //add and remove num,ber of like text
      if(this.numberLikes == 1){
        this.numberLikes = null;
        this.forceUpdate();
      }else{
        this.numberLikes = this.numberLikes - 1;
        this.forceUpdate();
      }
      this.likeImage = 'https://s3.amazonaws.com/fotesapp/app/like.png';
      this.forceUpdate();
      this.removeLike();
    }else{
      //add like to the client and server
      this.like = true;
      this.forceUpdate();
      //add and remove num,ber of like text
      this.numberLikes = this.numberLikes + 1;
      this.forceUpdate();
      this.likeImage = 'https://s3.amazonaws.com/fotesapp/app/like_red.png';
      this.forceUpdate();
      this.addLike();
    }
  }


  navigatePlace = () => {
    this.props.onPlacePressed(this.props.place);
  }


  OnPressMenuDot = () => {
    let item = {}

    if(this.props.uid == this.props.user_id){
      item = {'id':this.props.id,'index':this.props.index};
      this.props.setModalVisible('delete',item)
    }else{
      item = {'uid':this.props.uid,'username':this.props.username,'id':this.props.id};

      if(this.props.following){
        this.props.setModalVisible('unfollow',item)
      }else{
        this.props.setModalVisible('follow',item)
      }
    }
  }


  renderList(){
    return(
      <View style={styles.feed}>
        <View style={styles.feedHeader}>
            {this.renderImageUser()}
            <View style={styles.userData}>
              <TouchableOpacity style={{flexDirection:'row'}} onPress={this._onUserPress}>
                <Text style={styles.username}>
                  {this.props.username}
                </Text>
              </TouchableOpacity>
              {this.renderCity()}
            </View>
            <TouchableOpacity onPress={this.OnPressMenuDot}>
              <Text style={{color:'gray',fontSize:16}}>
              •••
              </Text>
            </TouchableOpacity>
        </View>
        <TouchableOpacity  onPress={this._onGridItemPress} delayLongPress={2000} onLongPress={this._showMenuOption}
          style={styles.feedMedia}>
            {this.renderMedia()}
        </TouchableOpacity>
      </View>
    )
  }

  renderComment(){
    let comments = this.props.comments;
    if(this.props.commentsLength > 0){
      let comment = comments[this.props.commentsLength - 1];
      let url = 'https://s3.amazonaws.com/fotesapp/profiles/'+comment.uid+'.png?date='+Date.now();
      return(
        <View style={styles.wrapperCommentArea}>
          <View style={styles.commentArea}>
              <TouchableOpacity onPress={this._onUserPress}>
                <Image style={styles.userImage}
                  source={{uri:url}}
                />
              </TouchableOpacity>
              <View style={styles.wrapperComment}>
                  <View style={styles.wrapperName}>
                    <Text style={styles.username}>
                      {comment.username}
                    </Text>
                    <Text style={styles.date}>
                      {this.calculateTime(comment.creation_date)}
                    </Text>
                  </View>
                  <View>
                      <Text style={styles.comment}>
                        {comment.comment}
                      </Text>
                  </View>
              </View>
          </View>
          {this.renderLinkComment(comment)}
        </View>
      )
    }else{
      return null
    }
  }

  renderLinkComment(comment){
    let value = this.props.commentsLength - 1;
    if((value) < 1){
      return(
        <TouchableOpacity onPress={() => this._onCommentsPressed(comment)} style={{height:20,justifyContent:'center'}}>
          <Text style={styles.commentLink}>Add a comment...</Text>
        </TouchableOpacity>
      )
    }else{
      let txt = 'comments';
      if(value == 1){
        txt = 'comment';
      }
      return(
        <TouchableOpacity onPress={() => this._onCommentsPressed(comment)} style={{height:20,justifyContent:'center'}}>
          <Text style={styles.commentLink}>{value} more {txt}...</Text>
        </TouchableOpacity>
      )
    }
  }

  _onGridItemPress = () => {
    if(this.props.type == 'video'){
      if(this.volume == 1){
        this.volume = 0;
        this.forceUpdate();
      }
    }
    if(this.props.type == 'type'){
      if((this.props.url != '') && (this.props.mode != 'grid')){
        this.isPaused = true;
        this.setState({
          isPaused: true
        }, ()=>{
          this.player.seek(0);
          this.index = 0;
        });
        /*this.forceUpdate();
        this.forceUpdate(
          () => {
            this.player.seek(0);
            this.index = 0;
          }
        )*/
      }
    }

    this.props.onGridItemPressed(this.props.item,this.props.url,this.like,this.props.likes,this.props.activity,this.props.typeActivity,this.props.commentsLength);
  }

  renderActivityBtns(){
    if(this.props.typeActivity != null){
      if(this.props.typeActivity == 'event'){
        return this.renderThreeBtns()
      }else{
        return this.renderTwoBtns()
      }
    }else{
      return null
    }
  }


  renderTwoBtns(){
      return(
        <View style={styles.bottomAreaActivity}>
          {this.renderFeedNote()}
          <View style={styles.wrapperActivityBtns}>
            <TouchableOpacity style={[styles.activityBtn,styles.cornerLeft,styles.btnInterested]}
              onPress={this.onPressInterested}>
              <Text style={styles.txtWhite}>
                INTERESTED
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.activityBtn,styles.cornerRight,styles.btnNotInterested]}
              onPress={this.onPressNotInterested}>
              <Text style={styles.txtWhite}>
                NOT INTERESTED
              </Text>
            </TouchableOpacity>
          </View>
      </View>
      )
  }

  renderThreeBtns(){
    return(
      <View style={styles.bottomAreaActivity}>
      {this.renderFeedNote()}
      <View style={styles.wrapperActivityBtns}>
        <TouchableOpacity style={[styles.activityBtn,styles.cornerLeft,styles.btnWhatever]}
          onPress={this.onPressGoing}>
          <Text style={styles.txtWhite}>
            GOING
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.activityBtn,styles.middleBtn,styles.btnInterested]}
          onPress={this.onPressInterestedEvent}>
          <Text style={styles.txtWhite}>
            INTERESTED
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.activityBtn,styles.cornerRight,styles.btnNotInterested]}
          onPress={this.onPressNotGoing}>
          <Text style={styles.txtWhite}>
            NOT GOING
          </Text>
        </TouchableOpacity>
      </View>
    </View>

    )
  }

  onPressInterestedEvent = () => {
    if(!this.activity.interested){
      //--------Update actNumbers and activity-------------------------------
      this.actNumbers.interested = this.actNumbers.interested + 1;
      this.activity.interested = true;
      if(this.activity.not_going){
        this.actNumbers.not_going = this.actNumbers.not_going - 1;
        this.activity.not_going = false;
      }
      if(this.activity.going){
        this.actNumbers.going = this.actNumbers.going - 1;
        this.activity.going = false;
      }
      this.forceUpdate();
      //---------------------------------------------------
      cameraCoApi.foteEventInteraction(this.props.id,'interested').then((res) => {
        alert(this.props.username + ' has been notificated.');
      })
    }

  }

  onPressGoing = () => {
    if(!this.activity.going){
      //--------Update actNumbers and activity-------------------------------
      this.actNumbers.going = this.actNumbers.going + 1;
      this.activity.going = true;
      if(this.activity.not_going){
        this.actNumbers.not_going = this.actNumbers.not_going - 1;
        this.activity.not_going = false;
      }
      if(this.activity.interested){
        this.actNumbers.interested = this.actNumbers.interested - 1;
        this.activity.interested = false;
      }
      this.forceUpdate();

      //---------------------------------------------------
      cameraCoApi.foteEventInteraction(this.props.id,'going').then((res) => {
        alert(this.props.username + ' has been notificated.');
      })
    }
  }

  onPressNotGoing = () => {
    if(!this.activity.not_going){
      //--------Update actNumbers-------------------------------
      this.actNumbers.not_going = this.actNumbers.not_going + 1;
      this.activity.not_going = true;
      if(this.activity.going){
        this.actNumbers.going = this.actNumbers.going - 1;
        this.activity.going = false;
      }
      if(this.activity.interested){
        this.actNumbers.interested = this.actNumbers.interested - 1;
        this.activity.interested = false;
      }
      this.forceUpdate();
      //---------------------------------------------------
      cameraCoApi.foteEventInteraction(this.props.id,'not_going').then((res) => {
        alert(this.props.username + ' has been notificated.');
      });
    }
  }

  onPressNotInterested = () => {
    if(!this.activity.not_interested){
      //--------Update actNumbers-------------------------------
      this.actNumbers.not_interested = this.actNumbers.not_interested + 1;
      this.activity.not_interested = true;
      if(this.activity.interested){
        this.actNumbers.interested = this.actNumbers.interested - 1;
        this.activity.interested = false;
      }
      this.forceUpdate();
      //---------------------------------------------------
      if(this.props.typeActivity == 'task'){
        cameraCoApi.foteTaskInteraction(this.props.id,'not_interested').then((res) => {
          alert(this.props.username + ' has been notificated.');

        })
      }else{
        cameraCoApi.foteTripInteraction(this.props.id,'not_interested').then((res) => {
          alert(this.props.username + ' has been notificated.');
        })
      }
    }
  }

  onPressInterested = () => {
    if(!this.activity.interested){
        //--------Update actNumbers-------------------------------
        this.actNumbers.interested = this.actNumbers.interested + 1;
        this.activity.interested = true;
        if(this.activity.not_interested){
          this.actNumbers.not_interested = this.actNumbers.not_interested - 1;
          this.activity.not_interested = false;
        }
        this.forceUpdate();
        //---------------------------------------------------
      if(this.props.typeActivity == 'task'){
        cameraCoApi.foteTaskInteraction(this.props.id,'interested').then((res) => {
          alert(this.props.username + ' has been notificated.');
        })
      }else{
        cameraCoApi.foteTripInteraction(this.props.id,'interested').then((res) => {
          alert(this.props.username + ' has been notificated.');
        })
      }
    }
  }

  renderTxtInteraction(){
    if(this.props.typeActivity != null){
      if(this.props.typeActivity == 'event'){
        return(
          <View style={styles.wrapperTxtInteraction}>
            {this.renderTxt('Going',this.actNumbers.going,'#429dff')}
            {this.renderTxt('Interested',this.actNumbers.interested,'#a26ea2')}
            {this.renderTxt('Not going',this.actNumbers.not_going,'#429dff')}
          </View>
        )
      }else if(this.props.typeActivity == 'trip'){
        return(
          <View style={styles.wrapperTxtInteraction}>
            {this.renderTxt('Interested',this.actNumbers.interested,'#429dff')}
            {this.renderTxt('Not interested',this.actNumbers.not_interested,'#a26ea2')}
          </View>
        )
      }else{
        return(
          <View style={styles.wrapperTxtInteraction}>
            {this.renderTxt('Interested',this.actNumbers.interested,'#429dff')}
            {this.renderTxt('Not interested',this.actNumbers.not_interested,'#a26ea2')}
          </View>
        )
      }
    }else{
      return null
    }
  }

  renderTxt(txt,number,color){
    if(number != 0){
      return(
        <Text style={{fontSize:16,color:color}}>{txt + ' ' + number + ' '}</Text>
      )
    }
  }

  _onUserPress = () => {
    let user = {
      uid: this.props.uid,
      username: this.props.username,
      photo: this.props.photo +  "?date=" + Date.now(),
      description: this.props.description,
      followers: this.props.followers
    }
    if(this.props.user_id == this.props.uid){
      user.showSettings = true;
    }else{
      user.showSettings = false;
    }

    if(this.props.type == 'type'){
      if(this.props.url != ''){
        this.isPaused = true;
        this.forceUpdate();
        this.forceUpdate(
          () => {
            this.player.seek(0);
            this.index = 0;
          }
        )
      }
    }

    this.props.onUserPressed(user);
  }

  renderNumberComments(){
    if(this.props.commentsLength > 0){
      let txt = '';
      if(this.numberLikes){
        txt = ' ' + ' - ' + ' ';
      }
      if(this.props.commentsLength == 1){
        txt = txt + this.props.commentsLength + ' comment';
      }else{
        txt = txt + this.props.commentsLength + ' comments';
      }
      return(
        <Text style={{color:'white',fontSize:14}}>{txt}</Text>
      )
    }else{
      return null
    }
  }

  _showMenuOption = () => {
    if(this.props.uid == this.props.user_id){
      item = {'id':this.props.id,'index':this.props.index};
      this.props.setModalVisible('delete',item);
    }
  }

  renderAnnotations(){
    return (
      <View>
      </View>
    )
  }

  render() {
    if(this.props.mode == "list"){
      return(
        <View>
          {this.renderList()}
        </View>
      )
    }else{
      return(
        <TouchableOpacity style={styles.feedGrid} onPress={this._onGridItemPress}>
          {this.renderMediaGrid()}
        </TouchableOpacity>
      )
    }
  }

}


class FeedList extends React.PureComponent {
  constructor (props) {
  super(props)

  this.viewabilityConfig = {
      viewAreaCoveragePercentThreshold: 50
    }
    this.isViewable=null;
    this.indexViewable = null;
  }

  _keyExtractor = (item, index) => index;

  _renderImage = ({item,index}) => (
    <MyListItem
      index={index}
      item={item}
      url={this._getUrl({item})}
      note={item.note}
      type={item.type}
      location={item.location}
      uid={item.user[0].uid}
      username={item.user[0].username}
      photo={item.user[0].photo + "?date=" + Date.now()}
      id={item._id}
      user_id={this.props.user_id}
      onCommentsPressed={(item) => this.props.onCommentsPressed(item)}
      onGoChat={(item, conversation)=>this.props.onGoChat(item, conversation)}
      like={this._isLiked({item})}
      likeImage={this._getImage({item})}
      likes={this._likes({item})}
      onPlacePressed={(item) => this.props.onPlacePressed(item)}
      place={item.place}
      mode={this.props.mode}
      onGridItemPressed={(item,url,like,numLikes,activity,activityType,numComments) => this.props.onGridItemPressed(item,url,like,numLikes,activity,activityType,numComments)}
      onUserPressed={(item) => this.props.onUserPressed(item)}
      typeActivity={this._getType({item})}
      activityNumbers={this._countActivity({item})}
      activity={this._getActivity({item})}
      comments={item.comments_with_user}
      commentsLength={item.comments_with_user.length}
      followers={this._getFollowers(item.user[0])}
      following={this._isFollowing({item})}
      description={this._getDescription(item.user[0])}
      setModalVisible={this.props.setModalVisible}
      currentPage={this.props.currentPage}
      isViewable={this.isViewable}
      indexViewable={this.indexViewable}
      font={this._getFont({item})}
      metrics={this._getMetrics({item})}
      handleSaveKey={() => {this.props.handleSaveKey()}}
    />
  );

  _renderSeparator = () => {
    if(this.props.numColumns == 1){
      return(
        <View style={styles.divider}>
        </View>
      )
    }else{
      return null
    }
  }


  _isLiked({item}){
    let isLiked = false;
    if(item.hasOwnProperty('likes_by') ){
      let array = item.likes_by;

      for(i = 0; i < array.length; i++){
        if(this.props.user_id == array[i]){
          isLiked = true;
          break;
        }
      }
    }
    return isLiked
  }

  _getImage({item}){
    let image = 'https://s3.amazonaws.com/fotesapp/app/like.png';
    let like = this._isLiked({item});
    if(like){
      image = 'https://s3.amazonaws.com/fotesapp/app/like_red.png';
    }
    return image
  }

  _likes = ({item}) => {
    let likes = null;
    if(item.hasOwnProperty('likes_by')){
      if (item.likes_by.length != 0){
        likes = item.likes_by.length
      }
    }
    return likes;
  }

  _getUrl = ({item}) => {
    let url = '';
    if(item.type == "video"){
      url = item.media[0].url;
    }else if(item.type == "type"){
      if(item.media.length > 0){
        url = item.media[0].url;
      }
    }else if( item.type == "audio_caption" ){
      url = item.thumbnails[0].url;
    }else if( (item.hasOwnProperty('thumbnails')) && (item.thumbnails[0] !== undefined) ){
      url = item.thumbnails[0].url;
    }
    return url;
  }

  _getActivity = ({item}) => {
    let info = null;
    if(item.hasOwnProperty('activity')){
      let activity = item.activity;
      if(activity.type == 'event'){
        info = {
          going:this._checkActivity(activity.going),
          interested:this._checkActivity(activity.interested),
          not_going:this._checkActivity(activity.not_going)
        };
      } else{
        info = {
          interested:this._checkActivity(activity.interested),
          not_interested:this._checkActivity(activity.not_interested)
        };
      }
    }
    return info;
  }

  _checkActivity = (array) => {
    let check = false;
    if(array.length != 0){
      for(i = 0; i < array.length; i++){
        if(this.props.user_id == array[i]){
          check = true;
          break;
        }
      }
    }
    return check;
  }

  _getType = ({item}) => {
    let type = null;
    if(item.hasOwnProperty('activity')){
      type = item.activity.type;
    }
    return type;
  }

  _countActivity = ({item}) => {
    let info = null;
    if(item.hasOwnProperty('activity')){
      let activity = item.activity;
      if(activity.type == 'event'){
        info = {going:null,interested:null,not_going:null};
        info.going = activity.going.length;
        info.interested = activity.interested.length;
        info.not_going = activity.not_going.length;
      } else{
        info = {interested:null,not_interested:null};
        info.interested = activity.interested.length;
        info.not_interested = activity.not_interested.length;
      }
    }
    return info;
  }

  _getFollowers = (user) => {
    let followers = [];
    if(user.hasOwnProperty('followers')){
      followers = user.followers;
    }
    return followers;
  }

  _getDescription = (user) => {
    let description = '';
    if(user.hasOwnProperty('description')){
      description = user.description;
    }
    return description;
  }

  _isFollowing = ({item}) => {
    if(item.is_following){
      return true;
    }else{
      return false;
    }
  }

  _onViewableItemsChanged = ({ viewableItems, changed }) => {
     // alert("Changed in this iteration"+ JSON.stringify(changed));
     // alert("viewableItem in this iteration"+ JSON.stringify(viewableItems));
     if(viewableItems.length > 0){
      console.log('-------------------------');

      let viewItem =viewableItems[0];

       if((viewItem.isViewable)){
         // alert("Changed in this iteration"+ JSON.stringify(changed));
         // alert("viewableItem in this iteration"+ JSON.stringify(viewableItems));
         this.isViewable=true;
         this.indexViewable = viewItem.index;
         console.log('viewableItem: ' + this.indexViewable);
         // this.
       }
       if((!viewItem.isViewable)){
         // this.indexViewable = viewItem.index;

         // this.isViewable=false;
         // this.indexViewable = viewItem.index;
         console.log('No viewable: ' + viewItem.index);
       }

     }
     if(changed.length > 0){
       let itemChange = changed[0];

       if( (itemChange.isViewable)){
         // alert("Changed"+ JSON.stringify(changed));
         // alert("viewableItem in this iteration"+ JSON.stringify(viewableItems));
         // this.indexViewable = itemChange.index;
         this.isViewable=false;
         console.log('changed Viewable: ' + itemChange.index);

       }
       // if( (!itemChange.isViewable) && (itemChange.index == this.indexViewable)){
       //   // alert("Changed"+ JSON.stringify(changed));
       //   // alert("viewableItem in this iteration"+ JSON.stringify(viewableItems));
       //   this.indexViewable = -1;
       //   this.isViewable=false;
       //   console.log('no changed viewable: ' + this.indexViewable);
       // }
     }
  }

  _getFont({item}){
    let font = 'system font'
    if(item.hasOwnProperty('font')){
      if(item.font != ''){
        return font = item.font;
      }
    }
    return font
  }

  _getMetrics({item}){
    let metrics = [];
    if(item.hasOwnProperty('metrics')){
      if(item.metrics.length > 0){
        metrics = item.metrics;
      }
    }
    return metrics;
  }

  _handleRefresh = () => {
     this.props.handleRefreshFeed();
  }

  render() {
    return (
      <FlatList
          style={styles.container}
          data={this.props.data}
          numColumns={this.props.numColumns}
          key={this.props.numColumns}
          extraData={this.props.extraData}
          viewabilityConfig={this.viewabilityConfig}
          onViewableItemsChanged={this._onViewableItemsChanged}
          refreshing={this.props.refreshingFeed}
          onRefresh={this._handleRefresh}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderImage}
          ItemSeparatorComponent={this._renderSeparator}
          currentPage={this.props.currentPage}
      />
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  divider:{
    height:3,
    backgroundColor:'white',
  },
  feed:{
    flexDirection:'column',
    backgroundColor:'#f7f7f7',
  },
  feedHeader:{
    height: 80,
    paddingTop:10,
    flexDirection:'row',
    alignItems:'center',
    paddingLeft:20,
    paddingRight:20,
  },
  feedMedia:{
    paddingBottom:20,
    backgroundColor:'#f7f7f7',
  },
  mediaHeight:{
    height:MEDIA_HEIGHT
  },
  verticalHeight:{
    minHeight:ITEM_HEIGHT
  },
  feedNote:{
    fontSize:14,
    color:'white',
  },
  feedText:{
    flexDirection:'row',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.4,
    shadowRadius: 1,
  },
  userImage:{
    height:40,
    width:40,
    borderRadius:20,
    backgroundColor:'#e9ecef'
  },
  userData:{
    flex:1,
    paddingLeft:15,
    flexDirection:'column',
    justifyContent:'center',
  },
  username:{
    fontSize:16,
    color:'black',
  },
  followTxt:{
    fontSize:16,
    color:'#60b9dc',
    paddingLeft:5
  },
  place:{
    fontSize:12,
    color:'gray',
  },
  date:{
    color:"gray",
    fontSize:12,
  },
  start_wrapper:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  start_text:{
    fontSize:16
  },
  wrapper_btn:{
    marginTop:20,
    width:100,
    height: 35,
    borderWidth: 1.5,
    borderColor:'#a5005c',
    borderRadius:14,
    justifyContent:'center',
    alignSelf:'center'
  },
  txt_btn:{
    color:'#a5005c',
    textAlign:'center',
    fontSize:16,
  },
  feedInteraction:{
    flexDirection:'row',
    height:40,
    alignItems:'center'
  },
  iconInteraction:{
    height:26,
    width:26,
    marginLeft:15,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  likeNumbers:{
    fontSize:14,
    color:'white',
  },
  commentLink:{
    fontSize:16,
    color:'#5fb5dc'
  },
  feedGrid:{
    height:ITEM_WIDTH,
    width:ITEM_WIDTH,
    backgroundColor:"#f7f7f7",
    borderWidth:2,
    borderColor:'#f7f7f7'
  },
  wrapperActivityBtns:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    marginTop:10
  },
  activityBtn:{
    height:50,
    width:120,
    justifyContent:'center',
    alignItems:'center'
  },
  txtWhite:{
    fontSize:12,
    color:'white'
  },
  btnInterested:{
    backgroundColor:'#5cb4dc',
  },
  btnNotInterested:{
    backgroundColor:'#987498'
  },
  btnWhatever:{
    backgroundColor:'#ef5d82'
  },
  wrapperFeedNote:{
    justifyContent:'center',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.4,
    shadowRadius: 1,
  },
  container_hashtag:{
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 2,
    paddingBottom: 2,
  },
  txt_hashtag:{
    fontSize: 15,
    color: '#ffffff'
  },
  wrapperShadowMedia:{
    flex:1,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
  },
  wrapperTxtInteraction:{
    flex:1,
    flexDirection:'row',
    justifyContent:'flex-end',
  },
  wrapperComment:{
    flex:1,
  },
  wrapperName:{
    height:20,
    paddingLeft:15,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  commentArea:{
    minHeight:60,
    flexDirection:'row',
    backgroundColor:'white'
  },
  wrapperCommentArea:{
    minHeight:100,
    maxHeight:200,
    flexDirection:'column',
    paddingLeft:50,
    paddingRight:50,
    paddingTop:10,
    paddingBottom:10,
    backgroundColor:'white',
    justifyContent:'center'
  },
  comment:{
    flexGrow:1,
    fontSize:16,
    color:'black',
    // backgroundColor:'pink',
    paddingTop:10,
    paddingLeft:15,
    paddingBottom:10
  },
  topArea:{
    position:'absolute',
    top:0,
    right:0,
    left:0,
    zIndex:1,
    alignItems:'flex-end',
    backgroundColor:'transparent'
  },
  tagPrice:{
    paddingLeft:30,
    paddingRight:20,
    paddingTop:20,
    paddingBottom:20,
    justifyContent:'center',
    backgroundColor:'rgba(255, 255, 255,0.7)',
    borderBottomLeftRadius: 60,
  },
  price:{
    fontSize:20,
    color:'black',
  },
  cornerLeft:{
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    marginRight:5,
  },
  cornerRight:{
    marginLeft:5,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  middleBtn:{
    marginRight:5,
    marginLeft:5,
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
  bottomArea:{
    flexDirection:'row',
    alignItems:'center',
    paddingLeft:20,
    paddingRight:20,
    minHeight:40,
    maxHeight:80,
    position:'absolute',
    left:0,
    right:0,
    bottom:0,
  },
  bottomAreaActivity:{
    height:100,
    position:'absolute',
    left:0,
    right:0,
    bottom:0,
    justifyContent:'center'
  },
  annotationFill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ef6185',
    transform: [{ scale: 0.6 }],
  },
  annotationFillDestination: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF0000',
    transform: [{ scale: 0.6 }],
  },
  volumeBtn:{
    zIndex:1,
    position:'absolute',
    top:8,
    right:12,
  },
  audioWrapper:{
    position:'absolute',
    left:0,
    right:0,
    zIndex:1,
    alignItems:'center'
  },
  audioWrapperGrid:{
    position:'absolute',
    top:5,
    right:5,
    zIndex:1,
    alignItems:'center'
  },
  txtType:{
    fontSize:22,
    color:'white',
    textAlign:'center',
    alignSelf:'center',
    position:'absolute',
    paddingLeft:10,
    paddingRight:10,
    left:0,
    right:0,
    zIndex:1
  }
});

export default FeedList;
