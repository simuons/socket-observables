'use strict';

let assert = require("assert");
let dgram = require('dgram');
let observables = require("../index.js");

let socket = dgram.createSocket("udp4").bind();
let observalbe = observables.udp(socket);

describe('UDP socket observer should', () => {
    it('call onNext when socket receives message', notifyMessageReceived => {
        let message = new Buffer("test");

        let subscription = observalbe.subscribeOnNext(received => {
            assert.deepStrictEqual(received, message);
            subscription.dispose();
            notifyMessageReceived();
        });

        send(message);
    });

    it('call onError when socket emits error', notifyErrorReceived => {
        let error = new Error('server');

        observalbe.subscribeOnError(received => {
            assert.equal(received, error);
            notifyErrorReceived();
        });

        socket.emit('error', error);
    });

    ["message", "error", "close"].forEach(listenerType =>
        it(`remove ${listenerType} listener on dispose`, () => {
            let subscription = observalbe.subscribe();

            let listenersCountWhenSubscribed = socket.listenerCount(listenerType);

            subscription.dispose();

            let listenersCountWhenDisposed = socket.listenerCount(listenerType);

            assert.equal(listenersCountWhenDisposed, listenersCountWhenSubscribed - 1,
                `on ${listenerType} listeners must be one less than ${listenersCountWhenSubscribed}`
            );
        })
    );

    it('call onCompleted when socket is closed', notifyCompleted => {
        observalbe.subscribeOnCompleted(notifyCompleted);

        socket.close();
    });
});

function send(message) {
    dgram.createSocket("udp4").send(message, 0, message.length,
        socket.address().port,
        socket.address().address
    );
}
