import React, {Component} from 'react';
import {
    Alert,
    Button,
    FlatList,
    Platform,
    Keyboard,
    ScrollView,
    Dimensions,
    TextInput,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    StatusBar,
    Linking,
    TouchableWithoutFeedback
} from 'react-native';

import {getStatusBarHeight} from 'react-native-status-bar-height';
import {NavigationActions} from 'react-navigation';

statusBarHeight = getStatusBarHeight();
import cameraCoApi from "../api/CameraCoApi";

const {height, width} = Dimensions.get('window');
import moment from 'moment';
import RNTextInput from 'react-native-text-input-enhance';
import Firebase from 'react-native-firebase';
import type {RemoteMessage} from 'react-native-firebase';
import {Notification, NotificationOpen} from 'react-native-firebase';
import TopBar from '../components/TopBar';
import ModalFollow from '../components/ModalFollow';
import {ifIphoneX} from 'react-native-iphone-x-helper'
import FotesCamera from './FotesCamera';
import ItemChatReply from '../chat/ItemChatReply';
import MessageChatReply from '../chat/MessageChatReply';


export default class Conversation extends React.Component {

    constructor(params) {
        super(params);
        this.msgLenght = null;
        this.previousDate = null;
        this.onInvoiceReceived = this.onInvoiceReceived.bind(this);

        this.state = {
            conversationId: '',
            conversation: null,
            headerTitle: '',
            messages: [],
            message: '',
            headerPhoto: '',
            me: {},
            keyboardVisible: false,
            shortNoteSection: 0,
            isEnable: false,
            price: '',
            modalVisible: false,
            showSubmit: false,
            chatIcon: 'chat',
            itemSelected: null,
            indexSelected: null,
            mediaUri: '',
            refreshingList: false,
            timeAgo: "",
            item_reply: this.getReply(params.navigation.state.params.item),
            is_show_reply: params.navigation.state.params.item ? true : false
        }
    }

    getReply(reply) {
        if (!reply) return undefined;
        reply.comments_user = undefined;
        reply.comments_with_user = undefined;
        reply.is_following = undefined;
        reply.is_public = undefined;
        reply.likes_by = undefined;
        if (reply.user) {
            if (reply.user.length > 0) {
                let user = reply.user[0];
                user.followers = undefined;
                user.notification_token = undefined;
            }
        }
        return reply;
    }

    _keyboardDidShow(e) {
        _extra = getStatusBarHeight();
        shcs = Dimensions.get('window').height - e.endCoordinates.height;
        this.setState({
                keyboardHeight: e.endCoordinates.height,
                keyboardVisible: true,
                shortNoteSection: shcs
            },
            () => {
                this.forceUpdate();
            }
        )
    }

    _keyboardDidHide(e) {
        this.setState({
            keyboardVisible: false,
            shortNoteSection: height
        })
    }

    componentWillMount() {
        global.CONVERSATION_VIEW = this;
        global.CONVERSATION_OPEN = true;
        const {state} = this.props.navigation;

        this.setState({
            "conversationId": state.params.conversationId,
            "headerTitle": state.params.title,
            "headerPhoto": state.params.photo
        })
        cameraCoApi.getMe().then((res) => {
            if (res.hasOwnProperty("name")) {
                this.setState({me: res});
            }
        });
        cameraCoApi.getConversation(state.params.conversationId).then((res) => {
            if (res.success) {
                this.msgLenght = res.response[0].messages.length;
                this.setState({messages: res.response[0].messages.reverse(), conversation: res.response[0]});
                this.calculateTimeAgo();
            }
        });

    }

    componentWillUnmount() {
        global.CONVERSATION_OPEN = false;
    }

