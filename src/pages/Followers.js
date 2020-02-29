import React, { Component } from 'react';
import {
  FlatList,
  StatusBar,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import TopBar from '../components/TopBar';
import cameraCoApi from "../api/CameraCoApi";
import { isIphoneX } from 'react-native-iphone-x-helper'
import { ifIphoneX } from 'react-native-iphone-x-helper'
export default class Followers extends Component {
  constructor(props){
    super(props);
    this.state = {
      title:"Followers",
      uid:null,
      users:[]
    }
  }
  componentWillMount(){
    const {state} = this.props.navigation;
    this.setState({
      "uid":state.params.uid
    })
    if(state.params.mode == "followers"){
      this.setState({
        "title":"Followers"
      })
      cameraCoApi.followers(state.params.uid).then((res) => {
          this.setState({"users":res})
      });
    }else if(state.params.mode =="following"){
      this.setState({
        "title":"Following"
      })
      cameraCoApi.following(state.params.uid).then((res) => {
          this.setState({"users":res})
      });
    }

  }
  _goBack(){
     const {goBack} = this.props.navigation;
     goBack()
  }
  renderImageUser(photo){
    if(photo != ''){
      return(
        <Image style={styles.userImage}
          source={{uri:photo}}
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
  _onUserPressed(user){
     //alert(JSON.stringify(user));
     this.props.navigation.navigate({
       key:'FeedProfile' + Math.random () * 10000,
       routeName:'FeedProfile',
       params:{user:user,showSettings:false,isBlocked:false}
     });
  }
  renderRow(user){
    return(

    <TouchableOpacity style={styles.resultsWrapper}  onPress={() => this._onUserPressed(user)} >
      {this.renderImageUser(user.photo)}
      <View style={{flex:1,marginLeft:15}}>
        <Text style={{fontSize:16,fontWeight:"bold"}}>{user.name}</Text>
      </View>
    </TouchableOpacity>
    )
  }
  render() {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="white"/>
        <TopBar
          firstBtnImage={'back'}
          firstBtn={() => this._goBack()}
          mainTitle={this.state.title}
        >
        </TopBar>
        <FlatList
          data={this.state.users}
          renderItem={({item}) => this.renderRow(item)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...ifIphoneX({
            paddingTop:25
        }, {
            paddingTop: statusBarHeight
        }),
    backgroundColor:'white',

  },
  resultsWrapper:{
    height:75,
    flexDirection:'row',
    alignItems:'center',
    marginLeft:15,
    marginRight:15,
    marginTop:5
  },
  userImage:{
    height:55,
    width:55,
    borderRadius:27.5,
    backgroundColor:'#e9ecef'
  },
});
