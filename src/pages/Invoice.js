import React, { Component } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  StatusBar
} from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper'
import { ifIphoneX } from 'react-native-iphone-x-helper'
import { getStatusBarHeight } from 'react-native-status-bar-height';


const statusBarHeight = getStatusBarHeight();


export default class Invoice extends React.Component {
  constructor(props){
    super(props);
    const {state} = this.props.navigation;

    this.state = {
      value:'0',
      title:'Send to ' + state.params.name,
      email:state.params.email,
      newEmail:''
    }
  }

  componentDidMount(){
    const {state} = this.props.navigation;
  }

  _goBack(){
     const {goBack} = this.props.navigation;
     goBack();
  }
  onSendPressed(){
    if(this.state.value != '0'){
      const {state} = this.props.navigation;
      if(this.state.email != this.state.newEmail){
        _i = {"amount":this.state.value,'email':this.state.newEmail};
      }else{
        _i = {"amount":this.state.value,'email':''};
      }
      state.params.onInvoiceCreated(_i);
      this._goBack()
    }
  }
  setValue(number){
    let {value} = this.state;
    if(number == 'del'){
      let index = value.length;

      if(index > 1){
        value = value.slice(0, index-1);
      }else{
        value = '0';
      }
    }else{
      if(value != '0'){
        value = value + number;
      }else{
        value = number;
      }
    }

    this.setState({value});
  }

  validateEmail(email){
    if(email.trim() != ''){
      this.setState({newEmail:email});
    }
  }

  render() {
      return (
        <View style={styles.container}>
          <StatusBar barStyle="light-content"/>

          <View style={styles.topBar}>
            <TouchableOpacity style={styles.wrapperIcon} onPress={() => this._goBack()}>
              <Image style={styles.icon}
                source={require('../assets/img/icons/closeBlack.png')}
              />
            </TouchableOpacity>
            <View style={styles.wrapperTitle}>
              <Text style={styles.mainTitle}>
                {this.state.title}
              </Text>
            </View>

          </View>

          <View style={styles.displayArea}>
            <Text style={styles.cuantity}>$
              <Text style={styles.value}> {this.state.value} </Text>
               USD
            </Text>
            <View style={styles.emailDisplay}>
              <Text style={styles.emailText}>
               Your paypal account {' '}
              </Text>
              <TextInput style={styles.email}
                placeholder={this.state.email}
                placeholderTextColor={'white'}
                onChangeText={(email) => this.validateEmail(email)}
              />
            </View>
          </View>
          <View style={styles.keyboard}>
            <View style={styles.keyRow}>
              <TouchableOpacity onPress={() => this.setValue('1')} style={styles.key}>
                <Text style={styles.number}>1</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.setValue('2')} style={styles.key}>
                <Text style={styles.number}>2</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.setValue('3')} style={styles.key}>
                <Text style={styles.number}>3</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.keyRow}>
              <TouchableOpacity onPress={() => this.setValue('4')} style={styles.key}>
                <Text style={styles.number}>4</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.setValue('5')} style={styles.key}>
                <Text style={styles.number}>5</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.setValue('6')} style={styles.key}>
                <Text style={styles.number}>6</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.keyRow}>
              <TouchableOpacity onPress={() => this.setValue('7')} style={styles.key}>
                <Text style={styles.number}>7</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.setValue('8')} style={styles.key}>
                <Text style={styles.number}>8</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.setValue('9')} style={styles.key}>
                <Text style={styles.number}>9</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.keyRow}>
              <TouchableOpacity onPress={() => this.setValue('.')}style={styles.key}>
                <Text style={styles.number}>.</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.setValue('0')} style={styles.key}>
                <Text style={styles.number}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.setValue('del')} style={styles.key}>
                <Text style={styles.number}>DEL</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.btn} onPress={() => this.onSendPressed()}>
            <Text style={styles.number}>Send</Text>
          </TouchableOpacity>
        </View>
      );
  }

}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor:'#5cb4dc',
    ...ifIphoneX({
            paddingTop:25,
        }, {
            paddingTop: statusBarHeight,
        })
  },
  displayArea:{
    flex:1,
    justifyContent:'space-around',
    alignItems:'center',
  },
  cuantity:{
    fontSize:26,
    color:'white',
  },
  value:{
    fontSize:70
  },
  keyboard:{
    flex:2,
  },
  keyRow:{
    flex:1,
    flexDirection:'row',
  },
  key:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
  },
  number:{
    color:'white',
    fontSize:18,
    fontWeight:'bold'
  },
  btn:{
    height:50,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'rgba(0,0,0,0.1)',
  },
  topBar:{
    flexDirection:'row',
    height:50,
    paddingLeft:20,
    paddingRight:20,
  },
  wrapperIcon:{
    width:50,
    justifyContent:'center',
  },
  icon:{
    height:36,
    width:36,
    tintColor:'white'
  },
  mainTitle:{
    fontSize:20,
    color:'white',
    fontWeight:'bold',
    alignSelf:'center',
  },
  wrapperTitle:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    paddingRight:50,
  },
  emailDisplay:{
    height:30,
    flexDirection:'row',
    alignItems:'center',
  },
  emailText:{
    color:'white',
    fontSize:16,
  },
  email:{
    color:'white',
    fontSize:16,
  }
});
