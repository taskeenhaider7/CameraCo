import React, { Component } from 'react';
import {
  Animated,
  Button,
  Easing,
  Dimensions,
  StyleSheet,
  Image,
  Text,
  View
} from 'react-native';
const {width, height} = Dimensions.get('window');

export default class Template extends Component {
  constructor(params){
    super(params);
    this.state ={
       fadeAnim: new Animated.Value(1),
       widthAnim: new Animated.Value(1),
       animationFinished:false
    }
  }
  componentDidMount(){
    setTimeout(() => {this.startAnimations()}, 500)

  }
  startAnimations(){
    this.animateBackground();
    this.animateImage();
  }
  animateBackground(){
    Animated.timing(
      this.state.fadeAnim,
      {
        toValue: 0,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true

      }
    ).start(this.removeComponent());
  }
  animateImage(){
    Animated.timing(
      this.state.widthAnim,
      {
        toValue: 20,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true
      }
    ).start(this.removeComponent());
  }
  // <Button title="animate" onPress={this.animateBackground()}></Button>
  removeComponent(){
    setTimeout(() => {this.setState({animationFinished:true})}, 500)


  }
  render() {
    if(this.state.animationFinished){
      return (null)
    }else{
      return (

        <Animated.View pointerEvents="none" style={[styles.container,{opacity:this.state.fadeAnim}]}>
          <Animated.Image

              style={{width: 200, height: 200,tintColor:"white",transform: [
                {
                    scale:this.state.widthAnim
                }]
              }}
              source={ require('../assets/img/assets/fotes.png')}
          />
        </Animated.View>

      );
    }

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#ef5d82",
    position:"absolute",
    bottom:0,
    top:0,
    left:0,
    right:0,
    flex:1,
    zIndex:1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
