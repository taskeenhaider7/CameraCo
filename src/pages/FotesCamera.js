import React, { Component } from 'react';
import {
  AppState,
  CameraRoll,
  Dimensions,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  Alert,
  TextInput
} from 'react-native';
import {
  NavigationActions,
  StackNavigator,
} from 'react-navigation';
import { RNCamera } from 'react-native-camera';
import ImageResizer from 'react-native-image-resizer';

import RNThumbnail from 'react-native-thumbnail';
import {createResponder} from 'react-native-gesture-responder'
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import ViewShot from "react-native-view-shot";
import Video from "react-native-video";
import { isIphoneX } from 'react-native-iphone-x-helper';
import { ifIphoneX } from 'react-native-iphone-x-helper';

import ActionButtons from '../components/ActionButtons';
import EffectSelector from '../components/EffectSelector';
import GalleryGridPicker from "./GalleryGridPicker";

const {width, height} = Dimensions.get('window');
const posInput = (height/2)-50;
const flashOff = RNCamera.Constants.FlashMode.off;

statusBarHeight = getStatusBarHeight();
var RNFS = require('react-native-fs');

class FotesCamera extends Component {

  constructor(params){
    super(params);
    this.handleClick = this.handleClick.bind(this);
    this._onEffectPressed = this._onEffectPressed.bind(this);

    const {navigation} = this.props;

    this.state = {
      cameraFlashToggle: flashOff,
      cameraMode:'back',
      flashImage: require('../assets/img/icons/flash_off.png'),
      page:0,
      latitude: null,
      longitude: null,
      error: '',
      isRecording:false,
      videoMode:false,
      msgRecording:'noclick',
      recordingTime:0,
      appState: AppState.currentState,
      zoom:0.0,
      gestureState: {},
      thumbSize: 100,
      left: width / 2,
      top: height / 2,
      preview:false,
      uri:'',
      note:'',
      thumbnail:"",
      filter:"",
      filter_uri:"",
      filter_thumbnail:"",
      mirrorImage:false,
      photoImage: require('../assets/img/icons/photo_black.png'),
      videoImage: require('../assets/img/icons/video.png'),
      mainBtnTxt: navigation.getParam('mainBtnTxt','Next'),
      disableVideo: navigation.getParam('disableVideo',false),
      hideTypeBtn: navigation.getParam('hideTypeBtn',true),
      libraryArea:0,
      renderEffects:false,
    }
    this.id = null;
    this.options = {
      enableHighAccuracy: true,
      maximumAge: 0
    };
    this.filterIndex = 0;
  }

  componentWillMount() {
    this.gestureResponder = createResponder({
      onStartShouldSetResponder: (evt, gestureState) => true,
      onStartShouldSetResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetResponder: (evt, gestureState) => true,
      onMoveShouldSetResponderCapture: (evt, gestureState) => true,
      onResponderGrant: (evt, gestureState) => {
      },
      onResponderMove: (evt, gestureState) => {
        let thumbSize = this.state.thumbSize;
        if((gestureState.dy < -100) && (gestureState.dx > 0)){
          if(!this.state.preview){
            this.gridPicker.refreshFiles();
            this.setState({libraryArea:1})
          }
        }else if(gestureState.dx > 0){
          this.setState({libraryArea:0})

        }
        if (gestureState.pinch && gestureState.previousPinch) {
          thumbSize *= (gestureState.pinch / gestureState.previousPinch)
        }
        let {left, top} = this.state;
        left += (gestureState.moveX - gestureState.previousMoveX);
        top += (gestureState.moveY - gestureState.previousMoveY);
        _zoom = this.state.zoom;
        if(gestureState.previousPinch >= gestureState.pinch){
          _zoom = _zoom - 0.01;
        }else{
          _zoom = _zoom + 0.01;

        }
        if(_zoom < 0.0){
           _zoom = 0.0;
        }
        if(_zoom > 1.0){
           _zoom = 1;
        }
        if(gestureState.pinch != null){
          this.setState({
            gestureState: {
              ...gestureState
            },
            page:1,
            zoom:_zoom,
            left, top, thumbSize
          })
        }


      },
      onResponderTerminationRequest: (evt, gestureState) => true,
      onResponderRelease: (evt, gestureState) => {
        if(gestureState.singleTapUp){
          this.setState({libraryArea:0})
        }
        if(gestureState.doubleTapUp){
          this.setMode();
        }
        this.setState({
          gestureState: {
            ...gestureState
          }
        })
      },
      onResponderTerminate: (evt, gestureState) => {
      },
    })
  }

