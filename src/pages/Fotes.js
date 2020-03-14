import React, {Component} from 'react';
import {
    AppState,
    Dimensions,
    Platform,
    TouchableOpacity,
    StyleSheet,
    Keyboard,
    View,
    Image,
    TextInput,
    AsyncStorage
} from 'react-native';
import {NavigationActions, StackNavigator} from 'react-navigation';
import {RNCamera} from 'react-native-camera';
import ImageResizer from 'react-native-image-resizer';

const {width, height} = Dimensions.get('window');
const posSlider = (height / 2) - 20;
const posInput = (height / 2) - 50;
const flashOff = RNCamera.Constants.FlashMode.off;
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {ifIphoneX} from 'react-native-iphone-x-helper'
import cameraCoApi from "../api/CameraCoApi";
import {createResponder} from 'react-native-gesture-responder'
import ActionButtons from '../components/ActionButtons';
import messaging, {firebase} from '@react-native-firebase/messaging';
import Swiper from 'react-native-swiper';
import Media from "../components/Media";
import CreateConversation from "./CreateConversation";
import GalleryGridPicker from "./GalleryGridPicker";
import FotesLoader from "../components/FotesLoader";
import Video from "react-native-video";
import ViewShot from "react-native-view-shot";
import Geolocation from '@react-native-community/geolocation';
import PreviewButtons from '../camera/PreviewButtons';

statusBarHeight = getStatusBarHeight();
var ImagePicker = require('react-native-image-picker');
var RNFS = require('react-native-fs');


const biasRev = Platform.OS === 'ios' ? 255 : 1;

export default class Fotes extends React.Component {

    constructor(params) {
        super(params);
        console.log("fotes ma a gya aee oy");
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            cameraFlashToggle: flashOff,
            cameraMode: 'back',
            flashImage: require('../assets/img/icons/flash_off.png'),
            page: 1,
            latitude: null,
            longitude: null,
            place: null,
            error: '',
            isRecording: false,
            videoMode: false,
            msgRecording: 'noclick',
            recordingTime: 0,
            photoImage: require('../assets/img/icons/photo_black.png'),
            videoImage: require('../assets/img/icons/video.png'),
            zoom: 0.0,
            gestureState: {},
            thumbSize: 100,
            left: width / 2,
            top: height / 2,
            appState: AppState.currentState,
            preview: false,
            uri: '',
            showInput: false,
            note: '',
            thumbnail: "",
            type: '',
            filter: "",
            filter_uri: "",
            filter_thumbnail: "",
            mirrorImage: false,
            libraryArea: 0,
            appReady: false,
            rootKey: Math.random(),
            currentPage: 1,
            renderEffects: false,
            metrics: []
        }
        this._image = require('../assets/img/assets/fotes.png');

