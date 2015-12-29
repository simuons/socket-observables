'use strict';

let Rx = require("rx");

exports.udp = socket => Rx.Observable.create(observer => {

    let onNext = message => observer.onNext(message);
    let onError = error => observer.onError(error);
    let onCompleted = () => observer.onCompleted();

    socket.on("message", onNext);
    socket.on("error", onError);
    socket.on("close", onCompleted);

    return () => {
        socket.removeListener("message", onNext);
        socket.removeListener("error", onError);
        socket.removeListener("close", onCompleted);
    };

});
