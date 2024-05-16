import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import peer from "../service/peer";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const params = useParams();

  console.log(">>myStream>>>", myStream);

  const handleNegoNeeded = async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  };

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, []);

  const handleUserJoined = (data) => {
    const { email, id } = data;
    setRemoteSocketId(id);
  };

  const handleUserCount = (data) => {
    const { userCount } = data;
    setUserCount(userCount);
  };

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    if(myStream) {
        sendStreams()
    }
  }, [myStream])

  useEffect(() => {
    socket.emit("get:userCount", params?.roomId);
  }, []);

  const handleIncomingCall = async ({ from, offer }) => {
    setRemoteSocketId(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    const ans = await peer.getAnswer(offer);
    socket.emit("call:accepted", { to: from, ans });
  };
  const sendStreams = useCallback(() => {
    if (myStream) {
      for (const track of myStream.getTracks()) {
        peer.peer.addTrack(track, myStream);
      }
    }
  }, [myStream]);

  const handleCallAccepted = async ({ from, ans }) => {
    sendStreams();
    await peer.setRemoteDescription(ans);
  };

  const handleNegoNeedIncoming = async ({ from, offer }) => {
    const ans = await peer.getAnswer(offer);
    socket.emit("peer:nego:done", { to: from, ans });
  };

  const handleNegoFinal = async ({ ans }) => {
    await peer.setRemoteDescription(ans);
  };

  const handleCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
  };

    useEffect(() => {
      async function fetchData() {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMyStream(stream);
      }
      fetchData();
    }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("user:count", handleUserCount);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handleNegoFinal);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("user:count", handleUserCount);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoFinal);
    };
  }, [socket]);

  return (
    <div>
      <h1>Room</h1>
      <h4>{userCount > 1 ? "Connected" : "No one in room"}</h4>
      <br />
      <br />
      {userCount > 1 && <button onClick={handleCall}>Start Call</button>}
      <div style={{
        display: "flex"
      }}>
      {myStream && (
        <>
          <h4>My Stream</h4>
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}>
          <ReactPlayer
            playing
            muted
            height={"100px"}
            width={"100px"}
            url={myStream}
          />
          </div>
        </>
      )}
      {remoteStream && (
        <>
          <h4>Remote Stream</h4>
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}>
          <ReactPlayer
            playing
            muted
            height={"100px"}
            width={"100px"}
            url={remoteStream}
          />
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default RoomPage;
