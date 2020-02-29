import React, { Component } from 'react';
import { getStatusBarHeight } from 'react-native-status-bar-height';
statusBarHeight = getStatusBarHeight();
import {
  Button,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Text,
  View
} from 'react-native';
import cameraCoApi from "../api/CameraCoApi";
import {  NavigationActions } from 'react-navigation';

export default class PhoneVerificationEntry extends Component {

  constructor(props){
    super(props);
    const {state} = this.props.navigation;

    this.state = {
      code:"",
      isvalid_form:false
    }
  }
  onPressNext(){
    if(this.state.isvalid_form){
      cameraCoApi.verifyCode(this.state.code).then((res) => {
        if(res.success){
          // valided. exit.
          const resetAction = NavigationActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({key:'Fotes', routeName: 'Fotes', params: { page: 1,showLoader:true}})],
                  });
          this.props.navigation.dispatch(resetAction);
        }else{
          alert("The code you entered is invalid")
        }
      });
    }
  }
  skip(){
    const resetAction = NavigationActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({key:'Fotes', routeName: 'Fotes', params: { page: 1,showLoader:true}})],
            });
    this.props.navigation.dispatch(resetAction);
  }
  checkCode(code){
    if(code.length <=3){
      this.setState({isvalid_form:false})
    }else{
      this.setState({isvalid_form:true})

    }
  }
  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.message}>
          <Text style={styles.title}> Phone Verification</Text>
          <Text style={styles.subtitle}>Enter the code you received via SMS.</Text>
        </View>
        <View style={{flexDirection:"row",alignItems:"center"}}>

          <TextInput
            style={styles.input}
            keyboardType={"number-pad"}
            onChangeText={(code) => {this.setState({code:code});this.checkCode(code)}}
            value={this.state.code}
            placeholder="Enter your verification code"
            returnKeyType={"done"}
            onSubmitEditing={() => this.onPressNext()}
            >
           </TextInput>
         </View>
         <Text style={[this.state.isvalid_form ? {color:"green",marginTop:20}:{color:"red",marginTop:20}]}>{this.state.statusMessage}</Text>
         <View style={{flex:.1}}>
         </View>
         <TouchableOpacity onPress={() => this.onPressNext()} activeOpacity={0.6} disabled={!this.state.isvalid_form} title="next" style={[styles.button,this.state.isvalid_form ? {}:{backgroundColor:"#8bb6d4"}]}>
            <Text style={styles.buttonText}>Validate</Text>
          </TouchableOpacity>
          <View style={{flex:.1}}>
          </View>
          <Button title="Skip" onPress={() => this.skip()}></Button>

      </View>
    );
  }
}

const styles = StyleSheet.create({


  container: {
    flex: 1,
    flexDirection:"column",
    backgroundColor: 'white',
    paddingTop:statusBarHeight,
    paddingLeft:20,
    paddingRight:20
  },
  input:{
    borderWidth:1,
    borderColor:'#d4d4d4',
    backgroundColor:"#fafafa",
    height:55,
    borderRadius:5,
    paddingLeft:5,
    paddingRight:5,
    flex:1,
    marginLeft:15

  },
  message:{
    flexDirection:"column",
    justifyContent:"center",
    textAlign:"center",
    flex:.2
  },
  title:{
    fontSize:30,
    textAlign:"center",

  },
  subtitle:{
    fontSize:15,
    textAlign:"center",

  },
  button:{
    height:50,
    backgroundColor:"#44aaf4",
    borderRadius:5,
    flexDirection:"column",
    justifyContent:"center",
    textAlign:"center",


  },
  buttonText:{
    color:"white",
    textAlign:"center",
    fontSize:20
  }

})
