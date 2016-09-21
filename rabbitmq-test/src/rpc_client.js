#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

var args = process.argv //.slice(2);

if (args.length == 0) {
  console.log("Usage: rpc_client.js num" , args);
  process.exit(1);
}

amqp.connect('amqp://localhost', function(err, conn) {
    if (err){
        console.log(err);
    }
    else {
  conn.createChannel(function(err, ch) {
      if(err){
          console.log(err);
      }
      else {
    ch.assertQueue('', {exclusive: true}, function(err, q) {
        if(err){
            console.log(err);
        }
        else {
      var corr = generateUuid();
      //var num = parseInt(args[0]);
      var num = 30;

      console.log(' [x] Requesting fib(%d)', num);

      ch.consume(q.queue, function(msg) {
        if (msg.properties.correlationId == corr) {
          console.log(' [.] Got %s', msg.content.toString());
          setTimeout(function() { conn.close(); process.exit(0) }, 500);
        }
      }, {noAck: true});

      ch.sendToQueue('rpc_queue',
        new Buffer(num.toString()),
        { correlationId: corr, replyTo: q.queue });
    }
    });
  }
  });
}
});

function generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}