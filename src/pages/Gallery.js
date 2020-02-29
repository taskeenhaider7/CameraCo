import React, { Component } from 'react';
import { Alert,TouchableHighlight,Platform,Keyboard,ScrollView,Linking,Share, Dimensions,AsyncStorage,TextInput,StyleSheet, Text, View,FlatList,Image,TouchableOpacity } from 'react-native';

import moment from 'moment';
import utils from "../utils/utils";
import GalleryList from '../components/GalleryList';
import HashTag from '../components/HashTag';
import { getStatusBarHeight } from 'react-native-status-bar-height';
statusBarHeight = getStatusBarHeight();

const { height, width} = Dimensions.get('window');
const ITEM_HEIGHT = 150;

export default class Gallery extends Component {

  constructor(params){
    super(params);
    this.state = {
      'text':'',
      'myKey':[],
      'filteredList':[],
      'data':[],
      'thumbText':'',
      'isScrolling':false,
      'showLocation':true,
      'place':'',
      'latestHashTags':[],
      'shortNoteSection':0,
    }
  }
  componentDidMount(){
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    global.GALLERY = this;
  }

  _keyboardDidShow(e) {
    _extra = Platform.OS === 'ios' ? 0 : 0,
    _paddingGif = 0 + _extra;
    _paddingMsg = 30 + _extra;
    shortNoteSection = Dimensions.get('window').height - e.endCoordinates.height - _paddingGif - statusBarHeight;
    this.setState({
      keyboardHeight:e.endCoordinates.height,
      keyboardVisible:true,
      shortNoteSection: shortNoteSection
    })
  }
  _keyboardDidHide(e) {
    this.setState({
      keyboardVisible:false
    })
  }
  handleViewableItemsChanged(info) {

      if(info.viewableItems.length > 0){
        date = new Date(Date.parse(info.viewableItems[0].item.date))
        if(new Date().getYear() > date.getYear()){
          _d = moment(date).format("MMM Do YYYY");
        }else{
          _d = moment(date).format("MMM Do");

        }
        this.setState({'thumbText':_d})
      }

  }

  async getKey() {
     try {
       const value = await AsyncStorage.getItem('key');
       this.setState({myKey: JSON.parse(value)});
       let reverseList = JSON.parse(value);
       let listLabel = reverseList.reverse();
       this.setState({filteredList: listLabel});
     } catch (error) {
       console.log("Error retrieving data" + error);
     }
  }

  async _loadHashtags() {
     try {
       const value = await AsyncStorage.getItem('key');

       let db = JSON.parse(value).reverse();
       _hashtags = {}
       var arr = [];

       for (var i = 0; i < db.length; i++) {

         db[i].hashtags.forEach(function(h){
           _hashtags[h] = h;
         });
         if(i == 11){
           break;
         }
       }
       for (var key in _hashtags) {
         arr.push(key);
       }
       this.setState({
         "latestHashTags":arr
       })

     } catch (error) {
       console.log("Error retrieving data" + error);
     }
  }
  async filterKey(key) {
     try {
       const value = this.state.myKey;
       var newList = [];
       list = value;
       for (var i = 0; i < list.length; i++) {
         if(list[i].note.toLowerCase().includes(key.toString().toLowerCase())) {
           newList.push(list[i]);
         }
       }
       let reverList = newList.reverse();
       this.setState({myKey: list});
       this.setState({filteredList: reverList});

     } catch (error) {
       console.log("Error retrieving data" + error);
     }
  }
  async saveKey(value) {
    console.log("saving: " + value);
    try {
      await AsyncStorage.setItem('key', value);
      this.setState({myKey: JSON.parse(value)});
      this.setState({filteredList: JSON.parse(value)});

    } catch (error) {
      console.log("Error saving data" + error);
    }
  }
  componentWillMount(){

        _exampleData = {
                          "appData": {
                            "photoList": [

                            ]
                          }
                        }
        //this.saveKey(JSON.stringify(_exampleData.appData.photoList));
        this.getKey();
    global.gallery = this;
    this._loadHashtags();
  }
  addHashtag(hashtag){
    this.textInput.setNativeProps({"text": hashtag})
    this.setState({"text":hashtag });
     this.filterKey(hashtag);
  }
  filter(text){
    this.filterKey(text.text);
  }