        this.id = null;
        this.options = {
            enableHighAccuracy: true,
            maximumAge: 0
        };
        this.optionsP = {
            enableHighAccuracy: true,
            maximumAge: 60000
        };
        let swiperIndex = 0;
        this.filterIndex = 0;
        this.currentPage = 0;

    }

    componentDidMount() {

        console.log("componentWillMount ma a gya ee oy");

        const {state} = this.props.navigation;
        this.showLoader = state.params.showLoader;
        // check user login status
        cameraCoApi.getMe().then((res) => {
            if (res.hasOwnProperty("name")) {
                global.USER_LOGGED = res;
            } else {
                global.USER_LOGGED = null;
                this.removeUser();

            }


        });
        this.updateLocation();
        console.log("update location tak puj gai");
        // StatusBar.setHidden(true);
        if (typeof state.params === "undefined") {
            console.log("page one");
            this.setState({
                "page": 1
            })
        } else {
            console.log("page " + state.params.page);
            this.setState({
                "page": state.params.page
            })
        }

        console.log("state is ", this.state);
        this.gestureResponder = createResponder({
            onStartShouldSetResponder: (evt, gestureState) => true,
            onStartShouldSetResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetResponder: (evt, gestureState) => true,
            onMoveShouldSetResponderCapture: (evt, gestureState) => true,
            onResponderGrant: (evt, gestureState) => {
            },
            onResponderMove: (evt, gestureState) => {
                let thumbSize = this.state.thumbSize;

                if ((gestureState.dy < -100) && (gestureState.dx > 0)) {
                    if (!this.state.preview) {
                        this.gridPicker.refreshFiles();
                        this.setState({libraryArea: 1})
                    }
                } else if (gestureState.dx > 0) {
                    this.setState({libraryArea: 0})

                }

                _dy = gestureState.dy
                // if (_dy < -100){
                //   _dy = -100;
                // }
                // if(_dy > 0){
                //   _dy = 0;
                // }
                // _dy = _dy * -1;
                // _libArea = _dy / 100;
                //this.setState({libraryArea:_libArea})
                if (gestureState.pinch && gestureState.previousPinch) {
                    thumbSize *= (gestureState.pinch / gestureState.previousPinch)
                }
                let {left, top} = this.state;
                left += (gestureState.moveX - gestureState.previousMoveX);
                top += (gestureState.moveY - gestureState.previousMoveY);
                _zoom = this.state.zoom;
                if (gestureState.previousPinch >= gestureState.pinch) {
                    _zoom = _zoom - 0.01;
                } else {
                    _zoom = _zoom + 0.01;

                }
                if (_zoom < 0.0) {
                    _zoom = 0.0;
                }
                if (_zoom > 1.0) {
                    _zoom = 1;
                }
                if (gestureState.pinch != null) {
                    this.setState({
                        gestureState: {
                            ...gestureState
                        },
                        page: 1,
                        zoom: _zoom,
                        left, top, thumbSize
                    })
                }


            },
            onResponderTerminationRequest: (evt, gestureState) => true,
            onResponderRelease: (evt, gestureState) => {
                if (gestureState.singleTapUp) {
                    this.setState({libraryArea: 0})
                }
                if (gestureState.doubleTapUp) {
                    this.setMode();
                }
                this.setState({
                    gestureState: {
                        ...gestureState
                    }
                })
            },
            onResponderTerminate: (evt, gestureState) => {
            },
        });
        //FCM MESSAGES
        firebase.messaging().getToken().then(fcmToken => {
            if (fcmToken) {
                //alert("Ah perro tienes el token: "+ fcmToken)
                cameraCoApi.update_token(fcmToken).then((res) => {
                    // alert(res);
                });

            } else {
                // alert("Ah perro no te salio")
            }
        });
        firebase.messaging().hasPermission().then(enabled => {
            if (enabled) {

            } else {
                messaging().requestPermission()
                    .then(() => {

                    })
                    .catch(error => {
                        alert("We couldn't get your permission. You will not receive notifications in real time.")
                    });
            }
        });
        // cameraCoApi.downloadFile("https://s3.amazonaws.com/fotesapp/fotes/521b4f18ca17c3080b10adacf1c49e651538049359983.png");


        console.log("oy  fotes ka componentDidMount ma puj gya ee oy");

        AppState.addEventListener('change', this._handleAppStateChange);
        this.messageListener = firebase.messaging().onMessage((message: remoteMessage) => {
            console.log("UASDASD");

        });
        // this.notificationDisplayedListener = Firebase.notifications().onNotificationDisplayed((notification:Notification) => {
        //   //alert("2");
        //   Firebase.notifications().getBadge().then(count => {
        //     count++
        //     Firebase.notifications().setBadge(count);
        //   });
        //   if(notification.data.hasOwnProperty("type")){
        //     if(notification.data.type == "DM"){
        //       _notification = notification.data;
        //       _notification.media = JSON.parse(_notification.media);
        //       _notification.thumbnails = JSON.parse(_notification.thumbnails);
        //       this.Media.onNewMessageReceived(_notification)
        //     }
        //   }
        //
        // });
        /*this.notificationDisplayedListener = notifee.displayNotification((notification: any) => {

           //Change here
            /!*notifee.bad()
                .then(count => {
                    count++;
                    firebase.notifications().setBadge(count)
                })
                .then(() => {
                    console.log('Doing great')
                })
                .catch(error => {
                    console.log('fail to count', error)
                })*!/

        });*/

        //onNotification
        /*this.notificationListener = notifee.Notification((notification: Notification) => {
            // alert("3");
            //on message received and app is open
            if (notification.data.hasOwnProperty("type")) {
                if (notification.data.type === "DM") {
                    _notification = notification.data;
                    _notification.media = JSON.parse(_notification.media);
                    _notification.thumbnails = JSON.parse(_notification.thumbnails);
                    this.Media.onNewMessageReceived(_notification);
                    this.Conversations.onNewMessageReceived(_notification);

                } else if (notification.data.type === "LIKE") {
                    _notification = notification.data;
                    this.Media.onNewNotificationUpdateReceived(_notification)
                } else if (notification.data.type === "COMMENT") {
                    _notification = notification.data;
                    this.Media.onNewNotificationUpdateReceived(_notification)
                } else if (notification.data.type === "FOLLOW") {
                    _notification = notification.data;
                    this.Media.onNewNotificationUpdateReceived(_notification)
                }
            }
        });*/
        /*this.notificationOpenedListener = notifee.openNotificationSettings((notificationOpen: Notification) => {
            const action = notificationOpen.action;
            const notification: Notification = notificationOpen.notification;
            cameraCoApi.getConversation(notification.data.dm_id).then((res) => {
                if ((res.hasOwnProperty("success")) && (res.response[0].hasOwnProperty("_id"))) {
                    if (res.success) {
                        _conversation = res.response[0];
                        this.props.navigation.navigate({
                            key: 'Conversation', routeName: 'Conversation',
                            params: {
                                conversationId: _conversation._id,
                                title: _conversation.title,
                                photo: _conversation.conversation_image
                            }
                        });
                    }
                }

            })
        });*/
        /*notifee.getInitialNotification().then((notificationOpen: any) => {
            if (notificationOpen) {
                // App was opened by a notification
                // Get the action triggered by the notification being opened
                const action = notificationOpen.action;
                // Get information about the notification that was opened
                const notification: Notification = notificationOpen.notification;
                cameraCoApi.getConversation(notification.data.dm_id).then((res) => {
                    if ((res.hasOwnProperty("success")) && (res.response[0].hasOwnProperty("_id"))) {
                        if (res.success) {
                            _conversation = res.response[0];
                            this.props.navigation.navigate({
                                key: 'conversation', routeName: 'Conversation',
                                params: {
                                    conversationId: _conversation._id,
                                    title: _conversation.title,
                                    photo: _conversation.conversation_image
                                }
                            });
                        }
                    }

                })
            }
        });*/
        global.NOTE_COMPONENT = {};
        global.NOTE_COMPONENT.NOTE_INTENT = false;
        global.FOTES = this;

        Swiper.prototype.componentWillUpdate = (nextProps, nextState) => {


            swiperIndex = nextState.index
            if (this.currentPage != swiperIndex) {
                console.log("page: " + swiperIndex);
                if (this.state.currentPage != swiperIndex) {
                    this.setState({currentPage: swiperIndex});
                }


                this.currentPage = swiperIndex;

                if (swiperIndex === 0) {
                    this.updateLocation();
                } else {
                    if ((this.state.libraryArea === 1) && (swiperIndex === 1)) {
                        this.setState({libraryArea: 0})
                    }
                    this.stopObserving();
                }

            }


        };
        Keyboard.dismiss();
        this.resetAnimation();

    }

    resetAnimation() {
        this.setState({
            appReady: false,
            rootKey: Math.random()
        });

        setTimeout(() => {
            this.setState({
                appReady: true,
            });
        }, 1000);
    }

    componentWillUnmount() {

        AppState.removeEventListener('change', this._handleAppStateChange);
        Geolocation.clearWatch(this.id);
        this.notificationDisplayedListener =null;
        this.notificationListener=null;

    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            this.updateLocation();
            // StatusBar.setHidden(true);
        }
        this.setState({appState: nextAppState, page: 1});
    };

    success(pos) {
        var crd = pos.coords;
        if (crd.latitude != null) {
            this.setState({
                latitude: crd.latitude,
                longitude: crd.longitude,
                page: 1,
                error: null
            });
            if (this.latitude == null) {
                this.getCurrentPlace();
            }
        }

    }

    error(err) {
        this.setState({error: err.message, page: 1});
    }

    updateLocation() {
        Geolocation.getCurrentPosition(this.success.bind(this), this.error.bind(this), this.optionsP);
        id = Geolocation.watchPosition(this.success.bind(this), this.error.bind(this), this.options);
    }

    stopObserving() {
        Geolocation.clearWatch(this.id);
    }

    removeUser = async () => {
        try {
            await AsyncStorage.removeItem('user');
            // kick this user!
            const resetAction = NavigationActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({key: 'Welcome', routeName: 'Welcome', params: {page: 1}})],
            });
            this.props.navigation.dispatch(resetAction);
        }
        catch (error) {
            // kick this user!
            const resetAction = NavigationActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({key: 'Welcome', routeName: 'Welcome', params: {page: 1}})],
            });
            this.props.navigation.dispatch(resetAction);
        }
    };

    /*componentWillMount() {}

    login(email, pwd, t) {}*/

    handleClick() {
        this.setMode();
    }

    setMode() {
        if (this.state.cameraMode == 'back') {
            this.setState({
                    cameraMode: 'front',
                    page: 1,
                    mirrorImage: true
                },
                () => {
                    this.forceUpdate();
                }
            )
        } else {
            this.setState({
                    cameraMode: 'back',
                    page: 1,
                    mirrorImage: false

                },
                () => {
                    this.forceUpdate();
                })
        }
    }

    setFlash() {
        var state = this.state;
        var stateImage = this.state;

        if (state.cameraFlashToggle === RNCamera.Constants.FlashMode.on) {
            state.cameraFlashToggle = RNCamera.Constants.FlashMode.off;
            stateImage.flashImage = require('../assets/img/icons/flash_off.png');
        } else {
            state.cameraFlashToggle = RNCamera.Constants.FlashMode.on;
            stateImage.flashImage = require('../assets/img/icons/flash_on.png');
        }
        this.setState({page: 1});
        state.page = 1;
        stateImage.page = 1;
        this.setState(state);
        this.setState(stateImage);
    }

    updateRecordingTimer() {
        this.secs += 1;
        this.setState({recordingTime: this.secs})
    }


    takePicture = async function () {
        if (this.camera) {
            const options = {quality: 0.5, base64: true, mirrorImage: this.state.mirrorImage};
            const data = await this.camera.takePictureAsync(options)
            d = new Date().getTime();

            ImageResizer.createResizedImage(data.uri, 600, 1062, "PNG", 85, 0, d + ".thumbnail").then((response) => {
                // response.uri is the URI of the new image that can now be displayed, uploaded...
                // response.path is the path of the new image
                // response.name is the name of the new image with the extension
                // response.size is the size of the new image
                this.setState({uri: data.uri, preview: true, thumbnail: response.uri});

            }).catch((err) => {
                // Oops, something went wrong. Check that the filename is correct and
                // inspect err to get more details.
            });

        }
    };


    onPressCapture() {
        this.getCurrentPlace();
        if (this.state.isRecording) {
            this.camera.stopRecording();
            return 0;
        }
        if (this.state.videoMode) {
            this.setState(
                {
                    isRecording: true,
                    page: 1,
                    msgRecording: 'Recording...'
                },
                () => {
                    this.recordVideo();
                    this.forceUpdate();
                }
            );
        } else {
            this.takePicture()
        }
    }

    setVideoMode() {
        let imagePhoto = require('../assets/img/icons/photo_black.png');
        let imageVideo = require('../assets/img/icons/video.png');

        this.setState({
                videoMode: true,
                page: 1,
                photoImage: imagePhoto,
                videoImage: imageVideo
            },
            () => {
                this.forceUpdate();
            }
        )
    }

    setPhotoMode() {
        let imagePhoto = require('../assets/img/icons/photo_black.png');
        let imageVideo = require('../assets/img/icons/video.png');
        this.setState({
                videoMode: false,
                page: 1,
                photoImage: imagePhoto,
                videoImage: imageVideo
            },
            () => {
                this.forceUpdate();
            }
        )
    }

    renderVideoModesLeft() {
        if (this.state.isRecording) {
            return (null);
        } else {
            return (
                <View style={styles.btnContainerSection}>
                    <TouchableOpacity onPress={() => this.setMode()}
                                      style={[styles.icon_btn_sides, {left: 25}]}>
                        <Image
                            style={styles.icon}
                            source={require('../assets/img/icons/camera_mode.png')}
                        />
                    </TouchableOpacity>
                </View>
            )
        }
    }

    renderVideoModes() {
        if (this.state.isRecording) {
            return (null);
        } else {
            return (
                <View style={styles.btnContainerSection}>
                    <TouchableOpacity style={[styles.icon_btn_sides, {right: 25}]}
                                      onPress={() => this.setFlash()}>
                        <Image
                            style={styles.icon}
                            source={this.state.flashImage}
                        />
                    </TouchableOpacity>
                </View>
            )
        }
    }

    goToSearchView() {
        this.props.navigation.navigate({
            key: 'SearchView',
            routeName: 'SearchView',
        });
    }

    renderHeaderControls() {
        if (!this.state.preview) {
            return (
                <View style={styles.header_search}>
                    <View style={{flex: 1}}></View>
                    <TouchableOpacity
                        onPress={() => this.goToSearchView()}>
                        <Image
                            style={styles.icon_search}
                            source={require('../assets/img/icons/search.png')}
                        />
                    </TouchableOpacity>
                </View>
            )
        } else {
            return (
                <View style={styles.header}>
                    {this.renderActionButtons()}
                </View>
            )
        }

    }

    renderActionButtons() {
        if (this.state.preview) {
            return (
                <ActionButtons
                    onPressType={() => {
                        this._onPressText()
                    }}
                    onPressUpload={() => {
                        this._onPressUpload()
                    }}
                    preview={this.state.preview}
                    video={this.state.videoMode}
                    mainBtnTxt={"SEND"}
                    onClose={() => this.cancelBtn()}
                    mainBtnEnabled={this.isValidForm()}
                    onPressNext={() => this.onPressNext()}>
                </ActionButtons>
            )
        } else {
            return null
        }
    }

    resizeImageWithFilter(path) {
        d = new Date().getTime();
        ImageResizer.createResizedImage(path, 600, 1062, "PNG", 85, 0, d + ".thumbnail").then((response) => {
            this.setState({filter_uri: response.uri, filter_thumbnail: response.uri}, () => {
                this.onPressNextWithFilter();
            });

        }).catch((err) => {

            alert(err);

        });
    }

    _onPressUpload() {
        var options = {
            title: 'Select Images',
            storageOptions: {
                skipBackup: true,
                path: 'images'
            }
        };
        // Open Image Library:
        ImagePicker.launchImageLibrary(options, (response) => {
            // Same code as in above section!
            if (response.didCancel) {
            }
            else if (response.error) {
            }
            else if (response.customButton) {
            }
            else {
                // let source = { uri: response.uri };
                d = new Date().getTime();
                ImageResizer.createResizedImage(response.uri, 400, 400, "PNG", 85, 0, d + ".thumbnail").then((responset) => {
                    const resetAction = NavigationActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate(
                            {
                                key: 'Note',
                                routeName: 'Note',
                                params:
                                    {
                                        uri: response.uri,
                                        latitude: this.state.latitude,
                                        longitude: this.state.longitude,
                                        thumbnail: responset.uri
                                    }
                            }
                        )],
                    });
                    this.props.navigation.dispatch(resetAction);
                }).catch((err) => {
                    alert(err);
                });


            }
        });
    }

    changeSlider(value) {
        this.setState(() => {
            return {
                zoom: parseFloat(value), page: 1
            }
        });
    }

    onTop() {
        this.setState(() => {
            return {
                zoom: 1, page: 1
            }
        });
    }

    _onSignUpPressed() {
        this.props.navigation.navigate({routeName: 'Account', key: 'Account'})
    }

    _onCommentsPressed(item) {
        this.props.navigation.navigate({routeName: 'Comments', params: {item: item}, key: 'Comments'});
    }

    _onPlacePressed(place) {
        let photo = '';
        if (place.hasOwnProperty('photos')) {
            if (place.photos.length > 0) {
                photo = place.photos[0].photo_reference;
            }
        }
        this.props.navigation.navigate({
            routeName: 'PlaceInfo',
            params: {place: place, photo_reference: photo}, key: 'PlaceInfo'
        });
    }

    _onPressText() {
        this.setState({showInput: !this.state.showInput});
    }

    _onGridItemPressed(item, url, like, numLikes, activity, activityType, numComments) {
        if (activity == null) {
            this.props.navigation.navigate({
                key: 'FoteView', routeName: 'FoteView',
                params: {
                    item: item,
                    url: url,
                    isLiked: like,
                    numLikes: numLikes,
                    numComments: numComments
                }
            });
        }
    }

    _onUserPressed(item) {
        //Account instead FeedProfile
        this.props.navigation.navigate({
            key: 'FeedProfile',
            routeName: 'FeedProfile',
            params: {user: item, showSettings: item.showSettings, isBlocked: false}
        });
    }

    goCreateConversations() {
        this.SWIPER_MAIN.scrollBy(2 - swiperIndex, true)
    }

    goToCamera() {
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({
                key: 'Note', routeName: 'Note', params:
                    {
                        latitude: this.state.latitude,
                        longitude: this.state.longitude,
                    }
            })],
        });
        this.props.navigation.dispatch(resetAction);
        // this.SWIPER_MAIN.scrollBy(0 - swiperIndex, true)
    }


    renderCamera() {
        if (!this.state.preview) {
            return (
                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    style={styles.preview}
                    type={this.state.cameraMode}
                    flashMode={this.state.cameraFlashToggle}
                    zoom={this.state.zoom}
                    autoFocus={RNCamera.Constants.AutoFocus.on}
                    focusDepth={1.00}
                    mirrorImage={true}
                    fixOrientation={true}
                    orientation={"portait"}
                    whiteBalance={RNCamera.Constants.WhiteBalance.auto}
                    permissionDialogTitle={'Permission to use camera'}
                    permissionDialogMessage={'We need your permission to use your camera phone'}
                />
            )
        } else {
            if (this.state.type == 'video') {
                return (
                    <View style={{flex: 1}}>
                        <Video
                            style={{flex: 1}}
                            source={{uri: this.state.uri}}
                            repeat={true}
                            volume={0}
                        />
                    </View>
                )
            } else {
                // <ColorMatrixImage style={{resizeMode: 'contain',flex:1,backgroundColor:'red'}} source={{uri:this.state.thumbnail}}>
                // </ColorMatrixImage>
                if (this.state.filter == "" || this.state.filter == null) {
                    return (
                        <View style={{flex: 1}}>
                            <ViewShot ref="viewShot" options={{format: "jpg", quality: 0.9}} style={{flex: 1}}>

                                <Image style={{resizeMode: 'contain', flex: 1}}
                                       source={{uri: this.state.uri}}
                                />
                            </ViewShot>

                        </View>
                    )
                }

            }
        }
    }

    getNotePercentage() {
        _p = (this.state.recordingTime / 32) * 100
        return _p;
    }

    onPressGallery() {

    }

    renderBtnContainer() {
        if (!this.state.preview) {
            return (
                <View style={styles.btnContainer}>
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        {this.renderVideoModesLeft()}
                    </View>
                    <View style={styles.wrapperCapture}>
                        <TouchableOpacity
                            onPress={() => this.onPressCapture()}
                            style={styles.capture}>
                            <View style={styles.captureBtn}>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        {this.renderVideoModes()}
                    </View>
                </View>
            )
        }
    }

    renderInput() {
        if (this.state.showInput) {
            return (
                <View style={styles.wrapperInput}>
                    <TextInput style={{fontSize: 20, color: 'white'}}
                               multiline={true}
                               returnKeyType={"done"}
                               onSubmitEditing={() => Keyboard.dismiss()}
                               placeholder={'Caption...'}
                               placeholderTextColor={'white'}
                               onChangeText={(note) => {
                                   this.setState({note})
                               }}
                    />
                </View>
            )
        } else {
            return null
        }
    }

    renderCancelBtn() {
        if (this.state.preview) {
            return (
                <TouchableOpacity style={styles.shadow} onPress={() => this.cancelBtn()}>
                    <Image
                        style={styles.btn_icon_cancel}
                        source={require('../assets/img/icons/closeBlack.png')}/>
                </TouchableOpacity>
            )
        } else {
            return null;
        }
    }

    cancelBtn() {
        this.setState({
            uri: '',
            preview: false,
            showInput: false,
            note: '',
            type: '',
            thumbnail: '',
            recordingTime: 0,
            renderEffects: false
        });
    }

    onPressNextWithFilter() {
        d = new Date().getTime();
        var destPath = RNFS.DocumentDirectoryPath + '/' + "filter_" + d + ".png";
        RNFS.copyFile(this.state.filter_uri, destPath)
            .then((success) => {
                this.moveFileToDocuments(this.state.filter_uri, this.moveFileCallback.bind(this))
            })
            .catch((err) => {
            });


    }

    onPressNext() {
        this.moveFileToDocuments(this.state.uri, this.moveFileCallback.bind(this))
    }

    _onImageSelected(item) {
        this.getCurrentPlace();
        this.setState({libraryArea: 0})
        _uri = item.item.node.image.uri;
        d = new Date().getTime();
        var destPath = RNFS.DocumentDirectoryPath + '/' + "picked_" + d + ".png";
        RNFS.copyAssetsFileIOS(_uri, destPath, 600, 1062)
            .then((success) => {
                ImageResizer.createResizedImage(destPath, 600, 1062, "PNG", 85, 0, d + ".thumbnail").then((response) => {
                    // response.uri is the URI of the new image that can now be displayed, uploaded...
                    // response.path is the path of the new image
                    // response.name is the name of the new image with the extension
                    // response.size is the size of the new image
                    this.setState({uri: destPath, preview: true, thumbnail: response.uri});

                }).catch((err) => {
                    alert(err);
                    // Oops, something went wrong. Check that the filename is correct and
                    // inspect err to get more details.
                });
            })
            .catch((err) => {
                alert(err)
            });
    }

    renderBtnPreview() {
        if (this.state.preview) {
            return (
                <PreviewButtons
                    onHashtags={(hashtags) => this.setState({hashtags_audiocaption: hashtags})}
                    onAudio={(audio_url, metrics) => this.setState({audio_caption: audio_url, metrics: metrics})}
                />
            );
        }
        return null;
    }

    onGoChat(item, conversation) {
        this.props.navigation.navigate({
            key: 'Conversation', routeName: 'Conversation',
            params: {
                conversationId: conversation.id_conversation,
                title: conversation.title,
                photo: conversation.photo,
                item: item
            }
        });
    }

    renderContent() {
        return (
            <View style={styles.container}>
                <Swiper
                    ref={(ref) => this.SWIPER_MAIN = ref}
                    keyboardShouldPersistTaps={"always"}
                    showsButtons={true}
                    loop={false}
                    index={this.state.page}
                    showsPagination={false}
                    scrollEnabled={!this.state.preview}
                >

                    <View style={styles.scontentContainer}>
                        <View style={{flex: 1}} radius={10000} onClick={this.handleClick}>
                            {this.renderHeaderControls()}

                            <View style={styles.wrapperSlider} {...this.gestureResponder}>
                            </View>
                            {this.renderCamera()}
                            {this.renderBtnContainer()}
                            {this.renderBtnPreview()}
                        </View>
                        <View style={{flex: this.state.libraryArea}}>
                            <GalleryGridPicker
                                ref={ref => {
                                    this.gridPicker = ref;
                                }}
                                onImagePicked={(item) => this._onImageSelected(item)}>
                            </GalleryGridPicker>
                        </View>
                    </View>
                    <View style={styles.scontentContainer}>
                        <Media onSignUpPressed={() => this._onSignUpPressed()}
                               reloadFeed={this.showLoader}
                               onGoChat={(item, conversation) => this.onGoChat(item, conversation)}
                               onCommentsPressed={(item) => this._onCommentsPressed(item)}
                               onPlacePressed={(item) => this._onPlacePressed(item)}
                               navigation={this.props.navigation}
                               onGridItemPressed={(item, url, like, numLikes, activity, activityType, numComments) =>
                                   this._onGridItemPressed(item, url, like, numLikes, activity, activityType, numComments)}
                               onUserPressed={(item) => this._onUserPressed(item)}
                               onCreateConversationPressed={() => this.goCreateConversations()}
                               onCameraPressed={() => this.goToCamera()}
                               currentPage={this.state.currentPage}
                               ref={ref => {
                                   this.Media = ref;
                               }}>
                        </Media>
                    </View>
                    <View style={styles.scontentContainer}>
                        <CreateConversation
                            ref={ref => {
                                this.Conversations = ref;
                            }}
                            navigation={this.props.navigation}>

                        </CreateConversation>
                    </View>
                </Swiper>
            </View>
        )
    }

    renderLoader() {//if necesary
        //const {state} = this.props.navigation;
        if (this.showLoader) {
            return (<FotesLoader isLoaded={this.state.appReady} />)
        } else {
            return (null);

        }
    }

    render() {
        return (
            <View key={this.state.rootKey} style={styles.root}>
                {this.renderLoader()}

                {this.renderContent()}
            </View>
        );
    }

    // UPLOAD METHODS START
    // TODO:THESE METHODS WILL BE MOVED TO OTHER PLACE.
    //      IF YOU ARE READING THIS. PLEASE DO IT.
    isValidForm() {
        return true;
    }

    uploadMedia() {
        this.moveFileToDocuments(this.state.uri, this.moveFileCallback.bind(this))
    }

    moveFileCallback(data) {
        if (data[0]) {
            if (data[1].includes(".mov")) {
                this.moveThumbnailToDocuments(this.state.thumbnail, this.moveThumbnailCallback.bind(this))
            } else {
                this.setState({uri: data[1]}, () => {
                    // move thumbnail
                    this.moveThumbnailToDocuments(this.state.thumbnail, this.moveThumbnailCallback.bind(this))
                })
            }

        } else {
            alert("There was an error saving your post.")
        }

    }

    moveThumbnailCallback(data) {
        if (data[0]) {
            this.setState({thumbnail: data[1]}, () => {
                //upload it
                cameraCoApi.getMe().then((res) => { //check if the user is logged in
                    if (res.hasOwnProperty("name")) {
                        // save Fote
                        this.uploadFote(this.state.note.toString());
                    }
                });
            });
        }
    }

    uploadFote(note) {
        _d = new Date().toString();
        _p = {
            "uri": this.state.uri, // ???
            "note": note,
            "date": _d,
            "location": {
                latitude: this.state.latitude,
                longitude: this.state.longitude
            },
            "metrics": this.state.metrics,
            "audio": this.state.audio_caption,
            "hashtags": this.state.hashtags_audiocaption,
            "thumbnail": this.state.thumbnail,
            "is_public": true,
            "place": this.state.place,
            "type": "audio_caption"
        }
        //cameraCoApi.uploadFote(_p);
        //console.log("uploading audio caption");
        //console.log(_p);
        cameraCoApi.uploadAudioCaption(_p);
        this.saveUploadProgress(_p);
        this._goToFeed();

    }

    _goToFeed() {
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({routeName: 'Fotes', params: {page: 1, showLoader: false}})],
        });
        this.props.navigation.dispatch(resetAction);
    }

    async saveUploadProgress(_p) {
        await AsyncStorage.setItem('uploadFote', JSON.stringify(_p));

    }

    getCurrentPlace() {
        // if(this.state.latitude != null){
        //   cameraCoApi.getPlaces(this.state.latitude,this.state.longitude).then((res) => {
        //     // alert(JSON.stringify(res));
        //     if(res.success && res.places.length > 0){
        //       this.setState({'place':res.places[0],'placeName':res.places[0].name});
        //     }else{
        //       this.setState({'placeName':'Add Location...'});
        //     }
        //   });
        // }

    }

    extractHashTags() {
        hashTagsList = []
        this.state.note.split(" ").forEach(function (h) {
            if (h.charAt(0) === "#" && h !== "#") {
                hashTagsList.push(h)
            }
        });
        this.setState({"hashtags": hashTagsList})
    }

    moveFileToDocuments(filePath, callback) {
        fileNameAtDocuments = filePath.split("/");
        fileNameAtDocuments = fileNameAtDocuments[fileNameAtDocuments.length - 1];
        var destPath = RNFS.DocumentDirectoryPath + '/' + fileNameAtDocuments;
        RNFS.exists(destPath)
            .then((exists) => {
                if (exists) {
                    callback([true, fileNameAtDocuments])
                } else {
                    RNFS.moveFile(filePath, destPath)
                        .then((success) => {
                            callback([true, fileNameAtDocuments])
                        })
                        .catch((err) => {
                            callback([false, err.message])
                        });
                }
            });
    }

    moveThumbnailToDocuments(filePath, callback) {
        fileNameAtDocuments = filePath.split("/");
        fileNameAtDocuments = fileNameAtDocuments[fileNameAtDocuments.length - 1];
        var destPath = RNFS.DocumentDirectoryPath + '/' + fileNameAtDocuments;
        RNFS.exists(destPath)
            .then((exists) => {
                if (exists) {
                    callback([true, fileNameAtDocuments])
                } else {
                    RNFS.moveFile(filePath, destPath)
                        .then((success) => {
                            callback([true, fileNameAtDocuments])
                        })
                        .catch((err) => {
                            callback([false, err.message])
                        });
                }
            });


    }

    // UPLOAD METHODS END

}

