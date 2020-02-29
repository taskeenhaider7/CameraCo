import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native';
var width = Dimensions.get('window').width;

export default class FoteProgressBar extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={[styles.progress,{ width: width * (this.props.progress / 100) }]}></View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height:10,
    backgroundColor: '#D2D2D2',
    justifyContent: 'center',
  },
  progress:{
    width:"10%",
    backgroundColor: '#4163a0',
    height:5,
    borderRadius:5,
    borderTopLeftRadius:0,
    borderBottomLeftRadius:0

  }
});
