// express 서버를 위한 모듈
var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');


var cors = require('cors');

var expressErroHandler = require('express-error-handler');

var config = require('./config/config');

var database_loader = require('./database/database_loader');
var route_loader = require('./routes/route_loader');

//===== Passport 사용 =====//
var passport = require('passport');
var flash = require('connect-flash');

// 서버 객체
var app = express(); 


// 뷰 관련 설정
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// port 번호 설정
app.set('port', process.env.PORT || config.server_port);

// get 방식
app.use('/public', static(path.join(__dirname, 'public')));

// post 방식
app.use(bodyParser.urlencoded({extended:false})); 
app.use(bodyParser.json()); 

app.use(cookieParser());
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

app.use(cors());

//===== Passport 초기화 및 로그인 세션유지 =====//
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


var router = express.Router();
route_loader.init(app, router);

// passport 설정
var configPassport = require('./config/passport');
configPassport(app, passport);

// passport 관련 함수 라우팅
var userPassport = require('./routes/user_passport');
userPassport(app, passport);

// 파일 업로드 관현 함수 라우팅
var uploadFile = require('./routes/file');
uploadFile(app);

// 등록된 라우터 패스가 없는 경우
var errorHandler = expressErroHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErroHandler.httpError(404));
app.use(errorHandler);

var server = http.createServer(app).listen(app.get('port'), function() {    
    console.log('익스프레스로 웹 서버를 실행함 : ' + app.get('port'));
    
    database_loader.init(app, config);
});