  handleClick() {
    this.setMode();
  }
  setMode(){
    if(this.state.cameraMode == 'back'){
      this.setState({
        cameraMode: 'front',
        mirrorImage:true
      },
      () => {
        this.forceUpdate();
      }

    )
    }else{
      this.setState({
        cameraMode: 'back',
        mirrorImage:false

      },
      () => {
        this.forceUpdate();
      })
    }
  }

  setFlash(){
    var state = this.state;
    var stateImage = this.state;

    if(state.cameraFlashToggle === RNCamera.Constants.FlashMode.on){
      state.cameraFlashToggle = RNCamera.Constants.FlashMode.off;
      stateImage.flashImage = require('../assets/img/icons/flash_off.png');
    }else{
      state.cameraFlashToggle = RNCamera.Constants.FlashMode.on;
      stateImage.flashImage = require('../assets/img/icons/flash_on.png');
    }
    this.setState({page:0});
    state.page = 0;
    stateImage.page = 0;
    this.setState(state);
    this.setState(stateImage);
  }
  updateRecordingTimer(){
    this.secs += 1;
    this.setState({ recordingTime: this.secs})
  }
  recordVideo = async function() {
    // this.setState({"isRecording":true,"page":0,'msgRecording':'Recording...'});

    if (this.camera) {
      // this.setState({"isRecording":true,"page":0,'msgRecording':'Recording...'});
      d = new Date().getTime();
      const options = { maxDuration: 8 };
      const thumb_options = { quality: 0.5, base64: true  };
      this.secs = 0;
      this.interval = setInterval(() => this.updateRecordingTimer(), 250);
      const data = await this.camera.recordAsync(options)
      clearInterval(this.interval);
      RNThumbnail.get(data.uri).then((result) => {
        this.setState({isRecording:false,
          type:'video',
          uri:data.uri,
          thumbnail:result.path,
          preview:true,
          recordingTime:0
        });
      })
    }
  };

  takePicture = async function() {
    // const {goBack} = this.props.navigation;
    // const {state} = this.props.navigation;
    if (this.camera) {

      const options = { quality: 0.5, base64: true,mirrorImage:this.state.mirrorImage};
      const data = await this.camera.takePictureAsync(options)
      d = new Date().getTime();

       ImageResizer.createResizedImage(data.uri,600, 1062,"PNG", 85, 0, d+ ".thumbnail").then((response) => {
      // response.uri is the URI of the new image that can now be displayed, uploaded...
      // response.path is the path of the new image
      // response.name is the name of the new image with the extension
      // response.size is the size of the new image
      // _picture = {"uri":data.uri}

      this.setState({uri:data.uri,thumbnail:response.uri,preview:true})
      // state.params.callback(_picture);
      // goBack();

        // this.props.navigation.dispatch(resetAction);
     }).catch((err) => {
       // alert(err)
      // Oops, something went wrong. Check that the filename is correct and
      // inspect err to get more details.
     });
    }
  };

  _onImageSelected(item){
    // alert(JSON.stringify(item));
    this.setState({libraryArea:0})
    _uri = item.item.node.image.uri;
    d = new Date().getTime();
    var destPath = RNFS.DocumentDirectoryPath + '/' + "picked_"+d+".png";
    RNFS.copyAssetsFileIOS(_uri, destPath,600,1062)
      .then((success) => {
            ImageResizer.createResizedImage(destPath,600, 1062, "PNG", 85, 0, d+ ".thumbnail").then((response) => {
            // response.uri is the URI of the new image that can now be displayed, uploaded...
            // response.path is the path of the new image
            // response.name is the name of the new image with the extension
            // response.size is the size of the new image
              this.setState({uri:destPath,preview:true,thumbnail:response.uri});

            }).catch((err) => {
              alert(err);
              // Oops, something went wrong. Check that the filename is correct and
              // inspect err to get more details.
            });
      })
      .catch((err) => {
        alert(err)
      });
  }

