import React, { Component } from 'react';
import { Alert,FlatList,Platform,Keyboard,ScrollView, Dimensions,TextInput,StyleSheet, Text, View,Image,TouchableOpacity, StatusBar } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import moment from 'moment';
import RNTextInput from 'react-native-text-input-enhance';
import TopBar from '../components/TopBar';

import cameraCoApi from "../api/CameraCoApi";

import { ifIphoneX } from 'react-native-iphone-x-helper'


statusBarHeight = getStatusBarHeight();

const { height, width} = Dimensions.get('window');

export default class Comments extends React.Component {

  constructor(params){
    super(params);
    this.state = {
      comments:[],
      comment:'',
      idFote:'',
      me:{},
      keyboardVisible:false,
      shortNoteSection:0,
      fote:{},
      user:{},
      place:{},
      isDisable:true,
      isLoadingComments:true
    }
    global.COMMENTS = this;
  }

  _keyboardDidShow(e) {
    _extra = getStatusBarHeight();
    shcs = Dimensions.get('window').height - e.endCoordinates.height;

    this.setState({
      keyboardHeight:e.endCoordinates.height,
      keyboardVisible:true,
      shortNoteSection: shcs
    },
      () => {
          this.forceUpdate();
      }
    )
  }

  _keyboardDidHide(e) {
    this.setState({
      keyboardVisible:false,
      shortNoteSection: height
    })
  }

  componentWillMount(){
    const {state} = this.props.navigation;
    let item = state.params.item;
    this.setState({
        "idFote": item._id,
        "fote": item,
        "user": item.user,
    })
    if(item.place !== undefined){
      this.setState({
          'place':item.place,
      })
    }
    cameraCoApi.getMe().then((res) => {
      if(res.hasOwnProperty("name")){
        this.setState({me:res})
      }
    });

    cameraCoApi.getComments(item._id).then((res) => {
      this.setState({isLoadingComments:false})
      console.log(JSON.stringify(res))
      if(res == false){
        this.setState({isLoadingComments:false})
      }else{
        if(res.length > 0){
          this.setState({
              comments: res.reverse(),
              isLoadingComments: false

          },() => {this.forceUpdate()})
        }else{
          this.setState({
              comments: [],
              isLoadingComments: false

          },() => {this.forceUpdate()})
        }
      }
    })
  }

  componentDidMount(){
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    this.hideLoading(this);
  }
  hideLoading=(c)=>{

     setTimeout(function(){

       //Put All Your Code Here, Which You Want To Execute After Some Delay Time.
       // Alert.alert("Alert Shows After 5 Seconds of Delay.")
       c.setState({
           isLoadingComments: false
         })

     }, 3000);


   }
  _goBack(){
     const {goBack} = this.props.navigation;
     goBack()
  }

  _keyExtractor = (item, index) => index;

  _renderComment = ({item}) => {
    let image = null;
    if(item.user[0].hasOwnProperty('photo')){
      image = {uri:item.user[0].photo};
    } else{
      image = require('../assets/img/icons/profile40.png');
    }
    return(
      <View style={styles.commentArea}>
        <Image style={styles.userImage}
          resizeMode={'center'}
          source={image}
        />
        <View style={styles.wrapperComment}>
            <View style={styles.wrapperName}>
              <Text style={styles.username}>
                {item.user[0].username}
              </Text>
              <Text style={styles.date}>
                {this.calculateTime(item.comments.creation_date)}
              </Text>
            </View>
            <View style={{flexWrap:'wrap',paddingLeft:15,paddingTop:10}}>
                <Text style={styles.comment}>
                  {item.comments.comment}
                </Text>
            </View>
        </View>
      </View>
    )
  }

  _renderSeparator = () => {
    return(
      <View style={styles.separator}>
      </View>
    )
  }

  calculateTime(date){
    d = new Date(date);
    m = moment(d);
    return m.fromNow();
  }

  addComment(){
    let comment = this.state.comment;
    if(comment.trim() != ''){
      cameraCoApi.addComment(this.state.idFote,comment).then((res) => {
        if(res.success){
          cameraCoApi.getComments(this.state.idFote).then((response) => {
            if(response == false){
              console.log('error');
            }else{
              if(response.length > 0){
                this.setState({
                    comments: response.reverse(),
                    comment:"",
                    isDisable:true
                })
              }
            }
          })
        }
      })
    }else{
      console.log('Comment cant be empty');
    }
    this.textInput.clear();
  }

  renderImageUser(user){

    if(user.hasOwnProperty('photo')){
      return(
        <Image style={styles.userImage}
          source={{uri:user.photo}}
        />
      )
    }else{
      let image = require('../assets/img/icons/profile40.png');
      return(
        <Image style={styles.userImage}
          resizeMode={'center'}
          source={image}
        />
      )
    }
  }

  renderPlace(place){
    _placeName = "";
    if(place != null){
      if(place.hasOwnProperty("name")){
        _placeName = place.name;
      }
    }
    if(place !== undefined){
      return(
        <Text style={styles.placeName}>
          {_placeName}
        </Text>
      )
    }else{
      return null
    }
  }

