import React, { Component } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  NativeModules,
  NativeAppEventEmitter,
  TouchableOpacity,
  Image,
  Alert,
  View
} from 'react-native';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Video from "react-native-video";
import AnimationAudio from './AnimationAudio';
import EventEmitter from "react-native-eventemitter";

export default class ButtonRecorder extends Component {
  constructor(props){
    super(props);
    this.state ={
      "event":"standby",
      'db':0,
      currentTime:0,
      animatedValue: new Animated.Value(50),
      recordingBtn:true,
      onPressBtn:false,
      isRecording:false,
      finishedTime:0,
      url:null,
      is_playing: false,
      icon_playing: require('../assets/img/icons/play.png'),
      audioNote: null
    }
    this.db = 0;
    this.url = "";
    this.metrics = [];
  }
  componentDidMount(){
    AudioRecorder.requestAuthorization().then((isAuthorised) => {

    })
    EventEmitter.addListener("onRecordFinished", res => {
        this.setState({ url: res.path, audioNote: res.path });
        this.props.onFinishedRecording(res.path);
    });
    EventEmitter.addListener("onMeasure",
      res => {
        if(this.state.currentTime > 15.0){
          this.onButtonRelease();
          this.setState({
            currentTime:0
          });
        }else{
          this.setState({
            currentTime:this.state.currentTime + 0.25
          });
          data = {
            "currentTime":this.state.currentTime,
            "currentMetering": 20 * Math.log(res.db) / Math.LN10
          }
          this.metrics.push(data);
          this.props.onProgress(data);
        }
      }
    );
  }
  animate(db) {
    Animated.timing(
      this.state.animatedValue,
      {
        toValue: 90,
        duration: 500,
        easing: Easing.linear
      }
    ).start();
  }
  removeAnimate() {
    Animated.timing(
      this.state.animatedValue,
      {
        toValue: 50,
        duration: 1,
        easing: Easing.linear
      }
    ).start()
    //
  }
  getPixRatio(){
    return ( ( ( 30 * this.state.db) / 160 ) + 60 );
  }
  onButtonRelease(){
    this.setState({"event":"release",currentTime:0,onPressBtn:false});
    this.stop();
    this.removeAnimate();
  }
  onButtonPress(){
    this.setState({"event":"press",onPressBtn:true});
    this.animate();
    AudioRecorder.requestAuthorization().then((isAuthorised) => {
      if(this.props.voiceIndex > 0){
        NativeModules.AuralShifter.record(JSON.stringify(this.props.voiceIndex));
      }else{
        this.record();
      }
    });
  }

