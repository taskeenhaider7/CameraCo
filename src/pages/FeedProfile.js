import React, { Component } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  StatusBar,
  TextView,
  TextInput,
  Linking,
  Dimensions,
  Alert
} from 'react-native';
import cameraCoApi from "../api/CameraCoApi";
import { ifIphoneX } from 'react-native-iphone-x-helper'
import { getStatusBarHeight } from 'react-native-status-bar-height';
import {  NavigationActions } from 'react-navigation';
import TopBar from "../components/TopBar";
import ImageResizer from 'react-native-image-resizer';
import Video from "react-native-video";
import { Keyboard } from 'react-native'

const statusBarHeight = getStatusBarHeight();
const { height, width} = Dimensions.get('window');
const ITEM_WIDTH = width/3;

export default class FeedProfile extends React.Component {
  constructor(props){
    super(props);
    const {state} = this.props.navigation;
    this.foteTakenCallback     = this.foteTakenCallback.bind(this);
    this.finishedUpdatingPhoto = this.finishedUpdatingPhoto.bind(this);

    this.state = {
      uid:state.params.user.uid,
      username:state.params.user.username,
      photo:state.params.user.photo,
      followers:state.params.user.followers,
      me:{},
      fotes:[],
      btnTxt:'',
      showSettings:state.params.showSettings,
      numbFollowers:null,
      myProfile:false,
      newDescription:state.params.user.description,
      followingCount:0,
      showDescriptionBtn:false,
      oldDescription:state.params.user.description,
      isBlocked:state.params.isBlocked
    }
  }

  componentWillMount(){
    const {state} = this.props.navigation;
    cameraCoApi.following(state.params.user.uid).then((res) => {
        this.setState({
          followingCount:res.length
        } )
    });
  }

  componentDidMount(){
    const {state} = this.props.navigation;

    cameraCoApi.getMe().then((res) => {
      if(res.hasOwnProperty("name")){
        this.setState({me:res});
        if(res.uid == this.state.uid){
          this.setState({myProfile:true});
        }
        if(state.params.isBlocked){
          this.setState({btnTxt:'Unblock'});
        }else{
          if(state.params.user.followers != undefined){
            if(state.params.user.followers.includes(res.uid)){
              this.setState({btnTxt:'Unfollow'});
            }else{
              this.setState({btnTxt:'Follow'});
            }
          }else{
            this.setState({btnTxt:'Follow'});
          }
        }
      }
    });
    if(state.params.isFromChat){
      cameraCoApi.getUserProfile(state.params.user.uid).then((res) => {
        if(res.success){
          this.setState({
            username:res.user.username,
            followers:res.user.followers ? res.user.followers : [],
            numbFollowers: res.user.followers ? res.user.followers.length : 0,
            description: res.user.description
          });
        }
      });
    }else{
      if(state.params.user.followers != undefined){
        this.setState({numbFollowers:state.params.user.followers.length});
      }else{
        this.setState({numbFollowers:0});
      }
    }

    if(state.params.isBlocked){
      this.setState({fotes:[]});
    }else{
      cameraCoApi.getUserFotes(state.params.user.uid).then((res) => {
        if(res.success){
          this.setState({
            fotes:res.fotes.reverse(),
          } )
        }
      });
    }
  }

  goToFote(fote,url){
    let like = this._isLiked(fote);
    let numLikes = this._likes(fote);
    let numComments = null;

    this.props.navigation.navigate({key:'FoteView',routeName:'FoteView',
      params:{
        item:fote,
        url:url,
        isLiked:like,
        numLikes:numLikes,
        numComments:numComments
      }
    });
  }

  _isLiked(item){
    let isLiked = false;
    if(item.hasOwnProperty('likes_by') ){
      let array = item.likes_by;
      for(i = 0; i < array.length; i++){
        if(this.state.me.uid == array[i]){
          isLiked = true;
          break;
        }
      }
    }
    return isLiked
  }

  _likes = (item) => {
    let likes = null;
    if(item.hasOwnProperty('likes_by')){
      if (item.likes_by.length != 0){
        likes = item.likes_by.length
      }
    }
    return likes;
  }

