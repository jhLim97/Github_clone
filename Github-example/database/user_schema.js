
// 암호화 모듈
var crypto = require('crypto');

var Schema = {};

Schema.createSchema = function(mongoose) {
    console.log('createSchema 호출됨.');
    
    mongoose.set('useCreateIndex', true)
    var UserSchema = mongoose.Schema({
        email: {type:String, 'default':''},
        hashed_password: {type:String, requied:true, 'default':''},
        salt: {type:String, required:true},
        name: {type:String, index:'hashed', 'default':''},
        created_at: {type:Date, index:{unique:false},'default':Date.now()},
        updated_at: {type:Date, index:{unique:false},'default':Date.now()}
    });
    console.log('UserSchema 정의함.');

    // email 칼럼이 유효한지 체크
    UserSchema.path('email').validate(function(email) {
        return email.length; 
    }, 'email 칼럼의 값이 없습니다.');
    
    // hashed_password 칼럼이 유효한지 체크
    UserSchema.path('hashed_password').validate(function(hashed_password) {
        return hashed_password.length;
    }, 'hashed_password 칼럼의 값이 없습니다.');
    
    
    
    UserSchema
        .virtual('password')
        .set(function(password) {
            this._password = password; 
            this.salt = this.makeSalt();
            this.hashed_password = this.encryptPassword(password);
            console.log('virtual password 저장됨 : ' + this.hashed_password);
        })
        .get(function() {
            return this._password;
        })

    // mongoose에서 직접 메서드 추가 method이용
    // 임의의 salt에 따라 암호화되는 값이 달라지도록
    UserSchema.method('encryptPassword', function(plainText, inSalt) {
        if(inSalt) {
            return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
        } else {
            return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
        }
    });

    // salt값 랜덤으로 생성
    UserSchema.method('makeSalt', function() {
        return Math.round((new Date().valueOf()*Math.random())) + ''; 
    });

    // 인증 메서드 (입력 값과 비밀번호 비교)
    UserSchema.method('authenticate', function(plainText, inSalt, hashed_passeord) {
         if(inSalt) {
             console.log('authenticate 호출됨.');
             return this.encryptPassword(plainText, inSalt) === hashed_passeord;
         } else {
             console.log('authenticate 호출됨.');
             return this.encryptPassword(plainText) === hashed_password;
         }
    });

    // mongoose에서 직접 메서드 추가 static이용
    UserSchema.static('findByEmail', function(email, callback) {
        return this.find({email:email}, callback);
    });

    UserSchema.static('findAll', function(callback) {
        return this.find({}, callback);
    });
    
    return UserSchema;
}

module.exports = Schema;