import React, { Component } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput
} from 'react-native';
import cameraCoApi from "../api/CameraCoApi";
import { isIphoneX } from 'react-native-iphone-x-helper'
import { ifIphoneX } from 'react-native-iphone-x-helper'
import { getStatusBarHeight } from 'react-native-status-bar-height';
import TopBar from '../components/TopBar';

const statusBarHeight = getStatusBarHeight();
const API_KEY = 'AIzaSyCBVknPmd2_GTpjP0pXjHvTAqYDBNqYgA0';
const url = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=';

export default class Places extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      places: [],
      longitude:0,
      latitude:0,
    }
  }

  componentDidMount(){
    const {state} = this.props.navigation;

    this.setState({
      "longitude":state.params.longitude,
      "latitude":state.params.latitude,
    })
    //check if the user is logged in
    cameraCoApi.getPlaces(state.params.latitude,state.params.longitude).then((res) => {
      // alert(JSON.stringify(res));
      if(res.success){
        // alert('here');
        this.setState({'places':res.places});
      }
    });
  }

  _keyExtractor = (item, index) => index;

  onPlaceSelected(item){
    const {state} = this.props.navigation;
    state.params.onPlaceSelected(item);
    this._goBack();
  }

  _goBack(){
     const {goBack} = this.props.navigation;
     goBack();
  }

  renderPlace(item){
    let photo='';
    if(item.hasOwnProperty('photos')){
      photo = url+item.photos[0].photo_reference+'&key='+API_KEY
    }
    return(
      <TouchableOpacity style={styles.resultsWrapper} onPress={() => this.onPlaceSelected(item)} >
        <Image style={styles.image}
          source={{uri:photo}}
        />
        <View style={{flex:1,marginLeft:25}}>
          <Text style={{fontSize:18,fontWeight:"bold"}}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  renderSeparator(){
    return (<View style={styles.separator}></View>);
  }

  renderFlatlist(){
    // let p = places
    // alert('long  ' + places.length);
    if(this.state.places.length > 0){
      return(
        <FlatList
          data={this.state.places}
          keyExtractor={this._keyExtractor}
          renderItem={({item}) => this.renderPlace(item)}
          ItemSeparatorComponent={this.renderSeparator}
        />
      )
    }else{
      return(
        <View style={{flex:1,paddingTop:25}}>
          <Text style={styles.msg}>
            There are no results matching your search.
          </Text>
        </View>

      )
    }
  }

  searchPlace(name){
    if(name.trim() != ''){
      cameraCoApi.searchPlace(name).then((res) => {
        if(res.success){
          this.setState({'places':res.places});
        }
      });
    }
  }

  render() {
      return (
        <View style={styles.container}>
          <TopBar
            firstBtnImage={'back'}
            firstBtn={() => this._goBack()}
            mainTitle={'Location'}
          >
          </TopBar>
          <View style={styles.inputArea}>
            <View style={styles.wrapperInput}>
              <Image style={styles.searchIcon}
                source={require('../assets/img/icons/search.png')}
              />
              <TextInput
                style={styles.input}
                placeholder = 'Search location...'
                underlineColorAndroid='transparent'
                onChangeText = {(name) => this.searchPlace(name)}
              />
            </View>
          </View>

          <View style={styles.containerFlatlist}>
            {this.renderFlatlist()}
          </View>
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
  resultsWrapper:{
    height:100,
    paddingLeft:10,
    paddingRight:10,
    flexDirection:'row',
    alignItems:'center'
  },
  separator:{
    flex:1,
    height:2,
    backgroundColor:"#EBEBEB"
  },
  containerFlatlist:{
    flex:1,
  },
  image:{
    backgroundColor:"#e9ecef",
    height:70,
    width:120
  },
  wrapperInput:{
    flexDirection:'row',
    height:36,
    backgroundColor:'#f7f7f7',
    borderWidth:1,
    borderColor:"#f7f7f7",
    borderRadius:12,
    paddingLeft:12,
    paddingRight:12,
    alignItems:'center',
    justifyContent:'center'
  },
  searchIcon:{
    height:18,
    width:18,
  },
  input:{
    flex:1,
    backgroundColor:'#f7f7f7',
    paddingLeft:10,
    fontSize:18
  },
  msg:{
    fontSize:18,
    color:'gray',
    textAlign:'center'
  },
  inputArea:{
    height:60,
    backgroundColor:'white',
    paddingLeft:20,
    paddingRight:20,
    justifyContent:'center',
    borderBottomWidth:1,
    borderBottomColor:'#e8e8e8'
  }
});
