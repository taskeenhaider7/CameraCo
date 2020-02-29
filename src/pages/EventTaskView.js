import React, { Component } from 'react';
import {StyleSheet, Text, View,FlatList,Image,TouchableOpacity,StatusBar } from 'react-native';
import moment from 'moment';
import Video from "react-native-video";
import { getStatusBarHeight } from 'react-native-status-bar-height';

statusBarHeight = getStatusBarHeight();
import cameraCoApi from "../api/CameraCoApi";

const likeImage = 'https://s3.amazonaws.com/fotesapp/app/like.png';
const dontlikeImage = 'https://s3.amazonaws.com/fotesapp/app/like_red.png';

class EventTaskView extends React.Component{
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
      volume:0,
    }
  }

  componentWillMount(){
    const {state} = this.props.navigation;
    let item = state.params.item;
    this.setState({
        "id": item._id,
        "item": item,
        "user": item.user[0],
        'location': item.location,
        'note':item.note,
        'url':state.params.url,
        'isLiked':state.params.isLiked,
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
  }

  _activateVolume = () => {
    if(this.state.volume == 1){
      this.setState({volume:0});
    }else{
      this.setState({volume:1});
    }
  };

  renderMediaContent(){
    if(this.state.type == "video"){
      return (
        <TouchableOpacity style={{flex:1}} onPress={this._activateVolume}>
          <Video
            source={{uri: this.state.url}}
            style={{ flex: 1, backgroundColor:'#e9ecef'}}
            repeat={true}
            ignoreSilentSwitch={"ignore"}
            volume={this.state.volume}            // 0 is muted, 1 is normal.
            resizeMode="cover"
            playInBackground={false}        // Audio continues to play when app entering background.
            playWhenInactive={false}
          />
        </TouchableOpacity>
      )
    } else if(this.state.type == "type"){
      return (
        <View style={{flex: 0.5,backgroundColor:this.state.item.backgroundColor,justifyContent:'center'}}>
          <Text style={{fontSize:22, color:'white',textAlign:'center'}}>
            {this.state.note}
          </Text>
        </View>
      )
    } else{
      if(this.state.url == ''){
        return(
          <View style={{flex: 1,backgroundColor:'#e9ecef'}}>
          </View>
        )
      }else{
        return (
            <Image
              style={{ flex: 1, width:undefined, height:undefined, resizeMode:'cover',backgroundColor:'#e9ecef'}}
              source={{uri: this.state.url}}
            />
        )
      }
    }
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

  _onCommentsPressed(){
      this.props.navigation.navigate({routeName:'Comments',params:{item:this.state.item}});
  }

  renderImageUser(){
    if(this.state.user.photo){
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

  pressLike(){

    if(this.state.isLiked){
      //remove like from the client and server
      //add and remove num,ber of like text
      // if(this.state.numberLikes == 1){
      //   this.setState({numberLikes:null});
      // }else{
      //   this.setState({numberLikes:this.state.numberLikes - 1});
      // }
      this.setState({isLiked:false});
      this.removeLike();
    }else{
      //add like to the client and server
      //add and remove num,ber of like text
      // this.setState({numberLikes:this.state.numberLikes + 1});
      this.setState({isLiked:true});
      this.addLike();
    }
  }

  navigatePlace = () => {
    let place = this.state.place;
    this.props.navigation.navigate({routeName:'PlaceInfo',
      params:{place:place, photo_reference:place.photos[0].photo_reference}});
  }

  renderLikeImage(){
    if(this.state.isLiked){
      return(
        <Image style={[styles.iconInteraction,{tintColor:'red'}]}
          source={{uri:likeImage}}
        />
      )
    }else{
      return(
        <Image style={[styles.iconInteraction,{tintColor:'white'}]}
          source={{uri:dontlikeImage}}
        />
      )
    }
  }
  _onDownloadPressed(){
    cameraCoApi.downloadFile(this.state.url)
  }
  renderDownloadButton(){
    if(this.state.url == ''){
      return (null)
    }else{
      return(
        <TouchableOpacity style={{marginLeft:20}} onPress={() => this._onDownloadPressed()}>
          <Image style={[styles.iconInteraction,{tintColor:'white'}]}
            source={require('../assets/img/icons/download.png')}
          />
        </TouchableOpacity>
      )
    }
  }
  renderTopBar(){
    return(
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => this._goBack()}>
          <Image style={[styles.iconInteraction,{tintColor:'white'}]}
            source={require('../assets/img/icons/back.png')}
          />
        </TouchableOpacity>

        <View style={{flexDirection:'row',justifyContent:'flex-end'}}>
          <TouchableOpacity onPress={() => this._onCommentsPressed()}>
            <Image style={[styles.iconInteraction,{tintColor:'white'}]}
              source={require('../assets/img/icons/chat.png')}
            />
          </TouchableOpacity>
          {this.renderDownloadButton()}
          <TouchableOpacity style={{marginLeft:20}} onPress={this._pressHeart}>
            {this.renderLikeImage()}
          </TouchableOpacity>
        </View>

      </View>
    )
  }

  _goBack(){
     const {goBack} = this.props.navigation;
     goBack()
  }

  renderBottomArea(){
    return(
      <View style={styles.bottomArea}>
        <View style={styles.mainCommentAreaWrapper}>
            <View style={styles.shadowWrapper}>
              {this.renderImageUser(this.state.user)}
            </View>
            <View style={styles.commentTitle}>
              <Text style={styles.username}>
                {this.state.user.username + ' '}
              </Text>
              {this.renderPlace(this.state.place)}
            </View>
            {this.renderPrice()}

        </View>
        <View style={styles.main_comment}>
          <Text style={styles.comment}>
            {this.state.note}
          </Text>
          <Text style={styles.date}>
            {this.calculateTime(this.state.item.creation_date)}
          </Text>
        </View>
        {this.renderBtns()}
      </View>
    )
  }
  interact(interaction){
    cameraCoApi.foteTripInteraction(this.state.item._id,interaction).then((res) => {
      alert( this.state.item.user[0].name + ' have been notificated.');
    })
  }
  renderBtns(){
    let activity = this.state.item.activity;
    if(activity.type == 'task'){
      return(
        <View style={styles.wrapperBtns}>
          <TouchableOpacity style={[styles.btn,styles.cornerLeft,{backgroundColor:'#5cb4dc'}]}
            onPress={() => this.interact("interested")}>
            <Text style={{fontSize:12,color:'white'}}>
              INTERESTED
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn,styles.cornerRight,{backgroundColor:'#987498'}]}
            onPress={() => this.interact("not_interested")}>
            <Text style={{fontSize:12,color:'white'}}>
              NOT INTERESTED
            </Text>
          </TouchableOpacity>
        </View>
      )
    }else{
      return(
        <View style={styles.wrapperBtns}>
          <TouchableOpacity style={[styles.btn,styles.cornerLeft,{backgroundColor:'#ef5d82'}]}
            onPress={() => this.interact("going")}>
            <Text style={{fontSize:12,color:'white'}}>
              GOING
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn,styles.middleBtn,{backgroundColor:'#5cb4dc'}]}
            onPress={() => this.interact("interested")}>
            <Text style={{fontSize:12,color:'white'}}>
              INTERESTED
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn,styles.cornerRight,{backgroundColor:'#987498'}]}
            onPress={() => this.interact("not_going")}>
            <Text style={{fontSize:12,color:'white'}}>
              NOT GOING
            </Text>
          </TouchableOpacity>
        </View>
      )
    }
  }

  renderPlace(){
    let place =this.state.place;
    if(place !== undefined){
      return(
        <TouchableOpacity onPress={()=> this.navigatePlace()}>
          <Text style={styles.placeName}>
            {place.name}
          </Text>
        </TouchableOpacity>
      )
    }else{
      return null
    }
  }

  renderPrice(){
    let activity = this.state.item.activity;
    if(activity.type == 'task'){
      return(
        <Text style={{fontSize:20,fontWeight:'bold'}}>
          ${this.state.item.activity.price} USD
        </Text>
      )
    }else{
      return null
    }
  }

  renderAnnotations(){
    return (null)
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
          {this.renderBottomArea()}
        </View>
      </View>
    )
  }

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  topBar:{
    flexDirection:'row',
    height:80,
    paddingTop:statusBarHeight,
    paddingLeft:20,
    paddingRight:20,
    justifyContent:'space-between',
    position:'absolute',
    left:0,
    right:0,
    top:0,
    zIndex:1,
  },
  feed:{
    flex:1,
    flexDirection:'column',
  },
  feedMedia:{
    flex:0.5,
  },
  userImage:{
    height:40,
    width:40,
    borderRadius:20,
    backgroundColor:'#e9ecef'
  },
  username:{
    fontSize:18,
    color:'black',
  },
  placeName:{
    fontSize:14,
    color:'#9b9b9b'
  },
  date:{
    paddingTop:10,
    fontSize:14,
    color:'#9b9b9b',
  },
  iconInteraction:{
    height:26,
    width:26,
  },
  shadowWrapper:{
    height:40,
    width:40,
    shadowColor: 'black',
    shadowOpacity: 0.6,
    shadowRadius: 1.5,
    shadowOffset: {
        height: 1,
        width: 1
    }
  },
  mainCommentAreaWrapper:{
    height:40,
    flexDirection:'row',
    paddingLeft:30,
    paddingRight:20,
  },
  commentTitle:{
    flex:1,
    flexDirection:'column',
    paddingLeft:15,
  },
  main_comment:{
    flex:1,
    padding:20,
    flexWrap:'wrap',
  },
  comment:{
    fontSize:16,
    color:'black',
  },
  bottomArea:{
    flex:0.5,
    paddingTop:20,
  },
  btn:{
    height:60,
    width:120,
    alignItems:'center',
    justifyContent:'center',
  },
  wrapperBtns:{
    height:120,
    backgroundColor:'white',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'
  },
  cornerLeft:{
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    marginRight:5,
  },
  cornerRight:{
    marginLeft:5,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
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
  }
});

export default EventTaskView;
