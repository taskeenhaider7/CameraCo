import React, { Component } from 'react';
import {
  AsyncStorage,
  Button,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native';
import FoteProgressBar from './FoteProgressBar';
var RNFS = require('react-native-fs');
import cameraCoApi from "../api/CameraCoApi";

export default class UploadFoteProgress extends Component {
  async getFote() {
     try {
       const value = await AsyncStorage.getItem('uploadFote');
       this.setState({fote: JSON.parse(value)});
     } catch (error) {
       console.log("Error retrieving data" + error);
     }
  }
  async deleteFote(_p){
    await AsyncStorage.removeItem('uploadFote');

  }
  componentWillMount(){
    global.UPLOAD_FOTE_PROGRESS = this;
    cameraCoApi.onUploadProgressEvent = this.onUploadProgressEvent;

  }
  constructor(props){
    super(props);
    this.onUploadProgressEvent    = this.onUploadProgressEvent.bind(this);
    this.state = {
      progress:0,
      title:"Preparing",
      fote:null
    }

  }
  onUploadProgressEvent(p,fote){

    if(p == 100){
      global.UPLOAD_FOTE_PROGRESS.deleteFote();
      global.UPLOAD_FOTE_PROGRESS.setState(
        {
          progress:Math.round(p),
          title: "Done",
          fote:fote
        }
      )
    }else{
      global.UPLOAD_FOTE_PROGRESS.setState(
        {
          progress:Math.round(p),
          title: "Uploading",
          fote:fote

        }
      )
    }


  }
  renderContent(){
    if(this.state.fote !=null){
      return(
        <View style={{ justifyContent:'center'}}>
          <FoteProgressBar progress={this.state.progress}></FoteProgressBar>
          <View style={styles.imageWrapper}>
            <Image style={styles.image}
              source={{uri: RNFS.DocumentDirectoryPath + '/' + this.state.fote.thumbnail}}
            />
            <View style={styles.textWrapper}>
              <Text style={styles.status}>{this.state.title}</Text>
            </View>
            <View style={styles.buttonWrapper}>
              <Button title=""></Button>
            </View>
          </View>
        </View>)
    }
  }
  shouldNotShow(){
    return (this.state.progress == 100 || this.state.fote == null);
  }
  render() {
    if(this.shouldNotShow()){
      return (

        null

      );
    }
    return (

      <View style={styles.container}>
        {this.renderContent()}
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent:'center',
    height:90,
    backgroundColor:"white"
  },
  imageWrapper:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:'center'
  },
  image:{
    height:70,
    width:70,
    marginLeft:5,
    marginRight:5,
    borderRadius:3,
    backgroundColor: '#5cb4dc'
  },
  buttonWrapper:{
    justifyContent: 'center',
    alignItems: 'center'
  },
  textWrapper:{
    justifyContent: 'center',
    alignItems: 'center'
  },
  status:{
    fontSize:18
  }

});
