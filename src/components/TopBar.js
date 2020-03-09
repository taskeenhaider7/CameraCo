import React, { Component } from 'react';
import {
  AsyncStorage,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import PropTypes from 'prop-types';
import {CachedImage} from 'react-native-cached-image';

import searchIcon from '../assets/img/icons/search.png';

export default class TopBar extends Component {
  constructor(props){
    super(props);
    this.state = {
      usernames: [],
      newMessageReceived:false
    }
  }
  componentDidMount(){
    this.loadNewMessages();
  }
  getImage(name){
    switch (name) {
      case 'back': return require('../assets/img/icons/back.png');
      case 'chat': return require('../assets/img/icons/chat.png');
      case 'grid': return require('../assets/img/icons/grid.png');
      case 'feed': return require('../assets/img/icons/feed.png');
      case 'gallery': return require('../assets/img/icons/gallery.png');
      case 'list': return require('../assets/img/icons/list.png');
      case 'profile': return require('../assets/img/icons/profile.png');
      case 'settings': return require('../assets/img/icons/settings.png');
      case 'chatGif': return require('../assets/img/icons/chatGif.gif');
      case 'cancel': return require('../assets/img/icons/closeBlack.png');
      case 'notification': return require('../assets/img/icons/notification.png');
      case 'notification_ring': return require('../assets/img/icons/notification_ring.png');


      default: return null
      // etc...
    }
  }
  onNewMessageReceived(msg){
    this.setState({newMessageReceived:true});
    this.persistMessage(msg);
  }
  async persistMessage(msg){
    const newMessages = await AsyncStorage.getItem('newMessages'); //read new messages list
    if(JSON.parse(newMessages) == null){
      _newMessagesArray = [msg]; //if there are no new messages, create a new list with the msg item
    }else{
      _newMessagesArray = JSON.parse(newMessages) //append new message to list
      _newMessagesArray.push(msg)
    }
    // _newMessagesArray = null //if there are no new messages, create a new list with the msg item
    //alert(JSON.stringify(_newMessagesArray));
    await AsyncStorage.setItem('newMessages', JSON.stringify(_newMessagesArray));
  }
  async clearMessages(){
    this.setState({newMessageReceived:false});
    await AsyncStorage.setItem('newMessages', JSON.stringify([]));
  }
  async loadNewMessages(){
    const newMessages = await AsyncStorage.getItem('newMessages'); //read new messages list
    if(JSON.parse(newMessages) != null){ //if the list is null or not empty, set the red dot icon
      // alert(JSON.stringify(newMessages));
      if (JSON.parse(newMessages).length > 0) {
        this.setState({newMessageReceived:true})
      }
    }
  }
  renderFirstBtn(){
    if(this.props.profileImage){
      if(this.props.firstBtnImage !== null){
        return(
          <TouchableOpacity style={styles.wrapperIcon} onPress={() => this.props.firstBtn()}>
            <CachedImage style={styles.imageProfile}
              source={{uri:this.props.firstBtnImage?this.props.firstBtnImage:null}}
            />
          </TouchableOpacity>
        )
      }else{
        return null
      }
    }else{
      let _image = this.getImage(this.props.firstBtnImage);
      if(_image !== null){
        return(
          <TouchableOpacity style={styles.wrapperIcon} onPress={() => this.props.firstBtn()}>
            <Image style={styles.icon}
              source={_image? _image:null}
            />
          </TouchableOpacity>
        )
      }else{
        return null
      }
    }
  }

  renderSecondBtn(){
    let _image = this.getImage(this.props.secondBtnImage)
    if(_image != null){
      return(
        <TouchableOpacity style={[styles.wrapperIcon,{alignItems:'center'}]} onPress={() => this.props.secondBtn()}>
          <Image style={styles.icon}
            source={_image ?_image :null}
          />
        </TouchableOpacity>
      )
    }else{
      return null
    }
  }

  renderThirdBtn(){
    let _image = this.getImage(this.props.thirdBtnImage);
    let _color = this.props.thirdBtnColor;

    if(_image != null){
      return(
        <TouchableOpacity style={[styles.wrapperIcon,{alignItems:'center'}]} onPress={() => this.props.thirdBtn()}>
          <Image style={[styles.icon,(_color != '') ? {tintColor:_color} : {tintColor:'black'}]}
            source={_image ? _image : null}
          />
        </TouchableOpacity>
      )
    }else{
      return null
    }
  }
  fourthBtnWrapper(){
    this.clearMessages();
    this.props.fourthBtn();
  }
  renderFourthBtn(){
    let _image = this.getImage(this.props.fourthBtnImage)
    if(_image != null){
      if(this.props.fourthBtnImage == "chat"){
          if(this.state.newMessageReceived){
            // render chat gif
            let _imageGif = this.getImage("chatGif")
            return(
              <TouchableOpacity style={[styles.wrapperIcon,{alignItems:'flex-end'}]} onPress={() => this.fourthBtnWrapper()}>
                <Image style={styles.icon}
                  source={_imageGif?_imageGif:null}
                />
              </TouchableOpacity>
            )
          }else{
            return(
              <TouchableOpacity style={[styles.wrapperIcon,{alignItems:'flex-end'}]} onPress={() => this.fourthBtnWrapper()}>
                <Image style={styles.icon}
                  source={_image?_image:null}
                />
              </TouchableOpacity>
            )
          }
      }else{
        return(
          <TouchableOpacity style={[styles.wrapperIcon,{alignItems:'flex-end'}]} onPress={() => this.fourthBtnWrapper()}>
            <Image style={styles.icon}
              source={_image?_image:null}
            />
          </TouchableOpacity>
        )
      }

    }else if(this.props.fourthBtnTxt != ''){
      if(this.props.fourthBtnTxtNormal){
        txtWeight= 'normal';
      }else{
        txtWeight= 'bold';
      }
      return(
        <TouchableOpacity style={{alignItems:'flex-end',justifyContent:'center'}} onPress={() => this.props.fourthBtn()}>
          <Text style={{color:this.props.fourthBtnTxtColor,fontSize:14,fontWeight:txtWeight}}>
            {this.props.fourthBtnTxt}
          </Text>
        </TouchableOpacity>
      )
    }else{
      return null
    }
  }

  renderTitle(){
    if(this.props.isFeed){
      return(
        <TouchableOpacity
          onPress={()=>this.props.onMiddleButton()}>
          <View style={styles.container_button_search}>
            <Image
              style={styles.icon_button_search}
              source={searchIcon}
            />
            <Text style={styles.txt_button_search}>{this.props.mainTitle}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    if(this.props.mainTitle != ''){
      return(
        <View>
        <Text style={styles.mainTitle}
          numberOfLines={1} ellipsizeMode={'tail'}>
          {this.props.mainTitle}
        </Text>
        <Text style={styles.subTitle}
          numberOfLines={1} ellipsizeMode={'tail'}>
          {this.props.subTitle}
        </Text>
        </View>
      )
    }else{
      return null
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.wrapperLeft}>
          {this.renderFirstBtn()}
          {this.renderSecondBtn()}
        </View>
        <View style={styles.wrapperMiddle}>
          {this.renderTitle()}
        </View>
        <View style={styles.wrapperRight}>
          {this.renderThirdBtn()}
          {this.renderFourthBtn()}
        </View>
      </View>
    );
  }
}

TopBar.propTypes = {
  firstBtnImage: PropTypes.string,
  firstBtn: PropTypes.func,
  profileImage:PropTypes.bool,
  secondBtnImage: PropTypes.string,
  secondBtn: PropTypes.func,
  thirdBtnImage: PropTypes.string,
  thirdBtn: PropTypes.func,
  thirdBtnColor: PropTypes.string,
  fourthBtnImage: PropTypes.string,
  fourthBtnTxt: PropTypes.string,
  fourthBtnTxtColor: PropTypes.string,
  fourthBtnTxtNormal:PropTypes.bool,
  fourthBtn: PropTypes.func,
  mainTitle:PropTypes.string,
  subTitle:PropTypes.string,
  isFeed: PropTypes.bool
}

// Default values for props
TopBar.defaultProps = {
  firstBtnImage:'',
  firstBtn: () => {},
  profileImage:false,
  secondBtnImage:'',
  secondBtn: () => {},
  thirdBtnImage:'',
  thirdBtn: () => {},
  thirdBtnColor:'',
  fourthBtnImage:'',
  fourthBtnTxt: '',
  fourthBtnTxtColor: 'black',
  fourthBtnTxtNormal:false,
  fourthBtn: () => {},
  onMiddleButton: () => {},
  mainTitle:'',
  subTitle:'',
  isFeed: false
}

const styles = StyleSheet.create({
  container: {
    flexDirection:'row',
    height:50,
    backgroundColor:'white',
    paddingLeft:20,
    paddingRight:20,
    zIndex:1,
  },
  wrapperLeft:{
    flex:1,
    flexDirection:'row',
  },
  wrapperMiddle:{
    flex:2,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
  },
  wrapperRight:{
    flex:1,
    flexDirection:'row',
    justifyContent:'flex-end',
  },
  icon:{
    height:26,
    width:26
  },
  imageProfile:{
    height:32,
    width:32,
    borderRadius:16,
    backgroundColor:'#e9ecef'
  },
  wrapperIcon:{
    width:50,
    justifyContent:'center',
  },
  mainTitle:{
    fontSize:18,
    color:'black',
    fontWeight:'bold',
    textAlign:'center'
  },
  subTitle:{
    fontSize:10,
    color:'black',
    textAlign:'center'
  },
  container_button_search: {
    padding: 3,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  icon_button_search: {
    marginTop: 2,
    width: 14,
    height: 14,
    tintColor: '#D3D3D3',
    marginLeft: 5,
    marginRight: 10,
  },
  txt_button_search: {
    paddingRight: 29,
    fontSize: 14,
    fontWeight: 'bold'
  }
});
