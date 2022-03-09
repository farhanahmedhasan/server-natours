process.on("uncaughtException", (err) => {
  console.log(err);
  console.log(`Uncaught Rejection, Shutting Down..`);

  process.exit(1);
});

import app from "./app.js";
import mongoose from "mongoose";

const port = process.env.PORT || 3001;
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.PASSWORD);

const connectToMongoDB = async () => {
  await mongoose.connect(DB);
  console.log("Connected to MongoDB");
};
connectToMongoDB();

const server = app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log(`Unhandled Rejection, Shutting Down..`);

  server.close(() => {
    process.exit(1);
  });
});
