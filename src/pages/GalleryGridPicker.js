import React, { Component } from 'react';
import {
  CameraRoll,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  View
} from 'react-native';

export default class GalleryGridPicker extends Component {
  _keyExtractor = (item, index) => index;
  getFiles(){
    CameraRoll.getPhotos({
    first: 40,
    assetType: 'Photos',
  })
  .then(r => {
    this.setState({ photos: r.edges });
  })
  .catch((err) => {
     //Error Loading Images
  });
  }
  constructor(params){
    super(params);
    this.state = {
      photos:[]
    }
  }
  componentDidMount(){
    this.getFiles();
  }
  refreshFiles(){
    this.getFiles();
  }
  _onImagePicked(item){
    this.props.onImagePicked(item);
  }
  renderItem(item){
    return(
      <TouchableOpacity style={{flex:1,height:200}} onPress={() => this._onImagePicked(item)}>
        <Image
          style={{
            flex:1,
            height:200,
            backgroundColor:"gray",
            borderColor:"black",
            borderWidth:1
          }}
          source={{uri: item.item.node.image.uri}}
        />
      </TouchableOpacity>
      )
  }
  render() {
    return (
      <View style={styles.container}>
      <FlatList
          data={this.state.photos}
          numColumns={2}
          style={{ flexDirection: 'column',zIndex:0}}
          keyExtractor={this._keyExtractor}
          renderItem={(item) => this.renderItem(item)}
      />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item:{
    height:200,
    width:200,
  }
});
