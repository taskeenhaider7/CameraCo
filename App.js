import 'react-native-gesture-handler';
import React, {Component} from 'react';
import {
    AppState,
    CameraRoll,
    Dimensions,
    Platform,
    TouchableOpacity,
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
    StatusBar,
    Alert,
    Slider,
} from 'react-native';

import NetInfo from "@react-native-community/netinfo"
import PushNotificationIOS from "@react-native-community/push-notification-ios";

import {NavigationActions, StackNavigator} from 'react-navigation';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import type {RemoteMessage} from 'react-native-firebase';
import {NotificationOpen} from 'react-native-firebase';

import Gallery from "./src/pages/Gallery";
import Note from "./src/pages/Note";
import Type from "./src/pages/Type";
import Account from "./src/pages/Account";
import SignUpOne from "./src/pages/SignUpOne";
import SignUpTwo from "./src/pages/SignUpTwo";
import Login from "./src/pages/Login";
import LoginNew from "./src/pages/LoginNew";
import {AsyncStorage} from 'react-native';
import Feed from "./src/pages/Feed";
import Comments from "./src/pages/Comments";
import Places from "./src/pages/Places";
import PlaceInfo from "./src/pages/PlaceInfo";
import Conversation from "./src/pages/Conversation";
import CreateConversation from "./src/pages/CreateConversation";
import Media from "./src/pages/Media";
import FoteView from "./src/pages/FoteView";
import Fotes from "./src/pages/Fotes";
import FeedProfile from "./src/pages/FeedProfile";
import EventActivity from "./src/pages/EventActivity";
import TaskActivity from "./src/pages/TaskActivity";
import TripActivity from "./src/pages/TripActivity";
import EventTaskView from "./src/pages/EventTaskView";
import Followers from "./src/pages/Followers";
import Invoice from "./src/pages/Invoice";
import Viewer from "./src/pages/Viewer";
import Search from "./src/pages/Search";
import FotesCamera from "./src/pages/FotesCamera";
import Welcome from "./src/pages/Welcome";
import TripView from "./src/pages/TripView";
import SignupEmail from "./src/pages/SignupEmail";
import SignupName from "./src/pages/SignupName";
import SignupUsername from "./src/pages/SignupUsername";
import SignupPassword from "./src/pages/SignupPassword";
import SignupPhoto from "./src/pages/SignupPhoto";
import PhoneVerification from "./src/pages/PhoneVerification";
import PhoneVerificationEntry from "./src/pages/PhoneVerificationEntry";
import GalleryGridPicker from "./src/pages/GalleryGridPicker";
import Blocked from "./src/pages/Blocked";
import SearchView from "./src/pages/search/SearchView";
import {createStackNavigator} from "react-navigation-stack";


statusBarHeight = getStatusBarHeight();

class App extends Component {

    constructor(params) {
        super(params);
        this.state = {
            email: '',
            password: '',
            error: null
        }
        console.disableYellowBox = true;

    }

    render() {
        return (<View style={{backgroundColor: "#ef5d82", flex: 1}}></View>)
    }

    displayAsync = async () => {
        try {
            let user = await AsyncStorage.getItem('user');
            _user = JSON.stringify(user);
            if (_user !== "null") {
                const resetAction = NavigationActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({routeName: 'Fotes', params: {page: 1, showLoader: true}})],
                });
                this.props.navigation.dispatch(resetAction);
            } else {
                const resetAction = NavigationActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({routeName: 'Welcome', params: {page: 1}})],
                });
                this.props.navigation.dispatch(resetAction);

            }
        }
        catch (error) {
        }
    };

    componentDidMount() {

        NetInfo.fetch().then(state => {
            console.log("Connection type", state.type);
            console.log("Is connected?", state.isConnected);
            console.log('First, is ' + (state.isConnected ? 'online' : 'offline'));
        });


        // Subscribe
        const unsubscribe = NetInfo.addEventListener(state => {
            console.log("Connection type", state.type);
            console.log("Is connected?", state.isConnected);
        });

        // Unsubscribe
        unsubscribe();


        /*function handleFirstConnectivityChange(isConnected) {
            console.log('Then, is ' + (isConnected ? 'online' : 'offline'));
            NetInfo.removeEventListener(
                'connectionChange',
                handleFirstConnectivityChange
            );
        }

        NetInfo.addEventListener(
            'connectionChange',
            handleFirstConnectivityChange
        );*/
        _user = this.displayAsync();
        //PushNotificationIOS.setApplicationIconBadgeNumber(0);
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#a5005c',
        padding: 20,
    },
    header: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center'
    },
    header_txt: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
    },
    content_form: {
        borderWidth: 1.5,
        borderColor: 'white',
        borderRadius: 14,
    },
    wrapper_btn: {
        marginTop: 30,
        width: 100,
        height: 35,
        borderWidth: 1.5,
        borderColor: 'white',
        borderRadius: 14,
        justifyContent: 'center',
        alignSelf: 'center'
    },
    txt_btn: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
    },
    input: {
        marginLeft: 14,
        height: 35,
        color: 'white',
    },
    hr: {
        height: 1.5,
        backgroundColor: 'white'
    }
});

export default Project =  StackNavigator(
    {
        App: {
            screen: App,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },

        Gallery: {
            screen: Gallery,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        Note: {
            screen: Note,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        Type: {
            screen: Type,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        Account: {
            screen: Account,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        SignUpOne: {
            screen: SignUpOne,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        SignUpTwo: {
            screen: SignUpTwo,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        Login: {
            screen: Login,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        LoginNew: {
            screen: LoginNew,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        Feed: {
            screen: Feed,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        Media: {
            screen: Media,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        FotesCamera: {
            screen: FotesCamera,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        Comments: {
            screen: Comments,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        Places: {
            screen: Places,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        PlaceInfo: {
            screen: PlaceInfo,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        Conversation: {
            screen: Conversation,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        CreateConversation: {
            screen: CreateConversation,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        FoteView: {
            screen: FoteView,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        Fotes: {
            screen: Fotes,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        EventActivity: {
            screen: EventActivity,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        TaskActivity: {
            screen: TaskActivity,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        TripActivity: {
            screen: TripActivity,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        FeedProfile: {
            screen: FeedProfile,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        Welcome: {
            screen: Welcome,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        EventTaskView: {
            screen: EventTaskView,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        TripView: {
            screen: TripView,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        Invoice: {
            screen: Invoice,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        Followers: {
            screen: Followers,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        GalleryGridPicker: {
            screen: GalleryGridPicker,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        Viewer: {
            screen: Viewer,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        SignupEmail: {
            screen: SignupEmail,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        SignupName: {
            screen: SignupName,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        SignupUsername: {
            screen: SignupUsername,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        SignupPassword: {
            screen: SignupPassword,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        SignupPhoto: {
            screen: SignupPhoto,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        PhoneVerification: {
            screen: PhoneVerification,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        PhoneVerificationEntry: {
            screen: PhoneVerificationEntry,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        Search: {
            screen: Search,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        Blocked: {
            screen: Blocked,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },
        SearchView: {
            screen: SearchView,
            navigationOptions: ({navigation}) => ({
                header: null
            })
        },

    }, {headerMode: 'screen'});
