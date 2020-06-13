const express = require('express');
const port = 3003;
const bodyParser = require('body-parser');
const cors = require('cors');
const path = express('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();

// mysql connection database 
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'blaze.ws',
  database: 'blog'
});

  connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
  });

const folderPath = __dirname ;
app.use(express.static(folderPath)) ;

app.use(cookieParser());
       //middleware set cors orgin all
 app.use(cors());
       //middleware set all headers allow orgin set
    app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // all orgin allow
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization , x-access-token");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    next();
  });
       // middleware set body parser data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var sess; 

 app.use('/', session({
  key: 'user_sid',
  secret: 'somerandonstuffs',
  resave: true,
  saveUninitialized: false,
  cookie: {
      expires: 600000
  }
}));

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
      res.clearCookie('user_sid');        
  }
  next();
});

var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
      res.redirect('/home');
  } else {
      next();
  }    
};

//  user site start 
app.get('/', sessionChecker , function (req, res) {
      res.sendFile(__dirname + "/" + "login.html");
});
app.get('/user_register', function (req, res) {
  res.sendFile(__dirname + "/" + "register.html");
});


app.get('/home', function (req, res) {
  if (req.session.user && req.cookies.user_sid) {
  res.sendFile(__dirname + "/" + "home.html");
  }
  else{
    res.redirect('/');
  }
});

  app.get('/user_logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/');
    }
});

app.get('/all_blog', function(req,res){
  connection.query('SELECT * FROM  blog_articles' ,
  function(error, results, fields) {
                res.json(results);
                console.log(results) ;
  });
});

app.get('/user_view_blog', function (req, res) {
  if (req.session.user && req.cookies.user_sid) {
 res.sendFile(__dirname + "/" + "user_view_blog.html");
  }
  else{
    res.redirect('/');
  }
});

app.get('/user_add_blog', function (req, res) {
     if (req.session.user && req.cookies.user_sid) {
   res.sendFile(__dirname + "/" + "user_add_blog.html");
}
else{
  res.redirect('/');
}
});

app.post('/user_add_blog', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
  var title = req.body.title_blog ;
  var author = req.body.author_blog ;
  var body = req.body.art_blog ;

   if( title && author && body) {
     // sql insert query check and add process
   let sql = 'INSERT INTO blog_articles SET ?' ;
   var user_blog = {
     title:req.body.title_blog,
     author:req.body.author_blog,
     body:req.body.art_blog
 };
           connection.query(sql, user_blog, function (error, rows, fields) {
         if (error) {
           res.json({
                status:"401",
                message:'there are some error with query'
           });
         }else{
             res.json({
               statusCode:"201",
               body:{ message :"new article created"}
           });
           console.log(rows);
         }
       });
   

}
    // empty fields user send 
  else{
   res.json({
     statusCode:"401",
     body:{ message :"title or author or body fields required"}
 });
}
            // end  sql insert query check and add process
}
else{
  res.redirect('/');

}

});


//admin site start 
app.get('/admin', function (req, res) {
  res.sendFile(__dirname + "/" + "admin_login.html");
});

app.get('/admin_logout', (req, res) => {
      res.redirect('/admin');

});


app.get('/admin_setting', function (req, res) {
    res.sendFile(__dirname + "/" + "admin_setting.html");
  
});

app.get('/all_user_details', function(req,res){
  connection.query('SELECT * FROM  user_register' ,
  function(error, results, fields) {
                res.json(results);
                   // console.log(results) ;
  });
});


app.get('/admin_dashboard', function (req, res) {
  res.sendFile(__dirname + "/" + "admin_dashboard.html");
});

app.get('/admin_user_details', function (req, res) {
     res.sendFile(__dirname + "/" + "admin_user_details.html");
});

app.get('/admin_blog', function (req, res) {
     res.sendFile(__dirname + "/" + "admin_blog.html");
});


app.post('/admin_add_blog', (req, res) => {

  var title = req.body.title_blog ;
  var author = req.body.author_blog ;
  var body = req.body.art_blog ;

   if( title && author && body) {
     // sql insert query check and add process
   let sql = 'INSERT INTO blog_articles SET ?' ;
   var user_blog = {
     title:req.body.title_blog,
     author:req.body.author_blog,
     body:req.body.art_blog
 };
            connection.query(sql, user_blog, function (error, rows, fields) {
         if (error) {
           res.json({
                status:"401",
                message:'there are some error with query'
           });
         }else{
             res.json({
               statusCode:"201",
               body:{ message :"new article created"}
           });
           console.log(rows);
         }
       });
   

}
    // empty fields user send 
  else{
   res.json({
     statusCode:"401",
     body:{ message :"title or author or body fields required"}
 });
}
            // end  sql insert query check and add process


});