  _onPlacePressed(place){
    //If this functions is connected. Check if the place have photo.
    if(place.hasOwnProperty('name')){
      this.props.navigation.navigate({key:'PlaceInfo',routeName:'PlaceInfo',params:{place:place, photo_reference:place.photos[0].photo_reference}});
    }
  }

  goCreateConversations(){
    this.props.navigation.navigate({key:'CreateConversation',routeName:'CreateConversation'});
  }

  validateComment(comment){
    if(comment.trim() != ''){
      this.setState({comment:comment, isDisable:false})
    }else{
      this.setState({isDisable:true})
    }
  }
  showLoadingAnimation(){
    if(this.state.isLoadingComments){
      return(
        <View style={styles.loadingWrapperIcon}>
          <Image style={styles.loadingIcon}
            source={require('../assets/gif/loading.gif')}
          />
        </View>);
    }else{
      return(null);
    }

  }
  render(){
    return(
      <View style={[styles.container,this.state.keyboardVisible ? {height:this.state.shortNoteSection,paddingBottom:0} : {flex:1} ]}>
        <StatusBar hidden={false} />

        <TopBar
          firstBtnImage={'back'}
          firstBtn={() => this._goBack()}
          fourthBtnImage={'chat'}
          fourthBtn={() => this.goCreateConversations()}
          mainTitle={'Comments'}
        >
        </TopBar>


        <View style={styles.content_form}>

          <View style={styles.main_comment_area}>
            <View style={styles.mainCommentAreaWrapper}>
                <View style={styles.shadowWrapper}>
                  {this.renderImageUser(this.state.user[0])}
                </View>
                <View style={styles.commentTitle}>
                  <Text style={styles.username}>
                    {this.state.user[0].username + ' '}
                  </Text>
                  {this.renderPlace(this.state.place)}
                </View>
                <Text style={styles.date}>
                  {this.calculateTime(this.state.fote.creation_date)}
                </Text>
            </View>

            <View style={styles.main_comment}>
                <Text style={styles.comment}>
                  {this.state.fote.note}
                </Text>
            </View>
          </View>
          {this.showLoadingAnimation()}
          <FlatList
              style={{paddingLeft:55,paddingTop:20}}
              data={this.state.comments}
              extraData={this.state}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderComment}
              ItemSeparatorComponent={this._renderSeparator}
          />


        </View>

        <View style={styles.content_bottom}>
          <RNTextInput
            style={styles.input}
            ref={input => { this.textInput = input }}
            placeholder={'Type your message..'}
            blurOnSubmit={true}
            onSubmitEditing={() => this.addComment()}
            returnKeyType={"send"}
            multiline={true}
            placeholderTextColor={'#9c9c9c'}
            onChangeText={(comment) => this.validateComment(comment)}
          />
        </View>

      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    backgroundColor:'white',
    ...ifIphoneX({
            paddingTop:25,
            paddingBottom:34

        }, {
            paddingTop: statusBarHeight
        })
  },
  content_form:{
    flex:1,
    paddingLeft:20,
    paddingRight:20,
    backgroundColor:'white'
  },
  main_comment_area:{
    minHeight:110,
    paddingTop:20,
    paddingBottom:20,
    borderBottomWidth:1,
    borderBottomColor:'#eaeaea',
  },
  mainCommentAreaWrapper:{
    height:40,
    flexDirection:'row',
  },
  commentArea:{
    minHeight:80,
    flexDirection:'row',
  },
  main_comment:{
    paddingLeft:55,
    paddingTop:10,
    flexWrap:'wrap',
  },
  userImage:{
    height:40,
    width:40,
    borderRadius:20,
    backgroundColor:'#e9ecef'
  },
  username:{
    fontSize:18,
    color:'black',
  },
  comment:{
    fontSize:16,
    color:'black',
  },
  separator:{
    height:15,
  },
  date:{
    fontSize:15,
    color:'#9b9b9b'
  },
  content_bottom:{
    flexDirection:'row',
    alignItems:'center',
    paddingLeft:20,
    paddingRight:20,
    borderTopWidth:1,
    borderTopColor:'#e7e7e7',
    minHeight:60,

  },
  input:{
    flex:1,
    paddingLeft:10,
    color:'black',
    fontSize:16,
  },
  btn:{
    width:80,
    alignItems:'center',
    justifyContent:'center',
  },
  btnTxt:{
    fontSize:18,
    color:'#4286f4',
    fontWeight:'bold'
  },
  placeName:{
    fontSize:14,
    color:'#9b9b9b'
  },
  shadowWrapper:{
    height:40,
    width:40,
    shadowColor: 'black',
    shadowOpacity: 0.6,
    shadowRadius: 1.5,
    shadowOffset: {
        height: 1,
        width: 1
    }
  },
  commentTitle:{
    flex:1,
    flexDirection:'column',
    paddingLeft:15,
  },
  wrapperName:{
    height:20,
    paddingLeft:15,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  wrapperComment:{
    flex:1,
  },
  loadingWrapperIcon:{
    flex:10,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  },
  loadingIcon:{
    width:50,
    height:50,
    resizeMode:"stretch"
  }
});
