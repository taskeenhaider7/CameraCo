import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  FlatList
} from 'react-native';
const duration_animation = 330;
export default class AnimationAudio extends Component {
  constructor(props){
    super(props);
    //this.height = new Array(this.props.metrics.length);
    this.state = {
      width_container: (this.props.metrics.length * 7)
    }
    this.height = this.initArary();
    this.height_two = this.initArary();
  }
  initArary(){
    return this.props.metrics.map((item, index)=>{
      return new Animated.Value(0);
    });
  }
  componentDidMount(){
    this.runAnimations();
  }
  runAnimations(){
    let array_animations = this.props.metrics.map((item, index)=>{
      let value = (item.currentMetering/160) * (-this.props.height);
      value = Math.round(value/2);
      return Animated.parallel([
        Animated.sequence([
          Animated.timing(this.height[index], {
            delay: (item.currentTime * 1000),
            duration: duration_animation,
            toValue: value
          }),
          Animated.timing(this.height[index], {
            duration: duration_animation,
            toValue: 0
          })
        ]),
        Animated.sequence([
          Animated.timing(this.height_two[index], {
            delay: (item.currentTime * 1000),
            duration: duration_animation,
            toValue: value
          }),
          Animated.timing(this.height_two[index], {
            duration: duration_animation,
            toValue: 0
          })
        ])
      ]);
    });
    Animated.parallel(
      array_animations
    ).start(()=>{
      if(this.props.isPlaying){
        this.runAnimations();
      }else{
        this.height = this.initArary();
        this.height_two = this.initArary();
      }
    });
  }
  renderItem(item){
    return (
      <View style={styles.container_item}>
        <View style={[styles.container_item_line]}>
          <Animated.View style={[styles.line, styles.item_top, {height: item.item}]}></Animated.View>
        </View>
        <View style={[styles.container_item_line]}>
          <Animated.View style={[styles.line, styles.item_bottom, {height: this.height_two[item.index]}]}></Animated.View>
        </View>
      </View>
    );
  }
  render(){
    //console.log(this.state.height);
    return (
      <View style={[styles.container, {width: this.state.width_container, height: this.props.height}]}>
        <FlatList
          data={this.height}
          horizontal={true}
          keyExtractor={ (item, index) => index.toString()}
          renderItem={(item)=> this.renderItem(item)}
        />
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container:{
    alignSelf: 'center'
  },
  container_item: {
    flex: 1,
  },
  container_item_line: {
    flex: 1,
  },
  item_top: {
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15
  },
  item_bottom:{
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15
  },
  line: {
    width: 5,
    marginLeft: 2,
    backgroundColor: 'white',
  }
});
