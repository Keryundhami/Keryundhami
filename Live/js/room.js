let messagesContainer = document.getElementById('messages_container')
messagesContainer.scrollTop = messagesContainer.scrollHeight


let APP_ID = "994c72764d7c41c894e38f57410f6db8"
let token = null
let uid = sessionStorage.getItem('rtmUID')
if(uid === null || uid === undefined){
    uid = String(Math.floor(Math.random() * 232))
    sessionStorage.setItem('rtmUID', uid)
}


let urlParams = new URLSearchParams(window.location.search)

let displayName = sessionStorage.getItem('display_name')


let room = urlParams.get('room')
if(room === null || displayName === null){
   window.location = `join.html?room=${room}`
}

let host;
let hostId;

let roomName = sessionStorage.getItem('room_name')
let myAvatar = sessionStorage.getItem('avatar')


let initiate = async () => {
    let rtmClient = await AgoraRTM.createInstance(APP_ID)
    await rtmClient.login({uid, token})

    try{
        let attributes = await rtmClient.getChannelAttributesByKeys(room, ['room_name', 'host_id'])
        roomName = attributes.room_name.value
        hostId = attributes.host_id.value

        if(uid === hostId){
            host = true
            document.getElementById('stream_controls').style.display = 'flex'
        }
    }catch(error){
        await rtmClient.setChannelAttributes(room, {'room_name': roomName, 'host': displayName, 'host_image': myAvatar, 'host_id': uid})
        host = true
        document.getElementById('stream_controls').style.display = 'flex'

    }


    const channel = await rtmClient.createChannel(room)
    await channel.join()


    await rtmClient.addOrUpdateLocalUserAttributes({'name': displayName})


    let lobbyChannel = await rtmClient.createChannel('lobby')
    await lobbyChannel.join() 

    lobbyChannel.on('MemberJoined', async (memberId) => {
        let participants = await channel.getMembers()
    
        if(participants[0] === uid){
            let lobbyMembers = await lobbyChannel.getMembers()
            for(let i=0; lobbyMembers.length > i; i++){
                rtmClient.sendMessageToPeer({text:JSON.stringify({'room':room, 'type':'room_added'})}, lobbyMembers[i])
            }
        }
    } )


    channel.on('MemberLeft', async (memberId) => {
        removeParticipantFromDom(memberId)

        let participants = await channel.getMembers()
        updateParticipantTotal(participants)
    })


    channel.on('MemberJoined', async (memberId) => {
        addParticipantToDom(memberId)

        let participants = await channel.getMembers()
        updateParticipantTotal(participants)
    } )



    channel.on('ChannelMessage', async (messageData, memberId) => {
        let data = JSON.parse(messageData.text)
        let name = data.displayName
        let avatar = data.avatar
        addMessageToDom(data.message, memberId, name, avatar)

        let participants = await channel.getMembers()
        updateParticipantTotal(participants)
    })


    let addParticipantToDom = async (memberId) => {
        let {name} = await rtmClient.getUserAttributesByKeys(memberId, ['name'])
        let membersWrapper = document.getElementById('member_list')
        let memberItem = ` <div class="member_wrapper" id="member_${memberId}_wrapper">
                             <span class="green_icon"></span>
                                <p class="member_name">${name}</p>
                            </div>`
                            console.log('memberItem:', memberItem)
        membersWrapper.innerHTML += memberItem
    }


    let addMessageToDom = (messageData, memberId, displayName, avatar) => {
        let created = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
        if(created.startsWith("0")){
            created = created.substring(1)
        }
        let messagesWrapper = document.getElementById('messages')
        // let messageItem = `    <div class="message_wrapper">
        //                   <small>${created}</small>
        //                   <p>${displayName}</p>
        //                   <p class="message">${messageData}</p>
        //                     </div>`

        let messageItem = `<div class="message_wrapper">
                        <img class="avatar_md" src="${avatar}" />
                        
                        <div class="message_body"
                            <strong class="message_author">${displayName}</strong>
                            <small class="message_timestamp">${created}</small>
                            <pclass="message_text">${messageData}</p>`


        messagesWrapper.insertAdjacentHTML('beforeend', messageItem)
       
        let lastMessage = document.querySelector('#messages .message_wrapper:last-child')
        lastMessage.scrollIntoView();

    }


    let sendMessage = async (e) => {
        e.preventDefault()
        let message = e.target.message.value
        channel.sendMessage({text:JSON.stringify({'message':message, 'displayName': displayName, 'avatar': myAvatar})})
        addMessageToDom(message, uid, displayName, myAvatar)
        e.target.reset()
    }

    let updateParticipantTotal = (participants) => {
        console.log('PARTICIPANTS:', participants)
        let total = document.getElementById('members_count')
        total.innerHTML = participants.length 
    }

    let getParticipants = async () => {
        let participants = await channel.getMembers()

        if(participants.length <= 1){
            let lobbyMembers = await lobbyChannel.getMembers()
            for(let i=0; lobbyMembers.length > i; i++){
                rtmClient.sendMessageToPeer({text:JSON.stringify({'room':room, 'type':'room_added'})}, lobbyMembers[i])
            }
        }

        updateParticipantTotal(participants)
        for (let i=0; participants.length > i; i++ ){
            addParticipantToDom(participants[i])
        }
    }


    let removeParticipantFromDom = (memberId) => {
        document.getElementById(`member_${memberId}_wrapper`).remove()
    }


    let leaveChannel = async () => {
        await channel.leave()
        await rtmClient.logout()
    }


    window.addEventListener("beforeunload", leaveChannel)

    getParticipants()



    let messageForm = document.getElementById('message_form')
    messageForm.addEventListener('submit', sendMessage)
}

