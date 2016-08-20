'use strict'

var test = require('tape').test
var persistence = require('./')
var Redis = require('ioredis')
var mqemitterRedis = require('mqemitter-redis')
var abs = require('aedes-cached-persistence/abstract')
// var db = new Redis()
var db = new Redis.Cluster([{
  port: 7000,
  host: '127.0.0.1'
}, {
  port: 7001,
  host: '127.0.0.1'
}, {
  port: 7002,
  host: '127.0.0.1'
}, {
  port: 7003,
  host: '127.0.0.1'
}, {
  port: 7004,
  host: '127.0.0.1'
}, {
  port: 7005,
  host: '127.0.0.1'
}])
db.on('connect', unref)
function unref () {
  var allNodes = db.nodes
  Promise.all(Object.keys(allNodes).map(function (key) {
    allNodes[key].connector.stream.unref()
    return
  })).then(function (keys) {
  })
}

abs({
  test: test,
  buildEmitter: function () {
    var emitter = mqemitterRedis()
    emitter.subConn.on('connect', unref)
    emitter.pubConn.on('connect', unref)

    return emitter
  },
  persistence: function (cb) {
    // db.flushall()
    var pers = persistence([{
      port: 7000,
      host: '127.0.0.1'
    }, {
      port: 7001,
      host: '127.0.0.1'
    }, {
      port: 7002,
      host: '127.0.0.1'
    }, {
      port: 7003,
      host: '127.0.0.1'
    }, {
      port: 7004,
      host: '127.0.0.1'
    }, {
      port: 7005,
      host: '127.0.0.1'
    }])
    pers._db.on('connect', unref)
    var masterNodes = db.masterNodes
    Promise.all(Object.keys(masterNodes).map(function (key) {
      masterNodes[key].flushdb()
      return
    })).then(function (keys) {
      cb(null, pers)
    })
  }
})

// function toBroker (id, emitter) {
//   return {
//     id: id,
//     publish: emitter.emit.bind(emitter),
//     subscribe: emitter.on.bind(emitter),
//     unsubscribe: emitter.removeListener.bind(emitter)
//   }
// }

// test('multiple persistences', function (t) {
//   var emitter = mqemitterRedis()
//   var emitter2 = mqemitterRedis()
//   var instance = persistence([{
//     port: 7000,
//     host: '127.0.0.1'
//   }, {
//     port: 7001,
//     host: '127.0.0.1'
//   }, {
//     port: 7002,
//     host: '127.0.0.1'
//   }, {
//     port: 7003,
//     host: '127.0.0.1'
//   }, {
//     port: 7004,
//     host: '127.0.0.1'
//   }, {
//     port: 7005,
//     host: '127.0.0.1'
//   }])
//   var instance2 = persistence([{
//     port: 7000,
//     host: '127.0.0.1'
//   }, {
//     port: 7001,
//     host: '127.0.0.1'
//   }, {
//     port: 7002,
//     host: '127.0.0.1'
//   }, {
//     port: 7003,
//     host: '127.0.0.1'
//   }, {
//     port: 7004,
//     host: '127.0.0.1'
//   }, {
//     port: 7005,
//     host: '127.0.0.1'
//   }])
//   t.plan(7)
//   // var allNodes = db.nodes()
//   // Promise.all(allNodes.map(function (node) {
//   //   return node.flushdb()
//   // })).then(function (keys) {
//   instance.broker = toBroker('1', emitter)
//   instance2.broker = toBroker('2', emitter2)
//   // })

//   var client = { id: 'multipleTest' }
//   var subs = [{
//     topic: 'hello',
//     qos: 1
//   }, {
//     topic: 'hello/#',
//     qos: 1
//   }, {
//     topic: 'matteo',
//     qos: 1
//   }]
//   console.log('=============')
//   instance2.on('ready', function () {
//     instance.addSubscriptions(client, subs, function (err) {
//       t.notOk(err, 'no error')
//       instance2.subscriptionsByTopic('hello', function (err, resubs) {
//         t.notOk(err, 'no error')
//         t.deepEqual(resubs, [{
//           clientId: client.id,
//           topic: 'hello/#',
//           qos: 1
//         }, {
//           clientId: client.id,
//           topic: 'hello',
//           qos: 1
//         }])
//         instance.destroy(t.pass.bind(t, 'first dies'))
//         instance2.destroy(t.pass.bind(t, 'second dies'))
//         emitter.close(t.pass.bind(t, 'first emitter dies'))
//         emitter2.close(t.pass.bind(t, 'second emitter dies'))
//       })
//     })
//   })
// })
