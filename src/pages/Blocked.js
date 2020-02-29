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
import { ifIphoneX } from 'react-native-iphone-x-helper'

export default class Blocked extends Component {
  constructor(props){
    super(props);
    this.state = {
      users:[]
    }
  }

  componentWillMount(){
    cameraCoApi.getMe().then((res) => {
      if(res.hasOwnProperty('blocked_users')) {
        if(res.blocked_users.length > 0){
          this.setState({"users":res.blocked_users})
        }
      }
    });
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
     this.props.navigation.navigate({
       key:'FeedProFile' +  Math.random () * 10000,
       routeName:'FeedProfile',
       params:{user:user,showSettings:false,isBlocked:true}
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
          mainTitle={'Blocked'}
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
