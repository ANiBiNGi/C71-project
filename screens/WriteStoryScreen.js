import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { Header } from 'react-native-elements'
import db from '../config'
import firebase from 'firebase'

export default class WriteStoryScreen extends React.Component {
  constructor(){
    super()
    this.state = {
      allTransactions: [],
      search:"",
      lastVisibleTransaction: null
    }
  }
  componentDidMount = async()=>{
const query = await db.collection("transactions").get()
query.docs.map((doc)=>{
  this.setState({
    allTransactions:[...this.state.allTransactions, doc.data()]
  })
})
  }

submitStory(){

}

    render() {
      return (
        
        <View>

          <TextInput style={styles.inputBox2}
          placeholder = "Story Title"
           onChangeText = {(text)=>{this.setState({search:text})}}/>
           
          <TextInput style={styles.inputBox2}
          placeholder = "Author"
           onChangeText = {(text)=>{this.setState({search:text})}}/>

          <TextInput style={styles.inputBox} 
          placeholder = "Write your Story"
          onChangeText = {(text)=>{this.setState({search:text})}}/>

          <TouchableOpacity
          style={styles.submitButton}
          onPress={this.submitStory}
          > 
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>

</View>
      );
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    submitButton:{
      backgroundColor: 'pink',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 20,
      textAlign: 'center',
      marginTop: 5,
    },
    inputBox:{
      width: 700,
      height: 500,
      marginTop: 50,
      marginLeft: 150,
      borderWidth: 2,
      fontSize: 20,
      textAlign: 'center',
    },
    inputBox2:{
      width: 500,
      height: 50,
      marginTop: 50,
      marginLeft: 250,
      borderWidth: 2,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    }
  });