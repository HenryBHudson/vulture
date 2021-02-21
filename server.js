const mongoose = require('mongoose');
const dotenv = require('dotenv');

// mongoose.set('debug',true);
dotenv.config({path: './config.env'})
const app = require('./app');
const User = require('./models/userModel');

const DB = process.env.DB.replace('<PASSWORD>', process.env.DBPASS);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {console.log('🔗 Vulture Connected.')})


const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`📈 Running on ${port}.`)
});

const io = require('socket.io')(server);

io.sockets.on('connection', socket => {
    socket.on('create', room =>  {
        socket.join(room);
    });
    socket.on('send-chat-message', data => {
        io.to(data.chat).emit('chat-message', data);
    });
    socket.on('typing', data => {
        socket.to(data.chat).broadcast.emit('user-typing', data)
    });
    socket.on('update-activity', id => {
        var status = 'Online';
        var data = {status, id};
        socket.broadcast.emit('update-status', data);
        const statusTimer = setTimeout(() => {
            status = 'Idle';
            data = {status, id}
            socket.broadcast.emit('update-status', data);
            console.log('idle')
            setTimeout(() => {
                status = 'Offline';
                data = {status, id}
                console.log('offline')
                socket.broadcast.emit('update-status', data);
            }, 180000);
        }, 120000);
        socket.on('disconnect', () => {
            clearTimeout(statusTimer);
        })
    });
    socket.on('dconnect', id => {
        var status = "Offline"
        var data = {status, id}
        socket.broadcast.emit('update-status', data)
    })
    
});

// io.sockets.on('connection', socket => {
//     console.log('Connected');
//     socket.on('create', room =>  {
//         socket.join(room);
//     });
//     socket.on('send-chat-message', data => {
//         io.to(data.chat).emit('chat-message', data);
//     });
//     socket.on('typing', data => {
//         socket.to(data.chat).broadcast.emit('user-typing', data)
//     });
//     // 
// });



