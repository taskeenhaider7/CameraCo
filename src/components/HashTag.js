import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default class HashTag extends Component {

  render() {
    return (
      <TouchableOpacity style={styles.container} onPress={this.props.onPress()}>
      <Text style={styles.text}  >{this.props.hashtag}
      </Text>
      </TouchableOpacity>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderWidth:1,
    height:25,
    borderColor:"#128BDA",
    justifyContent: 'center',
    alignItems:'center',
    alignSelf:'baseline',
    paddingLeft:10,
    paddingRight:10,
    borderRadius:7,
    marginLeft:2.5,
    marginRight:2.5
  },
  text:{
    color:"#838383",
    fontSize:16,

  }
});
