import React, { Component } from 'react';
import { StyleSheet,  View, TextInput} from 'react-native';

export default class TextInputHashtag extends Component {
  constructor(props){
    super(props);
    this.state = {
        value_txt: ''
    }
    this.flatList = null;
  }
  onChangeText(text){
      if(text.charAt(text.length - 1) == " "){
        if(text.length > 1){
            this.setState({
                value_txt: '',
            });
            let txt = text.trim();
            txt = txt.charAt(0) == '#' ? txt : '#'+txt;
            this.props.onNewHashtag(txt);
        }
      }else{
        this.setState({
            value_txt: text,
        });
      }
  }
  render() {
    return (
      <View style={styles.container}>
        <TextInput
            placeholderTextColor={"#ffffff"}
            placeholder={'Add topic...'}
            onChangeText={(text) => this.onChangeText(text)}
            value={this.state.value_txt}
            style={styles.txt_input}/>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  txt_input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
});