    onNewMessage(msg) {
        if (msg.dm_id == this.state.conversationId) {
            _data = msg;
            console.log('incoming message');
            console.log(_data);
            if (_data.hasOwnProperty("media")) {
                _data.media = _data.media;
            }
            if (_data.hasOwnProperty("thumbnails")) {
                _data.thumbnails = _data.thumbnails;
            }
            _data.creation_date = parseInt(_data.creation_date);
            // alert(JSON.stringify(msg.data));
            if (this.state.me.uid == msg.uid) {

            } else {
                let {messages} = this.state;
                messages.unshift(_data);
                //Set the previous date to display the date correctly
                this.msgLenght = messages.length;

                this.setState({
                    messages,
                    message: ""
                })
            }

        } else {
            //alert("nere");
            // if(msg.data.type == "DM"){
            //   this.setState({chatIcon:'chatGif'});
            //   Firebase.notifications().displayNotification(msg)
            // }
        }
    }

    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
        this.notificationListener = Firebase.notifications().onNotification((notification: Notification) => {
            // alert("3");
            //on message received and app is open
            // alert("c" + JSON.stringify(notification.data));
            this.onNewMessage(notification.data);
        });
        this.updateUserStatusInterval = setInterval(this.updateUserStatus.bind(this), 5000);
    }

    updateUserStatus() {
        cameraCoApi.getConversation(this.state.conversationId).then((res) => {
            if (res.success) {
                this.setState({conversation: res.response[0]});
                this.calculateTimeAgo();
            }
        });
    }

    componentDidUnmount() {
        this.notificationListener = null;
        clearInterval(this.updateUserStatusInterval)
    }

    _goBack() {
        const {goBack} = this.props.navigation;
        goBack()
    }

    goCreateConversations() {
        this.props.navigation.navigate({key: 'CreateConversation', routeName: 'CreateConversation'});
    }

    onInvoiceReceived(invoice) {
        this.sendInvoice(invoice.amount, invoice.email);
    }

    navigateInvoice() {
        this.props.navigation.navigate({
            key: 'Invoice', routeName: 'Invoice', params: {
                name: this.state.headerTitle,
                onInvoiceCreated: this.onInvoiceReceived,
                email: this.state.me.email
            }
        });
    }

    _keyExtractor = (item, index) => index;

    _renderMessage = ({item, index}) => {
        let date = new Date(item.creation_date);
        let bc, direction;
        if (item.uid != this.state.me.uid) {
            bc = '#f1f1f1';
            direction = 'flex-start';
            let user = {'uid': item.uid, 'username': this.state.headerTitle, 'photo': this.state.headerPhoto}
            return (
                <View>
                    {this._displayDivider(date, index)}
                    <View style={[styles.message_area, item.is_reply ? {maxWidth: "90%"} : {}, {
                        justifyContent: direction,
                        alignSelf: direction
                    }]}>
                        {this.renderImageUser(item.uid)}
                        {this._renderMsgContent(item, bc, date, direction, index, user)}
                    </View>
                </View>
            )
        } else {
            bc = '#5cb4dc';
            direction = 'flex-end';
            let user = {'uid': this.state.me.uid, 'username': this.state.me.username, 'photo': this.state.me.photo}

            return (
                <View>
                    {this._displayDivider(date, index)}
                    <View style={[styles.message_area, item.is_reply ? {maxWidth: "90%"} : {}, {
                        justifyContent: direction,
                        alignSelf: direction
                    }]}>
                        {this._renderMsgContent(item, bc, date, direction, index, user)}
                    </View>
                </View>
            )
        }
    }

    _renderSeparator = () => {
        return (
            <View style={styles.separator}></View>
        )
    }

    addmessage() {
        let message = this.state.message;
        if (message.trim() != '') {
            let reply;
            if (this.state.is_show_reply) {
                reply = this.state.item_reply;
            }
            cameraCoApi.sendMessage(this.state.conversationId, message, reply).then((res) => {
                if (res.success) {
                    cameraCoApi.getConversation(this.state.conversationId).then((resp) => {
                        if (resp.success) {
                            let {messages} = this.state;
                            let item = {}
                            item.message = message;
                            item.uid = this.state.me.uid;
                            item.creation_date = Date.now();
                            if (this.state.is_show_reply) {
                                item.reply = this.state.item_reply;
                                item.is_reply = true;
                            }
                            console.log("new item to add in chat list");
                            console.log(item);
                            messages.unshift(item);
                            //Set the previous date to display the date correctly
                            this.msgLenght = messages.length;

                            this.setState({
                                messages,
                                message: "",
                                isEnable: false,
                                is_show_reply: false,
                                item_reply: null
                            })
                        }
                    })
                }
            })
        } else {
            alert('Message cant be empty');
        }
        this.textInput.clear();
    }

    //add go to profile
    goUserProfile(uid_user) {
        let user = {
            uid: uid_user,
            showSettings: false,
            photo: 'https://s3.amazonaws.com/fotesapp/profiles/' + uid_user + '.png?date=' + Date.now(),
        }
        this.props.navigation.navigate({
            key: 'FeedProfile',
            routeName: 'FeedProfile',
            params: {user: user, showSettings: user.showSettings, isBlocked: false, isFromChat: true}
        });
    }

    renderImageUser(id_user) {
        if (id_user != '') {
            let photo = 'https://s3.amazonaws.com/fotesapp/profiles/' + id_user + '.png';
            return (
                <TouchableOpacity onPress={() => this.goUserProfile(id_user)}>
                    <Image style={styles.userImage}
                           source={{uri: photo}}
                    />
                </TouchableOpacity>
            )
        } else {
            let image = require('../assets/img/icons/profile40.png');
            return (
                <TouchableOpacity onPress={this._onUserPress}>
                    <Image style={styles.userImage}
                           resizeMode={'center'}
                           source={image}
                    />
                </TouchableOpacity>
            )
        }
    }

    _displayDivider(date, index) {
        this.setPreviousDate(index);

        if (this.previousDate == null) {
            return (
                <View style={styles.divider}>
                    {this._dividerDate(date)}
                </View>
            )
        } else {
            let _m = moment(date);

            if (moment(this.previousDate).isSame(_m, 'day')) {
                return null
            } else {
                return (
                    <View style={styles.divider}>
                        {this._dividerDate(date)}
                    </View>
                )
            }
        }
    }

    setPreviousDate(index) {
        if (index < (this.msgLenght - 1)) {
            let _msg = this.state.messages;
            this.previousDate = new Date(_msg[index + 1].creation_date);
        } else {
            this.previousDate = null;
        }
    }

    _dividerDate(date) {
        let string_date;
        let m = moment(date);
        if (moment().isSame(m, 'day')) {
            string_date = m.format('LT').toLowerCase();
        } else if (moment().subtract(1, 'days').isSame(m, 'day')) {
            string_date = 'Yesterday';
        } else if (moment().isSame(m, 'year')) {
            string_date = moment(date).format("MMMM Do");
        } else {
            string_date = moment(date).format("MMMM Do YYYY");
        }
        return (
            <Text style={styles.dividerTxt}>{string_date}</Text>
        )
    }

    _renderMsgContent(item, bc, date, direction, index, user) {
        _hasMedia = item.hasOwnProperty("media");

        _mediaLength = 0;
        if (_hasMedia) {
            _mediaLength = item.media.length;
        }
        if (item.is_reply) {
            return (
                <TouchableOpacity style={{backgroundColor: 'transparent', flex: 1}}
                                  onLongPress={() => this.onPressMsg(item, index)}>
                    <MessageChatReply
                        message={item}
                        item={item.reply}
                        user={user}
                        bc={bc}
                    />
                    {this.renderMessage(item)}
                </TouchableOpacity>
            );
        }
        if (_hasMedia && _mediaLength > 0) {
            return (
                <TouchableOpacity style={{backgroundColor: 'transparent', flex: 1}}
                                  onPress={() => this.onPressMedia(item, user)}
                                  onLongPress={() => this.onPressMsg(item, index)}>
                    <View style={[styles.wrapperMessageMedia, {backgroundColor: bc}]}>
                        <Image
                            style={styles.media}
                            source={{uri: item.thumbnails[0].url}}
                        />
                        <View style={styles.messageMedia}>
                            <Text
                                style={[styles.message, {flex: 1}, bc == '#f1f1f1' ? {color: '#5e5e5e'} : {color: 'white'}]}>
                                {item.message}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.wrapperTime, {alignItems: direction}]}>
                        <Text style={styles.time}>
                            {moment(date).format('LT').toLowerCase()}
                        </Text>
                    </View>
                </TouchableOpacity>)
        }
        if (item.hasOwnProperty('activity')) {
            return (
                <TouchableOpacity style={{backgroundColor: 'transparent', flex: 1}}
                                  onLongPress={() => this.onPressMsg(item, index)}>
                    <View style={[styles.wrapperMessageMedia, {backgroundColor: bc}]}>
                        <Image
                            style={styles.media}
                            source={{uri: item.activity.url}}
                        />
                        <View style={styles.messageMedia}>
                            <Text
                                style={[styles.message, {flex: 1}, bc == '#f1f1f1' ? {color: '#5b5b5b'} : {color: 'white'}]}>
                                {item.message}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.wrapperTime, {alignItems: direction}]}>
                        <Text style={styles.time}>
                            {moment(date).format('LT').toLowerCase()}
                        </Text>
                    </View>
                </TouchableOpacity>
            )
        } else {
            return (
                <TouchableOpacity style={{backgroundColor: 'transparent'}}
                                  onLongPress={() => this.onPressMsg(item, index)}>
                    <View style={[styles.wrapper_message, {backgroundColor: bc}]}>
                        <Text style={[styles.message, bc == '#f1f1f1' ? {color: '#5b5b5b'} : {color: 'white'}]}>
                            {this.renderMessage(item)}
                        </Text>
                        {this.renderInvoice(item)}
                    </View>
                    <View style={[styles.wrapperTime, {alignItems: direction}]}>
                        <Text style={styles.time}>
                            {moment(date).format('LT').toLowerCase()}
                        </Text>
                    </View>
                </TouchableOpacity>
            )
        }
    }

    renderMessage(item) {
        if (item.type == "invoice") {
            _meUid = this.state.me.uid;
            _sender = null
            _payer = null
            this.state.conversation.participants.forEach(function (u) {
                if (item.uid == u.uid) {
                    _sender = u;
                } else {
                    _payer = u;
                }
            });
            if (_sender.uid == _meUid) {
                _message = "You sent an invoice for {price} USD.";
                _message = _message.replace("{price}", item.amount);
                return (_message)
            } else {
                _message = "You received an invoice for {price} USD.";
                _message = _message.replace("{price}", item.amount);
                return (_message)
            }
        } else {
            return (item.message)

        }
    }

    payInvoice(item) {
        _link = "https://www.paypal.com/cgi-bin/webscr?on0=Payer&os0={payer_name}&amount={amount}&cmd=_xclick&business={sender_email}&no_shipping=1&currency_code=USD&lc=EN";
        _meUid = this.state.me.uid;
        _sender = null
        _payer = null
        this.state.conversation.participants.forEach(function (u) {
            if (item.uid == u.uid) {
                _sender = u;
            } else {
                _payer = u;
            }
        });
        _link = _link.replace("{payer_name}", _payer.name)
        _link = _link.replace("{amount}", item.amount);
        _link = _link.replace("{sender_email}", _sender.email);

        Linking.openURL(_link);
    }

    renderInvoice(item) {
        _meUid = this.state.me.uid;
        _sender = null
        _payer = null
        this.state.conversation.participants.forEach(function (u) {
            if (item.uid == u.uid) {
                _sender = u;
            } else {
                _payer = u;
            }
        });

        if (_sender == null) {
            return (null)
        }
        else if (_sender.uid == _meUid) {
            return (null)
        } else if (item.type == "invoice") {
            return (<Button color="white" onPress={() => this.payInvoice(item)} title={"Pay invoice"}></Button>);
        } else {
            return (null);
        }

    }

    sendInvoice(amount, email) {
        if (amount > 0.0) {
            cameraCoApi.sendInvoice(this.state.conversationId, amount, email).then((res) => {
                this.setState({showSubmit: false})
                if (res.success) {
                    this.setState({showSubmit: false})
                    cameraCoApi.getConversation(this.state.conversationId).then((resp) => {
                        if (resp.success) {
                            let {messages} = this.state;
                            let item = {}
                            item.message = message;
                            item.uid = this.state.me.uid;
                            item.creation_date = Date.now();
                            messages.unshift(item);
                            //Set the previous date to display the date correctly
                            this.msgLenght = messages.length;

                            this.setState({
                                messages,
                                message: "",
                                isEnable: false
                            })

                        }
                    })
                }
            })
        } else {
            this.setState({showSubmit: false})
            alert("Invalid invoice amount");
        }
    }

    savePrice() {
        let price = this.state.price;
        //show spinner
        this.setState({showSubmit: true})
        // alert(price);
        this.sendInvoice(price);
        // if(price.trim() != ''){
        // api.getMe().then((res) => {
        //   _vurl = this.state.current_video.url_video
        //   api.savePrice(this.state.room_id,comment,this.state.currentTime,0,0,_vurl,res.email,res.name,res._id).then((response) => {
        //       this.setState({showSubmit:false})
        //       this.setState({modalVisible:false})
        //       this.setState({isPaused:false})
        //   })
        // })
        // }
    }

    validateMsg(msg) {
        if (msg.trim() != '') {
            this.setState({message: msg, isEnable: true});
        } else {
            this.setState({isEnable: false});
        }
    }


    deleteMsg() {
        let item = this.state.itemSelected;
        let index = this.state.indexSelected;
        // alert(JSON.stringify(item));
        cameraCoApi.deleteMsg(this.state.conversationId, item.creation_date).then((res) => {
            if (res.success) {
                let {messages} = this.state;
                messages.splice(index, 1);
                this.msgLenght = messages.length;

                this.setState({messages});
                // alert("Message deleted");
            }
        });
    }

    alertDelete() {
        //Hide menu option
        this.modal.setModal(false);
        setTimeout(() => {
            Alert.alert(
                'Delete',
                'Do you want to delete this message?',
                [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => this.deleteMsg()},
                ],
                // { cancelable: false }
            )
        }, 500);
    }

    onPressMsg(item, index) {
        if (item.uid == this.state.me.uid) {
            this.modal.setModal(true);
            this.setState({itemSelected: item, indexSelected: index});
        }
    }

    launchCamera() {
        const resetAction = NavigationActions.reset({
                actions: [NavigationActions.navigate(
                    {key: 'FotesCamera', routeName: 'FotesCamera'})]
            }
        );
        params = {
            callback: this.foteTakenCallback.bind(this),
            mainBtnTxt: 'Send',
            hideTypeBtn: false
        }
        this.props.navigation.navigate({key: 'FotesCamera', routeName: 'FotesCamera', params: params});
    }


    foteTakenCallback(p) {

        function onUploadProgress(_p) {

        }

        function onFinish(_response) {
            _jResponse = JSON.parse(_response.data)

            _dmid = _jResponse.response.dm_id;
            _msg = _jResponse.response;

            let {messages} = global.CONVERSATION_VIEW.state;
            let item = {}
            item.message = _msg;
            item.uid = global.CONVERSATION_VIEW.state.me.uid;
            item.creation_date = Date.now();
            messages.unshift(_msg);
            //Set the previous date to display the date correctly
            this.msgLenght = messages.length;


            global.CONVERSATION_VIEW.setState({
                messages,
                message: "",
                isEnable: false
            })

        }

        cameraCoApi.sendMessageWithMedia(this.state.conversationId, p.msg, p.uri, onUploadProgress, onFinish);

        // this.setState({mediaUri:"https://i.pinimg.com/originals/b0/0a/15/b00a153720557ea5f440d5e02517bc9a.gif"});

        // ImageResizer.createResizedImage(p.uri, 200, 200, "PNG", 85, 0, "msg").then((response) => {
        //
        //   // cameraCoApi.uploadProfilePhoto(response.uri,this.finishedUpdatingPhoto);
        // }).catch((err) => {
        //   alert("Sorry, we couldn't update your profile picture");
        //   // Oops, something went wrong. Check that the filename is correct and
        //   // inspect err to get more details.
        // });

    }


    onPressMedia(item, user) {
        // alert(JSON.stringify(item));
        this.props.navigation.navigate({key: 'Viewer', routeName: 'Viewer', params: {item: item, user: user}});
    }

    _handleRefresh = () => {
        this.setState(
            {refreshingList: true}, () => {
                this.refreshList();
            }
        )
    }

    refreshList() {
        cameraCoApi.getConversation(this.state.conversationId).then((res) => {
            if (res.success) {
                this.msgLenght = res.response[0].messages.length;
                this.setState({messages: res.response[0].messages.reverse(), refreshingList: false});
            } else {
                this.setState({
                    refreshingList: false
                })
            }
        });
    }

    calculateTimeAgo() {
        last_seen = null;
        _t = this.state.conversation.title;
        this.state.conversation.participants.forEach(function (p) {
            if (_t == p.name) {
                if (p.hasOwnProperty("last_seen")) {
                    last_seen = p.last_seen;
                }
            }
        });
        if (last_seen != null) {
            d = new Date(last_seen);
            ago = (Date.now() - last_seen) / 1000;
            m = moment(d);
            last_seen = m.fromNow();

            if (ago / 60 < 1) {
                this.setState({timeAgo: "online"})
            } else {
                this.setState({timeAgo: "Last seen: " + last_seen})

            }

        }
    }

    onCloseReply() {
        this.setState({
            is_show_reply: false,
            item_reply: undefined
        });
    }

    renderReplyPreview() {
        if (this.state.is_show_reply) {
            return (
                <ItemChatReply
                    item={this.state.item_reply}
                    onClose={(msg) => this.onCloseReply()}
                />
            );
        }
    }

    render() {
        return (
            <View style={[styles.container, this.state.keyboardVisible ? {
                height: this.state.shortNoteSection,
                paddingBottom: 0
            } : {flex: 1}]}>
                <StatusBar backgroundColor="white"/>
                <TopBar
                    firstBtnImage={'back'}
                    firstBtn={() => this._goBack()}
                    fourthBtnImage={this.state.chatIcon}
                    fourthBtn={() => this.goCreateConversations()}
                    mainTitle={this.state.headerTitle}
                    subTitle={this.state.timeAgo}

                >
                </TopBar>

                <View style={styles.content_form}>
                    <FlatList
                        style={{paddingLeft: 20, paddingTop: 10, paddingRight: 20}}
                        contentContainerStyle={{paddingBottom: 25}}
                        ref={ref => this.flatList = ref}
                        inverted={true}
                        refreshing={this.state.refreshingList}
                        onRefresh={this._handleRefresh}
                        data={this.state.messages}
                        extraData={this.state}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderMessage}
                        ItemSeparatorComponent={this._renderSeparator}
                    />
                </View>
                {this.renderReplyPreview()}
                <View style={styles.content_bottom}>

                    <RNTextInput
                        style={styles.input}
                        ref={input => {
                            this.textInput = input
                        }}
                        placeholder={'Type your message..'}
                        returnKeyType={"send"}
                        multiline={true}
                        blurOnSubmit={true}
                        onSubmitEditing={() => this.addmessage()}
                        placeholderTextColor={'#9c9c9c'}
                        onChangeText={(message) => this.validateMsg(message)}
                    />
                    <TouchableOpacity style={styles.btnSmall} onPress={() => this.launchCamera()}>
                        <Image style={[styles.iconDollar, {tintColor: '#ef5d82'}]}
                               source={require('../assets/img/icons/camera.png')}
                        />
                    </TouchableOpacity>
                </View>
                <ModalFollow
                    ref={ref => {
                        this.modal = ref;
                    }}
                    firstBtnTxt={'Delete'}
                    firstBtnColor={'red'}
                    firstBtn={() => this.alertDelete()}
                />
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        ...ifIphoneX({
            paddingTop: 25,
            paddingBottom: 34
        }, {
            paddingTop: statusBarHeight
        })
    },
    header: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: 'gray',
        paddingLeft: 15,
        paddingRight: 15,
    },
    header_tittle: {
        fontSize: 18,
        color: 'black',
        fontWeight: 'bold',
        paddingLeft: 5
    },
    content_form: {
        flex: 1,
        backgroundColor: '#fafafa'
    },
    message_area: {
        minHeight: 30,
        maxWidth: '75%',
        flexDirection: 'row',
    },
    wrapper_message: {
        minWidth: 100,
        flexWrap: 'wrap',
        borderRadius: 15,
        padding: 15,
    },
    wrapperMessageMedia: {
        flex: 1,
        borderRadius: 15,
        padding: 15,
    },
    userImage: {
        height: 38,
        width: 38,
        borderRadius: 19,
        backgroundColor: '#e9ecef',
        marginRight: 10
    },
    username: {
        fontSize: 16,
        color: 'black',
        fontWeight: 'bold'
    },
    message: {
        fontSize: 16,
        color: 'white',
    },
    separator: {
        height: 30,
    },
    content_bottom: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        borderTopWidth: 1,
        borderTopColor: '#e7e7e7',
        minHeight: 60

    },
    input: {
        flex: 1,
        paddingLeft: 10,
        color: 'black',
        fontSize: 16
    },
    btn: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnTxt: {
        fontSize: 18,
        color: '#4286f4',
        fontWeight: 'bold'
    },
    divider: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    dividerTxt: {
        color: '#9fa4a7',
        fontSize: 16,
        paddingLeft: 25,
        paddingRight: 25,
        paddingTop: 6,
        paddingBottom: 6,
        borderWidth: 1,
        borderColor: "#e2dfed",
        borderRadius: 16,
    },
    time: {
        color: '#9c9c9c',
        fontSize: 10,
    },
    media: {
        height: 250,
        width: undefined,
        backgroundColor: '#e9ecef',
        borderRadius: 3
    },
    messageMedia: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingTop: 12.5
    },
    wrapperTime: {
        height: 20,
        justifyContent: 'center',
    },
    btnSmall: {
        width: 30,
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    iconDollar: {
        height: 22,
        width: 22,
        tintColor: '#5cb4dc'
    },
    modal: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(52, 52, 52, 0.8)'
    },
    container_modal: {
        backgroundColor: '#EDEDED',
        width: 300,
        height: 170,
        paddingTop: 10,
        ...Platform.select({
            ios: {
                borderRadius: 10,
            },
            android: {
                borderRadius: 5,
            },
        }),
    },
    title_modal: {
        fontSize: 18,
        fontWeight: 'bold',
        ...Platform.select({
            ios: {
                textAlign: 'center'
            },
            android: {
                textAlign: 'left',
                paddingLeft: 15
            },
        }),
    },
    msg_modal: {
        paddingTop: 5,
        paddingBottom: 5,
        fontSize: 16,
        ...Platform.select({
            ios: {
                textAlign: 'center'
            },
            android: {
                textAlign: 'left',
                color: 'gray',
                paddingLeft: 15
            },
        }),
    },
    input_container: {
        marginTop: 5,
        marginBottom: 15,
        marginLeft: 15,
        marginRight: 15,
        textAlign: 'left',
        fontSize: 16,
        color: 'black',
        paddingLeft: 10,
        ...Platform.select({
            ios: {
                backgroundColor: 'white',
                borderRadius: 5,
                height: 30,
            },
            android: {
                height: 35,
            },
        }),
    },
    btn_container: {
        flex: 1,
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        ...Platform.select({
            ios: {
                justifyContent: 'center',
                borderTopWidth: 1,
                borderColor: '#B0B0B0',
            },
            android: {
                alignSelf: 'flex-end'
            }
        }),
    },
    btn_modal_left: {
        fontSize: 16,
        padding: 10,
        ...Platform.select({
            ios: {
                borderRightWidth: 1,
                borderColor: '#B0B0B0',
                color: '#2699FF',
                textAlign: 'center',
            },
            android: {
                fontWeight: 'bold',
                textAlign: 'right',
                color: '#009bd9',
            },
        }),
    },
    btn_modal_right: {
        fontSize: 16,
        padding: 10,
        ...Platform.select({
            ios: {
                color: '#2699FF',
                textAlign: 'center',
            },
            android: {
                fontWeight: 'bold',
                textAlign: 'right',
                color: '#009bd9',
            },
        }),
    },
    touch_modal: {
        ...Platform.select({
            ios: {
                flex: 1,
            }
        }),
    },
});
