import React, { Component } from 'react';
import {AsyncStorage,Alert,Platform,Dimensions,TextInput,StyleSheet,Text,View,FlatList,Image,TouchableOpacity,Modal,TouchableHighlight,TouchableWithoutFeedback} from 'react-native';
import FeedList from './FeedList';
import ModalFollow from './ModalFollow';
import UploadFoteProgress from './UploadFoteProgress';
import { getStatusBarHeight } from 'react-native-status-bar-height';
statusBarHeight = getStatusBarHeight();
import cameraCoApi from "../api/CameraCoApi";
const { height, width} = Dimensions.get('window');

export default class Feed extends Component {

  constructor(params){
    super(params);
    this.setModalVisible = this.setModalVisible.bind(this);
    this._handleRefresh = this._handleRefresh.bind(this);
    this._handleSaveKey = this._handleSaveKey.bind(this);


    this.state = {
      data:[],
      refreshingList:false,
      user_id:'',
      showMenu:false,
      itemSelected:null,
      indexItem:null,
      typeModal:'follow',
      followId:null,
      followUsername:'',
    }
  }
  async getKey() {
     try {
       const value = await AsyncStorage.getItem('feed');
       //console.log(value);
       this.setState({data: JSON.parse(value)});
       // let reverseList = JSON.parse(value);
       // let listLabel = reverseList.reverse();
       // this.setState({filteredList: listLabel});
     } catch (error) {
       console.log("Error retrieving data" + error);
     }
  }
  async saveKey(value) {
    // console.log("saving: " + value);
    try {
      await AsyncStorage.setItem('feed', value);
      // this.setState({myKey: JSON.parse(value)});
      // this.setState({filteredList: JSON.parse(value)});
    } catch (error) {
      console.log("Error saving data" + error);
    }
  }
  componentDidMount(){
    this.getKey();
    cameraCoApi.feedMe().then((res) => {
      if(res == "error"){

      }else{
        if(Array.isArray(res)){
          this.saveKey(JSON.stringify(res));
        }
        if(res.hasOwnProperty("error")){
            this.setState({data:[]})
        }else{
          if(this.state.data != res){
            this.setState({data:res})
          }
        }
      }

    });
    cameraCoApi.getMe().then((res) => {
      if(res.hasOwnProperty("uid")){
        this.setState({"user_id":res.uid})
      }
    });
    if(true){


    }

  }

  _handleSaveKey = () => {
    cameraCoApi.feedMe().then((res) => {
      if(res != "error"){
        if(Array.isArray(res)){
          this.saveKey(JSON.stringify(res));
        }
        this.setState({data:res});
      }
    });
  }

  refreshList(){
    cameraCoApi.feedMe().then((res) => {
      if(res == "error"){

      }else{
        if(res.hasOwnProperty("error")){
          this.setState({
            refreshingList:false
          })
        }else{
          // alert('here')
          this.setState({
            data:res,
            refreshingList:false
          })
        }
      }

    })
  }


  _handleRefresh = () => {

    this.setState({
        refreshingList:true
      },
      () => {
      this.refreshList();
      }
    )
  }


  setModalVisible(typeModal,item){
    if(typeModal == 'delete'){
      this.modal.setModal(true);
      this.setState({itemSelected:item.id,indexItem:item.index});
      // alert(item.index)
    }else if(typeModal == 'follow'){
      this.modal2.setModal(true);
      this.setState({followId:item.uid,typeModal:'follow',followUsername:item.username,itemSelected:item.id});
    }else{
      this.modal3.setModal(true);
      this.setState({followId:item.uid,typeModal:'unfollow',followUsername:item.username,itemSelected:item.id});
    }
  }


  deleteFote(){
    let itemId = this.state.itemSelected;
    cameraCoApi.deleteFote(itemId).then((res) => {
      if(res.success){
        let {data} = this.state;
        data.splice(this.state.indexItem,1);
        if(Array.isArray(data)){
          this.saveKey(JSON.stringify(data));
        }
        this.setState({data});
        this._handleRefresh();
      }
    });
  }


