import React, { Component } from 'react';
import { StyleSheet,Text,  View, Image, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';

export default class ActionButtons extends Component {
  constructor(props){
    super(props);
    //console.log(global.USER_LOGGED);
    this.state = {
      buttonsVisible: false,
      user: global.USER_LOGGED
    }
  }
  _showButtons(){
      this.setState({buttonsVisible:!this.state.buttonsVisible});
  }
  renderButtons(){
    if(this.state.buttonsVisible || this.props.preview){
      if(this.props.video){
        return(
          <View style={[styles.buttonsWrapper]}>
          {this.renderBtnType()}
          </View>
        )
      }else{
        if(!this.props.preview){
          return(
            <View style={[styles.buttonsWrapper]}>
              {this.renderBtnType()}
            </View>
          )
        }else{
          return(
            <View style={[styles.buttonsWrapper]}>
                {this.renderBtnType()}
            </View>
          )
        }
      }
    }else{
      return(null);
    }
  }


  renderMainBtn(){
    if(this.props.preview){
      return (
        <View style={[styles.container_item_header,{alignItems: 'flex-end'}]}>
          <TouchableOpacity disabled={!this.props.mainBtnEnabled}
            style={[styles.actionButtonNext,this.props.mainBtnEnabled ? {}:{backgroundColor:"gray"}]}
            onPress={this.props.onPressNext}>
            <Text style={{color:'white',fontSize:14,fontWeight:'bold'}}>
              {this.props.mainBtnTxt}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  }


  renderBtnType(){
    if(!this.state.user){
      return null
    }else{
      return(
        <View style={styles.container_item_header}>
          <View style={styles.container_photo}>
            <Image
              style={styles.img_profile}
              source={{uri: this.state.user.photo}}/>
          </View>
        </View>
      )
    }
  }

  renderBtnClose(){
    return (
      <View style={styles.container_item_header}>
        <TouchableOpacity style={styles.shadow}
          onPress={()=>this.props.onClose()}>
          <Image style={styles.icon_close}
            source={require('../assets/img/icons/closeBlack.png')}/>
        </TouchableOpacity>
      </View>
    );
  }
  render() {
    return (
      <View style={[styles.container]}>
        {this.renderBtnClose()}
        {this.renderButtons()}
        {this.renderMainBtn()}
      </View>
    );
  }
}

ActionButtons.propTypes = {
  onEffectPressed: PropTypes.func,
  onPressType: PropTypes.func,
  onPressNext:PropTypes.func,
  video:PropTypes.bool,
  preview:PropTypes.bool,
  mainBtnTxt:PropTypes.string,
  hideTypeBtn:PropTypes.bool
}

// Default values for props
ActionButtons.defaultProps = {
  onEffectPressed:() => {},
  onPressType: () => {},
  onPressNext:() => {},
  video:false,
  preview:false,
  mainBtnTxt:'Next',
  hideTypeBtn:false,
  mainBtnEnabled:true
}
const img_profile_size = 30;
const border_width = 2;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'row',
    height: 40,
    backgroundColor:'transparent'
  },
  container_item_header: {
    flex: 1,
  },
  icon_close:{
    width: 30,
    height: 30,
    tintColor: '#ffffff'
  },
  addButton:{
    height:60,
    width:60
  },
  container_photo: {
    width: img_profile_size,
    height: img_profile_size,
    borderRadius: img_profile_size/2,
    borderColor: '#ffffff',
    borderWidth: border_width
  },
  img_profile:{
    width: img_profile_size-2*border_width,
    height: img_profile_size-2*border_width,
    borderRadius: (img_profile_size-2*border_width)/2
  },
  buttonsWrapper:{
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  actionSubButton:{
    marginRight:25
  },
  subButton:{
    height:28,
    width:28,
    tintColor:"white"
  },
  actionButtonNext:{
    height:30,
    width:72,
    marginTop: 4,
    borderRadius:20,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:'#f24e86',
  },
  shadow:{
    width: 40,
    height: 40,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 2
  },
});
