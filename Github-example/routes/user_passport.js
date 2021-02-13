


module.exports = function(router, passport) { // router는 app 객체를 인자로 받은 것
    console.log('user_passport 호출됨.');
    
    //===== 회원가입과 로그인 라우팅 함수 =====//
    router.route('/').get(function(req, res) {
        console.log('/ 패스로 요청됨.');

        res.render('index.ejs');
    });

    router.route('/repository').get(function(req, res) {
        console.log('/repository 패스로 GET 요청됨.');
        
        listFile(req, res);
        
        //res.render('repository.ejs');
    });
    
    router.route('/signin').get(function(req, res) {
        console.log('/signin 패스로 GET 요청됨.');

        res.render('signin.ejs');
    });

    router.route('/signin').post(passport.authenticate('local-login', {       
        successRedirect: '/',
        failureRedirect: '/signin',
        failureFlash: true
    }));
    
    router.route('/signup').get(function(req, res) {
        console.log('/signup 패스로 GET 요청됨.');

        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

    router.route('/signup').post(passport.authenticate('local-signup', {
        //successRedirect: '/profile',
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    router.route('/logout').get(function(req, res) {
        console.log('/logout 패스로 GET 요청됨.');

        req.logout(); // req.user에 들어있는 로그인 세션 삭제
        res.redirect('/');
    });
        
}

var listFile = function(req, res) {
    console.log('listFile 함수 호출됨.');
    
    var database = req.app.get('database');
    var email = req.session.user.email;
    if(database) {
        database.UserModel.findByEmail(email, function(err, results) {
            if(err) {
               console.log('에러 발생.');
               res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
               res.write('<h1>에러 발생</h1>');
               res.end();
               return;
            } 
            
            if(results) {
                console.dir(results);
                
                
                var context = {
                    results: results
                };
                req.app.render('repository', context, function(err, html) {
                    if(err) {
                        console.error('뷰 렌더링 중 에러 발생 : ' + err.stack);
                        console.log('에러 발생.');
                        
                        // 아래 코드를 함수로 만들어서 처리하면 더 깔끔함
                        res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
                        res.write('<h1>뷰 렌더링 중 에러 발생</h1>');
                        res.write('<br><p>' + err.stack + '<p>');
                        res.end();
                        return;
                    }
                
                    res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
                    res.end(html);
                });
                    
            } else {
                console.log('에러 발생.');
                res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
                res.write('<h1>조회된 파일 없음.</h1>');
                res.end();
            }
        });
    } else {
        console.log('에러 발생.');
        res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
        res.write('<h1>데이터베이스 연결 안됨.</h1>');
        res.end();
    }
}