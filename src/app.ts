import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import session from "express-session";
import { createServer } from "http";
import passport from "passport";
import path from "path";
import config from "./config/db.config";

const port = config.PORT;
import userRoute from "./routes/user.router";
import workderManagermentRoute from "./routes/worker_managerment.route";
import productManagermentRoute from "./routes/product_managerment.router";
import locationManagermentRoute from "./routes/location_managerment.router";
import workListRoute from "./routes/work_list.router";
import productLocationRoute from "./routes/product_location.router";
import activeRoute from "./routes/active.router";
import workListDetailRoute from "./routes/work_list_detail.router";
import inventoryCountRoute from "./routes/inventory_count.router";
import adjustmentRepo from "./routes/adjustment.router";

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

const app = express();
const httpServer = createServer(app);
app.all("*", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:4200");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");

  next();
});

app.use(cookieParser());
app.use(passport.initialize());
app.use(
  session({
    secret: "keyboard cat",
    key: "sid",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({ credentials: true, origin: "*" }));

// sequelize
//   .sync()
//   .then((ok) => {
//     console.log("Nice! Database looks fine");
//   })
//   .catch((err) => {
//     console.log(err, "Something went wrong with the Database Update!");
//   });

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Eastwest Warehouse" });
});

app.use("/user", userRoute);
app.use("/workerManagerment", workderManagermentRoute);
app.use("/productManagerment", productManagermentRoute);
app.use("/locationManagerment", locationManagermentRoute);
app.use("/workList", workListRoute);
app.use("/productLocation", productLocationRoute);
app.use("/active", activeRoute);
app.use("/workListDetail", workListDetailRoute);
app.use("/inventoryCount", inventoryCountRoute);
app.use("/adjustment", adjustmentRepo);

app.get("/*", (req, res) => res.sendFile(path.resolve("./fe/index.html")));

httpServer.listen(port, () => {
  console.log(`App is running on port ${port}!`);
});
