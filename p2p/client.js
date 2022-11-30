const socket = io("http://localhost:9000", {
    autoConnect: false,
});

let pc; // For RTCPeerConnection Object
let localUsername;
let roomName;

const setUsername = (val) => {
    localUsername = val;
    console.log("Setting username to " + localUsername);
}

const setRoom = (val) => {
    roomName = val;
    console.log("Setting roomname to " + roomName);
}

const sendData = (data) => {
    socket.emit("data", {
        username: localUsername,
        room: roomName,
        data: data,
    });
};

const startConnection = () => {
    navigator.mediaDevices
        .getUserMedia({
        audio: false,
        video: {
            height: 350,
            width: 350,
        },
        })
        .then((stream) => {
        console.log("Local Stream found");
        document.getElementById('localvideo').srcObject = stream;
        socket.connect();
        socket.emit("join", { username: localUsername, room: roomName });
        })
        .catch((error) => {
        console.error("Stream not found: ", error);
        });
};

const onIceCandidate = (event) => {
    if (event.candidate) {
        console.log("Sending ICE candidate");
        sendData({
        type: "candidate",
        candidate: event.candidate,
        });
    }
};

const onTrack = (event) => {
    console.log("Adding remote track");
    document.getElementById('remotevideo').srcObject = event.streams[0];
};

const createPeerConnection = () => {
try {
    pc = new RTCPeerConnection({});
    pc.onicecandidate = onIceCandidate;
    pc.ontrack = onTrack;
    const localStream = document.getElementById('localvideo').srcObject;
    for (const track of localStream.getTracks()) {
        pc.addTrack(track, localStream);
    }
    console.log("PeerConnection created");
} catch (error) {
    console.error("PeerConnection failed: ", error);
}
};

const setAndSendLocalDescription = (sessionDescription) => {
    pc.setLocalDescription(sessionDescription);
    console.log("Local description set");
    sendData(sessionDescription);
};

const sendOffer = () => {
    console.log("Sending offer");
    pc.createOffer().then(setAndSendLocalDescription, (error) => {
        console.error("Send offer failed: ", error);
    });
};

const sendAnswer = () => {
    console.log("Sending answer");
    pc.createAnswer().then(setAndSendLocalDescription, (error) => {
        console.error("Send answer failed: ", error);
    });
};

const signalingDataHandler = (data) => {
    if (data.type === "offer") {
        createPeerConnection();
        pc.setRemoteDescription(new RTCSessionDescription(data));
        sendAnswer();
    } else if (data.type === "answer") {
        pc.setRemoteDescription(new RTCSessionDescription(data));
    } else if (data.type === "candidate") {
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    } else {
        console.log("Unknown Data");
    }
};

socket.on("ready", () => {
    console.log("Ready to Connect!");
    createPeerConnection();
    sendOffer();
});

socket.on("data", (data) => {
    console.log("Data received: ", data);
    signalingDataHandler(data);
});

function start(){
    setUsername(document.getElementById("username").value)
    setRoom(document.getElementById("room").value)
    startConnection();
    return function cleanup() {
        pc?.close();
    };
};

function stop() {
    document.ElementById('stop').style.display = 'none';
    document.getElementById('start').style.display = 'inline-block';

    // close peer connection
    setTimeout(function() {
        pc.close();
    }, 500);
}