  onPressCapture(){
    if(this.state.isRecording){
      this.camera.stopRecording();
      return 0;
    }
    if(this.state.videoMode){
      this.setState(
      {
        isRecording:true,
        msgRecording:'Recording...'
      },
      () => {
        this.recordVideo();
        this.forceUpdate();
      }
      );
    }else{
      this.takePicture()
    }
  }
  setVideoMode(){
    let imagePhoto = require('../assets/img/icons/photo.png');
    let imageVideo = require('../assets/img/icons/video_black.png');

     this.setState({
       videoMode: true,
       photoImage: imagePhoto,
       videoImage: imageVideo
     })
  }
  setPhotoMode(){
    let imagePhoto = require('../assets/img/icons/photo_black.png');
    let imageVideo = require('../assets/img/icons/video.png');
     this.setState({
       videoMode: false,
       photoImage: imagePhoto,
       videoImage: imageVideo
     })
  }
  renderVideoModesLeft(){
    if(this.state.isRecording){
      return (null);
    }else{
      return(
        <View style={styles.btnContainerSection}>
        <TouchableOpacity  style={{backgroundColor:"#FFFFFF50",height:30,width:30,borderRadius:15,flexDirection:"row",justifyContent:"center",alignItems:"center"}} onPress={() => this.setMode()}>
          <Image
            style = {styles.icon}
            source = {require('../assets/img/icons/camera_mode.png')}
          />
        </TouchableOpacity>
          <TouchableOpacity style={{backgroundColor:"#FFFFFF50",height:30,width:30,borderRadius:15,flexDirection:"row",justifyContent:"center",alignItems:"center"}} onPress={() => this.setFlash()}>
            <Image
              style = {styles.icon}
              source = {this.state.flashImage}
            />
          </TouchableOpacity>


        </View>
      )
    }
  }

  renderVideoModes(){
    if((this.state.isRecording) || (this.state.disableVideo)){
      return (null);
    }else{
      return(
        <View style={styles.btnContainerSection}>
          <View style={styles.wrapper_icon_no_video}></View>

          <TouchableOpacity onPress={() => this.setPhotoMode()}
            style={[styles.wrapper_icon, this.state.videoMode ? {backgroundColor:'#FFFFFF50'} : {backgroundColor:'white'}]}>
            <Image
              style = {[styles.icon, this.state.videoMode ? {tintColor:"white"}:{tintColor:"#dd6b8c"}]}
              source = {this.state.photoImage}
            />
          </TouchableOpacity>
        </View>
      )
    }
  }

  renderHeaderControls(){
    if(this.state.isRecording){
      return null
    }else{
      return(
        <View style={styles.header}>
          <View style={{flex:1}}>
            {this.renderCancelBtn()}
          </View>
            {this.renderActionButtons()}
        </View>
      )
    }

  }
  renderActionButtons(){
    if(this.state.preview){
      return(
        <ActionButtons
          style={{flex:1,alignItems:'flex-end',justifyContent:'center'}}
          onPressType={() => {this._onPressText()}}
          preview={this.state.preview}
          video={this.state.videoMode}
          mainBtnTxt={this.state.mainBtnTxt}
          onPressNext={() => this.onPressNext()}
          hideTypeBtn={this.state.hideTypeBtn}>
        </ActionButtons>
      )
    }else{
      return null
    }
  }

  _onPressText(){
    this.setState({showInput:!this.state.showInput});
  }

  _onEffectPressed(){
    this.setState({renderEffects:!this.state.renderEffects});
  }

  renderInput(){
    if(this.state.showInput){
      return(
        <View style={styles.wrapperInput}>
          <TextInput style={{fontSize:20,color:'white',paddingLeft:5,paddingRight:5}}
            multiline={true}
            placeholder={'Caption...'}
            placeholderTextColor={'white'}
            onChangeText={(note)=>this.setState({note})}
          />
        </View>
      )
    }else{
      return null
    }
  }

