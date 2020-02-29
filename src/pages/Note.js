import React from 'react';
var RNFS = require('react-native-fs');
import { Animated,NativeModules,NativeEventEmitter,Easing,ScrollView,StatusBar,Switch,ActivityIndicator, StyleSheet, Platform, Button,Text, Picker,  View, Image, TouchableHighlight, TouchableOpacity, Alert, TextInput,Linking, AsyncStorage, FlatList, Dimensions, Keyboard,KeyboardAvoidingView,Modal} from 'react-native';
import {  NavigationActions } from 'react-navigation';

import cameraCoApi from "../api/CameraCoApi";
import { getStatusBarHeight } from 'react-native-status-bar-height';
import TypeEditor from '../components/TypeEditor';
import ActivitySelector from './ActivitySelector';
import SoundRecorder from '../components/SoundRecorder';
import AudioVisualization from '../components/AudioVisualization';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Video from "react-native-video"
const statusBarHeight = getStatusBarHeight();

export default class Note extends React.Component {
  constructor(props){
    super(props);
    this.onActivitySelected = this.onActivitySelected.bind(this);
    this.onPlaceSelected    = this.onPlaceSelected.bind(this);
    this.onPlaceToSelected    = this.onPlaceToSelected.bind(this);

    this.state = {
      'note':'',
      'uri':'',
      'thumbnail':'',
      'keyboardVisible':false,
      'shortNoteSection':0,
      'noteIsEmpty':true,
      'latitude':0.0,
      'longitude':0.0,
      'hashtags':[],
      'latestHashTags':[],
      'volume':0,
      "isSearchingUser":false,
      'feedIcon': require('../assets/img/icons/world_off.png'),
      'activityIcon': require('../assets/img/icons/activity.png'),
      'locationIcon': require('../assets/img/icons/location_gray.png'),
      'is_public':true,
      'place':null,
      'placeTo':null,
      'placeName':"",
      'placeToName':"",
      'addPlaceLabel':"Add Location...",
      'activity':null,
      'colorBtn':'black',
      'currentSelectedBackgroundIndex':0,
      'currentSelectedFontIndex':0,
      'currentFont':"",
      'activitySelected':'none',
      'isDateTimePickerVisible':false,
      'date':null,
      'dateLabel':null,
      'offer':0.0,
      'seats':0,
      'ppseat':0.0,
      'audioNote':null,
      'isPaused':true,
      'mediaIcon':require('../assets/img/icons/play.png'),
      'AVdarkMode':false,
      'voiceImage':require('../assets/img/icons/voiceFilter0.png'),
      animatedViewHeight: new Animated.Value(Dimensions.get('window').height),
    }
    this.index = 0;
    this.voiceIndex = 0;
    this.metrics = [];
    // var context = new webkitAudioContext();
    // var gain = context.createGain();
    // var bufferSource = context.createBufferSource();
    // var distortion = context.createWaveShaper();
    //
    // distortion.curve = this.makeDistortionCurve(50);
    //
    // distortion.oversample = '20x';
    // // distortion.connect(context.destination);
    //
    // bufferSource.buffer = buffer;
    // bufferSource.connect(gain);
    // gain.connect(distortion);
    // distortion.connect(context.destination);
    // bufferSource.start();
  }

  onTypeEditorTextChanged(text){
    this.saveState(text);
  }

