import React, { Component } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';


export default class MessageChatReply extends React.Component {

    constructor(props){
        super(props);
    }
    getProfilePicture(){
        let user = this.props.item.user;
        let photo = '';
        if(user){
          if(user.length > 0){
            photo = user[0].photo;
          }
        }
        return {uri: photo};
    }
    getUsername(){
        let user = this.props.item.user;
        let username = '';
        if(user){
          if(user.length > 0){
            username = user[0].username;
          }
        }
        return username;
    }
    getImagePreview(){
        let type = this.props.item.type;
        let media = this.props.item.media ? this.props.item.media : null;
        if(!media) return ( <View style={styles.preview_default}/> );
        if(media.length<1) return ( <View style={styles.preview_default}/> );
        if(type == "video"){
            let thumbnail = this.props.item.thumbnails;
            if(!thumbnail) return ( <View style={styles.preview_default}/> );
            if(thumbnail.length < 1) return ( <View style={styles.preview_default}/> );
            if(!thumbnail[0].url) return ( <View style={styles.preview_default}/> );
            return (
                <Image
                    style={styles.image_preview}
                    source={{uri: thumbnail[0].url}}
                />
            );
        }else if(type == "type"){
            let backgroundColor = this.props.item.backgroundColor;
            return (
                <View style={[styles.preview_default, (backgroundColor && backgroundColor != "") ?
                {backgroundColor: backgroundColor, justifyContent: 'center', alignItems: 'center'}
                : {justifyContent: 'center', alignItems: 'center'} ]}>
                    <Image
                        style={styles.icon_audio}
                        source={require('../assets/img/icons/microphone.png')}
                    />
                </View>
            );
        }else if (type == "audio_caption"){
            return (
                <Image
                    style={styles.image_preview}
                    source={{uri: media[0].url}}
                />
            );
        }else if(media[0].url){
            return (
                <Image
                    style={styles.image_preview}
                    source={{uri: media[0].url}}
                />
            );
        }else{
            return ( <View style={styles.preview_default}/> );
        }
    }
    getTime(){
        let time = new Date(this.props.message.creation_date);
        let dateNow = new Date();
        if(time.getFullYear() != dateNow.getFullYear()){
            return this.getFormatDate(time);
          }
          if(time.getMonth() != dateNow.getMonth()){
            let diff = dateNow.getMonth() - time.getMonth();
            return diff > 1 ? diff + " months ago" : "a month ago"
          }
          if(time.getDate() != dateNow.getDate()){
            let diff = dateNow.getDate() - time.getDate();
            return diff > 1 ? diff + " days ago" : "a day ago"
          }
          if(time.getHours() != dateNow.getHours()){
            let diff = dateNow.getHours() - time.getHours();
            return diff > 1 ? diff + " hours ago" : "an hour ago"
          }
          let diff = dateNow.getMinutes() - time.getMinutes();
          return diff > 1 ? diff + " minutes ago" : "a minute ago"
    }
    render(){
        console.log(this.props.message);
        return (
            <View style={[styles.wrapper_message,{backgroundColor:this.props.bc}]}>
                <View style={styles.container}>
                    <View style={styles.container_message}>
                        <View style={styles.container_message_profile}>
                            <Image
                                style={styles.profile_picture}
                                source={this.getProfilePicture()}
                            />
                        </View>
                        <View style={styles.container_message_information}>
                            <Text style={styles.txt_username}>{this.getUsername()}</Text>
                            <Text style={styles.txt_time}>{this.getTime()}</Text>
                        </View>
                    </View>
                    <View style={styles.container_image}>
                        {this.getImagePreview()}
                    </View>
                </View>
                <View style={styles.container_message_txt}>
                    <Text style={[styles.txt_message,this.props.bc == '#f1f1f1' ? {color:'#5e5e5e'} : {color:'white'}]}>{this.props.message.message}</Text>
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    wrapper_message:{
        flex: 1,
        borderRadius:15,
        padding: 5,
    },
    container:{
        flex: 1,
        height: 80,
        flexDirection: 'row',
    },
    container_close: {
        width: 34,
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon_close:{
        width: 20,
        height: 20
    },
    container_message: {
        flex: 1,
        height: 80,
        backgroundColor:'rgba(255,255,255,0.85)',
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        flexDirection: 'row'
    },
    container_message_profile:{
        width: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    profile_picture: {
        width: 30,
        height: 30,
        borderRadius: 15
    },
    container_message_information:{
        paddingTop: 10,
        paddingBottom: 10,
        paddingRight: 10,
        justifyContent: 'center'
    },
    txt_username: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#808080'
    },
    txt_time: {
        fontSize: 12,
        color: '#808080'
    },
    container_image: {
        width: 80,
        height: 80,
        overflow: 'hidden',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10
    },
    image_preview:{
        width: 80,
        height: 80,
    },
    preview_default: {
        width: 80,
        height: 80,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        backgroundColor: '#ef5d82'
    },
    icon_audio:{
        width: 30,
        height: 30,
        tintColor: '#ffffff'
    },
    container_message_txt:{
        padding: 10,
    },
    txt_message:{
        fontSize: 16
    }
});
