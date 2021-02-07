var LocalStrategy = require('passport-local').Strategy;


module.exports = new LocalStrategy({
    // 각 필드로 어떤 속성이 들어오는지 명시적으로 지정해주기(안해도 되지만)
    usernameField:'email',
    passwordField:'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    var paramName = req.body.name || req.query.name;
    console.log('passport의 local-signup 호출됨 : ' + email + ', ' + password + ', ' + paramName);
    
    var database = req.app.get('database');
    database.UserModel.findOne({'email':email}, function(err, user) {
        if(err) {
            console.log('에러 발생.');
            return done(err);
        }
        
        if(user) {
            console.log('기존에 계정이 있습니다.');
            return done(null, false, req.flash('signupMessage', '계정이 이미 있습니다.'));
        } else {
            var user = new database.UserModel({'email':email, 'password':password, 'name':paramName});
            user.save(function(err) {
                if(err) {
                    return done(null, false, req.flash('signupMessage', '사용자 정보 저장 시 에러가 발생했습니다.'));
                }
                
                console.log('사용자 데이터 저장함.');
                return done(null, user);
            })
        }
    })
});