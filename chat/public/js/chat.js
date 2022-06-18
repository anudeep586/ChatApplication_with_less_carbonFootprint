const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const linkTemplate = document.querySelector('#link-template').innerHTML
const link = document.querySelector('#link').innerHTML

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const token = localStorage.getItem('jwt')


const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newmessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newmessageMargin

    const visibleHeight = $messages.offsetHeight


    const containerHeigth = $messages.scrollHeight;

    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeigth - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }

}


socket.on('message', (message) => {
    console.log(message, "chat.js 37")

    function createElementFromHTML(htmlString) {
        var div = document.createElement('a');
        div.innerHTML = htmlString.trim();
        return div.firstChild;
    }

    function urlify(text) {
        // const array = text.split(" ")
        // const html = Mustache.render(messageTemplate, {
        //     message: message.text,
        //     createdAt: moment(message.createdAt).format('h:mm a')
        // })
        // $messages.insertAdjacentHTML('afterend', html)

        // return array
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function(url) {
            return '<a href="' + url + '">' + url + '</a>';
        })
    }
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
socket.on('locationMessage', (url) => {
    const html = Mustache.render(linkTemplate, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
socket.on('disappear', (list) => {
    if (list.text == 'disappear') {
        setTimeout(() => {
            console.log("executed well")
            window.location.reload()
        }, 80000)
    }
})

socket.on('roomData', (userList) => {
    console.log("helo", userList)
    const html = Mustache.render(sidebarTemplate, {
        room: userList.room,
        users: userList.users
    })
    document.querySelector("#sidebar").innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    console.log(e, "e")
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    console.log(message, "message")
    navigator.geolocation.getCurrentPosition((position) => {
        longitude = position.coords.longitude
        latitude = position.coords.latitude
        const msg = { message: message, token: token, latitude: latitude, longitude: longitude }
        console.log(msg, "msg")
        socket.emit('sendMessage', msg, (error) => {
            $messageFormButton.removeAttribute('disabled')
            $messageFormInput.value = ''
            $messageFormInput.focus()

            if (error) {
                return console.log(error)
            }

            console.log('Message delivered!')
        })
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    const token = localStorage.getItem("jwt")
    $sendLocationButton.setAttribute('disabled', 'disabled')
    console.log("60 chat.js")
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            token: token
        }, (mes) => {
            $sendLocationButton.removeAttribute('disabled')
            console.log("72, chat.js")
        })
    })
})

socket.emit('join', { token: token }, (data) => {
    if (data) {



        function alertFunc() {
            console.log("it's entering into the chat.js")
            var userDetails = {}
            navigator.geolocation.getCurrentPosition((position) => {
                const token = localStorage.getItem('jwt')
                userDetails = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    token: token
                }
                console.log(userDetails, "userdetails 120")
                fetch('http://localhost:8687/location', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(userDetails)
                }).then(function(response) {
                    return response.text()
                }).then(function(text) {
                    console.log(text)
                    setTimeout(() => {
                        alertFunc()
                    }, 60000)
                }).catch(function(error) {
                    console.log(error);
                })
            })
        }
        alertFunc()
    }
})
