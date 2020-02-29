import React from 'react';
var RNFS = require('react-native-fs');
import { StatusBar,ScrollView,ActivityIndicator, StyleSheet, Platform, Button,Text, Picker,  View, Image, TouchableHighlight, TouchableOpacity, Alert, TextInput,Linking, AsyncStorage, FlatList, Dimensions, Keyboard,KeyboardAvoidingView,Modal} from 'react-native';
import {  NavigationActions } from 'react-navigation';
import UsersQuery from '../components/UsersQuery'
import cameraCoApi from "../api/CameraCoApi";
import { getStatusBarHeight } from 'react-native-status-bar-height';
statusBarHeight = getStatusBarHeight();
export default class Type extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      'note':'',
      'uri':'',
      'thumbnail':'',
      'keyboardVisible':false,
      'shortNoteSection':0,
      'noteIsEmpty':true,
      'latitude':null,
      'longitude':null,
      'hashtags':[],
      'latestHashTags':[],
      'volume':0,
      "isSearchingUser":false,
      'feedIcon': require('../assets/img/icons/world_on.png'),
      'locationIcon': require('../assets/img/icons/location_gray.png'),
      'backgroundColorIcon': require('../assets/img/icons/backgroundColor.png'),
      'is_public':true,
      'isLogged':false,
      'place':null,
      'placeName':"",
      'backgroundColor':"#f24e86"
    }
  }

  saveState(text){
    _char = text.text[text.text.length - 1];
    if(text.text.trim() == ''){
      this.setState({
        "note":text.text,
        "noteIsEmpty":true,
        "isSearchingUser":false
      })

    }else{
      if((text.text[text.text.length - 1] == "@" )|| (this.state.isSearchingUser) ){
        try{
          _t = text.text;
          _t = _t.split(" ");
          _t.reverse();
            this.setState({"isSearchingUser":true},() => {
              this.usersQuery.updateUserList(_t[0]);
            });
        }catch(ex){
          alert(ex)
        }

      }
      this.setState({
        "note":text.text,
        "noteIsEmpty":false

      })
    }
  }

  onSubmitHandler(event){
    this.onPressSave();
  }
  _goBack(){
    const resetAction = NavigationActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: 'Fotes', params: { page: 0,showLoader:false}})],
            });
    this.props.navigation.dispatch(resetAction);
  }
  _goGallery(){
    const resetAction = NavigationActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: 'Fotes', params: { page: 1,showLoader:false}})],
            });
    this.props.navigation.dispatch(resetAction);
  }
  extractHashTags(){
    hashTagsList = []
    this.state.note.split(" ").forEach(function(h){if(h.charAt(0)=="#" && h != "#"){hashTagsList.push(h)}})
    this.setState({"hashtags":hashTagsList})
  }
  moveThumbnailCallback(data){
    if(data[0]){
      this.setState({thumbnail:data[1]}, () => {


          //upload it if necessary
          if( (this.state.note.includes("@"))  || (this.state.is_public) ){
              cameraCoApi.getMe().then((res) => { //check if the user is logged in
                if(res.hasOwnProperty("name")){
                  // save phote
                  this.saveNote(this.state.note.toString());
                  this.uploadFote(this.state.note.toString());

                }
              });
          }else{
            // save phote
            this.saveNote(this.state.note.toString());
          }


      })

    }else{

    }
  }
  moveFileCallback(data){
    if(data[0]){
      this.setState({uri:data[1]}, () => {
        // move thumbnail
        this.moveThumbnailToDocuments(this.state.thumbnail,this.moveThumbnailCallback.bind(this))
      })

    }else{
      alert("There was an error saving your post.")
    }

  }
  onPressSave(){
    if(!this.state.noteIsEmpty){
      console.log("saving...");
      this.extractHashTags();

      //upload it if necessary
      if( (this.state.note.includes("@"))  || (this.state.is_public) ){
          cameraCoApi.getMe().then((res) => { //check if the user is logged in
            if(res.hasOwnProperty("name")){
              // save phote
              this.uploadFote(this.state.note.toString());

            }
          });
    }
    }

  }

  _loadHashtags(){
    this.getKey()
  }
  async getKey(){
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
  _keyboardDidShow(e) {
    shortNoteSection = Dimensions.get('window').height - e.endCoordinates.height ;
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
  componentWillMount(){
    this._loadHashtags();
    currentBackgroundColorIndex = 0;
  }
  moveFileToDocuments(filePath,callback){
    fileNameAtDocuments = filePath.split("/");
    fileNameAtDocuments = fileNameAtDocuments[fileNameAtDocuments.length-1];
    var destPath = RNFS.DocumentDirectoryPath + '/' + fileNameAtDocuments;
    RNFS.moveFile(filePath, destPath)
      .then((success) => {
        callback([true,fileNameAtDocuments])
      })
      .catch((err) => {
        callback([false,err.message])
      });
  }
  moveThumbnailToDocuments(filePath,callback){
    fileNameAtDocuments = filePath.split("/");
    fileNameAtDocuments = fileNameAtDocuments[fileNameAtDocuments.length-1];
    var destPath = RNFS.DocumentDirectoryPath + '/' + fileNameAtDocuments;
    RNFS.moveFile(filePath, destPath)
      .then((success) => {
        callback([true,fileNameAtDocuments])
      })
      .catch((err) => {
        callback([false,err.message])
      });
  }
  componentDidMount(){
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    const {state} = this.props.navigation;

    this.setState({
      "uri":state.params.uri,
      "longitude":state.params.longitude,
      "latitude":state.params.latitude,
      // "thumbnail":state.params.thumbnail
    })
    //check if the user is logged in
    cameraCoApi.getMe().then((res) => {
      if(res.hasOwnProperty("name")){
        this.setState({'isLogged':true});
      }
    });
    global.NOTE_COMPONENT = this;
    global.NOTE_COMPONENT.NOTE_INTENT = false;
    //check if the user is logged in
    // cameraCoApi.getPlaces(state.params.latitude,state.params.longitude).then((res) => {
    //   // alert(JSON.stringify(res));
    //   if(res.success && res.places.length > 0){
    //     this.setState({'place':res.places[0],'placeName':res.places[0].name});
    //     _s = require('../assets/img/icons/location_blue.png');
    //     global.NOTE_COMPONENT.setState({"locationIcon":_s});
    //   }else{
    //     this.setState({'placeName':'Tap here to add your location'});
    //   }
    // });
  }
  addHashtag(hashtag){
    // alert(hashtag)
    this.textInput.setNativeProps({ text:this.state.note+ " " + hashtag + " "})
    this.setState({"note":this.state.note + " "+hashtag + " "});
  }
  toggleVolume(){
    if(this.state.volume == 0){
      this.setState({volume:1})
    }else{
      this.setState({volume:0})

    }
  }
  renderPreview(){
      return (
        <TextInput
            style={{flex:1,fontSize:30,backgroundColor:this.state.backgroundColor,textAlign:"center",lineHeight:50,textAlignVertical:"center",paddingTop:40,color:"white"}}
            multiline={true}
            placeholder={"Write a note"}
            placeholderTextColor={'white'}
            ref={element => {
                  this.textInput = element
                }}
            onChangeText={(text) => this.saveState({text})}
            value={this.state.note}
          />
      )
  }
  setFeedVisibiliy(){
    // if(this.state.isLogged){
    //   if(this.state.is_public){
    //     _s = require('../assets/img/icons/world_off.png');
    //     this.setState({"is_public":false,"feedIcon":_s})
    //   }else{
    //     _s = require('../assets/img/icons/world_on.png');
    //     this.setState({"is_public":true,"feedIcon":_s})
    //   }
    // }else{
    //   this.alertLoggin();
    // }
  }

  _onUserSelected(user){
    _words = this.state.note.split(" ").reverse()
    for (var i = 0; i < _words.length; i++) {
      if(_words[i].startsWith("@")){
        _words[i] = "@"+user.username
        break;
      }
    }
    _words = _words.reverse().join(" ") + " ";
    this.textInput.setNativeProps({ text:_words})
    this.setState({isSearchingUser:false,"note":_words},() => {
      this.forceUpdate();
    });
  }

  alertLoggin(){
    Alert.alert(
      'Sign In',
      'You need to sign in to interact online. Create your account in one minute!',
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Sign In', onPress: () => {this.openAccount()}},
      ],
      { cancelable: false }
    )
  }

  openAccount(){
    global.NOTE_COMPONENT.NOTE_INTENT = true;
    this.props.navigation.navigate({routeName:'Account'});
  }
  onPlaceSelected(place){
    _s = require('../assets/img/icons/location_blue.png');
    global.NOTE_COMPONENT.setState({"locationIcon":_s});
    global.NOTE_COMPONENT.setState({"place":place,"placeName":place.name,"latitude":place.geometry.location.lat,"longitude":place.geometry.location.lng});

  }
  changeBackgroundColor(){
    currentBackgroundColorIndex += 1;
    if(currentBackgroundColorIndex > 7){
      currentBackgroundColorIndex = 0;
    }
    _bgColors = ["#f24e86","#86B8D9","#869CD9","#9286D9","#C486D9","#D986A3","#D98686","#EBAA54"]
    this.setState({
      "backgroundColor":_bgColors[currentBackgroundColorIndex]
    })

  }
  getPlaces(){
    this.props.navigation.navigate({routeName:'Places',params:{latitude:this.state.latitude,longitude:this.state.longitude,onPlaceSelected:  this.onPlaceSelected}});
  }
  // <Text disabled={!this.state.noteIsEmpty} style={[styles.saveButton,  this.state.keyboardVisible ? {height:30} : {height:0},this.state.noteIsEmpty ? {color:'gray'} : {color: '#128BDA'}]}   onPress={this.onPressSave.bind(this)}>Save</Text>

  render() {

    return (
      <View style={[this.state.keyboardVisible ? {height:this.state.shortNoteSection,marginTop:0} : {flex:1,marginTop:0} ]} >
      <StatusBar hidden={false} backgroundColor={this.state.backgroundColor}/>
      <View style={{height:200,justifyContent: "space-between",flexDirection:"row",paddingTop:getStatusBarHeight(),backgroundColor:this.state.backgroundColor}}>
        <TouchableOpacity onPress={() => this._goBack()} style={{marginLeft:10,flexDirection:"column",height:60,justifyContent:"center",alignItems:'center'}}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <View style={{flexDirection:"column",marginRight:10}}>
          <TouchableOpacity style={[styles.buttonWrapper]} onPress={() => this.setFeedVisibiliy()}>
            <Text style={[styles.buttonLabel,this.state.is_public ? {color: "#026eb3"} : {color:"white"}]}>Public</Text>
            <Image style={[styles.button,this.state.is_public ? {tintColor: "#026eb3"} : {color:"white"}]}
              source={require('../assets/img/icons/type_public.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonWrapper} onPress={() => this.changeBackgroundColor()}>

            <Text style={styles.buttonLabel}>Color</Text>
            <Image style={styles.button}
              source={require('../assets/img/icons/type_background.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonWrapper} onPress={() => this.getPlaces()}>
            <Text style={[styles.buttonLabel,this.state.placeName !== "" ? {color: "#026eb3"} : {color:"white"}]}>Location</Text>
            <Image style={[styles.button,this.state.placeName !== "" ? {tintColor: "#026eb3"} : {tintColor:"white"}]}
              source={require('../assets/img/icons/type_location.png')}
            />
          </TouchableOpacity>
        </View>

      </View>
      {this.renderPreview()}


      <UsersQuery
        keyboardShouldPersistTaps={"always"}
        ref={element => { this.usersQuery = element}}
        onUserSelected={this._onUserSelected.bind(this)}
        isLogged={this.state.isLogged}
        alertLoggin={this.alertLoggin}>

      </UsersQuery>
      <View
        style={{position: 'absolute', left: 0, right: 0, bottom: 0,height:30,backgroundColor:"transparent"}}>
        <TouchableOpacity  disabled={!this.isValidForm()}  onPress={() => this.onPressSave()}>
          <Text style={[styles.saveButton,!this.isValidForm()  ? {color:"gray"}:{color:"white"}]}>
            SAVE
          </Text>
        </TouchableOpacity>
      </View>

      </View>

    );
  }
  isValidForm(){
    if(this.state.note.trim() == ""){
      return false;
    }
    return true;
  }
  uploadFote(note){
    _d = new Date().toString();
    _p  = {
      "uri":this.state.uri,
      "note":note,
      "date": _d,
      "location":{
        latitude:this.state.latitude,
        longitude:this.state.longitude
      },
      "hashtags":this.state.hashtags,
      "thumbnail":this.state.thumbnail,
      "is_public":this.state.is_public,
      "place":this.state.place,
      "type":"type",
      "backgroundColor":this.state.backgroundColor


    }
    cameraCoApi.uploadType(_p);
    this._goBack();

  }
  async saveNote(note) {
     try {
       const value = await AsyncStorage.getItem('key');
       type = this.props.navigation.state.params.type;
       _d = new Date().toString();
       jObj =  JSON.parse(value);
       _p  = {
         "uri":this.state.uri,
         "note":note,
         "date": _d,
         "location":{
           latitude:this.state.latitude,
           longitude:this.state.longitude
         },
         "hashtags":this.state.hashtags,
         "thumbnail":this.state.thumbnail,
         "is_public":this.state.is_public,
         "place":this.state.place
       }
       if(type == 'video'){
         _p.type = 'video';
       }
       jObj.push(_p);
       await AsyncStorage.setItem('key', JSON.stringify(jObj));
      //  this.props.navigation.navigate('Gallery');
      this._goGallery();
       console.log(JSON.stringify(jObj));

     } catch (error) {
       type = this.props.navigation.state.params.type;
       //If empty data
       jObj =  []
       _p  = {
         "uri":this.state.uri,
         "note":note,
         "date": _d,
         "location":{
           latitude:this.state.latitude,
           longitude:this.state.longitude
         },
         "hashtags":this.state.hashtags,
         "thumbnail":this.state.thumbnail,
         "is_public":this.state.is_public,
         "place":this.state.place
         // "type":this.state.type
       }
       if(type == 'video'){
         _p.type = 'video';
       }
       jObj.push(_p);

       await AsyncStorage.setItem('key', JSON.stringify(jObj));
      //  this.props.navigation.navigate('Gallery');
      this._goGallery();

       console.log("Data init");
       console.log(JSON.stringify(jObj));

     }
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  txt_note:{
    flex:1,
    margin: 5,
    fontSize: 18,
    paddingLeft: 5

  },
  closebutton:{
    width:25,height:25,alignSelf: 'flex-end',position:'absolute',backgroundColor:'transparent'
  },
  saveBar:{
    flexDirection:'row'
  },
  hashTagsList:{
    flex:1,
    flexDirection:'row'

  },
  saveButtonWrapper:{
    justifyContent: 'center',
    alignItems:'center',
    height:30

  },
  saveButton:{
    fontSize:16,
    marginRight:10,
    justifyContent: 'center',
    alignItems:'center'
  },
  extraButtons:{
    flexDirection:'row',
    justifyContent:'flex-end',
    paddingRight:10
  },
  feedButton:{
    alignSelf:'flex-end'
  },
  btn_left:{
    width:40,
    alignItems:'flex-start'
  },
  btn_right:{
    width:40,
    alignItems:'center'
  },
  loc_right:{
    alignItems:'center',
    justifyContent:'center'
  },
  placeName:{
    fontSize:16,
    color:'gray'
  },
  cancelButton:{
    color:"white",
    fontSize:16,
    fontFamily:"Lato-Bold",

  },
  buttonWrapper:{
    width:120,
    flexDirection:"row",
    justifyContent: "space-between",
    alignItems:'center',
    color:"white",
    height:60
  },
  button:{
    width:40,
    height:40,
    tintColor:"white"
  },
  buttonLabel:{
    color:"white",
    fontSize:18
  },
  saveButton:{
    textAlign:"right",
    marginTop:5,
    marginRight:10,
    fontSize:16,
    fontWeight:"bold"
  }
});