  async stop(){
    if(this.props.voiceIndex > 0){
      NativeModules.AuralShifter.stop("")
      var d = new Date();
      var n = d.getTime();
      this.setState({isRecording:false,recordingBtn:false,finishedTime:n});
    }else{
      const filePath = AudioRecorder.stopRecording();
      // if(this.state.event == "release"){
        this.props.onFinishedRecording(this.url);
      // }
      this.setState({url:this.url, audioNote: this.url});

      var d = new Date();
      var n = d.getTime();
      this.setState({isRecording:false,recordingBtn:false,finishedTime:n});
      var d = new Date();
      var n = d.getTime();
      this.url = AudioUtils.DocumentDirectoryPath + '/'+n+'-audio.aac';
      await this.prepareRecordingPath(AudioUtils.DocumentDirectoryPath + '/'+n+'-audio.aac',)
    }


  }
  prepareRecordingPath(audioPath){
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 2,
      AudioQuality: "High",
      AudioEncoding: "aac",
      MeteringEnabled:true
    });
    AudioRecorder.onProgress = (data) => {
      if(data.currentTime > 15.0){
        this.onButtonRelease();
        this.setState({
          currentTime:0
        })
      }else{
        this.setState({
          currentTime:data.currentTime
        })
        this.metrics.push(data);
        this.props.onProgress(data);
      }
    };
    NativeAppEventEmitter.addListener('recordingErrorOcurred',
      (error) => {
        const filePath = AudioRecorder.stopRecording();
        console.log("ERROR");
      }
    );
    AudioRecorder.onFinished = (data) => {
      // Android callback comes in the form of a promise instead.
      console.log("===SWIFF===FINISH===");
      console.log("SWIFF" + JSON.stringify(data));
        // this._finishRecording(data.status === "OK", data.audioFileURL, data.audioFileSize);
    };
  }
  async record(){
      this.metrics = [];
      this.setState({"isRecording":true});
      var d = new Date();
      var n = d.getTime();
      this.url = AudioUtils.DocumentDirectoryPath + '/'+n+'-audio.aac';
      await this.prepareRecordingPath(AudioUtils.DocumentDirectoryPath + '/'+n+'-audio.aac',)
      try {
          const filePath = await AudioRecorder.startRecording();
        } catch (error) {
          console.error(error);
        }

  }
  getNotePercentage(){
    let _p = (this.state.currentTime / 15 ) * 100;
    return _p;
  }

  renderRecordBtn(){
      return(
        <Animated.View style={[{height:80,width:80,flexDirection:"row",justifyContent:"center",alignItems:"center"}]} >
        <Animated.View style={[{height:60,flexDirection:"row",alignItems:"center",justifyContent:"center",width:60}]} >
        <Animated.View style={[{backgroundColor:"#fcd9e2",borderRadius:60,position:"absolute",width:this.state.animatedValue,height:this.state.animatedValue}]} >
        </Animated.View>
            <TouchableOpacity activeOpacity={1}
              onPressIn={() => this.onButtonPress()}
              onPressOut={() => this.onButtonRelease()}
              style={styles.btnWrapperPresed}>
              <AnimatedCircularProgress
                  style={{position: 'absolute'}}
                  size={90}
                  width={10}
                  fill={this.getNotePercentage()}
                  tintColor="#ef6185"
                  onAnimationComplete={() => console.log('onAnimationComplete')}
                  backgroundColor="transparent"/>
              <Image
                  style={[styles.btnPresed]}
                  source={require('../assets/img/icons/microphone.png')}
              />
            </TouchableOpacity>
        </Animated.View>

      </Animated.View>);
  }

  alertDelete(){

    var d = new Date();
    var n = d.getTime();
    _secs = ( (n  - this.state.finishedTime)  / 1000 );

    // alert
    if(_secs > 2){
      Alert.alert(
        'Delete',
        'Are you sure you want to delete the audio?',
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: () => this.deleteAudio()},
        ],
        // { cancelable: false }
      )
    }

  }

  deleteAudio(){
    this.db=0;
    this.url=null;
    this.setState({recordingBtn:true,url:null});
    this.props.onFinishedRecording('');
  }
  playAudio(){
    if(this.state.is_playing){
        this.setState({
            is_playing: false,
            icon_playing: require('../assets/img/icons/play.png')
        });
    }else{
        this.setState({
            is_playing: true,
            icon_playing: require('../assets/img/icons/pause.png')
        });
    }

  }
  onFinishedPlay(){
    this.setState(
      {
        is_playing: false,
        icon_playing: require('../assets/img/icons/play.png')
      },
      () => {
        this.player.seek(0);
      }
    );
    this.props.onFinishPlaying();
  }
  playAnimation(p){
    //console.log(p);
  }
  render() {
    if(this.props.audio_note == ''){
        return this.renderRecordBtn();
    }else{
        if(!this.props.audio_note!=''){
            return(<View/>);
        }
        return(
            <View style={styles.container_buttons}>
                {
                  this.state.is_playing ?
                    <View style={{alignSelf: 'center'}}>
                      <AnimationAudio
                        metrics={this.metrics}
                        height={150}
                        isPlaying={this.state.is_playing_audio}
                      />
                    </View>
                  :
                    <View/>
                }
                <TouchableOpacity onPress={() => this.playAudio()}
                    style={[styles.buttonPlay, this.state.is_playing ? styles.buttonPlay_active : styles.buttonPlay_wait]}>
                    <Image
                        style={{height:26,width:26,tintColor:'#ffffff'}}
                        source={this.state.icon_playing}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.alertDelete()}
                    style={[styles.buttonWrapper]}>
                    <Image
                        style={{height:20,width:20,tintColor:'#ffffff'}}
                        source={require('../assets/img/icons/deleteAudio.png')}
                    />
                </TouchableOpacity>
                <Video
                    ref={(ref) => {this.player = ref}}
                    style={{width: 1, height: 1}}
                    audioOnly={true}
                    source={{uri:this.props.audio_note}}
                    repeat={false}
                    paused={!this.state.is_playing}
                    playWhenInactive={false}
                    playInBackground={false}
                    onEnd={() => {this.onFinishedPlay()}}
                    onProgress={(p) => {this.props.playAnimation(p)}}
                />
            </View>
        )
    }
  }
}
ButtonRecorder.defaultProps = {
  onFinishedRecording: (url) => {  console.log("end");},
  onProgress: (data) => {  console.log("data");}

}
const styles = StyleSheet.create({
  container_buttons:{
    justifyContent:"center",
    alignItems:"center",
  },
  buttonWrapper:{
    marginTop: 15,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonPlay:{
    height:70,
    width:70,
    borderRadius:35,
    borderWidth:3,
    alignItems:'center',
    justifyContent:'center',

    backgroundColor:'transparent',
  },
  buttonPlay_active: {
    borderColor:'#ffffff',
  },
  buttonPlay_wait: {
    borderColor:'#ef6185',
  },
  shadow:{
    borderColor:'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.6 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  removeShadow:{
    borderColor:'#fcd9e2'
  },
  button:{
    height:30,
    width:30,
  },
  btnWrapperPresed:{
    height:70,
    width:70,
    borderRadius:35,
    borderWidth:3,
    alignItems:'center',
    justifyContent:'center',
    borderColor:'#ef6185',
    backgroundColor:'#3d3c3d',
  },
  btnWrapperRelese:{
    borderColor:'white',
    backgroundColor:'white'
  },
  btnPresed:{
    height:26,
    width:26,
    tintColor:'white'
  },
  btnRelese:{
    tintColor:'black'
  }
});
