const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const { Article, News, Videos, Magazine } = require("./models");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    let articles = await Article.getArticles();
    const news = await News.getNews();
    const today = new Date();
    const todayDate = today.toLocaleDateString("en-GB");
    const todaysNews = await News.getNewsByTodaysDate(todayDate);
    res.render("home", {
      title: "Sandesh TV Daily News",
      articles: articles,
      todaysNews,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/createnews", async (req, res) => {
  try {
    res.render("createNews", { title: "Create News" });
  } catch (err) {
    console.log(err);
  }
});

app.post("/createNews", upload.single("image"), async (req, res) => {
  try {
    const image = req.file;
    const imageData = {
      filename: image.originalname,
      data: image.buffer,
    };
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];
    await News.createNews({
      title: req.body.title,
      state: req.body.state,
      category: req.body.category,
      content: req.body.content,
      date: todayDate,
      image: imageData,
    });
    return res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.get("/epaper", async (req, res) => {
  try {
    let articles = await Article.getArticles();
    res.render("e-paper", {
      title: "Sandesh TV e-paper",
      articles: articles,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/createarticle", async (req, res) => {
  try {
    res.render("createArticle", { title: "Create Article" });
  } catch (err) {
    console.log(err);
  }
});

app.post("/createArticle", upload.single("image"), async (req, res) => {
  try {
    const image = req.file;
    console.log(req.body.title)
    const imageData = {
      filename: image.originalname,
      data: image.buffer,
    };
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];

    await Article.createArticle({
      title: req.body.title,
      date: todayDate,
      images: imageData,
      state: req.body.state,
    });

    return res.redirect("/epaper");
  } catch (err) {
    console.log(err);
  }
});

app.get("/magazine", async (req, res) => {
  try {
    let magazines = await Magazine.getMagazines();
    res.render("magazine", {
      title: "Sandesh TV magazines",
      magazines: magazines,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/createMagazine", async (req, res) => {
  try {
    res.render("createMagazine", {
      title: "Add magazine",
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/createMagazine", upload.single("pdf"), async (req, res) => {
  try {
    const pdf = req.file;
    let filename = pdf.originalname;
    if (filename.includes(" ")) {
      filename = filename.trim();
    }
    const pdfData = {
      filename: filename,
      data: pdf.buffer,
    };
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];
    await Magazine.createMagazine({
      title: req.body.title,
      date: todayDate,
      pdf: pdfData,
    });
    return res.redirect("/magazine");
  } catch (err) {
    console.log(err);
  }
});

app.get("/videos", async (req, res) => {
  try {
    let videos = await Videos.getVideos();
    res.render("videos", {
      title: "Sandesh TV videos",
      videos: videos,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/createVideo", async (req, res) => {
  try {
    res.render("createVideo", {
      title: "Add video",
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/createVideo", async (req, res) => {
  try {
    await Videos.createVideo({
      title: req.body.title,
      url: req.body.url,
      video_id: req.body.video_id,
    });
    return res.redirect("/videos");
  } catch (err) {
    console.log(err);
  }
});

app.get("/news/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const news = await News.getNewsById(id);
    res.render("news", {
      title: news.title,
      id: id,
      news,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/magazine/:id", async (req, res) => {
  try {
    const magazine = await Magazine.getMagazineById(req.params.id);
    res.render("magazineView", {
      title: magazine.title,
      magazine: magazine,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/state/:state", async (req, res) => {
  const state = req.params.state;
  const newsByState = await News.getNewsByState(state);
  switch (state) {
    case "telangana":
      res.render("stateNews", {
        title: "Telangana News",
        newsByState,
      });
      break;
    case "andhrapradesh":
      res.render("stateNews", {
        title: "AndhraPradesh News",
        newsByState,
      });
      break;
    case "other":
      res.render("stateNews", {
        title: "News",
        newsByState,
      });
      break;
    default:
      res.status(404).send("Not Found");
  }
});

app.get("/category/:category", async (req, res) => {
  const category = req.params.category;
  const newsByCategory = await News.getNewsByCategory(category);
  switch (category) {
    case "cinema":
      res.render("categoryNews", {
        title: "Cinema",
        newsByCategory,
      });
      break;
    case "sports":
      res.render("categoryNews", {
        title: "Sports",
        newsByCategory,
      });
      break;
    case "business":
      res.render("categoryNews", {
        title: "Business",
        newsByCategory,
      });
      break;
    case "spirituality":
      res.render("categoryNews", {
        title: "Spirituality",
        newsByCategory,
      });
      break;
    case "history":
      res.render("categoryNews", {
        title: "History",
        newsByCategory,
      });
      break;
    default:
      res.statusCode(404).send("Not Found");
  }
});

// app.get("/:category", async (req, res) => {
//   try {
//     const selectedCategory = req.params.category;
//     const articlesInCategory = await Article.getArticlesByCategory(
//       selectedCategory
//     );
//     const andhraArticles = [];
//     const telanganaArticles = [];
//     for (let i = 0; i < articlesInCategory.length; i++) {
//       if (articlesInCategory[i].state === "telangana") {
//         telanganaArticles.push(articlesInCategory[i]);
//       } else {
//         andhraArticles.push(articlesInCategory[i]);
//       }
//     }
//     res.render("categoryArticle", {
//       title: `${selectedCategory}`,
//       category: selectedCategory,
//       articles: articlesInCategory,
//       telanganaArticles,
//       andhraArticles,
//     });
//   } catch (err) {
//     console.log(err);
//   }
// });

function mapState(state) {
  if (state.toLowerCase() === "andhra") {
    return "andhra pradesh";
  }
  return state;
}

app.get("/epaper/:state", async (req, res) => {
  let state = req.params.state
  const articles = await Article.getArticlesByState(state);

  res.render("stateArticles", {
      articles,
      title: state,
      state,
  });
});



app.get("/epaper/:state/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const state = req.params.state
    const article = await Article.getArticleById(articleId);
    console.log(article[0].title)
    res.render("article", {
      title : `${article[0].title}`,
      state,
      article,
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = app;
