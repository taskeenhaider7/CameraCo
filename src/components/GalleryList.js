import React, { Component } from 'react';
import { Linking,Share, Dimensions,AsyncStorage,TextInput,StyleSheet, Text, View,FlatList,Image,TouchableOpacity } from 'react-native';
import Lightbox from 'react-native-lightbox';
import utils from "../utils/utils";
import Video from "react-native-video";
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { ifIphoneX } from 'react-native-iphone-x-helper'

var RNFS = require('react-native-fs');

const { height, width} = Dimensions.get('window');
const ITEM_HEIGHT = height * .75;
const ITEM_WIDTH = width/3;
statusBarHeight = getStatusBarHeight();

class MyListItem extends React.PureComponent {
  constructor(props){
    super(props);
    this.place = '';
  }

  _onPress = () => {
    this.props.onPressItem(this.props.id);
  };

  _openMap = () => {
    let location = this.props.location
    _url = "https://www.google.com/maps/search/?api=1&query={lat},{lon}";
    _url = _url.replace('{lat}',location.latitude);
    _url = _url.replace('{lon}',location.longitude);
    Linking.openURL(_url);
  }

  _shareItem = () => {
    let content = {
      title: 'Share',
      message: this.props.uri,
      url: this.props.uri
    };
    Share.share(content,{});
  }

  _getLocation = () => {

    let location = this.props.location;
    utils.reverseGC(location.latitude,location.longitude).then((res) => {
      _place = "In: {city}"
      try{
        if(res.address.hasOwnProperty("suburb")){
          _place = _place.replace("{city}",res.address.suburb);
          _place = _place.replace("{country}",res.address.country);
        }else if(res.address.hasOwnProperty("city_district")){
          _place = _place.replace("{city}",res.address.city_district);
          _place = _place.replace("{country}",res.address.country);
        }else if(res.address.hasOwnProperty("village")){
          _place = _place.replace("{city}",res.address.village);
          _place = _place.replace("{country}",res.address.country);
        }else if(res.address.hasOwnProperty("city")){
          _place = _place.replace("{city}",res.address.city);
          _place = _place.replace("{country}",res.address.country);
        }else if(res.address.hasOwnProperty("state")){
          _place = _place.replace("{city}",res.address.state);
          _place = _place.replace("{country}",res.address.country);
        }else{
          _place = "At: " + res.address.country;
        }
      }catch(ex){
        _place = "We couldn't find the location."
      }
      this.place = _place;
      this.forceUpdate()

    });
  }

renderMedia(){
  if(this.props.type == "video"){
    return (<Video
              source={{uri: this.props.uri}}
              style={{ flex: 1}}
              ignoreSilentSwitch={"ignore"}
              volume={1.0}                 // 0 is muted, 1 is normal.
            />)
  }else{
    return (<Image
              style={{ flex: 1, resizeMode: 'contain' }}
              source={{uri: this.props.uri}}
            />)
  }

}
  deleteItem(item){
    this.props.onDeleteItem(item)
  }
  render() {
    return (
      <Lightbox
        onOpen={this._getLocation}
        renderHeader={ close => (
          <View style={styles.wrapper_icons}>
            <TouchableOpacity onPress={this.deleteItem.bind(this,this.props.item)}>
              <Image
                source={require('../assets/img/delete.png')}
                style={styles.leftIcon}
              />


            </TouchableOpacity>

            <TouchableOpacity onPress={this._openMap}>
              <Image
                source={require('../assets/img/icons/type_location.png')}
                style={styles.middleIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={this._shareItem}>
              <Image
                source={require('../assets/img/icons/share.png')}
                style={styles.rightIcon}
              />
            </TouchableOpacity>
          </View>
        )}
        renderContent={() => (
          <View style={{ width, height }}>
             {this.renderMedia(this.props.item)}
             <View style={styles.container_label_visible} >
               <Text style={styles.label_visible} >{this.props.note}</Text>
               <TouchableOpacity>
                <Text ref={element => {
                        this.textPlace = element
                      }}
                      style={styles.labelPlace} >{this.place}</Text>
               </TouchableOpacity>

             </View>

          </View>
        )}
        swipeToDismiss={true}>
        <Image style={[(this.props.mode == 'list') ? styles.oneColumn : styles.threeColumns]}
            resizeMode="cover"
            source={{uri: RNFS.DocumentDirectoryPath + '/' + this.props.item.thumbnail}}
        />
      </Lightbox>
    );
  }
}


class GalleryList extends React.PureComponent {
  state = {selected: (new Map(): Map<string, boolean>)};
  constructor(params){
    super(params);
    this.onViewableItemsChanged.bind(this)
  }
  onViewableItemsChanged(info) {
       global.GALLERY.handleViewableItemsChanged(info)
  }