  renderCamera(){
    if(!this.state.preview){
      return(
        <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style = {styles.preview}
            type={this.state.cameraMode}
            flashMode={this.state.cameraFlashToggle}
            zoom={this.state.zoom}
            autoFocus={RNCamera.Constants.AutoFocus.on}
            focusDepth={1.00}
            mirrorImage={true}
            fixOrientation={true}
            orientation={"portait"}
            whiteBalance={RNCamera.Constants.WhiteBalance.auto}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need your permission to use your camera phone'}
        />
      )
    }else{
      if(this.state.type == 'video'){
        return(
          <View style={{flex:1}}>
            <Video
              style={{flex:1}}
              source={{uri:this.state.uri}}
              repeat={true}
              volume={0}
            />
          </View>
        )
      }else{
        // <ColorMatrixImage style={{resizeMode: 'contain',flex:1,backgroundColor:'red'}} source={{uri:this.state.thumbnail}}>
        // </ColorMatrixImage>
        if(this.state.filter == "" || this.state.filter == null){
          return(
            <View style={{flex:1}}>
            <ViewShot ref="viewShot" options={{ format: "jpg", quality: 0.9 }} style={{flex:1}}>

              <Image style={{resizeMode: 'contain',flex:1}}
                source={{uri:this.state.uri}}
              />
              </ViewShot>

            </View>
          )
        }else if(this.state.filter =="sepia"){
          return(
            <View style={{flex:1}}>
                <ViewShot ref="viewShot" options={{ format: "jpg", quality: 0.9 }} style={{flex:1}}>
                  <FilterSepia style={{resizeMode: 'contain',flex:1}}
                    source={{uri:this.state.thumbnail}}
                  />
                </ViewShot>

              </View>
          )
        }else if(this.state.filter =="technicolor"){

          return(
            <View style={{flex:1}}>
            <ViewShot ref="viewShot" options={{ format: "jpg", quality: 0.9 }} style={{flex:1}}>
              <FilterTechnicolor style={{resizeMode: 'contain',flex:1}}
                source={{uri:this.state.thumbnail}}
              />
            </ViewShot>
            </View>
          )
        }else if(this.state.filter =="grayscale"){
          return(
            <View style={{flex:1}}>
            <ViewShot ref="viewShot" options={{ format: "jpg", quality: 0.9 }} style={{flex:1}}>

              <FilterGrayscale style={{resizeMode: 'contain',flex:1}}
                source={{uri:this.state.thumbnail}}
              />
            </ViewShot>

            </View>
          )
        }else if(this.state.filter =="nightvision"){
          return(
            <View style={{flex:1}}>
            <ViewShot ref="viewShot" options={{ format: "jpg", quality: 0.9 }} style={{flex:1}}>

              <FilterNightVision style={{resizeMode: 'contain',flex:1}}
                source={{uri:this.state.thumbnail}}
              />
            </ViewShot>

            </View>
          )
        }else if(this.state.filter =="warm"){
          return(
            <View style={{flex:1}}>
            <ViewShot ref="viewShot" options={{ format: "jpg", quality: 0.9 }} style={{flex:1}}>

              <FilterWarm style={{resizeMode: 'contain',flex:1}}
                source={{uri:this.state.thumbnail}}
              />
            </ViewShot>

            </View>
          )
        }else if(this.state.filter =="cool"){
          return(
            <View style={{flex:1}}>
            <ViewShot ref="viewShot" options={{ format: "jpg", quality: 0.9 }} style={{flex:1}}>

              <FilterCool style={{resizeMode: 'contain',flex:1}}
                source={{uri:this.state.thumbnail}}
              />
            </ViewShot>

            </View>
          )
        }

      }
    }
  }

  renderTimerVideo(){
    if(this.state.isRecording){
      return(
        <View style={styles.headerTimer}>
          <View style={styles.wrapper_middle}>
            <View style={{height:25,width:67,flexDirection:'row',alignItems:"center",justifyContent:"center"}}>
              <View style={{backgroundColor:"#ed3a37",borderRadius:20,height:10,width:10,marginRight:2}}> </View>
              <Text style={styles.recordingText}>00:0{this.state.recordingTime}</Text>
            </View>
          </View>
        </View>
      )
    }else{
      return null
    }
  }

  renderBtnContainer(){
    if(!this.state.preview){
      return(
        <View style={styles.btnContainer}>
          <View style={{flex:1,flexDirection:'row'}}>
            {this.renderVideoModesLeft()}
          </View>
          <View style={styles.wrapperCapture}>
            <TouchableOpacity
                onPress={() => this.onPressCapture()}
                style = {styles.capture}>
                  <AnimatedCircularProgress
                    size={75}
                    width={15}
                    fill={this.getNotePercentage()}
                    tintColor= 'rgb(100, 186, 217)'
                    onAnimationComplete={() => console.log('onAnimationComplete')}
                    backgroundColor="rgba(255,255,255,0.4)" />
                    <View style={styles.captureBtn}>
                    </View>
            </TouchableOpacity>
          </View>
          <View style={{flex:1,flexDirection:'row'}}>
            {this.renderVideoModes()}
          </View>
        </View>
      )
    }else{
      return(
        <View style={styles.btnContainer}>
          <EffectSelector
            showEffects={this.state.renderEffects}
            onEffectPressed={(index) => this._onEffectSelected(index)}
          />
        </View>
      )
    }
  }