  shareItem(item){
    // const base64 = await getBase64(item.uri);
    let content = {
      title: 'Share',
      message: item.uri,
      url: item.uri
    };
    Share.share(content,{});
  }
  showLocation(location){
    utils.reverseGC(location.latitude,location.longitude).then((res) => {
      _place = "At: {city} - {country}"
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
      this.setState({"place":_place});
    });

  }
  openMap(location){
    _url = "https://www.google.com/maps/search/?api=1&query={lat},{lon}";
    _url = _url.replace('{lat}',location.latitude);
    _url = _url.replace('{lon}',location.longitude);
    Linking.openURL(_url);
  }
 async deleteItem(item){
    try {
      const value = await AsyncStorage.getItem('key');
      let reverseList = JSON.parse(value);
      let newList = reverseList;
      //Search item
      for (var i = 0; i < reverseList.length; i++) {

        if(reverseList[i].uri == item.uri){
          newList.splice(i,1)
        }
      }
      let listLabel = reverseList.reverse();
      this.saveKey(JSON.stringify(listLabel));
      this.setState({filteredList: listLabel});
      //alert(value)
    } catch (error) {
    }
  }


   deleteItemAlert(item){
        Alert.alert(
        'Are you sure?',
        'Deleting an image is not reversible.',
        [
          {text: 'Yes', onPress: () => this.deleteItem(item)},
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        ],
        { cancelable: true }
        )



  }
  render() {
    return (

      <View style={[styles.container,this.state.keyboardVisible ? {height:this.state.shortNoteSection,marginTop:statusBarHeight} : {flex:1} ]} >
        <View style={styles.inputArea}>
          <View style={styles.wrapperInput}>
            <Image style={styles.searchIcon}
              source={require('../assets/img/icons/search.png')}
            />
            <TextInput style={styles.input}
                onChangeText={(text) => this.filter({text})}
                placeholder={'Search'}
                placeholderStyle={{ textAlign:'center' }}
                ref={element => {
                      this.textInput = element
                    }}/>
          </View>
        </View>

        <ScrollView style={styles.hashTagsList} horizontal keyboardShouldPersistTaps={"always"}>
          {this.state.latestHashTags.map(r => <HashTag hashtag={r} onPress={() => this.addHashtag.bind(this,r) }></HashTag> )}
        </ScrollView>
        <GalleryList
            data={this.state.filteredList}
            itemsChanged={() => this.handleViewableItemsChanged.bind(this,info)}
            onDeleteItem={this.deleteItemAlert.bind(this)}
            mode={this.props.mode}
            numColumns={this.props.numColumns}
        />

        {(this.state.isScrolling && this.state.filteredList.length > 0 )? (<View style={styles.dateView}><Text style={styles.thumbText}>{this.state.thumbText}</Text></View>) : (null)}

      </View>


    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  container_label_visible:{
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 5,
    paddingBottom: 20,
    flex:1
  },
  saveButtonWrapper:{
    justifyContent: 'center',
    alignItems:'center',
    height:30

  },
  label_visible:{
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
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
  icon:{
    width:30,
    height:30
  },
  saveBar:{
    flexDirection:'row',
  },
  hashTagsList:{
    height:30,
    maxHeight:30,
    flexDirection:'row'
  },
  inputArea:{
    height:60,
    backgroundColor:'#f7f7f7',
    paddingLeft:20,
    paddingRight:20,
    justifyContent:'center',
    borderBottomWidth:1,
    borderBottomColor:'#e8e8e8'
  },
  wrapperInput:{
    flexDirection:'row',
    height:32,
    backgroundColor:'white',
    borderWidth:1,
    borderColor:"#eaeaea",
    borderRadius:12,
    paddingLeft:12,
    paddingRight:12,
    alignItems:'center',
    justifyContent:'center'
  },
  searchIcon:{
    height:16,
    width:16,
  },
  input:{
    backgroundColor:'white',
    paddingLeft:10,
    fontSize:16
  },
});
