import React, { Component } from 'react';
import {
  Animated,
  Button,
  Easing,
  StyleSheet,
  NativeModules,
  NativeAppEventEmitter,
  NativeEventEmitter,
  TouchableOpacity,
  Image,
  Text,
  View,
  Alert
} from 'react-native';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
const AuralShifterEvents = new NativeEventEmitter(NativeModules.AuralShifter);

export default class SoundRecorder extends Component {
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
      url:null
    }
    this.db = 0;
    this.url = "";
  }
  componentDidMount(){
    AudioRecorder.requestAuthorization().then((isAuthorised) => {
      //this.stop();
      //  var d = new Date();
      //  var n = d.getTime();
      //  this.url = AudioUtils.DocumentDirectoryPath + '/'+n+'-audio.aac';
      //  this.prepareRecordingPath(AudioUtils.DocumentDirectoryPath + '/'+n+'-audio.aac',)

    })
    // var d = new Date();
    // var n = d.getTime();
    // this.prepareRecordingPath(AudioUtils.DocumentDirectoryPath + '/'+n+'-audio.aac',)
    AuralShifterEvents.addListener("onRecordFinished",
      res => {this.setState({url:res.path});this.props.onFinishedRecording(res.path);}
    )
    AuralShifterEvents.addListener("onMeasure",
      res => {


        if(this.state.currentTime > 15.0){
          this.onButtonRelease();
          this.setState({
            currentTime:0
          })
        }else{
          this.setState({
            currentTime:this.state.currentTime + 0.25
          })
          data = {
            "currentTime":this.state.currentTime,
            "currentMetering": 20 * Math.log(res.db) / Math.LN10
          }
          this.props.onProgress(data);
        }

      }
    )


  }
  animate(db) {
  //   db = Math.random() * (0-10) + 10;
  //   _pr = 80 -  ( ( 30 * db) / 160 ) ;
    Animated.timing(
      this.state.animatedValue,
      {
        toValue: 100,
        duration: 500,
        easing: Easing.linear
      }
    ).start()
    //
  }
  removeAnimate() {
  //   db = Math.random() * (0-10) + 10;
  //
  //   _pr = 80 -  ( ( 30 * db) / 160 ) ;
    Animated.timing(
      this.state.animatedValue,
      {
        toValue: 50,
        duration: 500,
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
    console.log("press");
    this.setState({"event":"press",onPressBtn:true});
    this.animate();

    AudioRecorder.requestAuthorization().then((isAuthorised) => {
      console.log("isAuthorised: "+isAuthorised);
      if(this.props.voiceIndex > 0){
        console.log("voiceIndex: "+this.props.voiceIndex);
        NativeModules.AuralShifter.record(JSON.stringify(this.props.voiceIndex));
      }else{
        this.record();
      }
    })

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
      this.setState({url:this.url});

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
    _p = (this.state.currentTime / 15 ) * 100
    return _p;
  }

  renderRecordBtn(){
    if(this.state.url == null){
      return(
        <TouchableOpacity activeOpacity={1}
          onPressIn={() => this.onButtonPress()}
          onPressOut={() => this.onButtonRelease()}
          style={styles.btnWrapperPresed}>
          <AnimatedCircularProgress
            style={{position: 'absolute'}}
            size={100}
            width={15}
            fill={this.getNotePercentage()}
            tintColor="#ef6185"
            onAnimationComplete={() => console.log('onAnimationComplete')}
            backgroundColor="transparent"/>
          <Image
            style={[styles.btnPresed]}
            source={require('../assets/img/icons/audio.png')}
          />
        </TouchableOpacity>
      )
    }else{
        return(
          <TouchableOpacity onPress={() => this.alertDelete()}
            style={[styles.buttonWrapper]}>
            <Image
              style={{height:30,width:30,tintColor:'red'}}
              source={require('../assets/img/icons/deleteAudio.png')}
            />
          </TouchableOpacity>
        )
    }
  }

  alertDelete(){

    var d = new Date();
    var n = d.getTime();
    // let _secs = d.getSeconds();

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

  //<Animated.View style={[{backgroundColor:"yellow",height:50,borderColor:"yellow",borderWidth:this.state.animatedValue,width:50}]} >
  // <Text style={{color:"white",width:200,marginLeft:200}}>{this.getPixRatio()}</Text>
  render() {
    return (

      <Animated.View style={[{height:80,width:80,flexDirection:"row",justifyContent:"center",alignItems:"center"}]} >
        <Animated.View style={[{height:60,flexDirection:"row",alignItems:"center",justifyContent:"center",width:60}]} >
        <Animated.View style={[{backgroundColor:"#fcd9e2",borderRadius:50,position:"absolute",width:this.state.animatedValue,height:this.state.animatedValue}]} >
        </Animated.View>
        {this.renderRecordBtn()}
        </Animated.View>

      </Animated.View>
    );
  }
}
SoundRecorder.defaultProps = {
  onFinishedRecording: (url) => {  console.log("end");},
  onProgress: (data) => {  console.log("data");}

}
const styles = StyleSheet.create({
  buttonWrapper:{
    width:50,
    height:50,
    borderRadius:25,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:'white',
    borderWidth:3,
    borderColor:'white'
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
