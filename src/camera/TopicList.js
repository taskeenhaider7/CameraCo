import React, { Component } from 'react';
import { StyleSheet,Text,  View, Image, TouchableOpacity, FlatList} from 'react-native';

export default class TopicList extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            topics: []
        }
    }
    deleteItem(index){
        let topics = this.props.topics;
        topics.splice(index, 1);
        this.props.onChange(topics);
    }
    renderItem(item, index){
        return (
            <View style={styles.container_item_hashtag}>
                <Text style={styles.txt_item_hashtag}>{item}</Text>
                <TouchableOpacity
                    onPress={()=>{this.deleteItem(index)}}>
                    <Image
                        source={require('../assets/img/icons/closeBlack.png')}
                        style={styles.icon_close_hashtag}
                    />
                </TouchableOpacity>
            </View>
        );
    }
    render(){
        if(this.props.topics.length == 0){
            return (null);
        }
        return(
            <FlatList
                contentContainerStyle= {{ alignItems: 'flex-end' }}
                data={this.props.topics}
                keyExtractor={ (item, index) => index.toString()}
                renderItem={({item, index})=>this.renderItem(item,index)}
            />
        );
    }
}
const styles = StyleSheet.create({
    container_item_hashtag:{
      flexDirection: 'row',
      paddingLeft: 4,
      paddingRight: 4,
      paddingTop: 2,
      paddingBottom: 2,
      borderColor: '#ffffff',
      borderWidth: 1,
      borderRadius: 20,
      marginTop: 5,
      alignItems: 'flex-end'
    },
    txt_item_hashtag:{
      color: '#ffffff',
      fontSize: 14
    },
    icon_close_hashtag:{
      marginLeft: 3,
      width: 15,
      height: 15,
      tintColor: '#ffffff'
    }
  });
