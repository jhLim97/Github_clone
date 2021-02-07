


module.exports = function(router, passport) { // router는 app 객체를 인자로 받은 것
    console.log('user_passport 호출됨.');
    
    //===== 회원가입과 로그인 라우팅 함수 =====//
    router.route('/').get(function(req, res) {
        console.log('/ 패스로 요청됨.');

        res.render('index.ejs');
    });

    
    router.route('/signin').get(function(req, res) {
        console.log('/signin 패스로 GET 요청됨.');

        res.render('signin.ejs');
    });

    router.route('/signin').post(passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/signin',
        failureFlash: true
    }));

    router.route('/logout').get(function(req, res) {
        console.log('/logout 패스로 GET 요청됨.');

        req.logout(); // req.user에 들어있는 로그인 세션 삭제
        res.redirect('/');
    });
        
}