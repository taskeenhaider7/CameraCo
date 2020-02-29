import React, { Component } from 'react';
import { StyleSheet, Text, View, Image,TouchableOpacity, FlatList, Dimensions } from 'react-native';
import {
  CachedImage
} from 'react-native-cached-image';
const { width} = Dimensions.get('window');
const ITEM_WIDTH = width/3;

export default class PostsGrid extends React.Component {

    constructor(props){
        super(props);
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
    goToFote(fote,url){
        //let like = this._isLiked(fote);
        //let numLikes = this._likes(fote);
        let like = false;
        let numLikes = 0;
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
    renderAudioIconGrid(){
        return(
          <View style={styles.audioWrapperGrid}>
            <Image style={{height:20,width:20,tintColor:'white'}}
              source={require('../../assets/img/icons/audio.png')}
            />
          </View>
        )
    }
    renderFote(fote,index){
        if((fote.hasOwnProperty('media')) && (fote.media[0] !== undefined)){
          if(fote.type === 'video'){
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
          }else if(fote.type === 'type'){
            return(
              <TouchableOpacity style={[styles.textFote, {backgroundColor:fote.backgroundColor}]}
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
                <CachedImage style={styles.foteImage}
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
              <TouchableOpacity style={[styles.textFote, {backgroundColor:fote.backgroundColor}]}
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
    render(){
        return (
            <View style={styles.container}>
                <FlatList
                    onEndReached={() => this.props.onRefresh()}
                    onEndReachedThreshold={0}
                    data={this.props.posts}
                    numColumns={3}
                    keyExtractor={this._keyExtractor}
                    renderItem={({item,index}) => this.renderFote(item,index)}
                />
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
    },
    flatlist:{
        flex:1,
    },
    fote:{
        height:ITEM_WIDTH,
        width:ITEM_WIDTH,
        backgroundColor:"white"
    },
    foteImage:{
        flex:1,
        borderWidth:1,
        borderColor:'#FFFFFF'
    },
    textFote:{
        height:ITEM_WIDTH,
        width:ITEM_WIDTH,
        borderWidth:1,
        borderColor:'#f2f2f2',
        justifyContent:'center'
    },
    txtType:{
        fontSize:20,
        color:'white',
        textAlign:'center',
        paddingLeft:10,
        paddingRight:10
    },
    audioWrapperGrid:{
        position:'absolute',
        top:5,
        right:5,
        zIndex:1,
        alignItems:'center'
    },
});