app.post('/admin_blog_sort', function (req, res) {

  var title_1 = req.body.title_blog_1 ;
  var author_1 = req.body.author_blog_1 ;

  if(title_1 != '' && author_1 !=''){
    var title = req.body.title_blog_1 ;
    var author = req.body.author_blog_1 ;

    connection.query('SELECT *  FROM blog_articles WHERE title = ? AND author = ?', [title, author],
    function(err, results, fields) {
      if (results.length > 0 ) {   
        res.json({
          statusCode:"200",
           result_data : results
      });
      }
      else{
        res.json({
          statusCode:"401",
           body:{ message :"No records found"}
      });
      }
    });
  }
  if(title_1 == '' && author_1 !=''){
    var author = req.body.author_blog_1 ;
    connection.query('SELECT *  FROM blog_articles WHERE author = ?', [author],
    function(err, results, fields) {
      if (results.length > 0 ) {   
        res.json({
          statusCode:"200",
           result_data : results
      });
      }
      else{
        res.json({
          statusCode:"401",
           body:{ message :"No records found"}
      });
      }

    });

  }
  if(title_1 != '' && author_1 ==''){
    var title = req.body.title_blog_1 ;
    connection.query('SELECT *  FROM blog_articles WHERE title = ?', [title],
    function(err, results, fields) {

      if (results.length > 0 ) {   
        res.json({
          statusCode:"200",
           result_data : results
      });
      }
      else{
        res.json({
          statusCode:"401",
           body:{ message :"No records found"}
      });
      }

    });
  }

});

app.post('/admin_user_sort', function (req, res) {

  var username_1 = req.body.username_1 ;
  var email_1 = req.body.email_1 ;

  if(username_1 != '' && email_1 !=''){
    var username = req.body.username_1 ;
    var email = req.body.email_1 ;
  
    connection.query('SELECT *  FROM user_register WHERE username = ? AND email = ?', [username, email],
    function(err, results, fields) {
      if (results.length > 0 ) {   
        res.json({
          statusCode:"200",
           result_data : results
      });
      }
      else{
        res.json({
          statusCode:"401",
           body:{ message :"No records found"}
      });
      }
    });
  }

  if(username_1 == '' && email_1 !=''){
    var email = req.body.email_1 ;
    connection.query('SELECT *  FROM user_register WHERE email = ?', [email],
    function(err, results, fields) {
      if (results.length > 0 ) {   
        res.json({
          statusCode:"200",
           result_data : results
      });
      }
      else{
        res.json({
          statusCode:"401",
           body:{ message :"No records found"}
      });
      }

    });

  }


  if(username_1 != '' && email_1 ==''){
    var username = req.body.username_1 ;
    connection.query('SELECT *  FROM user_register WHERE username = ?', [username],
    function(err, results, fields) {

      if (results.length > 0 ) {   
        res.json({
          statusCode:"200",
           result_data : results
      });
      }
      else{
        res.json({
          statusCode:"401",
           body:{ message :"No records found"}
      });
      }
    });
  }
});

app.post('/admin_user_details', function (req, res) {

  var username = req.body.username ;
  var email = req.body.email ;
  var password = req.body.password ;
  var address = req.body.address ;

   if( username && password && email && address) {
     // sql insert query check and add process
   let sql = 'INSERT INTO user_register SET ?' ;
   var users = {
     username:req.body.username,
     email:req.body.email,
     password:req.body.password,
     address:req.body.address
 };
 connection.query('SELECT *  FROM user_register WHERE username = ? OR email = ?', [username, email],
  function(err, results, fields) {
   if (results.length == 0 ) {   
       // insert query 
       connection.query(sql, users, function (error, rows, fields) {
         if (error) {
           res.json({
                status:"401",
                message:'there are some error with query'
           });
         }else{
             res.json({
               statusCode:"201",
               body:{ message :"new user created"}
           });
           // console.log(rows);
         }
       });
   
   } 
   else {
     res.json({
       statusCode:"401",
        body:{ message :"username or email already exist"}
   });
   }			
 });

}
    // empty fields user send 
  else{
   res.json({
     statusCode:"401",
     body:{ message :"username or email or password or address fields required"}
 });
}

});



