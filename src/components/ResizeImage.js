import React, { Component } from 'react';
import {Dimensions,Image} from 'react-native';

const { height, width} = Dimensions.get('window');

//This just resize the images taking the width
const ResizeImage = ({source,originalWidth,originalHeight}) => {
  let radio;
  let newWidth;
  let newHeigth;

  if(originalWidth < originalHeight){
    radio = width/originalWidth;
    newWidth = originalWidth * radio;
    newHeigth = originalHeight * radio;
  }else{
    radio = width/originalWidth;
    newWidth = originalWidth * radio;
    newHeigth = originalHeight * radio;
  }
  return(
    <Image style={{width: newWidth,height:newHeigth,backgroundColor:'#e9ecef'}}
           source={{uri: source}}/>
  )
}

export default ResizeImage