  getNotePercentage(){
    _p = (this.state.recordingTime / 32 ) * 100
    return _p;
  }

  renderCancelBtn(){
    if(this.state.preview){
      return(
        <TouchableOpacity style={styles.shadow} onPress={() => this.cancelBtn()}>
          <Text style={{color:'white',fontSize:16,fontWeight:'bold'}}>
            Cancel
          </Text>
        </TouchableOpacity>
      )
    }else{
      return null;
    }
  }

  cancelBtn(){
    this.setState({uri:'',preview:false,type:'',thumbnail:'',recordingTime:0,note:'',showInput:false});
  }

  onPressNext(){
    const {goBack} = this.props.navigation;
    const {state} = this.props.navigation;

    if(this.filterIndex > 0){
      this.refs.viewShot.capture().then(uri => {
        this.resizeImageWithFilter(uri);
      })
    }
    else if(this.state.type == 'video'){
      _picture = {"uri":this.state.uri,'msg':this.state.note.trim()}

      state.params.callback(_picture);
      goBack();
    }else{
      _picture = {"uri":this.state.uri,'msg':this.state.note.trim()}

      state.params.callback(_picture);
      goBack();
    }
  }

  resizeImageWithFilter(path){
    d = new Date().getTime();
    ImageResizer.createResizedImage(path, 600, 1062, "PNG", 85, 0, d+ ".thumbnail").then((response) => {
      this.setState({filter_uri:response.uri,filter_thumbnail:response.uri},() => {
        this.onPressNextWithFilter();
      });

    }).catch((err) => {
      alert(err);
    });
  }

  onPressNextWithFilter(){
    d = new Date().getTime();
    var destPath = RNFS.DocumentDirectoryPath + '/' + "filter_"+d+".png";
    const {state} = this.props.navigation;
    const {goBack} = this.props.navigation;

    RNFS.copyFile(this.state.filter_uri, destPath).then((success) => {
      _picture = {uri: destPath,'msg':this.state.note.trim()}
      state.params.callback(_picture);
      goBack();
    })
    .catch((err) => {
      // callback([false,err.message])
    });
   }

  render() {
    const {goBack} = this.props.navigation;
    const thumbSize = this.state.thumbSize;

    return (
      <View style={styles.container}>
        <View style={styles.scontentContainer}>
          <View   style={{flex:1}} radius={10000} onClick={this.handleClick} >
              {this.renderHeaderControls()}
              <View style={styles.wrapperSlider} {...this.gestureResponder}>
              </View>

              {this.renderCamera()}
              {this.renderInput()}
              {this.renderBtnContainer()}
          </View>
          <View style={{flex:this.state.libraryArea}}>
            <GalleryGridPicker
              ref={ref => {
                this.gridPicker = ref;
              }}
              onImagePicked={(item) => this._onImageSelected(item)} >
            </GalleryGridPicker>
          </View>
        </View>
      </View>
    );
  }

}