  alertDelete(){
    //Hide menu
    this.modal.setModal(false);
    //Show alert. Added the timeout because other way the modal does not  work correctly
    setTimeout( () => {
      Alert.alert(
        'Delete',
        'You want to delete your post?',
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: () => this.deleteFote()},
        ],
        // { cancelable: false }
      )
    },500);
  }


  follow(){
    this.modal2.setModal(false);
    if(this.state.followId != null){
      cameraCoApi.follow(this.state.followId).then((res) => {
        if(res.success){
          cameraCoApi.feedMe().then((response) => {
            if(response != "error"){

              if(Array.isArray(response)){
                this.saveKey(JSON.stringify(response));
              }
              this.setState({data:response});
              this._handleRefresh();

            }
          });
        }
      });
    }
  }


  unfollow(){
    if(this.state.followId != null){
      cameraCoApi.unfollow(this.state.followId).then((res) => {
        if(res.success){
          cameraCoApi.feedMe().then((response) => {
            if(response != "error"){

              if(Array.isArray(response)){
                this.saveKey(JSON.stringify(response));
              }
              this.setState({data:response});
              this._handleRefresh();

            }
          });
        }
      });
    }
  }

  unfollowAlert(){
    //Hide menu
    this.modal3.setModal(false);
    //Show alert. Added the timeout because other way the modal does not  work correctly
    setTimeout( () => {
      Alert.alert(
        'Unfollow',
        'Are you sure, you want to unfollow '+ this.state.followUsername + '?',
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: () => this.unfollow()},
        ],
        // { cancelable: false }
      )
    },500);
  }

   blockAlert(){
     if(this.state.typeModal == 'follow'){
       this.modal2.setModal(false);
     }else{
       this.modal3.setModal(false);
     }
     setTimeout( () => {
       Alert.alert(
         'Block',
         'Are you sure, you want to block '+ this.state.followUsername +'?',
         [
           {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           {text: 'OK', onPress: () => this.block()},
         ],
         // { cancelable: false }
       )
     },500);
   }


  block(){
    if(this.state.followId != null){
      cameraCoApi.block(this.state.followId).then((res) => {

        if(res.success){
          cameraCoApi.feedMe().then((response) => {
            if(response != "error"){

              if(Array.isArray(response)){
                this.saveKey(JSON.stringify(response));
              }
              this.setState({data:response});
              this._handleRefresh();

            }
          });
        }

      });
    }
  }


  reportAlert(){
    if(this.state.typeModal == 'follow'){
      this.modal2.setModal(false);
    }else{
      this.modal3.setModal(false);
    }
    setTimeout( () => {
      Alert.alert(
        'Report',
        'Are you sure, you want to report this fote?',
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: () => this.report()},
        ],
        // { cancelable: false }
      )
    },500);
  }

  report(){
    if(this.state.itemSelected != null){
      cameraCoApi.report(this.state.itemSelected).then((res) => {
        if(res.success){
          alert('Your report has been received');
        }
      });
    }
  }


  render() {
    return (
      <View style={styles.container} >
        <UploadFoteProgress></UploadFoteProgress>
        <FeedList
          data={this.state.data}
          refreshingFeed={this.state.refreshingList}
          handleRefreshFeed={this._handleRefresh}
          user_id={this.state.user_id}
          onCommentsPressed={this.props.onCommentsPressed}
          onGoChat={this.props.onGoChat}
          onPlacePressed={this.props.onPlacePressed}
          mode={this.props.mode}
          extraData = {this.props.extraData}
          numColumns={this.props.numColumns}
          onGridItemPressed={this.props.onGridItemPressed}
          onUserPressed={this.props.onUserPressed}
          setModalVisible={this.setModalVisible}
          currentPage={this.props.currentPage}
          handleSaveKey={this._handleSaveKey}
        />
        <ModalFollow
          ref={ref => {
            this.modal = ref;
          }}
          firstBtnTxt={'Delete'}
          firstBtnColor={'red'}
          firstBtn={() => this.alertDelete()}
        />
        <ModalFollow
          ref={ref => {
            this.modal2 = ref;
          }}
          firstBtnTxt={'Follow'}
          firstBtn={() => this.follow()}
          secondBtnTxt={'Block'}
          secondBtn={() => this.blockAlert()}
          thirdBtnTxt={'Report'}
          thirdBtn={() => this.reportAlert()}

        />
        <ModalFollow
          ref={ref => {
            this.modal3 = ref;
          }}
          firstBtnTxt={'Unfollow'}
          firstBtnColor={'red'}
          firstBtn={() => this.unfollowAlert()}
          secondBtnTxt={'Block'}
          secondBtn={() => this.blockAlert()}
          thirdBtnTxt={'Report'}
          thirdBtn={() => this.reportAlert()}
        />
      </View>


    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'pink',
  },
  containerModal:{
    flex:1,
    backgroundColor:'rgba(0,0,0,0.2)',
  },
  containerBtn:{
    padding:15,
    backgroundColor:'transparent'
  },
  txtBtn:{
    fontSize:18
  },
  btn:{
    height:50,
    borderRadius:12.5,
    backgroundColor:'white',
    justifyContent:'center',
    alignItems:'center'
  },
  btnHide:{
    flex:1,
  }
});