  _keyExtractor = (item, index) => index;

  _onPressItem = (id: string) => {
    // updater functions are preferred for transactional updates
    this.setState((state) => {
      // copy the map rather than modifying state.
      const selected = new Map(state.selected);
      selected.set(id, !selected.get(id)); // toggle
      return {selected};
    });
  };

  _renderImage = ({item,index}) => (
    <MyListItem
      id={item.id}
      onPressItem={this._onPressItem}
      selected={!!this.state.selected.get(item.id)}
      location={item.location}
      uri={RNFS.DocumentDirectoryPath + '/' + item.uri}
      note={item.note}
      item={item}
      onDeleteItem={this.props.onDeleteItem}
      mode={this.props.mode}
    />
  );
viewabilityConfig = {viewAreaCoveragePercentThreshold: 50}
  render() {
    // alert(this.props.numColumns);
    return (
      <FlatList
          data={this.props.data}
          numColumns={this.props.numColumns}
          key={this.props.numColumns}
          style={{ flexDirection: 'column',zIndex:0}}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderImage}
          onViewableItemsChanged={this.onViewableItemsChanged}
          viewabilityConfig={this.viewabilityConfig}
          onScrollEndDrag={(e) =>  global.GALLERY.setState({'isScrolling':false})}
          onScrollBeginDrag={(e) => global.GALLERY.setState({'isScrolling':true})}
      />
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container_label_visible:{
    minHeight:110,
    padding:20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  label_visible:{
    color: 'white',
    fontSize: 16,
  },
  dateView:{
    position:'absolute',
    right:20,
    top:100,
    borderRadius:20,
    width:80,
    padding:5,
    height:30,
    backgroundColor:'#E974E2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:999
  },
  thumbText:{
    fontSize:14,
    color:"white",
    textAlign: 'center',
    fontWeight: 'bold'
  },
  wrapper_icons:{
    flex:1,
    flexDirection: 'row',
    paddingLeft:20,
    paddingRight:20,
    justifyContent:'flex-end',
    ...ifIphoneX({
            marginTop: statusBarHeight - 25,
        }, {
            marginTop: statusBarHeight,
        })
  },
  icon:{
    width:30,
    height:30
  },
  middleIcon:{
    width:30,
    height:30,
    marginRight:15,
    tintColor:'white',
    ...ifIphoneX({
            marginTop: statusBarHeight - 25,
        }, {
            marginTop: 0,
        })
  },
  leftIcon:{
    width:27,
    height:27,
    marginRight:15,
    ...ifIphoneX({
            marginLeft: 41.5 - 15,
        }, {
            marginLeft: 0,
        })
  },
  rightIcon:{
    width:30,
    height:30,
    tintColor:'white',
    ...ifIphoneX({
            marginRight: 41.5 - 15
        }, {
            marginRight: 0
        })
  },
  oneColumn:{
      height:ITEM_HEIGHT,
      marginBottom:15,
      backgroundColor:'white'
  },
  threeColumns:{
      height:ITEM_WIDTH,
      width:ITEM_WIDTH,
      backgroundColor:"white",
      borderWidth:2,
      borderColor:'white'
  },
  labelPlace:{
    fontSize:14,
    color:'#f7f7f7'
  }
});

export default GalleryList;