const biasRev = Platform.OS === 'ios' ? 255 : 1;
const filters =

    {
      //Grayscale
      grayscale: [
        0.299, 0.587, 0.114, 0, 0,
        0.299, 0.587, 0.114, 0, 0,
        0.299, 0.587, 0.114, 0, 0,
        0, 0, 0, 1, 0
      ],
      sepia: [
        0.393, 0.769, 0.189, 0, 0,
        0.349, 0.686, 0.168, 0, 0,
        0.272, 0.534, 0.131, 0, 0,
        0, 0, 0, 1, 0
      ],
      technicolor: [
        1.9125277891456083, -0.8545344976951645, -0.09155508482755585, 0, 11.793603434377337 / biasRev,
        -0.3087833385928097, 1.7658908555458428, -0.10601743074722245, 0, -70.35205161461398 / biasRev,
        -0.231103377548616, -0.7501899197440212, 1.847597816108189, 0, 30.950940869491138 / biasRev,
        0, 0, 0, 1, 0
      ],
      nightvision: [
        0.1, 0.4, 0, 0, 0,
        0.3, 1, 0.3, 0, 0,
        0, 0.4, 0.1, 0, 0,
        0, 0, 0, 1, 0
      ],

      warm: [
        1.06, 0, 0, 0, 0,
        0, 1.01, 0, 0, 0,
        0, 0, 0.93, 0, 0,
        0, 0, 0, 1, 0
      ],

      cool: [
        0.99, 0, 0, 0, 0,
        0, 0.93, 0, 0, 0,
        0, 0, 1.08, 0, 0,
        0, 0, 0, 1, 0
    ],
    }
  const FilterSepia= (imageProps) => (
    <ColorMatrix style={{flex:1}} matrix={[
      0.393, 0.769, 0.189, 0, 0,
      0.349, 0.686, 0.168, 0, 0,
      0.272, 0.534, 0.131, 0, 0,
      0, 0, 0, 1, 0]}>
      <Image  {...imageProps}></Image>
    </ColorMatrix>
  );
  const FilterTechnicolor = (imageProps) => (
    <ColorMatrix style={{flex:1}} matrix={filters["technicolor"]}>
      <Image  {...imageProps}></Image>
    </ColorMatrix>
  );
  const FilterGrayscale = (imageProps) => (
    <ColorMatrix style={{flex:1}} matrix={filters["grayscale"]}>
      <Image  {...imageProps}></Image>
    </ColorMatrix>
  );
  const FilterNightVision = (imageProps) => (
    <ColorMatrix style={{flex:1}} matrix={filters["nightvision"]}>
      <Image  {...imageProps}></Image>
    </ColorMatrix>
  );
  const FilterWarm = (imageProps) => (
    <ColorMatrix style={{flex:1}} matrix={filters["warm"]}>
      <Image  {...imageProps}></Image>
    </ColorMatrix>
  );
  const FilterCool = (imageProps) => (
    <ColorMatrix style={{flex:1}} matrix={filters["cool"]}>
      <Image  {...imageProps}></Image>
    </ColorMatrix>
  );

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scontentContainer:{
    flex:1,
    backgroundColor:'black'
  },
  corousel:{
    flex:1,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  btnContainer: {
    position:"absolute",
    flexDirection: 'row',
    right: 0,
    left: 0,
    bottom:0,
    height:135,
    paddingBottom: 0,
    backgroundColor:'transparent'
  },
  capture: {
    height:100,
    width:100,
    backgroundColor: 'transparent',
    alignItems:'center',
    justifyContent:'center',
    borderRadius: 50,
  },
  captureBtn:{
    height:52,
    width:52,
    backgroundColor:'white',
    borderRadius:26,
    position:'absolute'
  },
  header:{
    flexDirection:'row',
    paddingLeft:20,
    paddingRight:20,
    alignItems:'center',
    position:'absolute',
    top:30,
    right:0,
    left:0,
    height:50,
    zIndex:10,
    ...ifIphoneX({
            marginTop: 25
        }, {
            marginTop: 0
        })
  },
  wrapper_left:{
    flex:1,
  },
  wrapper_middle:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
  },
  wrapper_right:{
    flex:1,
    alignItems:'flex-end'
  },
  icon:{
    height:25,
    width:25,
    tintColor:"white"
  },
  containerType:{
    flexDirection:"row",
    padding:5
  },
  recordingText:{
    fontSize:16,
    color:"white",
    backgroundColor:"transparent"
  },
  modeCaption:{
    fontSize:16,
    color:"white",
    backgroundColor:"transparent",
    padding:3,
    borderRadius:100
  },
  modeContainer:{
    borderRadius:6,padding:5
  },
  videoTab:{
    marginRight:5,
  },
  wrapperCapture:{
    width:100,
    justifyContent:'center',
    alignItems:'center',
    ...ifIphoneX({
            paddingBottom:34
        }, {
            paddingTop: 0
        }),
  },
  btnContainerSection:{
    flex:1,
    flexDirection:'row',
    justifyContent:'space-around',
    alignItems:'center',
    ...ifIphoneX({
            paddingBottom:34
        }, {
            paddingTop: 0
        }),
  },
  wrapper_icon:{
    height:30,
    width:30,
    borderRadius:20,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:"#FFFFFF50",
    flexDirection:"row",
  },
  wrapper_icon_no_video:{
    height:30,
    width:30,
    justifyContent:'center',
    alignItems:'center'
  },
  shadow:{
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 2
  },
  headerTimer:{
    flexDirection:'row',
  },
  wrapperSlider:{
    height:height-160,
    width:width,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'flex-end',
    position:'absolute',
    zIndex:5,
    ...ifIphoneX({
            marginTop: 75
        }, {
            marginTop: 50
        }),

  },
  wrapperInput:{
    height:100,
    backgroundColor:'rgba(0, 0, 0,0.3)',
    position:'absolute',
    right:0,
    left:0,
    top:posInput,
    justifyContent:'center',
    alignItems:'center',
    zIndex:10
  },
});
export default  FotesCamera;
