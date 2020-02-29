import { AsyncStorage } from 'react-native';
import * as mime from 'react-native-mime-types';
var RNFS = require('react-native-fs');
import RNFetchBlob from 'react-native-fetch-blob'
const { config, fs } = RNFetchBlob;
import {CameraRoll} from 'react-native';
let PictureDir = fs.dirs.PictureDir;
var cameraCoApi ={
  uploadStatus: "",
  uploadPercentage : 0.0,
  onUploadProgressEvent:null,

  getMe(){
    var url = 'https://www.cameraco.org/api/me';
    return fetch(url).then((res) => res.json());
  },
  requestRestPassword(email, callback){
    let body = "email="+email;
    var url = 'https://www.cameraco.org/reset_password';
    return fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return callback(false, responseJson)
    })
    .catch((error) => {
      return callback(true, error);
    });
  },
  sendRequestVerifyEmail(){
    var url = 'https://www.cameraco.org/api/me/email_verification';
    return fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: ''
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return error;
    });
  },
  search(username){
    var url = 'https://www.cameraco.org/users/search?username='+username;
    return fetch(url).then((res) => res.json());
  },
  getSuggestions(keyword){
    var url = 'https://www.cameraco.org/api/searchkey?word='+keyword;
    return fetch(url).then((res) => res.json());
  },
  getPostByHashtag(hashtag, page){
    var url = 'https://www.cameraco.org/api/fotes/hashtag?hashtag='+hashtag+'&page='+page;
    url = encodeURI(url);
    return fetch(url).then((res) => res.json());
  },
  feedMe(){
    var url = 'https://www.cameraco.org/feed/me';
    return fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return "error";
    });
  },
  getNotifications(){
    var url = 'https://www.cameraco.org/api/notifications';
    return fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return "error";
    });
  },
  followers(uid){
    var url = 'https://www.cameraco.org/api/users/'+uid+'/followers';
    return fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return "error";
    });
  },
  following(uid){
    var url = 'https://www.cameraco.org/api/users/'+uid+'/following';
    return fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return "error";
    });
  },
  getUser(uid){
    var url = 'https://www.cameraco.org/api/users/'+uid;
    return fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return "error";
    });
  },
  logout(){
    return fetch('https://www.cameraco.org/users/logout?is_app=1', {
      method: 'GET',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return true;
    })
    .catch((error) => {
      return false;
    });
  },
  update_token(token){
    _body = "token="+token;
    return fetch('https://www.cameraco.org/notifications/update_token', {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: _body
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return error;
    });

  },
  check_email(email){
    _body = "email="+email;
    return fetch('https://www.cameraco.org/api/users/check_email', {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: _body
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return error;
    });

  },
  sendSMS(countryCode,phone){
    _body = "countryCode="+countryCode+"&phone="+phone;
    return fetch('https://www.cameraco.org/api/me/phone_verification', {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: _body
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return error;
    });

  },
  verifyCode(code){
    _body = "code="+code;
    return fetch('https://www.cameraco.org/api/me/phone_verification/verify', {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: _body
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return error;
    });

  },
  check_username(username){
    _body = "username="+username;
    return fetch('https://www.cameraco.org/api/users/check_username', {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: _body
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return error;
    });

  },
  login(email,password){
    _body = "email="+email+"&password="+password
    return fetch('https://www.cameraco.org/users/login', {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: _body
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return error;
    });

  },
  loginFb(fbToken){
    _body = "fbtoken="+fbToken;
    return fetch('https://www.cameraco.org/users/login/fb', {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: _body
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return error;
    });

  },
  signUp(name,email,username,pwd){
    return fetch('https://www.cameraco.org/users/create',{
      method: 'POST',
      body:'name='+name+'&email='+email+'&username='+username+'&password='+pwd,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
async uploadProfilePhoto(_uri,didFinish){
  _mime = mime.lookup(_uri);
  _uri = _uri.replace("file://","")
  _data = RNFetchBlob.wrap(_uri)
  RNFetchBlob.config({trusty:true,session : 'foteuser'}).fetch('POST', 'https://www.cameraco.org/profile/update_photo', {
    'Content-Type' : 'multipart/form-data',
  }, [
    { name : 'file', filename : _uri, type:_mime, data:  _data},


  ]).then((resp) => {
    // ...
    // alert(JSON.stringify(resp));
    // alert("Profile photo updated.");
    didFinish();
  }).catch((err) => {
    // ...
    didFinish();

    alert("Sorry, we couldn't upload your profile photo.");
  });

 },
  async uploadFote(fote){
    _media = {}
    fote.uri = fote.uri.replace("file://","");
    if(fote.uri != ""){
      _uris  = fote.uri.split("/");
      _fn    = _uris[_uris.length -1];
      _uri = RNFS.DocumentDirectoryPath + "/"+_fn;
      _mime = mime.lookup(_uri);
      _media = { name : 'media', filename : _uri, type:_mime, data:  RNFetchBlob.wrap(_uri)};
      fote.uri = _uri;
    }
    RNFetchBlob.config({trusty:true,session : 'foteuser'}).fetch('POST', 'https://www.cameraco.org/fotes/upload', {
      'Content-Type' : 'multipart/form-data',
    }, [
      _media,
      { name : 'fote', data : JSON.stringify(fote)}

    ]).uploadProgress((written, total) => {
        _p = (written / total) * 100;
        cameraCoApi.uploadPercentage = _p;
        if(cameraCoApi.onUploadProgressEvent !=null){
          cameraCoApi.onUploadProgressEvent(_p,fote);
        }
        cameraCoApi.uploadStatus = "Uploading";

    }).then((resp) => {
      // ...
      if(cameraCoApi.onUploadProgressEvent !=null){
        cameraCoApi.onUploadProgressEvent(100,fote);
      }
      cameraCoApi.uploadStatus = "Done";

    }).catch((err) => {
      // ...
      cameraCoApi.uploadStatus = "Error";
      alert("Sorry, we couldn't upload your Post.");
    });
  },
  async uploadAudioCaption(fote){
    let arrayPOST = [];
    if(fote.uri != ""){
      //console.log(fote.uri);
      fote.uri = fote.uri.replace("file://","");
      //console.log(fote.uri);
      //_uris  = fote.uri.split("/");
      let fn_image    = fote.uri;
      let uri_image = RNFS.DocumentDirectoryPath + "/"+fn_image;
      let mime_image = mime.lookup(uri_image);
      arrayPOST.push({ name : 'photo_fote', filename : uri_image, type: mime_image, data:  RNFetchBlob.wrap(uri_image)})
      fote.uri = uri_image;
    }
    if(fote.audio != "" && fote.audio != undefined && fote.audio != null){
      let uris_audio  = fote.audio.split("/");
      let fn_audio    = uris_audio[uris_audio.length -1];
      let uri_audio = RNFS.DocumentDirectoryPath + "/"+fn_audio;
      let mime_audio = mime.lookup(fote.audio);
      let audioNoteURL = fote.audio.replace("file://","");
      arrayPOST.push({ name : 'audio_fote', filename : uri_audio, type:mime_audio, data:  RNFetchBlob.wrap(audioNoteURL)});
    }
    arrayPOST.push({ name : 'fote', data : JSON.stringify(fote)});
    //console.log("arrayPOST save audio caption");
    //console.log(arrayPOST);
    RNFetchBlob.config({trusty:true,session : 'foteuser'}).fetch('POST', 'https://www.cameraco.org/fotes/upload/audiocaption', {
      'Content-Type' : 'multipart/form-data',
    }, arrayPOST ).uploadProgress((written, total) => {
        _p = (written / total) * 100;
        cameraCoApi.uploadPercentage = _p;
        if(cameraCoApi.onUploadProgressEvent !=null){
          cameraCoApi.onUploadProgressEvent(_p,fote);
        }
        cameraCoApi.uploadStatus = "Uploading";

    }).then((resp) => {
      // ...
      console.log("resp successful to save audio caption");
      console.log(resp);
      if(cameraCoApi.onUploadProgressEvent !=null){
        cameraCoApi.onUploadProgressEvent(100,fote);
      }
      cameraCoApi.uploadStatus = "Done";

    }).catch((err) => {
      // ...
      console.log("error to save audio caption");
      console.log(err);
      cameraCoApi.uploadStatus = "Error";
      alert("Sorry, we couldn't upload your Post.");
    });
  },
  async uploadFoteWithAudio(fote,audioNoteURL){
    _media = {}
    console.log("fote:"+fote);
    console.log("audioNoteURL:"+audioNoteURL);
    _uris  = audioNoteURL.split("/");
    _fn    = _uris[_uris.length -1];
    _uri = RNFS.DocumentDirectoryPath + "/"+_fn;
    _mime = mime.lookup(audioNoteURL);
    audioNoteURL = audioNoteURL.replace("file://","");
    console.log(_mime);

    _media = { name : 'media', filename : _uri, type:_mime, data:  RNFetchBlob.wrap(audioNoteURL)};
    fote.uri = audioNoteURL;
    RNFetchBlob.config({trusty:true,session : 'foteuser'}).fetch('POST', 'https://www.cameraco.org/fotes/upload', {
      'Content-Type' : 'multipart/form-data',
    }, [
      _media,
      { name : 'fote', data : JSON.stringify(fote)}

    ]).uploadProgress((written, total) => {
        _p = (written / total) * 100;
        cameraCoApi.uploadPercentage = _p;
        if(cameraCoApi.onUploadProgressEvent !=null){
          cameraCoApi.onUploadProgressEvent(_p);
        }
        cameraCoApi.uploadStatus = "Uploading";

    }).then((resp) => {
      console.log(JSON.stringify(resp));
      // ...
      if(cameraCoApi.onUploadProgressEvent !=null){
        cameraCoApi.onUploadProgressEvent(100);
      }
      cameraCoApi.uploadStatus = "Done";

    }).catch((err) => {
      // ...
      cameraCoApi.uploadStatus = "Error";
      alert("Sorry, we couldn't upload your Fote.");
    });
  },
  async uploadType(fote){

    // alert(JSON.stringify(fote))
    //
    // RNFetchBlob.config({trusty:true,session : 'foteuser'}).fetch('POST', 'https://www.cameraco.org/fotes/upload/type', {
    //   'Content-Type' : 'multipart/form-data',
    // }, [
    //
    //   { name : 'fote', data : JSON.stringify(fote)}
    //
    // ]).then((resp) => {
    //   // ...
    //    alert(JSON.stringify(resp));
    // }).catch((err) => {
    //   // ...
    //   alert(JSON.stringify(err));
    //
    //   // alert(err)
    //   alert("Sorry, we couldn't upload your Fote.");
    // });
    return fetch('https://www.cameraco.org/fotes/upload/type',{
      method: 'POST',
      body:'fote='+JSON.stringify(fote),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  addLike(idFote){
    return fetch('https://www.cameraco.org/fotes/like',{
      method: 'POST',
      body:'idFote='+idFote,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  removeLike(idFote){
    return fetch('https://www.cameraco.org/fotes/unlike',{
      method: 'POST',
      body:'idFote='+idFote,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  getComments(idFote){
    var url = 'https://www.cameraco.org/fotes/'+idFote;
    return fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return false;
    });
  },
  addComment(idFote,comment){
    return fetch('https://www.cameraco.org/fotes/comment',{
      method: 'POST',
      body:'idFote='+idFote+'&comment='+comment,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  getFote(idFote){
    var url = 'https://www.cameraco.org/foteinfo/'+idFote;
    return fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return false;
    });
  },
  getPlaces(latitude,longitude){
    var url = 'https://www.cameraco.org/places/search?lat='+latitude+'&lon='+longitude;
    return fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return false;
    });
  },
  searchPlace(name){
    var url = 'https://www.cameraco.org/places/search?name='+name;
    return fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return false;
    });
  },
  placeDetails(id){
    var url = 'https://www.cameraco.org/places/details/'+id;
    return fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return false;
    });
  },
  getFotesByPlaceId(place_id){
    var url = "https://www.cameraco.org/fotes/search_by_place_id/"+place_id
    return fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return false;
    });
  },
  createConversation(uid){
    return fetch('https://www.cameraco.org/dms/create',{
      method: 'POST',
      body:'uid='+uid,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  getUserProfile(id_user){
    return fetch('https://www.cameraco.org/profile/user/'+id_user,{
      method: 'GET',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  getConversation(conversationId){
    return fetch('https://www.cameraco.org/dms/'+conversationId,{
      method: 'GET',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  getConversations(){
    return fetch('https://www.cameraco.org/dms/',{
      method: 'GET',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  getConversation(dmid){
    return fetch('https://www.cameraco.org/dms/'+dmid,{
      method: 'GET',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  sendMessageWithMedia(conversationId,message,mediaUri,onUploadProgress,onFinish){
    _media   = {}
    if(mediaUri != null){
      mediaUri = mediaUri.replace("file://","");
      _mime = mime.lookup(mediaUri);
      _media = { name : 'media', filename : mediaUri, type:_mime, data:  RNFetchBlob.wrap(mediaUri)};
    }

    RNFetchBlob.config({trusty:true,session : 'foteuser'}).fetch('POST', 'https://www.cameraco.org/dms/'+conversationId+'/send', {
      'Content-Type' : 'multipart/form-data',
    }, [
      _media,
      { name : 'message', data : message}

    ]).uploadProgress((written, total) => {
        _p = (written / total) * 100;
        // cameraCoApi.uploadPercentage = _p;
        // if(cameraCoApi.onUploadProgressEvent !=null){
        //   cameraCoApi.onUploadProgressEvent(_p);
        // }
        // cameraCoApi.uploadStatus = "Uploading";
        if(onUploadProgress != null){
          onUploadProgress(_p)
        }

    }).then((resp) => {
      onFinish(resp);
      // ...
      // if(cameraCoApi.onUploadProgressEvent !=null){
      //   cameraCoApi.onUploadProgressEvent(100);
      // }
      // cameraCoApi.uploadStatus = "Done";
    }).catch((err) => {
      onFinish(err);
      // ...
      // cameraCoApi.uploadStatus = "Error";
    });
  },
  sendMessage(conversationId, message, reply){
    let body = {
      message: message
    }
    if(reply){
      body.reply = JSON.stringify(reply);
    }
    return fetch('https://www.cameraco.org/dms/'+conversationId+'/send',{
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  sendInvoice(conversationId,amount,email){
    return fetch('https://www.cameraco.org/dms/'+conversationId+'/send_invoice',{
      method: 'POST',
      body:'amount='+amount+'email='+email,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  foteEventInteraction(foteId,interaction){
    return fetch('https://www.cameraco.org/fotes/'+foteId+'/event/interact',{
      method: 'POST',
      body:'interaction='+interaction,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  foteTaskInteraction(foteId,interaction){
    return fetch('https://www.cameraco.org/fotes/'+foteId+'/task/interact',{
      method: 'POST',
      body:'interaction='+interaction,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  foteTripInteraction(foteId,interaction){
    return fetch('https://www.cameraco.org/fotes/'+foteId+'/trip/interact',{
      method: 'POST',
      body:'interaction='+interaction,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  getUserFotes(uid){
    var url = 'https://www.cameraco.org/users/'+ uid +'/fotes';
    return fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      return false;
    });
  },
  deleteMsg(conversationId,creationDate){
    return fetch('https://www.cameraco.org/dms/'+conversationId+'/delete_msg',{
      method: 'POST',
      body:'timestamp='+creationDate,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  deleteFote(foteId){
    return fetch('https://www.cameraco.org/fotes/'+foteId+'/delete',{
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  follow(userId){
    return fetch('https://www.cameraco.org/users/'+userId+'/follow',{
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  unfollow(userId){
    return fetch('https://www.cameraco.org/users/'+userId+'/unfollow',{
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },

  downloadFile(url){
    d = new Date().getTime();
    if(url.includes(".mov")){
      _filename = "file_"+d+".mov";
      _type     = "video";
      _msg      = "Video saved to your Library"
    }else{
      _filename = "file_"+d+".png";
      _type     = "photo";
      _msg      = "Image saved to your Library"
    }
    let dirs = RNFetchBlob.fs.dirs
    RNFetchBlob
    .config({
      // response data will be saved to this path if it has access right.
      path : dirs.DocumentDir + '/' + _filename
    })
    .fetch('GET', url, {
      //some headers ..
    })
    .then((res) => {
      // the path should be dirs.DocumentDir + 'path-to-file.anything'
      CameraRoll.saveToCameraRoll(res.path(),_type);
      alert(_msg)
    });
  },
  updateDescription(description){
    return fetch('https://www.cameraco.org/profile/update_profile',{
      method: 'POST',
      body:'description='+description,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  block(userId){
    return fetch('https://www.cameraco.org/users/'+userId+'/block',{
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  unblock(userId){
    return fetch('https://www.cameraco.org/users/'+userId+'/unblock',{
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  async addVideoToCache(url,filename) {
    try {
      const cache = await AsyncStorage.getItem('videoCache');
      if(cache == null){
        cache = []
      }else{
        cache = JSON.parse(cache);
      }
      _video = {"url":url,"filename":filename};
      alert(_video);
      cache.push(_video);
      await AsyncStorage.setItem('videoCache', cache);
    } catch (error) {
      console.log("Error saving data" + error);
    }
  },
  cacheVideos(feedJson){
    let dirs = RNFetchBlob.fs.dirs
    _filterVideos = feedJson.filter(p => p.type == "video");
    c
    function downloadNext(){
      if(_filterVideos.length > 0){
        //check if list is not empty
        // videoPost = _filterVideos[0];
        // if(videoPost.hasOwnProperty("media")){
          alert(_filterVideos.length);

          //check if has media
          //check if media is not empty
          // _url = videoPost.media[0].url;
          // _filename  = _url.split("/")[_url.split("/").length - 1];
            // //check if is a mov video
            // RNFS.exists(dirs.DocumentDir +'/' + _filename).then((exists) => {
            //
            //     // RNFetchBlob.config({
            //     //   // response data will be saved to this path if it has access right.
            //     //   path : dirs.DocumentDir + '/' + _filename
            //     // })
            //     // .fetch('GET', _url, {
            //     //   //some headers ..
            //     // })
            //     // .then((res) => {
            //     //   videoPost.pop(0);
            //     //   downloadNext();
            //     // }).catch((error) =>{
            //     //     alert(JSON.stringify(error));
            //     // });
            // }).catch((error) => {
            //   alert(JSON.stringify(error));
            // });

            // _filterVideos = _filterVideos.slice(1,_filterVideos.length);
            // __filterVideos.shift();
            downloadNext();
          // }
        }
      }
      downloadNext();

  },
  report(foteId){
    return fetch('https://www.cameraco.org/fotes/'+foteId+'/report',{
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
  deleteConversation(conversationId){
    return fetch('https://www.cameraco.org/dms/'+conversationId+'/delete',{
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson;
    })
    .catch((error) => {
      return(error);
    });
  },
}
module.exports = cameraCoApi;