  onTypeEditorColorChanged(c){
    this.setState({AVdarkMode:c == 8})

    this.setState({activitySelected:"none"})
    this.setState({'currentSelectedBackgroundIndex':c});
    this.onTypeEditorFontChanged(c);
  }
  makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50,
      n_samples = 44100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180,
      i = 0,
      x;
    for ( ; i < n_samples; ++i ) {
      x = i * 2 / n_samples - 1;
      curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
    }
    return curve;
  }
  onTypeEditorFontChanged(c){
    // alert(c);
    _fonts =['Lato-Light','Snell Roundhand','system font','American Typewriter','Overpass',
    'SF Cartoonist Hand','Savoye LET','StardosStencil-Regular','AvenirNext-Bold'];
    this.setState({'currentSelectedFontIndex':c,"currentFont":_fonts[c]});
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
              actions: [NavigationActions.navigate({key:'Fotes', routeName: 'Fotes', params: { page: 1,showLoader:false}})],
            });
    this.props.navigation.dispatch(resetAction);
  }

  _goToFeed(){
    const resetAction = NavigationActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({key:'Fotes', routeName: 'Fotes', params: { page: 1,showLoader:false}})],
            });
    this.props.navigation.dispatch(resetAction);
  }

  goToCamera(){
    const resetAction = NavigationActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({key:'Fotes', routeName: 'Fotes', params: { page: 1,showLoader:false}})],
            });
    this.props.navigation.dispatch(resetAction);
  }

  _goGallery(){
    const resetAction = NavigationActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({key:'Fotes', routeName: 'Fotes', params: { page: 1,showLoader:false}})],
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
                  if(this.state.activitySelected != "none"){
                    // save Fote
                    this.saveNote(this.state.note.toString());
                  }
                  this.uploadFote(this.state.note.toString());

                }
              });

          }else{
            if(this.state.activitySelected == "none"){
              // save Fote
              this.saveNote(this.state.note.toString());

            }

          }


      })

    }else{

    }
  }

  moveFileCallback(data){
    if(data[0]){
      if(data[1].includes(".mov")){
        this.moveThumbnailToDocuments(this.state.thumbnail,this.moveThumbnailCallback.bind(this))
      }else{
        this.setState({uri:data[1]}, () => {
          // move thumbnail
          this.moveThumbnailToDocuments(this.state.thumbnail,this.moveThumbnailCallback.bind(this))
        })
      }

    }else{
      alert("There was an error saving your Post.")
    }

  }

  onPressSave(){
    // alert('onPressSave')
    if(this.isValidForm()){
      this.extractHashTags();

      if(this.state.audioNote != null){
        //upload audio
        // alert("uploading audio")
        this.uploadFoteWithAudio();
      }
      else if(this.state.uri != ''){
        this.moveFileToDocuments(this.state.uri,this.moveFileCallback.bind(this))
      }else{
        // alert('else')
        if(this.state.activitySelected == "none"){
          // if there is no media and no activity. Upload as type
          if(this.state.activity == null){
            // upload type
            // alert('here')
            this.uploadType();
          }
        }else{
          this.uploadFote("");
        }

      }


    }

  }

  uploadType(){
    _d = new Date().toString();
    _p  = {
      "uri":"",
      "note":this.state.note,
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
      "backgroundColor":this.TYPE_EDITOR.state.backgroundColor,
      "font":this.state.currentFont,
      "fontIndex":this.state.currentSelectedFontIndex,
      "metrics":this.metrics

    }
    cameraCoApi.uploadType(_p);
    this._goBack();

  }

  uploadFoteWithAudio(){
    _d = new Date().toString();
    _phote  = {
      "uri":"",
      "note":this.state.note,
      "date": _d,
      "location":{
        latitude:this.state.latitude,
        longitude:this.state.longitude
      },
      "hashtags":this.state.hashtags,
      "thumbnail":null,
      "is_public":true,
      "place":this.state.place,
      "type":"type",
      "backgroundColor":this.TYPE_EDITOR.state.backgroundColor,
      "font":this.state.currentFont,
      "fontIndex":this.state.currentSelectedFontIndex,
      "metrics":this.metrics
    }
    var d = new Date();
    var n = d.getTime();
    if(this.voiceIndex > 0){
      var destPath = RNFS.DocumentDirectoryPath + '/' + "note-"+n+".m4a";
    }else{
      var destPath = RNFS.DocumentDirectoryPath + '/' + "note-"+n+".aac";

    }
    RNFS.copyFile(this.state.audioNote[0], destPath)
    .then((success) => {
      console.log(success);
      cameraCoApi.uploadFoteWithAudio(_phote,destPath);
      this._goBack();
    })

    .catch((err) => {
      console.log(err);

    });





  }

  _loadHashtags(){
    this.getKey();
  }

  async getKey() {
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
    shortNoteSection = Dimensions.get('window').height - e.endCoordinates.height;
    this.setState({
      keyboardHeight:e.endCoordinates.height,
      keyboardVisible:true,
      shortNoteSection: shortNoteSection
    })
    Animated.timing(
      this.state.animatedViewHeight,
      {
        toValue: shortNoteSection,
        duration: 50,
        easing: Easing.linear
      }
    ).start()
  }

  _keyboardDidHide(e) {
    this.setState({
      keyboardVisible:false
    })
    Animated.timing(
      this.state.animatedViewHeight,
      {
        toValue: Dimensions.get('window').height ,
        duration: 50,
        easing: Easing.linear
      }
    ).start()
  }

  componentWillMount(){
    this._loadHashtags();
    const {navigation} = this.props;
  }

  moveFileToDocuments(filePath,callback){
    fileNameAtDocuments = filePath.split("/");
    fileNameAtDocuments = fileNameAtDocuments[fileNameAtDocuments.length-1];
    var destPath = RNFS.DocumentDirectoryPath + '/' + fileNameAtDocuments;
    RNFS.exists(destPath)
        .then( (exists) => {
            if (exists) {
              callback([true,fileNameAtDocuments])
            } else {
              RNFS.moveFile(filePath, destPath)
                .then((success) => {
                  callback([true,fileNameAtDocuments])
                })
                .catch((err) => {
                  callback([false,err.message])
                });
            }
        });
  }
  moveThumbnailToDocuments(filePath,callback){
    fileNameAtDocuments = filePath.split("/");
    fileNameAtDocuments = fileNameAtDocuments[fileNameAtDocuments.length-1];
    var destPath = RNFS.DocumentDirectoryPath + '/' + fileNameAtDocuments;
    RNFS.exists(destPath)
        .then( (exists) => {
            if (exists) {
              callback([true,fileNameAtDocuments])
            } else {
              RNFS.moveFile(filePath, destPath)
                .then((success) => {
                  callback([true,fileNameAtDocuments])
                })
                .catch((err) => {
                  callback([false,err.message])
                });
            }
        });


  }

  componentDidMount(){
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    this.readSettingIsPublic();
    const {navigation} = this.props;
    // Store width in variable
    this.setState({
      "uri": navigation.getParam('uri',''),
      "longitude":navigation.getParam('longitude',''),
      "latitude":navigation.getParam('latitude',''),
      "thumbnail":navigation.getParam('thumbnail',''),
      'note':navigation.getParam('note',''),
    })
    if(navigation.getParam('uri') == undefined){
      this.TYPE_EDITOR.changeBackgroundColor();
    }
    this.type = navigation.getParam('type','');
    //check if the user is logged in
    global.NOTE_COMPONENT = this;
    global.NOTE_COMPONENT.NOTE_INTENT = false;
    //get place
    _lat = navigation.getParam('latitude','');
    _lon = navigation.getParam('longitude','');

    if(_lat == '' || _lat == null){
      this.readSettingLatestPosition();
    }else{
      // cameraCoApi.getPlaces(_lat,_lon).then((res) => {
      //   // alert(JSON.stringify(res));
      //   if(res.success && res.places.length > 0){
      //     this.setState({'place':res.places[0],'placeName':res.places[0].name});
      //     _s = require('../assets/img/icons/location_blue.png');
      //     global.NOTE_COMPONENT.setState({"locationIcon":_s});
      //   }else{
      //     this.setState({'placeName':'Add Location...'});
      //   }
      // });
      // this.saveSettingLatestPosition(_lat,_lon);
    }
    this.setFeedVisibiliy(true);
  }

  addHashtag(hashtag){
    // alert(hashtag)
    this.textInput.setNativeProps({ text:this.state.note+ " " + hashtag + " "})
    this.setState({"note":this.state.note + " "+hashtag + " "});
  }

  togglePlayPause(isPaused){
    if(isPaused){
      this.setState({isPaused:false,mediaIcon:require('../assets/img/icons/pause.png')});
      // alert(JSON.stringify(this.metrics));

      // for(var metric in this.metrics){

      // this.AudioVisualization.clear();
        // this.AudioVisualization.receiveMetrics(this.metrics[2]);
      // }
    }else{
      this.setState({isPaused:true,mediaIcon:require('../assets/img/icons/play.png')});
    }
  }

  onFinishedPlay(){
    // alert('Done!');

    this.setState(
      { mediaIcon:require('../assets/img/icons/play.png'),isPaused: true },
      () => {
        this.player.seek(0)
        this.index = 0;
      }
    )
  }

  renderPreview(){
    let audio = this.state.audioNote;
    if(audio != null && audio != ''){
      return (
        <View style={{flex:1,alignItems:'center'}}>

        <TouchableOpacity style={styles.preview}
          onPress={() => this.togglePlayPause(this.state.isPaused)} >
          <Image
            style={{height:26,width:26,tintColor:'#87e3e3',alignSelf:'center',position:'absolute'}}
            source={this.state.mediaIcon}
          />
          <Video
            ref={(ref) => {this.player = ref}}
            style={{flex:1,borderRadius:35}}
            audioOnly={true}
            source={{uri:audio[0]}}
            repeat={false}
            paused={this.state.isPaused}
            playWhenInactive={false}
            playInBackground={false}
            onEnd={() => {this.onFinishedPlay()}}
            onProgress={(p) => {this.playAnimation(p)}}
          />
        </TouchableOpacity>
        </View>
      )
    }else{
      return null
    }
  }

  playAnimation(p){
    if( (this.index) < (this.metrics.length) ){
      this.AudioVisualization.receiveMetrics(this.metrics[this.index]);
      this.index = this.index + 1;
    }
  }

  setFeedVisibiliy(value){
    //Set the fote to public or private
    this.setState({"is_public":value})
    this.saveSettingIsPublic(value);
  }

  onActivityCreated(a){
    global.NOTE_COMPONENT.setState({"activity":a})
    // alert(JSON.stringify(a))
  }

  onActivitySelected(activity){
    this.setState({activitySelected:activity});
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

  onPlaceSelected(place){
    _s = require('../assets/img/icons/location_blue.png');
    this.setState({"locationIcon":_s});
    this.setState({"place":place,"placeName":place.name,"latitude":place.geometry.location.lat,"longitude":place.geometry.location.lng});

  }

  onPlaceToSelected(place){
    this.setState({"placeTo":place,"placeToName":place.name});
  }

  getPlaces(){
    this.props.navigation.navigate({key:'Places',routeName:'Places',params:{latitude:this.state.latitude,longitude:this.state.longitude,onPlaceSelected:  this.onPlaceSelected}});
  }

  getPlacesTo(){
    this.props.navigation.navigate({key:'Places',routeName:'Places',params:{latitude:this.state.latitude,longitude:this.state.longitude,onPlaceSelected:  this.onPlaceToSelected}});
  }

  getNotePercentage(){
    _p = (this.state.note.length / 300 ) * 100
    return _p;
  }


  renderTopBar(){
    return(
      <View style={styles.topBar}>
        <View style={{width:115,paddingLeft:25}}>
          <TouchableOpacity onPress={() => this._goBack()}>
            <Image
              style={{height:32,width:32,tintColor:'white'}}
              source={require('../assets/img/icons/closeBlack.png')}
            />
          </TouchableOpacity>
        </View>
        <View style={{flex:1,alignItems:'center',flexDirection:'row',justifyContent:'space-around'}}>
          <TouchableOpacity onPress={() => this.TYPE_EDITOR.changeFont()}>
            <Image
              style={{height:26,width:26,tintColor:'white'}}
              source={require('../assets/img/icons/typeFill.png')}
            />
          </TouchableOpacity>
          {this.renderCircularProgress()}
        </View>
        <View style={{width:115,paddingRight:10,alignItems:'flex-end'}}>
          <TouchableOpacity style={[styles.btnTxt, this.isValidForm() ? {backgroundColor:'white',marginRight:15} : {backgroundColor:'transparent'}]}
            disabled={!this.isValidForm()}
            onPress={() => this.onPressSave()}>
            <Text style={[styles.btnTextFont, this.isValidForm() ? {color:'#ef6185'} : {color:'white'}]}>
              POST
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    )
  }

  renderCircularProgress(){
    if(this.state.note.length > 0){
      return(
        <AnimatedCircularProgress
          size={26}
          width={3}
          fill={this.getNotePercentage()}
          tintColor="#64bad9"
          onAnimationComplete={() => console.log('onAnimationComplete')}
          backgroundColor="white" />
      )
    }else{
      return null
    }
  }


  _generateTask(){
    _t = {
          "description": this.state.note,
          "name": "",
          "date": this.state.date,
          "type":"task",
          "price":parseFloat(this.state.offer),
          "going": [],
          "not_interested": [],
          "interested": [],
      }
      return(_t)
  }
  _generateEvent(){
    _e = {
          "description": this.state.note,
          "name": this.state.note,
          "date": this.state.date,
          "type":"event",
          "going": [],
          "not_going": [],
          "interested": []
      }
      return(_e)

  }
  _generateTrip(){
    _t = {
          "description": this.state.note,
          "name": this.state.note,
          "date": this.state.date,
          "type":"trip",
          "not_interested": [],
          "interested": [],
          "from_place":this.state.place,
          "to_place":this.state.placeTo,
          "price":parseFloat(this.state.ppseat),
          "seats":parseInt(this.state.seats)
      }
    return(_t)
  }


  onFinishedRecording(url){
    if(url == ""){
      this.index=0;
      this.AudioVisualization.clear();
    }
    console.log("u"+url);
    this.setState({"audioNote":[url]})
    this.index=0;
    // alert(JSON.stringify(this.metrics));
    // alert(JSON.stringify(this.index));

  }

  renderRecordBtn(){
    let displayDelete = false;
    if(this.state.audioNote != null && this.state.audioNote != ''){
      displayDelete = true;
    }
    return (
      <View style={displayDelete ? {flex:1,alignItems:'center',position:'absolute', bottom:-80,left:0,right:0} : {flex:1,alignItems:'center'}}>
        <SoundRecorder
              voiceIndex = {this.voiceIndex}
              onFinishedRecording={(url) => {this.onFinishedRecording(url)}}
              onProgress ={(metrics) => {this.onRecordProgress(metrics)}}
              >
        </SoundRecorder>
      </View>
    )
  }



  renderBtns(){
    if(this.state.activitySelected == "none"){
      return(

        <View style={[styles.wrapperBtn,this.state.keyboardVisible ? {height:150,bottom:0}:{height:150,bottom:30} ]}>
          <View style={{flex:1,alignItems:'center',flexDirection:'row'}}>

          <View style={{flex:1,alignItems:'center'}}>
            {this.renderVoiceFilterBtn()}
          </View>
          {this.renderPreview()}
          {this.renderRecordBtn()}
          <View style={{flex:1,alignItems:'center'}}>
            <TouchableOpacity style={styles.actionTypeButton}
              onPress={() => this.TYPE_EDITOR.changeBackgroundColor()}>
              <Image
                style={styles.addButton}
                source={require('../assets/img/icons/type_background.png')}
              />
            </TouchableOpacity>
          </View>
          </View>

        </View>

      )
    }else{
      return (null)
    }

  }


  renderVoiceFilterBtn(){
    let audio = this.state.audioNote;
    if(true){
      return(
        <TouchableOpacity style={styles.actionTypeButton}
          onPress={() => this.changeVoiceFilter()}>
          <Image
            style={styles.addButton}
            source={this.state.voiceImage}
          />
        </TouchableOpacity>
      )
    }else{
      return(
        <View style={styles.actionTypeButton}>
          <Image
            style={styles.addButton}
            source={require('../assets/img/icons/novoiceFilter.png')}
          />
        </View>
      )
    }
  }


  changeVoiceFilter(){
    if( this.voiceIndex >= 3){
      this.voiceIndex = 0;
      this.setState({voiceImage:require('../assets/img/icons/voiceFilter0.png')});
    }else{
      this.voiceIndex = this.voiceIndex + 1;
      if(this.voiceIndex == 1){
        this.setState({voiceImage:require('../assets/img/icons/voiceFilter1.png')});
      }else if(this.voiceIndex == 2){
        this.setState({voiceImage:require('../assets/img/icons/voiceFilter2.png')});
      }else{
        this.setState({voiceImage:require('../assets/img/icons/voiceFilter3.png')});
      }
    }

  }

  onRecordProgress(metrics){
    if(this.AudioVisualization != null){
      this.AudioVisualization.receiveMetrics(metrics);
      this.metrics[this.index] = {
        'currentTime': metrics.currentTime,
        'currentMetering':metrics.currentMetering
      }
      this.index = this.index + 1;
    }

    // alert('Metrics: ' + JSON.stringify(metrics));
  }
  animateKeyboardVisible(){

  }
  render() {

    return (
      <Animated.View style={[styles.container, {height:this.state.animatedViewHeight}]} >
        <StatusBar  hidden={false} />

        <View style={styles.wrapperTxtInput}>
          {this.renderTopBar()}
          <TypeEditor ref={(ref) => this.TYPE_EDITOR = ref}
            onColorChanged={this.onTypeEditorColorChanged.bind(this)}
            onFontChanged={this.onTypeEditorFontChanged.bind(this)}
            onTextChanged={this.onTypeEditorTextChanged.bind(this)}>
          </TypeEditor>
          {this.renderBtns()}
          <AudioVisualization
            ref={(ref) => this.AudioVisualization = ref}
            darkMode={this.state.AVdarkMode}>
          </AudioVisualization>

        </View>

      </Animated.View>
    );
  }

  renderActivitySelector(){
    if(this.state.keyboardVisible){
      return (null);
    }else{
      return(
        <ActivitySelector activitySelected={this.onActivitySelected}>
        </ActivitySelector>
      )
    }
  }

  renderTextArea(){
      if(this.state.currentSelectedBackgroundIndex == 0 || this.state.activitySelected != "none"){
        return(
        <TextInput style={styles.txt_note}
          placeholder="Add caption..."
          placeholderTextColor={'black'}
          ref={element => {this.textInput = element}}
          onChangeText={(text) => this.saveState({text})}
          multiline={false}
          returnKeyType={"done"}
          blurOnSubmit={true}
          maxLength={300}
          value={this.state.note}
        >
        </TextInput>)
      }else{
        return(null);
      }



  }

  generatePostButtonColor(){
    if(this.isValidForm()){
      return "#5cb4dc";
    }else{
      return "black";

    }
  }


  isValidForm(){
    if((this.state.note.trim() != '') || (this.state.audioNote != null && this.state.audioNote != '')){
      return true;
    }
    return false;
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
      "font":this.state.currentFont,
      "fontIndex":this.state.currentSelectedFontIndex,
      'metrics':this.metrics
    }
    if(this.state.activitySelected == "task"){
      _p["activity"] = this._generateTask();
    }
    if(this.state.activitySelected == "event"){
      _p["activity"] = this._generateEvent();
    }
    if(this.state.activitySelected == "trip"){
      _p["activity"] = this._generateTrip();
    }
    if(type == 'video'){
      _p.type = 'video';
    }
    cameraCoApi.uploadFote(_p);
    this.saveUploadProgress(_p);
    this._goToFeed();

  }
  async saveUploadProgress(_p){
    await AsyncStorage.setItem('uploadFote', JSON.stringify(_p));

  }
  async saveSettingIsPublic(is_public){
    await AsyncStorage.setItem('setting_is_public', is_public.toString());
  }
  async readSettingIsPublic() {
     try {
       const value = await AsyncStorage.getItem('setting_is_public');
       setting_is_public = false;
       value == "true" ? setting_is_public = true : setting_is_public == false;
       this.setState({is_public: JSON.parse(setting_is_public)});
     } catch (error) {
       console.log("Error retrieving data" + error);
     }
  }
  async saveSettingLatestPosition(latitude,longitude){
    _position = {"latitude":latitude,"longitude":longitude}
    await AsyncStorage.setItem('setting_latest_position', JSON.stringify(_position));
  }
  async readSettingLatestPosition() {
     try {
       const value = await AsyncStorage.getItem('setting_latest_position');
       _position  = JSON.parse(value);
       if(_position.hasOwnProperty("latitude")){
         this.setState({latitude: _position.latitude, longitude:_position.longitude});
         // cameraCoApi.getPlaces(_position.latitude,_position.longitude).then((res) => {
         //   // alert(JSON.stringify(res));
         //   if(res.success && res.places.length > 0){
         //     this.setState({'place':res.places[0],'placeName':res.places[0].name});
         //     _s = require('../assets/img/icons/location_blue.png');
         //     global.NOTE_COMPONENT.setState({"locationIcon":_s});
         //   }else{
         //     this.setState({'placeName':'Add Location...'});
         //   }
         // });
       }else{
         this.setState({'placeName':'Add Location...'});
       }


     } catch (error) {
       console.log("Error retrieving data" + error);
     }
  }
  async saveNote(note) {
     try {
       const value = await AsyncStorage.getItem('key');
       type = this.type;
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
       if(this.state.activity != null){
         _p["activity"] = this.state.activity.activity;
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
       type = this.type;;
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
       if(this.state.activity != null){
         _p["activity"] = this.state.activity.activity;
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
    backgroundColor:'transparent'
  },
  txt_note:{
    paddingLeft:25,
    paddingRight:95,
    fontSize: 20,
    color:'black'
  },
  hashTagsList:{
    flex:1,
    flexDirection:'row'
  },
  loc_right:{
    justifyContent:'center'
  },
  placeName:{
    paddingTop:5,
    fontSize:16,
    color:'#333333'
  },
  setting:{
    paddingLeft:25,
    paddingRight:25,
    height:60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:'center',
  },
  actionButton:{
    height:50,
    width:50,
    borderRadius:25,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:'#ef6185',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.6 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    borderWidth:3,
    borderColor:'white'
  },
  actionTypeButton:{
    height:50,
    width:50,
    borderRadius:25,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:'white',
  },
  addButton:{
    height:30,
    width:30,
    tintColor:'black'
  },
  wrapperTxtInput:{
    flex:1,
  },
  preview:{
    height:70,
    width:70,
    borderRadius:35,
    backgroundColor:"#3b4f6c",
    borderColor:'#87e3e3',
    borderWidth:3,
    alignItems:'center',
    justifyContent:'center'
  },
  wrapperBtn:{
    flexDirection:'row',
    backgroundColor:'transparent',
    alignItems:'flex-start',
    position:'absolute',
    left:0,
    right:0,
    zIndex:99
  },
  topBar:{
    height:50,
    flexDirection:'row',
    position:'absolute',
    left:0,
    right:0,
    zIndex:1,
    top:statusBarHeight,
    alignItems:'center',
    backgroundColor:'transparent'
  },
  btnTxt:{
    borderRadius:15,
    width:80,
    alignItems:'center',
    backgroundColor:'green',
    paddingTop:5,
    paddingBottom:5,
  },
  btnTextFont:{
    fontSize:16,
    fontWeight:'bold'
  }
});
