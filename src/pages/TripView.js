import React, { Component } from 'react';
import {Alert,Linking,ScrollView,Share,Dimensions,TextInput,StyleSheet, Text, View,FlatList,Image,TouchableOpacity,StatusBar } from 'react-native';
import moment from 'moment';
import Video from "react-native-video";
import { getStatusBarHeight } from 'react-native-status-bar-height';
import cameraCoApi from "../api/CameraCoApi";
import Moment from 'moment';

statusBarHeight = getStatusBarHeight();

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
  renderDate(){
    Moment.locale('en');
      return Moment(this.state.item.activity.date).format('MMM d HH:MM YYYY')
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
          <ScrollView style={styles.settings}>
            <View style={styles.setting}>
              <Text style={styles.setting_name}>From</Text>
                <Text style={styles.section_txt}>
                  {this.state.item.activity.from_place.name}
                </Text>
            </View>
            <View style={styles.setting}>
              <Text style={styles.setting_name}>To</Text>
                <Text style={styles.section_txt}>
                  {this.state.item.activity.to_place.name}
                </Text>
            </View>
            <View style={styles.setting}>
              <Text style={styles.setting_name}>When </Text>
                <Text style={styles.section_txt}>
                  {this.renderDate()}
                </Text>
            </View>
            <View style={styles.setting}>
              <Text style={styles.setting_name}>Seats</Text>
                <Text style={[styles.section_txt]}>{this.state.item.activity.seats}</Text>
            </View>
            <View style={styles.setting}>
              <Text style={styles.setting_name}>Price p/seat (USD)</Text>
              <Text style={[styles.section_txt]}>{this.state.item.activity.price}</Text>
            </View>



          </ScrollView>

        </View>
        {this.renderBtns()}
      </View>
    )
  }

  renderBtns(){
    let activity = this.state.item.activity;
      return(
        <View style={styles.wrapperBtns}>
          <TouchableOpacity style={[styles.btnFull]} onPress={() => {this.joinRide()}}>
            <Text style={{fontSize:25,color:'white',fontFamily:"Lato-Bold",fontWeight:"bold"}}>
              JOIN RIDE
            </Text>
          </TouchableOpacity>

        </View>
      )
  }
  joinRide(){
    cameraCoApi.foteTripInteraction(this.state.item._id,'interested').then((res) => {
      alert( this.state.item.user[0].name + ' have been notificated.');
    })
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
          $150 USD
        </Text>
      )
    }else{
      return null
    }
  }
  renderLine(){
    if(this.state.item.activity.from_place.geometry.location.lng != null){
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
                    this.state.item.activity.from_place.geometry.location.lng,this.state.item.activity.from_place.geometry.location.lat,
                  ],
                  [
                    this.state.item.activity.to_place.geometry.location.lng,this.state.item.activity.to_place.geometry.location.lat,
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
  renderAnnotations(){
    return (
      <View>
      </View>
    )
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
    flex:0.3,
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
    flex:0.7,
    paddingTop:20,
  },
  btn:{
    height:60,
    width:120,
    alignItems:'center',
    justifyContent:'center',
    borderRadius:12,
  },
  btnFull:{
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:"#85dfe0",
    flex:1,
    height:80
  },
  wrapperBtns:{
    height:80,
    backgroundColor:'white',
    flexDirection:'row',
    justifyContent:'space-around',
    alignItems:'center'
  },
  settings:{
  },
  setting:{
    height:50,
    marginLeft:20,
    marginRight:20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  setting_name:{
    color:"#5c5c5c",
    fontSize:17
  },
  section_name:{
    fontSize:15,
    color:"#a4a4a4",
    fontFamily:"Lato-Hairline",
    fontWeight:"bold",
    marginLeft:10

  },
  section_txt:{
    color:"#f24e86",
    fontSize:17,
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
  }
});

export default EventTaskView;
