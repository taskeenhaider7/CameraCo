import React, { Component } from 'react';
import { StyleSheet, Text, View, Image,TouchableOpacity, FlatList } from 'react-native';
import cameraCoApi from "../../api/CameraCoApi";
import PostsGrid from './PostsGrid';
import { ifIphoneX } from 'react-native-iphone-x-helper'
import { getStatusBarHeight } from 'react-native-status-bar-height';
statusBarHeight = getStatusBarHeight();
import RNTextInput from 'react-native-text-input-enhance';
import LinearGradient from 'react-native-linear-gradient';

export default class SearchView extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            suggestions: [],
            is_show_posts: false,
            page: 1,
            hashtag_current: '',
            posts: []
        }
    }
    clearBox(){
        if(this.textInput){
            this.textInput.clear();
        }
        this.setState({
            is_show_posts: false,
            suggestions: []
        });
    }
    goBack(){
        if(this.state.is_show_posts){
            this.setState({
                is_show_posts: false
            });
        }else{
            this.props.navigation.goBack();
        }
    }
    getSuggestions(keySearch){
        if(keySearch.length>1){
          cameraCoApi.getSuggestions(keySearch)
            .then(res=>{
                if(res.status){
                    this.setState({
                        suggestions: res.result
                    });
                }
            })
            .catch(err=>{
                console.log("err from suggestions");
                console.log(err);
            });
        }else{
          this.setState({
            keySearch: keySearch,
            suggestions: []
          });
        }

    }
    renderSeparator = () => {
        return (
          <View
            style={{
                height: 1,
                paddingLeft: 25,
                paddingRight: 25,
                backgroundColor: "#EEEEEE",
            }}
          />
        );
    };
    goHashtagSearch(hashtag){
        this.setState({is_show_posts: true, hashtag_current: hashtag},
        ()=>{
            this.makeCallHashtag();
        });
    }
    makeCallHashtag(){
        let page = this.state.page;
        let hashtag = this.state.hashtag_current;
        if(page == 2 && this.state.posts.length < 25) return null;
        cameraCoApi.getPostByHashtag(hashtag, page)
            .then(res=>{
                if(res.status){
                    let posts = res.posts;
                    if(posts.length > 0){
                        this.setState((prevState, props)=>({
                            posts: prevState.posts.concat(posts),
                            page: prevState.page + 1,
                        }));
                    }
                }
            })
            .catch(err=>{
                console.log("err from getpost by hashtag");
                console.log(err);
            });
    }
    renderItemSuggestion(item){
        if(item.photo){
            return (
                <TouchableOpacity style={styles.container_item_suggestion}
                    onPress={()=>this.goUserProfile(item.uid)}>
                    <Image
                        style={styles.user_picture}
                        source={{uri: item.photo}}
                    />
                    <Text style={styles.txt_item_suggestion}>{item.username}</Text>
                </TouchableOpacity>
            );
        }else if(item.value){
            return (
                <TouchableOpacity style={styles.container_item_suggestion}
                    onPress={()=>this.goHashtagSearch(item.name)}>
                    <LinearGradient style={styles.image_hashtag} colors={['#5CB4DC', '#87E3E3']}>
                        <Image
                            style={styles.icon_hashtag}
                            source={require('../../assets/img/icons/hashtag.png')}
                        />
                    </LinearGradient>
                    <Text style={styles.txt_item_suggestion}>{item.value}</Text>
                </TouchableOpacity>
            );
        }
    }
    goUserProfile(uid_user){
        let user = {
          uid: uid_user,
          showSettings: false,
          photo: 'https://s3.amazonaws.com/fotesapp/profiles/' + uid_user +'.png?date=' + Date.now(),
        }
        this.props.navigation.navigate({
          key:'FeedProfile',
          routeName:'FeedProfile',
          params:{user:user,showSettings:user.showSettings,isBlocked:false}
        });
    }
    render(){
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.container_search_input}>
                        <Image
                            style={styles.icon_search}
                            source={require('../../assets/img/icons/search.png')}
                        />
                        <RNTextInput
                            style={styles.search_input}
                            ref={input => { this.textInput = input }}
                            placeholder="Lyrc"
                            placeholderTextColor= '#C5C5C5'
                            onChangeText={(keySearch) => this.getSuggestions(keySearch)}
                        />
                        <TouchableOpacity onPress={()=> this.clearBox()}
                            style={styles.container_btn_clear}>
                            <Image
                                style={styles.icon_clear}
                                source={require('../../assets/img/icons/closeBlackThin.png')}
                            />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={()=> this.goBack()}
                        style={styles.container_btn_cancel}>
                        <Text style={styles.txt_cancel}>Cancel</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.container_results}>
                    {
                        this.state.is_show_posts ?
                            <PostsGrid
                                {...this.props}
                                posts = {this.state.posts}
                                onRefresh = {()=>this.makeCallHashtag()}
                            />
                        :
                            <FlatList
                                data={this.state.suggestions}
                                extraData={this.state}
                                keyExtractor={ (item, index) => index.toString()}
                                renderItem={({item}) => this.renderItemSuggestion(item)}
                            />
                    }

                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        ...ifIphoneX({
            paddingTop:25
        }, {
            paddingTop: statusBarHeight
        })
    },
    header: {
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        borderBottomColor: '#DBDBDB',
        borderBottomWidth: 1,
    },
    container_search_input:{
        flex: 1,
        paddingTop: 3,
        paddingBottom: 3,
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'row',
        backgroundColor: '#ECECEC',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon_search:{
        width: 16,
        height: 16
    },
    search_input: {
        flex: 1,
        paddingTop: 5,
        paddingBottom: 5,
        fontSize: 14,
        paddingLeft: 7,
        color: '#000000',
      },
    container_btn_clear:{
        backgroundColor: '#C5C5C5',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon_clear:{
        width: 14,
        height: 14,
        tintColor: '#ffffff'
    },
    container_btn_cancel:{
        justifyContent: 'center',
        alignItems: 'center'
    },
    txt_cancel:{
        paddingLeft: 20,
        color: '#757575',
        fontSize: 14
    },
    container_results: {
        flex: 1,
        marginTop: 10,
        paddingBottom: 10
    },
    container_item_suggestion: {
        flexDirection: 'row',
        paddingBottom: 7,
        paddingTop: 7,
        paddingLeft: 25,
        paddingRight: 25,
        alignItems: 'center'
    },
    user_picture:{
        height:44,
        width:44,
        borderRadius:22,
        backgroundColor:'#e9ecef'
    },
    image_hashtag:{
        height:44,
        width:44,
        borderRadius:22,
        backgroundColor:'#e9ecef',
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon_hashtag:{
        width: 20,
        height: 20,
        tintColor: '#ffffff'
    },
    txt_item_suggestion: {
        color: '#000000',
        fontSize: 15,
        fontWeight: 'bold',
        paddingLeft: 15
    }
});
