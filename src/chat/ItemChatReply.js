import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';

export default class ItemChatReply extends React.Component {

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
    getContentDescription(){
        let type = this.props.item.type;
        if(type == "video"){
            return "Video";
        }else if(type == "type"){
            return "Audio note";
        }else if (type == "audio_caption"){
            let audio = this.props.item.audio_caption;
            if(!audio) return "Photo";
            if(audio.length < 1) return "Photo";
            return "Photo with voice note";
        }else{
            return "Photo";
        }
    }
    render(){
        return (
            <View style={styles.container}>
                <View style={styles.container_close}>
                    <TouchableOpacity
                        onPress={()=> this.props.onClose()}>
                        <Image
                            style={styles.icon_close}
                            source={require('../assets/img/icons/closeBlack.png')}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.container_message}>
                    <View style={styles.container_message_profile}>
                        <Image
                            style={styles.profile_picture}
                            source={this.getProfilePicture()}
                        />
                    </View>
                    <View style={styles.container_message_information}>
                        <Text style={styles.txt_username}>{this.getUsername()}</Text>
                        <Text style={styles.txt_message}>{this.getContentDescription()}</Text>
                    </View>
                </View>
                <View style={styles.container_image}>
                    {this.getImagePreview()}
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container:{
        height: 90,
        flexDirection: 'row',
        paddingTop: 5,
        paddingBottom: 5,
        paddingRight: 10
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
        backgroundColor:'#F1F1F1',
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
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
    txt_message: {
        fontSize: 12,
        color: '#808080'
    },
    container_image: {
        width: 80,
        height: 80,
        marginLeft: 4,
        overflow: 'hidden',
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5
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
    }
});
