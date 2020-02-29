import React from 'react';
import { StatusBar,ScrollView,ActivityIndicator, StyleSheet, Platform, Button,Text,Keyboard, Picker,  View, Image, TouchableHighlight, TouchableOpacity, Alert, TextInput,Linking, AsyncStorage, FlatList, Dimensions, KeyboardAvoidingView,Modal} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
statusBarHeight = getStatusBarHeight();
export default class TypeEditor extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      'note':'',
      'uri':'',
      'thumbnail':'',
      'keyboardVisible':false,
      'shortNoteSection':0,
      'noteIsEmpty':true,
      'latitude':null,
      'longitude':null,
      'hashtags':[],
      'latestHashTags':[],
      'volume':0,
      "isSearchingUser":false,
      'feedIcon': require('../assets/img/icons/world_on.png'),
      'locationIcon': require('../assets/img/icons/location_gray.png'),
      'backgroundColorIcon': require('../assets/img/icons/backgroundColor.png'),
      'is_public':true,
      'isLogged':false,
      'place':null,
      'placeName':"",
      'backgroundColor':"",
      'fontType':''
    }
  }
  saveState(text){
    _char = text.text[text.text.length - 1];
    this.props.onTextChanged(text);
    if(text.text.trim() == ''){
      this.setState({
        "note":text.text,
        "noteIsEmpty":true,
        "isSearchingUser":false
      })

    }else{
      if((text.text[text.text.length - 1] == "@" )|| (this.state.isSearchingUser) ){
        try{
          _t = text.text;
          _t = _t.split(" ");
          _t.reverse();
            this.setState({"isSearchingUser":true},() => {
              this.usersQuery.updateUserList(_t[0]);
            });
        }catch(ex){
          alert(ex)
        }

      }
      this.setState({
        "note":text.text,
        "noteIsEmpty":false

      })
    }
  }





  componentWillMount(){
    this.currentBackgroundColorIndex = 0;
    this.currentFontTypeIndex = 0;
  }
  componentDidMount(){
    global.NOTE_COMPONENT = this;
    global.NOTE_COMPONENT.NOTE_INTENT = false;

  }
  addHashtag(hashtag){
    // alert(hashtag)
    this.textInput.setNativeProps({ text:this.state.note+ " " + hashtag + " "})
    this.setState({"note":this.state.note + " "+hashtag + " "});
  }

  renderPreview(){
      return (
        <TextInput
            style={[styles.input,
              {backgroundColor:this.state.backgroundColor,fontFamily:this.state.fontType}]}
            multiline={true}
            maxLength={300}
            returnKeyType={"done"}
            onSubmitEditing={() =>{Keyboard.dismiss()}}
            placeholder={"Say something..."}
            placeholderTextColor={'white'}
            ref={element => {
                  this.textInput = element
                }}
            onChangeText={(text) => this.saveState({text})}
            value={this.state.note}
          />
      )
  }


  _onUserSelected(user){
    _words = this.state.note.split(" ").reverse()
    for (var i = 0; i < _words.length; i++) {
      if(_words[i].startsWith("@")){
        _words[i] = "@"+user.username
        break;
      }
    }
    _words = _words.reverse().join(" ") + " ";
    this.textInput.setNativeProps({ text:_words})
    this.setState({isSearchingUser:false,"note":_words},() => {
      this.forceUpdate();
    });
  }

  changeBackgroundColor(){
    if(this.currentBackgroundColorIndex > 8){
      this.currentBackgroundColorIndex = 0;
      this.currentFontTypeIndex = 0;
    }
    _fonts =['Lato-Light','Snell Roundhand','system font','American Typewriter','Overpass',
            'SF Cartoonist Hand','Savoye LET','StardosStencil-Regular','AvenirNext-Bold'];
    _bgColors = ["#f24e86","#86B8D9","#869CD9","#9286D9","#C486D9","#D986A3","#D98686","#EBAA54","#000000"];
    if(this.currentBackgroundColorIndex != -1){
      this.setState({
        "backgroundColor":_bgColors[this.currentBackgroundColorIndex],
        'fontType':_fonts[this.currentFontTypeIndex]
      })
    }
    this.props.onColorChanged(this.currentBackgroundColorIndex);
    this.currentBackgroundColorIndex += 1;
    this.currentFontTypeIndex += 1;
  }

  changeFont(){
    if(this.currentFontTypeIndex > 8){
      this.currentFontTypeIndex = 0;
    }
    _fonts =['Lato-Light','Snell Roundhand','system font','American Typewriter','Overpass',
            'SF Cartoonist Hand','Savoye LET','StardosStencil-Regular','AvenirNext-Bold'];
    if(this.currentFontTypeIndex != -1){
      this.setState({
        'fontType':_fonts[this.currentFontTypeIndex]
      })
    }
    this.props.onFontChanged(this.currentFontTypeIndex);
    this.currentFontTypeIndex += 1;
  }

  // <Text disabled={!this.state.noteIsEmpty} style={[styles.saveButton,  this.state.keyboardVisible ? {height:30} : {height:0},this.state.noteIsEmpty ? {color:'gray'} : {color: '#128BDA'}]}   onPress={this.onPressSave.bind(this)}>Save</Text>

  render() {
    if(this.currentBackgroundColorIndex == 0){
      return (null);
    }else{
      return (
        <View style={{flex:1,backgroundColor:this.state.backgroundColor}}>
        {this.renderPreview()}


        </View>

      );
    }

  }



}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  txt_note:{
    flex:1,
    margin: 5,
    fontSize: 18,
    paddingLeft: 5
  },
  closebutton:{
    width:25,height:25,alignSelf: 'flex-end',position:'absolute',backgroundColor:'transparent'
  },
  saveBar:{
    flexDirection:'row'
  },
  hashTagsList:{
    flex:1,
    flexDirection:'row'
  },
  saveButtonWrapper:{
    justifyContent: 'center',
    alignItems:'center',
    height:30
  },
  saveButton:{
    fontSize:16,
    marginRight:10,
    justifyContent: 'center',
    alignItems:'center'
  },
  extraButtons:{
    flexDirection:'row',
    justifyContent:'flex-end',
    paddingRight:10
  },
  feedButton:{
    alignSelf:'flex-end'
  },
  btn_left:{
    width:40,
    alignItems:'flex-start'
  },
  btn_right:{
    width:40,
    alignItems:'center'
  },
  loc_right:{
    alignItems:'center',
    justifyContent:'center'
  },
  placeName:{
    fontSize:16,
    color:'gray'
  },
  cancelButton:{
    color:"white",
    fontSize:16,
    fontFamily:"Lato-Bold",
  },
  buttonWrapper:{
    width:120,
    flexDirection:"row",
    justifyContent: "space-between",
    alignItems:'center',
    color:"white",
    height:60
  },
  button:{
    width:40,
    height:40,
    tintColor:"white"
  },
  buttonLabel:{
    color:"white",
    fontSize:18
  },
  saveButton:{
    textAlign:"right",
    marginTop:5,
    marginRight:10,
    fontSize:16,
    fontWeight:"bold"
  },
  input:{
    flex:1,
    fontSize:32,
    textAlign:"center",
    color:"white",
    paddingLeft:15,
    paddingRight:15,
    marginBottom:100,
    marginTop: statusBarHeight + 70
  }
});
