import express from "express";
import cors from "cors";
import connectDb from "../db/connectDb.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import generateToken from "../utils/generateToken.js";

dotenv.config();

connectDb();

const app = express();
app.use(cors());
app.use(express.json());

// Posts routes

app.get("/api/allposts", async (req, res) => {
  try {
    const allPosts = await Post.find();
    res.json(allPosts);
  } catch (error) {
    console.error(error.message);
  }
});
app.post("/api/createpost", async (req, res) => {
  try {
    const { title, body, author } = req.body;
    const createPost = await Post.create({
      title,
      author,
      body,
    });
    res.json(createPost);
  } catch (error) {
    console.error(error.message);
  }
});

app.delete("/api/deletepost/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deletePost = await Post.deleteOne({ _id: id });
    res.json({});
  } catch (error) {
    console.error(error.message);
  }
});

app.put("/api/updatepost/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { title, body } = req.body;
    const findPost = await Post.findById(id);

    findPost.title = title;
    findPost.body = body;

    findPost.save();

    res.json(findPost);
  } catch (error) {
    console.error(error.message);
  }
});

// Users Routes

app.post("/api/user", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      res.status(400).send();
      throw new Error("User alredy exists");
    }
    const salt = await bcrypt.genSalt();

    const hashedPassword = await bcrypt.hash(password, salt);

    const createUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (createUser) {
      res.status(201).json({
        _id: createUser._id,
        name: createUser.name,
        email: createUser.email,
        isAdmin: createUser.isAdmin,
      });
    } else {
      response.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    res.json({ error: error.message });
    console.error(error.message);
  }
});

app.post("/api/user/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    res.status(400).json({ error: "user not found" });
  }
  try {
    if (await bcrypt.compare(password, user.password)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      response.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    res.status(500).send();
  }
});

app.listen(process.env.PORT || 8000);