  renderFote(fote,index){
    if((fote.hasOwnProperty('media')) && (fote.media[0] !== undefined)){
      if(fote.type == 'video'){
        return(
          <TouchableOpacity style={styles.fote} onPress={this.goToFote.bind(this,fote,fote.media[0].url)}>
            <Video
              source={{uri: fote.media[0].url}}
              style={styles.foteImage}
              repeat={true}
              ignoreSilentSwitch={"ignore"}
              volume={0}            // 0 is muted, 1 is normal.
              resizeMode="cover"
              playInBackground={false}        // Audio continues to play when app entering background.
              playWhenInactive={false}
            />
          </TouchableOpacity>
        )
      }else if(fote.type == 'type'){
        return(
          <TouchableOpacity style={[styles.textFote,{backgroundColor:fote.backgroundColor}]}
            onPress={this.goToFote.bind(this,fote,fote.media[0].url)}>
            {this.renderAudioIconGrid()}
            <Text style={styles.txtType} numberOfLines={3} ellipsizeMode='tail'>
              {fote.note}
            </Text>
          </TouchableOpacity>
        )
      }else{
        return(
          <TouchableOpacity style={styles.fote} onPress={this.goToFote.bind(this,fote,fote.media[0].url)}>
            <Image style={styles.foteImage}
              source={{uri:fote.media[0].url}}
            />
          </TouchableOpacity>
        )
      }
    }else if(fote.hasOwnProperty('activity')){
      return(
        <TouchableOpacity style={styles.fote} onPress={this.goToFote.bind(this,fote,'')}>
        </TouchableOpacity>
      )
    }else{
      if(fote.media.length > 0){
        return(
          <TouchableOpacity style={[styles.textFote,{backgroundColor:fote.backgroundColor}]}
            onPress={this.goToFote.bind(this,fote,fote.media[0].url)}>
            {this.renderAudioIconGrid()}
            <Text style={styles.txtType} numberOfLines={3} ellipsizeMode='tail'>
              {fote.note}
            </Text>
          </TouchableOpacity>
        )
      }else{
        return(
          <TouchableOpacity style={[styles.textFote,{backgroundColor:fote.backgroundColor}]}
            onPress={this.goToFote.bind(this,fote,'')}>
            <Text style={styles.txtType} numberOfLines={3} ellipsizeMode='tail'>
              {fote.note}
            </Text>
          </TouchableOpacity>
        )
      }
    }
  }

  renderAudioIconGrid(){
    return(
      <View style={styles.audioWrapperGrid}>
        <Image style={{height:20,width:20,tintColor:'white'}}
          source={require('../assets/img/icons/audio.png')}
        />
      </View>
    )
  }


  _keyExtractor = (item, index) => index;

  renderImageUser(photo){
    if(photo){
      return(
        <View styles={styles.areaCamera}>
          <View style={styles.borderImageProfile}>
            <Image style={styles.userImage}
              source={{uri:photo+"?date="+Date.now()}}
            />
          </View>
          {this.renderCameraIcon(this.state.myProfile)}
        </View>
      )
    }else{
      let image = require('../assets/img/icons/profile24.png');
      return(
        <View styles={styles.areaCamera}>
          <View style={styles.borderImageProfile}>
            <Image style={styles.userImage}
              resizeMode={'center'}
              source={image}
            />
          </View>
          {this.renderCameraIcon(this.state.myProfile)}
        </View>
      )
    }
  }

  renderCameraIcon(myProfile){
    if(myProfile){
      return(
        <TouchableOpacity onPress={ () => this.launchCamera()}
          style={styles.cameraIcon}>
          <Image style={{height:22,width:22,tintColor:'white'}}
            source={require('../assets/img/icons/add.png')}
          />
        </TouchableOpacity>
      )
    }else{
      return(
        null
      )
    }
  }

  _goBack(){
    const {goBack} = this.props.navigation;
    goBack();

  }
  _settings(){
    this.props.navigation.navigate({key:'Account',routeName:'Account', params:{user:this.state.me}});
  }
  renderTopBar(){
    if(this.state.showSettings){
      return(<TopBar
        firstBtnImage={'back'}
        firstBtn={() => this._goBack()}
        mainTitle={""}
        fourthBtnImage={'settings'}
        fourthBtn={() => this._settings()}
      >
      </TopBar>)
    }else{
      return(<TopBar
        firstBtnImage={'back'}
        firstBtn={() => this._goBack()}
        mainTitle={""}
      >
      </TopBar>)

    }
  }
  renderBtnFollow(){
    if(this.state.uid != this.state.me.uid){
      return(
        <TouchableOpacity style={styles.btnFollow} onPress={() => this.onPressBtn()}>
          <Text style={styles.btnTxtFollow}>
            {this.state.btnTxt}
          </Text>
        </TouchableOpacity>
      )
    }else{
      return null
    }
  }