const styles = StyleSheet.create({
    root: {
        flex: 1
    },
    container: {
        flex: 1,
    },
    scontentContainer: {
        flex: 1,
        backgroundColor: 'black'
    },
    corousel: {
        flex: 1,
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    btnContainer: {
        position: "absolute",
        flexDirection: 'row',
        right: 0,
        left: 0,
        bottom: 0,
        height: 165,
        paddingBottom: 0,
        backgroundColor: 'transparent',
        zIndex: 7
    },
    capture: {
        position: 'absolute',
        bottom: 25,
        height: 74,
        width: 74,
        backgroundColor: 'rgba(239,93,130, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 37,
    },
    captureBtn: {
        height: 60,
        width: 60,
        backgroundColor: '#ef5d82',
        borderRadius: 30,
        position: 'absolute'
    },
    header: {
        backgroundColor: 'transparent',
        flexDirection: 'row',
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center',
        position: 'absolute',
        top: 30,
        right: 0,
        left: 0,
        height: 50,
        zIndex: 10,
        ...ifIphoneX({
            marginTop: 25
        }, {
            marginTop: 0
        })
    },
    header_search: {
        backgroundColor: 'transparent',
        flexDirection: 'row',
        position: 'absolute',
        top: 30,
        right: 0,
        left: 0,
        height: 50,
        zIndex: 10,
        ...ifIphoneX({
            marginTop: 25
        }, {
            marginTop: 0
        })
    },
    wrapper_middle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon_btn_sides: {
        position: 'absolute',
        bottom: 25,
        backgroundColor: "#FFFFFF50",
        height: 30,
        width: 30,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center"
    },
    icon: {
        height: 24,
        width: 24,
        tintColor: "white"
    },
    icon_search: {
        height: 18,
        width: 18,
        tintColor: "white",
        marginRight: 15,
    },
    icon_slider: {
        height: 20,
        margin: 5,
        width: 20,
    },
    icon_slider_minus: {
        height: 20,
        margin: 5,
        width: 20,
    },
    recordingText: {
        fontSize: 16,
        color: "white",
        backgroundColor: "transparent"
    },
    wrapper_icon: {
        height: 30,
        width: 30,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#FFFFFF50",
        flexDirection: "row",
    },
    wrapper_icon_no_video: {
        height: 30,
        width: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnContainerSection: {
        flex: 1,
        ...ifIphoneX({
            marginBottom: 34
        }, {
            paddingTop: 0
        }),
    },
    wrapperCapture: {
        width: 74,
        ...ifIphoneX({
            marginBottom: 34
        }, {
            paddingTop: 0
        }),
    },
    wrapperSlider: {
        height: height - 160,
        width: width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'absolute',
        zIndex: 5,
        ...ifIphoneX({
            marginTop: 75
        }, {
            marginTop: 50
        }),

    },
    slider: {
        backgroundColor: 'transparent',
    },
    headerTimer: {
        flexDirection: 'row',
    },
    wrapperInput: {
        height: 100,
        backgroundColor: 'rgba(0, 0, 0,0.3)',
        position: 'absolute',
        right: 0,
        left: 0,
        top: posInput,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
    btn_icon_cancel: {
        width: 30,
        height: 30,
        tintColor: '#ffffff'
    },
    shadow: {
        shadowColor: 'black',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.6,
        shadowRadius: 2
    },
    loadingBackgroundStyle: {
        backgroundColor: '#ef5d82',
    },
});
