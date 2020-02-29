import React, { Component } from 'react';
import { ScrollView,Easing,Animated,ActivityIndicator, StyleSheet, Platform, Button,Text, Picker,  View, Image, TouchableHighlight, TouchableOpacity, Alert, TextInput,Linking, AsyncStorage, FlatList, Dimensions, Keyboard,KeyboardAvoidingView,Modal} from 'react-native';
import { TabNavigator, NavigationActions, StackNavigator } from 'react-navigation';
import PropTypes from 'prop-types';

const { width } = Dimensions.get('window');

export default class EffectSelector extends Component {
  constructor(props){
    super(props);
    this.state = {
      selected0:true,
      selected1:false,
      selected2:false,
      selected3:false,
      selected4:false,
      selected5:false,
      selected6:false,
      screenWidth: 0,
    }
  }

  onContentSizeChange = (contentWidth, contentHeight) => {
  // Save the content height in state
    this.setState({ screenWidth: contentWidth });
  };

  renderEffects(){
    const scrollEnabled = this.state.screenWidth > width;

    if(this.props.showEffects){
      return(
        <ScrollView style={styles.containerBtns}
          horizontal={true}
          contentContainerStyle={styles.contentContainer}
          scrollEnabled={scrollEnabled}
          onContentSizeChange={this.onContentSizeChange} >

          <View style={{alignItems:'center', marginRight:50}}>
            <TouchableOpacity onPress={() => this.addEffect0()}
              style={[styles.btnEffect, {backgroundColor:"#f2f2f2"}]}>
              <View style={[styles.selected,this.state.selected0 ? {backgroundColor:'white'} : {backgroundColor:'transparent'}]}>
              </View>
            </TouchableOpacity>
            <Text style={styles.nameEffect}>
              None
            </Text>
          </View>

          <View style={{alignItems:'center', marginRight:50}}>
            <TouchableOpacity onPress={() => this.addEffect1()}
              style={[styles.btnEffect, {backgroundColor:"#d1a857"}]}>
              <View style={[styles.selected,this.state.selected1 ? {backgroundColor:'white'} : {backgroundColor:'transparent'}]}></View>
            </TouchableOpacity>
            <Text style={styles.nameEffect}>
              Sepia
            </Text>
          </View>

          <View style={{alignItems:'center', marginRight:50}}>
            <TouchableOpacity onPress={() => this.addEffect2()}
              style={[styles.btnEffect, {backgroundColor:"#ed38bd"}]}>
              <View style={[styles.selected,this.state.selected2 ? {backgroundColor:'white'} : {backgroundColor:'transparent'}]}></View>
            </TouchableOpacity>
            <Text style={styles.nameEffect}>
              Technicolor
            </Text>
          </View>

          <View style={{alignItems:'center', marginRight:50}}>
            <TouchableOpacity onPress={() => this.addEffect3()}
              style={[styles.btnEffect, {backgroundColor:"#bcbcbc"}]}>
              <View style={[styles.selected,this.state.selected3 ? {backgroundColor:'white'} : {backgroundColor:'transparent'}]}></View>
            </TouchableOpacity>
            <Text style={styles.nameEffect}>
              B&w
            </Text>
          </View>

          <View style={{alignItems:'center', marginRight:50}}>
            <TouchableOpacity onPress={() => this.addEffect4()}
              style={[styles.btnEffect, {backgroundColor:"#58d33f"}]}>
              <View style={[styles.selected,this.state.selected4 ? {backgroundColor:'white'} : {backgroundColor:'transparent'}]}></View>
            </TouchableOpacity>
            <Text style={styles.nameEffect}>
              Nightvision
            </Text>
          </View>

          <View style={{alignItems:'center',marginRight:50}}>
            <TouchableOpacity onPress={() => this.addEffect5()}
              style={[styles.btnEffect, {backgroundColor:"#db580d"}]}>
              <View style={[styles.selected,this.state.selected5 ? {backgroundColor:'white'} : {backgroundColor:'transparent'}]}></View>
            </TouchableOpacity>
            <Text style={styles.nameEffect}>
              Warm
            </Text>
          </View>

          <View style={{alignItems:'center'}}>
            <TouchableOpacity onPress={() => this.addEffect6()}
              style={[styles.btnEffect, {backgroundColor:"#5cb4dc"}]}>
              <View style={[styles.selected,this.state.selected6 ? {backgroundColor:'white'} : {backgroundColor:'transparent'}]}></View>
            </TouchableOpacity>
            <Text style={styles.nameEffect}>
              Cool
            </Text>
          </View>

        </ScrollView>
      )
    }else{
      return null
    }
  }

  addEffect0(){
    if(!this.state.selected0){
      this.setState({selected0:true,selected1:false,selected2:false,selected3:false,
        selected4:false,selected5:false,selected6:false});
      this.props.onEffectPressed(0);
    }
  }

  addEffect1(){
    if(!this.state.selected1){
      this.setState({selected0:false,selected1:true,selected2:false,selected3:false,
        selected4:false,selected5:false,selected6:false});
      this.props.onEffectPressed(1);
    }
  }

  addEffect2(){
    if(!this.state.selected2){
      this.setState({selected0:false,selected1:false,selected2:true,selected3:false,
        selected4:false,selected5:false,selected6:false});
      this.props.onEffectPressed(2);
    }
  }

  addEffect3(){
    if(!this.state.selected3){
      this.setState({selected0:false,selected1:false,selected2:false,selected3:true,
        selected4:false,selected5:false,selected6:false});
      this.props.onEffectPressed(3);
    }
  }

  addEffect4(){
    if(!this.state.selected4){
      this.setState({selected0:false,selected1:false,selected2:false,selected3:false,
        selected4:true,selected5:false,selected6:false});
      this.props.onEffectPressed(4);
    }
  }

  addEffect5(){
    if(!this.state.selected5){
      this.setState({selected0:false,selected1:false,selected2:false,selected3:false,
        selected4:false,selected5:true,selected6:false});
      this.props.onEffectPressed(5);
    }
  }

  addEffect6(){
    if(!this.state.selected6){
      this.setState({selected0:false,selected1:false,selected2:false,selected3:false,
        selected4:false,selected5:false,selected6:true});
      this.props.onEffectPressed(6);
    }
  }

  render() {

    return (
      <View style={[styles.container]}>
        {this.renderEffects()}

      </View>
    );
  }
}

EffectSelector.propTypes = {
  onEffectPressed: PropTypes.func,
  showEffects:PropTypes.bool,
}

// Default values for props
EffectSelector.defaultProps = {
  onEffectPressed:() => {},
  showEffects:false,
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    flexDirection:'row',
    justifyContent:'center',
    backgroundColor:'transparent'
  },
  containerBtns:{
    flex:1,
    flexDirection:'row',
  },
  contentContainer:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    paddingLeft:20,
    paddingRight:20,
  },
  addButton:{
    height:60,
    width:60
  },
  buttonsWrapper:{
    flexDirection:'row',
    marginRight:10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  actionSubButton:{
    marginRight:15
  },
  subButton:{
    height:28,
    width:28,
    tintColor:"white"
  },
  actionButtonNext:{
    height:28,
    width:72,
    borderRadius:20,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:'#f24e86',
  },
  btnEffect:{
    height:40,
    width:40,
    borderRadius:20,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    marginTop:10,
    borderColor:'white',
    borderWidth:4
  },
  selected:{
    height:15,
    width:15,
    borderRadius:7.5,
    backgroundColor:'white'
  },
  nameEffect:{
    fontSize:10,
    paddingTop:10,
    color:'white',
    textAlign:'center'
  }
});