  onPressBtn(){
    if(this.state.btnTxt == 'Follow'){
      this.follow();
    }else if(this.state.btnTxt == 'Unfollow'){
      Alert.alert(
        'Unfollow',
        'Are you sure, you want to unfollow '+ this.state.username +' ?',
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: () => this.unfollow()},
        ],
        // { cancelable: false }
      )
    }else{
      if(this.state.isBlocked){
        Alert.alert(
          'Unblock',
          'Are you sure, you want to unblock '+ this.state.username +' ?',
          [
            {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {text: 'OK', onPress: () => this.unblock()},
          ],
          // { cancelable: false }
        )
      }
    }
  }

  follow(){
    cameraCoApi.follow(this.state.uid).then((res) => {
      if(res.success){
        let {followers} = this.state;
        followers.push(this.state.me.uid);
        this.setState({followers:followers,btnTxt:'Unfollow'});
        // alert('Follow');
      }
    });
  }

  unfollow(){
    cameraCoApi.unfollow(this.state.uid).then((res) => {
      if(res.success){
        let {followers} = this.state;
        let index = followers.indexOf(this.state.me.uid);
        followers.splice(index,1);
        this.setState({followers:followers,btnTxt:'Follow'});
        // alert('Unfollow');
      }
    });
  }

  unblock(){
    cameraCoApi.unblock(this.state.uid).then((res) => {
      if(res.success){
        cameraCoApi.getUserFotes(this.state.uid).then((res) => {
          if(res.success){
            this.setState({
              fotes:res.fotes.reverse(),btnTxt:'Follow'
            })
          }
        });
      }
    });
  }

  launchCamera(){
    const resetAction = NavigationActions.reset({
              actions: [NavigationActions.navigate(
                            {key:'FotesCamera', routeName: 'FotesCamera'})]}
                          );
    params = {
      callback: this.foteTakenCallback.bind(this),
      mainBtnTxt: 'Save',
      disableVideo:true,
      hideTypeBtn:true
    }
    this.props.navigation.navigate({key:'FotesCamera',routeName:'FotesCamera',params});
  }

  foteTakenCallback(p){
    // alert(p.uri);
    this.setState({photo:"https://i.pinimg.com/originals/b0/0a/15/b00a153720557ea5f440d5e02517bc9a.gif"});

    ImageResizer.createResizedImage(p.uri, 200, 200, "PNG", 85, 0, "profile").then((response) => {
      cameraCoApi.uploadProfilePhoto(response.uri,this.finishedUpdatingPhoto);
    }).catch((err) => {
      alert("Sorry, we couldn't update your profile picture");
      // Oops, something went wrong. Check that the filename is correct and
      // inspect err to get more details.
    });

  }

  finishedUpdatingPhoto(){
    cameraCoApi.getMe().then((res) => {
      if(res.hasOwnProperty("name")){
        this.setState({photo:res.photo+ "?date="+Date.now(),
                      name:res.name,
                      email:res.email,
                      username:res.username,
                      });
      }
    });
  }

  renderDescription(){
    if(this.state.myProfile){
        return(
            <TextInput
              style={[styles.txt_title_user_info, {textAlign: 'center'}]}
              placeholderTextColor={'black'}
              ref={input => { this.textInput = input }}
              placeholder={'Bio'}
              onChangeText={(newDescription) => this.setNewDescription(newDescription)}
              value={this.state.newDescription}
              multiline={true}
            />
        )
    }else{
      if(this.state.newDescription != ''){
        return(
            <Text style={[styles.txt_title_user_info, {textAlign: 'center'}]}>{this.state.newDescription}</Text>
        )
      }else{
        return null
      }
    }
  }

  onPressFollowers(){
    this.props.navigation.navigate({key:'Followers',routeName:'Followers', params:{uid:this.state.uid,mode:"followers"}});
  }

  onPressFollowing(){
    this.props.navigation.navigate({key:'Followers',routeName:'Followers', params:{uid:this.state.uid,mode:"following"}});
  }

  setNewDescription(txt){
    // alert(txt);
    if(txt.trim() != ''){
      if(this.state.showDescriptionBtn == false){
        this.setState({showDescriptionBtn:true});
      }
      if(txt != this.state.oldDescription){
        this.setState({newDescription:txt});
      }
    }else{
      alert('The description can not be empty');
    }
  }

  renderDescriptionBtn(){
    if(this.state.showDescriptionBtn){
      return(
        <View style={{flexDirection:'row',width:150,justifyContent:'space-between'}}>
          <TouchableOpacity style={styles.btnCancel} onPress={() => this.cancelDescription()}>
            <Text style={[styles.txt16,{color:'#60b9dc'}]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSave} onPress={() => this.saveDescription()}>
            <Text style={[styles.txt16,{color:'white'}]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      )
    }else{
      return null
    }
  }

  cancelDescription(){
    this.setState({newDescription:this.state.oldDescription,showDescriptionBtn:false});
    Keyboard.dismiss();
  }

  saveDescription(){
    let des = this.state.newDescription.trim();
    if(des != ''){
      this.setState({oldDescription:des,showDescriptionBtn:false});
      Keyboard.dismiss();
      cameraCoApi.updateDescription(des).then((res) => {

      });
    }else{
      alert('The description can not be empty');
    }
  }


  renderAnnotations(fote){
    return (null)
  }

  renderLine(fote){
    if(fote.activity.to_place != null){
      route =
        {
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "properties": {},
              "geometry": {
                "style":{
                    "fill":"red",
                    "stroke-width":"10",
                    "lineDasharray":[4],
                    "fill-opacity":1
                },
                "type": "LineString",
                "coordinates": [
                  [
                    fote.activity.from_place.geometry.location.lng,fote.activity.from_place.geometry.location.lat,
                  ],
                  [
                    fote.activity.to_place.geometry.location.lng,fote.activity.to_place.geometry.location.lat,
                  ]
                ]
              }
            }
          ]

        }
      return (null)
    }else{
      return (null);
    }
  }

  renderFlatlist(){
    if(this.state.isBlocked){
      return(
        <View style={styles.wrapperBlockImage}>
          <Image style={styles.blockImage}
            resizeMode={'contain'}
            source={require('../assets/img/icons/close_black.png')}
          />
        </View>
      )
    }else{
      return(
        <FlatList
          style={styles.flatlist}
          data={this.state.fotes}
          numColumns={3}
          keyExtractor={this._keyExtractor}
          renderItem={({item,index}) => this.renderFote(item,index)}
        />
      )
    }
  }
  renderUserInfo(){
    return(
      <View style={styles.userInfo}>
        <View style={styles.item_user_info_sides}>
          <TouchableOpacity onPress={() => this.onPressFollowers()}>
            <Text style={[styles.txt_value_user_info, {textAlign: 'right'}]}>{this.state.numbFollowers}</Text>
          </TouchableOpacity>
          <Text style={[styles.txt_title_user_info, {textAlign: 'right'}]}>followers</Text>
        </View>
        <View style={styles.separator_user_info}>
          <Image style={styles.icon_separator}
            source={require('../assets/img/icons/seperator_user_info.png')}
          />
        </View>
        <View style={styles.item_user_info_center}>
          <Text style={[styles.txt_value_user_info_center, {textAlign: 'center'}]}>{this.state.username}</Text>
          {this.renderDescription()}
        </View>
        <View style={styles.separator_user_info}>
          <Image style={styles.icon_separator}
            source={require('../assets/img/icons/seperator_user_info.png')}
          />
        </View>
        <View style={styles.item_user_info_sides}>
          <TouchableOpacity onPress={() => this.onPressFollowing()}>
            <Text style={[styles.txt_value_user_info, {textAlign: 'left'}]}>{this.state.followingCount}</Text>
          </TouchableOpacity>
          <Text style={[styles.txt_title_user_info, {textAlign: 'left'}]}>following</Text>
        </View>

      </View>
    );
  }
  onGoChat(){
    cameraCoApi.createConversation(this.state.uid)
      .then((res)=>{
        let title = this.state.username ? this.state.username : "";
        let photo = this.state.photo ? this.state.photo : "";
        if(res.success){
          this.props.navigation.navigate({key:'Conversation',routeName:'Conversation',
            params:{conversationId:res.response.dmId, title:title, photo:photo}});
        }
      })
      .catch((err)=>{
        console.log("err on create conversation");
        console.log(err);
      });

  }
  requestVerifyEmail(){
    if(!this.state.is_requesting_verification){
      this.setState({ is_requesting_verification: true});
      cameraCoApi.sendRequestVerifyEmail()
        .then(res=>{
          this.setState({ is_requesting_verification: false});
          if(res.status){
            alert("Great, please review your email to confirm the request");
          }else{
            alert("Sorry, something wrong has happened");
          }
        })
        .catch(err=>{
          this.setState({ is_requesting_verification: false});
          alert("Sorry, something wrong has happened");
        });
    }
  }
  renderActionButtons(){
    if(this.state.uid != this.state.me.uid){
      if(this.state.btnTxt == "Unfollow"){
        return(
          <View style={styles.container_action_buttons}>
            <View style={styles.container_buttons}>
              <TouchableOpacity onPress={() => this.onPressBtn()}
                style={{flex: 1}}>
                <View style={[styles.container_button, {borderColor: '#5AC2B5'}]}>
                  <Image
                    source={require('../assets/img/icons/check.png')}
                    style={[styles.icon_button_action, {tintColor: '#5AC2B5'}]}
                  />
                  <Text style={[styles.txt_button_action, {color: '#5AC2B5', fontWeight: '700'}]}>Following</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.onGoChat()}
                style={{flex: 1}}>
                <View style={[styles.container_button, {borderColor: '#EC5277', backgroundColor: '#EC5277'}]}>
                  <Image
                    source={require('../assets/img/icons/chat.png')}
                    style={[styles.icon_button_action , {tintColor: '#ffffff'}]}
                  />
                  <Text style={[styles.txt_button_action, {color: '#ffffff', fontWeight: '700'}]}>Chat</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );
      }
      return(
        <View style={styles.container_action_buttons}>
          <View style={styles.container_buttons}>
            <TouchableOpacity onPress={() => this.onPressBtn()}
              style={{width: 150}}>
              <View style={[styles.container_button, {borderColor: '#EC5277', backgroundColor: '#EC5277'}]}>
                <Image
                  source={require('../assets/img/icons/seperator_user_info.png')}
                  style={[styles.icon_button_action, {tintColor: '#ffffff'}]}
                />
                <Text style={[styles.txt_button_action, {color: '#ffffff', fontWeight: '700'}]}>Follow</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );

    }else{
      return (
        <View style={styles.container_action_buttons}>
          {
            this.state.me.is_account_verified ?
            <View/>
            :
            <TouchableOpacity
              onPress={()=>this.requestVerifyEmail()}>
              <View style={[styles.container_button, {marginBottom: 10}]}>
                <Image
                  source={require('../assets/img/icons/verifyemail.png')}
                  style={[styles.icon_button_action, {tintColor: '#5EB0DA'}]}
                />
                <Text style={[styles.txt_button_action, {color: '#5EB0DA'}]}>Verify Email Address</Text>
              </View>
            </TouchableOpacity>
          }
          <View style={styles.container_buttons}>
            <TouchableOpacity onPress={() => this._settings()}
              style={{flex: 1}}>
              <View style={styles.container_button}>
                <Image
                  source={require('../assets/img/icons/edit.png')}
                  style={[styles.icon_button_action, {tintColor: '#5AC2B5'}]}
                />
                <Text style={styles.txt_button_action}>Edit Profile</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={()=> this.goToSearchView()}
              style={{flex: 1}}>
              <View style={styles.container_button}>
                <Image
                  source={require('../assets/img/icons/addfriend.png')}
                  style={[styles.icon_button_action , {tintColor: '#EC5277'}]}
                />
                <Text style={styles.txt_button_action}>Add Friends</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }
  goToSearchView(){
      this.props.navigation.navigate({
        key:'SearchView',
        routeName:'SearchView',
      });
  }
  render() {
      return (
        <View style={styles.container}>
          <StatusBar hidden={false} />
          {this.renderTopBar()}
          <View style={styles.header}>
            {this.renderImageUser(this.state.photo)}
            {this.renderUserInfo()}
            {this.renderActionButtons()}
          </View>
          <View style={[styles.descriptionArea, this.state.showDescriptionBtn ? {} : {padding: 0}]}>
            <View style={styles.wrapperPlace}>
              <View style={{flex:1,alignItems:'flex-end'}}>
                {this.renderDescriptionBtn()}
              </View>
            </View>
          </View>
          {this.renderFlatlist()}

        </View>
      );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'white',
    ...ifIphoneX({
            paddingTop:25
        }, {
            paddingTop: statusBarHeight
        })
  },
  flatlist:{
    flex:1,
    backgroundColor:"#f2f2f2",
  },
  wrapperBlockImage:{
    flex:1,
    backgroundColor:"#f2f2f2",
    justifyContent:'center',
  },
  blockImage:{
    flex:0.25,
    width:undefined,
    height:undefined,
    tintColor:'#e5e5e5',
  },
  header:{
    paddingLeft:20,
    paddingRight:20,
    backgroundColor:'white',
    alignItems:'center',
  },
  headerContent:{
    flex:1,
    paddingLeft:20,
    justifyContent: 'space-around',
  },
  userImage:{
    height:100,
    width:100,
    borderRadius:50,
    backgroundColor:'#e9ecef',
  },
  userInfo:{
    flexDirection:'row',
    marginTop: 15,
    marginBottom: 15
  },
  item_user_info_sides: {
    flex: 1,
  },
  item_user_info_center:{
    flex: 2
  },
  txt_value_user_info: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold'
  },
  txt_value_user_info_center: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold'
  },
  txt_title_user_info: {
    marginTop: 5,
    fontSize: 12,
    color: '#8E8E8E',
  },
  separator_user_info: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon_separator: {
    width: 16,
    height: 16,
    tintColor: '#DDDDDD'
  },
  userName:{
    fontSize:20,
    color:'black',
    fontWeight:'bold',
  },
  txtGray:{
    fontSize:16,
    color:'gray',
  },
  txtBlack:{
    fontSize:16,
    color:'black',
  },
  txtBlue:{
    fontSize:18,
    fontWeight:'bold',
    color:'#60b9dc',
  },
  fote:{
    height:ITEM_WIDTH,
    width:ITEM_WIDTH,
    backgroundColor:"white"
  },
  foteImage:{
    flex:1,
    backgroundColor:"#e9ecef",
    borderWidth:2,
    borderColor:'#f2f2f2'
  },
  textFote:{
    height:ITEM_WIDTH,
    width:ITEM_WIDTH,
    borderWidth:2,
    borderColor:'#f2f2f2',
    justifyContent:'center'
  },
  btnFollow:{
    backgroundColor:'#ef5d83',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    marginTop:10,
    paddingTop:5,
    paddingBottom:5,
    width:100,
  },
  btnTxtFollow:{
    color:'white',
    fontSize:16
  },
  descriptionArea:{
    padding:20,
    backgroundColor:'white'
  },
  wrapperPlace:{
    flexDirection:'row',
    alignItems:'center',
    paddingTop:10
  },
  icon:{
    height:14,
    width:14
  },
  txtType:{
    fontSize:20,
    color:'white',
    textAlign:'center',
    paddingLeft:10,
    paddingRight:10
  },
  areaCamera:{
   alignItems: 'center',
  },
  borderImageProfile:{
    width: 108,
    height: 108,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#DDDDDD',
    borderWidth:1,
    borderRadius: 54
  },
  cameraIcon:{
      backgroundColor:'#ef5d82',
      height:34,
      width:34,
      marginTop:-30,
      marginLeft:70,
      borderRadius:17,
      justifyContent:'center',
      alignItems:'center',
      shadowColor: 'gray',
      shadowOffset: { width: 0, height: 0.5 },
      shadowOpacity: 0.2,
      shadowRadius: 0.5,
      elevation: 0.5
  },
  btnSave:{
    backgroundColor:'#ef5d82',
    borderRadius:10,
    justifyContent:'center',
    alignItems:'center',
    width:70,
    paddingTop:5,
    paddingBottom:5,
  },
  btnCancel:{
    backgroundColor:'white',
    borderWidth:1,
    borderColor:'#60b9dc',
    borderRadius:10,
    justifyContent:'center',
    alignItems:'center',
    width:70,
    paddingTop:5,
    paddingBottom:5,
  },
  txt16:{
    color:16
  },
  annotationContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
  },
  annotationFill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef6185',
    transform: [{ scale: 0.6 }],
  },
  audioWrapperGrid:{
    position:'absolute',
    top:5,
    right:5,
    zIndex:1,
    alignItems:'center'
  },
  container_action_buttons:{
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 15,
    marginRight: 15,
  },
  container_buttons:{
    flexDirection: 'row',
    alignSelf: 'center'
  },
  container_button: {
    marginLeft: 10,
    marginRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 20,
    borderColor: '#EEEEEE',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  icon_button_action: {
    width: 18,
    height: 18
  },
  txt_button_action: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#8E8E8E',
    marginLeft: 5,
  }
});