app.post('/admin', (req, res) => {
  // login valid checking 
  var username = req.body.username;
  var password = req.body.password;
  if (username && password) {
    connection.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], 
    function(error, results, fields) {
      if (results.length > 0) { 
             var userid =  results[0].id ;
              console.log(userid) ;
              const token = jwt.sign(
                { userId:userid  },
             'RANDOM_TOKEN_SECRET',
             { expiresIn: '24h' });
               console.log(token);
               req.session.admin = username ;
               req.session.admin_token = token ;

       res.json({
           statusCode:"200",
          body:{ message :"success" } 
     });
 
      } 
      else {

       res.json({
         statusCode:"401",
        body:{ message :"Invalid username or password"} 
   });

     }			
    });
  } 
  else {
   res.json({
     statusCode:"401",
    body:{ message :"username or password fields required"} 
});
}
});


// Api site start  

app.post('/login', (req, res) => {
  // login valid checking 
  var username = req.body.username;
  var password = req.body.password;
  if (username && password) {
    connection.query('SELECT * FROM user_register WHERE username = ? AND password = ?', [username, password], 
    function(error, results, fields) {
      if (results.length > 0) { 
             var userid =  results[0].id ;
              console.log(userid) ;
         const token = jwt.sign(
              { userId:userid  },
         'RANDOM_TOKEN_SECRET',
         { expiresIn: '24h' });
             console.log(token);
           req.session.user = username ;
           req.session.access_token = token ;
       res.json({
           statusCode:"200",
           body:{ message :"success",accessToken : token } 
     });

      } 
      else {
       res.json({
         statusCode:"401",
        body:{ message :"Invalid username or password"} 
   });

     }			
    });
  } 
  else {
   res.json({
     statusCode:"401",
    body:{ message :"username or password fields required"} 
});
}
});

app.get('/articles', (req, res) => {
  connection.query('SELECT * FROM  blog_articles' ,
  function(error, results, fields) {
     res.json({statusCode:"200",body:{data:results}});
                console.log(results) ;
  });
});

app.post('/articles', (req, res) => {
   var user_token = req.body.access_token ;
   var title = req.body.title ;
   var body = req.body.body ;
   var author = req.body.author ;

   if( user_token == req.session.access_token) {
    // add blog content start
    if( title && body && author) {
      // add blog_articles table
      let sql_articles = 'INSERT INTO blog_articles SET ?' ;
      var user_blog = {
        title:req.body.title,
        body:req.body.body,
        author:req.body.author
    };
    connection.query(sql_articles, user_blog, function (error, rows, fields) {
      if (error) {
        res.json({
             status:"401",
             message:'there are some error with query'
        });
      }else{
          res.json({
            statusCode:"201",
            body:{ message :"new article created"}
        });
           console.log(rows);
      }
    });

    }

    
    else{
      res.json({
        statusCode:"401",
        body:{ message :"title or body or author fields required"}
    });
    }

   }
   else{
       res.json ({message : "Token key does not match"}) ;
   }

});


app.post('/register', (req, res) => {

     var username = req.body.username ;
     var email = req.body.email ;
     var password = req.body.password ;
     var address = req.body.address ;

      if( username && password && email && address) {
        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!filter.test(email) && email != '') {
          res.json({
            statusCode:"401",
            body:{ message :"Please provide a valid email address"}
        });

        }
        else{
        
        // sql insert query check and add process
      let sql = 'INSERT INTO user_register SET ?' ;
      var users = {
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        address:req.body.address
    };
    connection.query('SELECT *  FROM user_register WHERE username = ? OR email = ?', [username, email],
     function(err, results, fields) {
      if (results.length == 0 ) {   
          // insert query 
          connection.query(sql, users, function (error, rows, fields) {
            if (error) {
              res.json({
                   statusCode:"401",
                   message:'there are some error with query'
              });
            }else{
                res.json({
                  statusCode:"201",
                  body:{ message :"new user created"}
              });
              // console.log(rows);
            }
          });
      
      } 
      else {
        res.json({
          statusCode:"401",
          body:{ message :"username or email already exist"}
      });
      }			
    });

  }
  }


       // empty fields user send 
     else{
      res.json({
        statusCode:"401",
        body:{ message :"username or email or password or address fields required"}
    });
   }

});


const server = app.listen(port, (error) => {
    if (error) return console.log(`Error: ${error}`);
      console.log(`Server listening on port ${server.address().port}`);
});

