import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, KeyboardAvoidingView, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config'

export default class ReadStoryScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal',
        transactionmessage: ''
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }
initiatebookissue = async()=>{
db.collection("transactions").add({
  "studentId":this.state.scannedStudentId,
  "bookId":this.state.scannedBookId,
  "date":firebase.firestore.Timestamp.now().toDate(),
  "transactionType":"issue"
})
db.collection("books").doc(this.state.scannedBookId).update({
  "bookAvailability": false
})
db.collection("students").doc(this.state.scannedStudentId).update({
  "numberOfBooksIssued": firebase.firestore.FieldValue.increment(1)
})
this.setState({
  scannedBookId:" ",
  scannedStudentId:" "
})
}
initiatebookreturn = async()=>{
  db.collection("transactions").add({
    "studentId":this.state.scannedStudentId,
    "bookId":this.state.scannedBookId,
    "date":firebase.firestore.Timestamp.now().toDate(),
    "transactionType":"return"
  })
  db.collection("books").doc(this.state.scannedBookId).update({
    "bookAvailability": true
  })
  db.collection("students").doc(this.state.scannedStudentId).update({
    "numberOfBooksIssued": firebase.firestore.FieldValue.increment(-1)
  })
  this.setState({
    scannedBookId:" ",
    scannedStudentId:" "
  })
}
    handleTransaction=async()=>{
      //var transactionmessage
      var transactionType = await this.checkbookEligibility()
      if(!transactionType){
    Alert.alert("This book doesn't exist :(")
    this.setState({
      scannedStudentId: "",
      scannedBookId: ""
    })
      }
      else if(transactionType === "Issue"){
        var isStudentEligible = await this.checkstudentEligibilityforbookissue()
        if(isStudentEligible){
          this.initiatebookissue()
          Alert.alert("This book has been issued!")
        }
      }
      else{
        var isStudentEligible = await this.checkstudentEligibilityforbookreturn()
        if(isStudentEligible){
          this.initiatebookreturn()
          Alert.alert("This book has been returned!")
        }
      }
    }

    checkstudentEligibilityforbookissue=async()=>{
      const studentref = await db.collection("students").where("studentId","==",this.state.scannedStudentId).get()
      var isStudentEligible = ""
      if(studentref.docs.length==0){
        Alert.alert("This student doesn't exist :(")
        this.setState({
          scannedStudentId: "",
          scannedBookId: ""
        })
        isStudentEligible = false;
      }
      else{
        studentref.docs.map((doc)=>{
          var student = doc.data()
          if(student.numberOfBooksIssued < 2){
            isStudentEligible = true;
          }
          else{
            isStudentEligible = false;
            Alert.alert("This student has already issued 2 books")
            this.setState({
            scannedStudentId: "",
            scannedBookId: ""
          })
          }
        })
      }
return isStudentEligible

    }

    checkstudentEligibilityforbookreturn=async()=>{
      const transactionref = await db.collection("transactions").where("bookId","==",this.state.scannedBookId).limit(1).get()
      var isStudentEligible = "";
      transactionref.docs.map((doc)=>{
        var lastBook = doc.data()
        if(lastBook.studentId === this.state.scannedStudentId){
          isStudentEligible = true
        }
        else{
          isStudentEligible = false
          Alert.alert("This book wasn't issued by this student :(")
          this.setState({
            scannedStudentId: "",
            scannedBookId: ""
          })
        }
      })
      return isStudentEligible
    }

    checkbookEligibility=async()=>{
      const bookref = await db.collection("books").where("bookId","==",this.state.scannedBookId).get()
      var isTransactionType = "";
      if(bookref.docs.length==0){
        isTransactionType = false
      }
      else{
        bookref.docs.map((doc)=>{
          var book = doc.data()
          if(book.bookAvailability){
            isTransactionType = "Issue"
          }
          else{
            isTransactionType = "Return"
          }
        })
      }
      return isTransactionType
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={text=>this.setState({
                scannedBookId: text
              })}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText={text=>this.setState({
                scannedStudentId: text
              })}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={async()=>{this.handleTransaction()}} style={{
              backgroundColor:'pink',
              width: 150,
              height: 50
            }}>
              <Text style ={{
                fontSize: 25,
                textAlign: 'center',
                fontWeight: 'bold',
                marginTop: 5
              }}>Submit</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        );
      }
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
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    }
  });