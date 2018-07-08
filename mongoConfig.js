var MongoClient = require( 'mongodb' ).MongoClient;

var _db;

module.exports = {

  connectToServer: function( callback ) {
    MongoClient.connect( "mongodb+srv://admin:1234@gcdb-mrskb.mongodb.net/GC", function( err, db ) {
      _db = db.db('GC')
      return callback( err );
    } );
  },

  getDb: function() {
    return _db;
  }
};
