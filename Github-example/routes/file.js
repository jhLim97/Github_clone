var path = require('path');

// 파일 업로드 관련 모듈
var multer = require('multer'); 
var fs = require('fs'); 

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'uploads'); // destination 폴더 설정
    },
    filename: function(req, file, callback) {
        //callback(null, file.originalname + Date.now()); 
        
        var extension = path.extname(file.originalname); // 업로드된 원래 파일 내용에서 확장자 추출
        var basename = path.basename(file.originalname, extension); // 확장자를 제외한 나머지 
        callback(null, basename + Date.now() + extension); // 다른 파일과 중복되지 않도록 이름 설정
    }
});

var upload = multer({
    storage:storage, // 위에서 만든 객체
    limits:{
        files:10, 
        fileSize:1024*1024*1024
    }
});

module.exports = function(router) {
    console.log('file 호출됨.');
    
    router.route('/process/upload_file').get(function(req, res) {
        console.log('/process/upload_file 패스 GET 호출됨.') 
        
        res.render('upload.ejs');
    });
    
    router.route('/process/upload_file').post(upload.array('file', 1), function(req, res) {
        console.log('/process/upload_file 패스 POST 호출됨.');

        var files = req.files;
        console.log('==== 업로드된 파일 ====');
        if (files.length > 0) {
            console.dir(files[0]);
        } else {
            console.log('파일이 없습니다.');
        }

        var originalname;
        var filename;
        var mimetype;
        var size;

        if (Array.isArray(files)) { // 배열인지 체크
            for(var i=0; i<files.length; i++) {
                originalname = files[i].originalname; // 기존에 저장한 이름
                filename = files[i].filename; // 내부적으로 저장된 파일이름
                mimetype = files[i].mimetype;
                size = files[i].size;
            }
        }
        
        var database = req.app.get('database');
        var email = req.session.user.email;
        addFile(database, email, filename, function(err, result){
            if(err) {
               console.log('에러 발생.');
               res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
               res.write('<h1>에러 발생</h1>');
               res.end();
               return;
           } 
            
            if(result) {
                console.dir(result);
                res.redirect('/repository');
            } else {
                console.log('에러 발생.');
                res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
                res.write('<h1>파일 추가 안됨.</h1>');
                res.end();
            }
        });
    
    });
}

var addFile = function(db, email, fileName, callback) {
    console.log('addFile 호출됨 : ' + email + '->'+ fileName);
    
    db.UserModel.findByEmail(email, function(err, results) {
        if(err) {
            callback(err, null);
            return;
        }
        
        console.log('이메일 %s로 검색됨.', email);
        if(results.length > 0) {
            objectFile = {
                name:fileName,
                updated_at:Date.now()
            };
            // 나중에 findByIdUpdate로 수정하기
            db.UserModel.update({email:email}, {$push : {upload_files:objectFile}}, function(err){
                if(err) {
                    console.log(err);
                }
            });
            callback(null, results);
        } else {
            console.log('이메일 일치하는 사용자 없음.');
            callback(null, null);
        }
    })
    
};
