import React, { Component } from 'react';
import { StyleSheet,Text,  View, Image, TouchableOpacity, FlatList, Keyboard, Animated} from 'react-native';
import TextInputHashtag from './TextInputHashtag';
export default class AddTopic extends Component {
  constructor(props){
    super(props);
    this.state = {
        hashtags: [],
    }
    this.flatList = null;
    this.bottomView =  new Animated.Value(30);
  }
  componentDidMount () {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
  }
  componentWillUnmount () {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }
  deleteItem(index){
    let hashtags = this.state.hashtags;
    hashtags.splice(index, 1);
    this.setState({
        hashtags: hashtags
    });
  }
  _keyboardDidShow(event) {
    Animated.timing(this.bottomView, {
        duration: event.duration,
        toValue: event.endCoordinates.height +20,
    }).start();
  }
  _keyboardDidHide(event) {
    Animated.timing(this.bottomView, {
        duration: event.duration,
        toValue: 30,
    }).start();
  }
  renderItem(item, index){
    return (
        <View style={styles.container_item_hashtag}>
            <Text style={styles.txt_item_hashtag}>{item}</Text>
            <TouchableOpacity style={{justifyContent: 'center'}}
                onPress={()=>{this.deleteItem(index)}}>
                <Image
                    source={require('../assets/img/icons/closeBlack.png')}
                    style={styles.icon_close_hashtag}
                />
            </TouchableOpacity>
        </View>
    );
  }
  renderHashtag(){
    if(this.state.hashtags.length == 0){
        return (
            <Image
                source={require('../assets/img/icons/hashtag.png')}
                style={styles.icon_hashtag}
            />
        );
    }
    return(
        <View style={{flex: 1}}>
            <FlatList
                ref={ref => this.flatList = ref}
                onContentSizeChange={() => this.flatList.scrollToEnd({animated: true})}
                horizontal={true}
                data={this.state.hashtags}
                keyExtractor={ (item, index) => index.toString()}
                renderItem={({item, index})=>this.renderItem(item,index)}
            />
        </View>
    );
  }
  onNewHashtag(hashtag){
    let hashtags = this.state.hashtags;
    hashtags.push(hashtag);
    this.setState({
        hashtags: hashtags
    });
  }
  render() {
    return (
        <View style={styles.container}>
            <View style={styles.container_input_hashtag}>
                {this.renderHashtag()}
                <TextInputHashtag
                    onNewHashtag={(hashtag)=> {this.onNewHashtag(hashtag)}}/>
            </View>
            <Animated.View style={[styles.footer, {bottom: this.bottomView}]}>
                <TouchableOpacity style={styles.container_btn}
                  onPress={()=>this.props.onContinue(this.state.hashtags)}>
                    <Text style={styles.txt_btn}>CONTINUE</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    bottom: 10,
    backgroundColor:'transparent',
    zIndex: 7
  },
  container_input_hashtag:{
    alignSelf: 'center',
    flexDirection: 'row',
    width: 300,
    padding: 15,
    borderRadius: 30,
    borderColor: '#ffffff',
    borderWidth: 2
  },
  footer:{
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 20,
  },
  container_btn:{
    width: 150,
    alignSelf: 'center',
    borderRadius: 20,
    backgroundColor: '#f24e86',
    padding: 10
  },
  txt_btn:{
    fontSize: 15,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  txt_input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  container_item_hashtag:{
    flexDirection: 'row',
    paddingLeft: 4,
    paddingRight: 4,
    borderColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 20,
    marginLeft: 2,
  },
  txt_item_hashtag:{
    color: '#ffffff',
    fontSize: 14
  },
  icon_hashtag:{
    marginLeft: 10,
    marginRight: 10,
    width: 16,
    height: 16,
    tintColor: '#ffffff'
  },
  icon_close_hashtag:{
    marginLeft: 3,
    width: 14,
    height: 14,
    tintColor: '#ffffff'
  }
});
