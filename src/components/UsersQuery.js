import React, { Component } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import cameraCoApi from "../api/CameraCoApi";
export default class UsersQuery extends Component {
  constructor(props){
    super(props);
    this.state = {
      usernames: []
    }
  }
  updateUserList(q){
    q = q.replace("@","");
    if(q.trim !== ""){
      cameraCoApi.search(q).then((res) => {
         this.setState({usernames:res});
      });
    }else{
      this.setState({usernames:[]},
        () =>{
          this.forceUpdate();

        }
      );
    }

  }
  onUserSelected(item){
      this.setState({usernames:[]},
        () =>{
          this.props.onUserSelected(item);
        }
      );
  }
  renderObject(item){
    // alert(JSON.stringify(item))
    return(
      <TouchableOpacity style={styles.resultsWrapper} onPress={() => this.onUserSelected(item)} >
        <View >
          <Image style={{backgroundColor:"#A5005C",borderRadius:20,height:40,width:40}}
            source={{uri:item.photo}}
          />

        </View>
        <View style={{flex:1,marginLeft:10}}>
          <Text style={{fontSize:16,fontWeight:"bold"}}>{item.name}</Text>
          <Text style={{fontSize:14}}>@{item.username}</Text>
        </View>
      </TouchableOpacity>
    )
  }
  renderSeparator(){
    return (<View style={styles.separator}></View>);
  }
  render() {
    if(this.state.usernames.length > 0){
      return (
        <View style={styles.container}>
          <FlatList keyboardShouldPersistTaps={"always"}
            data={this.state.usernames}
            renderItem={({item}) => this.renderObject(item)}
            ItemSeparatorComponent={this.renderSeparator}
          />
        </View>
      );
    }else{
      return (null);
    }

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  resultsWrapper:{
    height:50,
    paddingLeft:10,
    paddingRight:10,
    flexDirection:'row'
  },
  separator:{
    flex:1,
    height:2,
    backgroundColor:"#EBEBEB"
  }
});
