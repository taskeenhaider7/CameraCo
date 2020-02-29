import React, { Component } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  Image,
  View
} from 'react-native';
const {width, height} = Dimensions.get('window');
export default class Template extends Component {
 constructor(params){
   super(params);
   this.state = {
      cloudAnim1: new Animated.Value(width),
      cloudAnim2: new Animated.Value(width),
      cloudAnim3: new Animated.Value(width),

   }
 }
 componentDidMount(){
     this.animateCloud1();
     this.animateCloud2();
     this.animateCloud3();

 }
 resetCloud1(){
   Animated.timing(
     this.state.cloudAnim1,
     {
       toValue: width,
       duration: 1,
       easing: Easing.linear,
     }
   ).start(event => {
      if (event.finished) {
        this.animateCloud1();
      }
   });
 }
 animateCloud1(){
     Animated.timing(
       this.state.cloudAnim1,
       {
         toValue: - 800,
         duration: 10000,
         easing: Easing.linear,
       }
     ).start(event => {
        if (event.finished) {
          this.resetCloud1();
        }
     });
 }
 resetCloud2(){
   Animated.timing(
     this.state.cloudAnim2,
     {
       toValue: width,
       duration: 1,
       easing: Easing.linear,
     }
   ).start(event => {
      if (event.finished) {
        this.animateCloud2();
      }
   });
 }
 animateCloud2(){
     Animated.timing(
       this.state.cloudAnim2,
       {
         toValue: - 800,
         duration: 15000,
         easing: Easing.linear,
       }
     ).start(event => {
        if (event.finished) {
          this.resetCloud2();
        }
     });
 }
 resetCloud3(){
   Animated.timing(
     this.state.cloudAnim3,
     {
       toValue: width,
       duration: 1,
       easing: Easing.linear,
     }
   ).start(event => {
      if (event.finished) {
        this.animateCloud3();
      }
   });
 }
 animateCloud3(){
     Animated.timing(
       this.state.cloudAnim3,
       {
         toValue: - 800,
         duration: 20000,
         easing: Easing.linear,
       }
     ).start(event => {
        if (event.finished) {
          this.resetCloud3();
        }
     });
 }
 render() {
    return (
      <Animated.View style={[styles.container]} pointerEvents="none" >
        <Animated.Image
            width={200} height={200}
            source={ require('../assets/img/assets/clouds1.png')}
            style={{
              opacity:0.6,
              transform: [
                {
                    translateX:this.state.cloudAnim1
                }
              ]
            }}
        />
        <Animated.Image
            width={200} height={200}
            source={ require('../assets/img/assets/clouds2.png')}
            style={{
              opacity:0.4,
              transform: [
                {
                    translateX:this.state.cloudAnim2
                }
              ]
            }}
        />
        <Animated.Image
            width={200} height={200}
            source={ require('../assets/img/assets/clouds3.png')}
            style={{
              opacity:0.6,
              transform: [
                {
                    translateX:this.state.cloudAnim3

                }
              ]
            }}
        />
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    bottom:0,
    top:0,
    left:0,
    right:0,
    zIndex:2,
    position:"absolute",
    justifyContent:"space-between"
  }
});
