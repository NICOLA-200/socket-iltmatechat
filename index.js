

let PORT =  process.env.PORT || 8800;

const io = require("socket.io")(PORT, {
     cors: {
          origin:"*"
     }
});

let activeUsers = [];



io.on("connection", (socket) => {
     

     socket.on("new-user", (newUserId) => {
          if (!activeUsers.some((user) => user.userId === newUserId)) {
               activeUsers.push({ userId: newUserId, socketId: socket.id });
              
          }    
     })
     socket.emit("me", socket.id);
 

     socket.on("new-user-add" , (newUserId) => {
        if (!activeUsers.some((user) => user.userId === newUserId)) {
          activeUsers.push({ userId: newUserId, socketId: socket.id });
        
        }
        io.emit("get-users", activeUsers);
     })
     
     socket.on("callUser", ({ userToCall, signalData, from }) => {
          const user = activeUsers.find((user) => user.userId === userToCall);
          if (user) { 
               console.log("okkk 22")
               io.to(user.socketId).emit("callUser", { signal: signalData, from:socket.id });

 
          }
		
	});

     socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
  
	});
     socket.on("ended", (userToCall) => {
          const user = activeUsers.find((user) => user.userId === userToCall);
          if (user) { 
               console.log("okkk 22")
               io.to(user.socketId).emit("callEnded");

 
          }
     })

     socket.on("disconnect", () => {
          
          // remove user from active users
          activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);

          io.emit("get-users", activeUsers);
        });

        socket.on("send-message", (data) => {
          
          let seen;
          const { receiverId } = data;

          const user = activeUsers.find((user) => user.userId === receiverId);

          
          if (user) {
            io.to(user.socketId).emit("recieve-message", data);
            io.to(socket.id).emit("recieve-message", data);
          } else {
               seen = false
               data.seen = seen
               io.to(socket.id).emit("recieve-message", data);
          }
        });
        socket.on("you", (data) => {
        })
})
