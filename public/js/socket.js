var chat = new URLSearchParams(window.location.search).get('chat');
const socket = io();
socket.emit('create', chat);
var typing = false;
var timeout = undefined;

const updateChatView = () => {
    const mBody = document.querySelector('.messages-body-outer');
    mBody.scrollTo(0, mBody.scrollHeight - mBody.clientHeight);
}

const runSocket = (id) => {
    socket.emit('update-activity', id);
}

socket.on('chat-message', data => {
    if(data.message != null){
        addMessage(data);
        updateChatView();
    }
})

socket.on('user-typing', (data) => {
    const typing = document.querySelector('.typing-container');
    if(data.typing){
        if(typing.classList.contains('dpn')){
            typing.classList.remove('dpn');
        }
    } else{
        if(!typing.classList.contains('dpn')){
            typing.classList.add('dpn');
        }
    }
});

socket.on('update-status', data => {
    const contacts = document.querySelectorAll('.contact-item');
    contacts.forEach(contact => {
        if(contact.lastChild.textContent === data.id){
            const status = (data.status).toLowerCase();
            contact.childNodes[0].childNodes[1].className = `contact-picture-activity ${status}`;
            contact.childNodes[0].childNodes[1].setAttribute('title', `<b>${data.status}</b>`)
            contact.childNodes[0].childNodes[1].setAttribute('data-original-title', `<b>${data.status}</b>`)
            if(chat === contact.childNodes[2].textContent){
                document.querySelector('.activity').className = `activity ${status}`;
                document.querySelector('.activity').setAttribute('title', `<b>${data.status}</b>`)
                document.querySelector('.activity').setAttribute('data-original-title', `<b>${data.status}</b>`)
            }
        }
    }); 
})

const mIpt = document.querySelector('.message-input');

$(".message-input").keydown(e => {
    if(e.keyCode === 13 && !e.shiftKey){
        e.preventDefault();

        typing = false

        socket.emit('typing', {typing, chat})

        const message = mIpt.textContent;

        if(/\S/.test(message)){
            const email = document.querySelector('.user-email').textContent;
            const data = {message, email, chat};

            socket.emit('send-chat-message', data);

            mIpt.textContent = '';
            document.querySelector('.message-input-placeholder').style.display = 'block';
        }
    } else if(e.keyCode === 8 || e.keyCode === 46){
        if(mIpt.textContent.length <= 1){
            typing = false;
            socket.emit('typing', {typing, chat});
        }
    } else {
        typing = true;
        socket.emit('typing', {typing, chat});
    }
});

$(".message-input").keyup(e => {
    if(mIpt.textContent === ''){
        typing = false
        socket.emit('typing', {typing, chat})
    }
});

const addMessage = (data) => {
    const container = document.querySelector('.messages-body');
    const item = document.createElement('div');
    const bar = document.createElement('div');
    const content = document.createElement('div');
    const msg = document.createElement('div');
    const email = document.createElement('div');

    bar.className = 'message-bar';
    content.className = 'message-content';
    msg.className = 'message-message';
    email.className = 'dpn';

    msg.textContent = data.message;
    email.textContent = data.email;
    
    if(data.email != container.lastChild.lastChild.textContent){
        item.className = "message-container";

        const username = document.createElement('div');
        username.className = 'message-username';
        username.textContent = 'Henry Hudson'

        const picture = document.createElement('div');
        picture.className = 'message-picture';
        // picture styling

        bar.appendChild(picture);
        content.appendChild(username);
    } else {
        item.className = "message-single-container";
    }
    content.appendChild(msg);
    item.appendChild(bar);
    item.appendChild(content);
    item.appendChild(email);

    container.appendChild(item);
    updateChatView();
}