import React, { Component } from 'react';
import { StyleSheet,Text,  View, Image, TouchableOpacity, FlatList} from 'react-native';
import AddTopic from './AddTopic';
import TopicList from './TopicList';
import ButtonRecorder from '../audio/ButtonRecorder';
import PropTypes from 'prop-types';

export default class PreviewButtons extends Component {
  constructor(props){
    super(props);
    this.state = {
        is_audio_created: false,
        is_topic_selected: false,
        topics: [],
        audio_note:'',
        icon_filter: require('../assets/img/icons/voice_filter.png'),
        is_playing_audio: false,
    }
    this.voiceIndex = 0;
    this.metrics = [];
  }
  onNewTopics(topics){
    this.setState({is_topic_selected: false, topics: topics});
    this.props.onHashtags(topics);
  }
  onTopicsChange(topics){
    this.setState({topics: topics});
    this.props.onHashtags(topics);
  }
  onRecordProgress(metrics){
    this.metrics.push({
      'currentTime': metrics.currentTime,
      'currentMetering':metrics.currentMetering
    });
  }
  onPlayAnimation(p){

  }
  onFinishPlaying(){
  }
  onFinishedRecording(url){
    this.setState({audio_note:url})
    if(url == ''){
      this.metrics = [];
    }
    this.props.onAudio(url, this.metrics);
  }
  changeAudioFilter(){
    if( this.voiceIndex >= 3){
      this.voiceIndex = 0;
      this.setState({icon_filter:require('../assets/img/icons/voiceFilter0.png')});
    }else{
      this.voiceIndex = this.voiceIndex + 1;
      if(this.voiceIndex == 1){
        this.setState({icon_filter:require('../assets/img/icons/voiceFilter1.png')});
      }else if(this.voiceIndex == 2){
        this.setState({icon_filter:require('../assets/img/icons/voiceFilter2.png')});
      }else{
        this.setState({icon_filter:require('../assets/img/icons/voiceFilter3.png')});
      }
    }
  }
  render() {
    if(this.state.is_topic_selected){
        return (
            <AddTopic
              onContinue={(topics)=>this.onNewTopics(topics)}
            />
        );
    }
    return (
      <View style={styles.container}>
        <View style={styles.container_hashtags}>
          <TopicList
            topics={this.state.topics}
            onChange={(topics)=>this.onTopicsChange(topics)}
          />
        </View>
        <View style={styles.container_bottom_btns}>
          <View style={styles.container_item}>
              <TouchableOpacity
                style={styles.btn_side}
                onPress={()=>this.changeAudioFilter()}>
                  <View style={[styles.btn_container_side]}>
                      <Image
                          style={[styles.icon_btn_side_left]}
                          source={this.state.icon_filter}/>
                  </View>
              </TouchableOpacity>
          </View>
          <View style={styles.container_item}>
            <ButtonRecorder
              audio_note = {this.state.audio_note}
              voiceIndex = {this.voiceIndex}
              playAnimation={(p)=> this.onPlayAnimation(p)}
              onFinishedRecording={(url) => {this.onFinishedRecording(url)}}
              onProgress ={(metrics) => {this.onRecordProgress(metrics)}}
              onFinishPlaying = {()=>this.onFinishPlaying()}
            />
          </View>
          <View style={styles.container_item}>
              <TouchableOpacity
                style={styles.btn_side}
                onPress={()=>this.setState({is_topic_selected: true})}>
                  <View style={[styles.btn_container_side, this.state.topics.length > 0 ? styles.btn_container_filled : {}]}>
                      <Image
                          style={styles.icon_btn_side_right}
                          source={require('../assets/img/icons/hashtag.png')}/>
                  </View>
              </TouchableOpacity>
          </View>
        </View>

      </View>
    );
  }
}

PreviewButtons.propTypes = {
}

// Default values for props
PreviewButtons.defaultProps = {
}
const styles = StyleSheet.create({
  container:{
    position: 'absolute',
    top: 110,
    bottom: 10,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex:7
  },
  container_hashtags:{
    position: 'absolute',
    top: 5,
    right: 20,
    backgroundColor:'transparent',
  },
  container_bottom_btns: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection:'row',
    backgroundColor:'transparent',
  },
  container_item: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btn_side:{
    position: 'absolute',
    bottom: 15,
  },
  btn_container_side:{
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon_btn_side_left: {
    width: 34,
    height: 34,
    borderRadius: 16,
    tintColor: '#ffffff',
  },
  btn_container_active:{
    borderColor: 'rgba(255,255,255, 0.6)',
  },
  icon_btn_active:{
    tintColor: 'rgba(255,255,255, 0.6)',
  },
  icon_btn_side_right: {
    width: 20,
    height: 20,
    borderRadius: 10,
    tintColor: '#ffffff'
  },
  btn_container_center: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon_btn_center: {
    width: 50,
    height: 50,
    borderRadius: 25,
    tintColor: '#ffffff'
  },
  btn_container_filled:{
    borderColor: '#f24e86'
  }
});
