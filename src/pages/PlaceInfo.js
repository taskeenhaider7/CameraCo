import React, { Component } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  StatusBar,
  TextView,
  TextInput,
  Linking,
  Dimensions,
  ImageBackground,
} from 'react-native';
import cameraCoApi from "../api/CameraCoApi";
import { isIphoneX } from 'react-native-iphone-x-helper'
import { ifIphoneX } from 'react-native-iphone-x-helper'
import { getStatusBarHeight } from 'react-native-status-bar-height';
import {  NavigationActions } from 'react-navigation';
import TopBar from "../components/TopBar";
const statusBarHeight = getStatusBarHeight();
const API_KEY = 'AIzaSyCBVknPmd2_GTpjP0pXjHvTAqYDBNqYgA0';
const url = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=';
const { height, width} = Dimensions.get('window');
const ITEM_WIDTH = width/3;

export default class PlaceInfo extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      places: {},
      name:'',
      photo:'',
      address:'',
      phone:'',
      web:'',
      gmaps_link:'',
      fotes:[],
      me:{}
    }
  }

  componentDidMount(){
    const {state} = this.props.navigation;
    this.setState({
      "place":state.params.place,
      'name':state.params.place.name,
    })
    if(state.params.photo_reference != ''){
      this.setState({'photo': url+state.params.photo_reference+'&key='+API_KEY});
    }
    cameraCoApi.getFotesByPlaceId(state.params.place.place_id).then((res) => {
      if(res.success){
        this.setState({"fotes":res.fotes.reverse()},() => this.forceUpdate());
      }
    });
    //get place details
    cameraCoApi.placeDetails(state.params.place.place_id).then((res) => {
      if(res.success){
        if(res.place.hasOwnProperty('vicinity')){
          this.setState({"address":res.place.vicinity});
        }
        if(res.place.hasOwnProperty('international_phone_number')){
          this.setState({"phone":res.place.international_phone_number});
        }
        if(res.place.hasOwnProperty('website')){
          this.setState({"web":res.place.website});
        }
        if(res.place.hasOwnProperty('url')){
          this.setState({"gmaps_link":res.place.url});
        }
      }
    })
    cameraCoApi.getMe().then((res) => {
      if(res.hasOwnProperty("name")){
        this.setState({me:res})
      }
    });
  }

  renderAddress(){
    if(this.state.address){
      return(

        <TouchableOpacity onPress={this.goGoogleMaps.bind(this,this.state.gmaps_link)}>

          <View style={styles.detail}>
            <Image style={styles.detailIcon}
              source={require('../assets/img/icons/location_black.png')}
            />
            <Text style={styles.detailText}>
              {this.state.address}
            </Text>
          </View>
        </TouchableOpacity>


      )
    }else{
      return null
    }
  }
  makeCall(number){
    Linking.openURL("tel:"+number)
  }
  renderPhone(){
    if(this.state.phone){
      return(
        <TouchableOpacity onPress={this.makeCall.bind(this,this.state.phone)}>
          <View style={styles.detail} >

            <Image style={styles.detailIcon}
              source={require('../assets/img/icons/phone.png')}
            />
            <Text style={styles.detailText}>
              {this.state.phone}
            </Text>
          </View>
        </TouchableOpacity>

      )
    }else{
      return null
    }
  }

  renderWeb(){
    if(this.state.web){
      return(
        <TouchableOpacity onPress={this.visitSite.bind(this,this.state.web)}>
          <View style={styles.detail}>
            <Image style={styles.detailIcon}
              source={require('../assets/img/icons/web.png')}
            />
            <Text style={styles.detailText}>
              {this.state.web}
            </Text>
          </View>
        </TouchableOpacity>
      )
    }else{
      return null
    }
  }
  visitSite(link){
    Linking.openURL(link);
  }
  goGoogleMaps(link){
      Linking.openURL(link);
  }
  goToFote(fote,url){
    let like = this._isLiked(fote);
    let numLikes = this._likes(fote);
    this.props.navigation.navigate({key:'FoteView',routeName:'FoteView',
      params:{
        item:fote,
        url:url,
        isLiked:like,
        numLikes:numLikes
      }
    });
  }
  _isLiked(item){
    let isLiked = false;
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
  renderFote(fote,index){
    if((fote.hasOwnProperty('media')) && (fote.media[0] !== undefined)){
      return(
        <TouchableOpacity style={styles.fote} onPress={this.goToFote.bind(this,fote,fote.media[0].url)}>
          <Image style={styles.foteImage}
            source={{uri:fote.media[0].url}}
          />
        </TouchableOpacity>
      )
    }else{
      return(
        <TouchableOpacity style={[styles.textFote,{backgroundColor:fote.backgroundColor}]}
          onPress={this.goToFote.bind(this,fote,'')}>
          <Text style={{fontSize:22, color:'white',textAlign:'center'}}>
            {fote.note}
          </Text>
        </TouchableOpacity>
      )
    }
  }

  _keyExtractor = (item, index) => index;
  _goBack(){
    const {goBack} = this.props.navigation;
    goBack();

  }
  render() {
      return (
        <View style={styles.container}>
        <StatusBar hidden={false} />
        <TopBar
          firstBtnImage={'back'}
          firstBtn={() => this._goBack()}
          mainTitle={"Location"}
        >
        </TopBar>
          <View style={styles.header}>
            <ImageBackground style={styles.placeImage}
              source={{uri:this.state.photo}}
              resizeMode='cover'
              blurRadius={2}
            >
              <Text style={styles.placeName}>
                {this.state.name.toUpperCase()}
              </Text>
            </ImageBackground>
         </View>
         <View style={{flex:1}}>
           <FlatList style={{flex:1,backgroundColor:"white"}}
              data={this.state.fotes}
              numColumns={3}
              keyExtractor={this._keyExtractor}
              renderItem={({item,index}) => this.renderFote(item,index)}
           />

         </View>


        </View>
      );
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
  flatlist:{
    flex:1,
  },
  header:{
    flex:.15,
    backgroundColor:'white'
  },
  placeImage:{
    flex:1,
    backgroundColor:'#e9ecef',
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeName:{
    fontSize:30,
    color:'white',
    fontWeight:'bold',
    textAlign:'center',
    fontFamily:"Lato-Heavy"

  },
  details:{
    paddingLeft:15,
    paddingRight:15,
    justifyContent:'space-between'
  },
  detail:{
    marginTop:10,
    flexDirection:'row',
  },
  detailIcon:{
    height:16,
    width:16
  },
  detailText:{
    paddingLeft:10,
    fontSize:16,
    color:'black'
  },
  separator:{
    height:5,
    backgroundColor:'white'
  },
  fote:{
    height:ITEM_WIDTH,
    width:ITEM_WIDTH,
    backgroundColor:"white"
  },
  foteImage:{
    flex:1,
    backgroundColor:"#e9ecef",
    borderWidth:2,
    borderColor:'white'
  },
  textFote:{
    height:ITEM_WIDTH,
    width:ITEM_WIDTH,
    borderWidth:2,
    borderColor:'white',
    justifyContent:'center'
  }
});
