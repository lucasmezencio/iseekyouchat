var socket = io.connect('http://'+window.location.host);

function get_random_color() {
    return '#'+Math.floor(Math.random()*16777215).toString(16);
}

// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function () {
    $('#conversation').empty();
    $('#connect').show();
    socket.emit('ready');
});

// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('updatechat', function (username, data) {
    var message,
        hora = moment().format('HH:mm');

    if (username === 'SERVER') {
        message = '<p>('+hora+') <b>'+username+'</b> '+data+'</p>';
    } else {
        message = '<p>('+hora+') <b style="background-color:'+username.color+';">'+username.username+':</b> '+data+'</p>';
    }

    $('#conversation').append(message);

    if ($('#rolagem').is(':checked')) {
        $('#conversationContainer').stop().animate({scrollTop : $('#conversation').height()});
    }

    if ($('#datasend').is(':visible')) {
        $('#datasend').attr('disabled', false);
        $('#data').attr('disabled', false).focus();
    }
});

// listener, whenever the server emits 'updateusers', this updates the username list
socket.on('updateusers', function (users) {
    var $usersList = $('#users')
        quantUsers = Object.keys(users).length;

    $usersList.empty();

    if (quantUsers > 0) {
        $.each(users, function(key, value) {
            $usersList.append('<li style="background-color:'+this.color+';">'+this.username+'</li>');
        });
    }

    if (quantUsers == 0) {
        $usersList.append('<li>Nenhum usuário conectado.</li>');
    }
});

// on load of page
$(function () {
    // when the client clicks SEND
    $('#msgBox').on('submit', function () {
        var message = $('#data').val();

        if ($.trim(message) == '') {
            return false;
        }

        $('#datasend').attr('disabled', true);
        $('#data').val('').attr('disabled', true);
        // tell server to execute 'sendchat' and send along one parameter
        socket.emit('sendchat', message);

        return false;
    });

    $('#enterChat').on('submit', function() {
        var username = $('#username').val();

        if ($.trim(username) == '') {
            return false;
        }

        $('#connect').hide();

        // call the server-side function 'adduser' and send one parameter (value of prompt)
        socket.emit('adduser', {
            username : username,
            color : get_random_color()
        });

        $('#msgBox').show();

        return false;
    });
});