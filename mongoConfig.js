let MongoClient = require( 'mongodb' ).MongoClient;

let _db;

module.exports = {
  connectToServer: function( callback ) {
    MongoClient.connect( "mongodb+srv://admin:ZpvdALld35Zoq7uo@gcdb-mrskb.mongodb.net/admin", function( err, db ) {
      _db = db.db('GC')
      return callback( err );
    } );
  },

  getDb: function() {
    return _db;
  }
};
