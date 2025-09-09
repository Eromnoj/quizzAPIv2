// src/index.ts
import express, { Express } from "express";
import dotenv from "dotenv";
import apiRoutes from "./routes/apiRoutes";
import authRoutes from "./routes/authRoutes";
import recoveryRoutes from "./routes/recoveryRoutes";
import adminRoutes from "./routes/adminRoutes";
import quizzRoutes from "./routes/quizzRoutes";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
const cookieSession = require('cookie-session');
import { PrismaClient } from '@prisma/client'
import bcryptjs from "bcryptjs";
const prisma = new PrismaClient()

const cors = require('cors');
const cookieParser = require('cookie-parser');
import { doubleCsrf } from "csrf-csrf";
dotenv.config();
const {
  invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
  generateToken, // Use this in your routes to provide a CSRF hash + token cookie and token.
  validateRequest, // Also a convenience if you plan on making your own middleware.
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'default_csrf_secret',
  cookieName: 'csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  }
});

// const https = require('https');
const app: Express = express();
app.set('trust proxy', 1);
// const server = https.createServer({key: key, cert: cert }, app);
const port = process.env.PORT || 3000;

app.use(cookieSession({
  sameSite: 'none',
  secure: true, // true if using https
  name: 'api-auth',
  keys: [process.env.COOKIE_SECRET], // TODO change this to a more secure key
  maxAge: 30 * 24 * 60 * 60 * 1000,
}));
// register regenerate & save after the cookieSession middleware initialization
app.use(function(request, response, next) {
  if (request.session && !request.session.regenerate) {
      request.session.regenerate = (cb: any) => {
          cb()
      }
  }
  if (request.session && !request.session.save) {
      request.session.save = (cb: any) => {
          cb()
      }
  }
  next()
})
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.DEVELOPMENT_FRONTEND_URL,
];

app.use((req, res, next) => {
  const noCorsRoutes = ["/api/v2/quiz"];

  if (noCorsRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }

  return cors({
    origin: allowedOrigins,
    credentials: true,
  })(req, res, next);
});

app.use('/public', express.static('public'));
app.use(express.json())

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(doubleCsrfProtection);
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (id: {id:string}, done) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id.id
    }
  })
  if (user) {
    return done(null, { id: user.id }); 
  } else {
    return done(new Error("Pas d'utilisateur avec cet ID"));
  }
}
);

passport.use('local', new LocalStrategy({ passReqToCallback: true },
  async (req, username, password, done) => {

    const user = await prisma.user.findUnique({
      where: {
        email: username
      }
    })
    if (!user) {
      return done(null, false, { message: 'Email incorrect' });
    }
    if (!bcryptjs.compareSync(password, user.password)) {
      return done(null, false, { message: 'Email ou mot de passe incorrect.' });
    }

    return done(null, { id: user.id });

  }
))


app.use("/api/v2", apiRoutes);
app.use("/api/v2/auth", authRoutes);
app.use("/api/v2/recovery", recoveryRoutes);
app.use("/api/v2/admin", adminRoutes);
app.use("/api/v2/quiz", quizzRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

module.exports = app;
