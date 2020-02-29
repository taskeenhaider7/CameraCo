import React, { Component } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
  Image,
  Modal
} from 'react-native';
import PropTypes from 'prop-types';

export default class ModalFollow extends Component {
  constructor(params){
    super(params);
    this.setModal = this.setModal.bind(this);

    this.state = {
      modalVisible:false
    }
  }

  setModal(visible){
   this.setState({modalVisible:visible});
  }

  renderSecondBtn(){
    if(this.props.secondBtnTxt){
      return(
        <TouchableOpacity style={[styles.btn,{borderTopColor:'#f2f2f2',borderTopWidth:1}]}
          onPress={() => this.props.secondBtn()}>
          <Text style={[styles.txtBtn,{color:this.props.secondBtnColor}]}>{this.props.secondBtnTxt}</Text>
        </TouchableOpacity>
      )
    }else{
      return null
    }
  }

  renderThirdBtn(){
    if(this.props.thirdBtnTxt){
      return(
        <TouchableOpacity style={[styles.btn,{borderTopColor:'#f2f2f2',borderTopWidth:1}]}
          onPress={() => this.props.thirdBtn()}>
          <Text style={[styles.txtBtn,{color:this.props.thirdBtnColor}]}>{this.props.thirdBtnTxt}</Text>
        </TouchableOpacity>
      )
    }else{
      return null
    }
  }

  render() {
    return (
        <View style={{backgroundColor:'transparent'}}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
            }}>
            <View style={styles.containerModal}>
              <TouchableWithoutFeedback style={styles.btnHide}
                onPress={() => {
                  this.setModal(!this.state.modalVisible);
                }}>
                <View style={styles.btnHide}>
                </View>
              </TouchableWithoutFeedback>

              <View style={styles.containerBtn}>
                <View style={styles.wrapperBtn}>
                  <TouchableOpacity style={styles.btn}
                    onPress={() => this.props.firstBtn()}>
                    <Text style={[styles.txtBtn,{color:this.props.firstBtnColor}]}>{this.props.firstBtnTxt}</Text>
                  </TouchableOpacity>
                  {this.renderSecondBtn()}
                  {this.renderThirdBtn()}
                </View>

                <TouchableOpacity style={styles.cancelBtn}
                  onPress={() => {
                    this.setModal(!this.state.modalVisible);
                  }}>
                  <Text style={[styles.txtBtn,{fontWeight:'bold',color:'#4286f4'}]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>


    );
  }
}

ModalFollow.propTypes = {
  firstBtnTxt: PropTypes.string,
  firstBtnColor: PropTypes.string,
  firstBtn: PropTypes.func,
  secondBtnTxt: PropTypes.string,
  secondBtnColor: PropTypes.string,
  secondBtn: PropTypes.func,
  thirdBtnTxt: PropTypes.string,
  thirdBtnColor: PropTypes.string,
  thirdBtn: PropTypes.func,

}

// Default values for props
ModalFollow.defaultProps = {
  firstBtnTxt:'Follow',
  firstBtnColor:'#4286f4',
  firstBtn: () => {},
  secondBtnColor:'#4286f4',
  secondBtn: () => {},
  thirdBtnColor:'#4286f4',
  thirdBtn: () => {},
}

const styles = StyleSheet.create({
  containerModal:{
    flex:1,
    backgroundColor:'rgba(0,0,0,0.2)',
  },
  containerBtn:{
    padding:15,
    backgroundColor:'transparent'
  },
  txtBtn:{
    fontSize:18
  },
  btn:{
    height:50,
    // borderRadius:12.5,
    // backgroundColor:'white',
    justifyContent:'center',
    alignItems:'center'
  },
  btnHide:{
    flex:1,
  },
  wrapperBtn:{
    backgroundColor:'white',
    borderRadius:12.5,
  },
  cancelBtn:{
    height:50,
    borderRadius:12.5,
    backgroundColor:'white',
    justifyContent:'center',
    alignItems:'center',
    marginTop:10
  }
});
