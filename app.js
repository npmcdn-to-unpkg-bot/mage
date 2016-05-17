var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var modosDeJogo = require('./routes/modosDeJogo');
var cartomante = require('./routes/cartomante');
var consulente = require('./routes/consulente');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("MongoDB conectado!");
});

var UsuarioModel = require('models/usuario');

var dotenv = require('dotenv');
dotenv.load();

var app = express();

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({secret: 'minhaChaveSecreta'}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user._id);
});
 
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}

// passport/login.js
passport.use('login', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    // verifica no mongo se o nome de usuário existe ou não
    User.findOne({ 'username' :  username },
      function(err, user) {
        // Em caso de erro, retorne usando o método done
        if (err)
          return done(err);
        // Nome de usuário não existe, logar o erro & redirecione de volta
        if (!user){
          console.log('Usuário não encontrado para usuário '+username);
          return done(null, false,
                req.flash('message', 'Usuário não encontrado.'));
        }
        // Usuário existe mas a senha está errada, logar o erro
        if (!isValidPassword(user, password)){
          console.log('Senha Inválida');
          return done(null, false,
              req.flash('message', 'Senha Inválida'));
        }
        // Tanto usuário e senha estão corretos, retorna usuário através 
        // do método done, e, agora, será considerado um sucesso
        return done(null, user);
      }
    );
  }));
 
 
 // Gera hash usando bCrypt
var createHash = function(password){
 return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}
 // estratégia de criação 
  assport.use('signup', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    findOrCreateUser = function(){
      // Busca usuário pelo nome apresentado
      User.findOne({'username':username},function(err, user) {
        // Em caso de erro, retornar
        if (err){
          console.log('Erro no Registro: '+err);
          return done(err);
        }
        // Usuário existe
        if (user) {
          console.log('Usuário já existe');
          return done(null, false,
             req.flash('message','Usuário já existe'));
        } else {
          // Se não houver usuário com aquele e-mail
          // criaremos o novo usuário
          var newUser = new User();
          // Atribuindo as credenciais locais
          newUser.username = username;
          newUser.password = createHash(password);
          newUser.email = req.param('email');
          newUser.firstName = req.param('firstName');
          newUser.lastName = req.param('lastName');
 
          // salva o usuário
          newUser.save(function(err) {
            if (err){
              console.log('Erro ao salvar usuário: '+err);
              throw err;
            }
            console.log('Registro de usuário com sucesso');
            return done(null, newUser);
          });
        }
      });
    };
 
    // Atrasa a execução do método findOrCreateUser e o executa
    // na próxima oportunidade dentro do loop de eventos
    process.nextTick(findOrCreateUser);
  }));
  
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// bower
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));

// custom bootstrap templates
app.use('/public/templates', express.static(path.join(__dirname, '/templates')));


app.use('/', routes);
app.use('/modosDeJogo', modosDeJogo);
app.use('/cartomante', cartomante);
app.use('/consulente', consulente);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;