//RTC Configure

let rtcUid = Math.floor(Math.random() * 232)
let config = {
    APP_ID : "994c72764d7c41c894e38f57410f6db8",
    token:null,
    uid:rtcUid,
    channel:room,
}

let localTracks = []
let localScreenTracks;

let rtcClient = AgoraRTC.createClient({mode:'live', codec:'vp8'})
let streaming = false
let sharingScreen = false

let initiateRtc = async() => {
    
    await rtcClient.join(config.APP_ID, config.channel, config.token, config.uid)

    rtcClient.on('user-published', handleUserPublished)
    rtcClient.on('user-unpublished', handleUserLeft)
}

let toggleStream = async () => {
    if(!streaming){
        streaming = true
        toggleVideoShare()
        // document.getElementById('stream-btn').innerHTML = 'Stop Stream'
    }else{
        streaming = false
        document.getElementById('stream-btn').innerHTML = 'Start Stream'

        for(let i=0; localTracks.length > i; i ++){
            localTracks[i].stop()
            localTracks[i].close()
        }

        await rtcClient.unpublish([localTracks[0], localTracks[1]])
    }
}
let toggleVideoShare = async() => {
    rtcClient.setClientRole('host')

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    document.getElementById('video_stream').innerHTML = ''

    let player = `<div class="video-container" id="user-container-${rtcUid}">
                        <div class="video-player" id="user-${rtcUid}"></div>
                  </div>`

    document.getElementById('video_stream').insertAdjacentHTML('beforeend', player)
    localTracks[1].play(`user-${rtcUid}`)
    await rtcClient.publish([localTracks[0], localTracks[1]])
}

let handleUserPublished = async(user, mediaType) => {
    await rtcClient.subscribe(user, mediaType)
    
    if(mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if(player != null){
            player.remove()
        }

        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div>
                  </div>`
        document.getElementById('video_stream').insertAdjacentHTML('beforeend', player)
        user.videoTrack.play(`user-${user.uid}`) 
    }

    if(mediaType === 'audio'){
        user.audioTrack.play()
    }
}

let handleUserLeft = async(user) => {
    document.getElementById(`video_stream`).innerHTML = ''
}

let toggleCamera = async (e) =>{
    if(localTracks[1].muted){   
        localTracks[1].setMuted(false)
        e.target.classLists.add('active')
    }else{
        localTracks[1].setMuted(true)
        e.target.classLists.remove('active')
    }
}

let toggleMic = async (e) =>{
    if(localTracks[0].muted){   
        localTracks[0].setMuted(false)
        e.target.classLists.add('active')
    }else{
        localTracks[0].setMuted(true)
        e.target.classLists.remove('active')
    }
}


let toggleScreenShare = async () => {
    if(sharingScreen){
        sharingScreen = false
        await rtcClient.unpublish([localScreenTracks])
        toggleVideoShare()
        document.getElementById('screen-btn').innerText = 'Share screen'
    }else{
        sharingScreen = true
        document.getElementById('screen-btn').innerText = 'Share camera'
        localScreenTracks = await AgoraRTC.createScreenVideoTrack()
        document.getElementById('video_stream').innerHTML = ''

        let player = document.getElementById(`user-container-${rtcUid}`)
        if(player != null){
            player.remove()
        }

        player = `<div class="video-container" id="user-container-${rtcUid}">
                        <div class="video-player" id="user-${rtcUid}"></div>
                  </div>`

        document.getElementById('video_stream').insertAdjacentHTML('beforeend', player)   
        localScreenTracks.play(`user-${rtcUid}`) 
        await rtcClient.unpublish([localTracks[0], localTracks[1]])
        await rtcClient.publish([localScreenTracks])
    }
}


document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('screen-btn').addEventListener('click', toggleScreenShare)
document.getElementById('stream-btn').addEventListener('click', toggleStream)

initiate()
initiateRtc()